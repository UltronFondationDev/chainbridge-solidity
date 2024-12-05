/**
 * Copyright 2020 ChainSafe Systems
 * SPDX-License-Identifier: LGPL-3.0-only
 */

const TruffleAssert = require('truffle-assertions');
const Ethers = require('ethers');

const DAOContract = artifacts.require("DAO");
const BridgeContract = artifacts.require("Bridge");
const ERC20MintableContract = artifacts.require("ERC20PresetMinterPauser");
const ERC20HandlerContract = artifacts.require("ERC20Handler");

contract('ERC20Handler - [Burn ERC20]', async () => {
    const relayerThreshold = 2;
    const domainID = 1;
    const feeMaxValue = 10000;
    const feePercent = 10;

    const someAddress = "0xcafecafecafecafecafecafecafecafecafecafe";

    let DAOInstance;
    let RelayerInstance;
    let BridgeInstance;
    let ERC20MintableInstance1;
    let ERC20MintableInstance2;
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
        ]);

        DAOInstance = await DAOContract.new(BridgeInstance.address, someAddress);
        await BridgeInstance.setDAOContractInitial(DAOInstance.address);

        resourceID1 = Ethers.utils.hexZeroPad((ERC20MintableInstance1.address + Ethers.utils.hexlify(domainID).substr(2)), 32);
        resourceID2 = Ethers.utils.hexZeroPad((ERC20MintableInstance2.address + Ethers.utils.hexlify(domainID).substr(2)), 32);
        initialResourceIDs = [resourceID1, resourceID2];
        initialContractAddresses = [ERC20MintableInstance1.address, ERC20MintableInstance2.address];
        burnableContractAddresses = [ERC20MintableInstance1.address]
    });

    it('[sanity] contract should be deployed successfully', async () => {
        await TruffleAssert.passes(ERC20HandlerContract.new(BridgeInstance.address, someAddress));
    });

    it('burnableContractAddresses should be marked true in _burnList', async () => {
        const ERC20HandlerInstance = await ERC20HandlerContract.new(BridgeInstance.address, someAddress);
        await ERC20HandlerInstance.setDAOContractInitial(DAOInstance.address);

        for (i = 0; i < initialResourceIDs.length; i++) {
            await DAOInstance.newSetResourceRequest(ERC20HandlerInstance.address, initialResourceIDs[i], initialContractAddresses[i])
            await TruffleAssert.passes(BridgeInstance.adminSetResource(i+1));
        }

        for (i = 0; i < burnableContractAddresses.length; i++) {
            await DAOInstance.newSetBurnableRequest(ERC20HandlerInstance.address, burnableContractAddresses[i])
            await TruffleAssert.passes(BridgeInstance.adminSetBurnable(i+1));
        }
        
        for (const burnableAddress of burnableContractAddresses) {
            const isBurnable = await ERC20HandlerInstance._burnList.call(burnableAddress);
            assert.isTrue(isBurnable, "Contract wasn't successfully marked burnable");
        }
    });

    it('ERC20MintableInstance2.address should not be marked true in _burnList', async () => {
        const ERC20HandlerInstance = await ERC20HandlerContract.new(BridgeInstance.address, someAddress);
        await ERC20HandlerInstance.setDAOContractInitial(DAOInstance.address);

        for (i = 0; i < initialResourceIDs.length; i++) {
            await DAOInstance.newSetResourceRequest(ERC20HandlerInstance.address, initialResourceIDs[i], initialContractAddresses[i])
            await TruffleAssert.passes(BridgeInstance.adminSetResource(i+1));
        }

        for (i = 0; i < burnableContractAddresses.length; i++) {
            await DAOInstance.newSetBurnableRequest(ERC20HandlerInstance.address, burnableContractAddresses[i])
            await TruffleAssert.passes(BridgeInstance.adminSetBurnable(i+1));
        }

        const isBurnable = await ERC20HandlerInstance._burnList.call(ERC20MintableInstance2.address);
        assert.isFalse(isBurnable, "Contract shouldn't be marked burnable");
    });

    it('ERC20MintableInstance2.address should be marked true in _burnList after setBurnable is called', async () => {
        const ERC20HandlerInstance = await ERC20HandlerContract.new(BridgeInstance.address, someAddress);
        await ERC20HandlerInstance.setDAOContractInitial(DAOInstance.address);
        
        for (i = 0; i < initialResourceIDs.length; i++) {
            await DAOInstance.newSetResourceRequest(ERC20HandlerInstance.address, initialResourceIDs[i], initialContractAddresses[i])
            await TruffleAssert.passes(BridgeInstance.adminSetResource(i+1));
        }

        for (i = 0; i < burnableContractAddresses.length; i++) {
            await DAOInstance.newSetBurnableRequest(ERC20HandlerInstance.address, burnableContractAddresses[i])
            await TruffleAssert.passes(BridgeInstance.adminSetBurnable(i+1));
        }
        
        await DAOInstance.newSetBurnableRequest(ERC20HandlerInstance.address, ERC20MintableInstance2.address);
        await BridgeInstance.adminSetBurnable(burnableContractAddresses.length + 1);
        const isBurnable = await ERC20HandlerInstance._burnList.call(ERC20MintableInstance2.address);
        assert.isTrue(isBurnable, "Contract wasn't successfully marked burnable");
    });
});
