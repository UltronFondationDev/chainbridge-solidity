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

contract('Bridge - [deposit - ERC20]', async (accounts) => {
    const originDomainID = 1;
    const destinationDomainID = 2;
    const relayerThreshold = 0;
    const depositerAddress = accounts[1];
    const recipientAddress = accounts[2];

    const originChainInitialTokenAmount = Ethers.utils.parseUnits("100", 6);
    const depositAmount = Ethers.utils.parseUnits("20", 6);
    const depositAmountApprove = Ethers.utils.parseUnits("40", 6);

    const someAddress = "0xcafecafecafecafecafecafecafecafecafecafe";

    const expectedDepositNonce = 1;
    const feeMaxValue = 10000;
    const feePercent = 10;

    const basicFee = Ethers.utils.parseUnits("0.9", 6);
    const minAmount = Ethers.utils.parseUnits("10", 6);
    const maxAmount = Ethers.utils.parseUnits("1000000", 6);
    
    let DAOInstance;
    let BridgeInstance;
    let OriginERC20MintableInstance;
    let OriginERC20HandlerInstance;
    let depositData;

    beforeEach(async () => {
        await Promise.all([
            ERC20MintableContract.new("token", "TOK").then(instance => OriginERC20MintableInstance = instance),
            BridgeInstance = await BridgeContract.new(originDomainID, [], relayerThreshold, 100, feeMaxValue, feePercent)
        ]);
        
        DAOInstance = await DAOContract.new(BridgeInstance.address, someAddress);
        await BridgeInstance.setDAOContractInitial(DAOInstance.address);

        resourceID = Helpers.createResourceID(OriginERC20MintableInstance.address, originDomainID);

        OriginERC20HandlerInstance = await ERC20HandlerContract.new(BridgeInstance.address, someAddress);
        await OriginERC20HandlerInstance.setDAOContractInitial(DAOInstance.address);

        await DAOInstance.newSetResourceRequest(OriginERC20HandlerInstance.address, resourceID, OriginERC20MintableInstance.address);
        await BridgeInstance.adminSetResource(1);
        await OriginERC20MintableInstance.mint(depositerAddress, originChainInitialTokenAmount);

        await OriginERC20MintableInstance.approve(OriginERC20HandlerInstance.address, depositAmountApprove, { from: depositerAddress });

        depositData = Helpers.createERCDepositData(
            depositAmount,
            20,
            recipientAddress);
        
        await DAOInstance.newChangeFeeRequest(OriginERC20MintableInstance.address, destinationDomainID, basicFee, minAmount, maxAmount);
        await BridgeInstance.adminChangeFee(1);
    });

    it("[sanity] test depositerAddress' balance", async () => {
        const originChainDepositerBalance = await OriginERC20MintableInstance.balanceOf(depositerAddress);
        assert.strictEqual(originChainDepositerBalance.toNumber(), originChainInitialTokenAmount.toNumber());
    });

    it("[sanity] test OriginERC20HandlerInstance.address' allowance", async () => {
        const originChainHandlerAllowance = await OriginERC20MintableInstance.allowance(depositerAddress, OriginERC20HandlerInstance.address);
        assert.strictEqual(originChainHandlerAllowance.toNumber(), depositAmountApprove.toNumber());
    });

    it('ERC20 deposit can be made', async () => {
        await TruffleAssert.passes(BridgeInstance.deposit(
            destinationDomainID,
            resourceID,
            depositData,
            { from: depositerAddress }
        ));
    });

    it('_depositCounts should be increments from 0 to 1', async () => {
        await BridgeInstance.deposit(
            destinationDomainID,
            resourceID,
            depositData,
            { from: depositerAddress }
        );

        const depositCount = await BridgeInstance._depositCounts.call(destinationDomainID);
        assert.strictEqual(depositCount.toNumber(), expectedDepositNonce);
    });

    it('ERC20 deposit fails if amount < min Amount', async () => {
        const minDepositData = Helpers.createERCDepositData(
            20,
            20,
            recipientAddress);

        await TruffleAssert.reverts(BridgeInstance.deposit(
            destinationDomainID,
            resourceID,
            minDepositData,
            { from: depositerAddress }
        ), "amount < min amount");
    });

    it('ERC20 deposit fails if amount > max Amount', async () => {
        const maxDepositData = Helpers.createERCDepositData(
            Ethers.utils.parseUnits("1000001", 6),
            20,
            recipientAddress);

        await TruffleAssert.reverts(BridgeInstance.deposit(
            destinationDomainID,
            resourceID,
            maxDepositData,
            { from: depositerAddress }
        ), "amount > max amount");
    });

    it('ERC20 can be deposited with correct balances', async () => {
        await BridgeInstance.deposit(
            destinationDomainID,
            resourceID,
            depositData,
            { from: depositerAddress }
        );

        const originChainDepositerBalance = await OriginERC20MintableInstance.balanceOf(depositerAddress);
        assert.strictEqual(originChainDepositerBalance.toNumber(), originChainInitialTokenAmount.toNumber() - depositAmount.toNumber());

        const originChainHandlerBalance = await OriginERC20MintableInstance.balanceOf(OriginERC20HandlerInstance.address);
        assert.strictEqual(originChainHandlerBalance.toNumber(), depositAmount.toNumber() - basicFee.toNumber());

        const originTreasuryBalance = await OriginERC20MintableInstance.balanceOf(someAddress);
        assert.strictEqual(originTreasuryBalance.toNumber(), basicFee.toNumber());
    });

    it('Deposit event is fired with expected value', async () => {
        let depositTx = await BridgeInstance.deposit(
            destinationDomainID,
            resourceID,
            depositData,
            { from: depositerAddress }
        );

        TruffleAssert.eventEmitted(depositTx, 'Deposit', (event) => {
            return event.destinationDomainID.toNumber() === destinationDomainID &&
                event.resourceID === resourceID.toLowerCase() &&
                event.depositNonce.toNumber() === expectedDepositNonce
        });

        depositTx = await BridgeInstance.deposit(
            destinationDomainID,
            resourceID,
            depositData,
            { from: depositerAddress }
        );

        TruffleAssert.eventEmitted(depositTx, 'Deposit', (event) => {
            return event.destinationDomainID.toNumber() === destinationDomainID &&
                event.resourceID === resourceID.toLowerCase() &&
                event.depositNonce.toNumber() === expectedDepositNonce + 1
        });
    });

    it('deposit requires resourceID that is mapped to a handler', async () => {
        await TruffleAssert.reverts(BridgeInstance.deposit(destinationDomainID, '0x0', depositData, { from: depositerAddress }), "resourceID not mapped to handler");
    });
});
