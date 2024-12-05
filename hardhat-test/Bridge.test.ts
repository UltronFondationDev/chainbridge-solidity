import {ethers} from "hardhat";
import { DAO, DAO__factory, Bridge, Bridge__factory, ERC20Handler__factory, 
GenericHandler__factory, ERC20PresetMinterPauser__factory, CentrifugeAsset__factory } from "../typechain";
import {expect} from "chai";
import * as Helpers from "./helpers";
import { BigNumber, utils } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import exp from "constants";

describe("\x1b[33mBridge test\x1b[0m\n", () => {
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
    const feeMaxValue = 10000;
    const feePercent = 10;
    const expiry = 100;
    let ADMIN_ROLE: utils.BytesLike;

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
        
        await bridge.setDAOContractInitial(dao.address);
        console.log(`${beforeTest}${colorBlue}Inserted${colorReset} initial dao address to bridge: ${colorGreen}${dao.address}${colorReset}`);    
        
        ADMIN_ROLE = await bridge.DEFAULT_ADMIN_ROLE();
    });

    it("DAO contract address is setted\n", async () => {
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if bridge address is already set`);
        await expect(bridge.setDAOContractInitial(dao.address)).revertedWith("already set");
    });

    it("Owner change request execution\n", async () => {   
        console.log(`${insideTest}Creates new owner change request`);    
        await dao.connect(owner).newOwnerChangeRequest(newVoterFirst.address);

        console.log(`${insideTest}${colorBlue}Changing${colorReset} owner`);         
        await bridge.connect(owner).renounceAdmin(1);
        console.log(`${insideTest}Compares admin_role [${colorBlue}${ADMIN_ROLE}${colorReset}] with returned value: [${colorGreen}${newVoterFirst.address}${colorReset}]`);
        expect(bridge.hasRole(ADMIN_ROLE, newVoterFirst.address))
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if owner request is not active`);
        await expect(dao.connect(owner).isOwnerChangeAvailable(1)).revertedWith("not active");
    });

    it("Pause status(pausing/unpausing) request execution\n", async () => {  
        console.log(`${insideTest}Creates new pause status request`);    
        await dao.connect(owner).newPauseStatusRequest(true);

        console.log(`${insideTest}${colorBlue}Pausing${colorReset}`);         
        await bridge.connect(owner).adminPauseStatusTransfers(1);
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if pause status request is not active`);
        await expect(dao.connect(owner).isPauseStatusAvailable(1)).revertedWith("not active");
    
        console.log(`${insideTest}Creates new pause status request`);    
        await dao.connect(owner).newPauseStatusRequest(false);
        console.log(`${insideTest}${colorBlue}Unpausing${colorReset}`);         
        await bridge.connect(owner).adminPauseStatusTransfers(2);
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if pause status request is not active`);
        await expect(dao.connect(owner).isPauseStatusAvailable(2)).revertedWith("not active");
    });

    it("Change relayer threshold execution\n", async () => {
        const amount = 4;
        console.log(`${insideTest}Creates new change relayer threshold request`);    
        await dao.connect(owner).newChangeRelayerThresholdRequest(amount);
        
        console.log(`${insideTest}${colorBlue}Changing relayer threshold amount${colorReset}`);         
        await bridge.connect(owner).adminChangeRelayerThreshold(1);
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if change relayer threshold request is not active`);
        await expect(dao.connect(owner).isChangeRelayerThresholdAvailable(1)).revertedWith("not active");
    });

    it("Set resource request execution\n", async () => {
        const ERC20MintableInstance = await (await new ERC20PresetMinterPauser__factory(owner).deploy("token", "TOK")).deployed();
        const ERC20HandlerInstance = await (await new ERC20Handler__factory(owner).deploy(bridge.address, someAddress)).deployed();
        const handlerAddress = ERC20HandlerInstance.address;
        const tokenAddress = ERC20MintableInstance.address;
        const resourceId = Helpers.createResourceID(tokenAddress, domainId);

        console.log(`${insideTest}Creates new set resource request`);    
        await dao.connect(owner).newSetResourceRequest(handlerAddress, resourceId, tokenAddress);

        console.log(`${insideTest}${colorBlue}Setting resource${colorReset}`);         
        await bridge.connect(owner).adminSetResource(1);
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if set resource request is not active`);
        await expect(dao.connect(owner).isSetResourceAvailable(1)).revertedWith("not active");
    });

    it("Change fee request execution\n", async () => {
        const ERC20MintableInstance = await (await new ERC20PresetMinterPauser__factory(owner).deploy("token", "TOK")).deployed();
        const tokenAddress = ERC20MintableInstance.address;
        const chainId = 0x1;
        const basicFee = ethers.utils.parseEther("10");
        const minAmount = ethers.utils.parseEther("10");
        const maxAmount = ethers.utils.parseEther("100000");

        console.log(`${insideTest}Creates new change fee request`);    
        await dao.connect(owner).newChangeFeeRequest(tokenAddress, chainId, basicFee, minAmount, maxAmount);

        console.log(`${insideTest}${colorBlue}Changing fee${colorReset}`);         
        await bridge.connect(owner).adminChangeFee(1);
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if change fee request is not active`);
        await expect(dao.connect(owner).isChangeFeeAvailable(1)).revertedWith("not active");
    });

    it("Change fee percent request execution\n", async () => {
        const feeMaxValue = 1000;
        const feePercent = 1;

        console.log(`${insideTest}Creates new change fee percent request`);    
        await dao.connect(owner).newChangeFeePercentRequest(feeMaxValue, feePercent);

        console.log(`${insideTest}${colorBlue}Changing fee percent${colorReset}`);         
        await bridge.connect(owner).adminChangeFeePercent(1);
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if change fee percent request is not active`);
        await expect(dao.connect(owner).isChangeFeePercentAvailable(1)).revertedWith("not active");
    });

    it("Withdraw request execution\n", async () => {
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
        
        console.log(`${insideTest}Creates new withdraw request`);    
        await dao.connect(owner).newWithdrawRequest(handlerAddress, withdrawData);

        console.log(`${insideTest}${colorBlue}Withdrawing${colorReset}`);         
        await bridge.connect(owner).adminWithdraw(1);
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if withdraw request is not active`);
        await expect(dao.connect(owner).isWithdrawAvailable(1)).revertedWith("not active");
    });

    it("Set burnable request execution\n", async () => {
        const ERC20MintableInstance = await (await new ERC20PresetMinterPauser__factory(owner).deploy("token", "TOK")).deployed();
        const ERC20HandlerInstance = await (await new ERC20Handler__factory(owner).deploy(bridge.address, someAddress)).deployed();
        const handlerAddress = ERC20HandlerInstance.address;
        const tokenAddress = ERC20MintableInstance.address;
        const resourceId = Helpers.createResourceID(tokenAddress, domainId);

        console.log(`${insideTest}Creates new set resource request`);    
        await dao.connect(owner).newSetResourceRequest(handlerAddress, resourceId, tokenAddress);

        console.log(`${insideTest}${colorBlue}Setting resource${colorReset}`);         
        await bridge.connect(owner).adminSetResource(2);
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if set resource request is not active`);
        await expect(dao.connect(owner).isSetResourceAvailable(2)).revertedWith("not active");

        console.log(`${insideTest}Creates new set burnable request`);    
        await dao.connect(owner).newSetBurnableRequest(handlerAddress, tokenAddress);

        console.log(`${insideTest}${colorBlue}Setting burnable${colorReset}`);         
        await bridge.connect(owner).adminSetBurnable(1);
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if set burnable is not active`);
        await expect(dao.connect(owner).isSetBurnableAvailable(1)).revertedWith("not active");
    });

    it("Set nonce request execution\n", async () => {
        const newDomainId = 2;
        const nonce = 121;

        console.log(`${insideTest}Creates new set nonce request`);    
        await dao.connect(owner).newSetNonceRequest(newDomainId, nonce);

        console.log(`${insideTest}${colorBlue}Setting nonce${colorReset}`);         
        await bridge.connect(owner).adminSetDepositNonce(1);
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if set nonce request is not active`);
        await expect(dao.connect(owner).isSetNonceAvailable(1)).revertedWith("not active");
    });

    it("Set forwarder execution\n", async () => {
        console.log(`${insideTest}Creates new set forwarder request`);    
        await dao.connect(owner).newSetForwarderRequest(newVoterSecond.address, true);

        console.log(`${insideTest}${colorBlue}Setting forwarder${colorReset}`);         
        await bridge.connect(owner).adminSetForwarder(1);
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if set forwarder request is not active`);
        await expect(dao.connect(owner).isSetForwarderAvailable(1)).revertedWith("not active");
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

        console.log(`${insideTest}Creates new set generic resource request`);    
        await dao.connect(owner).newSetGenericResourceRequest(genericHandlerAddress, resourceId, assetAddress, depositFunctionSig, depositFunctionDepositerOffset, executeFunctionSig);

        console.log(`${insideTest}${colorBlue}Setting generic resource${colorReset}`);         
        await bridge.connect(owner).adminSetGenericResource(1);
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if set generic resource request is not active`);
        await expect(dao.connect(owner).isSetGenericResourceAvailable(1)).revertedWith("not active");
    });

    it("Transfer request execution\n", async () => {
        let payout = ethers.utils.parseEther("0.5")
        const addreses:string[] = [owner.address, voterFirst.address];
        const amounts = [payout, payout];

        const CentrifugeAssetInstance = await (await new CentrifugeAsset__factory(owner).deploy()).deployed();
        const assetAddress = CentrifugeAssetInstance.address;
        const ERC20HandlerInstance = await (await new GenericHandler__factory(owner).deploy(bridge.address)).deployed();
        const genericHandlerAddress = ERC20HandlerInstance.address;
        const blankFunctionSig = '0x00000000';
        const blankFunctionDepositerOffset = 0;
        const originDomainID = 1;
        const destinationDomainID = 2;
        const resourceId = Helpers.createResourceID(assetAddress, originDomainID)
        const depositData = Helpers.createGenericDepositData('0xdeadbeef');
        const initialContractAddresses = [assetAddress];
        const initialDepositFunctionSignatures = [blankFunctionSig];
        const initialDepositFunctionDepositerOffsets = [blankFunctionDepositerOffset];
        const initialExecuteFunctionSignatures = [blankFunctionSig];

        await dao.connect(owner).newSetGenericResourceRequest(genericHandlerAddress, resourceId,  initialContractAddresses[0], initialDepositFunctionSignatures[0], initialDepositFunctionDepositerOffsets[0], initialExecuteFunctionSignatures[0])
        await bridge.adminSetGenericResource(2);

        await bridge.deposit(destinationDomainID, resourceId, depositData, {value: ethers.utils.parseEther("1")})

        console.log(`${insideTest}Creates new transfer request`);    
        await dao.connect(owner).newTransferRequest(addreses, amounts);

        console.log(`${insideTest}${colorBlue}Transferring${colorReset} funds`);         
        await bridge.connect(owner).transferFunds(1);
        console.log(`${insideTest}${colorRed}Reverts${colorReset} if owner request is not active`);
        await expect(dao.connect(owner).isTransferAvailable(1)).revertedWith("not active");
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