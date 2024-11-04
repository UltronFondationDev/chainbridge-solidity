import { BigNumberish } from "ethers";
import { subtask, task } from "hardhat/config";
import * as Helpers from "../hardhat-test/helpers";
import { Token, TokenFee, TokenResourceId } from "./tokenFee";

task("deploy", "deploy everything")
    .setAction(async (_, { run, ethers, network }) => {
        const bridge = await run("bridge");
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
        // if(network.name == "ultron") {
        //     const deployTokens = await run("deploy-tokens", { erc20Handler: erc20Handler });
        //     console.log("Deployed tokens: " + deployTokens);
        // }
    });


/*========== Bridge ==========*/
subtask("bridge", "contract Bridge is deployed")
    .setAction(async (_, { ethers, network }) => {
        const signer = (await ethers.getSigners())[0];

        let domainId:BigNumberish = 0;
        if(network.name === "ultron") {
            domainId = 1;
        }
        else if(network.name === "ethereum") {
            domainId = 2;
        }
        else if(network.name === "bsc") {
            domainId = 3;
        }
        else if(network.name === "avalanche") {
            domainId = 4;
        }
        else if(network.name === "polygon") {
            domainId = 5;
        }
        else if(network.name === "fantom") {
            domainId = 6;
        } 
        else if(network.name === "base") {
            domainId = 7;
        }

        const initialRealyers:string[] = [
            `${signer.address}`, 
            "0x8599FdA43D7CE910352ffe9a3E5F34E0b6d3867E",
            "0xd0C34eaC64B8053Bd5Aef1a16deEdbBf83E638a7",
            "0xe5640686419D526c1d0813ace59fd7751F584232",
        ];

        const initialRelayerThreshold:BigNumberish = 2;

        const expiry:BigNumberish = 400;
        const feeMaxValue:BigNumberish = 10000;
        const feePercent:BigNumberish = 10;

        if(domainId !== 0) {
            const bridgeFactory = await ethers.getContractFactory("Bridge", signer);
            const bridge = await (await bridgeFactory.deploy(domainId, initialRealyers, initialRelayerThreshold, expiry, feeMaxValue, feePercent)).deployed();
            console.log(`Bridge: \u001b[1;34m${bridge.address}\u001b[0m`);    
            return bridge.address;
        }
        else {
            console.info(`Should add ${network.name}!`)
        }
    });

/*========== ERC20Handler ==========*/
subtask("ERC20Handler", "contract ERC20Handler is deployed")
    .addParam("bridge", "bridge address")
    .setAction(async (taskArgs, { ethers }) => {
        const signer = (await ethers.getSigners())[0];

        const treasuryAddress = "0x976B649bacA4CB2af970e091B45d862965520276";
        
        const ERC20HandlerFactory = await ethers.getContractFactory("ERC20Handler", signer);
        const ERC20Handler = await (await ERC20HandlerFactory.deploy(taskArgs.bridge, treasuryAddress)).deployed();
        console.log(`ERC20Handler: \u001b[1;34m${ERC20Handler.address}\u001b[0m`);
        
        return ERC20Handler.address;
    });

/*========== DAO ==========*/
subtask("dao", "contract DAO is deployed")   
    .addParam("bridge", "bridge address")
    .addParam("erc20Handler", "ERC20Handler address")
    .setAction(async (taskArgs, { ethers }) => {
        const signer = (await ethers.getSigners())[0];

        const DAOFactory = await ethers.getContractFactory("DAO", signer);
        const DAO = await (await DAOFactory.deploy(taskArgs.bridge, taskArgs.erc20Handler)).deployed();
        console.log(`DAO: \u001b[1;34m${DAO.address}\u001b[0m`);

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
        await Helpers.delay(4000);
        console.info(await bridge.getContractDAO());
        
        await ERC20Handler.setDAOContractInitial(taskArgs.dao);
        await Helpers.delay(4000);
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
        const minterRole = await wBTC.MINTER_ROLE();
        await wBTC.grantRole(minterRole, taskArgs.erc20Handler);
        console.log(`WBTC: \u001b[1;34m${wBTC.address}\u001b[0m`);

        const wETH = await (await erc20CustomFactory.deploy("Wrapped Ethereum", "wETH")).deployed();
        await wETH.grantRole(minterRole, taskArgs.erc20Handler);
        console.log(`WETH: \u001b[1;34m${wETH.address}\u001b[0m`);

        const bnb = await (await erc20CustomFactory.deploy("BNB", "BNB")).deployed();
        await bnb.grantRole(minterRole, taskArgs.erc20Handler);
        console.log(`BNB: \u001b[1;34m${bnb.address}\u001b[0m`);

        const avax = await (await erc20CustomFactory.deploy("Avalanche", "AVAX")).deployed();
        await avax.grantRole(minterRole, taskArgs.erc20Handler);
        console.log(`AVAX: \u001b[1;34m${avax.address}\u001b[0m`);

        const bUSD = await (await erc20CustomFactory.deploy("Binance USD", "BUSD")).deployed();
        await bUSD.grantRole(minterRole, taskArgs.erc20Handler);
        console.log(`BUSD: \u001b[1;34m${bUSD.address}\u001b[0m`);

        const shib = await (await erc20CustomFactory.deploy("Shiba Inu", "SHIB")).deployed();
        await shib.grantRole(minterRole, taskArgs.erc20Handler);
        console.log(`SHIB: \u001b[1;34m${shib.address}\u001b[0m`);

        const matic = await (await erc20CustomFactory.deploy("Polygon", "MATIC")).deployed();
        await matic.grantRole(minterRole, taskArgs.erc20Handler);
        console.log(`MATIC: \u001b[1;34m${matic.address}\u001b[0m`);

        const ftm = await (await erc20CustomFactory.deploy("Fantom", "FTM")).deployed();
        await ftm.grantRole(minterRole, taskArgs.erc20Handle);
        console.log(`FTM: \u001b[1;34m${ftm.address}\u001b[0m`);

        const dai = await (await erc20CustomFactory.deploy("Dai", "DAI")).deployed();
        await dai.grantRole(minterRole, taskArgs.erc20Handler);
        console.log(`DAI: \u001b[1;34m${dai.address}\u001b[0m`);

        const link = await (await erc20CustomFactory.deploy("Chainlink", "LINK")).deployed();
        await link.grantRole(minterRole, taskArgs.erc20Handler);
        console.log(`LINK: \u001b[1;34m${link.address}\u001b[0m`);    

        const uUSDT = await (await erc20StableFactory.deploy("Ultron Tether", "uUSDT")).deployed();
        await uUSDT.grantRole(minterRole, taskArgs.erc20Handler);
        console.log(`uUSDT: \u001b[1;34m${uUSDT.address}\u001b[0m`);

        const uUSDC = await (await erc20StableFactory.deploy("Ultron USD Coin", "uUSDC")).deployed();
        await uUSDC.grantRole(minterRole, taskArgs.erc20Handler);
        console.log(`uUSDC: \u001b[1;34m${uUSDC.address}\u001b[0m`);

        const bep_uUSDT = await (await erc20CustomFactory.deploy("Ultron BEP-Tether", "Bep-uUSDT")).deployed();
        await bep_uUSDT.grantRole(minterRole, taskArgs.erc20Handler);
        console.log(`bep_uUSDT: \u001b[1;34m${bep_uUSDT.address}\u001b[0m`);

        const bep_uUSDC = await (await erc20CustomFactory.deploy("Ultron BEP-USD Coin", "Bep-uUSDC")).deployed();
        await bep_uUSDC.grantRole(minterRole, taskArgs.erc20Handler);
        console.log(`bep_uUSDC: \u001b[1;34m${bep_uUSDC.address}\u001b[0m`);

        return [wBTC.address, wETH.address, bnb.address, avax.address, bUSD.address, shib.address, matic.address, 
            ftm.address, dai.address, link.address, uUSDT.address, uUSDC.address, bep_uUSDT.address, bep_uUSDC.address];
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
        else if(network.name === "base") {
            erc20HandlerAddress = '0xFe21Dd0eC80e744A473770827E1aD6393A5A94F0';
        }       
        
        const signer = (await ethers.getSigners())[0];

        let erc20CustomFactory = await ethers.getContractFactory("ERC20CustomPermit", signer);

        const ulx = await (await erc20CustomFactory.deploy("Ultron", "ULX")).deployed();
        const minterRole = await ulx.MINTER_ROLE();
        await ulx.grantRole(minterRole, erc20HandlerAddress);
        console.log(`ULX: \u001b[1;34m${ulx.address}\u001b[0m`);

        return [ulx.address];
    });

/*========== Deploy Sub-Tokens ==========*/
task("deploy-sub-tokens", "Deploying sub tokens for our chain")
    .addParam("erc20Handler", "erc20Handler address", "0xc078626DA5C09DC63A7c5C0c030f431EFfF098b8")     
    .setAction(async (taskArgs, { ethers }) => {
        const signer = (await ethers.getSigners())[0];

        const erc20CustomFactory = await ethers.getContractFactory("ERC20CustomPermit", signer);
        const erc20BtcFactory = await ethers.getContractFactory("ERC20BtcPermit", signer);

        const usdt = await ethers.getContractAt("ERC20Stable", "0x97FDd294024f50c388e39e73F1705a35cfE87656", signer)
        const minterRole = await usdt.MINTER_ROLE();
        const adminRole = await usdt.DEFAULT_ADMIN_ROLE();
        // console.log(await usdt.getRoleMemberCount(adminRole))
        // console.log(await usdt.getRoleMember(adminRole, 0))
        // console.log(await usdt.getRoleMember(adminRole, 1))

        // const doge = await (await erc20BtcFactory.deploy("Dogecoin", "DOGE")).deployed();
        // const minterRole = await doge.MINTER_ROLE();
        // await doge.grantRole(minterRole, taskArgs.erc20Handler);
        // console.log(`DOGE: \u001b[1;34m${doge.address}\u001b[0m`);

        // const xrp = await (await erc20CustomFactory.deploy("Ripple", "XRP")).deployed();
        // await xrp.grantRole(minterRole, taskArgs.erc20Handler);
        // console.log(`XRP: \u001b[1;34m${xrp.address}\u001b[0m`);

        // const ada = await (await erc20CustomFactory.deploy("Cardano", "ADA")).deployed();
        // await ada.grantRole(minterRole, taskArgs.erc20Handler);
        // console.log(`ADA: \u001b[1;34m${ada.address}\u001b[0m`);

        // const dot = await (await erc20CustomFactory.deploy("Polkadot", "DOT")).deployed();
        // await dot.grantRole(minterRole, taskArgs.erc20Handler);
        // console.log(`DOT: \u001b[1;34m${dot.address}\u001b[0m`);

        // const uni = await (await erc20CustomFactory.deploy("Uniswap", "UNI")).deployed();
        // await uni.grantRole(minterRole, taskArgs.erc20Handler);
        // console.log(`UNI: \u001b[1;34m${uni.address}\u001b[0m`);

        // const atom = await (await erc20CustomFactory.deploy("Cosmos", "ATOM")).deployed();
        // await atom.grantRole(minterRole, taskArgs.erc20Handler);
        // console.log(`ATOM: \u001b[1;34m${atom.address}\u001b[0m`);

        // const aave = await (await erc20CustomFactory.deploy("Aave", "AAVE")).deployed();
        // await aave.grantRole(minterRole, taskArgs.erc20Handler);
        // console.log(`AAVE: \u001b[1;34m${aave.address}\u001b[0m`);

        // const axs = await (await erc20CustomFactory.deploy("Axie Infinity Shard", "AXS")).deployed();
        // await axs.grantRole(minterRole, taskArgs.erc20Handler);
        // console.log(`AXS: \u001b[1;34m${axs.address}\u001b[0m`);

        // const sand = await (await erc20CustomFactory.deploy("Sandbox", "SAND")).deployed();
        // await sand.grantRole(minterRole, taskArgs.erc20Handler);
        // console.log(`SAND: \u001b[1;34m${sand.address}\u001b[0m`);

        // const mana = await (await erc20CustomFactory.deploy("Decentraland", "MANA")).deployed();
        // await mana.grantRole(minterRole, taskArgs.erc20Handler);
        // console.log(`MANA: \u001b[1;34m${mana.address}\u001b[0m`);

        // const cake = await (await erc20CustomFactory.deploy("PancakeSwap", "CAKE")).deployed();
        // await cake.grantRole(minterRole, taskArgs.erc20Handler);
        // console.log(`CAKE: \u001b[1;34m${cake.address}\u001b[0m`);

        // const near = await (await erc20CustomFactory.deploy("NEAR Protocol", "NEAR")).deployed();
        // await near.grantRole(minterRole, taskArgs.erc20Handler);
        // console.log(`NEAR: \u001b[1;34m${near.address}\u001b[0m`);

        // const inch = await (await erc20CustomFactory.deploy("1INCH", "1INCH")).deployed();
        // await inch.grantRole(minterRole, taskArgs.erc20Handler);
        // console.log(`1INCH: \u001b[1;34m${inch.address}\u001b[0m`);

        // const flux = await (await erc20BtcFactory.deploy("FLUX", "FLUX")).deployed();
        // await flux.grantRole(minterRole, taskArgs.erc20Handler);
        // console.log(`FLUX: \u001b[1;34m${flux.address}\u001b[0m`);

        // const trx = await (await erc20CustomFactory.deploy("TRON", "TRX")).deployed();
        // await trx.grantRole(minterRole, taskArgs.erc20Handler);
        // console.log(`TRX: \u001b[1;34m${trx.address}\u001b[0m`);

        // const crv = await (await erc20CustomFactory.deploy("Curve DAO", "CRV")).deployed();
        // await crv.grantRole(minterRole, taskArgs.erc20Handler);
        // console.log(`CRV: \u001b[1;34m${crv.address}\u001b[0m`);

        // const ape = await (await erc20CustomFactory.deploy("ApeCoin", "APE")).deployed();
        // await ape.grantRole(minterRole, taskArgs.erc20Handler);
        // console.log(`APE: \u001b[1;34m${ape.address}\u001b[0m`);

        // const ldo = await (await erc20CustomFactory.deploy("Lido DAO", "LDO")).deployed();
        // await ldo.grantRole(minterRole, taskArgs.erc20Handler);
        // console.log(`LDO: \u001b[1;34m${ldo.address}\u001b[0m`);

        // const vet = await (await erc20CustomFactory.deploy("VeChain", "VET")).deployed();
        // await vet.grantRole(minterRole, taskArgs.erc20Handler);
        // console.log(`VET: \u001b[1;34m${vet.address}\u001b[0m`);

        // const egld = await (await erc20CustomFactory.deploy("MultiversX", "EGLD")).deployed();
        // await egld.grantRole(minterRole, taskArgs.erc20Handler);
        // console.log(`EGLD: \u001b[1;34m${egld.address}\u001b[0m`);
        
        // const snx = await (await erc20CustomFactory.deploy("Synthetix", "SNX")).deployed();
        // await snx.grantRole(minterRole, taskArgs.erc20Handler);
        // console.log(`SNX: \u001b[1;34m${snx.address}\u001b[0m`);

        // const pepe = await (await erc20CustomFactory.deploy("Pepe", "PEPE")).deployed();
        // await pepe.grantRole(minterRole, taskArgs.erc20Handler);
        // console.log(`PEPE: \u001b[1;34m${pepe.address}\u001b[0m`);

        // const akasha = await (await erc20CustomFactory.deploy("Akashalife", "AK1111")).deployed();
        // await akasha.grantRole(minterRole, taskArgs.erc20Handler);
        // console.log(`AK1111: \u001b[1;34m${akasha.address}\u001b[0m`);
    });
