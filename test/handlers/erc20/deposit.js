/**
 * Copyright 2020 ChainSafe Systems
 * SPDX-License-Identifier: LGPL-3.0-only
 */
const TruffleAssert = require('truffle-assertions');
const Ethers = require('ethers');

const Helpers = require('../../helpers');

const DAOContract = artifacts.require("DAO");
const BridgeContract = artifacts.require("Bridge");
const ERC20MintableContract = artifacts.require("ERC20PresetMinterPauser");
const ERC20HandlerContract = artifacts.require("ERC20Handler");

contract('ERC20Handler - [Deposit ERC20]', async (accounts) => {
    const relayerThreshold = 2;
    const domainID = 1;
    const expectedDepositNonce = 1;
    const depositerAddress = accounts[1];
    const tokenAmount = Ethers.utils.parseUnits("100", 6);

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
    let initialResourceIDs;
    let initialContractAddresses;
    let burnableContractAddresses;

    beforeEach(async () => {
        await Promise.all([
            BridgeContract.new(domainID, [], relayerThreshold, 100, feeMaxValue, feePercent).then(instance => BridgeInstance = instance),
            ERC20MintableContract.new("token", "TOK").then(instance => ERC20MintableInstance = instance)
        ]);

        DAOInstance = await DAOContract.new(BridgeInstance.address, someAddress);
        await BridgeInstance.setDAOContractInitial(DAOInstance.address);
        
        resourceID = Helpers.createResourceID(ERC20MintableInstance.address, domainID);
        initialResourceIDs = [resourceID];
        initialContractAddresses = [ERC20MintableInstance.address];
        burnableContractAddresses = []

        await Promise.all([
            ERC20HandlerContract.new(BridgeInstance.address, someAddress).then(instance => ERC20HandlerInstance = instance),
            ERC20MintableInstance.mint(depositerAddress, tokenAmount)
        ]);
        await ERC20HandlerInstance.setDAOContractInitial(DAOInstance.address);

        await ERC20MintableInstance.approve(ERC20HandlerInstance.address, tokenAmount, { from: depositerAddress });
        await DAOInstance.newSetResourceRequest(ERC20HandlerInstance.address, resourceID, ERC20MintableInstance.address);
        await BridgeInstance.adminSetResource(1);

        await DAOInstance.newChangeFeeRequest(ERC20MintableInstance.address, domainID, basicFee, minAmount, maxAmount);
        await BridgeInstance.adminChangeFee(1)
    });

    it('[sanity] depositer owns tokenAmount of ERC20', async () => {
        const depositerBalance = await ERC20MintableInstance.balanceOf(depositerAddress);
        assert.equal(tokenAmount.toNumber(), depositerBalance.toNumber());
    });

    it('[sanity] ERC20HandlerInstance.address has an allowance of tokenAmount from depositerAddress', async () => {
        const handlerAllowance = await ERC20MintableInstance.allowance(depositerAddress, ERC20HandlerInstance.address);
        assert.equal(tokenAmount.toNumber(), handlerAllowance.toNumber());
    });

    it('Varied recipient address with length 40', async () => {
        const recipientAddress = accounts[0] + accounts[1].substr(2);
        const lenRecipientAddress = 40;
        
        const depositTx = await BridgeInstance.deposit(
            domainID,
            resourceID,
            Helpers.createERCDepositData(
                tokenAmount,
                lenRecipientAddress,
                recipientAddress),
            { from: depositerAddress }
        );

        TruffleAssert.eventEmitted(depositTx, 'Deposit', (event) => {
            return event.destinationDomainID.toNumber() === domainID &&
                event.resourceID === resourceID.toLowerCase() &&
                event.depositNonce.toNumber() === expectedDepositNonce &&
                event.user === depositerAddress &&
                event.data === Helpers.createERCDepositData(
                    tokenAmount,
                    lenRecipientAddress,
                    recipientAddress).toLowerCase() &&
                event.handlerResponse === null
        });
    });

    it('Varied recipient address with length 32', async () => {
        const recipientAddress = Ethers.utils.keccak256(accounts[0]);
        const lenRecipientAddress = 32;

        const depositTx = await BridgeInstance.deposit(
            domainID,
            resourceID,
            Helpers.createERCDepositData(
                tokenAmount,
                lenRecipientAddress,
                recipientAddress),
            { from: depositerAddress }
        );

        TruffleAssert.eventEmitted(depositTx, 'Deposit', (event) => {
            return event.destinationDomainID.toNumber() === domainID &&
                event.resourceID === resourceID.toLowerCase() &&
                event.depositNonce.toNumber() === expectedDepositNonce &&
                event.user === depositerAddress &&
                event.data === Helpers.createERCDepositData(
                    tokenAmount,
                    lenRecipientAddress,
                    recipientAddress).toLowerCase() &&
                event.handlerResponse === null
        });
    });

    it("When non-contract addresses are whitelisted in the handler, deposits which the addresses are set as a token address will be failed", async () => {
        const ZERO_Address = "0x0000000000000000000000000000000000000000";
        const EOA_Address = accounts[1];
        const resourceID_ZERO_Address = Helpers.createResourceID(ZERO_Address, domainID);
        const resourceID_EOA_Address = Helpers.createResourceID(EOA_Address, domainID);
        await DAOInstance.newSetResourceRequest(ERC20HandlerInstance.address, resourceID_EOA_Address, EOA_Address);
        await BridgeInstance.adminSetResource(2);
        
        await DAOInstance.newChangeFeeRequest(EOA_Address, domainID, basicFee, minAmount, maxAmount);
        await BridgeInstance.adminChangeFee(2)

        const recipientAddress = accounts[0] + accounts[1].substr(2);
        const lenRecipientAddress = 40;

        await TruffleAssert.reverts(DAOInstance.newSetResourceRequest
            (ERC20HandlerInstance.address, resourceID_ZERO_Address, ZERO_Address
        ), "zero address");

        await TruffleAssert.reverts(BridgeInstance.deposit(
            domainID,
            resourceID_EOA_Address,
            Helpers.createERCDepositData(
                tokenAmount,
                lenRecipientAddress,
                recipientAddress),
            { from: depositerAddress }
        ), "ERC20: not a contract");
    });
});

