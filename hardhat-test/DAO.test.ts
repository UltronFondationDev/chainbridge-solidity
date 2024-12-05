import {ethers} from "hardhat";
import { DAO, DAO__factory, Bridge, Bridge__factory, ERC20Handler__factory, 
GenericHandler__factory, ERC20PresetMinterPauser__factory, CentrifugeAsset__factory } from "../typechain";
import {expect} from "chai";
import * as Helpers from "./helpers";
import { BigNumber, utils } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import exp from "constants";

describe("\x1b[33mDAO test\x1b[0m\n", () => {
    const beforeTest = "\t";
    const insideTest = "\t\t";
    const colorRed = "\x1b[31m";
    const colorGreen = "\x1b[32m";
    const colorBlue = "\x1b[36m";
    const colorReset = "\x1b[0m";

    const zeroAddress = "0x0000000000000000000000000000000000000000";
    const someAddress = "0xcafecafecafecafecafecafecafecafecafecafe";
    let provider: any;
    let accounts: SignerWithAddress[];

    let owner: SignerWithAddress;
    let voterFirst: SignerWithAddress;
    let voterSecond: SignerWithAddress;
    let newVoterFirst: SignerWithAddress;
    let newVoterSecond: SignerWithAddress;

    const domainId = 1;
    const initialRelayerThreshold = 2;
    const fee = 0;
    const expiry = 100;
    const feeMaxValue = 10000;
    const feePercent = 1;

    let dao: DAO;
    let bridge: Bridge;

    before(async () => {
        provider = ethers.provider;
    
        accounts = await ethers.getSigners();

        [ owner, voterFirst, voterSecond, newVoterFirst, newVoterSecond ] = await ethers.getSigners();

        const initialRelayers:string[] = [owner.address, voterFirst.address, voterSecond.address];

        bridge = await (await new Bridge__factory(owner).deploy(domainId, initialRelayers, initialRelayerThreshold, expiry, feeMaxValue, feePercent)).deployed();
        console.log(`${beforeTest}Deployed bridge contract: ${colorBlue}${bridge.address}${colorReset}`);

        const ERC20HandlerInstance = await (await new ERC20Handler__factory(owner).deploy(bridge.address, someAddress)).deployed();
        const handlerAddress = ERC20HandlerInstance.address;

        dao = await (await new DAO__factory(owner).deploy(bridge.address, handlerAddress)).deployed();
        console.log(`${beforeTest}Deployed DAO contract: ${colorBlue}${dao.address}${colorReset}`)
        console.log(`${beforeTest}Inserted initial voter : ${colorBlue}${owner.address}${colorReset}`);

        await ERC20HandlerInstance.connect(owner).setDAOContractInitial(dao.address);

        console.log(`${beforeTest}${colorRed}Reverts${colorReset} if bridge new address is zero address`);

        console.log(`${beforeTest}${colorBlue}Inserted${colorReset} initial bridge address to DAO: ${colorGreen}${bridge.address}${colorReset}`);    
    });

    it("Owner change request is available and returns correct address\n", async () => {
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if sender is not a voter`);
        await expect(dao.connect(newVoterSecond).newOwnerChangeRequest(newVoterFirst.address)).revertedWith("not a voter"); 
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if new owner is zero address`);
        await expect(dao.connect(owner).newOwnerChangeRequest(zeroAddress)).revertedWith("zero address"); 
       
        console.log(`${insideTest}Creates new owner change request`);
        await dao.connect(owner).newOwnerChangeRequest(newVoterFirst.address);

        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote is already confirmed(true)`);
        await expect(dao.connect(owner).newVoteForOwnerChangeRequest(true, 1)).revertedWith("already confirmed");
        
        await dao.connect(owner).newVoteForOwnerChangeRequest(false, 1); 
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if not enough votes`);
        await expect(dao.connect(owner).isOwnerChangeAvailable(1)).revertedWith("not enough votes");
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote is already removed(false)`);
        await expect(dao.connect(owner).newVoteForOwnerChangeRequest(false, 1)).revertedWith("not confirmed");
        
        await dao.connect(owner).newVoteForOwnerChangeRequest(true, 1);

        const address = await dao.connect(owner).isOwnerChangeAvailable(1);
        console.log(`${insideTest}Compares owner address [${colorBlue}${newVoterFirst.address}${colorReset}] with returned value: [${colorGreen}${address}${colorReset}]`);
        expect(newVoterFirst.address).equals(address);
    });

    it("Transfer request is available and returns correct value\n", async () => {
        const addreses:string[] = [owner.address, voterFirst.address];
        const amounts: number[] = [2, 2];

        console.log(`${insideTest}${colorRed}Reverts${colorReset} if sender is not a voter`);
        await expect(dao.connect(newVoterSecond).newTransferRequest(addreses, amounts)).revertedWith("not a voter"); 
       
        console.log(`${insideTest}Creates new transfer request`);
        await dao.connect(owner).newTransferRequest(addreses, amounts);

        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote is already confirmed(true)`);
        await expect(dao.connect(owner).newVoteForTransferRequest(true, 1)).revertedWith("already confirmed");
        
        await dao.connect(owner).newVoteForTransferRequest(false, 1); 
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if not enough votes`);
        await expect(dao.connect(owner).isTransferAvailable(1)).revertedWith("not enough votes");
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote is already removed(false)`);
        await expect(dao.connect(owner).newVoteForTransferRequest(false, 1)).revertedWith("not confirmed");
        
        await dao.connect(owner).newVoteForTransferRequest(true, 1);

        const res = await dao.connect(owner).isTransferAvailable(1);
        console.log(`${insideTest}Compares transfer addreses [${colorBlue}${addreses}${colorReset}] with returned value [${colorGreen}${res[0]}${colorReset}]`);
        console.log(`${insideTest}Compares transfer amounts [${colorBlue}${amounts}${colorReset}] with returned value [${colorGreen}${res[1]}${colorReset}]`);
        expect(res[0].toString()).equals(addreses.toString());
        expect(res[1].toString()).equals(amounts.toString());
    });

    it("Pause status request is available and returns correct value\n", async () => {
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if sender is not a voter`);
        await expect(dao.connect(newVoterSecond).newPauseStatusRequest(true)).revertedWith("not a voter"); 
       
        console.log(`${insideTest}Creates new pause status request`);
        await dao.connect(owner).newPauseStatusRequest(true);

        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote is already confirmed(true)`);
        await expect(dao.connect(owner).newVoteForPauseStatusRequest(true, 1)).revertedWith("already confirmed");
        
        await dao.connect(owner).newVoteForPauseStatusRequest(false, 1); 
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if not enough votes`);
        await expect(dao.connect(owner).isPauseStatusAvailable(1)).revertedWith("not enough votes");
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote is already removed(false)`);
        await expect(dao.connect(owner).newVoteForPauseStatusRequest(false, 1)).revertedWith("not confirmed");
        
        await dao.connect(owner).newVoteForPauseStatusRequest(true, 1);

        const res = await dao.connect(owner).isPauseStatusAvailable(1);
        console.log(`${insideTest}Compares pause status mode [${colorBlue}${true}${colorReset}] with returned value [${colorGreen}${res}${colorReset}]`);
        expect(res).equals(true);
    });

    it("Change relayer threshold request is available and returns correct value\n", async () => {
        const amount = 4;
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if sender is not a voter`);
        await expect(dao.connect(newVoterSecond).newChangeRelayerThresholdRequest(amount)).revertedWith("not a voter"); 
       
        console.log(`${insideTest}Creates new chnage relayer threshold request`);
        await dao.connect(owner).newChangeRelayerThresholdRequest(amount);

        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote is already confirmed(true)`);
        await expect(dao.connect(owner).newVoteForChangeRelayerThresholdRequest(true, 1)).revertedWith("already confirmed");
        
        await dao.connect(owner).newVoteForChangeRelayerThresholdRequest(false, 1); 
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if not enough votes`);
        await expect(dao.connect(owner).isChangeRelayerThresholdAvailable(1)).revertedWith("not enough votes");
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote is already removed(false)`);
        await expect(dao.connect(owner).newVoteForChangeRelayerThresholdRequest(false, 1)).revertedWith("not confirmed");
        
        await dao.connect(owner).newVoteForChangeRelayerThresholdRequest(true, 1);

        const res = await dao.connect(owner).isChangeRelayerThresholdAvailable(1);
        console.log(`${insideTest}Compares relayer threshold amount [${colorBlue}${amount}${colorReset}] with returned value [${colorGreen}${res}${colorReset}]`);
        expect(res).equals(amount);
    });

    it("Set resource request is available and returns correct value\n", async () => {
        const ERC20MintableInstance = await (await new ERC20PresetMinterPauser__factory(owner).deploy("token", "TOK")).deployed();
        const ERC20HandlerInstance = await (await new ERC20Handler__factory(owner).deploy(bridge.address, someAddress)).deployed();
        const handlerAddress = ERC20HandlerInstance.address;
        const tokenAddress = ERC20MintableInstance.address;
        const resourceId = Helpers.createResourceID(tokenAddress, domainId);

        console.log(`${insideTest}${colorRed}Reverts${colorReset} if sender is not a voter`);
        await expect(dao.connect(newVoterSecond).newSetResourceRequest(handlerAddress, resourceId, tokenAddress)).revertedWith("not a voter"); 
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if handler or token addresses is zero address`);
        await expect(dao.connect(owner).newSetResourceRequest(handlerAddress, resourceId, zeroAddress)).revertedWith("zero address"); 
        await expect(dao.connect(owner).newSetResourceRequest(zeroAddress, resourceId, tokenAddress)).revertedWith("zero address"); 

        console.log(`${insideTest}Creates new set resource request`);
        await dao.connect(owner).newSetResourceRequest(handlerAddress, resourceId, tokenAddress);

        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote is already confirmed(true)`);
        await expect(dao.connect(owner).newVoteForSetResourceRequest(true, 1)).revertedWith("already confirmed");
        
        await dao.connect(owner).newVoteForSetResourceRequest(false, 1); 
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if not enough votes`);
        await expect(dao.connect(owner).isSetResourceAvailable(1)).revertedWith("not enough votes");
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote is already removed(false)`);
        await expect(dao.connect(owner).newVoteForSetResourceRequest(false, 1)).revertedWith("not confirmed");
        
        await dao.connect(owner).newVoteForSetResourceRequest(true, 1);

        const res = await dao.connect(owner).isSetResourceAvailable(1);
        console.log(`${insideTest}Compares handler address [${colorBlue}${handlerAddress}${colorReset}] with returned value [${colorGreen}${res[0]}${colorReset}]`);
        console.log(`${insideTest}Compares resource id [${colorBlue}${resourceId}${colorReset}] with returned value [${colorGreen}${res[1]}${colorReset}]`);
        console.log(`${insideTest}Compares token address [${colorBlue}${tokenAddress}${colorReset}] with returned value [${colorGreen}${res[2]}${colorReset}]`);
        expect(res[0]).equals(handlerAddress);
        expect(res[1]).equals(resourceId);
        expect(res[2]).equals(tokenAddress);
    });
    
    it("Change fee percent request is available and returns correct value\n", async () => {
        const feeMaxValue = 1000;
        const feePercent = 1;

        console.log(`${insideTest}${colorRed}Reverts${colorReset} if sender is not a voter`);
        await expect(dao.connect(newVoterSecond).newChangeFeePercentRequest(feeMaxValue, feePercent)).revertedWith("not a voter"); 
       
        console.log(`${insideTest}Creates new change fee request`);
        await dao.connect(owner).newChangeFeePercentRequest(feeMaxValue, feePercent);

        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote is already confirmed(true)`);
        await expect(dao.connect(owner).newVoteForChangeFeePercentRequest(true, 1)).revertedWith("already confirmed");
        
        await dao.connect(owner).newVoteForChangeFeePercentRequest(false, 1); 
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if not enough votes`);
        await expect(dao.connect(owner).isChangeFeePercentAvailable(1)).revertedWith("not enough votes");
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote is already removed(false)`);
        await expect(dao.connect(owner).newVoteForChangeFeePercentRequest(false, 1)).revertedWith("not confirmed");
        
        await dao.connect(owner).newVoteForChangeFeePercentRequest(true, 1);

        const res = await dao.connect(owner).isChangeFeePercentAvailable(1);
        console.log(`${insideTest}Compares feeMaxValue [${colorBlue}${feeMaxValue}${colorReset}] with returned value [${colorGreen}${res[0]}${colorReset}]`);
        console.log(`${insideTest}Compares feePercent [${colorBlue}${feePercent}${colorReset}] with returned value [${colorGreen}${res[1]}${colorReset}]`);
        expect(res[0]).equals(feeMaxValue);
        expect(res[1]).equals(feePercent);
    });

    it("Change fee request is available and returns correct value\n", async () => {
        const ERC20MintableInstance = await (await new ERC20PresetMinterPauser__factory(owner).deploy("token", "TOK")).deployed();
        const tokenAddress = ERC20MintableInstance.address;
        const chainId = 0x1;
        const basicFee = ethers.utils.parseUnits("0.9", 6);
        const minAmount = ethers.utils.parseUnits("10", 6);
        const maxAmount = ethers.utils.parseUnits("100000", 6);

        console.log(`${insideTest}${colorRed}Reverts${colorReset} if sender is not a voter`);
        await expect(dao.connect(newVoterSecond).newChangeFeeRequest(tokenAddress, chainId, basicFee, minAmount, maxAmount)).revertedWith("not a voter"); 
       
        console.log(`${insideTest}Creates new change fee request`);
        await dao.connect(owner).newChangeFeeRequest(tokenAddress, chainId, basicFee, minAmount, maxAmount);

        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote is already confirmed(true)`);
        await expect(dao.connect(owner).newVoteForChangeFeeRequest(true, 1)).revertedWith("already confirmed");
        
        await dao.connect(owner).newVoteForChangeFeeRequest(false, 1); 
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if not enough votes`);
        await expect(dao.connect(owner).isChangeFeeAvailable(1)).revertedWith("not enough votes");
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote is already removed(false)`);
        await expect(dao.connect(owner).newVoteForChangeFeeRequest(false, 1)).revertedWith("not confirmed");
        
        await dao.connect(owner).newVoteForChangeFeeRequest(true, 1);

        const res = await dao.connect(owner).isChangeFeeAvailable(1);
        console.log(`${insideTest}Compares token Address [${colorBlue}${tokenAddress}${colorReset}] with returned value [${colorGreen}${res[0]}${colorReset}]`);
        console.log(`${insideTest}Compares chain Id [${colorBlue}${fee}${colorReset}] with returned value [${colorGreen}${res[1]}${colorReset}]`);
        console.log(`${insideTest}Compares basic fee [${colorBlue}${fee}${colorReset}] with returned value [${colorGreen}${res[2]}${colorReset}]`);
        console.log(`${insideTest}Compares min amount [${colorBlue}${fee}${colorReset}] with returned value [${colorGreen}${res[3]}${colorReset}]`);
        console.log(`${insideTest}Compares max amount [${colorBlue}${fee}${colorReset}] with returned value [${colorGreen}${res[4]}${colorReset}]`);
        expect(res[0]).equals(tokenAddress);
        expect(res[1]).equals(chainId);
        expect(res[2]).equals(basicFee);
        expect(res[3]).equals(minAmount);
        expect(res[4]).equals(maxAmount);
    });

    it("Withdraw request is available and returns correct value\n", async () => {
        const ERC20MintableInstance = await (await new ERC20PresetMinterPauser__factory(owner).deploy("token", "TOK")).deployed();
        const ERC20HandlerInstance = await (await new ERC20Handler__factory(owner).deploy(bridge.address, someAddress)).deployed();
        const handlerAddress = ERC20HandlerInstance.address;
        const tokenAddress = ERC20MintableInstance.address;
        const numTokens = 10;
        const tokenOwner = owner.address;
        let ownerBalance: BigNumber;
        let handlerBalance: BigNumber;

        console.log(`${insideTest}${colorBlue}Mints${colorReset} tokens ${numTokens}`);
        await ERC20MintableInstance.mint(tokenOwner, numTokens);
        ownerBalance = await ERC20MintableInstance.balanceOf(tokenOwner);
        console.log(`${insideTest}Compares owner balance [${colorBlue}${ownerBalance}${colorReset}] with minted tokens [${colorGreen}${numTokens}${colorReset}]`);
        expect(ownerBalance).equals(numTokens);
        
        console.log(`${insideTest}${colorBlue}Transfers${colorReset} tokens ${numTokens} to handler`);
        await ERC20MintableInstance.transfer(handlerAddress, numTokens);

        ownerBalance = await ERC20MintableInstance.balanceOf(tokenOwner);
        console.log(`${insideTest}Compares owner balance after transfer [${colorBlue}${ownerBalance}${colorReset}] with minted tokens [${colorGreen}${0}${colorReset}]`);
        expect(ownerBalance).equals(0);
        handlerBalance = await ERC20MintableInstance.balanceOf(handlerAddress);
        console.log(`${insideTest}Compares handler balance after transfer [${colorBlue}${handlerBalance}${colorReset}] with minted tokens [${colorGreen}${numTokens}${colorReset}]`);
        expect(handlerBalance).equals(numTokens);

        const withdrawData = Helpers.createERCWithdrawData(tokenAddress, tokenOwner, numTokens);
        
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if sender is not a voter`);
        await expect(dao.connect(newVoterSecond).newWithdrawRequest(handlerAddress, withdrawData)).revertedWith("not a voter"); 
       
        console.log(`${insideTest}Creates new withdraw request`);
        await dao.connect(owner).newWithdrawRequest(handlerAddress, withdrawData);

        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote is already confirmed(true)`);
        await expect(dao.connect(owner).newVoteForWithdrawRequest(true, 1)).revertedWith("already confirmed");
        
        await dao.connect(owner).newVoteForWithdrawRequest(false, 1); 
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if not enough votes`);
        await expect(dao.connect(owner).isWithdrawAvailable(1)).revertedWith("not enough votes");
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote is already removed(false)`);
        await expect(dao.connect(owner).newVoteForWithdrawRequest(false, 1)).revertedWith("not confirmed");
        
        await dao.connect(owner).newVoteForWithdrawRequest(true, 1);

        const res = await dao.connect(owner).isWithdrawAvailable(1);
        console.log(`${insideTest}Compares handler address [${colorBlue}${handlerAddress}${colorReset}] with returned value [${colorGreen}${res[0]}${colorReset}]`);
        console.log(`${insideTest}Compares withdraw data [${colorBlue}${withdrawData}${colorReset}] with returned value [${colorGreen}${res[1]}${colorReset}]`);
        expect(res[0]).equals(handlerAddress);
        expect(res[1]).equals(withdrawData);
    });

    it("Set burnable request is available and returns correct value\n", async () => {
        const ERC20MintableInstance = await (await new ERC20PresetMinterPauser__factory(owner).deploy("token", "TOK")).deployed();
        const ERC20HandlerInstance = await (await new ERC20Handler__factory(owner).deploy(bridge.address, someAddress)).deployed();
        const handlerAddress = ERC20HandlerInstance.address;
        const tokenAddress = ERC20MintableInstance.address;

        console.log(`${insideTest}${colorRed}Reverts${colorReset} if sender is not a voter`);
        await expect(dao.connect(newVoterSecond).newSetBurnableRequest(handlerAddress, tokenAddress)).revertedWith("not a voter"); 
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if handler or token addresses is zero address`);
        await expect(dao.connect(owner).newSetBurnableRequest(zeroAddress, tokenAddress)).revertedWith("zero address"); 
        await expect(dao.connect(owner).newSetBurnableRequest(handlerAddress, zeroAddress)).revertedWith("zero address"); 

        console.log(`${insideTest}Creates new set burnable request`);
        await dao.connect(owner).newSetBurnableRequest(handlerAddress, tokenAddress);

        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote is already confirmed(true)`);
        await expect(dao.connect(owner).newVoteForSetBurnableRequest(true, 1)).revertedWith("already confirmed");
        
        await dao.connect(owner).newVoteForSetBurnableRequest(false, 1); 
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if not enough votes`);
        await expect(dao.connect(owner).isSetBurnableAvailable(1)).revertedWith("not enough votes");
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote is already removed(false)`);
        await expect(dao.connect(owner).newVoteForSetBurnableRequest(false, 1)).revertedWith("not confirmed");
        
        await dao.connect(owner).newVoteForSetBurnableRequest(true, 1);

        const res = await dao.connect(owner).isSetBurnableAvailable(1);
        console.log(`${insideTest}Compares handler address [${colorBlue}${handlerAddress}${colorReset}] with returned value [${colorGreen}${res[0]}${colorReset}]`);
        console.log(`${insideTest}Compares token address [${colorBlue}${tokenAddress}${colorReset}] with returned value [${colorGreen}${res[1]}${colorReset}]`);
        expect(res[0]).equals(handlerAddress);
        expect(res[1]).equals(tokenAddress);
    });

    it("Set nonce request is available and returns correct value\n", async () => {
        const newDomainId = 2;
        const nonce = 121;

        console.log(`${insideTest}${colorRed}Reverts${colorReset} if sender is not a voter`);
        await expect(dao.connect(newVoterSecond).newSetNonceRequest(newDomainId, nonce)).revertedWith("not a voter"); 

        console.log(`${insideTest}Creates new set nonce request`);
        await dao.connect(owner).newSetNonceRequest(newDomainId, nonce);

        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote is already confirmed(true)`);
        await expect(dao.connect(owner).newVoteForSetNonceRequest(true, 1)).revertedWith("already confirmed");
        
        await dao.connect(owner).newVoteForSetNonceRequest(false, 1); 
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if not enough votes`);
        await expect(dao.connect(owner).isSetNonceAvailable(1)).revertedWith("not enough votes");
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote is already removed(false)`);
        await expect(dao.connect(owner).newVoteForSetNonceRequest(false, 1)).revertedWith("not confirmed");
        
        await dao.connect(owner).newVoteForSetNonceRequest(true, 1);

        const res = await dao.connect(owner).isSetNonceAvailable(1);
        console.log(`${insideTest}Compares new domain id [${colorBlue}${newDomainId}${colorReset}] with returned value [${colorGreen}${res[0]}${colorReset}]`);
        console.log(`${insideTest}Compares nonce [${colorBlue}${nonce}${colorReset}] with returned value [${colorGreen}${res[1]}${colorReset}]`);
        expect(res[0]).equals(newDomainId);
        expect(res[1]).equals(nonce);
    });

    it("Set forwarder is available and returns correct value\n", async () => {
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if sender is not a voter`);
        await expect(dao.connect(newVoterSecond).newSetForwarderRequest(newVoterSecond.address, true)).revertedWith("not a voter"); 

        console.log(`${insideTest}Creates new set nonce request`);
        await dao.connect(owner).newSetForwarderRequest(newVoterSecond.address, true);

        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote is already confirmed(true)`);
        await expect(dao.connect(owner).newVoteForSetForwarderRequest(true, 1)).revertedWith("already confirmed");
        
        await dao.connect(owner).newVoteForSetForwarderRequest(false, 1); 
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if not enough votes`);
        await expect(dao.connect(owner).isSetForwarderAvailable(1)).revertedWith("not enough votes");
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote is already removed(false)`);
        await expect(dao.connect(owner).newVoteForSetForwarderRequest(false, 1)).revertedWith("not confirmed");
        
        await dao.connect(owner).newVoteForSetForwarderRequest(true, 1);

        const res = await dao.connect(owner).isSetForwarderAvailable(1);
        console.log(`${insideTest}Compares forwarder address [${colorBlue}${newVoterSecond.address}${colorReset}] with returned value [${colorGreen}${res[0]}${colorReset}]`);
        console.log(`${insideTest}Compares forwarder valid [${colorBlue}${true}${colorReset}] with returned value [${colorGreen}${res[1]}${colorReset}]`);
        expect(res[0]).equals(newVoterSecond.address);
        expect(res[1]).equals(true);
    });

    it("Set generic resource request is available and returns correct value\n", async () => {
        const CentrifugeAssetInstance = await (await new CentrifugeAsset__factory(owner).deploy()).deployed();
        const ERC20HandlerInstance = await (await new GenericHandler__factory(owner).deploy(bridge.address)).deployed();
        const genericHandlerAddress = ERC20HandlerInstance.address;
        const assetAddress = CentrifugeAssetInstance.address;
        const resourceId = Helpers.createResourceID(assetAddress, domainId);
        const depositFunctionSig = "0x00000000";
        const depositFunctionDepositerOffset = 0;
        const executeFunctionSig = "0x00000000";

        console.log(`${insideTest}${colorRed}Reverts${colorReset} if sender is not a voter`);
        await expect(dao.connect(newVoterSecond).newSetGenericResourceRequest(genericHandlerAddress, resourceId, assetAddress, depositFunctionSig, depositFunctionDepositerOffset, executeFunctionSig)).revertedWith("not a voter"); 
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if handler or token addresses is zero address`);
        await expect(dao.connect(owner).newSetGenericResourceRequest(zeroAddress, resourceId, assetAddress, depositFunctionSig, depositFunctionDepositerOffset, executeFunctionSig)).revertedWith("zero address"); 
        await expect(dao.connect(owner).newSetGenericResourceRequest(genericHandlerAddress, resourceId, zeroAddress, depositFunctionSig, depositFunctionDepositerOffset, executeFunctionSig)).revertedWith("zero address"); 

        console.log(`${insideTest}Creates new set generic resource request`);
        await dao.connect(owner).newSetGenericResourceRequest(genericHandlerAddress, resourceId, assetAddress, depositFunctionSig, depositFunctionDepositerOffset, executeFunctionSig);

        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote is already confirmed(true)`);
        await expect(dao.connect(owner).newVoteForSetGenericResourceRequest(true, 1)).revertedWith("already confirmed");
        
        await dao.connect(owner).newVoteForSetGenericResourceRequest(false, 1); 
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if not enough votes`);
        await expect(dao.connect(owner).isSetGenericResourceAvailable(1)).revertedWith("not enough votes");
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote is already removed(false)`);
        await expect(dao.connect(owner).newVoteForSetGenericResourceRequest(false, 1)).revertedWith("not confirmed");
        
        await dao.connect(owner).newVoteForSetGenericResourceRequest(true, 1);

        const res = await dao.connect(owner).isSetGenericResourceAvailable(1);
        console.log(`${insideTest}Compares generic handler address [${colorBlue}${genericHandlerAddress}${colorReset}] with returned value [${colorGreen}${res[0]}${colorReset}]`);
        console.log(`${insideTest}Compares resource id [${colorBlue}${resourceId}${colorReset}] with returned value [${colorGreen}${res[1]}${colorReset}]`);
        console.log(`${insideTest}Compares contract asset address [${colorBlue}${assetAddress}${colorReset}] with returned value [${colorGreen}${res[2]}${colorReset}]`);
        console.log(`${insideTest}Compares deposit function sig [${colorBlue}${depositFunctionSig}${colorReset}] with returned value [${colorGreen}${res[2]}${colorReset}]`);
        console.log(`${insideTest}Compares deposit function depositer offset [${colorBlue}${depositFunctionDepositerOffset}${colorReset}] with returned value [${colorGreen}${res[2]}${colorReset}]`);
        console.log(`${insideTest}Compares execute function sig [${colorBlue}${executeFunctionSig}${colorReset}] with returned value [${colorGreen}${res[2]}${colorReset}]`);
        expect(res[0]).equals(genericHandlerAddress);
        expect(res[1]).equals(resourceId);
        expect(res[2]).equals(assetAddress);
        expect(res[3]).equals(depositFunctionSig);
        expect(res[4]).equals(depositFunctionDepositerOffset);
        expect(res[5]).equals(executeFunctionSig);
    });

    it("Set Treasury request is available and returns correct address\n", async () => {
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if sender is not a voter`);
        await expect(dao.connect(newVoterSecond).newSetTreasuryRequest(newVoterFirst.address)).revertedWith("not a voter"); 
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if new owner is zero address`);
        await expect(dao.connect(owner).newSetTreasuryRequest(zeroAddress)).revertedWith("zero address"); 
       
        console.log(`${insideTest}Creates new owner change request`);
        await dao.connect(owner).newSetTreasuryRequest(newVoterFirst.address);

        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote is already confirmed(true)`);
        await expect(dao.connect(owner).newVoteForSetTreasuryRequest(true, 1)).revertedWith("already confirmed");
        
        await dao.connect(owner).newVoteForSetTreasuryRequest(false, 1); 
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if not enough votes`);
        await expect(dao.connect(owner).isSetTreasuryAvailable(1)).revertedWith("not enough votes");
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if vote is already removed(false)`);
        await expect(dao.connect(owner).newVoteForSetTreasuryRequest(false, 1)).revertedWith("not confirmed");
        
        await dao.connect(owner).newVoteForSetTreasuryRequest(true, 1);

        const address = await dao.connect(owner).isSetTreasuryAvailable(1);
        console.log(`${insideTest}Compares treasury address [${colorBlue}${newVoterFirst.address}${colorReset}] with returned value: [${colorGreen}${address}${colorReset}]`);
        expect(newVoterFirst.address).equals(address);
    });
})