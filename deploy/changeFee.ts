import { BigNumberish } from "ethers";
import { subtask, task } from "hardhat/config";
import * as Helpers from "../hardhat-test/helpers";
import { Token, TokenFee, TokenResourceId } from "./tokenFee";

const ultronDomainId:number = 1;
const ethereumDomainId:number = 2;
const bscDomainId:number = 3;
const avalancheDomainId:number = 4;
const polygonDomainId:number = 5;
const fantomDomainId:number = 6;
const baseDomainId:number = 7;

/*========== Change FEE ==========*/
task("fee-ultron", "Changing fee for ultron tokens")      
    .setAction(async (_, { ethers, network }) => {
        if(network.name !== "ultron") {
            console.info("Should be ultron network!");
            return;
        }

        const signer = (await ethers.getSigners())[0];

        const bridgeAddress = "0x61488630B3337b9b897eF3A0AB47CB180399CEa3";
        const erc20HandlerAddress = "0xc078626DA5C09DC63A7c5C0c030f431EFfF098b8";
        const daoAddress = "0x6025adaD5b1EAC55f24e3e4783E0e881428017e8";

        // // Old used for first tests:
        // const bridgeAddress = "0xC453C52f794661C2c0856936e13df67F0eB82f9e";
        // const daoAddress = "0xc4A47D97070Dd02F4544a12859f6A23592C8194B";
        // const erc20HandlerAddress = "0x6d5a23B55CBDB0Fc7b48794d806f0bcE7Dca99E1";

        const bridge = await ethers.getContractAt("Bridge", bridgeAddress, signer);
        const DAO = await ethers.getContractAt("DAO", daoAddress, signer);
        const domainId:BigNumberish = await bridge._domainID(); 
        
        const tokenAddresses = [
            new Token("wULX",  "0x3a4F06431457de873B588846d139EC0d86275d54"), 
            // new Token("WBTC",  "0xd2b86a80A8f30b83843e247A50eCDc8D843D87dD"), 
            // new Token("WETH",  "0x2318Bf5809a72AaBAdd15a3453A18e50Bbd651Cd"), 
            // new Token("BNB",   "0x169ac560852ed79af3D97A8977DCf2EBA54A0488"), 
            // new Token("AVAX",  "0x6FE94412953D373Ef464b85637218EFA9EAB8e97"), 
            // new Token("BUSD",  "0xc7cAc85C1779d2B8ADA94EFfff49A4754865e2E4"), // REMOVED
            // new Token("SHIB",  "0xb5Bb1911cf6C83C1a6E439951C40C2949B0d907f"), 
            // new Token("MATIC", "0x6094a1e3919b302E236B447f45c4eb2DeCE9D9F4"),
            // new Token("FTM",   "0xE8Ef8A6FE387C2D10951a63ca8f37dB6B8fA02C1"), 
            // new Token("DAI",   "0x045F0f2DE758743c84b756B1Fca735a0dDf0b8f4"),
            // new Token("LINK",  "0xc8Fb7999d62072E12fE8f3EDcd7821204FCa0344"), 
            new Token("uUSDT", "0x97FDd294024f50c388e39e73F1705a35cfE87656"),
            new Token("uUSDC", "0x3c4E0FdeD74876295Ca36F62da289F69E3929cc4"),

            // new Token("bep_uUSDT", "0xB8160f15D44604E892Ac52eC4CCBfDA3cafbFDbd"),
            // new Token("bep_uUSDC", "0x06d522b2118d535978382d9533a68B0b110f9BC2"),

            // new Token("DOGE",  "0x01458EFbC8f290d226A7EeaE6A351e74f49B53db"),
            // new Token("XRP",   "0xA277fD3CF60cd2C37A07bccFC108990293DBF58b"),
            // new Token("ADA",   "0x2867cC0Ae16409003A41Ff57230a992E24CD5847"),
            // new Token("DOT",   "0xFF1180c58Ff4F63c4dB2E2835980d860B9D4A6AC"),
            // new Token("UNI",   "0xFd697C6dF70D6164CE11F8477cbFf01458FA87Cc"),
            // new Token("ATOM",  "0x943E6790FA94686F6FFB0996Cd92eC5313cb6B86"),
            // new Token("AAVE",  "0xdbD8077180eBa0711A2336Cc54F05a91685F3FF7"),
            // new Token("AXS",   "0x64f9D58a03B7f303b836CE733674F85AC494E616"),
            // new Token("SAND",  "0xA620B6b7f2507a184e56200F36C266779bDd8d69"),
            // new Token("MANA",  "0x9CD5123e6FBaAA72604884F90dC37e91Ba3A806B"),
            // new Token("CAKE",  "0xB76EEbE588B6Ad1525b26d077D38DE7D298E0485"),
            // new Token("NEAR",  "0x44d5F333cAED3b70Cad92CCa4C63F397B2E89aa6"),
            // new Token("1INCH", "0xC757848bb5a7e2539b4b6F61176879199822A79B"),
            // new Token("FLUX",  "0x0681ed2D9EbFe37b12622c270eD0C534528fC673"),
            // new Token("TRX",   "0x5Aa4D9b8DB3a6413408Cb31E77bc03867A845485"),

            // new Token("CRV",   "0xAa4f71EB8d3B28a535E9bDcc48280D64A10125bE"),
            // new Token("APE",   "0x8FCce7ce7078bfd3cB217D9a1604140c47cdA509"),
            // new Token("LDO",   "0x9743FbdAfE350B8D5dF5Bf445918BeF3C0D19ddb"),
            // new Token("VET",   "0xd3ECeEd56da398aB32C7B997b29dBFA377fA0Cb1"),
            // new Token("EGLD",  "0x1869e04426974e3fF82417692Cc610c15f4F56d1"),
            // new Token("SNX",   "0x167536058b060E38e07B6defAbcD74d169b8fCAD"),

            // new Token("PEPE",  "0x2e29eab368c30E692B9805084C0D3B07215D7762"),
            new Token("AK1111",  "0x52b502e0c7986A3c705DCf411E768e5cE90c87ec"),
        ];

        const iterator = +(await DAO.getChangeFeeRequestCount()) + 1;
        console.info(iterator);

        // for(let i = 1; i <= tokenAddresses.length; i++) {
        //     console.info(`${tokenAddresses[i - 1].tokenName} ${network.name} ${await bridge.getFee(Helpers.findToken(tokenAddresses, tokenAddresses[i - 1].tokenName), domainId)}`)
        //     console.info(`${tokenAddresses[i - 1].tokenName} ETH ${await bridge.getFee(Helpers.findToken(tokenAddresses, tokenAddresses[i - 1].tokenName), ethereumDomainId)}`)    
        //     console.info(`${tokenAddresses[i - 1].tokenName} BSC ${await bridge.getFee(Helpers.findToken(tokenAddresses, tokenAddresses[i - 1].tokenName), bscDomainId)}`)    
        //     console.info(`${tokenAddresses[i - 1].tokenName} AVAX ${await bridge.getFee(Helpers.findToken(tokenAddresses, tokenAddresses[i - 1].tokenName), avalancheDomainId)}`)    
        //     console.info(`${tokenAddresses[i - 1].tokenName} MATIC ${await bridge.getFee(Helpers.findToken(tokenAddresses, tokenAddresses[i - 1].tokenName), polygonDomainId)}`)    
        //     console.info(`${tokenAddresses[i - 1].tokenName} FTM ${await bridge.getFee(Helpers.findToken(tokenAddresses, tokenAddresses[i - 1].tokenName), fantomDomainId)}`)    
        //     console.info(`${tokenAddresses[i - 1].tokenName} BASE ${await bridge.getFee(Helpers.findToken(tokenAddresses, tokenAddresses[i - 1].tokenName), baseDomainId)}`)    
        // }

        // // Already set

        // // wULX
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "wULX"), domainId, Helpers.parseDecimals(24, 18), Helpers.parseDecimals(48, 18), Helpers.parseDecimals(50000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "wULX"), ethereumDomainId, Helpers.parseDecimals(600, 18), Helpers.parseDecimals(800, 18), Helpers.parseDecimals(50000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "wULX"), bscDomainId, Helpers.parseDecimals(24, 18), Helpers.parseDecimals(48, 18), Helpers.parseDecimals(50000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "wULX"), avalancheDomainId, Helpers.parseDecimals(24, 18), Helpers.parseDecimals(48, 18), Helpers.parseDecimals(50000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "wULX"), polygonDomainId, Helpers.parseDecimals(24, 18), Helpers.parseDecimals(48, 18), Helpers.parseDecimals(50000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "wULX"), fantomDomainId, Helpers.parseDecimals(24, 18), Helpers.parseDecimals(48, 18), Helpers.parseDecimals(50000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "wULX"), baseDomainId, Helpers.parseDecimals(24, 18), Helpers.parseDecimals(48, 18), Helpers.parseDecimals(50000000, 18));
        // await Helpers.delay(4000);

        // // WBTC
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WBTC"), domainId, Helpers.parseDecimals(0.00002, 18), Helpers.parseDecimals(0.0002, 18), Helpers.parseDecimals(430, 18));
        // await Helpers.delay(4000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WBTC"), ethereumDomainId, Helpers.parseDecimals(0.0013, 18), Helpers.parseDecimals(0.003, 18), Helpers.parseDecimals(1000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WBTC"), bscDomainId, Helpers.parseDecimals(0.00002, 18), Helpers.parseDecimals(0.0002, 18), Helpers.parseDecimals(430, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WBTC"), avalancheDomainId, Helpers.parseDecimals(0.000045, 18), Helpers.parseDecimals(0.0002, 18), Helpers.parseDecimals(430, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WBTC"), polygonDomainId,Helpers.parseDecimals(0.00002, 18), Helpers.parseDecimals(0.0002, 18), Helpers.parseDecimals(430, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WBTC"), fantomDomainId, Helpers.parseDecimals(0.000045, 18), Helpers.parseDecimals(0.0002, 18), Helpers.parseDecimals(430, 18));
        // await Helpers.delay(4000);

        // // WETH
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WETH"), ultronDomainId, Helpers.parseDecimals(0.0003, 18), Helpers.parseDecimals(0.006, 18), Helpers.parseDecimals(9640, 18));
        // await Helpers.delay(4000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WETH"), ethereumDomainId, Helpers.parseDecimals(0.02, 18), Helpers.parseDecimals(0.05, 18), Helpers.parseDecimals(13000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WETH"), bscDomainId, Helpers.parseDecimals(0.0003, 18), Helpers.parseDecimals(0.006, 18), Helpers.parseDecimals(9640, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WETH"), avalancheDomainId, Helpers.parseDecimals(0.0006, 18), Helpers.parseDecimals(0.006, 18), Helpers.parseDecimals(9640, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WETH"), polygonDomainId, Helpers.parseDecimals(0.0003, 18), Helpers.parseDecimals(0.006, 18), Helpers.parseDecimals(9640, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WETH"), fantomDomainId, Helpers.parseDecimals(0.0006, 18), Helpers.parseDecimals(0.006, 18), Helpers.parseDecimals(9640, 18));
        // await Helpers.delay(4000);

        // // BNB
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "BNB"), domainId, Helpers.parseDecimals(0.022, 18), Helpers.parseDecimals(0.044, 18), Helpers.parseDecimals(7500, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "BNB"), bscDomainId, Helpers.parseDecimals(0.022, 18), Helpers.parseDecimals(0.044, 18), Helpers.parseDecimals(7500, 18));
        // await Helpers.delay(4000);

        // // AVAX 
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AVAX"), domainId, Helpers.parseDecimals(0.08, 18), Helpers.parseDecimals(0.16, 18), Helpers.parseDecimals(80000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AVAX"), bscDomainId, Helpers.parseDecimals(0.08, 18), Helpers.parseDecimals(0.16, 18), Helpers.parseDecimals(80000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AVAX"), avalancheDomainId, Helpers.parseDecimals(0.08, 18), Helpers.parseDecimals(0.16, 18), Helpers.parseDecimals(80000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AVAX"), fantomDomainId, Helpers.parseDecimals(0.08, 18), Helpers.parseDecimals(0.16, 18), Helpers.parseDecimals(80000, 18));
        // await Helpers.delay(4000);
        
        // // SHIB
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SHIB"), domainId, Helpers.parseDecimals(1112.5, 18), Helpers.parseDecimals(1112500, 18), Helpers.parseDecimals(620000000000, 18));
        // await Helpers.delay(4000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SHIB"), ethereumDomainId, Helpers.parseDecimals(1112500, 18), Helpers.parseDecimals(28000000, 18), Helpers.parseDecimals(620000000000, 18));
        // await Helpers.delay(4000);

        // // MATIC
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "MATIC"), domainId, Helpers.parseDecimals(1.8, 18), Helpers.parseDecimals(3.6, 18), Helpers.parseDecimals(2500000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "MATIC"), polygonDomainId, Helpers.parseDecimals(3.43, 18), Helpers.parseDecimals(34.3, 18), Helpers.parseDecimals(3500000, 18));
        // await Helpers.delay(4000);

        // // FTM
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "FTM"), domainId, Helpers.parseDecimals(1.7, 18), Helpers.parseDecimals(3.4, 18), Helpers.parseDecimals(1700000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "FTM"), ethereumDomainId, Helpers.parseDecimals(53.5, 18), Helpers.parseDecimals(60, 18), Helpers.parseDecimals(2500000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "FTM"), bscDomainId, Helpers.parseDecimals(2.4, 18), Helpers.parseDecimals(4.8, 18), Helpers.parseDecimals(2500000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "FTM"), fantomDomainId, Helpers.parseDecimals(1.7, 18), Helpers.parseDecimals(3.4, 18), Helpers.parseDecimals(1700000, 18));
        // await Helpers.delay(4000);
        
        // // LINK
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "LINK"), domainId, Helpers.parseDecimals(0.00273, 18), Helpers.parseDecimals(2.73, 18), Helpers.parseDecimals(230000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "LINK"), ethereumDomainId, Helpers.parseDecimals(2.73, 18), Helpers.parseDecimals(7, 18), Helpers.parseDecimals(230000, 18));
        // await Helpers.delay(4000);

        // // DAI
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "DAI"), domainId, Helpers.parseDecimals(0.9, 18), Helpers.parseDecimals(12, 18), Helpers.parseDecimals(2000000, 18));
        // await Helpers.delay(4000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "DAI"), ethereumDomainId, Helpers.parseDecimals(40, 18), Helpers.parseDecimals(200, 18), Helpers.parseDecimals(50000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "DAI"), bscDomainId, Helpers.parseDecimals(0.9, 18), Helpers.parseDecimals(12, 18), Helpers.parseDecimals(20000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "DAI"), avalancheDomainId, Helpers.parseDecimals(1.9, 18), Helpers.parseDecimals(12, 18), Helpers.parseDecimals(20000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "DAI"), polygonDomainId, Helpers.parseDecimals(0.9, 18), Helpers.parseDecimals(12, 18), Helpers.parseDecimals(2000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "DAI"), fantomDomainId, Helpers.parseDecimals(1.9, 18), Helpers.parseDecimals(12, 18), Helpers.parseDecimals(2000000, 18));
        // await Helpers.delay(4000);
        
        // // BUSD
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "BUSD"), domainId, Helpers.parseDecimals(99999999999998, 18), Helpers.parseDecimals(99999999999999, 18), Helpers.parseDecimals(100000000000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "BUSD"), bscDomainId, Helpers.parseDecimals(99999999999998, 18), Helpers.parseDecimals(99999999999999, 18), Helpers.parseDecimals(100000000000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "BUSD"), avalancheDomainId, Helpers.parseDecimals(99999999999998, 18), Helpers.parseDecimals(99999999999999, 18), Helpers.parseDecimals(100000000000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "BUSD"), polygonDomainId, Helpers.parseDecimals(99999999999998, 18), Helpers.parseDecimals(99999999999999, 18), Helpers.parseDecimals(100000000000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "BUSD"), fantomDomainId, Helpers.parseDecimals(99999999999998, 18), Helpers.parseDecimals(99999999999999, 18), Helpers.parseDecimals(100000000000000, 18));
        // await Helpers.delay(4000);

        // // uUSDT
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "uUSDT"), domainId, Helpers.parseDecimals(0.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(2000000, 6));
        // await Helpers.delay(4000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "uUSDT"), ethereumDomainId, Helpers.parseDecimals(40, 6), Helpers.parseDecimals(200, 6), Helpers.parseDecimals(50000000, 6));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "uUSDT"), bscDomainId, Helpers.parseDecimals(0.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(20000000, 6));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "uUSDT"), avalancheDomainId, Helpers.parseDecimals(1.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(20000000, 6));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "uUSDT"), polygonDomainId, Helpers.parseDecimals(0.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(2000000, 6));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "uUSDT"), fantomDomainId, Helpers.parseDecimals(1.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(2000000, 6));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "uUSDT"), baseDomainId, Helpers.parseDecimals(0.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(2000000, 6));
        // await Helpers.delay(4000);

        // // uUSDC
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "uUSDC"), domainId, Helpers.parseDecimals(0.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(2000000, 6));
        // await Helpers.delay(4000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "uUSDC"), ethereumDomainId, Helpers.parseDecimals(40, 6), Helpers.parseDecimals(200, 6), Helpers.parseDecimals(50000000, 6));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "uUSDC"), bscDomainId, Helpers.parseDecimals(0.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(20000000, 6));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "uUSDC"), avalancheDomainId, Helpers.parseDecimals(1.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(20000000, 6));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "uUSDC"), polygonDomainId, Helpers.parseDecimals(0.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(2000000, 6));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "uUSDC"), fantomDomainId, Helpers.parseDecimals(1.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(2000000, 6));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "uUSDC"), baseDomainId, Helpers.parseDecimals(0.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(2000000, 6));
        // await Helpers.delay(4000);

        // // DOGE
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "DOGE"), domainId, Helpers.parseDecimals(2.32, 8), Helpers.parseDecimals(120, 8), Helpers.parseDecimals(500000000, 8));
        // await Helpers.delay(4000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "DOGE"), bscDomainId, Helpers.parseDecimals(2.32, 8), Helpers.parseDecimals(120, 8), Helpers.parseDecimals(500000000, 8));
        // await Helpers.delay(4000);

        // // XRP
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "XRP"), domainId, Helpers.parseDecimals(0.5, 18), Helpers.parseDecimals(24.5, 18), Helpers.parseDecimals(2500000, 18));
        // await Helpers.delay(4000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "XRP"), bscDomainId, Helpers.parseDecimals(0.5, 18), Helpers.parseDecimals(24.5, 18), Helpers.parseDecimals(2500000, 18));
        // await Helpers.delay(4000);

        // // ADA
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "ADA"), domainId, Helpers.parseDecimals(0.5, 18), Helpers.parseDecimals(27, 18), Helpers.parseDecimals(2700000, 18));
        // await Helpers.delay(4000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "ADA"), bscDomainId, Helpers.parseDecimals(0.5, 18), Helpers.parseDecimals(27, 18), Helpers.parseDecimals(2700000, 18));
        // await Helpers.delay(4000);

        // // DOT
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "DOT"), domainId, Helpers.parseDecimals(0.032, 18), Helpers.parseDecimals(1.58, 18), Helpers.parseDecimals(1500000, 18));
        // await Helpers.delay(4000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "DOT"), bscDomainId, Helpers.parseDecimals(0.032, 18), Helpers.parseDecimals(1.58, 18), Helpers.parseDecimals(1500000, 18));
        // await Helpers.delay(4000);

        // // UNI
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "UNI"), domainId, Helpers.parseDecimals(0.27, 18), Helpers.parseDecimals(0.54, 18), Helpers.parseDecimals(3000000, 18));
        // await Helpers.delay(4000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "UNI"), ethereumDomainId, Helpers.parseDecimals(7.23, 18), Helpers.parseDecimals(7.59, 18), Helpers.parseDecimals(3000000, 18));
        // await Helpers.delay(4000);
                
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "UNI"), bscDomainId, Helpers.parseDecimals(0.27, 18), Helpers.parseDecimals(0.54, 18), Helpers.parseDecimals(3000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "UNI"), polygonDomainId, Helpers.parseDecimals(0.27, 18), Helpers.parseDecimals(0.54, 18), Helpers.parseDecimals(3000000, 18));
        // await Helpers.delay(4000);

        // // ATOM
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "ATOM"), domainId, Helpers.parseDecimals(0.015, 18), Helpers.parseDecimals(0.76, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);
                
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "ATOM"), bscDomainId, Helpers.parseDecimals(0.015, 18), Helpers.parseDecimals(0.76, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "ATOM"), polygonDomainId, Helpers.parseDecimals(0.015, 6), Helpers.parseDecimals(0.76, 6), Helpers.parseDecimals(1000000, 6));
        // await Helpers.delay(4000);

        // // AAVE
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AAVE"), domainId, Helpers.parseDecimals(0.016, 18), Helpers.parseDecimals(0.032, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AAVE"), ethereumDomainId, Helpers.parseDecimals(0.58, 18), Helpers.parseDecimals(1, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);
                
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AAVE"), bscDomainId, Helpers.parseDecimals(0.016, 18), Helpers.parseDecimals(0.032, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AAVE"), avalancheDomainId, Helpers.parseDecimals(0.016, 18), Helpers.parseDecimals(0.032, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AAVE"), polygonDomainId, Helpers.parseDecimals(0.016, 18), Helpers.parseDecimals(0.032, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AAVE"), fantomDomainId, Helpers.parseDecimals(0.016, 18), Helpers.parseDecimals(0.032, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // AXS
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AXS"), domainId, Helpers.parseDecimals(0.016, 18), Helpers.parseDecimals(0.032, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AXS"), ethereumDomainId, Helpers.parseDecimals(4.77, 18), Helpers.parseDecimals(5, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);
                
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AXS"), bscDomainId, Helpers.parseDecimals(0.016, 18), Helpers.parseDecimals(0.032, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AXS"), polygonDomainId, Helpers.parseDecimals(0.016, 18), Helpers.parseDecimals(0.032, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // SAND
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SAND"), domainId, Helpers.parseDecimals(0.27, 18), Helpers.parseDecimals(0.85, 18), Helpers.parseDecimals(6500000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SAND"), ethereumDomainId, Helpers.parseDecimals(66.67, 18), Helpers.parseDecimals(70, 18), Helpers.parseDecimals(6500000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SAND"), bscDomainId, Helpers.parseDecimals(0.27, 18), Helpers.parseDecimals(0.85, 18), Helpers.parseDecimals(6500000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SAND"), polygonDomainId, Helpers.parseDecimals(0.27, 18), Helpers.parseDecimals(0.85, 18), Helpers.parseDecimals(6500000, 18));
        // await Helpers.delay(4000);

        // // MANA
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "MANA"), domainId, Helpers.parseDecimals(0.3, 18), Helpers.parseDecimals(13.5, 18), Helpers.parseDecimals(70000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "MANA"), ethereumDomainId, Helpers.parseDecimals(72.46, 18), Helpers.parseDecimals(76, 18), Helpers.parseDecimals(70000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "MANA"), bscDomainId, Helpers.parseDecimals(0.3, 18), Helpers.parseDecimals(13.5, 18), Helpers.parseDecimals(70000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "MANA"), polygonDomainId, Helpers.parseDecimals(0.3, 18), Helpers.parseDecimals(13.5, 18), Helpers.parseDecimals(70000000, 18));
        // await Helpers.delay(4000);

        // // CAKE
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "CAKE"), domainId, Helpers.parseDecimals(0.05, 18), Helpers.parseDecimals(2.5, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);
                
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "CAKE"), bscDomainId, Helpers.parseDecimals(0.05, 18), Helpers.parseDecimals(2.5, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // NEAR
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "NEAR"), domainId, Helpers.parseDecimals(0.08, 18), Helpers.parseDecimals(4, 18), Helpers.parseDecimals(2000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "NEAR"), ethereumDomainId, Helpers.parseDecimals(20.33, 18), Helpers.parseDecimals(21.35, 18), Helpers.parseDecimals(2000000, 18));
        // await Helpers.delay(4000);
                
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "NEAR"), bscDomainId, Helpers.parseDecimals(0.08, 18), Helpers.parseDecimals(4, 18), Helpers.parseDecimals(2000000, 18));
        // await Helpers.delay(4000);

        // // 1INCH
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "1INCH"), domainId, Helpers.parseDecimals(0.4, 18), Helpers.parseDecimals(4, 18), Helpers.parseDecimals(9000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "1INCH"), ethereumDomainId, Helpers.parseDecimals(62.5, 18), Helpers.parseDecimals(66, 18), Helpers.parseDecimals(9000000, 18));
        // await Helpers.delay(4000);
                
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "1INCH"), bscDomainId, Helpers.parseDecimals(0.4, 18), Helpers.parseDecimals(4, 18), Helpers.parseDecimals(9000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "1INCH"), avalancheDomainId, Helpers.parseDecimals(0.4, 18), Helpers.parseDecimals(4, 18), Helpers.parseDecimals(9000000, 18));
        // await Helpers.delay(4000);
                
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "1INCH"), polygonDomainId, Helpers.parseDecimals(0.5, 18), Helpers.parseDecimals(4, 18), Helpers.parseDecimals(9000000, 18));
        // await Helpers.delay(4000);

        // // FLUX
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "FLUX"), domainId, Helpers.parseDecimals(0.3, 8), Helpers.parseDecimals(15, 8), Helpers.parseDecimals(2000000, 8));
        // await Helpers.delay(4000);
                
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "FLUX"), bscDomainId, Helpers.parseDecimals(0.3, 8), Helpers.parseDecimals(15, 8), Helpers.parseDecimals(2000000, 8));
        // await Helpers.delay(4000);

        // // TRX
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "TRX"), domainId, Helpers.parseDecimals(3.28, 18), Helpers.parseDecimals(164, 18), Helpers.parseDecimals(2000000, 18));
        // await Helpers.delay(4000);
                
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "TRX"), bscDomainId, Helpers.parseDecimals(3.28, 18), Helpers.parseDecimals(164, 18), Helpers.parseDecimals(2000000, 18));
        // await Helpers.delay(4000);

        // // CRV
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "CRV"), domainId, Helpers.parseDecimals(0.2, 18), Helpers.parseDecimals(10, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "CRV"), ethereumDomainId, Helpers.parseDecimals(50, 18), Helpers.parseDecimals(60, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "CRV"), avalancheDomainId, Helpers.parseDecimals(0.2, 18), Helpers.parseDecimals(10, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "CRV"), polygonDomainId, Helpers.parseDecimals(0.2, 18), Helpers.parseDecimals(10, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "CRV"), fantomDomainId, Helpers.parseDecimals(0.2, 18), Helpers.parseDecimals(10, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // APE
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "APE"), domainId, Helpers.parseDecimals(0.04, 18), Helpers.parseDecimals(1.95, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "APE"), ethereumDomainId, Helpers.parseDecimals(9.04, 18), Helpers.parseDecimals(9.49, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "APE"), bscDomainId, Helpers.parseDecimals(0.04, 18), Helpers.parseDecimals(1.95, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // LDO
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "LDO"), domainId, Helpers.parseDecimals(0.1, 18), Helpers.parseDecimals(4.7, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "LDO"), ethereumDomainId, Helpers.parseDecimals(23.5, 18), Helpers.parseDecimals(28, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "LDO"), bscDomainId, Helpers.parseDecimals(0.1, 18), Helpers.parseDecimals(4.7, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "LDO"), polygonDomainId, Helpers.parseDecimals(0.1, 18), Helpers.parseDecimals(4.7, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // VET
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "VET"), domainId, Helpers.parseDecimals(8, 18), Helpers.parseDecimals(395, 18), Helpers.parseDecimals(10000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "VET"), bscDomainId, Helpers.parseDecimals(8, 18), Helpers.parseDecimals(395, 18), Helpers.parseDecimals(10000000, 18));
        // await Helpers.delay(4000);

        // // EGLD
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "EGLD"), domainId, Helpers.parseDecimals(0.005, 18), Helpers.parseDecimals(0.25, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "EGLD"), bscDomainId, Helpers.parseDecimals(0.005, 18), Helpers.parseDecimals(0.25, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // SNX
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SNX"), domainId, Helpers.parseDecimals(0.04, 18), Helpers.parseDecimals(3.75, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SNX"), ethereumDomainId, Helpers.parseDecimals(18.73, 18), Helpers.parseDecimals(19.67, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);
                
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SNX"), bscDomainId, Helpers.parseDecimals(0.04, 18), Helpers.parseDecimals(3.75, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SNX"), avalancheDomainId, Helpers.parseDecimals(0.04, 18), Helpers.parseDecimals(3.75, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SNX"), polygonDomainId, Helpers.parseDecimals(0.04, 18), Helpers.parseDecimals(3.75, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SNX"), fantomDomainId, Helpers.parseDecimals(0.04, 18), Helpers.parseDecimals(3.75, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // PEPE
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "PEPE"), domainId, Helpers.parseDecimals(6675, 18), Helpers.parseDecimals(6675000, 18), Helpers.parseDecimals(3720000000000, 18));
        // await Helpers.delay(4000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "PEPE"), ethereumDomainId, Helpers.parseDecimals(6675000, 18), Helpers.parseDecimals(166875000, 18), Helpers.parseDecimals(3720000000000, 18));
        // await Helpers.delay(4000);
                
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "PEPE"), bscDomainId, Helpers.parseDecimals(6675, 18), Helpers.parseDecimals(6675000, 18), Helpers.parseDecimals(3720000000000, 18));
        // await Helpers.delay(4000);

        // // AK1111
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AK1111"), domainId, Helpers.parseDecimals(2, 18), Helpers.parseDecimals(5, 18), Helpers.parseDecimals(50000000, 18));
        // await Helpers.delay(4000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AK1111"), baseDomainId, Helpers.parseDecimals(2, 18), Helpers.parseDecimals(5, 18), Helpers.parseDecimals(50000000, 18));
        // await Helpers.delay(4000);

        // for(let i:number = iterator; i <= (await DAO.getChangeFeeRequestCount()); i++) {
        //     await bridge.adminChangeFee(i);
        //     console.info(`adminChangeFeeRequest ${i}`)    
        //     await Helpers.delay(4000);
        // }
        
        return domainId;
    });

task("fee-ethereum", "Changing fee for ethereum tokens")      
    .setAction(async (_, { ethers, network }) => {
        if(network.name != "ethereum") {
            console.error("Should be ethereum network!");
            return;
        }
        const signer = (await ethers.getSigners())[0];

        const bridgeAddress = "0x6Ab2A602d1018987Cdcb29aE6fB6E3Ebe44b1412";
        const daoAddress = "0x9DcD76b4A7357249d6160D456670bAcC53292e27";
        const erc20HandlerAddress = "0xFe21Dd0eC80e744A473770827E1aD6393A5A94F0";

        const bridge = await ethers.getContractAt("Bridge", bridgeAddress, signer);
        const DAO = await ethers.getContractAt("DAO", daoAddress, signer);
        const domainId:BigNumberish = await bridge._domainID(); 
        
        const tokenAddresses = [
            new Token("ULX",   "0x5Aa158404fEd6b4730C13F49d3a7F820e14A636F"), // DONE
            new Token("WBTC",  "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"), // DONE
            new Token("WETH",  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"), // DONE
            new Token("BNB",   "0xB8c77482e45F1F44dE1745F52C74426C631bDD52"), 
            new Token("BUSD",  "0x4Fabb145d64652a948d72533023f6E7A623C7C53"), 
            new Token("SHIB",  "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE"), // DONE
            new Token("MATIC", "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0"),
            new Token("FTM",   "0x4E15361FD6b4BB609Fa63C81A2be19d873717870"), // DONE
            new Token("DAI",   "0x6B175474E89094C44Da98b954EedeAC495271d0F"), // DONE
            new Token("LINK",  "0x514910771AF9Ca656af840dff83E8264EcF986CA"), // DONE
            new Token("USDT",  "0xdAC17F958D2ee523a2206206994597C13D831ec7"), // DONE
            new Token("USDC",  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"), // DONE

            new Token("UNI", "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"), // DONE
            new Token("AAVE", "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9"), // DONE
            new Token("AXS", "0xBB0E17EF65F82Ab018d8EDd776e8DD940327B28b"), // DONE
            new Token("SAND", "0x3845badAde8e6dFF049820680d1F14bD3903a5d0"), // DONE
            new Token("MANA", "0x0F5D2fB29fb7d3CFeE444a200298f468908cC942"), // DONE
            new Token("NEAR", "0x85F17Cf997934a597031b2E18a9aB6ebD4B9f6a4"), // DONE
            new Token("1INCH", "0x111111111117dC0aa78b770fA6A738034120C302"), // DONE

            new Token("CRV", "0xD533a949740bb3306d119CC777fa900bA034cd52"), // DONE
            new Token("APE", "0x4d224452801ACEd8B2F0aebE155379bb5D594381"), // DONE
            new Token("LDO", "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32"), // DONE

            new Token("SNX",   "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F"),

            new Token("PEPE", "0x6982508145454ce325ddbe47a25d4ec3d2311933"),
        ];

        const iterator = +(await DAO.getChangeFeeRequestCount()) + 1;
        console.info((iterator));

        // for(let i = 1; i <= tokenAddresses.length; i++) {
        //     console.info(`${tokenAddresses[i - 1].tokenName} ETH ${await bridge.getFee(Helpers.findToken(tokenAddresses, tokenAddresses[i - 1].tokenName), domainId)}`)
        //     console.info(`${tokenAddresses[i - 1].tokenName} ULX ${await bridge.getFee(Helpers.findToken(tokenAddresses, tokenAddresses[i - 1].tokenName), ultronDomainId)}`)    
        // }

        // // ULX
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "ULX"), domainId, Helpers.parseDecimals(600, 18), Helpers.parseDecimals(800, 18), Helpers.parseDecimals(50000000, 18));
        // await Helpers.delay(8000);
        // console.log(await DAO.getChangeFeeRequestCount())

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "ULX"), ultronDomainId, Helpers.parseDecimals(24, 18), Helpers.parseDecimals(48, 18), Helpers.parseDecimals(50000000, 18));
        // await Helpers.delay(8000);
        // console.log(await DAO.getChangeFeeRequestCount())

        // // WBTC
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WBTC"), domainId, Helpers.parseDecimals(0.0013, 8), Helpers.parseDecimals(0.003, 8), Helpers.parseDecimals(1000, 8));
        // await Helpers.delay(8000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WBTC"), ultronDomainId, Helpers.parseDecimals(0.00002, 8), Helpers.parseDecimals(0.0002, 8), Helpers.parseDecimals(430, 8));
        // await Helpers.delay(8000);

        // // WETH
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WETH"), domainId, Helpers.parseDecimals(0.02, 18), Helpers.parseDecimals(0.05, 18), Helpers.parseDecimals(13000, 18));
        // await Helpers.delay(8000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WETH"), ultronDomainId, Helpers.parseDecimals(0.0003, 18), Helpers.parseDecimals(0.006, 18), Helpers.parseDecimals(9640, 18));
        // await Helpers.delay(8000);

        // // FTM
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "FTM"), domainId, Helpers.parseDecimals(53.5, 18), Helpers.parseDecimals(60, 18), Helpers.parseDecimals(2500000, 18));
        // await Helpers.delay(8000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "FTM"), ultronDomainId, Helpers.parseDecimals(1.7, 18), Helpers.parseDecimals(3.4, 18), Helpers.parseDecimals(1700000, 18));
        // await Helpers.delay(8000);

        // // SHIB
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SHIB"), domainId, Helpers.parseDecimals(1112500, 18), Helpers.parseDecimals(28000000, 18), Helpers.parseDecimals(620000000000, 18));
        // await Helpers.delay(8000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SHIB"), ultronDomainId, Helpers.parseDecimals(1112.5, 18), Helpers.parseDecimals(1112500, 18), Helpers.parseDecimals(620000000000, 18));
        // await Helpers.delay(8000);

        // // LINK
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "LINK"), domainId, Helpers.parseDecimals(2.73, 18), Helpers.parseDecimals(7, 18), Helpers.parseDecimals(230000, 18));
        // await Helpers.delay(8000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "LINK"), ultronDomainId, Helpers.parseDecimals(0.00273, 18), Helpers.parseDecimals(2.73, 18), Helpers.parseDecimals(230000, 18));
        // await Helpers.delay(8000);
        
        // // DAI
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "DAI"), domainId, Helpers.parseDecimals(40, 18), Helpers.parseDecimals(200, 18), Helpers.parseDecimals(50000000, 18));
        // await Helpers.delay(8000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "DAI"), ultronDomainId, Helpers.parseDecimals(0.9, 18), Helpers.parseDecimals(12, 18), Helpers.parseDecimals(50000000, 18));
        // await Helpers.delay(8000);

        // // USDT
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "USDT"), domainId, Helpers.parseDecimals(40, 6), Helpers.parseDecimals(200, 6), Helpers.parseDecimals(50000000, 6));
        // await Helpers.delay(8000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "USDT"), ultronDomainId, Helpers.parseDecimals(0.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(50000000, 6));
        // await Helpers.delay(8000);

        // // USDC
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "USDC"), domainId, Helpers.parseDecimals(40, 6), Helpers.parseDecimals(200, 6), Helpers.parseDecimals(50000000, 6));
        // await Helpers.delay(8000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "USDC"), ultronDomainId, Helpers.parseDecimals(0.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(50000000, 6));
        // await Helpers.delay(8000);

        // // UNI
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "UNI"), ultronDomainId, Helpers.parseDecimals(0.27, 18), Helpers.parseDecimals(0.54, 18), Helpers.parseDecimals(3000000, 18));
        // await Helpers.delay(4000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "UNI"), domainId, Helpers.parseDecimals(7.23, 18), Helpers.parseDecimals(7.59, 18), Helpers.parseDecimals(3000000, 18));
        // await Helpers.delay(4000);

        // // AAVE
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AAVE"), ultronDomainId, Helpers.parseDecimals(0.016, 18), Helpers.parseDecimals(0.032, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AAVE"), domainId, Helpers.parseDecimals(0.58, 18), Helpers.parseDecimals(1, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // AXS
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AXS"), ultronDomainId, Helpers.parseDecimals(0.016, 18), Helpers.parseDecimals(0.032, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AXS"), domainId, Helpers.parseDecimals(4.77, 18), Helpers.parseDecimals(5, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // SAND
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SAND"), ultronDomainId, Helpers.parseDecimals(0.27, 18), Helpers.parseDecimals(0.85, 18), Helpers.parseDecimals(6500000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SAND"), domainId, Helpers.parseDecimals(66.67, 18), Helpers.parseDecimals(70, 18), Helpers.parseDecimals(6500000, 18));
        // await Helpers.delay(4000);

        // // MANA
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "MANA"), ultronDomainId, Helpers.parseDecimals(0.3, 18), Helpers.parseDecimals(13.5, 18), Helpers.parseDecimals(70000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "MANA"), domainId, Helpers.parseDecimals(72.46, 18), Helpers.parseDecimals(76, 18), Helpers.parseDecimals(70000000, 18));
        // await Helpers.delay(4000);

        // // NEAR
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "NEAR"), ultronDomainId, Helpers.parseDecimals(0.08, 24), Helpers.parseDecimals(4, 24), Helpers.parseDecimals(2000000, 24));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "NEAR"), domainId, Helpers.parseDecimals(20.33, 24), Helpers.parseDecimals(21.35, 24), Helpers.parseDecimals(2000000, 24));
        // await Helpers.delay(4000);

        // // 1INCH
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "1INCH"), ultronDomainId, Helpers.parseDecimals(0.4, 18), Helpers.parseDecimals(4, 18), Helpers.parseDecimals(9000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "1INCH"), domainId, Helpers.parseDecimals(62.5, 18), Helpers.parseDecimals(66, 18), Helpers.parseDecimals(9000000, 18));
        // await Helpers.delay(4000);

        // // CRV
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "CRV"), ultronDomainId, Helpers.parseDecimals(0.2, 18), Helpers.parseDecimals(10, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "CRV"), domainId, Helpers.parseDecimals(50, 18), Helpers.parseDecimals(60, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // APE
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "APE"), ultronDomainId, Helpers.parseDecimals(0.04, 18), Helpers.parseDecimals(1.95, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "APE"), domainId, Helpers.parseDecimals(9.04, 18), Helpers.parseDecimals(9.49, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // LDO
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "LDO"), ultronDomainId, Helpers.parseDecimals(0.1, 18), Helpers.parseDecimals(4.7, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "LDO"), domainId, Helpers.parseDecimals(23.5, 18), Helpers.parseDecimals(28, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // SNX
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SNX"), ultronDomainId, Helpers.parseDecimals(0.04, 18), Helpers.parseDecimals(3.75, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SNX"), domainId, Helpers.parseDecimals(18.73, 18), Helpers.parseDecimals(19.67, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // PEPE
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "PEPE"), ultronDomainId, Helpers.parseDecimals(6675, 18), Helpers.parseDecimals(6675000, 18), Helpers.parseDecimals(3720000000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "PEPE"), domainId, Helpers.parseDecimals(6675000, 18), Helpers.parseDecimals(166875000, 18), Helpers.parseDecimals(3720000000000, 18));
        // await Helpers.delay(4000);

        // for(let i:number = iterator; i <= (await DAO.getChangeFeeRequestCount()); i++) {
        //     await bridge.adminChangeFee(i);
        //     console.info(`adminChangeFeeRequest ${i}`)    
        //     await Helpers.delay(8000);
        // }

        return domainId;
    });

task("fee-bsc", "Changing fee for bsc tokens")      
    .setAction(async (_, { ethers, network }) => {
        if(network.name != "bsc") {
            console.error("Should be bsc network!");
            return;
        }
        const signer = (await ethers.getSigners())[0];

        const bridgeAddress = "0x6Ab2A602d1018987Cdcb29aE6fB6E3Ebe44b1412";
        const daoAddress = "0x9DcD76b4A7357249d6160D456670bAcC53292e27";
        const erc20HandlerAddress = "0xFe21Dd0eC80e744A473770827E1aD6393A5A94F0";

        const bridge = await ethers.getContractAt("Bridge", bridgeAddress, signer);
        const DAO = await ethers.getContractAt("DAO", daoAddress, signer);
        const domainId:BigNumberish = await bridge._domainID(); 
        
        const tokenAddresses = [
            new Token("ULX",  "0xd983AB71a284d6371908420d8Ac6407ca943F810"), // DONE
            new Token("WBTC",  "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c"), // DONE
            new Token("WETH",  "0x2170Ed0880ac9A755fd29B2688956BD959F933F8"), // DONE
            new Token("BNB",   "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"), // DONE
            new Token("AVAX",  "0x1CE0c2827e2eF14D5C4f29a091d735A204794041"), // DONE
            new Token("BUSD",  "0xe9e7cea3dedca5984780bafc599bd69add087d56"), // REMOVED
            new Token("SHIB",  "0x2859e4544C4bB03966803b044A93563Bd2D0DD4D"), 
            new Token("MATIC", "0xcc42724c6683b7e57334c4e856f4c9965ed682bd"),
            new Token("FTM",   "0xad29abb318791d579433d831ed122afeaf29dcfe"), // DONE
            new Token("DAI",   "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3"), // DONE
            new Token("LINK",  "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD"), 
            new Token("USDT",  "0x55d398326f99059ff775485246999027b3197955"), // DONE
            new Token("USDC",  "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"), // DONE

            new Token("DOGE", "0xbA2aE424d960c26247Dd6c32edC70B295c744C43"), // DONE
            new Token("XRP", "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE"), // DONE
            new Token("ADA", "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47"), // DONE
            new Token("DOT", "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402"), // DONE
            new Token("UNI", "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1"), // DONE
            new Token("ATOM", "0x0Eb3a705fc54725037CC9e008bDede697f62F335"), // DONE
            new Token("AAVE", "0xfb6115445Bff7b52FeB98650C87f44907E58f802"), // DONE
            new Token("AXS", "0x715D400F88C167884bbCc41C5FeA407ed4D2f8A0"), // DONE
            new Token("SAND", "0x67b725d7e342d7B611fa85e859Df9697D9378B2e"), // DONE
            new Token("MANA", "0x26433c8127d9b4e9B71Eaa15111DF99Ea2EeB2f8"), // DONE
            new Token("CAKE", "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82"), // DONE
            new Token("NEAR", "0x1Fa4a73a3F0133f0025378af00236f3aBDEE5D63"), // DONE
            new Token("1INCH", "0x111111111117dC0aa78b770fA6A738034120C302"), // DONE
            new Token("FLUX", "0xaFF9084f2374585879e8B434C399E29E80ccE635"), // DONE
            new Token("TRX", "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B"), // DONE

            new Token("APE", "0xC762043E211571eB34f1ef377e5e8e76914962f9"), // DONE
            new Token("LDO", "0x986854779804799C1d68867F5E03e601E781e41b"), // DONE
            new Token("VET", "0x6FDcdfef7c496407cCb0cEC90f9C5Aaa1Cc8D888"), // DONE
            new Token("EGLD", "0xbF7c81FFF98BbE61B40Ed186e4AfD6DDd01337fe"), // DONE

            new Token("SNX",   "0x9Ac983826058b8a9C7Aa1C9171441191232E8404"),  // DONE

            new Token("PEPE", "0x25d887Ce7a35172C62FeBFD67a1856F20FaEbB00"),
        ];

        const iterator = +(await DAO.getChangeFeeRequestCount()) + 1;
        console.info(iterator);

        // for(let i = 1; i <= tokenAddresses.length; i++) {
        //     console.info(`${tokenAddresses[i - 1].tokenName} ${network.name} ${await bridge.getFee(Helpers.findToken(tokenAddresses, tokenAddresses[i - 1].tokenName), domainId)}`)
        //     console.info(`${tokenAddresses[i - 1].tokenName} ULX ${await bridge.getFee(Helpers.findToken(tokenAddresses, tokenAddresses[i - 1].tokenName), ultronDomainId)}`)    
        // }

        // // Already set
        
        // // ULX
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "ULX"), domainId, Helpers.parseDecimals(24, 18), Helpers.parseDecimals(48, 18), Helpers.parseDecimals(50000000, 18));
        // await Helpers.delay(8000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "ULX"), ultronDomainId, Helpers.parseDecimals(24, 18), Helpers.parseDecimals(48, 18), Helpers.parseDecimals(50000000, 18));
        // await Helpers.delay(8000);

        // // WBTC
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WBTC"), domainId, Helpers.parseDecimals(0.00002, 18), Helpers.parseDecimals(0.0002, 18), Helpers.parseDecimals(430, 18));
        // await Helpers.delay(8000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WBTC"), ultronDomainId, Helpers.parseDecimals(0.00002, 18), Helpers.parseDecimals(0.0002, 18), Helpers.parseDecimals(430, 18));
        // await Helpers.delay(8000);

        // // WETH
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WETH"), domainId, Helpers.parseDecimals(0.0003, 18), Helpers.parseDecimals(0.006, 18), Helpers.parseDecimals(9640, 18));
        // await Helpers.delay(8000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WETH"), ultronDomainId, Helpers.parseDecimals(0.0003, 18), Helpers.parseDecimals(0.006, 18), Helpers.parseDecimals(9640, 18));
        // await Helpers.delay(8000);

        // // BNB
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "BNB"), domainId, Helpers.parseDecimals(0.022, 18), Helpers.parseDecimals(0.044, 18), Helpers.parseDecimals(7500, 18));
        // await Helpers.delay(8000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "BNB"), ultronDomainId, Helpers.parseDecimals(0.022, 18), Helpers.parseDecimals(0.044, 18), Helpers.parseDecimals(7500, 18));
        // await Helpers.delay(8000);

        // // AVAX
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AVAX"), domainId, Helpers.parseDecimals(0.08, 18), Helpers.parseDecimals(0.16, 18), Helpers.parseDecimals(80000, 18));
        // await Helpers.delay(8000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AVAX"), ultronDomainId, Helpers.parseDecimals(0.08, 18), Helpers.parseDecimals(0.16, 18), Helpers.parseDecimals(80000, 18));
        // await Helpers.delay(8000);
        
        // // FTM
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "FTM"), domainId, Helpers.parseDecimals(2.4, 18), Helpers.parseDecimals(4.8, 18), Helpers.parseDecimals(2500000, 18));
        // await Helpers.delay(8000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "FTM"), ultronDomainId, Helpers.parseDecimals(1.7, 18), Helpers.parseDecimals(3.4, 18), Helpers.parseDecimals(1700000, 18));
        // await Helpers.delay(8000);

        // // DAI
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "DAI"), domainId, Helpers.parseDecimals(0.9, 18), Helpers.parseDecimals(12, 18), Helpers.parseDecimals(2000000, 18));
        // await Helpers.delay(8000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "DAI"), ultronDomainId, Helpers.parseDecimals(0.9, 18), Helpers.parseDecimals(12, 18), Helpers.parseDecimals(2000000, 18));
        // await Helpers.delay(8000);
        
        // // BUSD
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "BUSD"), bscDomainId, Helpers.parseDecimals(99999999999998, 18), Helpers.parseDecimals(99999999999999, 18), Helpers.parseDecimals(100000000000000, 18));
        // await Helpers.delay(8000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "BUSD"), ultronDomainId, Helpers.parseDecimals(99999999999998, 18), Helpers.parseDecimals(99999999999999, 18), Helpers.parseDecimals(100000000000000, 18));
        // await Helpers.delay(8000);

        // // USDT
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "USDT"), domainId, Helpers.parseDecimals(0.9, 18), Helpers.parseDecimals(12, 18), Helpers.parseDecimals(20000000, 18));
        // await Helpers.delay(8000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "USDT"), ultronDomainId, Helpers.parseDecimals(0.9, 18), Helpers.parseDecimals(12, 18), Helpers.parseDecimals(2000000, 18));
        // await Helpers.delay(8000);

        // // USDC
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "USDC"), domainId, Helpers.parseDecimals(0.9, 18), Helpers.parseDecimals(12, 18), Helpers.parseDecimals(20000000, 18));
        // await Helpers.delay(8000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "USDC"), ultronDomainId, Helpers.parseDecimals(0.9, 18), Helpers.parseDecimals(12, 18), Helpers.parseDecimals(2000000, 18));
        // await Helpers.delay(8000);

        // // DOGE
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "DOGE"), ultronDomainId, Helpers.parseDecimals(2.32, 8), Helpers.parseDecimals(120, 8), Helpers.parseDecimals(500000000, 8));
        // await Helpers.delay(4000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "DOGE"), domainId, Helpers.parseDecimals(2.32, 8), Helpers.parseDecimals(120, 8), Helpers.parseDecimals(500000000, 8));
        // await Helpers.delay(4000);

        // // XRP
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "XRP"), ultronDomainId, Helpers.parseDecimals(0.5, 18), Helpers.parseDecimals(24.5, 18), Helpers.parseDecimals(2500000, 18));
        // await Helpers.delay(4000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "XRP"), domainId, Helpers.parseDecimals(0.5, 18), Helpers.parseDecimals(24.5, 18), Helpers.parseDecimals(2500000, 18));
        // await Helpers.delay(4000);

        // // ADA
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "ADA"), ultronDomainId, Helpers.parseDecimals(0.5, 18), Helpers.parseDecimals(27, 18), Helpers.parseDecimals(2700000, 18));
        // await Helpers.delay(4000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "ADA"), domainId, Helpers.parseDecimals(0.5, 18), Helpers.parseDecimals(27, 18), Helpers.parseDecimals(2700000, 18));
        // await Helpers.delay(4000);

        // // DOT
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "DOT"), ultronDomainId, Helpers.parseDecimals(0.032, 18), Helpers.parseDecimals(1.58, 18), Helpers.parseDecimals(1500000, 18));
        // await Helpers.delay(4000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "DOT"), domainId, Helpers.parseDecimals(0.032, 18), Helpers.parseDecimals(1.58, 18), Helpers.parseDecimals(1500000, 18));
        // await Helpers.delay(4000);

        // // UNI
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "UNI"), ultronDomainId, Helpers.parseDecimals(0.27, 18), Helpers.parseDecimals(0.54, 18), Helpers.parseDecimals(3000000, 18));
        // await Helpers.delay(4000);
                
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "UNI"), domainId, Helpers.parseDecimals(0.27, 18), Helpers.parseDecimals(0.54, 18), Helpers.parseDecimals(3000000, 18));
        // await Helpers.delay(4000);

        // // ATOM
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "ATOM"), ultronDomainId, Helpers.parseDecimals(0.015, 18), Helpers.parseDecimals(0.76, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);
                
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "ATOM"), domainId, Helpers.parseDecimals(0.015, 18), Helpers.parseDecimals(0.76, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // AAVE
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AAVE"), ultronDomainId, Helpers.parseDecimals(0.016, 18), Helpers.parseDecimals(0.032, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);
                
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AAVE"), domainId, Helpers.parseDecimals(0.016, 18), Helpers.parseDecimals(0.032, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // AXS
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AXS"), ultronDomainId, Helpers.parseDecimals(0.016, 18), Helpers.parseDecimals(0.032, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);
                
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AXS"), domainId, Helpers.parseDecimals(0.016, 18), Helpers.parseDecimals(0.032, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // SAND
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SAND"), ultronDomainId, Helpers.parseDecimals(0.27, 18), Helpers.parseDecimals(0.85, 18), Helpers.parseDecimals(6500000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SAND"), domainId, Helpers.parseDecimals(0.27, 18), Helpers.parseDecimals(0.85, 18), Helpers.parseDecimals(6500000, 18));
        // await Helpers.delay(4000);

        // // MANA
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "MANA"), ultronDomainId, Helpers.parseDecimals(0.3, 18), Helpers.parseDecimals(13.5, 18), Helpers.parseDecimals(70000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "MANA"), domainId, Helpers.parseDecimals(0.3, 18), Helpers.parseDecimals(13.5, 18), Helpers.parseDecimals(70000000, 18));
        // await Helpers.delay(4000);

        // // CAKE
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "CAKE"), ultronDomainId, Helpers.parseDecimals(0.05, 18), Helpers.parseDecimals(2.5, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);
                
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "CAKE"), domainId, Helpers.parseDecimals(0.05, 18), Helpers.parseDecimals(2.5, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // NEAR
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "NEAR"), ultronDomainId, Helpers.parseDecimals(0.08, 18), Helpers.parseDecimals(4, 18), Helpers.parseDecimals(2000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "NEAR"), domainId, Helpers.parseDecimals(0.08, 18), Helpers.parseDecimals(4, 18), Helpers.parseDecimals(2000000, 18));
        // await Helpers.delay(4000);

        // // 1INCH
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "1INCH"), ultronDomainId, Helpers.parseDecimals(0.4, 18), Helpers.parseDecimals(4, 18), Helpers.parseDecimals(9000000, 18));
        // await Helpers.delay(4000);
                
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "1INCH"), domainId, Helpers.parseDecimals(0.4, 18), Helpers.parseDecimals(4, 18), Helpers.parseDecimals(9000000, 18));
        // await Helpers.delay(4000);

        // // FLUX
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "FLUX"), ultronDomainId, Helpers.parseDecimals(0.3, 8), Helpers.parseDecimals(15, 8), Helpers.parseDecimals(2000000, 8));
        // await Helpers.delay(4000);
                
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "FLUX"), domainId, Helpers.parseDecimals(0.3, 8), Helpers.parseDecimals(15, 8), Helpers.parseDecimals(2000000, 8));
        // await Helpers.delay(4000);

        // // TRX
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "TRX"), ultronDomainId, Helpers.parseDecimals(3.28, 18), Helpers.parseDecimals(164, 18), Helpers.parseDecimals(2000000, 18));
        // await Helpers.delay(4000);
                
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "TRX"), domainId, Helpers.parseDecimals(3.28, 18), Helpers.parseDecimals(164, 18), Helpers.parseDecimals(2000000, 18));
        // await Helpers.delay(4000);

        // // APE
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "APE"), ultronDomainId, Helpers.parseDecimals(0.04, 18), Helpers.parseDecimals(1.95, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "APE"), domainId, Helpers.parseDecimals(0.04, 18), Helpers.parseDecimals(1.95, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // LDO
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "LDO"), ultronDomainId, Helpers.parseDecimals(0.1, 18), Helpers.parseDecimals(4.7, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "LDO"), domainId, Helpers.parseDecimals(0.1, 18), Helpers.parseDecimals(4.7, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // VET
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "VET"), ultronDomainId, Helpers.parseDecimals(8, 18), Helpers.parseDecimals(395, 18), Helpers.parseDecimals(10000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "VET"), domainId, Helpers.parseDecimals(8, 18), Helpers.parseDecimals(395, 18), Helpers.parseDecimals(10000000, 18));
        // await Helpers.delay(4000);

        // // EGLD
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "EGLD"), ultronDomainId, Helpers.parseDecimals(0.005, 18), Helpers.parseDecimals(0.25, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "EGLD"), domainId, Helpers.parseDecimals(0.005, 18), Helpers.parseDecimals(0.25, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // SNX
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SNX"), ultronDomainId, Helpers.parseDecimals(0.04, 18), Helpers.parseDecimals(3.75, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);
                
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SNX"), domainId, Helpers.parseDecimals(0.04, 18), Helpers.parseDecimals(3.75, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // PEPE
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "PEPE"), ultronDomainId, Helpers.parseDecimals(6675, 18), Helpers.parseDecimals(6675000, 18), Helpers.parseDecimals(3720000000000, 18));
        // await Helpers.delay(4000);
                
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "PEPE"), domainId, Helpers.parseDecimals(6675, 18), Helpers.parseDecimals(6675000, 18), Helpers.parseDecimals(3720000000000, 18));
        // await Helpers.delay(4000);

        // for(let i:number = iterator; i <= (await DAO.getChangeFeeRequestCount()); i++) {
        //     await bridge.adminChangeFee(i);
        //     console.info(`adminChangeFeeRequest ${i}`)    
        //     await Helpers.delay(8000);
        // }

        return domainId;
    });

task("fee-avalanche", "Changing fee for avalanche tokens")      
    .setAction(async (_, { ethers, network }) => {
        if(network.name != "avalanche") {
            console.error("Should be avalanche network!");
            return;
        }
        const signer = (await ethers.getSigners())[0];

        const bridgeAddress = "0x6Ab2A602d1018987Cdcb29aE6fB6E3Ebe44b1412";
        const daoAddress = "0x9DcD76b4A7357249d6160D456670bAcC53292e27";
        const erc20HandlerAddress = "0xFe21Dd0eC80e744A473770827E1aD6393A5A94F0";

        const bridge = await ethers.getContractAt("Bridge", bridgeAddress, signer);
        const DAO = await ethers.getContractAt("DAO", daoAddress, signer);
        const domainId:BigNumberish = await bridge._domainID(); 
        
        const tokenAddresses = [
            new Token("ULX",  "0xC685E8EDDC9f078666794CbfcD8D8351bac404eF"), // DONE
            new Token("WBTC",  "0x50b7545627a5162F82A992c33b87aDc75187B218"), // DONE
            new Token("WETH",  "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB"), // DONE
            new Token("BNB",   "0x264c1383EA520f73dd837F915ef3a732e204a493"), 
            new Token("AVAX",  "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"), // DONE
            new Token("BUSD",  "0xaEb044650278731Ef3DC244692AB9F64C78FfaEA"), // REMOVED
            new Token("SHIB",  "0x02D980A0D7AF3fb7Cf7Df8cB35d9eDBCF355f665"), 
            new Token("DAI",   "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70"), // DONE
            new Token("LINK",  "0xB3fe5374F67D7a22886A0eE082b2E2f9d2651651"), 
            new Token("USDT",  "0xc7198437980c041c805A1EDcbA50c1Ce5db95118"), // DONE
            new Token("USDC",  "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664"), // DONE
            
            new Token("AAVE", "0x63a72806098Bd3D9520cC43356dD78afe5D386D9"), // DONE

            new Token("SNX",   "0xBeC243C995409E6520D7C41E404da5dEba4b209B"),  // DONE
        ];

        const iterator = +(await DAO.getChangeFeeRequestCount()) + 1;
        console.info((iterator));

        // for(let i = 1; i <= tokenAddresses.length; i++) {
        //     console.info(`${tokenAddresses[i - 1].tokenName} ${network.name} ${await bridge.getFee(Helpers.findToken(tokenAddresses, tokenAddresses[i - 1].tokenName), domainId)}`)
        //     console.info(`${tokenAddresses[i - 1].tokenName} ULX ${await bridge.getFee(Helpers.findToken(tokenAddresses, tokenAddresses[i - 1].tokenName), ultronDomainId)}`)    
        // }

        // // Already set

        // // ULX
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "ULX"), domainId, Helpers.parseDecimals(24, 18), Helpers.parseDecimals(48, 18), Helpers.parseDecimals(50000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "ULX"), ultronDomainId, Helpers.parseDecimals(24, 18), Helpers.parseDecimals(48, 18), Helpers.parseDecimals(50000000, 18));
        // await Helpers.delay(4000);

        // // WBTC
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WBTC"), domainId, Helpers.parseDecimals(0.000045, 8), Helpers.parseDecimals(0.0002, 8), Helpers.parseDecimals(430, 8));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WBTC"), ultronDomainId, Helpers.parseDecimals(0.00002, 8), Helpers.parseDecimals(0.0002, 8), Helpers.parseDecimals(430, 8));
        // await Helpers.delay(4000);

        // // WETH
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WETH"), domainId, Helpers.parseDecimals(0.0006, 18), Helpers.parseDecimals(0.006, 18), Helpers.parseDecimals(9640, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WETH"), ultronDomainId, Helpers.parseDecimals(0.0003, 18), Helpers.parseDecimals(0.006, 18), Helpers.parseDecimals(9640, 18));
        // await Helpers.delay(4000);

        // // AVAX
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AVAX"), domainId, Helpers.parseDecimals(0.08, 18), Helpers.parseDecimals(0.16, 18), Helpers.parseDecimals(80000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AVAX"), ultronDomainId, Helpers.parseDecimals(0.08, 18), Helpers.parseDecimals(0.16, 18), Helpers.parseDecimals(80000, 18));
        // await Helpers.delay(4000);

        // // DAI
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "DAI"), domainId, Helpers.parseDecimals(1.9, 18), Helpers.parseDecimals(12, 18), Helpers.parseDecimals(2000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "DAI"), ultronDomainId, Helpers.parseDecimals(0.9, 18), Helpers.parseDecimals(12, 18), Helpers.parseDecimals(2000000, 18));
        // await Helpers.delay(4000);
        
        // // BUSD
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "BUSD"), domainId, Helpers.parseDecimals(99999999999998, 18), Helpers.parseDecimals(99999999999999, 18), Helpers.parseDecimals(100000000000000, 18));
        // await Helpers.delay(4000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "BUSD"), ultronDomainId, Helpers.parseDecimals(99999999999998, 18), Helpers.parseDecimals(99999999999999, 18), Helpers.parseDecimals(100000000000000, 18));
        // await Helpers.delay(4000);

        // // USDT
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "USDT"), domainId, Helpers.parseDecimals(1.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(20000000, 6));
        // await Helpers.delay(4000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "USDT"), ultronDomainId, Helpers.parseDecimals(0.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(2000000, 6));
        // await Helpers.delay(4000);

        // // USDC
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "USDC"), domainId, Helpers.parseDecimals(1.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(2000000, 6));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "USDC"), ultronDomainId, Helpers.parseDecimals(0.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(2000000, 6));
        // await Helpers.delay(4000);

        // // AAVE
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AAVE"), ultronDomainId, Helpers.parseDecimals(0.016, 18), Helpers.parseDecimals(0.032, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AAVE"), domainId, Helpers.parseDecimals(0.016, 18), Helpers.parseDecimals(0.032, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // SNX
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SNX"), ultronDomainId, Helpers.parseDecimals(0.04, 18), Helpers.parseDecimals(3.75, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);
                
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SNX"), domainId, Helpers.parseDecimals(0.04, 18), Helpers.parseDecimals(3.75, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // for(let i:number = iterator; i <= (await DAO.getChangeFeeRequestCount()); i++) {
        //     await bridge.adminChangeFee(i);
        //     console.info(`adminChangeFeeRequest ${i}`)    
        //     await Helpers.delay(8000);
        // }

        return domainId;
    });

task("fee-polygon", "Changing fee for polygon tokens")      
    .setAction(async (_, { ethers, network }) => {
        if(network.name != "polygon") {
            console.error("Should be polygon network!");
            return;
        }
        const signer = (await ethers.getSigners())[0];

        const bridgeAddress = "0x6Ab2A602d1018987Cdcb29aE6fB6E3Ebe44b1412";
        const daoAddress = "0x9DcD76b4A7357249d6160D456670bAcC53292e27";
        const erc20HandlerAddress = "0xFe21Dd0eC80e744A473770827E1aD6393A5A94F0";

        const bridge = await ethers.getContractAt("Bridge", bridgeAddress, signer);
        const DAO = await ethers.getContractAt("DAO", daoAddress, signer);
        const domainId:BigNumberish = await bridge._domainID(); 
        
        const tokenAddresses = [
            new Token("ULX",  "0xfA5d5DD2517EE9C1419534a16B132adDe2e3d948"), // DONE
            new Token("WBTC",  "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6"), // DONE
            new Token("WETH",  "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"), // DONE
            new Token("BNB",   "0x3BA4c387f786bFEE076A58914F5Bd38d668B42c3"), // DONE
            new Token("AVAX",  "0x2c89bbc92bd86f8075d1decc58c7f4e0107f286b"), 
            new Token("BUSD",  "0xdAb529f40E671A1D4bF91361c21bf9f0C9712ab7"), // REMOVED
            new Token("MATIC", "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"), // DONE
            new Token("FTM",   "0xC9c1c1c20B3658F8787CC2FD702267791f224Ce1"), 
            new Token("DAI",   "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063"), // DONE
            new Token("LINK",  "0xb0897686c545045aFc77CF20eC7A532E3120E0F1"), 
            new Token("USDT",  "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"), // DONE
            new Token("USDC",  "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"), // DONE

            new Token("UNI", "0xb33EaAd8d922B1083446DC23f610c2567fB5180f"), // DONE
            new Token("ATOM", "0xac51C4c48Dc3116487eD4BC16542e27B5694Da1b"), // DONE
            new Token("AAVE", "0xD6DF932A45C0f255f85145f286eA0b292B21C90B"), // DONE
            new Token("AXS", "0x61BDD9C7d4dF4Bf47A4508c0c8245505F2Af5b7b"), // DONE
            new Token("SAND", "0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683"), // DONE
            new Token("MANA", "0xA1c57f48F0Deb89f569dFbE6E2B7f46D33606fD4"), // DONE
            new Token("1INCH", "0x9c2C5fd7b07E95EE044DDeba0E97a665F142394f"), // DONE

            new Token("CRV", "0x172370d5Cd63279eFa6d502DAB29171933a610AF"), // DONE
            new Token("LDO", "0xC3C7d422809852031b44ab29EEC9F1EfF2A58756"), // DONE

            new Token("SNX",   "0x50B728D8D964fd00C2d0AAD81718b71311feF68a"),  // DONE
        ];

        const iterator = +(await DAO.getChangeFeeRequestCount()) + 1;
        console.info((iterator));

        // for(let i = 1; i <= tokenAddresses.length; i++) {
        //     console.info(`${tokenAddresses[i - 1].tokenName} ${network.name} ${await bridge.getFee(Helpers.findToken(tokenAddresses, tokenAddresses[i - 1].tokenName), domainId)}`)
        //     console.info(`${tokenAddresses[i - 1].tokenName} ULX ${await bridge.getFee(Helpers.findToken(tokenAddresses, tokenAddresses[i - 1].tokenName), ultronDomainId)}`)    
        // }

        // // Already set

        // // ULX
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "ULX"), domainId, Helpers.parseDecimals(24, 18), Helpers.parseDecimals(48, 18), Helpers.parseDecimals(50000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "ULX"), ultronDomainId, Helpers.parseDecimals(24, 18), Helpers.parseDecimals(48, 18), Helpers.parseDecimals(50000000, 18));
        // await Helpers.delay(4000);

        // // WBTC
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WBTC"), domainId, Helpers.parseDecimals(0.00002, 8), Helpers.parseDecimals(0.0002, 8), Helpers.parseDecimals(430, 8));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WBTC"), ultronDomainId, Helpers.parseDecimals(0.00002, 8), Helpers.parseDecimals(0.0002, 8), Helpers.parseDecimals(430, 8));
        // await Helpers.delay(4000);
        
        // // WETH
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WETH"), domainId, Helpers.parseDecimals(0.0003, 18), Helpers.parseDecimals(0.006, 18), Helpers.parseDecimals(9640, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WETH"), ultronDomainId, Helpers.parseDecimals(0.0003, 18), Helpers.parseDecimals(0.006, 18), Helpers.parseDecimals(9640, 18));
        // await Helpers.delay(4000);

        // // MATIC
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "MATIC"), domainId, Helpers.parseDecimals(3.43, 18), Helpers.parseDecimals(34.3, 18), Helpers.parseDecimals(3500000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "MATIC"), ultronDomainId, Helpers.parseDecimals(1.8, 18), Helpers.parseDecimals(3.6, 18), Helpers.parseDecimals(2500000, 18));
        // await Helpers.delay(4000);
        
        // // DAI
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "DAI"), domainId, Helpers.parseDecimals(0.9, 18), Helpers.parseDecimals(12, 18), Helpers.parseDecimals(2000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "DAI"), ultronDomainId, Helpers.parseDecimals(0.9, 18), Helpers.parseDecimals(12, 18), Helpers.parseDecimals(2000000, 18));
        // await Helpers.delay(4000);
        
        // // BUSD
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "BUSD"), domainId, Helpers.parseDecimals(99999999999998, 18), Helpers.parseDecimals(99999999999999, 18), Helpers.parseDecimals(100000000000000, 18));
        // await Helpers.delay(4000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "BUSD"), ultronDomainId, Helpers.parseDecimals(99999999999998, 18), Helpers.parseDecimals(99999999999999, 18), Helpers.parseDecimals(100000000000000, 18));
        // await Helpers.delay(4000);

        // // uUSDT
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "USDT"), domainId, Helpers.parseDecimals(0.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(2000000, 6));
        // await Helpers.delay(4000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "USDT"), ultronDomainId, Helpers.parseDecimals(0.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(2000000, 6));
        // await Helpers.delay(4000);

        // // uUSDC
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "USDC"), domainId, Helpers.parseDecimals(0.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(2000000, 6));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "USDC"), ultronDomainId, Helpers.parseDecimals(0.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(2000000, 6));
        // await Helpers.delay(4000);

        // // UNI
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "UNI"), ultronDomainId, Helpers.parseDecimals(0.27, 18), Helpers.parseDecimals(0.54, 18), Helpers.parseDecimals(3000000, 18));
        // await Helpers.delay(8000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "UNI"), domainId, Helpers.parseDecimals(0.27, 18), Helpers.parseDecimals(0.54, 18), Helpers.parseDecimals(3000000, 18));
        // await Helpers.delay(4000);

        // // ATOM
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "ATOM"), ultronDomainId, Helpers.parseDecimals(0.015, 6), Helpers.parseDecimals(0.76, 6), Helpers.parseDecimals(1000000, 6));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "ATOM"), domainId, Helpers.parseDecimals(0.015, 6), Helpers.parseDecimals(0.76, 6), Helpers.parseDecimals(1000000, 6));
        // await Helpers.delay(4000);

        // // AAVE
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AAVE"), ultronDomainId, Helpers.parseDecimals(0.016, 18), Helpers.parseDecimals(0.032, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AAVE"), domainId, Helpers.parseDecimals(0.016, 18), Helpers.parseDecimals(0.032, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // AXS
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AXS"), ultronDomainId, Helpers.parseDecimals(0.016, 18), Helpers.parseDecimals(0.032, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AXS"), domainId, Helpers.parseDecimals(0.016, 18), Helpers.parseDecimals(0.032, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // SAND
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SAND"), ultronDomainId, Helpers.parseDecimals(0.27, 18), Helpers.parseDecimals(0.85, 18), Helpers.parseDecimals(6500000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SAND"), domainId, Helpers.parseDecimals(0.27, 18), Helpers.parseDecimals(0.85, 18), Helpers.parseDecimals(6500000, 18));
        // await Helpers.delay(4000);

        // // MANA
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "MANA"), ultronDomainId, Helpers.parseDecimals(0.3, 18), Helpers.parseDecimals(13.5, 18), Helpers.parseDecimals(70000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "MANA"), domainId, Helpers.parseDecimals(0.3, 18), Helpers.parseDecimals(13.5, 18), Helpers.parseDecimals(70000000, 18));
        // await Helpers.delay(4000);

        // // 1INCH
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "1INCH"), ultronDomainId, Helpers.parseDecimals(0.4, 18), Helpers.parseDecimals(4, 18), Helpers.parseDecimals(9000000, 18));
        // await Helpers.delay(4000);
                
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "1INCH"), domainId, Helpers.parseDecimals(0.4, 18), Helpers.parseDecimals(4, 18), Helpers.parseDecimals(9000000, 18));
        // await Helpers.delay(4000);

        // // CRV
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "CRV"), domainId, Helpers.parseDecimals(0.2, 18), Helpers.parseDecimals(10, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "CRV"), polygonDomainId, Helpers.parseDecimals(0.2, 18), Helpers.parseDecimals(10, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // LDO
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "LDO"), domainId, Helpers.parseDecimals(0.1, 18), Helpers.parseDecimals(4.7, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "LDO"), polygonDomainId, Helpers.parseDecimals(0.1, 18), Helpers.parseDecimals(4.7, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // SNX
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SNX"), ultronDomainId, Helpers.parseDecimals(0.04, 18), Helpers.parseDecimals(3.75, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);
                
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SNX"), domainId, Helpers.parseDecimals(0.04, 18), Helpers.parseDecimals(3.75, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // for(let i:number = iterator; i <= (await DAO.getChangeFeeRequestCount()); i++) {
        //     await bridge.adminChangeFee(i);
        //     console.info(`adminChangeFeeRequest ${i}`)    
        //     await Helpers.delay(4000);
        // }

        return domainId;
    });

task("fee-fantom", "Changing fee for fantom tokens")      
    .setAction(async (_, { ethers, network }) => {
        if(network.name != "fantom") {
            console.error("Should be fantom network!");
            return;
        }
        const signer = (await ethers.getSigners())[0];

        const bridgeAddress = "0x400b3D2Ac98f93e14146E330210910f396f59C1E";
        const daoAddress = "0x8C14a978b251eaffdABef5aC48e15568E53D3477";
        const erc20HandlerAddress = "0x598E5dBC2f6513E6cb1bA253b255A5b73A2a720b";

        const bridge = await ethers.getContractAt("Bridge", bridgeAddress, signer);
        const DAO = await ethers.getContractAt("DAO", daoAddress, signer);
        const domainId:BigNumberish = await bridge._domainID(); 
        
        const tokenAddresses = [
            new Token("ULX",  "0x8867F422Cd9Cf0C66ba71D22bC8edc641e91949d"), // DONE
            new Token("WBTC",  "0x321162Cd933E2Be498Cd2267a90534A804051b11"), // DONE
            new Token("WETH",  "0x74b23882a30290451A17c44f4F05243b6b58C76d"), // DONE
            new Token("BNB",   "0x27f26F00e1605903645BbaBC0a73E35027Dccd45"), // DONE
            new Token("AVAX",  "0x511D35c52a3C244E7b8bd92c0C297755FbD89212"), 
            new Token("BUSD",  "0xC931f61B1534EB21D8c11B24f3f5Ab2471d4aB50"), // REMOVED
            new Token("FTM",   "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"), // DONE
            new Token("DAI",   "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E"), // DONE
            new Token("LINK",  "0xb3654dc3D10Ea7645f8319668E8F54d2574FBdC8"), 
            new Token("USDT",  "0x049d68029688eabf473097a2fc38ef61633a3c7a"), // DONE
            new Token("USDC",  "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75"), // DONE

            new Token("AAVE",  "0x6a07A792ab2965C72a5B8088d3a069A7aC3a993B"), // DONE
            
            new Token("CRV",  "0x1E4F97b9f9F913c46F1632781732927B9019C68b"), // DONE

            new Token("SNX",  "0x56ee926bD8c72B2d5fa1aF4d9E4Cbb515a1E3Adc"), // DONE
        ];

        const iterator = +(await DAO.getChangeFeeRequestCount()) + 1;
        console.info((iterator));

        // for(let i = 1; i <= tokenAddresses.length; i++) {
        //     console.info(`${tokenAddresses[i - 1].tokenName} ${network.name} ${await bridge.getFee(Helpers.findToken(tokenAddresses, tokenAddresses[i - 1].tokenName), domainId)}`)
        //     console.info(`${tokenAddresses[i - 1].tokenName} ULX ${await bridge.getFee(Helpers.findToken(tokenAddresses, tokenAddresses[i - 1].tokenName), ultronDomainId)}`)    
        // }

        // // Already set

        // // ULX
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "ULX"), domainId, Helpers.parseDecimals(24, 18), Helpers.parseDecimals(48, 18), Helpers.parseDecimals(50000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "ULX"), ultronDomainId, Helpers.parseDecimals(24, 18), Helpers.parseDecimals(48, 18), Helpers.parseDecimals(50000000, 18));
        // await Helpers.delay(4000);

        // // WBTC
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WBTC"), domainId, Helpers.parseDecimals(0.000045, 8), Helpers.parseDecimals(0.0002, 8), Helpers.parseDecimals(430, 8));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WBTC"), ultronDomainId, Helpers.parseDecimals(0.00002, 8), Helpers.parseDecimals(0.0002, 8), Helpers.parseDecimals(430, 8));
        // await Helpers.delay(4000);

        // // WETH
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WETH"), domainId, Helpers.parseDecimals(0.0006, 18), Helpers.parseDecimals(0.006, 18), Helpers.parseDecimals(9640, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "WETH"), ultronDomainId, Helpers.parseDecimals(0.0003, 18), Helpers.parseDecimals(0.006, 18), Helpers.parseDecimals(9640, 18));
        // await Helpers.delay(4000);

        // // AVAX
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AVAX"), domainId, Helpers.parseDecimals(0.08, 18), Helpers.parseDecimals(0.16, 18), Helpers.parseDecimals(80000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AVAX"), ultronDomainId, Helpers.parseDecimals(0.08, 18), Helpers.parseDecimals(0.16, 18), Helpers.parseDecimals(80000, 18));
        // await Helpers.delay(4000);

        // // FTM
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "FTM"), domainId, Helpers.parseDecimals(1.7, 18), Helpers.parseDecimals(3.4, 18), Helpers.parseDecimals(1700000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "FTM"), ultronDomainId, Helpers.parseDecimals(1.7, 18), Helpers.parseDecimals(3.4, 18), Helpers.parseDecimals(1700000, 18));
        // await Helpers.delay(4000);

        // // DAI
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "DAI"), domainId, Helpers.parseDecimals(1.9, 18), Helpers.parseDecimals(12, 18), Helpers.parseDecimals(2000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "DAI"), ultronDomainId, Helpers.parseDecimals(0.9, 18), Helpers.parseDecimals(12, 18), Helpers.parseDecimals(2000000, 18));
        // await Helpers.delay(4000);
        
        // // BUSD
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "BUSD"), domainId, Helpers.parseDecimals(99999999999998, 18), Helpers.parseDecimals(99999999999999, 18), Helpers.parseDecimals(100000000000000, 18));
        // await Helpers.delay(4000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "BUSD"), ultronDomainId, Helpers.parseDecimals(99999999999998, 18), Helpers.parseDecimals(99999999999999, 18), Helpers.parseDecimals(100000000000000, 18));
        // await Helpers.delay(4000);

        // // USDT
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "USDT"), domainId, Helpers.parseDecimals(1.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(2000000, 6));
        // await Helpers.delay(4000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "USDT"), ultronDomainId, Helpers.parseDecimals(0.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(2000000, 6));
        // await Helpers.delay(4000);

        // // USDC
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "USDC"), domainId, Helpers.parseDecimals(1.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(2000000, 6));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "USDC"), ultronDomainId, Helpers.parseDecimals(0.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(2000000, 6));
        // await Helpers.delay(4000);

        // // AAVE
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AAVE"), ultronDomainId, Helpers.parseDecimals(0.016, 18), Helpers.parseDecimals(0.032, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AAVE"), domainId, Helpers.parseDecimals(0.016, 18), Helpers.parseDecimals(0.032, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // CRV
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "CRV"), ultronDomainId, Helpers.parseDecimals(0.2, 18), Helpers.parseDecimals(10, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "CRV"), domainId, Helpers.parseDecimals(0.2, 18), Helpers.parseDecimals(10, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // // SNX
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SNX"), ultronDomainId, Helpers.parseDecimals(0.04, 18), Helpers.parseDecimals(3.75, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);
                
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "SNX"), domainId, Helpers.parseDecimals(0.04, 18), Helpers.parseDecimals(3.75, 18), Helpers.parseDecimals(1000000, 18));
        // await Helpers.delay(4000);

        // for(let i:number = iterator; i <= (await DAO.getChangeFeeRequestCount()); i++) {
        //     await bridge.adminChangeFee(i);
        //     console.info(`adminChangeFeeRequest ${i}`)    
        //     await Helpers.delay(8000);
        // }

        return domainId;
    });

task("fee-base", "Changing fee for base tokens")      
    .setAction(async (_, { ethers, network }) => {
        if(network.name !== "base") {
            console.info("Should be base network!");
            return;
        }

        const signer = (await ethers.getSigners())[0];

        const bridgeAddress = "0x6Ab2A602d1018987Cdcb29aE6fB6E3Ebe44b1412";
        const daoAddress = "0x9DcD76b4A7357249d6160D456670bAcC53292e27";
        const erc20HandlerAddress = "0xFe21Dd0eC80e744A473770827E1aD6393A5A94F0";

        const bridge = await ethers.getContractAt("Bridge", bridgeAddress, signer);
        const DAO = await ethers.getContractAt("DAO", daoAddress, signer);
        const domainId:BigNumberish = await bridge._domainID(); 
        
        const tokenAddresses = [
            new Token("ULX",    "0x598E5dBC2f6513E6cb1bA253b255A5b73A2a720b"), 
            new Token("USDT",   "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2"),
            new Token("AK1111", "0x54b659832f59c24ceC0E4A2Cd193377F1BCEfc3c"),
            new Token("USDC",   "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"),
        ];

        const iterator = +(await DAO.getChangeFeeRequestCount()) + 1;
        console.info((iterator));

        // for(let i = 1; i <= tokenAddresses.length; i++) {
        //     console.info(`${tokenAddresses[i - 1].tokenName} BASE ${await bridge.getFee(Helpers.findToken(tokenAddresses, tokenAddresses[i - 1].tokenName), domainId)}`)
        //     console.info(`${tokenAddresses[i - 1].tokenName} ULX ${await bridge.getFee(Helpers.findToken(tokenAddresses, tokenAddresses[i - 1].tokenName), ultronDomainId)}`)    
        // }

        // // Initial tokens
        // // ULX
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "ULX"), domainId, Helpers.parseDecimals(24, 18), Helpers.parseDecimals(48, 18), Helpers.parseDecimals(50000000, 18));
        // await Helpers.delay(8000);

        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "ULX"), ultronDomainId, Helpers.parseDecimals(24, 18), Helpers.parseDecimals(48, 18), Helpers.parseDecimals(50000000, 18));
        // await Helpers.delay(8000);

        // // USDT
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "USDT"), domainId, Helpers.parseDecimals(0.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(2000000, 6));
        // await Helpers.delay(8000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "USDT"), ultronDomainId, Helpers.parseDecimals(0.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(2000000, 6));
        // await Helpers.delay(8000);

        // // AK1111
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AK1111"), domainId, Helpers.parseDecimals(2, 18), Helpers.parseDecimals(5, 18), Helpers.parseDecimals(50000000, 18));
        // await Helpers.delay(4000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "AK1111"), ultronDomainId, Helpers.parseDecimals(2, 18), Helpers.parseDecimals(5, 18), Helpers.parseDecimals(50000000, 18));
        // await Helpers.delay(4000);

        // // USDC
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "USDC"), domainId, Helpers.parseDecimals(0.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(2000000, 6));
        // await Helpers.delay(8000);
        
        // await DAO.newChangeFeeRequest(Helpers.findToken(tokenAddresses, "USDC"), ultronDomainId, Helpers.parseDecimals(0.9, 6), Helpers.parseDecimals(12, 6), Helpers.parseDecimals(2000000, 6));
        // await Helpers.delay(8000);

        // for(let i:number = iterator; i <= (await DAO.getChangeFeeRequestCount()); i++) {
        //     await bridge.adminChangeFee(i);
        //     console.info(`adminChangeFeeRequest ${i}`)    
        //     await Helpers.delay(8000);
        // }

        return domainId;
    });