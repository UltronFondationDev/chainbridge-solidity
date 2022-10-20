import { BigNumberish } from "ethers";
import { subtask, task } from "hardhat/config";
import * as Helpers from "../hardhat-test/helpers";
import { Token, TokenFee, TokenResourceId } from "./tokenFee";


require('dotenv').config();


const fs = require('fs');

const filename = process.env.DIRNAME + "/deployed_storage.json";

let deployed_storage: any = {};
try {
  deployed_storage = JSON.parse(fs.readFileSync(filename).toString().trim());
} catch (err) {
}


task("deploy", "deploy everything")
    .setAction(async (_, { run, ethers, network }) => {
        const bridge = await run("bridge", network);
        const erc20Handler = await run("ERC20Handler", { bridge: bridge });
        const daoContract = await run("dao", { bridge: bridge, erc20Handler: erc20Handler });

        const setInitialContracts = await run("setInitialContracts", {
            bridge: bridge, erc20Handler: erc20Handler, dao: daoContract
        });

        console.log("=".repeat(50));
        Helpers.logDeploy("bridge", "Impl", bridge);
        Helpers.logDeploy("DAOContract", "Impl", daoContract);
        Helpers.logDeploy("ERC20Handler", "Impl", erc20Handler);
        console.log("Set initial contracts: " + setInitialContracts);
        deployed_storage["bridge"] = bridge;
        deployed_storage["DAOContract"] = daoContract;
        deployed_storage["ERC20Handler"] = erc20Handler;
        if(network.name == "ganache_ultron") {
            await run("deploy-tokens", { erc20Handler: erc20Handler });
        }
         fs.writeFileSync(filename, JSON.stringify(deployed_storage));

    });


/*========== Bridge ==========*/
subtask("bridge", "The contract Bridge is deployed")
    .setAction(async (_, { ethers, network }) => {
        const signer = (await ethers.getSigners())[0];

        let domainId:BigNumberish = 0;
        if(network.name === "ganache_ultron") {
            domainId = 1;
        }
        if(network.name === "ganache_ethereum") {
            domainId = 2;
        }
        if(network.name === "ganache_bsc") {
            domainId = 3;
        }
        if(network.name === "ganache_avalanche") {
            domainId = 4;
        }
        if(network.name === "ganache_polygon") {
            domainId = 5;
        }
        if(network.name === "ganache_fantom") {
            domainId = 6;
        }

        const initialRealyers:string[] = [
            `${signer.address}`,
        ];

        const initialRelayerThreshold:BigNumberish = 2;

        const expiry:BigNumberish = 40;
        const feeMaxValue:BigNumberish = 10000;
        const feePercent:BigNumberish = 10;

        if(domainId !== 0) {
            const bridgeFactory = await ethers.getContractFactory("Bridge", signer);
            const bridge = await (await bridgeFactory.deploy(domainId, initialRealyers, initialRelayerThreshold, expiry, feeMaxValue, feePercent)).deployed();
            console.log(`The Bridge: \u001b[1;34m${bridge.address}\u001b[0m`);    
            return bridge.address;
        }
        else {
            console.info(`Should add ${network.name}!`)
        }
    });

/*========== ERC20Handler ==========*/
subtask("ERC20Handler", "The contract ERC20Handler is deployed")
    .addParam("bridge", "bridge address")
    .setAction(async (taskArgs, { ethers }) => {
        const signer = (await ethers.getSigners())[0];

        const treasuryAddress = signer.address;
        
        const ERC20HandlerFactory = await ethers.getContractFactory("ERC20Handler", signer);
        const ERC20Handler = await (await ERC20HandlerFactory.deploy(taskArgs.bridge, treasuryAddress)).deployed();
        console.log(`The ERC20Handler: \u001b[1;34m${ERC20Handler.address}\u001b[0m`);
        
        return ERC20Handler.address;
    });

/*========== DAO ==========*/
subtask("dao", "The contract DAO is deployed")   
    .addParam("bridge", "bridge address")
    .addParam("erc20Handler", "ERC20Handler address")
    .setAction(async (taskArgs, { ethers }) => {
        const signer = (await ethers.getSigners())[0];

        const DAOFactory = await ethers.getContractFactory("DAO", signer);
        const DAO = await (await DAOFactory.deploy(taskArgs.bridge, taskArgs.erc20Handler)).deployed();
        console.log(`The DAO: \u001b[1;34m${DAO.address}\u001b[0m`);

        return DAO.address;
    });

/*========== Set DAO Contracts ==========*/
subtask("setInitialContracts", "Set Initial Contracts successfully")     
    .addParam("bridge", "bridge address")
    .addParam("erc20Handler", "ERC20Handler address")
    .addParam("dao", "DAO address")
    .setAction(async (taskArgs, { ethers }) => {
        const signer = (await ethers.getSigners())[0];

        const bridge = await ethers.getContractAt("Bridge", taskArgs.bridge, signer);
        const ERC20Handler = await ethers.getContractAt("ERC20Handler", taskArgs.erc20Handler, signer);
        
        await bridge.setDAOContractInitial(taskArgs.dao);
        console.info(await bridge.getContractDAO());
        
        await ERC20Handler.setDAOContractInitial(taskArgs.dao);
        
        console.info(await ERC20Handler.getDAOAddress());

        return true;
    });

/*========== Deploy Tokens ==========*/
subtask("deploy-tokens", "Deploying default tokens for our chain")
    .addParam("erc20Handler", "erc20Handler address")     
    .setAction(async (taskArgs, { ethers }) => {
        const signer = (await ethers.getSigners())[0];
        const erc20CustomFactory = await ethers.getContractFactory("ERC20Custom", signer);
        const erc20StableFactory = await ethers.getContractFactory("ERC20Stable", signer);

        const wBTC = await (await erc20CustomFactory.deploy("Wrapped Bitcoin", "wBTC")).deployed();
        await wBTC.grantMinterRole(taskArgs.erc20Handler);
        console.log(`The WBTC: \u001b[1;34m${wBTC.address}\u001b[0m`);
        await wBTC.mint(signer.address, "1000000000000000000000000");
        deployed_storage['tokens']['wBTC'] = wBTC.address;

        const wETH = await (await erc20CustomFactory.deploy("Wrapped Ethereum", "wETH")).deployed();
        await wETH.grantMinterRole(taskArgs.erc20Handler);
        console.log(`The WETH: \u001b[1;34m${wETH.address}\u001b[0m`);
        await wETH.mint(signer.address, "1000000000000000000000000");
        deployed_storage['tokens']['wETH'] = wETH.address;

        const bnb = await (await erc20CustomFactory.deploy("BNB", "BNB")).deployed();
        await bnb.grantMinterRole(taskArgs.erc20Handler);
        console.log(`The BNB: \u001b[1;34m${bnb.address}\u001b[0m`);
        await bnb.mint(signer.address, "1000000000000000000000000");
        deployed_storage['tokens']['BNB'] = bnb.address;

        const avax = await (await erc20CustomFactory.deploy("Avalanche", "AVAX")).deployed();
        await avax.grantMinterRole(taskArgs.erc20Handler);
        console.log(`The AVAX: \u001b[1;34m${avax.address}\u001b[0m`);
        await avax.mint(signer.address, "1000000000000000000000000");
        deployed_storage['tokens']['AVAX'] = avax.address;

        const bUSD = await (await erc20CustomFactory.deploy("Binance USD", "BUSD")).deployed();
        await bUSD.grantMinterRole(taskArgs.erc20Handler);
        console.log(`The BUSD: \u001b[1;34m${bUSD.address}\u001b[0m`);
        await bUSD.mint(signer.address, "1000000000000000000000000");
        deployed_storage['tokens']['BUSD'] = bUSD.address;

        const shib = await (await erc20CustomFactory.deploy("Shiba Inu", "SHIB")).deployed();
        await shib.grantMinterRole(taskArgs.erc20Handler);
        console.log(`The SHIB: \u001b[1;34m${shib.address}\u001b[0m`);
        await shib.mint(signer.address, "1000000000000000000000000");
        deployed_storage['tokens']['SHIB'] = shib.address;

        const matic = await (await erc20CustomFactory.deploy("Polygon", "MATIC")).deployed();
        await matic.grantMinterRole(taskArgs.erc20Handler);
        console.log(`The MATIC: \u001b[1;34m${matic.address}\u001b[0m`);
        await matic.mint(signer.address, "1000000000000000000000000");
        deployed_storage['tokens']['MATIC'] = matic.address;

        const ftm = await (await erc20CustomFactory.deploy("Fantom", "FTM")).deployed();
        await ftm.grantMinterRole(taskArgs.erc20Handler);
        console.log(`The FTM: \u001b[1;34m${ftm.address}\u001b[0m`);
        await ftm.mint(signer.address, "1000000000000000000000000");
        deployed_storage['tokens']['FTM'] = ftm.address;

        const dai = await (await erc20CustomFactory.deploy("Dai", "DAI")).deployed();
        await dai.grantMinterRole(taskArgs.erc20Handler);
        console.log(`The DAI: \u001b[1;34m${dai.address}\u001b[0m`);
        await dai.mint(signer.address, "1000000000000000000000000");
        deployed_storage['tokens']['DAI'] = dai.address;

        const link = await (await erc20CustomFactory.deploy("Chainlink", "LINK")).deployed();
        await link.grantMinterRole(taskArgs.erc20Handler);
        console.log(`The LINK: \u001b[1;34m${link.address}\u001b[0m`);
        await link.mint(signer.address, "1000000000000000000000000");
        deployed_storage['tokens']['LINK'] = link.address;

        const uUSDT = await (await erc20StableFactory.deploy("Ultron Tether", "uUSDT")).deployed();
        await uUSDT.grantMinterRole(taskArgs.erc20Handler);
        console.log(`The uUSDT: \u001b[1;34m${uUSDT.address}\u001b[0m`);
        await uUSDT.mint(signer.address, "1000000000000000000000000");
        deployed_storage['tokens']['uUSDT'] = uUSDT.address;

        const uUSDC = await (await erc20StableFactory.deploy("Ultron USD Coin", "uUSDC")).deployed();
        await uUSDC.grantMinterRole(taskArgs.erc20Handler);
        console.log(`The uUSDC: \u001b[1;34m${uUSDC.address}\u001b[0m`);
        await uUSDC.mint(signer.address, "1000000000000000000000000");
        deployed_storage['tokens']['uUSDC'] = uUSDC.address;
        return deployed_storage;
    });

/*========== Deploy ULX ==========*/
task("deploy-ulx", "Deploying ULX for different chains")     
    .setAction(async (taskArgs, { ethers, network }) => {
        let erc20HandlerAddress;
        if(network.name === "ultron") {
            return;
        }     
        else if(network.name === "ethereum") {
            erc20HandlerAddress = '0xFe21Dd0eC80e744A473770827E1aD6393A5A94F0';
        }
        else if(network.name === "bsc") {
            erc20HandlerAddress = '0xFe21Dd0eC80e744A473770827E1aD6393A5A94F0';
        }
        else if(network.name === "avalanche") {
            erc20HandlerAddress = '0xFe21Dd0eC80e744A473770827E1aD6393A5A94F0';
        }
        else if(network.name === "polygon") {
            erc20HandlerAddress = '0xFe21Dd0eC80e744A473770827E1aD6393A5A94F0';
        }
        else if(network.name === "fantom") {
            erc20HandlerAddress = '0x598E5dBC2f6513E6cb1bA253b255A5b73A2a720b';
        }       
        
        const signer = (await ethers.getSigners())[0];

        const erc20CustomFactory = await ethers.getContractFactory("ERC20Custom", signer);

        const ulx = await (await erc20CustomFactory.deploy("Ultron", "ULX")).deployed();
        await ulx.grantMinterRole(erc20HandlerAddress);
        console.log(`The ULX: \u001b[1;34m${ulx.address}\u001b[0m`);

        return [ulx.address];
    });