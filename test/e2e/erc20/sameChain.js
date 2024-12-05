const TruffleAssert = require('truffle-assertions');
const Ethers = require('ethers');

const Helpers = require('../../helpers');

const DAOContract = artifacts.require("DAO");
const BridgeContract = artifacts.require("Bridge");
const ERC20MintableContract = artifacts.require("ERC20PresetMinterPauser");
const ERC20HandlerContract = artifacts.require("ERC20Handler");

contract('E2E ERC20 - Same Chain', async accounts => {
    const relayerThreshold = 2;
    const domainID = 1;

    const owner = accounts[0];
    const depositerAddress = accounts[1];
    const recipientAddress = accounts[2];
    const relayer1Address = accounts[3];
    const relayer2Address = accounts[4];
    const etherRecipientAddress = '0x0111111111111111111111111111111111111151';

    const initialTokenAmount = Ethers.utils.parseUnits("100", 6);
    const depositAmount = Ethers.utils.parseUnits("20", 6);
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
    let initialResourceIDs;
    let initialContractAddresses;
    let burnableContractAddresses;

    beforeEach(async () => {
        await Promise.all([
            BridgeContract.new(domainID, [relayer1Address, relayer2Address], relayerThreshold, 100, feeMaxValue, feePercent).then(instance => BridgeInstance = instance),
            ERC20MintableContract.new("token", "TOK").then(instance => ERC20MintableInstance = instance)
        ]);

        DAOInstance = await DAOContract.new(BridgeInstance.address, someAddress);
        await BridgeInstance.setDAOContractInitial(DAOInstance.address);
        
        resourceID = Helpers.createResourceID(ERC20MintableInstance.address, domainID);
    
        initialResourceIDs = [resourceID];
        initialContractAddresses = [ERC20MintableInstance.address];
        burnableContractAddresses = [];

        ERC20HandlerInstance = await ERC20HandlerContract.new(BridgeInstance.address, someAddress);
        await ERC20HandlerInstance.setDAOContractInitial(DAOInstance.address);

        await ERC20MintableInstance.mint(depositerAddress, initialTokenAmount);
        await DAOInstance.newSetResourceRequest(ERC20HandlerInstance.address, resourceID, ERC20MintableInstance.address);
        await BridgeInstance.adminSetResource(1);
        
        await DAOInstance.newChangeFeeRequest(ERC20MintableInstance.address, domainID, basicFee, minAmount, maxAmount);
        await BridgeInstance.adminChangeFee(1);

        await ERC20MintableInstance.approve(ERC20HandlerInstance.address, depositAmount, { from: depositerAddress });

        depositData = Helpers.createERCDepositData(depositAmount.toNumber(), 20, recipientAddress);
        depositProposalData = Helpers.createERCDepositData(depositAmount.toNumber(), 20, recipientAddress)
        depositProposalDataHash = Ethers.utils.keccak256(ERC20HandlerInstance.address + depositProposalData.substr(2));

        depositDataForEther = Helpers.createERCDepositData(depositAmount.toNumber(), 20, etherRecipientAddress);
        depositProposalDataForEther = Helpers.createERCDepositData(depositAmount.toNumber(), 20, etherRecipientAddress)
        depositProposalDataHashForEther = Ethers.utils.keccak256(ERC20HandlerInstance.address + depositProposalData.substr(2));
    });

    it("handler receive ether returns same balance", async () => {
        const erc20HandlerBalanceBefore = await web3.eth.getBalance(ERC20HandlerInstance.address);
        assert.strictEqual(erc20HandlerBalanceBefore, '0');

        const etherTransfer = Ethers.utils.parseUnits("1.0", 18);
        await web3.eth.sendTransaction({
            from: owner,
            to: ERC20HandlerInstance.address,
            value: etherTransfer
        });
        
        const erc20HandlerBalanceAfter = await web3.eth.getBalance(ERC20HandlerInstance.address);
        assert.strictEqual(erc20HandlerBalanceAfter.toString(), etherTransfer.toString());
    });

    it("[sanity] depositerAddress' balance should be equal to initialTokenAmount", async () => {
        const depositerBalance = await ERC20MintableInstance.balanceOf(depositerAddress);
        assert.strictEqual(depositerBalance.toNumber(), initialTokenAmount.toNumber());
    });

    it("[sanity] ERC20HandlerInstance.address should have an allowance of depositAmount from depositerAddress", async () => {
        const handlerAllowance = await ERC20MintableInstance.allowance(depositerAddress, ERC20HandlerInstance.address);
        assert.strictEqual(handlerAllowance.toNumber(), depositAmount.toNumber());
    });

    it("depositAmount of Destination ERC20 should be transferred to recipientAddress and not sends native tokens", async () => {
        const recipientEthBalanceBefore = await web3.eth.getBalance(recipientAddress)
        assert.strictEqual(recipientEthBalanceBefore.toString(), Ethers.utils.parseUnits("100", 18).toString());

        const erc20HandlerBalanceBefore = await web3.eth.getBalance(ERC20HandlerInstance.address);
        assert.strictEqual(erc20HandlerBalanceBefore, '0');

        const etherTransfer = Ethers.utils.parseUnits("10", 18);
        await web3.eth.sendTransaction({
            from: owner,
            to: ERC20HandlerInstance.address,
            value: etherTransfer
        });
        
        const erc20HandlerBalanceAfter = await web3.eth.getBalance(ERC20HandlerInstance.address);
        assert.strictEqual(erc20HandlerBalanceAfter.toString(), etherTransfer.toString());

        // depositerAddress makes initial deposit of depositAmount
        await TruffleAssert.passes(BridgeInstance.deposit(
            domainID,
            resourceID,
            depositData,
            { from: depositerAddress }
        ));

        // Handler should have a balance of depositAmount
        const handlerBalance = await ERC20MintableInstance.balanceOf(ERC20HandlerInstance.address);
        assert.strictEqual(handlerBalance.toNumber(), depositAmount.toNumber() - basicFee.toNumber());
        
        // relayer1 creates the deposit proposal
        await TruffleAssert.passes(BridgeInstance.voteProposal(
            domainID,
            domainID,
            expectedDepositNonce,
            resourceID,
            depositProposalData,
            { from: relayer1Address }
        ));

        // relayer2 votes in favor of the deposit proposal
        // because the relayerThreshold is 2, the deposit proposal will go
        // into a finalized state
        // and then automatically executes the proposal
        await TruffleAssert.passes(BridgeInstance.voteProposal(
            domainID,
            domainID,
            expectedDepositNonce,
            resourceID,
            depositProposalData,
            { from: relayer2Address }
        ));

        // Assert ERC20 balance was transferred from depositerAddress
        const depositerBalance = await ERC20MintableInstance.balanceOf(depositerAddress);
        assert.strictEqual(depositerBalance.toNumber(), initialTokenAmount.toNumber() - depositAmount.toNumber());

        // // Assert ERC20 balance was transferred to recipientAddress
        const recipientBalance = await ERC20MintableInstance.balanceOf(recipientAddress);
        assert.strictEqual(recipientBalance.toNumber(), depositAmount.toNumber() - basicFee.toNumber());

        const recipientEthBalanceAfter = await web3.eth.getBalance(recipientAddress)
        assert.strictEqual(recipientEthBalanceAfter.toString(), Ethers.utils.parseUnits("100", 18).toString());
    });

    it("depositAmount of Destination ERC20 should be transferred to recipientAddress and sends native tokens", async () => {
        const recipientEthBalanceBefore = await web3.eth.getBalance(etherRecipientAddress);
        assert.strictEqual(recipientEthBalanceBefore.toString(), '0');

        const erc20HandlerBalanceBefore = await web3.eth.getBalance(ERC20HandlerInstance.address);
        assert.strictEqual(erc20HandlerBalanceBefore, '0');

        const etherTransfer = Ethers.utils.parseUnits("10", 18);
        await web3.eth.sendTransaction({
            from: owner,
            to: ERC20HandlerInstance.address,
            value: etherTransfer
        });
        
        const erc20HandlerBalanceAfter = await web3.eth.getBalance(ERC20HandlerInstance.address);
        assert.strictEqual(erc20HandlerBalanceAfter.toString(), etherTransfer.toString());

        // depositerAddress makes initial deposit of depositAmount
        await TruffleAssert.passes(BridgeInstance.deposit(
            domainID,
            resourceID,
            depositDataForEther,
            { from: depositerAddress }
        ));

        // Handler should have a balance of depositAmount
        const handlerBalance = await ERC20MintableInstance.balanceOf(ERC20HandlerInstance.address);
        assert.strictEqual(handlerBalance.toNumber(), depositAmount.toNumber() - basicFee.toNumber());
        
        // relayer1 creates the deposit proposal
        await TruffleAssert.passes(BridgeInstance.voteProposal(
            domainID,
            domainID,
            expectedDepositNonce,
            resourceID,
            depositProposalDataForEther,
            { from: relayer1Address }
        ));

        // relayer2 votes in favor of the deposit proposal
        // because the relayerThreshold is 2, the deposit proposal will go
        // into a finalized state
        // and then automatically executes the proposal
        await TruffleAssert.passes(BridgeInstance.voteProposal(
            domainID,
            domainID,
            expectedDepositNonce,
            resourceID,
            depositProposalDataForEther,
            { from: relayer2Address }
        ));

        // Assert ERC20 balance was transferred from depositerAddress
        const depositerBalance = await ERC20MintableInstance.balanceOf(depositerAddress);
        assert.strictEqual(depositerBalance.toNumber(), initialTokenAmount.toNumber() - depositAmount.toNumber());

        // // Assert ERC20 balance was transferred to recipientAddress
        const recipientBalance = await ERC20MintableInstance.balanceOf(etherRecipientAddress);
        assert.strictEqual(recipientBalance.toNumber(), depositAmount.toNumber() - basicFee.toNumber());

        const recipientEthBalanceAfter = await web3.eth.getBalance(etherRecipientAddress)
        assert.strictEqual(recipientEthBalanceAfter.toString(), Ethers.utils.parseUnits("0.001", 18).toString());
    });
});
