import { BigNumberish } from "ethers";
import { subtask, task } from "hardhat/config";
import * as Helpers from "../hardhat-test/helpers";

task("treasury-ultron", "Sets  treasury for ultron")      
    .setAction(async (_, { ethers, network }) => {
        if(network.name != "ultron") {
            console.error("Should be ultron network!");
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
        const erc20Handler = await ethers.getContractAt("ERC20Handler", erc20HandlerAddress, signer);

        const treasuryAddress = "0xf0c623A9cE01Bace0984e2B24E8A4DB2A799D6e6"
        console.log(await erc20Handler.getTreasuryAddress())

        console.info(await DAO.getSetTreasuryRequestCount());      
        await DAO.newSetTreasuryRequest(treasuryAddress);
        await Helpers.delay(4000);

        // let iterator = +(await DAO.getSetTreasuryRequestCount());
        // console.info(iterator);
        // await erc20Handler.setTreasuryAddress(iterator);
    });

task("treasury-ethereum", "Sets  treasury for ethereum")         
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
        const erc20Handler = await ethers.getContractAt("ERC20Handler", erc20HandlerAddress, signer);

        const treasuryAddress = "0xf0c623A9cE01Bace0984e2B24E8A4DB2A799D6e6"
        console.log(await erc20Handler.getTreasuryAddress())

        console.info(await DAO.getSetTreasuryRequestCount());      
        await DAO.newSetTreasuryRequest(treasuryAddress);
        await Helpers.delay(4000);

        // const iterator = +(await DAO.getSetTreasuryRequestCount());
        // console.info(iterator);
        // await erc20Handler.setTreasuryAddress(iterator);
        // await Helpers.delay(4000);
    });

task("treasury-bsc", "Sets  treasury for bsc")      
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
        const erc20Handler = await ethers.getContractAt("ERC20Handler", erc20HandlerAddress, signer);
        
        const treasuryAddress = "0xf0c623A9cE01Bace0984e2B24E8A4DB2A799D6e6"
        console.log(await erc20Handler.getTreasuryAddress())

        console.info(await DAO.getSetTreasuryRequestCount());      
        await DAO.newSetTreasuryRequest(treasuryAddress);
        await Helpers.delay(8000);

        // const iterator = +(await DAO.getSetTreasuryRequestCount());
        // console.info(iterator);
        // await erc20Handler.setTreasuryAddress(iterator);
        // await Helpers.delay(8000);
    });

task("treasury-avalanche", "Sets  treasury for avalanche")     
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
        const erc20Handler = await ethers.getContractAt("ERC20Handler", erc20HandlerAddress, signer);
        
        const treasuryAddress = "0xf0c623A9cE01Bace0984e2B24E8A4DB2A799D6e6"
        console.log(await erc20Handler.getTreasuryAddress())

        console.info(await DAO.getSetTreasuryRequestCount());      
        await DAO.newSetTreasuryRequest(treasuryAddress);
        await Helpers.delay(4000);

        // const iterator = +(await DAO.getSetTreasuryRequestCount());
        // console.info(iterator);
        // await erc20Handler.setTreasuryAddress(iterator);
        // await Helpers.delay(4000);
    });

task("treasury-polygon", "Sets  treasury for polygon")    
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
        const erc20Handler = await ethers.getContractAt("ERC20Handler", erc20HandlerAddress, signer);
        
        const treasuryAddress = "0xf0c623A9cE01Bace0984e2B24E8A4DB2A799D6e6"
        console.log(await erc20Handler.getTreasuryAddress())

        console.info(await DAO.getSetTreasuryRequestCount());      
        await DAO.newSetTreasuryRequest(treasuryAddress);
        await Helpers.delay(4000);

        // const iterator = +(await DAO.getSetTreasuryRequestCount());
        // console.info(iterator);
        // await erc20Handler.setTreasuryAddress(iterator);
        // await Helpers.delay(4000);
    });

task("treasury-fantom", "Sets  treasury for fantom")      
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
        const erc20Handler = await ethers.getContractAt("ERC20Handler", erc20HandlerAddress, signer);
        
        const treasuryAddress = "0xf0c623A9cE01Bace0984e2B24E8A4DB2A799D6e6"
        console.log(await erc20Handler.getTreasuryAddress())

        console.info(await DAO.getSetTreasuryRequestCount());      
        await DAO.newSetTreasuryRequest(treasuryAddress);
        await Helpers.delay(4000);

        // const iterator = +(await DAO.getSetTreasuryRequestCount());
        // console.info(iterator);
        // await erc20Handler.setTreasuryAddress(iterator);
        // await Helpers.delay(4000);
    });

task("treasury-base", "Sets  treasury for base")    
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
        const erc20Handler = await ethers.getContractAt("ERC20Handler", erc20HandlerAddress, signer);
        
        const treasuryAddress = "0xf0c623A9cE01Bace0984e2B24E8A4DB2A799D6e6"
        console.log(await erc20Handler.getTreasuryAddress())

        console.info(await DAO.getSetTreasuryRequestCount());      
        await DAO.newSetTreasuryRequest(treasuryAddress);
        await Helpers.delay(4000);

        // const iterator = +(await DAO.getSetTreasuryRequestCount());
        // console.info(iterator);
        // await erc20Handler.setTreasuryAddress(iterator);
        // await Helpers.delay(4000);
    });