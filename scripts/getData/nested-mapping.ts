import { keccak256 } from "ethereumjs-util";
import { BigNumber } from "ethers";
import { ethers, network } from "hardhat";

const provider = new ethers.providers.JsonRpcProvider("https://ultron-dev.io");
 
async function getVoterData(daoAddress:string, key0: BigNumber, storageSlot:BigNumber, key1:string) {
    const newKeyPreimage = ethers.utils.concat([
        // Mappings' keys in Solidity must all be word-aligned (32 bytes)
        ethers.utils.hexZeroPad(key0.toHexString(), 32),

        // Similarly with the slot-index into the Solidity variable layout
        ethers.utils.hexZeroPad(storageSlot.toHexString(), 32),
    ]);
    console.log("New Key Preimage:",  ethers.utils.hexlify(newKeyPreimage));

    const newKey = ethers.utils.keccak256(newKeyPreimage)

    const newKeyPreimage1 = ethers.utils.concat([
        // Mappings' keys in Solidity must all be word-aligned (32 bytes)
        ethers.utils.hexZeroPad(key1.toString(), 32),

        // Similarly with the slot-index into the Solidity variable layout
        ethers.utils.hexZeroPad(newKey.toString(), 32),
    ]);
    console.log("New Key Preimage1:",  ethers.utils.hexlify(newKeyPreimage1));

    const newKey1 = ethers.utils.keccak256(newKeyPreimage1)

    // keccak256(uint256(9) . keccak256(uint256(4) . uint256(1)))
    const res = await provider.getStorageAt(daoAddress, newKey1);
    console.log(`res = ${res}\n`);
    return res;
}

async function main() {
    const daoAddress = "0xc078626DA5C09DC63A7c5C0c030f431EFfF098b8";
    const dao = await ethers.getContractAt("DAO", daoAddress);

    // mapping(uint256 => mapping(address => bool))
    const storageSlot: BigNumber = BigNumber.from(5);
    //const keyValue = (key.add(storageSlot)).toHexString();

    const votersCount:number = await dao.getActiveVotersCount();

    const requestStorageSlot:BigNumber = BigNumber.from(6); // voterRequestCounnter storage slot
    const requestCounter:number = BigNumber.from(await provider.getStorageAt(daoAddress, requestStorageSlot)).toNumber(); // voterReqestsCounter
    console.log(`requestCounter ${requestCounter}`);

    let voters = [];
    for(let i: number = 0; i < votersCount; i++) {
        const voter = await dao.getVoterById(i);
        console.log(`voter ${voter}`);
        voters.push(voter);
    }
    console.log('\n')

    for(let i: number = 1; i <= requestCounter; i++) {
        let key0 = BigNumber.from(i);
        console.log(`Request ${key0}`);

        const votes = [];
        for(let j: number = 0; j < votersCount; j++) {
            let vote = await getVoterData(daoAddress, key0, storageSlot, voters[j]);
            votes.push(vote);
        }
    }
}

main()
    .then(_ => console.log('Finished successfully'))
    .catch(console.error)