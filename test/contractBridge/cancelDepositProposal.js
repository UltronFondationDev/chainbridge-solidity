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

contract('Bridge - [voteProposal with relayerThreshold == 3]', async (accounts) => {
    const originDomainID = 1;
    const destinationDomainID = 2;
    const relayer1Address = accounts[0];
    const relayer2Address = accounts[1];
    const relayer3Address = accounts[2];
    const relayer4Address = accounts[3];
    const relayer1Bit = 1 << 0;
    const relayer2Bit = 1 << 1;
    const relayer3Bit = 1 << 2;
    const destinationChainRecipientAddress = accounts[4];
    const depositAmount = Ethers.utils.parseUnits("10", 6);
    const expectedDepositNonce = 1;
    const relayerThreshold = 3;
    const feeMaxValue = 10000;
    const feePercent = 10;
    const basicFee = Ethers.utils.parseUnits("0.9", 6);
    const minAmount = Ethers.utils.parseUnits("10", 6);
    const maxAmount = Ethers.utils.parseUnits("1000000", 6);

    let DAOInstance;
    let BridgeInstance;
    let DestinationERC20MintableInstance;
    let DestinationERC20HandlerInstance;
    let depositData = '';
    let depositDataHash = '';
    let resourceID = '';

    let vote, executeProposal;

    beforeEach(async () => {
        await Promise.all([
            BridgeContract.new(originDomainID, [
                relayer1Address,
                relayer2Address,
                relayer3Address,
                relayer4Address], 
                relayerThreshold, 
                10,
                feeMaxValue,
                feePercent).then(instance => BridgeInstance = instance),
            ERC20MintableContract.new("token", "TOK").then(instance => DestinationERC20MintableInstance = instance)
        ]);
        
        DAOInstance = await DAOContract.new();
        await DAOInstance.setBridgeContractInitial(BridgeInstance.address);
        await BridgeInstance.setDAOContractInitial(DAOInstance.address);

        resourceID = Helpers.createResourceID(DestinationERC20MintableInstance.address, originDomainID);

        DestinationERC20HandlerInstance = await ERC20HandlerContract.new(BridgeInstance.address);
        await DAOInstance.newSetResourceRequest(DestinationERC20HandlerInstance.address, resourceID, DestinationERC20MintableInstance.address);
        await DAOInstance.newSetBurnableRequest(DestinationERC20HandlerInstance.address, DestinationERC20MintableInstance.address);
        await TruffleAssert.passes(BridgeInstance.adminSetResource(1));
        await TruffleAssert.passes(BridgeInstance.adminSetBurnable(1));

        depositData = Helpers.createERCDepositData(depositAmount, 20, destinationChainRecipientAddress);
        depositDataHash = Ethers.utils.keccak256(DestinationERC20HandlerInstance.address + depositData.substr(2));

        await DestinationERC20MintableInstance.grantRole(await DestinationERC20MintableInstance.MINTER_ROLE(), DestinationERC20HandlerInstance.address);
        await DAOInstance.newSetResourceRequest(DestinationERC20HandlerInstance.address, resourceID, DestinationERC20MintableInstance.address);
        await BridgeInstance.adminSetResource(2);

        await DAOInstance.newChangeFeeRequest(DestinationERC20MintableInstance.address, destinationDomainID, basicFee, minAmount, maxAmount);
        await BridgeInstance.adminChangeFee(1);

        vote = (relayer) => BridgeInstance.voteProposal(destinationDomainID, originDomainID, expectedDepositNonce, resourceID, depositData, { from: relayer });
        executeProposal = (relayer) => BridgeInstance.executeProposal(destinationDomainID, originDomainID, expectedDepositNonce, depositData, { from: relayer });
    });

    it ('[sanity] bridge configured with threshold, relayers, and expiry', async () => {
        assert.equal(await BridgeInstance._domainID(), originDomainID)

        assert.equal(await BridgeInstance._relayerThreshold(), relayerThreshold)

        assert.equal((await BridgeInstance._totalRelayers()).toString(), '4')

        assert.equal(await BridgeInstance._expiry(), 10)
    })

    it('[sanity] depositProposal should be created with expected values', async () => {
        await TruffleAssert.passes(vote(relayer1Address));

        const expectedDepositProposal = {
            _yesVotes: relayer1Bit.toString(),
            _yesVotesTotal: '1',
            _status: '1' // Active
        };

        const depositProposal = await BridgeInstance.getProposal(
            originDomainID, expectedDepositNonce, depositDataHash);

        assert.deepInclude(Object.assign({}, depositProposal), expectedDepositProposal);
    });


    it("voting on depositProposal after threshold results in cancelled proposal", async () => {
        

        await TruffleAssert.passes(vote(relayer1Address));

        for (i=0; i<10; i++) {
            await Helpers.advanceBlock();
        }

        await TruffleAssert.passes(vote(relayer2Address));
        
        const expectedDepositProposal = {
            _yesVotes: relayer1Bit.toString(),
            _yesVotesTotal: '1',
            _status: '4' // Cancelled
        };

        const depositProposal = await BridgeInstance.getProposal(originDomainID, expectedDepositNonce, depositDataHash);
        assert.deepInclude(Object.assign({}, depositProposal), expectedDepositProposal);
        await TruffleAssert.reverts(vote(relayer3Address), "proposal already executed/cancelled.")
    });


    it("relayer can cancel proposal after threshold blocks have passed", async () => {
        await TruffleAssert.passes(vote(relayer2Address));

        for (i=0; i<10; i++) {
            await Helpers.advanceBlock();
        }

        const expectedDepositProposal = {
            _yesVotes: relayer2Bit.toString(),
            _yesVotesTotal: '1',
            _status: '4' // Cancelled
        };

        await TruffleAssert.passes(BridgeInstance.cancelProposal(originDomainID, expectedDepositNonce, depositDataHash))
        const depositProposal = await BridgeInstance.getProposal(originDomainID, expectedDepositNonce, depositDataHash);
        assert.deepInclude(Object.assign({}, depositProposal), expectedDepositProposal);
        await TruffleAssert.reverts(vote(relayer4Address), "proposal already executed/cancelled.")
    });

    it("relayer cannot cancel proposal before threshold blocks have passed", async () => {
        await TruffleAssert.passes(vote(relayer2Address));

        await TruffleAssert.reverts(BridgeInstance.cancelProposal(originDomainID, expectedDepositNonce, depositDataHash), "Proposal not at expiry threshold")
    });

    it("admin can cancel proposal after threshold blocks have passed", async () => {
        await TruffleAssert.passes(vote(relayer3Address));

        for (i=0; i<10; i++) {
            await Helpers.advanceBlock();
        }

        const expectedDepositProposal = {
            _yesVotes: relayer3Bit.toString(),
            _yesVotesTotal: '1',
            _status: '4' // Cancelled
        };

        await TruffleAssert.passes(BridgeInstance.cancelProposal(originDomainID, expectedDepositNonce, depositDataHash))
        const depositProposal = await BridgeInstance.getProposal(originDomainID, expectedDepositNonce, depositDataHash);
        assert.deepInclude(Object.assign({}, depositProposal), expectedDepositProposal);
        await TruffleAssert.reverts(vote(relayer2Address), "proposal already executed/cancelled.")
    });

    it("proposal cannot be cancelled twice", async () => {
        await TruffleAssert.passes(vote(relayer3Address));

        for (i=0; i<10; i++) {
            await Helpers.advanceBlock();
        }

        await TruffleAssert.passes(BridgeInstance.cancelProposal(originDomainID, expectedDepositNonce, depositDataHash))
        await TruffleAssert.reverts(BridgeInstance.cancelProposal(originDomainID, expectedDepositNonce, depositDataHash), "Proposal cannot be cancelled")
    });

    it("inactive proposal cannot be cancelled", async () => {
        await TruffleAssert.reverts(BridgeInstance.cancelProposal(originDomainID, expectedDepositNonce, depositDataHash), "Proposal cannot be cancelled")
    });

    it("executed proposal cannot be cancelled", async () => {
        await TruffleAssert.passes(vote(relayer1Address));
        await TruffleAssert.passes(vote(relayer2Address));
        await TruffleAssert.passes(vote(relayer3Address)); // After this vote, automatically executes the proposal.

        await TruffleAssert.reverts(BridgeInstance.cancelProposal(originDomainID, expectedDepositNonce, depositDataHash), "Proposal cannot be cancelled")
    });

});
