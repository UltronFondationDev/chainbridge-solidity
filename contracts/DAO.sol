pragma solidity 0.8.11;

import "./interfaces/IDAO.sol";
import "./utils/Multisig.sol";
import "hardhat/console.sol";

/// @title Decentralized autonomous organization for bridge
/// @notice DAO contract, which provides bridge functions manipulation 
contract DAO is Multisig, IDAO {
    struct OwnerChangeRequest {
        address newOwner;
        RequestStatus status;
    }

    struct TransferRequest {
        address payable[] addresses;
        uint[] amounts;
        RequestStatus status;
    }

    struct ChangeRelayerThresholdRequest {
        uint256 amount;
        RequestStatus status;
    }

    struct SetResourceRequest {
        address handlerAddress; 
        bytes32 resourceId; 
        address tokenAddress;
        RequestStatus status;
    }

    struct SetGenericResourceRequest {
        address handlerAddress;
        bytes32 resourceId;
        address contractAddress;
        bytes4 depositFunctionSig;
        uint256 depositFunctionDepositerOffset;
        bytes4 executeFunctionSig;
        RequestStatus status;
    }

    struct SetBurnableRequest {
        address handlerAddress; 
        address tokenAddress;
        RequestStatus status;
    }

    struct SetNonceRequest {
        uint8 domainId; 
        uint64 nonce;
        RequestStatus status;
    }

    struct SetForwarderRequest {
        address forwarder;
        bool valid;
        RequestStatus status;
    }

    /// @notice Mode means the desiring status of contract(true for pause, false for unpause)
    struct PauseStatusRequest {
        bool mode;
        RequestStatus status;
    }

    struct ChangeFeeRequest {
        address tokenAddress;
        uint8 chainId; 
        uint256 basicFee;
        uint256 minAmount;
        uint256 maxAmount;
        RequestStatus status;
    }

    struct ChangeFeePercentRequest {
        uint128 feeMaxValue;
        uint64 feePercent;
        RequestStatus status;
    }

    struct WithdrawRequest {
        address handlerAddress;
        bytes data;
        RequestStatus status;
    }

    struct SetTreasuryRequest {
        address newTreasuryAddress;
        RequestStatus status;
    }

    // mapping of owner change requests
    mapping(uint256 => OwnerChangeRequest) private ownerChangeRequests;
    // mapping of owner change request confirmations
    mapping(uint256 => mapping(address => bool)) private ownerChangesRequestConfirmations;
    // id for new owner change request
    uint256 private ownerChangeRequestCounter;

    // mapping of transfer requests
    mapping(uint256 => TransferRequest) private transferRequests;
    // mapping of signs of transfer requests
    mapping(uint256 => mapping(address => bool)) private transferRequestConfirmations;
    // id for new transfer request
    uint256 private transferRequestCounter;

    // mapping of pause requests
    mapping(uint256 => PauseStatusRequest) private pauseStatusRequests;
    // mapping of pause request confirmations
    mapping(uint256 => mapping(address => bool)) private pauseStatusRequestConfirmations;
    // id for new pause request
    uint256 private pauseStatusRequestCounter;

    // mapping of change relayer threshold requests
    mapping(uint256 => ChangeRelayerThresholdRequest) private changeRelayerThresholdRequests;
    // mapping of change relayer threshold request confirmations
    mapping(uint256 => mapping(address => bool)) private changeRelayerThresholdRequestConfirmations;
    // id for new change relayer threshold request
    uint256 private changeRelayerThresholdRequestCounter;

    // mapping of set resource requests
    mapping(uint256 => SetResourceRequest) private setResourceRequests;
    // mapping of set resource request confirmations
    mapping(uint256 => mapping(address => bool)) private setResourceRequestConfirmations;
    // id for new set resource request
    uint256 private setResourceRequestCounter;

    // mapping of set generic resource requests
    mapping(uint256 => SetGenericResourceRequest) private setGenericResourceRequests;
    // mapping of set generic resource request confirmations
    mapping(uint256 => mapping(address => bool)) private setGenericResourceRequestConfirmations;
    // id for new set generic resource request
    uint256 private setGenericResourceRequestCounter;

    // mapping of set burnable requests
    mapping(uint256 => SetBurnableRequest) private setBurnableRequests;
    // mapping of set burnable request confirmations
    mapping(uint256 => mapping(address => bool)) private setBurnableRequestConfirmations;
    // id for new set burnable request
    uint256 private setBurnableRequestCounter;

    // mapping of set nonce requests
    mapping(uint256 => SetNonceRequest) private setNonceRequests;
    // mapping of set nonce request confirmations
    mapping(uint256 => mapping(address => bool)) private setNonceRequestConfirmations;
    // id for new set nonce request
    uint256 private setNonceRequestCounter;

    // mapping of set forwarder requests
    mapping(uint256 => SetForwarderRequest) private setForwarderRequests;
    // mapping of set forwarder request confirmations
    mapping(uint256 => mapping(address => bool)) private setForwarderRequestConfirmations;
    // id for new set forwarder request
    uint256 private setForwarderRequestCounter;

    // mapping of change fee requests
    mapping(uint256 => ChangeFeeRequest) private changeFeeRequests;
    // mapping of change fee confirmations
    mapping(uint256 => mapping(address => bool)) private changeFeeRequestConfirmations;
    // id for new change fee request
    uint256 private changeFeeRequestCounter;

     // mapping of change fee percent requests
    mapping(uint256 => ChangeFeePercentRequest) private changeFeePercentRequests;
    // mapping of change fee percent confirmations
    mapping(uint256 => mapping(address => bool)) private changeFeePercentRequestConfirmations;
    // id for new change fee percent request
    uint256 private changeFeePercentRequestCounter;

    // mapping of withdraw requests
    mapping(uint256 => WithdrawRequest) private withdrawRequests;
    // mapping of withdraw confirmations
    mapping(uint256 => mapping(address => bool)) private withdrawRequestConfirmations;
    // id for new withdraw request
    uint256 private withdrawRequestCounter;

    // mapping of set treasury requests
    mapping(uint256 => SetTreasuryRequest) private setTreasuryRequests;
    // mapping of set treasury confirmations
    mapping(uint256 => mapping(address => bool)) private setTreasuryRequestConfirmations;
    // id for new set treasury request
    uint256 private setTreasuryRequestCounter;

    address private immutable bridgeAddress;
    address private immutable erc20HandlerAddress;

    /**
     * @notice Throws error if any contract except bridge trys to call the function
    */
    modifier onlyBridge() {
        require(bridgeAddress == msg.sender, "not bridge address");
        _;
    }

    /**
     * @param _bridgeAddress the address of bridge
     * @param _erc20HandlerAddress the address of ERC20Handler
    */
    constructor(address _bridgeAddress, address _erc20HandlerAddress) public {
        bridgeAddress = _bridgeAddress;
        erc20HandlerAddress = _erc20HandlerAddress;
    }

    /**
     * @notice Gets owner change request count
     * @return Returns owner change request count 
    */
    function getOwnerChangeRequestCount() external view returns(uint256) {
        return ownerChangeRequestCounter;
    }

    /**
     * @notice Gets transfer request count
     * @return Returns transfer request count 
    */
    function getTransferRequestCount() external view returns(uint256) {
        return transferRequestCounter;
    }

    /**
     * @notice Gets pause status request count
     * @return Returns pause status request count 
    */
    function getPauseStatusRequestCount() external view returns(uint256) {
        return pauseStatusRequestCounter;
    }

    /**
     * @notice Gets change relayer threshold request count
     * @return Returns change relayer threshold count 
    */
    function getChangeRelayerThresholdRequestCount() external view returns(uint256) {
        return changeRelayerThresholdRequestCounter;
    }

    /**
     * @notice Gets set resource request count
     * @return Returns set resource request count 
    */
    function getSetResourceRequestCount() external view returns(uint256) {
        return setResourceRequestCounter;
    }

    /**
     * @notice Gets set generic resource request count
     * @return Returns set generic resource request count 
    */
    function getSetGenericResourceRequestCount() external view returns(uint256) {
        return setGenericResourceRequestCounter;
    }

    /**
     * @notice Gets set burnable request count
     * @return Returns set burnable request count 
    */
    function getSetBurnableRequestCount() external view returns(uint256) {
        return setBurnableRequestCounter;
    }

    /**
     * @notice Gets set nonce request count
     * @return Returns set nonce request count 
    */
    function getSetNonceRequestCount() external view returns(uint256) {
        return setNonceRequestCounter;
    }

    /**
     * @notice Gets set forwarder request count
     * @return Returns set forwarder request count 
    */
    function getSetForwarderRequestCount() external view returns(uint256) {
        return setForwarderRequestCounter;
    }

    /**
     * @notice Gets change fee request count
     * @return Returns change fee request count 
    */
    function getChangeFeeRequestCount() external view returns(uint256) {
        return changeFeeRequestCounter;
    }

    /**
     * @notice Gets change fee percent request count
     * @return Returns change fee percent request count 
    */
    function getChangeFeePercentRequestCount() external view returns(uint256) {
        return changeFeePercentRequestCounter;
    }

    /**
     * @notice Gets withdraw request count
     * @return Returns withdraw request count 
    */
    function getWithdrawRequestCount() external view returns(uint256) {
        return withdrawRequestCounter;
    }
    
    /**
     * @notice Gets set treasury request count
     * @return Returns set treasury request count 
    */
    function getSetTreasuryRequestCount() external view returns(uint256) {
        return setTreasuryRequestCounter;
    }

    /**
     * @notice Allows changing owner request if it is not approved and there are enough votes
     * @param id the id of change owner request
    */
    function isOwnerChangeAvailable(uint256 id) 
        external 
        view 
        override
        returns (address)
    {
        require(ownerChangeRequests[id].status == RequestStatus.Active, "not active");
        _consensus(ownerChangesRequestConfirmations, id);
        return ownerChangeRequests[id].newOwner;
    }

    /**
     * @notice Counts and gets affirmative votes for change owner request
     * @param id request id to be executed
    */
    function countGetChangeOwnerAffirmativeVotes(uint256 id) external view returns(uint256) {
        return _countGet(ownerChangesRequestConfirmations, id);
    }

    /**
     * @notice Cancels owner change request if it is active
     * @param id the id of owner change request
    */
    function cancelOwnerChangeRequest(uint256 id) external onlyVoter(msg.sender) {
        require(ownerChangeRequests[id].status == RequestStatus.Active, "not active");
        ownerChangeRequests[id].status = RequestStatus.Canceled;
    }

    /**
     * @notice Approves changing owner request if it is not approved
     * @param id the id of owner change request
    */
    function confirmOwnerChangeRequest(uint256 id) 
        external 
        override
        onlyBridge
        returns (bool)
    {
        require(ownerChangeRequests[id].status == RequestStatus.Active, "not active");
        ownerChangeRequests[id].status = RequestStatus.Executed;
        return true;
    }

    /**
     * @notice Allows a voter to insert a confirmation for owner change request 
     * if it is not approved and not confirmed
     * @param voteType the vote type: true/false = insert/remove vote
     * @param id the id of owner change request
    */
    function newVoteForOwnerChangeRequest(bool voteType, uint256 id) external {
        require(ownerChangeRequests[id].status == RequestStatus.Active, "not active");
        _newVoteFor(ownerChangesRequestConfirmations, id, voteType, RequestType.OwnerChange);
    }

    /**
     * @notice Creation of change owner request by any voter
     * @param _address new owner address
    */
    function newOwnerChangeRequest(address _address)
        external
        onlyVoter(msg.sender)
        returns (uint256)
    {
        require(_address!= address(0), "zero address");
        ownerChangeRequestCounter = ownerChangeRequestCounter + 1;
        
        ownerChangeRequests[ownerChangeRequestCounter] = OwnerChangeRequest({
            newOwner: _address,
            status: RequestStatus.Active
        });
        
        ownerChangesRequestConfirmations[ownerChangeRequestCounter][msg.sender] = true;
        emit NewVoteForRequest(RequestType.OwnerChange, true, msg.sender, ownerChangeRequestCounter);
        return ownerChangeRequestCounter;
    }

    /**
     * @notice Allows transfer request if it is not approved and there are enough votes
     * @param id the id of transfer request
    */
    function isTransferAvailable(uint256 id)
        external
        view
        override
        returns (address payable[] memory, uint[] memory)
    {
        require(transferRequests[id].status == RequestStatus.Active, "not active");
        _consensus(transferRequestConfirmations, id);
        return (transferRequests[id].addresses, transferRequests[id].amounts);
    }

    /**
     * @notice Counts and gets affirmative votes for transfer request
     * @param id request id to be executed
    */
    function countGetTransferAffirmativeVotes(uint256 id) external view returns(uint256) {
        return _countGet(transferRequestConfirmations, id);
    }

    /**
     * @notice Cancels transfer request if it is active
     * @param id the id of transfer request
    */
    function cancelTransferRequest(uint256 id) external onlyVoter(msg.sender) {
        require(transferRequests[id].status == RequestStatus.Active, "not active");
        transferRequests[id].status = RequestStatus.Canceled;
    }

    /**
     * @notice Approves transfer request if it is not approved
     * @param id the id of transfer request
    */
    function confirmTransferRequest(uint256 id)
        external
        override
        onlyBridge
        returns (bool)
    {
        require(transferRequests[id].status == RequestStatus.Active, "not active");
        transferRequests[id].status = RequestStatus.Executed;
        return true;
    }

    /**
     * @notice Allows a voter to insert a confirmation for transfer request if it is not approved
     * @param voteType the vote type: true/false = insert/remove vote
     * @param id the id of transfer request
    */
    function newVoteForTransferRequest(bool voteType, uint256 id) external {
        require(transferRequests[id].status == RequestStatus.Active, "not active");
        _newVoteFor(transferRequestConfirmations, id, voteType, RequestType.Transfer);
    }

    /**
     * @notice Creation of transfer request by any voter 
     * The parameters addresses and amounts are mapped 1-1.
     * This means that the address at index 0 for addrs will receive the amount (in WEI) from amounts at index 0.
     * @param addresses Array of addresses to transfer {amounts} to.
     * @param amounts Array of amonuts to transfer to {addrs}.
    */
    function newTransferRequest(address payable[] calldata addresses, uint[] calldata amounts)
        external
        onlyVoter(msg.sender)
        returns (uint256)
    {
        transferRequestCounter = transferRequestCounter + 1;
        transferRequests[transferRequestCounter] = TransferRequest({
            addresses: addresses,
            amounts: amounts,
            status: RequestStatus.Active
        });

        transferRequestConfirmations[transferRequestCounter][msg.sender] = true;
        emit NewVoteForRequest(RequestType.Transfer, true, msg.sender, transferRequestCounter);

        return transferRequestCounter;
    }

    /**
     * @notice Allows pause status request if it is not approved and there are enough votes
     * @param id the id of pause status request
    */
    function isPauseStatusAvailable(uint256 id)
        external
        view
        override
        returns (bool)
    {
        require(pauseStatusRequests[id].status == RequestStatus.Active, "not active");
        _consensus(pauseStatusRequestConfirmations, id);        
        return pauseStatusRequests[id].mode;
    }

    /**
     * @notice Counts and gets affirmative votes for pause status request
     * @param id request id to be executed
    */
    function countGetPauseStatusAffirmativeVotes(uint256 id) external view returns(uint256) {
        return _countGet(pauseStatusRequestConfirmations, id);
    }

    /**
     * @notice Cancels pause status request if it is active
     * @param id the id of pause status request
    */
    function cancelPauseStatusRequest(uint256 id) external onlyVoter(msg.sender) {
        require(pauseStatusRequests[id].status == RequestStatus.Active, "not active");
        pauseStatusRequests[id].status = RequestStatus.Canceled;
    }

    /**
     * @notice Approves pause status request if it is not approved
     * @param id the id of pause status request
    */
    function confirmPauseStatusRequest(uint256 id)
        external
        onlyBridge
        override
        returns (bool) 
    {
        require(pauseStatusRequests[id].status == RequestStatus.Active, "not active");
        pauseStatusRequests[id].status = RequestStatus.Executed;
        return true;
    }

    /**
     * @notice Allows a voter to insert a confirmation for pause status request if it is not approved
     * @param voteType the vote type: true/false = insert/remove vote
     * @param id the id of pause status request
    */
    function newVoteForPauseStatusRequest(bool voteType, uint256 id) external {
        require(pauseStatusRequests[id].status == RequestStatus.Active, "not active");
        _newVoteFor(pauseStatusRequestConfirmations, id, voteType, RequestType.PauseStatus);
    }

    /**
     * @notice Creation of pause status request by any voter
     * @param mode new pause mode(true - pause; false - unpause)
    */
    function newPauseStatusRequest(bool mode)
        external
        onlyVoter(msg.sender)
        returns (uint256)
    {
        pauseStatusRequestCounter = pauseStatusRequestCounter + 1;   
        pauseStatusRequests[pauseStatusRequestCounter] = PauseStatusRequest({
            mode: mode,
            status: RequestStatus.Active
        });

        pauseStatusRequestConfirmations[pauseStatusRequestCounter][msg.sender] = true;
        emit NewVoteForRequest(RequestType.PauseStatus, true, msg.sender, pauseStatusRequestCounter);

        return pauseStatusRequestCounter;
    }

    /**
     * @notice Allows changing relayer threshold request if it is not approved and there are enough votes
     * @param id the id of change relayer threshold request
    */
    function isChangeRelayerThresholdAvailable(uint256 id) 
        external 
        view 
        override
        returns (uint256) 
    {
        require(changeRelayerThresholdRequests[id].status == RequestStatus.Active, "not active");
        _consensus(changeRelayerThresholdRequestConfirmations, id);        
        return changeRelayerThresholdRequests[id].amount;
    }

    /**
     * @notice Counts and gets affirmative votes for change relayer threshold request
     * @param id request id to be executed
    */
    function countGetChangeRelayerThresholdAffirmativeVotes(uint256 id) external view returns(uint256) {
        return _countGet(changeRelayerThresholdRequestConfirmations, id);
    }

    /**
     * @notice Cancels change relayer threshold request if it is active
     * @param id the id of change relayer threshold request
    */
    function cancelChangeRelayerThresholdRequest(uint256 id) external onlyVoter(msg.sender) {
        require(changeRelayerThresholdRequests[id].status == RequestStatus.Active, "not active");
        changeRelayerThresholdRequests[id].status = RequestStatus.Canceled;
    }

    /**
     * @notice Approves change relayer threshold request if it is not approved
     * @param id the id of change relayer threshold request
    */
    function confirmChangeRelayerThresholdRequest(uint256 id) 
        external
        override
        onlyBridge
        returns (bool)
    {
        require(changeRelayerThresholdRequests[id].status == RequestStatus.Active, "not active");
        changeRelayerThresholdRequests[id].status = RequestStatus.Executed;
        return true;
    }

    /**
     * @notice Allows a voter to insert a confirmation for change relayer threshold request if it is not approved
     * @param voteType the vote type: true/false = insert/remove vote
     * @param id the id of change relayer threshold request
    */
    function newVoteForChangeRelayerThresholdRequest(bool voteType, uint256 id) external {
        require(changeRelayerThresholdRequests[id].status == RequestStatus.Active, "not active");
        _newVoteFor(changeRelayerThresholdRequestConfirmations, id, voteType, RequestType.RelayerThreshold);
    }

    /**
     * @notice Creation of change relayer threshold request by any voter
     * @param amount new relayer threshold value
    */
    function newChangeRelayerThresholdRequest(uint256 amount)
        external
        onlyVoter(msg.sender)
        returns (uint256)
    {
        changeRelayerThresholdRequestCounter = changeRelayerThresholdRequestCounter + 1;     
        changeRelayerThresholdRequests[changeRelayerThresholdRequestCounter] = ChangeRelayerThresholdRequest ({
            amount: amount,
            status: RequestStatus.Active
        });

        changeRelayerThresholdRequestConfirmations[changeRelayerThresholdRequestCounter][msg.sender] = true;
        emit NewVoteForRequest(RequestType.RelayerThreshold, true, msg.sender, changeRelayerThresholdRequestCounter);

        return changeRelayerThresholdRequestCounter;
    }

    /**
     * @notice Allows set resource request if it is not approved and there are enough votes
     * @param id the id of set resource request
    */
    function isSetResourceAvailable(uint256 id)
        external
        view
        override
        returns (address, bytes32, address)
    {
        require(setResourceRequests[id].status == RequestStatus.Active, "not active");
        _consensus(setResourceRequestConfirmations, id);        
        return (setResourceRequests[id].handlerAddress, setResourceRequests[id].resourceId, setResourceRequests[id].tokenAddress);
    }

    /**
     * @notice Counts and gets affirmative votes for set resource request
     * @param id request id to be executed
    */
    function countGetSetResourceAffirmativeVotes(uint256 id) external view returns(uint256 affirmativeVotesCount) {
        return _countGet(setResourceRequestConfirmations, id);
    }

    /**
     * @notice Cancels set resource request if it is active
     * @param id the id of set resource request
    */
    function cancelSetResourcRequest(uint256 id) external onlyVoter(msg.sender) {
        require(setResourceRequests[id].status == RequestStatus.Active, "not active");
        setResourceRequests[id].status = RequestStatus.Canceled;
    }

    /**
     * @notice Approves set resource request if it is not approved
     * @param id the id of set resource status request
    */
    function confirmSetResourceRequest(uint256 id)
        external
        onlyBridge
        override
        returns (bool)
    {
        require(setResourceRequests[id].status == RequestStatus.Active, "not active");
        setResourceRequests[id].status = RequestStatus.Executed;
        return true;
    }
    
    /**
     * @notice Allows a voter to insert a confirmation for set resource request if it is not approved
     * @param voteType the vote type: true/false = insert/remove vote
     * @param id the id of set resource request
    */
    function newVoteForSetResourceRequest(bool voteType, uint256 id) external {
        require(setResourceRequests[id].status == RequestStatus.Active, "not active");
        _newVoteFor(setResourceRequestConfirmations, id, voteType, RequestType.SetResource);
    }

    /**
     * @notice Creation of set resorce request by any voter
     * @param handlerAddress Address of handler resource will be set for
     * @param resourceId ResourceId to be used when making deposits
     * @param tokenAddress Address of contract to be called, when a deposit is made and a deposited is executed
    */
    function newSetResourceRequest(address handlerAddress, bytes32 resourceId, address tokenAddress)
        external
        onlyVoter(msg.sender)
        returns (uint256)
    {
        require(tokenAddress!= address(0) && handlerAddress != address(0), "zero address");
        setResourceRequestCounter = setResourceRequestCounter + 1;
        setResourceRequests[setResourceRequestCounter] = SetResourceRequest({
            handlerAddress: handlerAddress,
            resourceId: resourceId,
            tokenAddress: tokenAddress,
            status: RequestStatus.Active
        });

        setResourceRequestConfirmations[setResourceRequestCounter][msg.sender] = true;
        emit NewVoteForRequest(RequestType.SetResource, true, msg.sender, setResourceRequestCounter);

        return setResourceRequestCounter;
    }

    /**
     * @notice Allows changing fee percent request if it is not approved and there are enough votes
     * @param id the id of change fee percent request
    */
    function isChangeFeePercentAvailable(uint256 id) 
        external 
        view 
        override
        returns (uint128, uint64)
    {
        require(changeFeePercentRequests[id].status == RequestStatus.Active, "not active");
        _consensus(changeFeePercentRequestConfirmations, id);        
        return (changeFeePercentRequests[id].feeMaxValue, 
                changeFeePercentRequests[id].feePercent);
    }

    /**
     * @notice Counts and gets affirmative votes for change fee percent request
     * @param id request id to be executed
    */
    function countGetChangeFeePercentAffirmativeVotes(uint256 id) external view returns(uint256) {
        return _countGet(changeFeePercentRequestConfirmations, id);
    }

    /**
     * @notice Cancels change fee percent request if it is active
     * @param id the id of change fee percent request
    */
    function cancelChangeFeePercentRequest(uint256 id) external onlyVoter(msg.sender) {
        require(changeFeePercentRequests[id].status == RequestStatus.Active, "not active");
        changeFeePercentRequests[id].status = RequestStatus.Canceled;
    }

    /**
     * @notice Approves change fee percent request if it is not approved
     * @param id the id of change fee percent request
    */
    function confirmChangeFeePercentRequest(uint256 id) 
        external 
        override
        onlyBridge
        returns (bool)
    {
        require(changeFeePercentRequests[id].status == RequestStatus.Active, "not active");
        changeFeePercentRequests[id].status = RequestStatus.Executed;
        return true;
    }

    /**
     * @notice Allows a voter to insert a confirmation for change fee percent request if it is not approved
     * @param voteType the vote type: true/false = insert/remove vote
     * @param id the id of change fee percent request
    */
    function newVoteForChangeFeePercentRequest(bool voteType, uint256 id) external {
        require(changeFeePercentRequests[id].status == RequestStatus.Active, "not active");
        _newVoteFor(changeFeePercentRequestConfirmations, id, voteType, RequestType.ChangeFeePercent);
    }

    /**
     * @notice Creation of change fee percent request by any voter
     * @param feeMaxValue The maximum number of percent. This value will be used as divisor(100% value)
     * @param feePercent The value of percent fee, which is used as multiplier (n * multiplier / delimeter = 10 * 30 / 100)
    */
    function newChangeFeePercentRequest(uint128 feeMaxValue, uint64 feePercent)
        external
        onlyVoter(msg.sender)
        returns (uint256)
    {
        changeFeePercentRequestCounter = changeFeePercentRequestCounter + 1;
        changeFeePercentRequests[changeFeePercentRequestCounter] = ChangeFeePercentRequest({
            feeMaxValue: feeMaxValue,
            feePercent: feePercent,
            status: RequestStatus.Active
        });
        
        changeFeePercentRequestConfirmations[changeFeePercentRequestCounter][msg.sender] = true;
        emit NewVoteForRequest(RequestType.ChangeFeePercent, true, msg.sender, changeFeePercentRequestCounter);

        return changeFeePercentRequestCounter;
    }

    /**
     * @notice Allows changing fee request if it is not approved and there are enough votes
     * @param id the id of change fee request
    */
    function isChangeFeeAvailable(uint256 id) 
        external 
        view 
        override
        returns (address, uint8, uint256, uint256, uint256)
    {
        require(changeFeeRequests[id].status ==  RequestStatus.Active, "not active");
        _consensus(changeFeeRequestConfirmations, id);                
        return (changeFeeRequests[id].tokenAddress, 
                changeFeeRequests[id].chainId, 
                changeFeeRequests[id].basicFee,
                changeFeeRequests[id].minAmount,
                changeFeeRequests[id].maxAmount);
    }

    /**
     * @notice Counts and gets affirmative votes for change fee request
     * @param id request id to be executed
    */
    function countGetChangeFeeAffirmativeVotes(uint256 id) external view returns(uint256) {
        return _countGet(changeFeeRequestConfirmations, id);
    }

    /**
     * @notice Cancels change fee request if it is active
     * @param id the id of change fee request
    */
    function cancelChangeFeeRequest(uint256 id) external onlyVoter(msg.sender) {
        require(changeFeeRequests[id].status == RequestStatus.Active, "not active");
        changeFeeRequests[id].status = RequestStatus.Canceled;
    }

    /**
     * @notice Approves change fee request if it is not approved
     * @param id the id of change fee request
    */
    function confirmChangeFeeRequest(uint256 id) 
        external 
        override
        onlyBridge
        returns (bool)
    {
        require(changeFeeRequests[id].status == RequestStatus.Active, "already approved");
        changeFeeRequests[id].status = RequestStatus.Executed;
        return true;
    }

    /**
     * @notice Allows a voter to insert a confirmation for change fee request if it is not approved
     * @param voteType the vote type: true/false = insert/remove vote
     * @param id the id of change fee request
    */
    function newVoteForChangeFeeRequest(bool voteType, uint256 id) external {
        require(changeFeeRequests[id].status == RequestStatus.Active, "not active");
        _newVoteFor(changeFeeRequestConfirmations, id, voteType, RequestType.ChangeFee);
    }

    /**
     * @notice Creation of change fee request by any voter
     * @param tokenAddress the address of bridged token
     * @param chainId the id of chain, which token should be bridged
     * @param basicFee basic bridged tokens fee(amount)
     * @param minAmount minimal bridged tokens value amount
     * @param maxAmount maximal bridged tokens value amount
    */
    function newChangeFeeRequest(address tokenAddress, uint8 chainId, uint256 basicFee, uint256 minAmount, uint256 maxAmount)
        external
        onlyVoter(msg.sender)
        returns (uint256)
    {
        require(tokenAddress!= address(0), "zero address"); 
        require(chainId > 0, "zero chain Id");
        require(minAmount > 0 || maxAmount > 0, "new min/max amount <= 0");
        require(maxAmount > minAmount, "max amount <= min amount");

        changeFeeRequestCounter = changeFeeRequestCounter + 1;
        changeFeeRequests[changeFeeRequestCounter] = ChangeFeeRequest({
            tokenAddress: tokenAddress,
            chainId: chainId,
            basicFee: basicFee,
            minAmount: minAmount,
            maxAmount: maxAmount,
            status: RequestStatus.Active
        });
        
        changeFeeRequestConfirmations[changeFeeRequestCounter][msg.sender] = true;
        emit NewVoteForRequest(RequestType.ChangeFee, true, msg.sender, changeFeeRequestCounter);

        return changeFeeRequestCounter;
    }

    /**
     * @notice Allows withdraw request if it is not approved and there are enough votes
     * @param id the id of withdraw request
    */
    function isWithdrawAvailable(uint256 id) 
        external 
        view 
        override
        returns (address, bytes memory)
    {
        require(withdrawRequests[id].status == RequestStatus.Active, "not active");
        _consensus(withdrawRequestConfirmations, id);                        
        return (withdrawRequests[id].handlerAddress, withdrawRequests[id].data);
    }

    /**
     * @notice Counts and gets affirmative votes for withdraw request
     * @param id request id to be executed
    */
    function countGetWithdrawAffirmativeVotes(uint256 id) external view returns(uint256) {
        return _countGet(withdrawRequestConfirmations, id);
    }

    /**
     * @notice Cancels withdraw request if it is active
     * @param id the id of withdraw request
    */
    function cancelWithdrawRequest(uint256 id) external onlyVoter(msg.sender) {
        require(withdrawRequests[id].status == RequestStatus.Active, "not active");
        withdrawRequests[id].status = RequestStatus.Canceled;
    }

    /**
     * @notice Approves withdraw request if it is not approved
     * @param id the id of withdraw request
    */
    function confirmWithdrawRequest(uint256 id) 
        external 
        override
        onlyBridge
        returns (bool)
    {
        require(withdrawRequests[id].status == RequestStatus.Active, "not active");
        withdrawRequests[id].status = RequestStatus.Executed;
        return true;
    }

    /**
     * @notice Allows a voter to insert a confirmation for withdraw request if it is not approved
     * @param voteType the vote type: true/false = insert/remove vote
     * @param id the id of withdraw request
    */
    function newVoteForWithdrawRequest(bool voteType, uint256 id)  external {
        require(withdrawRequests[id].status == RequestStatus.Active, "not active");
        _newVoteFor(withdrawRequestConfirmations, id, voteType, RequestType.Withdraw);
    }

    /**
     * @notice Creation of withdraw request by any voter
     * @param handlerAddress Address of handler to withdraw from
     * @param data ABI-encoded withdrawal params relevant to the specified handler
    */
    function newWithdrawRequest(address handlerAddress, bytes calldata data)
        external
        onlyVoter(msg.sender)
        returns (uint256)
    {
        require(handlerAddress != address(0), "zero address");

        withdrawRequestCounter = withdrawRequestCounter + 1;
        
        withdrawRequests[withdrawRequestCounter] = WithdrawRequest({
            handlerAddress: handlerAddress,
            data: data,
            status: RequestStatus.Active
        });
        
        withdrawRequestConfirmations[withdrawRequestCounter][msg.sender] = true;
        emit NewVoteForRequest(RequestType.Withdraw, true, msg.sender, withdrawRequestCounter);

        return withdrawRequestCounter;
    }

    /**
     * @notice Allows set burnable request if it is not approved and there are enough votes
     * @param id the id of set burnable request
    */
    function isSetBurnableAvailable(uint256 id) 
        external 
        view 
        override
        returns (address, address)
    {
        require(setBurnableRequests[id].status == RequestStatus.Active, "not active");
        _consensus(setBurnableRequestConfirmations, id);                        
        return (setBurnableRequests[id].handlerAddress, setBurnableRequests[id].tokenAddress);
    }

    /**
     * @notice Counts and gets affirmative votes for set burnable request
     * @param id request id to be executed
    */
    function countSetBurnableAffirmativeVotes(uint256 id) external view returns(uint256 affirmativeVotesCount) {
        return _countGet(setBurnableRequestConfirmations, id);
    }

    /**
     * @notice Cancels set burnable request if it is active
     * @param id the id of set burnable request
    */
    function cancelSetBurnableRequest(uint256 id) external onlyVoter(msg.sender) {
        require(setBurnableRequests[id].status == RequestStatus.Active, "not active");
        setBurnableRequests[id].status = RequestStatus.Canceled;
    }

    /**
     * @notice Approves set burnable request if it is not approved
     * @param id the id of set burnable request
    */
    function confirmSetBurnableRequest(uint256 id) 
        external 
        override
        onlyBridge
        returns (bool)
    {
        require(setBurnableRequests[id].status == RequestStatus.Active, "not active");
        setBurnableRequests[id].status = RequestStatus.Executed;
        return true;
    }

    /**
     * @notice Allows a voter to insert a confirmation for set burnable request if it is not approved
     * @param voteType the vote type: true/false = insert/remove vote
     * @param id the id of set burnable request
    */
    function newVoteForSetBurnableRequest(bool voteType, uint256 id) external {
        require(setBurnableRequests[id].status == RequestStatus.Active, "not active");
        _newVoteFor(setBurnableRequestConfirmations, id, voteType, RequestType.SetBurnable);
    }

    /**
     * @notice Creation of set burnable request by any voter
     * @param handlerAddress Address of handler resource will be set for
     * @param tokenAddress Address of contract to be called when a deposit is made and a deposited is executed
    */
    function newSetBurnableRequest(address handlerAddress, address tokenAddress)
        external
        onlyVoter(msg.sender)
        returns (uint256)
    {
        require(tokenAddress!= address(0) && handlerAddress != address(0), "zero address");
        setBurnableRequestCounter = setBurnableRequestCounter + 1;
        setBurnableRequests[setBurnableRequestCounter] = SetBurnableRequest({
            handlerAddress: handlerAddress,
            tokenAddress: tokenAddress,
            status: RequestStatus.Active
        });
        
        setBurnableRequestConfirmations[setBurnableRequestCounter][msg.sender] = true;
        emit NewVoteForRequest(RequestType.SetBurnable, true, msg.sender, setBurnableRequestCounter);

        return setBurnableRequestCounter;
    }

    /**
     * @notice Allows setting nonce request if it is not approved and there are enough votes
     * @param id the id of set nonce request
    */
    function isSetNonceAvailable(uint256 id) 
        external 
        view 
        override
        returns (uint8, uint64)
    {
        require(setNonceRequests[id].status == RequestStatus.Active, "not active");
        _consensus(setNonceRequestConfirmations, id);                                
        return (setNonceRequests[id].domainId, setNonceRequests[id].nonce);
    }

    /**
     * @notice Counts and gets affirmative votes for set nonce request
     * @param id request id to be executed
    */
    function countSetNonceAffirmativeVotes(uint256 id) external view returns(uint256) {
        return _countGet(setNonceRequestConfirmations, id);
    }

    /**
     * @notice Cancels set nonce request if it is active 
     * @param id the id of set nonce request
    */
    function cancelSetNonceRequest(uint256 id) external onlyVoter(msg.sender) {
        require(setNonceRequests[id].status == RequestStatus.Active, "not active");
        setNonceRequests[id].status = RequestStatus.Canceled;
    }

    /**
     * @notice Approves set nonce request if it is not approved
     * @param id the id of set nonce request
    */
    function confirmSetNonceRequest(uint256 id) 
        external 
        override
        onlyBridge
        returns (bool)
    {
        require(setNonceRequests[id].status == RequestStatus.Active, "not active");
        setNonceRequests[id].status = RequestStatus.Executed;
        return true;
    }

    /**
     * @notice Allows a voter to insert a confirmation for set nonce request if it is not approved
     * @param voteType the vote type: true/false = insert/remove vote
     * @param id the id of set nonce request
    */
    function newVoteForSetNonceRequest(bool voteType, uint256 id) external {
        require(setNonceRequests[id].status == RequestStatus.Active, "not active");
        _newVoteFor(setNonceRequestConfirmations, id, voteType, RequestType.SetNonce);
    }

    /**
     * @notice Creation of set nonce request by any voter
     * @param domainId Domain ID for increasing nonce
     * @param nonce The nonce value to be set
    */
    function newSetNonceRequest(uint8 domainId, uint64 nonce)
        external
        onlyVoter(msg.sender)
        returns (uint256)
    {
        setNonceRequestCounter = setNonceRequestCounter + 1;
        setNonceRequests[setNonceRequestCounter] = SetNonceRequest({
            domainId: domainId,
            nonce: nonce,
            status: RequestStatus.Active
        });
        
        setNonceRequestConfirmations[setNonceRequestCounter][msg.sender] = true;
        emit NewVoteForRequest(RequestType.SetNonce, true, msg.sender, setNonceRequestCounter);

        return setNonceRequestCounter;
    }

    /**
     * @notice Allows setting forwarder request if it is not approved and there are enough votes
     * @param id the id of set forwarder request
    */
    function isSetForwarderAvailable(uint256 id) 
        external 
        view
        override 
        returns (address, bool)
    {
        require(setForwarderRequests[id].status == RequestStatus.Active, "not active");
        _consensus(setForwarderRequestConfirmations, id);                                
        return (setForwarderRequests[id].forwarder, setForwarderRequests[id].valid);
    }

    /**
     * @notice Counts and gets affirmative votes for set forwarder request
     * @param id request id to be executed
    */
    function countSetForwarderAffirmativeVotes(uint256 id) external view returns(uint256) {
        return _countGet(setForwarderRequestConfirmations, id);
    }

    /**
     * @notice Cancels set forwarder request if it is active
     * @param id the id of set forwarder request
    */
    function cancelSetForwarderRequest(uint256 id) external onlyVoter(msg.sender) {
        require(setForwarderRequests[id].status == RequestStatus.Active, "not active");
        setForwarderRequests[id].status = RequestStatus.Canceled;
    }

    /**
     * @notice Approves set forwarder request if it is not approved
     * @param id the id of set forwarder request
    */
    function confirmSetForwarderRequest(uint256 id) 
        external 
        onlyBridge
        override
        returns (bool)
    {
        require(setForwarderRequests[id].status == RequestStatus.Active, "not active");
        setForwarderRequests[id].status = RequestStatus.Executed;
        return true;
    }

    /**
     * @notice Allows a voter to insert a confirmation for set forwarder request if it is not approved
     * @param voteType the vote type: true/false = insert/remove vote
     * @param id the id of set forwarder request
    */
    function newVoteForSetForwarderRequest(bool voteType, uint256 id) external {
        require(setForwarderRequests[id].status == RequestStatus.Active, "not active");
        _newVoteFor(setForwarderRequestConfirmations, id, voteType, RequestType.SetForwarder);
    }

    /**
     * @notice Creation of set resorce request by any voter
     * @param forwarder Forwarder address to be added
     * @param valid Decision for the specific forwarder
    */
    function newSetForwarderRequest(address forwarder, bool valid)
        external
        onlyVoter(msg.sender)
        returns (uint256)
    {
        require(forwarder != address(0), "zero address");
        setForwarderRequestCounter = setForwarderRequestCounter + 1;
        setForwarderRequests[setForwarderRequestCounter] = SetForwarderRequest({
            forwarder: forwarder,
            valid: valid,
            status: RequestStatus.Active
        });
        
        setForwarderRequestConfirmations[setForwarderRequestCounter][msg.sender] = true;
        emit NewVoteForRequest(RequestType.SetForwarder, true, msg.sender, setForwarderRequestCounter);

        return setForwarderRequestCounter;
    }

    /**
     * @notice Allows setting generic resource request if it is not approved and there are enough votes
     * @param id the id of set generic resource request
    */
    function isSetGenericResourceAvailable(uint256 id) 
        external 
        view 
        override
        returns (address, bytes32, address, bytes4, uint256, bytes4)
    {
        require(setGenericResourceRequests[id].status == RequestStatus.Active, "not active");
        _consensus(setGenericResourceRequestConfirmations, id);                                
        return (setGenericResourceRequests[id].handlerAddress, 
                setGenericResourceRequests[id].resourceId,
                setGenericResourceRequests[id].contractAddress,
                setGenericResourceRequests[id].depositFunctionSig,
                setGenericResourceRequests[id].depositFunctionDepositerOffset,
                setGenericResourceRequests[id].executeFunctionSig);
    }

    /**
     * @notice Counts and gets affirmative votes for set generic resource request
     * @param id request id to be executed
    */
    function countSetGenericResourceAffirmativeVotes(uint256 id) external view returns(uint256) {
        return _countGet(setGenericResourceRequestConfirmations, id);
    }

    /**
     * @notice Cancels set generic resource request if it is active
     * @param id the id of set generic resource request
    */
    function cancelSetGenericResourceRequest(uint256 id) external onlyVoter(msg.sender) {
        require(setGenericResourceRequests[id].status == RequestStatus.Active, "not active");
        setGenericResourceRequests[id].status = RequestStatus.Canceled;
    }

    /**
     * @notice Approves set generic resource request if it is not approved
     * @param id the id of set generic resource request
    */
    function confirmSetGenericResourceRequest(uint256 id) 
        external
        onlyBridge 
        returns (bool)
    {
        require(setGenericResourceRequests[id].status == RequestStatus.Active, "not active");
        setGenericResourceRequests[id].status = RequestStatus.Executed;
        return true;
    }

    /** 
     * @notice Allows a voter to insert a confirmation for set generic resource request if it is not approved
     * @param voteType the vote type: true/false = insert/remove vote
     * @param id the id of set generic resource request
    */
    function newVoteForSetGenericResourceRequest(bool voteType, uint256 id) external {
        require(setGenericResourceRequests[id].status == RequestStatus.Active, "not active");
        _newVoteFor(setGenericResourceRequestConfirmations, id, voteType, RequestType.SetGenericResource);
    }

    /**
     * @notice Creation of set resorce request by any voter
     * @param handlerAddress Address of handler resource will be set for
     * @param resourceId ResourceID to be used when making deposits
     * @param contractAddress Address of contract to be called when a deposit is made and a deposited is executed
     * @param depositFunctionSig The signature of deposit function
     * @param depositFunctionDepositerOffset Depositer offset of deposit function
     * @param executeFunctionSig The signature of execute function
    */
    function newSetGenericResourceRequest(
        address handlerAddress,
        bytes32 resourceId,
        address contractAddress,
        bytes4 depositFunctionSig,
        uint256 depositFunctionDepositerOffset,
        bytes4 executeFunctionSig)
        external
        onlyVoter(msg.sender)
        returns (uint256)
    {
        require(handlerAddress != address(0) && contractAddress != address(0), "zero address");
        setGenericResourceRequestCounter = setGenericResourceRequestCounter + 1;

        setGenericResourceRequests[setGenericResourceRequestCounter] = SetGenericResourceRequest({
            handlerAddress: handlerAddress,
            resourceId: resourceId,
            contractAddress: contractAddress,
            depositFunctionSig: depositFunctionSig,
            depositFunctionDepositerOffset: depositFunctionDepositerOffset,
            executeFunctionSig: executeFunctionSig,
            status: RequestStatus.Active
        });
        
        setGenericResourceRequestConfirmations[setGenericResourceRequestCounter][msg.sender] = true;
        emit NewVoteForRequest(RequestType.SetGenericResource, true, msg.sender, setGenericResourceRequestCounter);

        return setGenericResourceRequestCounter;
    }

    /**
     * @notice Allows setting treasury request if it is not approved and there are enough votes
     * @param id the id of set treasury request
    */
    function isSetTreasuryAvailable(uint256 id) 
        external 
        view 
        override
        returns (address)
    {
        require(setTreasuryRequests[id].status == RequestStatus.Active, "not active");
        _consensus(setTreasuryRequestConfirmations, id);
        return setTreasuryRequests[id].newTreasuryAddress;
    }

    /**
     * @notice Counts and gets affirmative votes for set treasury request
     * @param id request id to be executed
    */
    function countGetSetTreasuryAffirmativeVotes(uint256 id) external view returns(uint256) {
        return _countGet(setTreasuryRequestConfirmations, id);
    }

    /**
     * @notice Cancels set treasury request if it is active
     * @param id the id of set treasury request
    */
    function cancelSetTreasuryRequest(uint256 id) external onlyVoter(msg.sender) {
        require(setTreasuryRequests[id].status == RequestStatus.Active, "not active");
        setTreasuryRequests[id].status = RequestStatus.Canceled;
    }

    /**
     * @notice Approves setting treasury request if it is not approved
     * @param id the id of set treasury request
    */
    function confirmSetTreasuryRequest(uint256 id) 
        external 
        override
        returns (bool)
    {
        require(msg.sender == erc20HandlerAddress, "not ERC20handler address");
        require(setTreasuryRequests[id].status == RequestStatus.Active, "not active");
        setTreasuryRequests[id].status = RequestStatus.Executed;
        return true;
    }

    /**
     * @notice Allows a voter to insert a confirmation for set treasury request 
     * if it is not approved and not confirmed
     * @param voteType the vote type: true/false = insert/remove vote
     * @param id the id of set treasury request
    */
    function newVoteForSetTreasuryRequest(bool voteType, uint256 id) external {
        require(setTreasuryRequests[id].status == RequestStatus.Active, "not active");
        _newVoteFor(setTreasuryRequestConfirmations, id, voteType, RequestType.SetTreasury);
    }

    /**
     * @notice Creation of set treasury request by any voter
     * @param _address new treasury address
    */
    function newSetTreasuryRequest(address _address)
        external
        onlyVoter(msg.sender)
        returns (uint256)
    {
        require(_address!= address(0), "zero address");
        setTreasuryRequestCounter = setTreasuryRequestCounter + 1;
        
        setTreasuryRequests[setTreasuryRequestCounter] = SetTreasuryRequest({
            newTreasuryAddress: _address,
            status: RequestStatus.Active
        });
        
        setTreasuryRequestConfirmations[setTreasuryRequestCounter][msg.sender] = true;
        emit NewVoteForRequest(RequestType.SetTreasury, true, msg.sender, setTreasuryRequestCounter);
        return setTreasuryRequestCounter;
    }
}
