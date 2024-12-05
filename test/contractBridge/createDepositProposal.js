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

contract('Bridge - [create a deposit proposal (voteProposal) with relayerThreshold = 1]', async (accounts) => {
    const originChainRelayerAddress = accounts[1];
    const originChainRelayerBit = 1 << 0;
    const depositerAddress = accounts[2];
    const destinationRecipientAddress = accounts[3];
    const originDomainID = 1;
    const destinationDomainID = 2;
    const depositAmount = Ethers.utils.parseUnits("10", 6);
    const expectedDepositNonce = 1;
    const relayerThreshold = 1;
    const expectedCreateEventStatus = 1;

    const someAddress = "0xcafecafecafecafecafecafecafecafecafecafe";

    const feeMaxValue = 10000;
    const feePercent = 10;

    const basicFee = Ethers.utils.parseUnits("0.9", 6);
    const minAmount = Ethers.utils.parseUnits("10", 6);
    const maxAmount = Ethers.utils.parseUnits("1000000", 6);
    
    let DAOInstance;
    let BridgeInstance;
    let DestinationERC20MintableInstance;
    let resourceID;
    let data = '';
    let dataHash = '';

    beforeEach(async () => {
        await Promise.all([
            ERC20MintableContract.new("token", "TOK").then(instance => DestinationERC20MintableInstance = instance),
            BridgeContract.new(originDomainID, [originChainRelayerAddress], relayerThreshold, 100, feeMaxValue, feePercent).then(instance => BridgeInstance = instance)
        ]);

        DAOInstance = await DAOContract.new(BridgeInstance.address, someAddress);
        await BridgeInstance.setDAOContractInitial(DAOInstance.address);

        resourceID = Helpers.createResourceID(DestinationERC20MintableInstance.address, originDomainID);

        DestinationERC20HandlerInstance = await ERC20HandlerContract.new(BridgeInstance.address, someAddress);

        await DAOInstance.newSetResourceRequest(DestinationERC20HandlerInstance.address, resourceID, DestinationERC20MintableInstance.address);
        await BridgeInstance.adminSetResource(1);

        await DAOInstance.newChangeFeeRequest(DestinationERC20MintableInstance.address, destinationDomainID, basicFee, minAmount, maxAmount);
        await BridgeInstance.adminChangeFee(1);
        
        data = Helpers.createERCDepositData(
            depositAmount,
            20,
            destinationRecipientAddress);
        dataHash = Ethers.utils.keccak256(DestinationERC20HandlerInstance.address + data.substr(2));
    });

    it('should create depositProposal successfully', async () => {
        await TruffleAssert.passes(BridgeInstance.voteProposal(
            destinationDomainID,
            originDomainID,
            expectedDepositNonce,
            resourceID,
            data,
            { from: originChainRelayerAddress }
        ));
    });

    it('should revert because depositerAddress is not a relayer', async () => {
        await TruffleAssert.reverts(BridgeInstance.voteProposal(
            destinationDomainID,
            originDomainID,
            expectedDepositNonce,
            resourceID,
            data,
            { from: depositerAddress }
        ));
    });

    it("depositProposal shouldn't be created if it has an Active status", async () => {
        await TruffleAssert.passes(BridgeInstance.voteProposal(
            destinationDomainID,
            originDomainID,
            expectedDepositNonce,
            resourceID,
            data,
            { from: originChainRelayerAddress }
        ));

        await TruffleAssert.reverts(BridgeInstance.voteProposal(
            destinationDomainID,
            originDomainID,
            expectedDepositNonce,
            resourceID,
            data,
            { from: originChainRelayerAddress }
        ));
    });

    it("getProposal should be called successfully", async () => {
        await TruffleAssert.passes(BridgeInstance.getProposal(
            originDomainID, expectedDepositNonce, dataHash
        ));
    });

    it('depositProposal should be created with expected values', async () => {
        const expectedDepositProposal = {
            _yesVotes: originChainRelayerBit.toString(),
            _yesVotesTotal: '1',
            _status: '2' // passed
        };

        await BridgeInstance.voteProposal(
            destinationDomainID,
            originDomainID,
            expectedDepositNonce,
            resourceID,
            data,
            { from: originChainRelayerAddress }
        );

        const depositProposal = await BridgeInstance.getProposal(
            originDomainID, expectedDepositNonce, dataHash);
        Helpers.assertObjectsMatch(expectedDepositProposal, Object.assign({}, depositProposal));
    });

    it('originChainRelayerAddress should be marked as voted for proposal', async () => {
        await BridgeInstance.voteProposal(
            destinationDomainID,
            originDomainID,
            expectedDepositNonce,
            resourceID,
            data,
            { from: originChainRelayerAddress }
        );
        const hasVoted = await BridgeInstance._hasVotedOnProposal.call(
            Helpers.nonceAndId(expectedDepositNonce, originDomainID), dataHash, originChainRelayerAddress);
        assert.isTrue(hasVoted);
    });

    it('DepositProposalCreated event should be emitted with expected values', async () => {
        const proposalTx = await BridgeInstance.voteProposal(
            destinationDomainID,
            originDomainID,
            expectedDepositNonce,
            resourceID,
            data,
            { from: originChainRelayerAddress }
        );

        TruffleAssert.eventEmitted(proposalTx, 'ProposalEvent', (event) => {
            return event.originDomainID.toNumber() === originDomainID &&
                event.depositNonce.toNumber() === expectedDepositNonce &&
                event.status.toNumber() === expectedCreateEventStatus &&
                event.dataHash === dataHash
        });
    });
});

contract('Bridge - [create a deposit proposal (voteProposal) with relayerThreshold > 1]', async (accounts) => {
    // const minterAndRelayer = accounts[0];
    const originChainRelayerAddress = accounts[1];
    const originChainRelayerBit = 1 << 0;
    const depositerAddress = accounts[2];
    const destinationRecipientAddress = accounts[3];
    const originDomainID = 1;
    const destinationDomainID = 2;
    const depositAmount = Ethers.utils.parseUnits("10", 6);
    const expectedDepositNonce = 1;
    const relayerThreshold = 2;
    const expectedCreateEventStatus = 1;

    const someAddress = "0xcafecafecafecafecafecafecafecafecafecafe";

    const feeMaxValue = 10000;
    const feePercent = 10;

    const basicFee = Ethers.utils.parseUnits("0.9", 6);
    const minAmount = Ethers.utils.parseUnits("10", 6);
    const maxAmount = Ethers.utils.parseUnits("1000000", 6);
    
    let DAOInstance;
    let BridgeInstance;
    let DestinationERC20MintableInstance;
    let DestinationERC20HandlerInstance;
    let resourceID;
    let data = '';
    let dataHash = '';

    beforeEach(async () => {
        await Promise.all([
            ERC20MintableContract.new("token", "TOK").then(instance => DestinationERC20MintableInstance = instance),
            BridgeContract.new(originDomainID, [originChainRelayerAddress], relayerThreshold, 100, feeMaxValue, feePercent).then(instance => BridgeInstance = instance)
        ]);

        DAOInstance = await DAOContract.new(BridgeInstance.address, someAddress);
        await BridgeInstance.setDAOContractInitial(DAOInstance.address);

        resourceID = Helpers.createResourceID(DestinationERC20MintableInstance.address, originDomainID);

        DestinationERC20HandlerInstance = await ERC20HandlerContract.new(BridgeInstance.address, someAddress);
        await DestinationERC20HandlerInstance.setDAOContractInitial(DAOInstance.address);

        await DAOInstance.newSetResourceRequest(DestinationERC20HandlerInstance.address, resourceID, DestinationERC20MintableInstance.address);
        await BridgeInstance.adminSetResource(1);

        await DAOInstance.newChangeFeeRequest(DestinationERC20MintableInstance.address, destinationDomainID, basicFee, minAmount, maxAmount);
        await BridgeInstance.adminChangeFee(1);
        
        data = Helpers.createERCDepositData(
            depositAmount,
            20,
            destinationRecipientAddress);
        dataHash = Ethers.utils.keccak256(DestinationERC20HandlerInstance.address + data.substr(2));
    });

    it('should create depositProposal successfully', async () => {
        await TruffleAssert.passes(BridgeInstance.voteProposal(
            destinationDomainID,
            originDomainID,
            expectedDepositNonce,
            resourceID,
            data,
            { from: originChainRelayerAddress }
        ));
    });

    it('should revert because depositerAddress is not a relayer', async () => {
        await TruffleAssert.reverts(BridgeInstance.voteProposal(
            destinationDomainID,
            originDomainID,
            expectedDepositNonce,
            resourceID,
            data,
            { from: depositerAddress }
        ));
    });

    it("depositProposal shouldn't be created if it has an Active status", async () => {
        await TruffleAssert.passes(BridgeInstance.voteProposal(
            destinationDomainID,
            originDomainID,
            expectedDepositNonce,
            resourceID,
            data,
            { from: originChainRelayerAddress }
        ));

        await TruffleAssert.reverts(BridgeInstance.voteProposal(
            destinationDomainID,
            originDomainID,
            expectedDepositNonce,
            resourceID,
            data,
            { from: originChainRelayerAddress }
        ));
    });

    it('depositProposal should be created with expected values', async () => {
        const expectedDepositProposal = {
            _yesVotes: originChainRelayerBit.toString(),
            _yesVotesTotal: '1',
            _status: '1' // active
        };

        await BridgeInstance.voteProposal(
            destinationDomainID,
            originDomainID,
            expectedDepositNonce,
            resourceID,
            data,
            { from: originChainRelayerAddress }
        );

        const depositProposal = await BridgeInstance.getProposal(
            originDomainID, expectedDepositNonce, dataHash);
        Helpers.assertObjectsMatch(expectedDepositProposal, Object.assign({}, depositProposal));
    });

    it('originChainRelayerAddress should be marked as voted for proposal', async () => {
        await BridgeInstance.voteProposal(
            destinationDomainID,
            originDomainID,
            expectedDepositNonce,
            resourceID,
            data,
            { from: originChainRelayerAddress }
        );
        const hasVoted = await BridgeInstance._hasVotedOnProposal.call(
            Helpers.nonceAndId(expectedDepositNonce, originDomainID), dataHash, originChainRelayerAddress);
        assert.isTrue(hasVoted);
    });

    it('DepositProposalCreated event should be emitted with expected values', async () => {
        const proposalTx = await BridgeInstance.voteProposal(
            destinationDomainID,
            originDomainID,
            expectedDepositNonce,
            resourceID,
            data,
            { from: originChainRelayerAddress }
        );

        TruffleAssert.eventEmitted(proposalTx, 'ProposalEvent', (event) => {
            return event.originDomainID.toNumber() === originDomainID &&
                event.depositNonce.toNumber() === expectedDepositNonce &&
                event.status.toNumber() === expectedCreateEventStatus &&
                event.dataHash === dataHash
        });
    });
});