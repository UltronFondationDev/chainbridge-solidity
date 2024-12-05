import { ethers } from "hardhat";
import { Multisig, Multisig__factory } from "../typechain";
import {expect} from "chai";
import { BigNumber, utils } from 'ethers';
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import exp from "constants";

describe("\x1b[33mMultisig test\x1b[0m\n", () => {
    const beforeTest = "\t";
    const insideTest = "\t\t";
    const colorRed = "\x1b[31m";
    const colorGreen = "\x1b[32m";
    const colorBlue = "\x1b[36m";
    const colorReset = "\x1b[0m";

    const zeroAddress = "0x0000000000000000000000000000000000000000";
    let provider: any;
    let accounts: SignerWithAddress[];

    let owner: SignerWithAddress;
    let voterFirst: SignerWithAddress;
    let voterSecond: SignerWithAddress;
    let newVoterFirst: SignerWithAddress;
    let newVoterSecond: SignerWithAddress;

    let multisig: Multisig;

    before(async () => {
        provider = ethers.provider;
        accounts = await ethers.getSigners();
        [ owner, voterFirst, voterSecond, newVoterFirst, newVoterSecond ] = await ethers.getSigners();

        multisig = await (await new Multisig__factory(owner).deploy()).deployed();
        console.log(`${beforeTest}Deployed bridge contract: ${colorBlue}${multisig.address}${colorReset}`);
    });

    it("Insert initial voter", async () => {
        const res = await multisig.getActiveVotersCount();
        console.log(`${insideTest}Compares active voters count [${colorBlue}${res}${colorReset}] with returned value: [${colorGreen}${1}${colorReset}]`);
        expect(res).equals(1);
    });

    it("Insert voter to voter list if not zero address and not already a voter", async () => {
        console.log(`${insideTest}Creates new voter including request`);
        await multisig.connect(owner).newVoterRequest(true, newVoterFirst.address);
        console.log(`${insideTest}Creates new voter including request`);
        await multisig.connect(owner).newVoterRequest(true, newVoterSecond.address);

        const res1 = await multisig.getVoterStatusByAddress(newVoterFirst.address);
        const res2 = await multisig.getVoterStatusByAddress(newVoterSecond.address);

        console.log(`${insideTest}Compares address isVoter status [${colorBlue}${res1}${colorReset}] with returned value: [${colorGreen}${false}${colorReset}]`);
        console.log(`${insideTest}Compares address isVoter status [${colorBlue}${res2}${colorReset}] with returned value: [${colorGreen}${false}${colorReset}]`);
        expect(res1).equals(false);
        expect(res2).equals(false);
    });

    it('Insert voters if enough votes', async () => {    
        console.log(`${insideTest}Inserts new voter`);    
        await multisig.connect(owner).votersRequestConclusion(1);
       
        console.log(`${insideTest}Confirms including new voter`);
        await multisig.connect(newVoterFirst).newVoteForVoterRequest(true, 2)
        console.log(`${insideTest}Inserts new voter`);
        await multisig.connect(owner).votersRequestConclusion(2);

        console.log(`${insideTest}Creates new voter including request`);
        await multisig.connect(owner).newVoterRequest(true, voterSecond.address);
        // console.log(`${insideTest}Confirms including new voter`);
        // await multisig.connect(newVoterFirst).newVoteForVoterRequest(false, 3)
        
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote request is not active, while inserting vote`);
        await expect(multisig.connect(newVoterFirst).newVoteForVoterRequest(true, 1)).revertedWith('not active');
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote request is not active, while executing voter request result`);
        await expect(multisig.connect(owner).votersRequestConclusion(2)).revertedWith('not active');
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if not enough votes`);
        await expect(multisig.connect(owner).votersRequestConclusion(3)).revertedWith('not enough votes');
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if new voter is already a voter`);
        await expect(multisig.connect(owner).newVoterRequest(true, newVoterFirst.address)).revertedWith('already a voter');
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if new voter address is zero address)`);
        await expect(multisig.connect(owner).newVoterRequest(true, zeroAddress)).revertedWith('zero address');
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if sender is not a voter`);
        await expect(multisig.connect(voterFirst).newVoterRequest(true, newVoterFirst.address)).revertedWith('not a voter');
        
        const res = await multisig.getActiveVotersCount();
        console.log(`${insideTest}Compares active voters count [${colorBlue}${res}${colorReset}] with returned value: [${colorGreen}${3}${colorReset}]`);
        expect(res).equals(3);
    });

    it('Remove voter if enough votes', async () => {     
        console.log(`${insideTest}Creates new voter removing request`);           
        await multisig.connect(owner).newVoterRequest(false, newVoterFirst.address);
        await multisig.connect(newVoterSecond).newVoteForVoterRequest(true, 4);
        await multisig.connect(newVoterSecond).newVoteForVoterRequest(false, 4);
        await multisig.connect(newVoterSecond).newVoteForVoterRequest(true, 4);

        console.log(`${insideTest}Removes voter`);
        await multisig.connect(owner).votersRequestConclusion(4);

        await multisig.connect(newVoterSecond).newVoterRequest(true, voterSecond.address);
        
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote request is not active, while removing vote`);
        await expect(multisig.connect(newVoterSecond).newVoteForVoterRequest(false, 1)).revertedWith('not active');
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote request is not active, while executing voter request result`);
        await expect(multisig.connect(owner).votersRequestConclusion(4)).revertedWith('not active');
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if not enough votes`);
        await expect(multisig.connect(owner).votersRequestConclusion(5)).revertedWith('not enough votes');
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if new voter address is not a voter, while removing`);
        await expect(multisig.connect(owner).newVoterRequest(false, newVoterFirst.address)).revertedWith('not a voter');
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if sender(removed voter) is not a voter`);
        await expect(multisig.connect(newVoterFirst).newVoterRequest(false, newVoterFirst.address)).revertedWith('not a voter');
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if new voter address is ero address)`);
        await expect(multisig.connect(owner).newVoterRequest(false, zeroAddress)).revertedWith('zero address');
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if sender is not a voter`);
        await expect(multisig.connect(voterFirst).newVoterRequest(false, newVoterFirst.address)).revertedWith('not a voter');

        const res = await multisig.getActiveVotersCount();
        console.log(`${insideTest}Compares active voters count [${colorBlue}${res}${colorReset}] with returned value: [${colorGreen}${2}${colorReset}]`);
        expect(res).equals(2);
    });

})