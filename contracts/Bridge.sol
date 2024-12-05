// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity 0.8.11;
pragma experimental ABIEncoderV2;

import "./utils/AccessControl.sol";
import "./utils/Pausable.sol";
import "./utils/SafeMath.sol";
import "./utils/SafeCast.sol";
import "./interfaces/IDepositExecute.sol";
import "./interfaces/IERCHandler.sol";
import "./interfaces/IBridge.sol";
import "./interfaces/IGenericHandler.sol";
import "./DAO.sol";

/**
    @title Facilitates deposits, creation and voting of deposit proposals, and deposit executions.
    @author ChainSafe Systems.
 */
contract Bridge is IBridge, Pausable, AccessControl, SafeMath {
    using SafeCast for *;

    // Limit relayers number because proposal can fit only so much votes
    uint256 constant public MAX_RELAYERS = 200;

    uint8   public _domainID;
    uint8   public _relayerThreshold;
    uint40  public _expiry;
    uint128 private feeMaxValue; /// @notice e.g. 10000 = 100% => 1(feePercent) = 0.01% 
    uint64 private feePercent;

    IDAO private contractDAO;

    enum ProposalStatus {Inactive, Active, Passed, Executed, Cancelled}

    struct Proposal {
        ProposalStatus _status;
        uint200 _yesVotes;      // bitmap, 200 maximum votes
        uint8   _yesVotesTotal;
        uint40  _proposedBlock; // 1099511627775 maximum block
    }

    struct Fee { 
        uint256 basicFee;
        uint256 minAmount;
        uint256 maxAmount;
    }

    // destinationDomainID => number of deposits
    mapping(uint8 => uint64) public _depositCounts;
    // resourceID => handler address
    mapping(bytes32 => address) public _resourceIDToHandlerAddress;
    // forwarder address => is Valid
    mapping(address => bool) public isValidForwarder;
    // destinationDomainID + depositNonce => dataHash => Proposal
    mapping(uint72 => mapping(bytes32 => Proposal)) private _proposals;
    // to be bridged token address => destination chain id => Fee
    mapping(address => mapping(uint8 => Fee)) private _fees;

    event RelayerThresholdChanged(uint256 newThreshold);
    event RelayerAdded(address relayer);
    event RelayerRemoved(address relayer);
    event Deposit(
        uint8   destinationDomainID,
        bytes32 resourceID,
        uint64  depositNonce,
        address indexed user,
        bytes data,
        bytes handlerResponse
    );
    event ProposalEvent(
        uint8          originDomainID,
        uint64         depositNonce,
        ProposalStatus status,
        bytes32 dataHash
    );
    event ProposalVote(
        uint8   originDomainID,
        uint64  depositNonce,
        ProposalStatus status,
        bytes32 dataHash
    );
    event FailedHandlerExecution(
        bytes lowLevelData
    );

    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");

    modifier onlyRelayers() {
        _onlyRelayers();
        _;
    }

    function getFeeMaxValue() external override view returns(uint128) {
        return feeMaxValue;
    }

    function getFeePercent() external override view returns(uint64) {
        return feePercent;
    }

    function getContractDAO() external view returns(IDAO) {
        return contractDAO;
    }

    function getFee(address tokenAddress, uint8 chainId) external override view returns(uint256, uint256, uint256) {
        require(tokenAddress != address(0), "zero address");
        require(_fees[tokenAddress][chainId].basicFee >= 0 
            && _fees[tokenAddress][chainId].minAmount > 0 
            && _fees[tokenAddress][chainId].maxAmount > 0, "fee does not exist");
        return (_fees[tokenAddress][chainId].basicFee,
                _fees[tokenAddress][chainId].minAmount,
                _fees[tokenAddress][chainId].maxAmount);
    }

    /**
        @notice Sets DAO contract address only once
        @param _address The DAO address
     */
    function setDAOContractInitial(address _address) external {
        require(address(contractDAO) == address(0), "already set");
        require(_address != address(0), "zero address");
        contractDAO = IDAO(_address);
    }

    function _onlyRelayers() private view {
        require(hasRole(RELAYER_ROLE, _msgSender()), "sender doesn't have relayer role");
    }

    function _relayerBit(address relayer) private view returns(uint) {
        return uint(1) << sub(AccessControl.getRoleMemberIndex(RELAYER_ROLE, relayer), 1);
    }

    function _hasVoted(Proposal memory proposal, address relayer) private view returns(bool) {
        return (_relayerBit(relayer) & uint(proposal._yesVotes)) > 0;
    }

    function _msgSender() internal override view returns (address) {
        address signer = msg.sender;
        if (msg.data.length >= 20 && isValidForwarder[signer]) {
            assembly {
                signer := shr(96, calldataload(sub(calldatasize(), 20)))
            }
        }
        return signer;
    }

    /**
        @notice Initializes Bridge, creates and grants {_msgSender()} the admin role,
        creates and grants {initialRelayers} the relayer role.
        @param domainID ID of chain the Bridge contract exists on.
        @param initialRelayers Addresses that should be initially granted the relayer role.
        @param initialRelayerThreshold Number of votes needed for a deposit proposal to be considered passed.
        @param _feeMaxValue The maximum number of percent. This value will be used as divisor(100% value)
        @param _feePercent The value of percent fee, which is used as multiplier (n * multiplier / delimeter = 10 * 30 / 100)
     */
    constructor (uint8 domainID, address[] memory initialRelayers, uint256 initialRelayerThreshold, uint256 expiry, uint256 _feeMaxValue, uint256 _feePercent) public {
        _domainID = domainID;
        _relayerThreshold = initialRelayerThreshold.toUint8();
        _expiry = expiry.toUint40();
        feeMaxValue= _feeMaxValue.toUint128();
        feePercent = _feePercent.toUint64();

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());

        for (uint256 i; i < initialRelayers.length; i++) {
            grantRole(RELAYER_ROLE, initialRelayers[i]);
        }
    }

    /**
        @notice Returns true if {relayer} has voted on {destNonce} {dataHash} proposal.
        @notice Naming left unchanged for backward compatibility.
        @param destNonce destinationDomainID + depositNonce of the proposal.
        @param dataHash Hash of data to be provided when deposit proposal is executed.
        @param relayer Address to check.
     */
    function _hasVotedOnProposal(uint72 destNonce, bytes32 dataHash, address relayer) public view returns(bool) {
        return _hasVoted(_proposals[destNonce][dataHash], relayer);
    }

    /**
        @notice Returns true if {relayer} has the relayer role.
        @param relayer Address to check.
     */
    function isRelayer(address relayer) external view returns (bool) {
        return hasRole(RELAYER_ROLE, relayer);
    }

    /**
        @notice Removes admin role from {_msgSender()} and grants it to {newAdmin}.
        @notice Only callable by DAO vote
        @param id The id of request with new Admin address
     */
    function renounceAdmin(uint256 id) external {
        address ownerAddress = contractDAO.isOwnerChangeAvailable(id);

        address sender = _msgSender();
        require(sender != ownerAddress, 'cannot renounce oneself');
        grantRole(DEFAULT_ADMIN_ROLE, ownerAddress);
        renounceRole(DEFAULT_ADMIN_ROLE, sender);

        require(contractDAO.confirmOwnerChangeRequest(id), "confirmed");
    }

    /**
        @notice Pauses deposits, proposal creation and voting, and deposit executions.
        @notice Only callable by DAO voting result.
        @param id The id of request with new Pause status
     */
    function adminPauseStatusTransfers(uint256 id) external {
        bool pauseStatus = contractDAO.isPauseStatusAvailable(id);

        if(pauseStatus) {
            _pause(_msgSender());
        }
        else {
            _unpause(_msgSender());
        }

        require(contractDAO.confirmPauseStatusRequest(id), "confirmed");
    }

    /**
        @notice Modifies the number of votes required for a proposal to be considered passed.
        @notice Only callable by an address that currently has the admin role.
        @param id The id of request with new Relayer threshold value
        @notice Emits {RelayerThresholdChanged} event.
     */
    function adminChangeRelayerThreshold(uint256 id) external {
        uint256 newThreshold = contractDAO.isChangeRelayerThresholdAvailable(id);

        _relayerThreshold = newThreshold.toUint8();
        emit RelayerThresholdChanged(newThreshold);

        require(contractDAO.confirmChangeRelayerThresholdRequest(id), "confirmed");
    }

    /**
        @notice Grants {relayerAddress} the relayer role.
        @notice Only callable by an address that currently has the admin role, which is
                checked in grantRole().
        @param relayerAddress Address of relayer to be added.
        @notice Emits {RelayerAdded} event.
     */
    function adminAddRelayer(address relayerAddress) external {
        require(!hasRole(RELAYER_ROLE, relayerAddress), "addr already has relayer role!");
        require(_totalRelayers() < MAX_RELAYERS, "relayers limit reached");
        grantRole(RELAYER_ROLE, relayerAddress);
        emit RelayerAdded(relayerAddress);
    }

    /**
        @notice Removes relayer role for {relayerAddress}.
        @notice Only callable by an address that currently has the admin role, which is
                checked in revokeRole().
        @param relayerAddress Address of relayer to be removed.
        @notice Emits {RelayerRemoved} event.
     */
    function adminRemoveRelayer(address relayerAddress) external {
        require(hasRole(RELAYER_ROLE, relayerAddress), "addr doesn't have relayer role!");
        revokeRole(RELAYER_ROLE, relayerAddress);
        emit RelayerRemoved(relayerAddress);
    }

    /**
        @notice Sets a new resource for handler contracts that use the IERCHandler interface,
        and maps the {handlerAddress} to {resourceID} in {_resourceIDToHandlerAddress}.
        @notice Only callable by an address that currently has the admin role.
        @param id The id of request with new set resource values
     */
    function adminSetResource(uint256 id) external {
        (address handlerAddress, bytes32 resourceId, address tokenAddress) = contractDAO.isSetResourceAvailable(id);

        _resourceIDToHandlerAddress[resourceId] = handlerAddress;
        IERCHandler handler = IERCHandler(handlerAddress);
        handler.setResource(resourceId, tokenAddress);

        require(contractDAO.confirmSetResourceRequest(id), "confirmed");
    }

    /**
        @notice Sets a new resource for handler contracts that use the IGenericHandler interface,
        and maps the {handlerAddress} to {resourceID} in {_resourceIDToHandlerAddress}.
        @notice Only callable by an address that currently has the admin role.
        @param id The id of request with new set generic resource values
     */
    function adminSetGenericResource(uint256 id) external {
        (address handlerAddress,
        bytes32 resourceId,
        address contractAddress,
        bytes4 depositFunctionSig,
        uint256 depositFunctionDepositerOffset,
        bytes4 executeFunctionSig) = contractDAO.isSetGenericResourceAvailable(id);

        _resourceIDToHandlerAddress[resourceId] = handlerAddress;
        IGenericHandler handler = IGenericHandler(handlerAddress);
        handler.setResource(resourceId, contractAddress, depositFunctionSig, depositFunctionDepositerOffset, executeFunctionSig);

        require(contractDAO.confirmSetGenericResourceRequest(id), "confirmed");
    }

    /**
        @notice Sets a resource as burnable for handler contracts that use the IERCHandler interface.
        @notice Only callable by an address that currently has the admin role.
        @param id The id of request with new set burnable values
     */
    function adminSetBurnable(uint256 id) external {
        (address handlerAddress, address tokenAddress) = contractDAO.isSetBurnableAvailable(id);

        IERCHandler handler = IERCHandler(handlerAddress);
        handler.setBurnable(tokenAddress);

        require(contractDAO.confirmSetBurnableRequest(id), "confirmed");
    }

    /**
        @notice Sets the nonce for the specific domainId.
        @notice Only callable by an address that currently has the admin role.
        @param id The id of request with new set deposit nonce values
     */
    function adminSetDepositNonce(uint256 id) external {
        (uint8 domainId, uint64 nonce) = contractDAO.isSetNonceAvailable(id);

        require(nonce > _depositCounts[domainId], "Does not allow decrements of the nonce");
        _depositCounts[domainId] = nonce;

        require(contractDAO.confirmSetNonceRequest(id), "confirmed");
    }

    /**
        @notice Set a forwarder to be used.
        @notice Only callable by an address that currently has the admin role.
        @param id The id of request with new set forwarder values
     */
    function adminSetForwarder(uint256 id) external {
        (address forwarder, bool valid) = contractDAO.isSetForwarderAvailable(id);

        isValidForwarder[forwarder] = valid;

        require(contractDAO.confirmSetForwarderRequest(id), "confirmed");
    }

    /**
        @notice Returns a proposal.
        @param originDomainID Chain ID deposit originated from.
        @param depositNonce ID of proposal generated by proposal's origin Bridge contract.
        @param dataHash Hash of data to be provided when deposit proposal is executed.
        @return Proposal which consists of:
        - _dataHash Hash of data to be provided when deposit proposal is executed.
        - _yesVotes Number of votes in favor of proposal.
        - _noVotes Number of votes against proposal.
        - _status Current status of proposal.
     */
    function getProposal(uint8 originDomainID, uint64 depositNonce, bytes32 dataHash) external view returns (Proposal memory) {
        uint72 nonceAndID = (uint72(depositNonce) << 8) | uint72(originDomainID);
        return _proposals[nonceAndID][dataHash];
    }

    /**
        @notice Returns total relayers number.
        @notice Added for backwards compatibility.
     */
    function _totalRelayers() public view returns (uint) {
        return AccessControl.getRoleMemberCount(RELAYER_ROLE);
    }

    /**
        @notice Changes deposit fee percent.
        @notice Only callable by admin.
        @param id The id of request with new fee percent values
     */
    function adminChangeFeePercent(uint256 id) external {
        (uint128 newFeeMaxValue, uint64 newFeePercent) = contractDAO.isChangeFeePercentAvailable(id);
        
        require(feeMaxValue != newFeeMaxValue && feePercent != newFeePercent, "Current fee percent values = new fee percent");
        require(newFeePercent <= newFeeMaxValue, "new feePercent >= new feeMaxValue");
        
        feeMaxValue = newFeeMaxValue;
        feePercent = newFeePercent;

        require(contractDAO.confirmChangeFeePercentRequest(id), "confirmed");
    } 

    /**
        @notice Changes deposit fee.
        @notice Only callable by admin.
        @param id The id of request with new fee value
     */
    function adminChangeFee(uint256 id) external {
        (address tokenAddress, uint8 chainId, uint256 basicFee, uint256 minAmount, uint256 maxAmount) = contractDAO.isChangeFeeAvailable(id);

        require((_fees[tokenAddress][chainId].basicFee != basicFee || _fees[tokenAddress][chainId].basicFee == 0)
            && _fees[tokenAddress][chainId].minAmount != minAmount 
            && _fees[tokenAddress][chainId].maxAmount != maxAmount, "Current fee = new fee");

        _fees[tokenAddress][chainId].basicFee = basicFee;
        _fees[tokenAddress][chainId].minAmount = minAmount;
        _fees[tokenAddress][chainId].maxAmount = maxAmount;

        require(contractDAO.confirmChangeFeeRequest(id), "confirmed");
    }

    /**
        @notice Used to manually withdraw funds from ERC safes.
        @param id The id of request with new withdraw values
     */
    function adminWithdraw(uint256 id) external {
        (address handlerAddress, bytes memory data) = contractDAO.isWithdrawAvailable(id);
        
        IERCHandler handler = IERCHandler(handlerAddress);
        handler.withdraw(data);

        require(contractDAO.confirmWithdrawRequest(id), "confirmed");
    }

    /**
        @notice Initiates a transfer using a specified handler contract.
        @notice Only callable when Bridge is not paused.
        @param destinationDomainID ID of chain deposit will be bridged to.
        @param resourceID ResourceID used to find address of handler to be used for deposit.
        @param data Additional data to be passed to specified handler.
        @notice Emits {Deposit} event with all necessary parameters and a handler response.
        - ERC20Handler: responds with an empty data.
        - ERC721Handler: responds with the deposited token metadata acquired by calling a tokenURI method in the token contract.
        - GenericHandler: responds with the raw bytes returned from the call to the target contract.
     */
    function deposit(uint8 destinationDomainID, bytes32 resourceID, bytes calldata data) external payable whenNotPaused {
        address handler = _resourceIDToHandlerAddress[resourceID];
        require(handler != address(0), "resourceID not mapped to handler");

        uint64 depositNonce = ++_depositCounts[destinationDomainID];
        address sender = _msgSender();

        IDepositExecute depositHandler = IDepositExecute(handler);
        bytes memory handlerResponse = depositHandler.deposit(destinationDomainID, resourceID, sender, data);

        emit Deposit(destinationDomainID, resourceID, depositNonce, sender, data, handlerResponse);
    }

    /**
        @notice When called, {_msgSender()} will be marked as voting in favor of proposal.
        @notice Only callable by relayers when Bridge is not paused.
        @param destinationDomainID ID of chain deposit will be bridged to.
        @param domainID ID of chain deposit originated from.
        @param depositNonce ID of deposited generated by origin Bridge contract.
        @param resourceID ResourceID used to find address of handler to be used for deposit.
        @param data Data originally provided when deposit was made.
        @notice Proposal must not have already been passed or executed.
        @notice {_msgSender()} must not have already voted on proposal.
        @notice Emits {ProposalEvent} event with status indicating the proposal status.
        @notice Emits {ProposalVote} event.
     */
    function voteProposal(uint8 destinationDomainID, uint8 domainID, uint64 depositNonce, bytes32 resourceID, bytes calldata data) external onlyRelayers whenNotPaused {
        address handler = _resourceIDToHandlerAddress[resourceID];
        uint72 nonceAndID = (uint72(depositNonce) << 8) | uint72(domainID);
        bytes32 dataHash = keccak256(abi.encodePacked(handler, data));
        Proposal memory proposal = _proposals[nonceAndID][dataHash];

        require(_resourceIDToHandlerAddress[resourceID] != address(0), "no handler for resourceID");

        if (proposal._status == ProposalStatus.Passed) {
            executeProposal(destinationDomainID, domainID, depositNonce, data, resourceID, true);
            return;
        }

        address sender = _msgSender();
        
        require(uint(proposal._status) <= 1, "proposal already executed/cancelled");
        require(!_hasVoted(proposal, sender), "relayer already voted");

        if (proposal._status == ProposalStatus.Inactive) {
            proposal = Proposal({
                _status : ProposalStatus.Active,
                _yesVotes : 0,
                _yesVotesTotal : 0,
                _proposedBlock : uint40(block.number) // Overflow is desired.
            });

            emit ProposalEvent(domainID, depositNonce, ProposalStatus.Active, dataHash);
        } else if (uint40(sub(block.number, proposal._proposedBlock)) > _expiry) {
            // if the number of blocks that has passed since this proposal was
            // submitted exceeds the expiry threshold set, cancel the proposal
            proposal._status = ProposalStatus.Cancelled;

            emit ProposalEvent(domainID, depositNonce, ProposalStatus.Cancelled, dataHash);
        }

        if (proposal._status != ProposalStatus.Cancelled) {
            proposal._yesVotes = (proposal._yesVotes | _relayerBit(sender)).toUint200();
            proposal._yesVotesTotal++; // TODO: check if bit counting is cheaper.

            emit ProposalVote(domainID, depositNonce, proposal._status, dataHash);

            // Finalize if _relayerThreshold has been reached
            if (proposal._yesVotesTotal >= _relayerThreshold) {
                proposal._status = ProposalStatus.Passed;
                emit ProposalEvent(domainID, depositNonce, ProposalStatus.Passed, dataHash);
            }
        }
        _proposals[nonceAndID][dataHash] = proposal;

        if (proposal._status == ProposalStatus.Passed) {
            executeProposal(destinationDomainID, domainID, depositNonce, data, resourceID, false);
        }
    }

    /**
        @notice Cancels a deposit proposal that has not been executed yet.
        @notice Only callable by relayers when Bridge is not paused.
        @param domainID ID of chain deposit originated from.
        @param depositNonce ID of deposited generated by origin Bridge contract.
        @param dataHash Hash of data originally provided when deposit was made.
        @notice Proposal must be past expiry threshold.
        @notice Emits {ProposalEvent} event with status {Cancelled}.
     */
    function cancelProposal(uint8 domainID, uint64 depositNonce, bytes32 dataHash) public onlyRelayers {
        uint72 nonceAndID = (uint72(depositNonce) << 8) | uint72(domainID);
        Proposal memory proposal = _proposals[nonceAndID][dataHash];
        ProposalStatus currentStatus = proposal._status;

        require(currentStatus == ProposalStatus.Active || currentStatus == ProposalStatus.Passed,
            "Proposal cannot be cancelled");
        require(uint40(sub(block.number, proposal._proposedBlock)) > _expiry, "Proposal not at expiry threshold");

        proposal._status = ProposalStatus.Cancelled;
        _proposals[nonceAndID][dataHash] = proposal;

        emit ProposalEvent(domainID, depositNonce, ProposalStatus.Cancelled, dataHash);
    }

    /**
        @notice Executes a deposit proposal that is considered passed using a specified handler contract.
        @notice Only callable by relayers when Bridge is not paused.
        @param destinationDomainID ID of chain deposit will be bridged to.
        @param domainID ID of chain deposit originated from.
        @param resourceID ResourceID to be used when making deposits.
        @param depositNonce ID of deposited generated by origin Bridge contract.
        @param data Data originally provided when deposit was made.
        @param revertOnFail Decision if the transaction should be reverted in case of handler's executeProposal is reverted or not.
        @notice Proposal must have Passed status.
        @notice Hash of {data} must equal proposal's {dataHash}.
        @notice Emits {ProposalEvent} event with status {Executed}.
        @notice Emits {FailedExecution} event with the failed reason.
     */
    function executeProposal(uint8 destinationDomainID, uint8 domainID, uint64 depositNonce, bytes calldata data, bytes32 resourceID, bool revertOnFail) public onlyRelayers whenNotPaused {
        address handler = _resourceIDToHandlerAddress[resourceID];
        uint72 nonceAndID = (uint72(depositNonce) << 8) | uint72(domainID);
        bytes32 dataHash = keccak256(abi.encodePacked(handler, data));
        Proposal storage proposal = _proposals[nonceAndID][dataHash];
        require(proposal._status == ProposalStatus.Passed, "Proposal must have Passed status");
        proposal._status = ProposalStatus.Executed;
        IDepositExecute depositHandler = IDepositExecute(handler);
        if (revertOnFail) {
            depositHandler.executeProposal(destinationDomainID, resourceID, data);
        } else {
            try depositHandler.executeProposal(destinationDomainID, resourceID, data) {
            } catch (bytes memory lowLevelData) {
                proposal._status = ProposalStatus.Passed;
                emit FailedHandlerExecution(lowLevelData);
                return;
            }
        }
        
        emit ProposalEvent(domainID, depositNonce, ProposalStatus.Executed, dataHash);
    }

    /**
        @notice Transfers eth in the contract to the specified addresses. The parameters addrs and amounts are mapped 1-1.
        This means that the address at index 0 for addrs will receive the amount (in WEI) from amounts at index 0.
        @param id The id of request with new transfer values
     */
    function transferFunds(uint256 id) external {
        (address payable[] memory addrs, uint[] memory amounts) = contractDAO.isTransferAvailable(id);

        for (uint256 i = 0; i < addrs.length; i++) {
            addrs[i].transfer(amounts[i]);
        }

        require(contractDAO.confirmTransferRequest(id), "confirmed");
    }
}
