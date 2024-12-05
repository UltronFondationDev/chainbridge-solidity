const TruffleAssert = require('truffle-assertions');
const Ethers = require('ethers');

const Helpers = require('../helpers');

const DAOContract = artifacts.require("DAO");
const BridgeContract = artifacts.require("Bridge");
const ERC20MintableContract = artifacts.require("ERC20PresetMinterPauser");
const ERC20HandlerContract = artifacts.require("HandlerRevert");

contract('Bridge - [execute - FailedHandlerExecution]', async accounts => {
    const relayerThreshold = 2;
    const domainID = 1;
    const depositerAddress = accounts[1];
    const recipientAddress = accounts[2];
    const relayer1Address = accounts[3];
    const relayer2Address = accounts[4];

    const initialTokenAmount = Ethers.utils.parseUnits("100", 6);
    const depositAmount = Ethers.utils.parseUnits("10", 6);
    const expectedDepositNonce = 1;

    const someAddress = "0xcafecafecafecafecafecafecafecafecafecafe";

    const feeMaxValue = 10000;
    const feePercent = 10;

    const basicFee = Ethers.utils.parseUnits("0.9", 6);
    const minAmount = Ethers.utils.parseUnits("10", 6);
    const maxAmount = Ethers.utils.parseUnits("1000000", 6);

    let DAOInstance;
    let BridgeInstance;
    let ERC20MintableInstance;
    let ERC20HandlerInstance;

    let resourceID;
    let depositData;
    let depositProposalData;
    let depositProposalDataHash;

    const STATUS = {
        Inactive : '0',
        Active : '1',
        Passed : '2',
        Executed : '3',
        Cancelled : '4'
    }

    beforeEach(async () => {
        await Promise.all([
            BridgeContract.new(domainID, [relayer1Address, relayer2Address], relayerThreshold, 100, feeMaxValue, feePercent).then(instance => BridgeInstance = instance),
            ERC20MintableContract.new("token", "TOK").then(instance => ERC20MintableInstance = instance)
        ]);

        DAOInstance = await DAOContract.new(BridgeInstance.address, someAddress);
        await BridgeInstance.setDAOContractInitial(DAOInstance.address);
        
        resourceID = Helpers.createResourceID(ERC20MintableInstance.address, domainID);
    
        await Promise.all([
            ERC20HandlerContract.new(BridgeInstance.address, someAddress).then(instance => ERC20HandlerInstance = instance),
        ]);        

        await ERC20MintableInstance.mint(depositerAddress, initialTokenAmount);
        await DAOInstance.newSetResourceRequest(ERC20HandlerInstance.address, resourceID, ERC20MintableInstance.address);
        await BridgeInstance.adminSetResource(1);
        
        await ERC20MintableInstance.approve(ERC20HandlerInstance.address, depositAmount, { from: depositerAddress });

        await DAOInstance.newChangeFeeRequest(ERC20MintableInstance.address, domainID, basicFee, minAmount, maxAmount);
        await BridgeInstance.adminChangeFee(1);

        depositData = Helpers.createERCDepositData(depositAmount, 20, recipientAddress)
        depositProposalData = Helpers.createERCDepositData(depositAmount, 20, recipientAddress)
        depositProposalDataHash = Ethers.utils.keccak256(ERC20HandlerInstance.address + depositProposalData.substr(2));
    });

    it("Should revert if handler execute is reverted", async () => {
        const revertOnFail = true;
        
        await TruffleAssert.passes(BridgeInstance.voteProposal(
            domainID,
            domainID,
            expectedDepositNonce,
            resourceID,
            depositProposalData,
            { from: relayer1Address }
        ));

        await TruffleAssert.passes(BridgeInstance.voteProposal(
            domainID,
            domainID,
            expectedDepositNonce,
            resourceID,
            depositProposalData,
            { from: relayer2Address }
        ));

        const depositProposalBeforeFailedExecute = await BridgeInstance.getProposal(
            domainID, expectedDepositNonce, depositProposalDataHash);

        await TruffleAssert.reverts(BridgeInstance.executeProposal(
            domainID,
            domainID,
            expectedDepositNonce,
            depositProposalData,
            resourceID,
            revertOnFail,
            { from: relayer2Address }
        ));

        const depositProposalAfterFailedExecute = await BridgeInstance.getProposal(
            domainID, expectedDepositNonce, depositProposalDataHash);

        assert.deepInclude(Object.assign({}, depositProposalBeforeFailedExecute), depositProposalAfterFailedExecute);
    });

    it("Should not revert even though handler execute is reverted if the proposal's status is changed to Passed during voting. FailedHandlerExecution event should be emitted with expected values. Proposal status still stays on Passed", async () => {        
 
        await TruffleAssert.passes(BridgeInstance.voteProposal(
            domainID,
            domainID,
            expectedDepositNonce,
            resourceID,
            depositProposalData,
            { from: relayer1Address }
        ));

        const voteWithExecuteTx = await BridgeInstance.voteProposal(
            domainID,
            domainID,
            expectedDepositNonce,
            resourceID,
            depositProposalData,
            { from: relayer2Address }
        );

        TruffleAssert.eventEmitted(voteWithExecuteTx, 'FailedHandlerExecution', (event) => {   
            console.log(`${event.lowLevelData !== null} ${event.lowLevelData !== 'null'}`)
            if(!event.lowLevelData) {
                return true;
            }
            else {
                return Ethers.utils.parseBytes32String('0x' + event.lowLevelData.slice(-64)) === 'Something bad happened'
            }
        });

        const depositProposalAfterFailedExecute = await BridgeInstance.getProposal(
            domainID, expectedDepositNonce, depositProposalDataHash);
        
        assert.strictEqual(depositProposalAfterFailedExecute._status, STATUS.Passed);
    });

    it("Vote proposal should be reverted if handler execution is reverted and proposal status was on Passed for vote", async () => {

        await TruffleAssert.passes(BridgeInstance.voteProposal(
            domainID,
            domainID,
            expectedDepositNonce,
            resourceID,
            depositProposalData,
            { from: relayer1Address }
        ));

        // After this vote, automatically executes the proposqal but handler execute is reverted. So proposal still stays on Passed after this vote.
        await TruffleAssert.passes(BridgeInstance.voteProposal(
            domainID,
            domainID,
            expectedDepositNonce,
            resourceID,
            depositProposalData,
            { from: relayer2Address }
        ));

        await TruffleAssert.reverts(BridgeInstance.voteProposal(
            domainID,
            domainID,
            expectedDepositNonce,
            resourceID,
            depositProposalData,
            { from: relayer2Address }
        ), 'Something bad happened');
    });

    it("Should execute the proposal successfully if the handler has enough amount after the last execution is reverted", async () => {
        await TruffleAssert.passes(BridgeInstance.voteProposal(
            domainID,
            domainID,
            expectedDepositNonce,
            resourceID,
            depositProposalData,
            { from: relayer1Address }
        ));

        // After this vote, automatically executes the proposal but the execution is reverted.
        // But the whole transaction is not reverted and proposal still be on Passed status.
        await TruffleAssert.passes(BridgeInstance.voteProposal(
            domainID,
            domainID,
            expectedDepositNonce,
            resourceID,
            depositProposalData,
            { from: relayer2Address }
        ));

        // Some virtual operation so that the handler can have enough conditions to be executed.
        await ERC20HandlerInstance.virtualIncreaseBalance(1);

        // Should execute directly in this vote.
        const voteWithExecuteTx = await BridgeInstance.voteProposal(
            domainID,
            domainID,
            expectedDepositNonce,
            resourceID,
            depositProposalData,
            { from: relayer2Address }
        );

        TruffleAssert.eventEmitted(voteWithExecuteTx, 'ProposalEvent', (event) => {
            return event.originDomainID.toNumber() === domainID &&
                event.depositNonce.toNumber() === expectedDepositNonce &&
                event.status.toString() === STATUS.Executed &&
                event.dataHash === depositProposalDataHash
        });
    })
});
