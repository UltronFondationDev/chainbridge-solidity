import { BigNumber } from "ethers";
import { ethers, network } from "hardhat";
import Web3 from 'web3';
import * as Helpers from '../../hardhat-test/helpers';

const web3 = new Web3("https://eth-mainnet.alchemyapi.io/v2/i2LgfhBeI-JidguSNlFuToo7kPSkFBPb");

function increaseHexBy(hex: string | null, increaseNumber: number) {
    console.log(`sha3 hex = ${hex}`);
    const number = BigNumber.from(hex);
    const sum = number.add(increaseNumber);
    const result = sum.toHexString();
    return result;
   }

async function main() {
    const daoAddress = "0x9DcD76b4A7357249d6160D456670bAcC53292e27";
    const dao = await ethers.getContractAt("DAO", daoAddress);

    const key: BigNumber = BigNumber.from(1);
    const storageSlot: BigNumber = BigNumber.from(4);
    //const keyValue = (key.add(storageSlot)).toHexString();

    const keyValue = Helpers.toHex(key.add(storageSlot), 31);
        
    console.log(`keyValue = ${keyValue} ${keyValue.length}`);

    const newKey = increaseHexBy(web3.utils.sha3(keyValue), 0); 
    console.log(`newKey = ${newKey}`);

    const res = await web3.eth.getStorageAt(daoAddress, newKey);
    console.log(`res = ${res}`);
}

main()
    .then(_ => console.log('Finished successfully'))
    .catch(console.error)