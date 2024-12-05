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

contract('ERC20Handler - [isWhitelisted]', async () => {
    const AbiCoder = new Ethers.utils.AbiCoder();
    
    const relayerThreshold = 2;
    const domainID = 1;
    const feeMaxValue = 10000;
    const feePercent = 10;

    const someAddress = "0xcafecafecafecafecafecafecafecafecafecafe";

    let DAOInstance;
    let BridgeInstance;
    let ERC20MintableInstance1;
    let ERC20MintableInstance2;
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

        initialResourceIDs = [];
        resourceID1 = Ethers.utils.hexZeroPad((ERC20MintableInstance1.address + Ethers.utils.hexlify(domainID).substr(2)), 32);
        initialResourceIDs.push(resourceID1);
        initialContractAddresses = [ERC20MintableInstance1.address];
        burnableContractAddresses = [];
    });

    it('[sanity] contract should be deployed successfully', async () => {
        await TruffleAssert.passes(ERC20HandlerContract.new(BridgeInstance.address, someAddress));
    });

    it('initialContractAddress should be whitelisted', async () => {
        const ERC20HandlerInstance = await ERC20HandlerContract.new(BridgeInstance.address, someAddress);
        await ERC20HandlerInstance.setDAOContractInitial(DAOInstance.address);
        await DAOInstance.newSetResourceRequest(ERC20HandlerInstance.address, resourceID1, ERC20MintableInstance1.address);
        await BridgeInstance.adminSetResource(1);
        const isWhitelisted = await ERC20HandlerInstance._contractWhitelist.call(ERC20MintableInstance1.address);
        assert.isTrue(isWhitelisted, "Contract wasn't successfully whitelisted");
    });


    // as we are working with a mandatory whitelist, these tests are currently not necessary
    
    // it('initialContractAddress should not be whitelisted', async () => {
    //     const ERC20HandlerInstance = await ERC20HandlerContract.new(BridgeInstance.address, initialResourceIDs, initialContractAddresses);
    //     const isWhitelisted = await ERC20HandlerInstance._contractWhitelist.call(ERC20MintableInstance1.address);
    //     assert.isFalse(isWhitelisted, "Contract should not have been whitelisted");
    // });

    // it('ERC20MintableInstance2.address should not be whitelisted', async () => {
    //     const ERC20HandlerInstance = await ERC20HandlerContract.new(BridgeInstance.address, initialResourceIDs, initialContractAddresses);
    //     const isWhitelisted = await ERC20HandlerInstance._contractWhitelist.call(ERC20MintableInstance2.address);
    //     assert.isFalse(isWhitelisted, "Contract should not have been whitelisted");
    // });
});
