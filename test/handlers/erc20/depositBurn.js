/**
 * Copyright 2020 ChainSafe Systems
 * SPDX-License-Identifier: LGPL-3.0-only
 */

const Ethers = require('ethers');

const Helpers = require('../../helpers');

const DAOContract = artifacts.require("DAO");
const BridgeContract = artifacts.require("Bridge");
const ERC20MintableContract = artifacts.require("ERC20PresetMinterPauser");
const ERC20HandlerContract = artifacts.require("ERC20Handler");

contract('ERC20Handler - [Deposit Burn ERC20]', async (accounts) => {
    const relayerThreshold = 2;
    const domainID = 1;

    const depositerAddress = accounts[1];
    const recipientAddress = accounts[2];

    const someAddress = "0xcafecafecafecafecafecafecafecafecafecafe";

    const initialTokenAmount = 100;
    const depositAmount = 10;

    const feeMaxValue = 10000;
    const feePercent = 10;

    let DAOInstance;
    let BridgeInstance;
    let ERC20MintableInstance1;
    let ERC20MintableInstance2;
    let ERC20HandlerInstance;

    let resourceID1;
    let resourceID2;
    let initialResourceIDs;
    let initialContractAddresses;
    let burnableContractAddresses;

    beforeEach(async () => {
        await Promise.all([
            BridgeContract.new(domainID, [], relayerThreshold, 100, feeMaxValue, feePercent).then(instance => BridgeInstance = instance),
            ERC20MintableContract.new("token", "TOK").then(instance => ERC20MintableInstance1 = instance),
            ERC20MintableContract.new("token", "TOK").then(instance => ERC20MintableInstance2 = instance)
        ])

        DAOInstance = await DAOContract.new(BridgeInstance.address, someAddress);
        await BridgeInstance.setDAOContractInitial(DAOInstance.address);

        resourceID1 = Helpers.createResourceID(ERC20MintableInstance1.address, domainID);
        resourceID2 = Helpers.createResourceID(ERC20MintableInstance2.address, domainID);
        initialResourceIDs = [resourceID1, resourceID2];
        initialContractAddresses = [ERC20MintableInstance1.address, ERC20MintableInstance2.address];
        burnableContractAddresses = [ERC20MintableInstance1.address];

        await Promise.all([
            ERC20HandlerContract.new(BridgeInstance.address, someAddress).then(instance => ERC20HandlerInstance = instance),
            ERC20MintableInstance1.mint(depositerAddress, initialTokenAmount)
        ]);
        await ERC20HandlerInstance.setDAOContractInitial(DAOInstance.address);

        await ERC20MintableInstance1.approve(ERC20HandlerInstance.address, depositAmount, { from: depositerAddress });
        await DAOInstance.newSetResourceRequest(ERC20HandlerInstance.address, resourceID1, ERC20MintableInstance1.address);
        await DAOInstance.newSetResourceRequest(ERC20HandlerInstance.address, resourceID2, ERC20MintableInstance2.address);
        await DAOInstance.newSetBurnableRequest(ERC20HandlerInstance.address, ERC20MintableInstance1.address);
        await BridgeInstance.adminSetResource(1);
        await BridgeInstance.adminSetResource(2);
        await BridgeInstance.adminSetBurnable(1);

        depositData = Helpers.createERCDepositData(depositAmount, 20, recipientAddress);
        
    });

    it('[sanity] burnableContractAddresses should be marked true in _burnList', async () => {
        for (const burnableAddress of burnableContractAddresses) {
            const isBurnable = await ERC20HandlerInstance._burnList.call(burnableAddress);
            assert.isTrue(isBurnable, "Contract wasn't successfully marked burnable");
        }
    });
});
