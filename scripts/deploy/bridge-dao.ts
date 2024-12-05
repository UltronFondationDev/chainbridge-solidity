import { ethers } from "hardhat";
import { Bridge, Bridge__factory, ERC20Handler__factory, DAO, DAO__factory, ERC20Handler } from "../../../typechain";
import * as dotenv from 'dotenv';
import * as Helpers from "../../hardhat-test/helpers";
import { BigNumberish } from "ethers";
import hre from 'hardhat';

async function main() {  
  const colorReset = "\u001b[0m";
  const colorGreen = "\u001b[1;32m";
  const colorYellow = "\u001b[1;33m";
  const colorBlue = "\u001b[1;34m";
    
  dotenv.config();

  console.log(`${colorYellow}The Network is being installed...${colorReset}`);

  const networkName = hre.network.name
  const rpc = `https://data-seed-prebsc-1-s1.binance.org:8545`;

  console.log(`Current Network Name: ${colorBlue}${networkName}${colorReset}`);
  console.log(`Current RPC: ${colorBlue}${rpc}${colorReset}`);

  const provider = new ethers.providers.JsonRpcProvider(`${rpc}`);
  console.log(`${colorGreen}The Network is installed successfully.${colorReset}`);

  console.log(`${colorYellow}The User Account is being initialized...${colorReset}`);
  const userPrivateKey: string = process.env.PRIVATE_KEY ?? "";

  const signer = new ethers.Wallet(userPrivateKey, provider);

  const domainId:BigNumberish = 2;
  const initialRealyers:string[] = [`${signer.address}`];
  const initialRelayerThreshold:BigNumberish = initialRealyers.length;
  const feeMaxValue:BigNumberish = 10000;
  const feePercent:BigNumberish = 10;
  const expiry:BigNumberish = 40;
  
  const tokenAddress = "0xb0549050f6337DFF95cDb09352e7DA7a916794F1";
  const destTokenAddress = "0x853D98d7B260832A55F254bBcF51216fD3a13804";
  const destinationId:BigNumberish = 1;
  const basicFee = ethers.utils.parseUnits("0.1", 18);
  const minAmount = ethers.utils.parseUnits("1", 18);
  const maxAmount = ethers.utils.parseUnits("100000", 18);

  const BridgeContract = await (await (new Bridge__factory(signer))
        .deploy(domainId, initialRealyers, initialRelayerThreshold, expiry, feeMaxValue, feePercent)).deployed() as Bridge;
  
  console.log(`The ${colorYellow}Bridge${colorReset} address: ${colorBlue}${BridgeContract.address}${colorReset}`);

  const treasuryAddress = signer.address;
  const ERC20HandlerContract = await (await (new ERC20Handler__factory(signer)).deploy(BridgeContract.address, treasuryAddress)).deployed() as ERC20Handler;
  console.log(`\nThe ${colorYellow}ERC20Handler${colorReset} address: ${colorBlue}${ERC20HandlerContract.address}${colorReset}`);

  const DAOContract = await (await (new DAO__factory(signer)).deploy(BridgeContract.address, ERC20HandlerContract.address)).deployed() as DAO;
  
  console.log(`\nThe ${colorYellow}DAO${colorReset} address: ${colorBlue}${DAOContract.address}${colorReset}`);

  await BridgeContract.setDAOContractInitial(DAOContract.address);
  console.log(`\nSet ${colorYellow}DAO${colorReset} contract ${colorGreen}in Bridge${colorReset}: ${colorBlue}${DAOContract.address}${colorReset}`);
  await ERC20HandlerContract.setDAOContractInitial(DAOContract.address);
  console.log(`\nSet ${colorYellow}DAO${colorReset} contract ${colorGreen}in ERC20Handler${colorReset}: ${colorBlue}${DAOContract.address}${colorReset}`);


  await DAOContract.newChangeFeeRequest(tokenAddress, destinationId, basicFee, minAmount, maxAmount);
  await BridgeContract.adminChangeFee(1);
  console.log(`\nSet New Fee for token ${tokenAddress} on destination chain ${destinationId}`);
  await DAOContract.newChangeFeeRequest(tokenAddress, domainId, basicFee, minAmount, maxAmount);
  await BridgeContract.adminChangeFee(2);
  console.log(`\nSet New Fee for dest token ${tokenAddress} on domain chain ${domainId}`);
  
  // Should copy it from console, when deploys to another chain
  const resourceID = Helpers.createResourceID('0x853D98d7B260832A55F254bBcF51216fD3a13804', 1);
  console.log(`\nThe ${colorYellow}ResourceID${colorReset}: ${colorBlue}${resourceID}${colorReset}`);
  await DAOContract.newSetResourceRequest(ERC20HandlerContract.address, resourceID, tokenAddress);
  await BridgeContract.adminSetResource(1);
  console.log(`\nSet New Resource for token ${tokenAddress}`);
}
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });