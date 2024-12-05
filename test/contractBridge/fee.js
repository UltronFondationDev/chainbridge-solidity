/**
 * Copyright 2020 ChainSafe Systems
 * SPDX-License-Identifier: LGPL-3.0-only
 */

const TruffleAssert = require('truffle-assertions');
const Ethers = require('ethers');

const Helpers = require('../helpers');

const DAOContract = artifacts.require("DAO");
const BridgeContract = artifacts.require("Bridge");
const CentrifugeAssetContract = artifacts.require("CentrifugeAsset");
const GenericHandlerContract = artifacts.require("GenericHandler");

contract('Bridge - [fee]', async (accounts) => {
    const originDomainID = 1;
    const destinationDomainID = 2;
    const blankFunctionSig = '0x00000000';
    const blankFunctionDepositerOffset = 0;
    const relayer = accounts[0];
    const feeMaxValue = 10000;
    const feePercent = 10;

    const someAddress = "0xcafecafecafecafecafecafecafecafecafecafe";

    const depositAmount = Ethers.utils.parseEther("1.5");
    const depositAmountApprove = Ethers.utils.parseEther("2");

    const basicFee = Ethers.utils.parseEther("0.9");
    const minAmount = Ethers.utils.parseEther("1");
    const maxAmount = Ethers.utils.parseEther("5");

    let DAOInstance;
    let BridgeInstance;
    let GenericHandlerInstance;
    let resourceID;
    let depositData;
    let initialResourceIDs;
    let initialContractAddresses;
    let initialDepositFunctionSignatures;
    let initialDepositFunctionDepositerOffsets;
    let initialExecuteFunctionSignatures;

    beforeEach(async () => {
        await Promise.all([
            CentrifugeAssetContract.new().then(instance => CentrifugeAssetInstance = instance),
            BridgeInstance = BridgeContract.new(originDomainID, [relayer], 0, 100, feeMaxValue, feePercent).then(instance => BridgeInstance = instance)
        ]);

        DAOInstance = await DAOContract.new(BridgeInstance.address, someAddress);
        await BridgeInstance.setDAOContractInitial(DAOInstance.address);

        resourceID = Helpers.createResourceID(CentrifugeAssetInstance.address, originDomainID)
        initialResourceIDs = [resourceID];
        initialContractAddresses = [CentrifugeAssetInstance.address];
        initialDepositFunctionSignatures = [blankFunctionSig];
        initialDepositFunctionDepositerOffsets = [blankFunctionDepositerOffset];
        initialExecuteFunctionSignatures = [blankFunctionSig];

        GenericHandlerInstance = await GenericHandlerContract.new(
            BridgeInstance.address);

        await DAOInstance.newSetGenericResourceRequest(GenericHandlerInstance.address, resourceID,  initialContractAddresses[0], initialDepositFunctionSignatures[0], initialDepositFunctionDepositerOffsets[0], initialExecuteFunctionSignatures[0]);
        await BridgeInstance.adminSetGenericResource(1);

        depositData = Helpers.createGenericDepositData('0xdeadbeef');

        await DAOInstance.newChangeFeeRequest("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", destinationDomainID, basicFee, minAmount, maxAmount);
        await BridgeInstance.adminChangeFee(1);
    });

    it('[sanity] Generic deposit can be made', async () => {
        await TruffleAssert.passes(BridgeInstance.deposit(
            destinationDomainID,
            resourceID,
            depositData
        ));
    });

    it('deposit passes if valid amount supplied', async () => {
        await TruffleAssert.passes(
            BridgeInstance.deposit(
                destinationDomainID,
                resourceID,
                depositData
            )
        )
    });

    it('distribute fees', async () => {
        // check the balance is 0
        assert.equal(web3.utils.fromWei((await web3.eth.getBalance(BridgeInstance.address)), "ether"), "0");
        await BridgeInstance.deposit(destinationDomainID, resourceID, depositData, {value: Ethers.utils.parseEther("1")})
        assert.equal(web3.utils.fromWei((await web3.eth.getBalance(BridgeInstance.address)), "ether"), "1");

        let b1Before = await web3.eth.getBalance(accounts[1]);
        let b2Before = await web3.eth.getBalance(accounts[2]);

        let payout = Ethers.utils.parseEther("0.5")
        // Transfer the funds
        TruffleAssert.passes(
            await DAOInstance.newTransferRequest([accounts[1], accounts[2]], [payout, payout]),
            await BridgeInstance.transferFunds(1)
        )
        b1 = await web3.eth.getBalance(accounts[1]);
        b2 = await web3.eth.getBalance(accounts[2]);
        assert.equal(b1, Ethers.BigNumber.from(b1Before).add(payout));
        assert.equal(b2, Ethers.BigNumber.from(b2Before).add(payout));
    })
});