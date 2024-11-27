import { BigNumberish } from "ethers";
import { subtask, task } from "hardhat/config";
import * as Helpers from "../hardhat-test/helpers";
import { Token, TokenFee, TokenResourceId } from "./tokenFee";

task("set-resource-ids-burnable-ultron", "Setting burnable and resource Ids for tokens")      
    .setAction(async (_, { ethers, network }) => {
        if(network.name != "ultron") {
            console.error("Should be ultron network!");
            return;
        }
        const signer = (await ethers.getSigners())[0];

        const bridgeAddress = "0x61488630B3337b9b897eF3A0AB47CB180399CEa3";
        const erc20HandlerAddress = "0xc078626DA5C09DC63A7c5C0c030f431EFfF098b8";
        const daoAddress = "0x6025adaD5b1EAC55f24e3e4783E0e881428017e8";

        // Old used for first tests:
        // const bridgeAddress = "0xC453C52f794661C2c0856936e13df67F0eB82f9e";
        // const daoAddress = "0xc4A47D97070Dd02F4544a12859f6A23592C8194B";
        // const erc20HandlerAddress = "0x6d5a23B55CBDB0Fc7b48794d806f0bcE7Dca99E1";

        const bridge = await ethers.getContractAt("Bridge", bridgeAddress, signer);
        const DAO = await ethers.getContractAt("DAO", daoAddress, signer);
        const ERC20Handler = await ethers.getContractAt("ERC20Handler", erc20HandlerAddress, signer);

        const domainId:BigNumberish = await bridge._domainID();

        const tokenAddresses = [
            // new Token("WULX",   "0x3a4F06431457de873B588846d139EC0d86275d54"), 
            // new Token("WBTC",   "0xd2b86a80A8f30b83843e247A50eCDc8D843D87dD"), 
            // new Token("WETH",   "0x2318Bf5809a72AaBAdd15a3453A18e50Bbd651Cd"), 
            // new Token("BNB",    "0x169ac560852ed79af3D97A8977DCf2EBA54A0488"), 
            // new Token("AVAX",   "0x6FE94412953D373Ef464b85637218EFA9EAB8e97"), 
            // new Token("BUSD",   "0xc7cAc85C1779d2B8ADA94EFfff49A4754865e2E4"), 
            // new Token("SHIB",   "0xb5Bb1911cf6C83C1a6E439951C40C2949B0d907f"), 
            // new Token("MATIC",  "0x6094a1e3919b302E236B447f45c4eb2DeCE9D9F4"),
            // new Token("FTM",    "0xE8Ef8A6FE387C2D10951a63ca8f37dB6B8fA02C1"), 
            // new Token("DAI",    "0x045F0f2DE758743c84b756B1Fca735a0dDf0b8f4"),
            // new Token("LINK",   "0xc8Fb7999d62072E12fE8f3EDcd7821204FCa0344"), 
            // new Token("uUSDT",  "0x97FDd294024f50c388e39e73F1705a35cfE87656"),
            // new Token("uUSDC",  "0x3c4E0FdeD74876295Ca36F62da289F69E3929cc4"),

            // // new Token("bep_uUSDT",  "0xB8160f15D44604E892Ac52eC4CCBfDA3cafbFDbd"),
            // // new Token("bep_uUSDC",  "0x06d522b2118d535978382d9533a68B0b110f9BC2"),
            
            // new Token("DOGE",  "0x01458EFbC8f290d226A7EeaE6A351e74f49B53db"),
            // new Token("XRP",  "0xA277fD3CF60cd2C37A07bccFC108990293DBF58b"),
            // new Token("ADA",  "0x2867cC0Ae16409003A41Ff57230a992E24CD5847"),
            // new Token("DOT",  "0xFF1180c58Ff4F63c4dB2E2835980d860B9D4A6AC"),
            // new Token("UNI",  "0xFd697C6dF70D6164CE11F8477cbFf01458FA87Cc"),
            // new Token("ATOM",  "0x943E6790FA94686F6FFB0996Cd92eC5313cb6B86"),
            // new Token("AAVE",  "0xdbD8077180eBa0711A2336Cc54F05a91685F3FF7"),
            // new Token("AXS",  "0x64f9D58a03B7f303b836CE733674F85AC494E616"),
            // new Token("SAND",  "0xA620B6b7f2507a184e56200F36C266779bDd8d69"),
            // new Token("MANA",  "0x9CD5123e6FBaAA72604884F90dC37e91Ba3A806B"),
            // new Token("CAKE",  "0xB76EEbE588B6Ad1525b26d077D38DE7D298E0485"),
            // new Token("NEAR",  "0x44d5F333cAED3b70Cad92CCa4C63F397B2E89aa6"),
            // new Token("1INCH",  "0xC757848bb5a7e2539b4b6F61176879199822A79B"),
            // new Token("FLUX",  "0x0681ed2D9EbFe37b12622c270eD0C534528fC673"),
            // new Token("TRX",  "0x5Aa4D9b8DB3a6413408Cb31E77bc03867A845485"),

            // new Token("CRV",   "0xAa4f71EB8d3B28a535E9bDcc48280D64A10125bE"),
            // new Token("APE",   "0x8FCce7ce7078bfd3cB217D9a1604140c47cdA509"),
            // new Token("LDO",   "0x9743FbdAfE350B8D5dF5Bf445918BeF3C0D19ddb"),
            // new Token("VET",   "0xd3ECeEd56da398aB32C7B997b29dBFA377fA0Cb1"),
            // new Token("EGLD",  "0x1869e04426974e3fF82417692Cc610c15f4F56d1"),
            // new Token("SNX",   "0x167536058b060E38e07B6defAbcD74d169b8fCAD"),
            
            // new Token("PEPE",   "0x2e29eab368c30E692B9805084C0D3B07215D7762"),
            // new Token("AK1111",   "0x52b502e0c7986A3c705DCf411E768e5cE90c87ec"), 
            new Token("MOODENG",   "0xCB743D15F88789498A6dA9C6438FBAd9D7befae7"), 
        ];

        // for(let i:number = 2; i <= tokenAddresses.length - 4; i++) {
        //     let token = await ethers.getContractAt("ERC20Custom", tokenAddresses[i - 1].tokenAddress, signer);
        //     let role = await token.MINTER_ROLE(); 
        //     // await token.grantMinterRole(erc20HandlerAddress);
        //     // await Helpers.delay(4000);
        //     console.info(`${tokenAddresses[i - 1].tokenName} ${await token.hasRole(role, erc20HandlerAddress)}`);
        // }

        // for(let i:number = tokenAddresses.length - 3; i <= tokenAddresses.length; i++) {
        //     let token = await ethers.getContractAt("ERC20Stable", tokenAddresses[i - 1].tokenAddress, signer);
        //     let role = await token.MINTER_ROLE(); 
        //     // await token.grantMinterRole(erc20HandlerAddress);
        //     // await Helpers.delay(4000);
        //     console.info(`${tokenAddresses[i - 1].tokenName} ${await token.hasRole(role, erc20HandlerAddress)}`);
        // }

        const resourceIds = [
            // new TokenResourceId("WULX",      "0x00000000000000000000003a4F06431457de873B588846d139EC0d86275d5401"),
            // new TokenResourceId("WBTC",      "0x00000000000000000000008e96f8fcd6815b4e1528d63e5f72e6dcc04bf9be01"),
            // new TokenResourceId("WETH",      "0x0000000000000000000000b15b478246201dac8d92353c34615a7b20bea93801"),
            // new TokenResourceId("BNB",       "0x000000000000000000000093b400831fb4689e41457f43b3f697042fe59f0101"),
            // new TokenResourceId("AVAX",      "0x0000000000000000000000b5be0484fb6118401f5377c32ec3f1e530cc181501"),
            // new TokenResourceId("BUSD",      "0x0000000000000000000000422b105bb127a883f9dc0ee022304fcb5fde5b9c01"),
            // new TokenResourceId("SHIB",      "0x000000000000000000000049f1b81eca2b0d1e3aa82e64934292a6b59ad61b01"),
            // new TokenResourceId("MATIC",     "0x0000000000000000000000cecc5727d1e5e4af94304ef98b559b00183cbeac01"),
            // new TokenResourceId("FTM",       "0x0000000000000000000000df1c1c2f3305bb6e082d382a15eb9c048dc4c58a01"),
            // new TokenResourceId("DAI",       "0x0000000000000000000000312cf2901c89637f34a83f594028fba1517f8cd501"),
            // new TokenResourceId("LINK",      "0x00000000000000000000004df449d10bd2bf419f2fe578dfd15bb361a2d14801"),
            // new TokenResourceId("uUSDT",     "0x0000000000000000000000b7fe74c0c957534400d2ff0612d3f59af79eba4901"),
            // new TokenResourceId("uUSDC",     "0x0000000000000000000000026d9a638b8981ed47aa1580f79533cea7c1fc4801"),

            // // new TokenResourceId("bep_uUSDT", "0x0000000000000000000000b8160f15d44604e892ac52ec4ccbfda3cafbfdbd01"),
            // // new TokenResourceId("bep_uUSDC", "0x000000000000000000000006d522b2118d535978382d9533a68b0b110f9bc201"),
            
            // new TokenResourceId("DOGE",   "0x000000000000000000000001458efbc8f290d226a7eeae6a351e74f49b53db01"),
            // new TokenResourceId("XRP",    "0x0000000000000000000000a277fd3cf60cd2c37a07bccfc108990293dbf58b01"),
            // new TokenResourceId("ADA",    "0x00000000000000000000002867cc0ae16409003a41ff57230a992e24cd584701"),
            // new TokenResourceId("DOT",    "0x0000000000000000000000ff1180c58ff4f63c4db2e2835980d860b9d4a6ac01"),
            // new TokenResourceId("UNI",    "0x0000000000000000000000fd697c6df70d6164ce11f8477cbff01458fa87cc01"),
            // new TokenResourceId("ATOM",   "0x0000000000000000000000943e6790fa94686f6ffb0996cd92ec5313cb6b8601"),
            // new TokenResourceId("AAVE",   "0x0000000000000000000000dbd8077180eba0711a2336cc54f05a91685f3ff701"),
            // new TokenResourceId("AXS",    "0x000000000000000000000064f9d58a03b7f303b836ce733674f85ac494e61601"),
            // new TokenResourceId("SAND",   "0x0000000000000000000000a620b6b7f2507a184e56200f36c266779bdd8d6901"),
            // new TokenResourceId("MANA",   "0x00000000000000000000009cd5123e6fbaaa72604884f90dc37e91ba3a806b01"),
            // new TokenResourceId("CAKE",   "0x0000000000000000000000b76eebe588b6ad1525b26d077d38de7d298e048501"),
            // new TokenResourceId("NEAR",   "0x000000000000000000000044d5f333caed3b70cad92cca4c63f397b2e89aa601"),
            // new TokenResourceId("1INCH",  "0x0000000000000000000000c757848bb5a7e2539b4b6f61176879199822a79b01"),
            // new TokenResourceId("FLUX",   "0x00000000000000000000000681ed2d9ebfe37b12622c270ed0c534528fc67301"),
            // new TokenResourceId("TRX",    "0x00000000000000000000005aa4d9b8db3a6413408cb31e77bc03867a84548501"),

            // new TokenResourceId("CRV",    "0x0000000000000000000000Aa4f71EB8d3B28a535E9bDcc48280D64A10125bE01"),
            // new TokenResourceId("APE",    "0x00000000000000000000008FCce7ce7078bfd3cB217D9a1604140c47cdA50901"),
            // new TokenResourceId("LDO",    "0x00000000000000000000009743FbdAfE350B8D5dF5Bf445918BeF3C0D19ddb01"),
            // new TokenResourceId("VET",    "0x00000000000000000000001a9F8a54E151377d1067DB335C748df2deB0955201"),
            // new TokenResourceId("EGLD",   "0x00000000000000000000001869e04426974e3fF82417692Cc610c15f4F56d101"),
            // new TokenResourceId("SNX",    "0x0000000000000000000000167536058b060E38e07B6defAbcD74d169b8fCAD01"),

            // new TokenResourceId("PEPE",   "0x00000000000000000000002e29eab368c30e692b9805084c0d3b07215d776201"),
            // new TokenResourceId("AK1111",   "0x000000000000000000000052b502e0c7986A3c705DCf411E768e5cE90c87ec01"),
            new TokenResourceId("MOODENG",      "0x00000000000000000000001111111111CbDd6Ee1eE4689368576c50094DCb501"),
        ];

        // const handler = await ethers.getContractAt("ERC20Handler", erc20HandlerAddress, signer);
        // for(let i:number = 1; i <= tokenAddresses.length; i++) {
        //     let tokenAddress = await handler._resourceIDToTokenContractAddress(resourceIds[i - 1].resourceId); 
        //     console.info(`Minter ${tokenAddresses[i - 1].tokenName} - ${tokenAddress.toLowerCase() == tokenAddresses[i - 1].tokenAddress.toLowerCase()}`);
        // }

        // for(let i:number = 1; i <= tokenAddresses.length; i++) {
        //     let isBurnable = await handler._burnList(tokenAddresses[i - 1].tokenAddress); 
        //     console.info(`Burnable ${tokenAddresses[i - 1].tokenName} - ${isBurnable}`);
        // }
        
        const iteratorResource = +(await DAO.getSetResourceRequestCount());
        console.info(iteratorResource);   
        const iteratorBurnable = +(await DAO.getSetBurnableRequestCount());     
        console.info(iteratorBurnable);

        // let resourceIds: string[] = [];
        for(let i:number = iteratorResource + 1; i <= iteratorResource + tokenAddresses.length; i++) {
            // resourceIds.push(Helpers.createResourceID(tokenAddresses[i - iteratorResource - 1].tokenAddress, domainId));
            await DAO.newSetResourceRequest(erc20HandlerAddress, resourceIds[i - iteratorResource - 1].resourceId, tokenAddresses[i - iteratorResource - 1].tokenAddress);
            await Helpers.delay(4000);
            console.info(`${resourceIds[i - iteratorResource - 1].tokenName} - ${resourceIds[i - iteratorResource - 1].resourceId} - ${await DAO.getSetResourceRequestCount()}`)
        }

        // for(let i:number = iteratorResource; i <= (await DAO.getSetResourceRequestCount()); i++) {
        //     await bridge.adminSetResource(i);    
        //     await Helpers.delay(4000);
        //     console.info(`adminSetResource ${i}`)
        // }

        // for(let i:number = iteratorBurnable + 1; i <= iteratorBurnable + tokenAddresses.length; i++) {
        //     await DAO.newSetBurnableRequest(erc20HandlerAddress, tokenAddresses[i - iteratorBurnable - 1].tokenAddress);
        //     await Helpers.delay(4000);
        //     console.info(`${tokenAddresses[i - iteratorBurnable - 1].tokenName} - ${await DAO.getSetBurnableRequestCount()}`)
        // }

        // for(let i:number = iteratorBurnable; i <= (await DAO.getSetBurnableRequestCount()); i++) {
        //     await bridge.adminSetBurnable(i);
        //     await Helpers.delay(4000);
        //     console.info(`adminSetBurnable ${i}`)
        // }

        return true;
    });

task("set-resource-ids-burnable-ethereum", "Setting resource Ids for tokens")      
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
        
        const tokenAddresses = [
            // new Token("WULX",   "0x5Aa158404fEd6b4730C13F49d3a7F820e14A636F"), 
            // new Token("WBTC",   "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"), 
            // new Token("WETH",   "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"), 
            // new Token("BNB",    "0xB8c77482e45F1F44dE1745F52C74426C631bDD52"), 
            // new Token("BUSD",   "0x4Fabb145d64652a948d72533023f6E7A623C7C53"), 
            // new Token("SHIB",   "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE"), 
            // new Token("MATIC",  "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0"),
            // new Token("FTM",    "0x4E15361FD6b4BB609Fa63C81A2be19d873717870"), 
            // new Token("DAI",    "0x6B175474E89094C44Da98b954EedeAC495271d0F"),
            // new Token("LINK",   "0x514910771AF9Ca656af840dff83E8264EcF986CA"), 
            // new Token("USDT",   "0xdAC17F958D2ee523a2206206994597C13D831ec7"),
            // new Token("USDC",   "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"),

            // new Token("UNI", "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"),
            // new Token("AAVE", "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9"),
            // new Token("AXS", "0xBB0E17EF65F82Ab018d8EDd776e8DD940327B28b"),
            // new Token("SAND", "0x3845badAde8e6dFF049820680d1F14bD3903a5d0"),
            // new Token("MANA", "0x0F5D2fB29fb7d3CFeE444a200298f468908cC942"),
            // new Token("NEAR", "0x85F17Cf997934a597031b2E18a9aB6ebD4B9f6a4"),
            // new Token("1INCH", "0x111111111117dC0aa78b770fA6A738034120C302"),

            // new Token("CRV", "0xD533a949740bb3306d119CC777fa900bA034cd52"),
            // new Token("APE", "0x4d224452801ACEd8B2F0aebE155379bb5D594381"),
            // new Token("LDO", "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32"),

            // new Token("SNX", "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F"),
            new Token("PEPE", "0x6982508145454ce325ddbe47a25d4ec3d2311933"),
        ];

        const resourceIds = [
            // new TokenResourceId("WULX",     "0x00000000000000000000003a4F06431457de873B588846d139EC0d86275d5401"),
            // new TokenResourceId("WBTC",     "0x00000000000000000000008e96f8fcd6815b4e1528d63e5f72e6dcc04bf9be01"),
            // new TokenResourceId("WETH",     "0x0000000000000000000000b15b478246201dac8d92353c34615a7b20bea93801"),
            // new TokenResourceId("BNB",      "0x000000000000000000000093b400831fb4689e41457f43b3f697042fe59f0101"),
            // new TokenResourceId("BUSD",     "0x0000000000000000000000422b105bb127a883f9dc0ee022304fcb5fde5b9c01"),
            // new TokenResourceId("SHIB",     "0x000000000000000000000049f1b81eca2b0d1e3aa82e64934292a6b59ad61b01"),
            // new TokenResourceId("MATIC",    "0x0000000000000000000000cecc5727d1e5e4af94304ef98b559b00183cbeac01"),
            // new TokenResourceId("FTM",      "0x0000000000000000000000df1c1c2f3305bb6e082d382a15eb9c048dc4c58a01"),
            // new TokenResourceId("DAI",      "0x0000000000000000000000312cf2901c89637f34a83f594028fba1517f8cd501"),
            // new TokenResourceId("LINK",     "0x00000000000000000000004df449d10bd2bf419f2fe578dfd15bb361a2d14801"),
            // new TokenResourceId("USDT",     "0x0000000000000000000000b7fe74c0c957534400d2ff0612d3f59af79eba4901"),
            // new TokenResourceId("USDC",     "0x0000000000000000000000026d9a638b8981ed47aa1580f79533cea7c1fc4801"),

            // new TokenResourceId("UNI",    "0x0000000000000000000000fd697c6df70d6164ce11f8477cbff01458fa87cc01"),
            // new TokenResourceId("AAVE",   "0x0000000000000000000000dbd8077180eba0711a2336cc54f05a91685f3ff701"),
            // new TokenResourceId("AXS",    "0x000000000000000000000064f9d58a03b7f303b836ce733674f85ac494e61601"),
            // new TokenResourceId("SAND",   "0x0000000000000000000000a620b6b7f2507a184e56200f36c266779bdd8d6901"),
            // new TokenResourceId("MANA",   "0x00000000000000000000009cd5123e6fbaaa72604884f90dc37e91ba3a806b01"),
            // new TokenResourceId("NEAR",   "0x000000000000000000000044d5f333caed3b70cad92cca4c63f397b2e89aa601"),
            // new TokenResourceId("1INCH",  "0x0000000000000000000000c757848bb5a7e2539b4b6f61176879199822a79b01"),

            // new TokenResourceId("CRV",    "0x0000000000000000000000Aa4f71EB8d3B28a535E9bDcc48280D64A10125bE01"),
            // new TokenResourceId("APE",    "0x00000000000000000000008FCce7ce7078bfd3cB217D9a1604140c47cdA50901"),
            // new TokenResourceId("LDO",    "0x00000000000000000000009743FbdAfE350B8D5dF5Bf445918BeF3C0D19ddb01"),

            // new TokenResourceId("SNX", "0x0000000000000000000000167536058b060E38e07B6defAbcD74d169b8fCAD01"),
            new TokenResourceId("PEPE",   "0x00000000000000000000002e29eab368c30e692b9805084c0d3b07215d776201"),
        ];

        // for(let i:number = 1; i <= tokenAddresses.length; i++) {
        //     let token = await ethers.getContractAt("ERC20Custom", tokenAddresses[i - 1].tokenAddress, signer);
        //     let role = await token.MINTER_ROLE(); 
        //     // await token.grantMinterRole(erc20HandlerAddress);
        //     // await Helpers.delay(4000);
        //     console.info(`${tokenAddresses[i - 1].tokenName} ${await token.hasRole(role, erc20HandlerAddress)}`);
        // }

        // const handler = await ethers.getContractAt("ERC20Handler", erc20HandlerAddress, signer);
        // for(let i:number = 1; i <= tokenAddresses.length; i++) {
        //     let tokenAddress = await handler._resourceIDToTokenContractAddress(resourceIds[i - 1].resourceId); 
        //     console.info(`${tokenAddresses[i - 1].tokenName} - ${tokenAddress.toLowerCase() == tokenAddresses[i - 1].tokenAddress.toLowerCase()}`);
        // }

        // for(let i:number = 1; i <= tokenAddresses.length; i++) {
        //     let isBurnable = await handler._burnList(tokenAddresses[i - 1].tokenAddress); 
        //     console.info(`Burnable ${tokenAddresses[i - 1].tokenName} - ${isBurnable}`);
        // }

        const iteratorResource = +(await DAO.getSetResourceRequestCount());
        console.info(iteratorResource);   
        const iteratorBurnable = +(await DAO.getSetBurnableRequestCount());     
        console.info(iteratorBurnable);

        // for(let i:number = iteratorResource + 1; i <= iteratorResource + tokenAddresses.length; i++) {
        //     await DAO.newSetResourceRequest(erc20HandlerAddress, resourceIds[i - iteratorResource - 1].resourceId, tokenAddresses[i - iteratorResource - 1].tokenAddress);
        //     await Helpers.delay(4000);
        //     console.info(`${resourceIds[i - iteratorResource - 1].tokenName} - ${resourceIds[i - iteratorResource - 1].resourceId} - ${await DAO.getSetResourceRequestCount()}`)
        // }

        // for(let i:number = iteratorResource; i <= (await DAO.getSetResourceRequestCount()); i++) {
        //     await bridge.adminSetResource(i);    
        //     await Helpers.delay(4000);
        //     console.info(`adminSetResource ${i}`)
        // }

        // for(let i:number = iteratorBurnable + 1; i <= iteratorBurnable + tokenAddresses.length; i++) {
        //     await DAO.newSetBurnableRequest(erc20HandlerAddress, tokenAddresses[i - iteratorBurnable - 1].tokenAddress);
        //     await Helpers.delay(4000);
        //     console.info(`${tokenAddresses[i - 1].tokenName} - ${await DAO.getSetBurnableRequestCount()}`)
        // }

        // for(let i:number = iteratorBurnable; i <= (await DAO.getSetBurnableRequestCount()); i++) {
        //     await bridge.adminSetBurnable(i);
        //     await Helpers.delay(4000);
        //     console.info(`adminSetBurnable ${i}`)
        // }

        return true;
    });

task("set-resource-ids-burnable-bsc", "Setting resource Ids for tokens")      
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
        
        const tokenAddresses = [
            // new Token("WULX",   "0xd983AB71a284d6371908420d8Ac6407ca943F810"), 
            // new Token("WBTC",   "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c"), 
            // new Token("WETH",   "0x2170Ed0880ac9A755fd29B2688956BD959F933F8"), 
            // new Token("BNB",    "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"), 
            // new Token("AVAX",   "0x1CE0c2827e2eF14D5C4f29a091d735A204794041"), 
            // new Token("BUSD",   "0xe9e7cea3dedca5984780bafc599bd69add087d56"), 
            // new Token("SHIB",   "0x2859e4544C4bB03966803b044A93563Bd2D0DD4D"), 
            // new Token("MATIC",  "0xcc42724c6683b7e57334c4e856f4c9965ed682bd"),
            // new Token("FTM",    "0xad29abb318791d579433d831ed122afeaf29dcfe"), 
            // new Token("DAI",    "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3"),
            // new Token("LINK",   "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD"), 
            // new Token("USDT",   "0x55d398326f99059ff775485246999027b3197955"),
            // new Token("USDC",   "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"),

            // new Token("DOGE", "0xbA2aE424d960c26247Dd6c32edC70B295c744C43"),
            // new Token("XRP", "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE"),
            // new Token("ADA", "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47"),
            // new Token("DOT", "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402"),
            // new Token("UNI", "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1"),
            // new Token("ATOM", "0x0Eb3a705fc54725037CC9e008bDede697f62F335"),
            // new Token("AAVE", "0xfb6115445Bff7b52FeB98650C87f44907E58f802"),
            // new Token("AXS", "0x715D400F88C167884bbCc41C5FeA407ed4D2f8A0"),
            // new Token("SAND", "0x67b725d7e342d7B611fa85e859Df9697D9378B2e"),
            // new Token("MANA", "0x26433c8127d9b4e9B71Eaa15111DF99Ea2EeB2f8"),
            // new Token("CAKE", "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82"),
            // new Token("NEAR", "0x1Fa4a73a3F0133f0025378af00236f3aBDEE5D63"),
            // new Token("1INCH", "0x111111111117dC0aa78b770fA6A738034120C302"),
            // new Token("FLUX", "0xaFF9084f2374585879e8B434C399E29E80ccE635"),
            // new Token("TRX", "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B"),

            // new Token("APE", "0xC762043E211571eB34f1ef377e5e8e76914962f9"),
            // new Token("LDO", "0x986854779804799C1d68867F5E03e601E781e41b"),
            // new Token("VET", "0x6FDcdfef7c496407cCb0cEC90f9C5Aaa1Cc8D888"),
            // new Token("EGLD", "0xbF7c81FFF98BbE61B40Ed186e4AfD6DDd01337fe"),
            // new Token("SNX", "0x9Ac983826058b8a9C7Aa1C9171441191232E8404"),
            // new Token("PEPE", "0x25d887Ce7a35172C62FeBFD67a1856F20FaEbB00"),
            new Token("MOODENG", "0x1111111111CbDd6Ee1eE4689368576c50094DCb5"),
        ];

        const resourceIds = [
            // new TokenResourceId("WULX",   "0x00000000000000000000003a4F06431457de873B588846d139EC0d86275d5401"),
            // new TokenResourceId("WBTC",     "0x00000000000000000000008e96f8fcd6815b4e1528d63e5f72e6dcc04bf9be01"),
            // new TokenResourceId("WETH",     "0x0000000000000000000000b15b478246201dac8d92353c34615a7b20bea93801"),
            // new TokenResourceId("BNB",      "0x000000000000000000000093b400831fb4689e41457f43b3f697042fe59f0101"),
            // new TokenResourceId("AVAX",     "0x0000000000000000000000b5be0484fb6118401f5377c32ec3f1e530cc181501"),
            // new TokenResourceId("BUSD",     "0x0000000000000000000000422b105bb127a883f9dc0ee022304fcb5fde5b9c01"),
            // new TokenResourceId("SHIB",     "0x000000000000000000000049f1b81eca2b0d1e3aa82e64934292a6b59ad61b01"),
            // new TokenResourceId("MATIC",    "0x0000000000000000000000cecc5727d1e5e4af94304ef98b559b00183cbeac01"),
            // new TokenResourceId("FTM",      "0x0000000000000000000000df1c1c2f3305bb6e082d382a15eb9c048dc4c58a01"),
            // new TokenResourceId("DAI",      "0x0000000000000000000000312cf2901c89637f34a83f594028fba1517f8cd501"),
            // new TokenResourceId("LINK",     "0x00000000000000000000004df449d10bd2bf419f2fe578dfd15bb361a2d14801"),
            // new TokenResourceId("USDT",     "0x0000000000000000000000b7fe74c0c957534400d2ff0612d3f59af79eba4901"),
            // new TokenResourceId("USDC",     "0x0000000000000000000000026d9a638b8981ed47aa1580f79533cea7c1fc4801"),

            // // new TokenResourceId("bep_uUSDT", "0x0000000000000000000000b8160f15d44604e892ac52ec4ccbfda3cafbfdbd01"),
            // // new TokenResourceId("bep_uUSDC", "0x000000000000000000000006d522b2118d535978382d9533a68b0b110f9bc201"),

            // new TokenResourceId("DOGE",   "0x000000000000000000000001458efbc8f290d226a7eeae6a351e74f49b53db01"),
            // new TokenResourceId("XRP",    "0x0000000000000000000000a277fd3cf60cd2c37a07bccfc108990293dbf58b01"),
            // new TokenResourceId("ADA",    "0x00000000000000000000002867cc0ae16409003a41ff57230a992e24cd584701"),
            // new TokenResourceId("DOT",    "0x0000000000000000000000ff1180c58ff4f63c4db2e2835980d860b9d4a6ac01"),
            // new TokenResourceId("UNI",    "0x0000000000000000000000fd697c6df70d6164ce11f8477cbff01458fa87cc01"),
            // new TokenResourceId("ATOM",   "0x0000000000000000000000943e6790fa94686f6ffb0996cd92ec5313cb6b8601"),
            // new TokenResourceId("AAVE",   "0x0000000000000000000000dbd8077180eba0711a2336cc54f05a91685f3ff701"),
            // new TokenResourceId("AXS",    "0x000000000000000000000064f9d58a03b7f303b836ce733674f85ac494e61601"),
            // new TokenResourceId("SAND",   "0x0000000000000000000000a620b6b7f2507a184e56200f36c266779bdd8d6901"),
            // new TokenResourceId("MANA",   "0x00000000000000000000009cd5123e6fbaaa72604884f90dc37e91ba3a806b01"),
            // new TokenResourceId("CAKE",   "0x0000000000000000000000b76eebe588b6ad1525b26d077d38de7d298e048501"),
            // new TokenResourceId("NEAR",   "0x000000000000000000000044d5f333caed3b70cad92cca4c63f397b2e89aa601"),
            // new TokenResourceId("1INCH",  "0x0000000000000000000000c757848bb5a7e2539b4b6f61176879199822a79b01"),
            // new TokenResourceId("FLUX",   "0x00000000000000000000000681ed2d9ebfe37b12622c270ed0c534528fc67301"),
            // new TokenResourceId("TRX",    "0x00000000000000000000005aa4d9b8db3a6413408cb31e77bc03867a84548501"),

            // new TokenResourceId("APE",    "0x00000000000000000000008FCce7ce7078bfd3cB217D9a1604140c47cdA50901"),
            // new TokenResourceId("LDO",    "0x00000000000000000000009743FbdAfE350B8D5dF5Bf445918BeF3C0D19ddb01"),
            // new TokenResourceId("VET",    "0x00000000000000000000001a9F8a54E151377d1067DB335C748df2deB0955201"),
            // new TokenResourceId("EGLD",   "0x00000000000000000000001869e04426974e3fF82417692Cc610c15f4F56d101"),
            // new TokenResourceId("SNX",    "0x0000000000000000000000167536058b060E38e07B6defAbcD74d169b8fCAD01"),
            // new TokenResourceId("PEPE",      "0x00000000000000000000002e29eab368c30e692b9805084c0d3b07215d776201"),
            new TokenResourceId("MOODENG",      "0x00000000000000000000001111111111CbDd6Ee1eE4689368576c50094DCb501"),
        ];

        // for(let i:number = 1; i <= tokenAddresses.length; i++) {
        //     let token = await ethers.getContractAt("ERC20Custom", tokenAddresses[i - 1].tokenAddress, signer);
        //     let role = await token.MINTER_ROLE(); 
        //     // await token.grantMinterRole(erc20HandlerAddress);
        //     // await Helpers.delay(4000);
        //     console.info(`${tokenAddresses[i - 1].tokenName} ${await token.hasRole(role, erc20HandlerAddress)}`);
        // }

        // const handler = await ethers.getContractAt("ERC20Handler", erc20HandlerAddress, signer);
        // for(let i:number = 1; i <= tokenAddresses.length; i++) {
        //     let tokenAddress = await handler._resourceIDToTokenContractAddress(resourceIds[i - 1].resourceId); 
        //     console.info(`${tokenAddresses[i - 1].tokenName} - ${tokenAddress.toLowerCase() == tokenAddresses[i - 1].tokenAddress.toLowerCase()}`);
        // }

        // for(let i:number = 1; i <= tokenAddresses.length; i++) {
        //     let isBurnable = await handler._burnList(tokenAddresses[i - 1].tokenAddress); 
        //     console.info(`Burnable ${tokenAddresses[i - 1].tokenName} - ${isBurnable}`);
        // }

        const iteratorResource = +(await DAO.getSetResourceRequestCount());
        console.info(iteratorResource);   
        const iteratorBurnable = +(await DAO.getSetBurnableRequestCount());     
        console.info(iteratorBurnable);

        for(let i:number = iteratorResource + 1; i <= iteratorResource + tokenAddresses.length; i++) {
            await DAO.newSetResourceRequest(erc20HandlerAddress, resourceIds[i - iteratorResource - 1].resourceId, tokenAddresses[i - iteratorResource - 1].tokenAddress);
            await Helpers.delay(4000);
            console.info(`${resourceIds[i - iteratorResource - 1].tokenName} - ${resourceIds[i - iteratorResource - 1].resourceId} - ${await DAO.getSetResourceRequestCount()}`)
        }

        // for(let i:number = iteratorResource; i <= (await DAO.getSetResourceRequestCount()); i++) {
        //     await bridge.adminSetResource(i);    
        //     await Helpers.delay(4000);
        //     console.info(`adminSetResource ${i}`)
        // }

        // for(let i:number = iteratorBurnable + 1; i <= iteratorBurnable + tokenAddresses.length; i++) {
        //     await DAO.newSetBurnableRequest(erc20HandlerAddress, tokenAddresses[i - iteratorBurnable - 1].tokenAddress);
        //     await Helpers.delay(4000);
        //     console.info(`${tokenAddresses[i - 1].tokenName} - ${await DAO.getSetBurnableRequestCount()}`)
        // }

        // for(let i:number = iteratorBurnable; i <= (await DAO.getSetBurnableRequestCount()); i++) {
        //     await bridge.adminSetBurnable(i);
        //     await Helpers.delay(4000);
        //     console.info(`adminSetBurnable ${i}`)
        // }

        return true;
    });

task("set-resource-ids-burnable-avalanche", "Setting resource Ids for tokens")      
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
        
        const tokenAddresses = [
            // new Token("WULX",   "0xC685E8EDDC9f078666794CbfcD8D8351bac404eF"), 
            // new Token("WBTC",   "0x50b7545627a5162F82A992c33b87aDc75187B218"), 
            // new Token("WETH",   "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB"), 
            // new Token("BNB",    "0x264c1383EA520f73dd837F915ef3a732e204a493"), 
            // new Token("AVAX",   "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"), 
            // new Token("BUSD",   "0xaEb044650278731Ef3DC244692AB9F64C78FfaEA"), 
            // new Token("SHIB",   "0x02D980A0D7AF3fb7Cf7Df8cB35d9eDBCF355f665"), 
            // new Token("DAI",    "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70"),
            // new Token("LINK",   "0xB3fe5374F67D7a22886A0eE082b2E2f9d2651651"), 
            // new Token("USDT",   "0xc7198437980c041c805A1EDcbA50c1Ce5db95118"),
            // new Token("USDC",   "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664"),

            // new Token("AAVE", "0x63a72806098Bd3D9520cC43356dD78afe5D386D9"),
            // new Token("SNX", "0xBeC243C995409E6520D7C41E404da5dEba4b209B"),
        ];

        const resourceIds = [
            // new TokenResourceId("WULX",   "0x00000000000000000000003a4F06431457de873B588846d139EC0d86275d5401"),
            // new TokenResourceId("WBTC",     "0x00000000000000000000008e96f8fcd6815b4e1528d63e5f72e6dcc04bf9be01"),
            // new TokenResourceId("WETH",     "0x0000000000000000000000b15b478246201dac8d92353c34615a7b20bea93801"),
            // new TokenResourceId("BNB",      "0x000000000000000000000093b400831fb4689e41457f43b3f697042fe59f0101"),
            // new TokenResourceId("AVAX",     "0x0000000000000000000000b5be0484fb6118401f5377c32ec3f1e530cc181501"),
            // new TokenResourceId("BUSD",     "0x0000000000000000000000422b105bb127a883f9dc0ee022304fcb5fde5b9c01"),
            // new TokenResourceId("SHIB",     "0x000000000000000000000049f1b81eca2b0d1e3aa82e64934292a6b59ad61b01"),
            // new TokenResourceId("DAI",      "0x0000000000000000000000312cf2901c89637f34a83f594028fba1517f8cd501"),
            // new TokenResourceId("LINK",     "0x00000000000000000000004df449d10bd2bf419f2fe578dfd15bb361a2d14801"),
            // new TokenResourceId("USDT",     "0x0000000000000000000000b7fe74c0c957534400d2ff0612d3f59af79eba4901"),
            // new TokenResourceId("USDC",     "0x0000000000000000000000026d9a638b8981ed47aa1580f79533cea7c1fc4801"),

            // new TokenResourceId("AAVE",   "0x0000000000000000000000dbd8077180eba0711a2336cc54f05a91685f3ff701"),
            // new TokenResourceId("SNX",   "0x0000000000000000000000167536058b060E38e07B6defAbcD74d169b8fCAD01"),
        ];

        // for(let i:number = 1; i <= tokenAddresses.length; i++) {
        //     let token = await ethers.getContractAt("ERC20Custom", tokenAddresses[i - 1].tokenAddress, signer);
        //     let role = await token.MINTER_ROLE(); 
        //     // await token.grantMinterRole(erc20HandlerAddress);
        //     await Helpers.delay(4000);
        //     console.info(`${tokenAddresses[i - 1].tokenName} ${await token.hasRole(role, erc20HandlerAddress)}`);
        // }

        // const handler = await ethers.getContractAt("ERC20Handler", erc20HandlerAddress, signer);
        // for(let i:number = 1; i <= tokenAddresses.length; i++) {
        //     let tokenAddress = await handler._resourceIDToTokenContractAddress(resourceIds[i - 1].resourceId); 
        //     console.info(`${tokenAddresses[i - 1].tokenName} - ${tokenAddress.toLowerCase() == tokenAddresses[i - 1].tokenAddress.toLowerCase()}`);
        // }

        // for(let i:number = 1; i <= tokenAddresses.length; i++) {
        //     let isBurnable = await handler._burnList(tokenAddresses[i - 1].tokenAddress); 
        //     console.info(`Burnable ${tokenAddresses[i - 1].tokenName} - ${isBurnable}`);
        // }

        const iteratorResource = +(await DAO.getSetResourceRequestCount());
        console.info(iteratorResource);   
        const iteratorBurnable = +(await DAO.getSetBurnableRequestCount());     
        console.info(iteratorBurnable);        

        // for(let i:number = iteratorResource + 1; i <= iteratorResource + tokenAddresses.length; i++) {
        //     await DAO.newSetResourceRequest(erc20HandlerAddress, resourceIds[i - iteratorResource - 1].resourceId, tokenAddresses[i - iteratorResource - 1].tokenAddress);
        //     await Helpers.delay(4000);
        //     console.info(`${resourceIds[i - iteratorResource - 1].tokenName} - ${resourceIds[i - iteratorResource - 1].resourceId} - ${await DAO.getSetResourceRequestCount()}`)
        // }

        // for(let i:number = iteratorResource; i <= (await DAO.getSetResourceRequestCount()); i++) {
        //     await bridge.adminSetResource(i);    
        //     console.info(`adminSetResource ${i}`)
        //     await Helpers.delay(4000);
        // }

        // for(let i:number = iteratorBurnable + 1; i <= iteratorBurnable + tokenAddresses.length; i++) {
        //     await DAO.newSetBurnableRequest(erc20HandlerAddress, tokenAddresses[i - iteratorBurnable - 1].tokenAddress);
        //     console.info(`${tokenAddresses[i - iteratorBurnable - 1].tokenName} - ${await DAO.getSetBurnableRequestCount()}`)
        //     await Helpers.delay(4000);
        // }

        // for(let i:number = iteratorBurnable; i <= (await DAO.getSetBurnableRequestCount()); i++) {
        //     await bridge.adminSetBurnable(i);
        //     console.info(`adminSetBurnable ${i}`)
        //     await Helpers.delay(4000);
        // }

        return true;
    });

task("set-resource-ids-burnable-polygon", "Setting resource Ids for tokens")      
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
        
        const tokenAddresses = [
            // new Token("WULX",   "0xfA5d5DD2517EE9C1419534a16B132adDe2e3d948"),
            // new Token("WBTC",   "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6"), 
            // new Token("WETH",   "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"), 
            // new Token("BNB",    "0x3BA4c387f786bFEE076A58914F5Bd38d668B42c3"), 
            // new Token("AVAX",   "0x2c89bbc92bd86f8075d1decc58c7f4e0107f286b"), 
            // new Token("BUSD",   "0xdAb529f40E671A1D4bF91361c21bf9f0C9712ab7"), 
            // new Token("MATIC",  "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"),
            // new Token("FTM",    "0xC9c1c1c20B3658F8787CC2FD702267791f224Ce1"), 
            // new Token("DAI",    "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063"),
            // new Token("LINK",   "0xb0897686c545045aFc77CF20eC7A532E3120E0F1"), 
            // new Token("USDT",   "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"),
            // new Token("USDC",   "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"),

            // new Token("UNI", "0xb33EaAd8d922B1083446DC23f610c2567fB5180f"),
            // new Token("ATOM", "0xac51C4c48Dc3116487eD4BC16542e27B5694Da1b"),
            // new Token("AAVE", "0xD6DF932A45C0f255f85145f286eA0b292B21C90B"),
            // new Token("AXS", "0x61BDD9C7d4dF4Bf47A4508c0c8245505F2Af5b7b"),
            // new Token("SAND", "0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683"),
            // new Token("MANA", "0xA1c57f48F0Deb89f569dFbE6E2B7f46D33606fD4"),
            // new Token("1INCH", "0x9c2C5fd7b07E95EE044DDeba0E97a665F142394f"),

            // new Token("CRV", "0x172370d5Cd63279eFa6d502DAB29171933a610AF"),
            // new Token("LDO", "0xC3C7d422809852031b44ab29EEC9F1EfF2A58756"),
            // new Token("SNX", "0x50B728D8D964fd00C2d0AAD81718b71311feF68a"),
        ];

        const resourceIds = [
            // new TokenResourceId("WULX",   "0x00000000000000000000003a4F06431457de873B588846d139EC0d86275d5401"),
            // new TokenResourceId("WBTC",     "0x00000000000000000000008e96f8fcd6815b4e1528d63e5f72e6dcc04bf9be01"),
            // new TokenResourceId("WETH",     "0x0000000000000000000000b15b478246201dac8d92353c34615a7b20bea93801"),
            // new TokenResourceId("BNB",      "0x000000000000000000000093b400831fb4689e41457f43b3f697042fe59f0101"),
            // new TokenResourceId("AVAX",     "0x0000000000000000000000b5be0484fb6118401f5377c32ec3f1e530cc181501"),
            // new TokenResourceId("BUSD",     "0x0000000000000000000000422b105bb127a883f9dc0ee022304fcb5fde5b9c01"),
            // new TokenResourceId("MATIC",    "0x0000000000000000000000cecc5727d1e5e4af94304ef98b559b00183cbeac01"),
            // new TokenResourceId("FTM",      "0x0000000000000000000000df1c1c2f3305bb6e082d382a15eb9c048dc4c58a01"),
            // new TokenResourceId("DAI",      "0x0000000000000000000000312cf2901c89637f34a83f594028fba1517f8cd501"),
            // new TokenResourceId("LINK",     "0x00000000000000000000004df449d10bd2bf419f2fe578dfd15bb361a2d14801"),
            // new TokenResourceId("USDT",     "0x0000000000000000000000b7fe74c0c957534400d2ff0612d3f59af79eba4901"),
            // new TokenResourceId("USDC",     "0x0000000000000000000000026d9a638b8981ed47aa1580f79533cea7c1fc4801"),

            // new TokenResourceId("UNI",    "0x0000000000000000000000fd697c6df70d6164ce11f8477cbff01458fa87cc01"),
            // new TokenResourceId("ATOM",   "0x0000000000000000000000943e6790fa94686f6ffb0996cd92ec5313cb6b8601"),
            // new TokenResourceId("AAVE",   "0x0000000000000000000000dbd8077180eba0711a2336cc54f05a91685f3ff701"),
            // new TokenResourceId("AXS",    "0x000000000000000000000064f9d58a03b7f303b836ce733674f85ac494e61601"),
            // new TokenResourceId("SAND",   "0x0000000000000000000000a620b6b7f2507a184e56200f36c266779bdd8d6901"),
            // new TokenResourceId("MANA",   "0x00000000000000000000009cd5123e6fbaaa72604884f90dc37e91ba3a806b01"),
            // new TokenResourceId("1INCH",  "0x0000000000000000000000c757848bb5a7e2539b4b6f61176879199822a79b01"),

            // new TokenResourceId("CRV",    "0x0000000000000000000000Aa4f71EB8d3B28a535E9bDcc48280D64A10125bE01"),
            // new TokenResourceId("LDO",    "0x00000000000000000000009743FbdAfE350B8D5dF5Bf445918BeF3C0D19ddb01"),
            // new TokenResourceId("SNX",   "0x0000000000000000000000167536058b060E38e07B6defAbcD74d169b8fCAD01"),
        ];

        // for(let i:number = 1; i <= tokenAddresses.length; i++) {
        //     let token = await ethers.getContractAt("ERC20Custom", tokenAddresses[i - 1].tokenAddress, signer);
        //     let role = await token.MINTER_ROLE(); 
        //     // await token.grantMinterRole(erc20HandlerAddress);
        //     // await Helpers.delay(4000);
        //     console.info(`${tokenAddresses[i - 1].tokenName} ${await token.hasRole(role, erc20HandlerAddress)}`);
        // }

        // const handler = await ethers.getContractAt("ERC20Handler", erc20HandlerAddress, signer);
        // for(let i:number = 1; i <= tokenAddresses.length; i++) {
        //     let tokenAddress = await handler._resourceIDToTokenContractAddress(resourceIds[i - 1].resourceId); 
        //     console.info(`${tokenAddresses[i - 1].tokenName} - ${tokenAddress.toLowerCase() == tokenAddresses[i - 1].tokenAddress.toLowerCase()}`);
        // }

        // for(let i:number = 1; i <= tokenAddresses.length; i++) {
        //     let isBurnable = await handler._burnList(tokenAddresses[i - 1].tokenAddress); 
        //     console.info(`Burnable ${tokenAddresses[i - 1].tokenName} - ${isBurnable}`);
        // }

        const iteratorResource = +(await DAO.getSetResourceRequestCount());
        console.info(iteratorResource);   
        const iteratorBurnable = +(await DAO.getSetBurnableRequestCount());     
        console.info(iteratorBurnable);       
        
        // for(let i:number = iteratorResource + 1; i <= iteratorResource + tokenAddresses.length; i++) {
        //     await DAO.newSetResourceRequest(erc20HandlerAddress, resourceIds[i - iteratorResource - 1].resourceId, tokenAddresses[i - iteratorResource - 1].tokenAddress);
        //     await Helpers.delay(4000);
        //     console.info(`${resourceIds[i - iteratorResource - 1].tokenName} - ${resourceIds[i - iteratorResource - 1].resourceId} - ${await DAO.getSetResourceRequestCount()}`)
        // }

        // for(let i:number = iteratorResource; i <= (await DAO.getSetResourceRequestCount()); i++) {
        //     await bridge.adminSetResource(i);    
        //     console.info(`adminSetResource ${i}`)
        //     await Helpers.delay(4000);
        // }

        // for(let i:number = iteratorBurnable + 1; i <= iteratorBurnable + tokenAddresses.length; i++) {
        //     await DAO.newSetBurnableRequest(erc20HandlerAddress, tokenAddresses[i - iteratorBurnable - 1].tokenAddress);
        //     console.info(`${tokenAddresses[i - iteratorBurnable - 1].tokenName} - ${await DAO.getSetBurnableRequestCount()}`)
        //     await Helpers.delay(4000);
        // }

        // for(let i:number = iteratorBurnable; i <= (await DAO.getSetBurnableRequestCount()); i++) {
        //     await bridge.adminSetBurnable(i);
        //     console.info(`adminSetBurnable ${i}`)
        //     await Helpers.delay(4000);
        // }

        return true;
    });

task("set-resource-ids-burnable-fantom", "Setting resource Ids for tokens")      
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
        
        const tokenAddresses = [
            // new Token("WULX",   "0x8867F422Cd9Cf0C66ba71D22bC8edc641e91949d"),
            // new Token("WBTC",   "0x321162Cd933E2Be498Cd2267a90534A804051b11"), 
            // new Token("WETH",   "0x74b23882a30290451A17c44f4F05243b6b58C76d"), 
            // new Token("BNB",    "0x27f26F00e1605903645BbaBC0a73E35027Dccd45"), 
            // new Token("AVAX",   "0x511D35c52a3C244E7b8bd92c0C297755FbD89212"), 
            // new Token("BUSD",   "0xC931f61B1534EB21D8c11B24f3f5Ab2471d4aB50"), 
            // new Token("FTM",    "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"), 
            // new Token("DAI",    "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E"),
            // new Token("LINK",   "0xb3654dc3D10Ea7645f8319668E8F54d2574FBdC8"), 
            // new Token("USDT",   "0x049d68029688eabf473097a2fc38ef61633a3c7a"),
            // new Token("USDC",   "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75"),

            // new Token("AAVE",  "0x6a07A792ab2965C72a5B8088d3a069A7aC3a993B"),
            
            // new Token("CRV",  "0x1E4F97b9f9F913c46F1632781732927B9019C68b"),
            // new Token("SNX",  "0x56ee926bD8c72B2d5fa1aF4d9E4Cbb515a1E3Adc"),
        ];

        const resourceIds = [
            // new TokenResourceId("WULX",      "0x00000000000000000000003a4F06431457de873B588846d139EC0d86275d5401"),
            // new TokenResourceId("WBTC",      "0x00000000000000000000008e96f8fcd6815b4e1528d63e5f72e6dcc04bf9be01"),
            // new TokenResourceId("WETH",      "0x0000000000000000000000b15b478246201dac8d92353c34615a7b20bea93801"),
            // new TokenResourceId("BNB",       "0x000000000000000000000093b400831fb4689e41457f43b3f697042fe59f0101"),
            // new TokenResourceId("AVAX",      "0x0000000000000000000000b5be0484fb6118401f5377c32ec3f1e530cc181501"),
            // new TokenResourceId("BUSD",      "0x0000000000000000000000422b105bb127a883f9dc0ee022304fcb5fde5b9c01"),
            // new TokenResourceId("FTM",       "0x0000000000000000000000df1c1c2f3305bb6e082d382a15eb9c048dc4c58a01"),
            // new TokenResourceId("DAI",       "0x0000000000000000000000312cf2901c89637f34a83f594028fba1517f8cd501"),
            // new TokenResourceId("LINK",      "0x00000000000000000000004df449d10bd2bf419f2fe578dfd15bb361a2d14801"),
            // new TokenResourceId("USDT",      "0x0000000000000000000000b7fe74c0c957534400d2ff0612d3f59af79eba4901"),
            // new TokenResourceId("USDC",      "0x0000000000000000000000026d9a638b8981ed47aa1580f79533cea7c1fc4801"),

            // new TokenResourceId("AAVE",   "0x0000000000000000000000dbd8077180eba0711a2336cc54f05a91685f3ff701"),

            // new TokenResourceId("CRV",    "0x0000000000000000000000Aa4f71EB8d3B28a535E9bDcc48280D64A10125bE01"),

            // new TokenResourceId("SNX",   "0x0000000000000000000000167536058b060E38e07B6defAbcD74d169b8fCAD01"),
        ];

        // for(let i:number = 1; i <= tokenAddresses.length; i++) {
        //     let token = await ethers.getContractAt("ERC20Custom", tokenAddresses[i - 1].tokenAddress, signer);
        //     let role = await token.MINTER_ROLE(); 
        //     // await token.grantMinterRole(erc20HandlerAddress);
        //     // await Helpers.delay(4000);
        //     console.info(`${tokenAddresses[i - 1].tokenName} ${await token.hasRole(role, erc20HandlerAddress)}`);
        // }

        // const handler = await ethers.getContractAt("ERC20Handler", erc20HandlerAddress, signer);
        // for(let i:number = 1; i <= tokenAddresses.length; i++) {
        //     let tokenAddress = await handler._resourceIDToTokenContractAddress(resourceIds[i - 1].resourceId); 
        //     console.info(`${tokenAddresses[i - 1].tokenName} - ${tokenAddress.toLowerCase() == tokenAddresses[i - 1].tokenAddress.toLowerCase()}`);
        // }

        // for(let i:number = 1; i <= tokenAddresses.length; i++) {
        //     let isBurnable = await handler._burnList(tokenAddresses[i - 1].tokenAddress); 
        //     console.info(`Burnable ${tokenAddresses[i - 1].tokenName} - ${isBurnable}`);
        // }
        
        const iteratorResource = +(await DAO.getSetResourceRequestCount());
        console.info(iteratorResource);   
        const iteratorBurnable = +(await DAO.getSetBurnableRequestCount());     
        console.info(iteratorBurnable);       
        
        // for(let i:number = iteratorResource + 1; i <= iteratorResource + tokenAddresses.length; i++) {
        //     await DAO.newSetResourceRequest(erc20HandlerAddress, resourceIds[i - iteratorResource - 1].resourceId, tokenAddresses[i - iteratorResource - 1].tokenAddress);
        //     await Helpers.delay(4000);
        //     console.info(`${resourceIds[i - iteratorResource - 1].tokenName} - ${resourceIds[i - iteratorResource - 1].resourceId} - ${await DAO.getSetResourceRequestCount()}`)
        // }

        // for(let i:number = iteratorResource; i <= (await DAO.getSetResourceRequestCount()); i++) {
        //     await bridge.adminSetResource(i);    
        //     console.info(`adminSetResource ${i}`)
        //     await Helpers.delay(4000);
        // }

        // for(let i:number = iteratorBurnable + 1; i <= iteratorBurnable + tokenAddresses.length; i++) {
        //     await DAO.newSetBurnableRequest(erc20HandlerAddress, tokenAddresses[i - iteratorBurnable - 1].tokenAddress);
        //     console.info(`${tokenAddresses[i - iteratorBurnable - 1].tokenName} - ${await DAO.getSetBurnableRequestCount()}`)
        //     await Helpers.delay(4000);
        // }

        // for(let i:number = iteratorBurnable; i <= (await DAO.getSetBurnableRequestCount()); i++) {
        //     await bridge.adminSetBurnable(i);
        //     console.info(`adminSetBurnable ${i}`)
        //     await Helpers.delay(4000);
        // }

        return true;
    });

task("set-resource-ids-burnable-base", "Setting resource Ids for tokens")      
    .setAction(async (_, { ethers, network }) => {
        if(network.name != "base") {
            console.error("Should be base network!");
            return;
        }
        const signer = (await ethers.getSigners())[0];

        const bridgeAddress = "0x6Ab2A602d1018987Cdcb29aE6fB6E3Ebe44b1412";
        const daoAddress = "0x9DcD76b4A7357249d6160D456670bAcC53292e27";
        const erc20HandlerAddress = "0xFe21Dd0eC80e744A473770827E1aD6393A5A94F0";

        const bridge = await ethers.getContractAt("Bridge", bridgeAddress, signer);
        const DAO = await ethers.getContractAt("DAO", daoAddress, signer);
        
        const tokenAddresses = [
            new Token("ULX",    "0x598E5dBC2f6513E6cb1bA253b255A5b73A2a720b"), 
            new Token("USDT",   "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2"),
            new Token("AK1111", "0x54b659832f59c24ceC0E4A2Cd193377F1BCEfc3c"),
            new Token("USDC",   "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"),
        ];

        const resourceIds = [
            new TokenResourceId("ULX",       "0x00000000000000000000003a4F06431457de873B588846d139EC0d86275d5401"),
            new TokenResourceId("USDT",      "0x0000000000000000000000b7fe74c0c957534400d2ff0612d3f59af79eba4901"),
            new TokenResourceId("AK1111",    "0x000000000000000000000052b502e0c7986A3c705DCf411E768e5cE90c87ec01"),
            new TokenResourceId("USDC",      "0x0000000000000000000000026d9a638b8981ed47aa1580f79533cea7c1fc4801"),
        ];

        // for(let i:number = 1; i <= tokenAddresses.length; i++) {
        //     let token = await ethers.getContractAt("ERC20Custom", tokenAddresses[i - 1].tokenAddress, signer);
        //     let role = await token.MINTER_ROLE(); 
        //     // await token.grantMinterRole(erc20HandlerAddress);
        //     // await Helpers.delay(4000);
        //     console.info(`${tokenAddresses[i - 1].tokenName} ${await token.hasRole(role, erc20HandlerAddress)}`);
        // }

        // const handler = await ethers.getContractAt("ERC20Handler", erc20HandlerAddress, signer);
        // for(let i:number = 1; i <= tokenAddresses.length; i++) {
        //     let tokenAddress = await handler._resourceIDToTokenContractAddress(resourceIds[i - 1].resourceId); 
        //     console.info(`${tokenAddresses[i - 1].tokenName} - ${tokenAddress.toLowerCase() == tokenAddresses[i - 1].tokenAddress.toLowerCase()}`);
        // }

        // for(let i:number = 1; i <= tokenAddresses.length; i++) {
        //     let isBurnable = await handler._burnList(tokenAddresses[i - 1].tokenAddress); 
        //     console.info(`Burnable ${tokenAddresses[i - 1].tokenName} - ${isBurnable}`);
        // }
        
        const iteratorResource = +(await DAO.getSetResourceRequestCount());
        console.info(iteratorResource);   
        const iteratorBurnable = +(await DAO.getSetBurnableRequestCount());     
        console.info(iteratorBurnable);       
        
        // for(let i:number = iteratorResource + 1; i <= iteratorResource + tokenAddresses.length; i++) {
        //     await DAO.newSetResourceRequest(erc20HandlerAddress, resourceIds[i - iteratorResource - 1].resourceId, tokenAddresses[i - iteratorResource - 1].tokenAddress);
        //     await Helpers.delay(4000);
        //     console.info(`${resourceIds[i - iteratorResource - 1].tokenName} - ${resourceIds[i - iteratorResource - 1].resourceId} - ${await DAO.getSetResourceRequestCount()}`)
        // }

        // for(let i:number = 1; i <= (await DAO.getSetResourceRequestCount()); i++) {
        //     await bridge.adminSetResource(i);    
        //     console.info(`adminSetResource ${i}`)
        //     await Helpers.delay(4000);
        // }

        // for(let i:number = iteratorBurnable + 1; i <= iteratorBurnable + tokenAddresses.length; i++) {
        //     await DAO.newSetBurnableRequest(erc20HandlerAddress, tokenAddresses[i - iteratorBurnable - 1].tokenAddress);
        //     console.info(`${tokenAddresses[i - iteratorBurnable - 1].tokenName} - ${await DAO.getSetBurnableRequestCount()}`)
        //     await Helpers.delay(4000);
        // }

        // for(let i:number = iteratorBurnable; i <= (await DAO.getSetBurnableRequestCount()); i++) {
        //     await bridge.adminSetBurnable(i);
        //     console.info(`adminSetBurnable ${i}`)
        //     await Helpers.delay(4000);
        // }

        return true;
    });