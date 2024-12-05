/**
 * Copyright 2020 ChainSafe Systems
 * SPDX-License-Identifier: LGPL-3.0-only
 */
const TruffleAssert = require('truffle-assertions');
const Ethers = require('ethers');

const Helpers = require('../helpers');

const DAOContract = artifacts.require("DAO");
const BridgeContract = artifacts.require("Bridge");
const ERC20MintableContract = artifacts.require("ERC20PresetMinterPauser");
const ERC20HandlerContract = artifacts.require("ERC20Handler");
const GenericHandlerContract = artifacts.require('GenericHandler');
const CentrifugeAssetContract = artifacts.require("CentrifugeAsset");

// This test does NOT include all getter methods, just 
// getters that should work with only the constructor called
contract('Bridge - [admin]', async accounts => {
    const domainID = 1;
    const initialRelayers = accounts.slice(0, 3);
    const initialRelayerThreshold = 2;

    const expectedBridgeAdmin = accounts[0];
    const someAddress = "0xcafecafecafecafecafecafecafecafecafecafe";
    const bytes32 = "0x0";
    const feeMaxValue = 10000;
    const feePercent = 10;
    let ADMIN_ROLE;
    
    let BridgeInstance;
    let DAOInstance;

    let withdrawData = '';

    beforeEach(async () => {
        BridgeInstance = await BridgeContract.new(domainID, initialRelayers, initialRelayerThreshold, 0, feeMaxValue, feePercent);
        ADMIN_ROLE = await BridgeInstance.DEFAULT_ADMIN_ROLE();
        DAOInstance = await DAOContract.new(BridgeInstance.address, someAddress);
        await BridgeInstance.setDAOContractInitial(DAOInstance.address);
    });
    // Testing pausable methods

    it('Bridge should not be paused', async () => {
        assert.isFalse(await BridgeInstance.paused());
    });

    it('Bridge should be paused', async () => {
        await DAOInstance.newPauseStatusRequest(true);
        await TruffleAssert.passes(BridgeInstance.adminPauseStatusTransfers(1));
        assert.isTrue(await BridgeInstance.paused());
    });

    it('Bridge should be unpaused after being paused', async () => {
        await DAOInstance.newPauseStatusRequest(true);
        await TruffleAssert.passes(BridgeInstance.adminPauseStatusTransfers(1));
        assert.isTrue(await BridgeInstance.paused());
        await DAOInstance.newPauseStatusRequest(false);
        await TruffleAssert.passes(BridgeInstance.adminPauseStatusTransfers(2));
        assert.isFalse(await BridgeInstance.paused());
    });

    // Testing relayer methods

    it('_relayerThreshold should be initialRelayerThreshold', async () => {
        assert.equal(await BridgeInstance._relayerThreshold.call(), initialRelayerThreshold);
    });

    it('_relayerThreshold should be initialRelayerThreshold', async () => {
        const newRelayerThreshold = 1;
        await DAOInstance.newChangeRelayerThresholdRequest(newRelayerThreshold);
        await TruffleAssert.passes(BridgeInstance.adminChangeRelayerThreshold(1));
        assert.equal(await BridgeInstance._relayerThreshold.call(), newRelayerThreshold);
    });

    it('newRelayer should be added as a relayer', async () => {
        const newRelayer = accounts[4];
        await TruffleAssert.passes(BridgeInstance.adminAddRelayer(newRelayer));
        assert.isTrue(await BridgeInstance.isRelayer(newRelayer));
    });

    it('newRelayer should be removed as a relayer after being added', async () => {
        const newRelayer = accounts[4];
        await TruffleAssert.passes(BridgeInstance.adminAddRelayer(newRelayer));
        assert.isTrue(await BridgeInstance.isRelayer(newRelayer))
        await TruffleAssert.passes(BridgeInstance.adminRemoveRelayer(newRelayer));
        assert.isFalse(await BridgeInstance.isRelayer(newRelayer));
    });

    it('existingRelayer should not be able to be added as a relayer', async () => {
        const existingRelayer = accounts[1];
        await TruffleAssert.reverts(BridgeInstance.adminAddRelayer(existingRelayer));
        assert.isTrue(await BridgeInstance.isRelayer(existingRelayer));
    }); 

    it('nonRelayerAddr should not be able to be added as a relayer', async () => {
        const nonRelayerAddr = accounts[4];
        await TruffleAssert.reverts(BridgeInstance.adminRemoveRelayer(nonRelayerAddr));
        assert.isFalse(await BridgeInstance.isRelayer(nonRelayerAddr));
    });

    // Testing ownership methods

    it('Bridge admin should be expectedBridgeAdmin', async () => {
        assert.isTrue(await BridgeInstance.hasRole(ADMIN_ROLE, expectedBridgeAdmin));
    });

    it('Bridge admin should be changed to expectedBridgeAdmin', async () => {
        const expectedBridgeAdmin2 = accounts[1];
        await DAOInstance.newOwnerChangeRequest(expectedBridgeAdmin2);
        await TruffleAssert.passes(BridgeInstance.renounceAdmin(1))
        assert.isTrue(await BridgeInstance.hasRole(ADMIN_ROLE, expectedBridgeAdmin2));
    });

    // Set Handler Address

    it('Should set a Resource ID for handler address', async () => {
        const ERC20MintableInstance = await ERC20MintableContract.new("token", "TOK");
        const resourceID = Helpers.createResourceID(ERC20MintableInstance.address, domainID);
        const ERC20HandlerInstance = await ERC20HandlerContract.new(BridgeInstance.address, someAddress);

        assert.equal(await BridgeInstance._resourceIDToHandlerAddress.call(resourceID), Ethers.constants.AddressZero);
        await DAOInstance.newSetResourceRequest(ERC20HandlerInstance.address, resourceID, ERC20MintableInstance.address);
        await TruffleAssert.passes(BridgeInstance.adminSetResource(1));
        assert.equal(await BridgeInstance._resourceIDToHandlerAddress.call(resourceID), ERC20HandlerInstance.address);
    });

    // Set resource ID

    it('Should set a ERC20 Resource ID and contract address', async () => {
        const ERC20MintableInstance = await ERC20MintableContract.new("token", "TOK");
        const resourceID = Helpers.createResourceID(ERC20MintableInstance.address, domainID);
        const ERC20HandlerInstance = await ERC20HandlerContract.new(BridgeInstance.address, someAddress);
        await ERC20HandlerInstance.setDAOContractInitial(DAOInstance.address);
        
        await DAOInstance.newSetResourceRequest(ERC20HandlerInstance.address, resourceID, ERC20MintableInstance.address);
        await TruffleAssert.passes(BridgeInstance.adminSetResource(1));
        assert.equal(await ERC20HandlerInstance._resourceIDToTokenContractAddress.call(resourceID), ERC20MintableInstance.address);
        assert.equal(await ERC20HandlerInstance._tokenContractAddressToResourceID.call(ERC20MintableInstance.address), resourceID.toLowerCase());
    });

    // Set Generic Resource

    it('Should set a Generic Resource ID and contract address', async () => {
        const CentrifugeAssetInstance = await CentrifugeAssetContract.new();
        const resourceID = Helpers.createResourceID(CentrifugeAssetInstance.address, domainID);
        const GenericHandlerInstance = await GenericHandlerContract.new(BridgeInstance.address);

        await DAOInstance.newSetGenericResourceRequest(GenericHandlerInstance.address, resourceID, CentrifugeAssetInstance.address, '0x00000000', 0, '0x00000000');
        await TruffleAssert.passes(BridgeInstance.adminSetGenericResource(1));
        assert.equal(await GenericHandlerInstance._resourceIDToContractAddress.call(resourceID), CentrifugeAssetInstance.address);
        assert.equal(await GenericHandlerInstance._contractAddressToResourceID.call(CentrifugeAssetInstance.address), resourceID.toLowerCase());
    });

    // Set burnable

    it('Should set ERC20MintableInstance.address as burnable', async () => {
        const ERC20MintableInstance = await ERC20MintableContract.new("token", "TOK");
        const resourceID = Helpers.createResourceID(ERC20MintableInstance.address, domainID);
        const ERC20HandlerInstance = await ERC20HandlerContract.new(BridgeInstance.address, someAddress);

        await DAOInstance.newSetResourceRequest(ERC20HandlerInstance.address, resourceID, ERC20MintableInstance.address);
        await DAOInstance.newSetBurnableRequest(ERC20HandlerInstance.address, ERC20MintableInstance.address);
        await TruffleAssert.passes(BridgeInstance.adminSetResource(1));
        await TruffleAssert.passes(BridgeInstance.adminSetBurnable(1));
        assert.isTrue(await ERC20HandlerInstance._burnList.call(ERC20MintableInstance.address));
    });

    // Set fee percent

    it('Should set fee percent', async () => {
        await DAOInstance.newChangeFeePercentRequest(1000, 1);
        await BridgeInstance.adminChangeFeePercent(1);

        assert.equal(await BridgeInstance.getFeeMaxValue(), "1000");
        assert.equal(await BridgeInstance.getFeePercent(), "1");
    });

    it('Should not set the same values', async () => {
        await DAOInstance.newChangeFeePercentRequest(feeMaxValue, feePercent);
        await TruffleAssert.reverts(BridgeInstance.adminChangeFeePercent(1), "Current fee percent values = new fee percent");
    });

    it('Should not set fee percent higher then fee max value', async () => {
        await DAOInstance.newChangeFeePercentRequest(10, 10000);
        await TruffleAssert.reverts(BridgeInstance.adminChangeFeePercent(1), "new feePercent >= new feeMaxValue");
    });

    // Set fee 

    it('Should set fee per token value', async () => {
        const tokenAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
        const chainId = 0x1;
        const basicFee = Ethers.utils.parseUnits("0.9", 6);
        const minAmount = Ethers.utils.parseUnits("10", 6);
        const maxAmount = Ethers.utils.parseUnits("1000000", 6);

        await DAOInstance.newChangeFeeRequest(tokenAddress, chainId, basicFee, minAmount, maxAmount);
        await BridgeInstance.adminChangeFee(1);
        
        const res = await BridgeInstance.getFee(tokenAddress, chainId);
        const {0: resFee, 1: resMin, 2: resMax} = res;
        assert.equal(resFee.toString(), basicFee.toString());
        assert.equal(resMin.toString(), minAmount.toString());
        assert.equal(resMax.toString(), maxAmount.toString());
    });

    it('Should not set the same fee values', async () => {
        const tokenAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
        const chainId = 0x1;
        const basicFee = Ethers.utils.parseUnits("0.9", 6);
        const minAmount = Ethers.utils.parseUnits("10", 6);
        const maxAmount = Ethers.utils.parseUnits("1000000", 6);

        await DAOInstance.newChangeFeeRequest(tokenAddress, chainId, basicFee, minAmount, maxAmount);
        await BridgeInstance.adminChangeFee(1);
        
        await DAOInstance.newChangeFeeRequest(tokenAddress, chainId, basicFee, minAmount, maxAmount);
        await TruffleAssert.reverts(BridgeInstance.adminChangeFee(2), "Current fee = new fee");
    });

    it('Should not set fee when token address is zero address', async () => {
        const chainId = 0x1;
        const basicFee = Ethers.utils.parseUnits("0.9", 6);
        const minAmount = Ethers.utils.parseUnits("10", 6);
        const maxAmount = Ethers.utils.parseUnits("1000000", 6);
        await TruffleAssert.reverts(DAOInstance.newChangeFeeRequest(Ethers.constants.AddressZero, chainId, basicFee, minAmount, maxAmount), "zero address");
    });

    it('Should not set fee when chain id <= 0', async () => {
        const tokenAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
        const basicFee = Ethers.utils.parseUnits("0.9", 6);
        const minAmount = Ethers.utils.parseUnits("10", 6);
        const maxAmount = Ethers.utils.parseUnits("1000000", 6);
        await TruffleAssert.reverts(DAOInstance.newChangeFeeRequest(tokenAddress, 0, basicFee, minAmount, maxAmount), "zero chain Id");
    });

    it('Should not set fee when min/max amounts <= 0', async () => {
        const tokenAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
        const chainId = 0x1;
        const basicFee = Ethers.utils.parseUnits("0.9", 6);
        await TruffleAssert.reverts(DAOInstance.newChangeFeeRequest(tokenAddress, chainId, basicFee, 0, 0), "new min/max amount <= 0");
    });

    it('Should not set fee when min amount >= max amount', async () => {
        const tokenAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
        const chainId = 0x1;
        const basicFee = Ethers.utils.parseUnits("0.9", 6);
        const minAmount = Ethers.utils.parseUnits("10", 6);
        const maxAmount = Ethers.utils.parseUnits("1000000", 6);
        await TruffleAssert.reverts(DAOInstance.newChangeFeeRequest(tokenAddress, chainId, basicFee, maxAmount, minAmount), "max amount <= min amount");
    });

    // Withdraw

    it('Should withdraw funds', async () => {
        const numTokens = 10;
        const tokenOwner = accounts[0];
        
        let ownerBalance;
        let handlerBalance;

        const ERC20MintableInstance = await ERC20MintableContract.new("token", "TOK");
        const resourceID = Helpers.createResourceID(ERC20MintableInstance.address, domainID);
        const ERC20HandlerInstance = await ERC20HandlerContract.new(BridgeInstance.address, someAddress);

        await DAOInstance.newSetResourceRequest(ERC20HandlerInstance.address, resourceID, ERC20MintableInstance.address);
        await TruffleAssert.passes(BridgeInstance.adminSetResource(1));

        await ERC20MintableInstance.mint(tokenOwner, numTokens);
        ownerBalance = await ERC20MintableInstance.balanceOf(tokenOwner);
        assert.equal(ownerBalance, numTokens);
        
        await ERC20MintableInstance.transfer(ERC20HandlerInstance.address, numTokens);

        ownerBalance = await ERC20MintableInstance.balanceOf(tokenOwner);
        assert.equal(ownerBalance, 0);
        handlerBalance = await ERC20MintableInstance.balanceOf(ERC20HandlerInstance.address);
        assert.equal(handlerBalance, numTokens);

        withdrawData = Helpers.createERCWithdrawData(ERC20MintableInstance.address, tokenOwner, numTokens);

        await DAOInstance.newWithdrawRequest(ERC20HandlerInstance.address, withdrawData);
        await BridgeInstance.adminWithdraw(1);
        ownerBalance = await ERC20MintableInstance.balanceOf(tokenOwner);
        assert.equal(ownerBalance, numTokens);
    });

    // Set nonce

    it('Should set nonce', async () => {
        const nonce = 3;
        await DAOInstance.newSetNonceRequest(domainID, nonce);
        await BridgeInstance.adminSetDepositNonce(1);
        const nonceAfterSet = await BridgeInstance._depositCounts.call(domainID);
        assert.equal(nonceAfterSet, nonce);
    });


    it('Should not allow for decrements of the nonce', async () => {
        const currentNonce = 3;
        await DAOInstance.newSetNonceRequest(domainID, currentNonce);
        await BridgeInstance.adminSetDepositNonce(1);
        const newNonce = 2;
        await DAOInstance.newSetNonceRequest(domainID, newNonce);
        await TruffleAssert.reverts(BridgeInstance.adminSetDepositNonce(2), "Does not allow decrements of the nonce");
    });
});
