import { BigNumber } from "ethers";
import { ethers, network } from "hardhat";

const provider = new ethers.providers.JsonRpcProvider("https://ultron-dev.io");

async function getStructSlot(key: BigNumber, storageSlot: BigNumber) {
    // The pre-image used to compute the Storage location
    const newKeyPreimage = ethers.utils.concat([
        // Mappings' keys in Solidity must all be word-aligned (32 bytes)
        ethers.utils.hexZeroPad(key.toHexString(), 32),

        // Similarly with the slot-index into the Solidity variable layout
        ethers.utils.hexZeroPad(storageSlot.toHexString(), 32),
    ]);

    console.log("New Key Preimage:",  ethers.utils.hexlify(newKeyPreimage));
    // "0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000004"

    const newKey =  ethers.utils.keccak256(newKeyPreimage);
    console.log("New Key:", newKey);

    return newKey;
}

async function getVoterStruct(daoAddress: string, storageSlot: BigNumber) {  
    const counter = BigNumber.from(await provider.getStorageAt(daoAddress, 6)).toNumber();

    for(let i:number = 0; i < counter; i++) {
        const key = BigNumber.from(i + 1);

        const newKey = await getStructSlot(key, storageSlot)

        const structSlot0 = BigNumber.from(newKey);
        const statusAndIncludeAndVoterAddress = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot0)); 
        // 0x0201c3db0f3299b9de5df506545b98e5c66043a598f5 where 0x02 - status; 01 - include; c3db0f3299b9de5df506545b98e5c66043a598f5 - voterAddress
        console.log("statusAndIncludeAndVoterAddress:", statusAndIncludeAndVoterAddress.toHexString(), "\n");
    }
}

async function getOwnerChangeStruct(daoAddress: string, storageSlot: BigNumber) {  
    const dao = await ethers.getContractAt("DAO", daoAddress);

    const counter = await dao.getOwnerChangeRequestCount();

    for(let i:number = 0; i < counter; i++) {
        const key = BigNumber.from(i + 1);

        const newKey = await getStructSlot(key, storageSlot)

        const structSlot0 = BigNumber.from(newKey);
        const statusAndOwnerAddress = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot0)); 
        // 0x01cafecafecafecafecafecafecafecafecafecafe where 0x01 - status; cafecafecafecafecafecafecafecafecafecafe - ownerAddress
        console.log("statusAndOwnerAddress:", statusAndOwnerAddress.toHexString(), "\n");
    }
}

async function getTransferStruct(daoAddress: string, storageSlot: BigNumber) {  
    const dao = await ethers.getContractAt("DAO", daoAddress);

    const counter = await dao.getTransferRequestCount();

    for(let i:number = 0; i < counter; i++) {
        const key = BigNumber.from(i + 1);

        const newKey = await getStructSlot(key, storageSlot)

        const structSlot0 = BigNumber.from(newKey);
        const addressesLength = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot0));
        console.log("addressesLength:", addressesLength.toHexString());

        const addressesKey = BigNumber.from(ethers.utils.keccak256(structSlot0.toHexString()));
        for(let i:number = 0; i < addressesLength.toNumber(); i++) {
            const addressSlot = addressesKey.add(i);
            const address = await provider.getStorageAt(daoAddress, addressSlot);
            console.log(`address ${i}: ${address}`)
        }

        const structSlot1 = BigNumber.from(newKey).add(1);
        const amountsLength = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot1));
        console.log("amountsLength:", amountsLength.toHexString());

        const amountsKey = BigNumber.from(ethers.utils.keccak256(structSlot1.toHexString()));
        for(let i:number = 0; i < amountsLength.toNumber(); i++) {
            const amountsSlot = amountsKey.add(i);
            const amount = await provider.getStorageAt(daoAddress, amountsSlot);
            console.log(`amount ${i}: ${amount}`)
        }

        const structSlot2 = BigNumber.from(newKey).add(2);
        const status = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot2)); 
        console.log("status:", status.toHexString(), "\n");
    }
}

async function getPauseStatusStruct(daoAddress: string, storageSlot: BigNumber) {  
    const dao = await ethers.getContractAt("DAO", daoAddress);

    const counter = await dao.getPauseStatusRequestCount();

    for(let i:number = 0; i < counter; i++) {
        const key = BigNumber.from(i + 1);

        const newKey = await getStructSlot(key, storageSlot)

        const structSlot0 = BigNumber.from(newKey);
        const statusAndPauseStatus = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot0)); 
        // 0x0101 where 0x01 - status; 01 - pauseStatus(true)
        console.log("statusAndPauseStatus:", statusAndPauseStatus.toHexString(), "\n");
    }
}

async function getChangeRelayerThresholdStruct(daoAddress: string, storageSlot: BigNumber) {  
    const dao = await ethers.getContractAt("DAO", daoAddress);

    const counter = await dao.getChangeRelayerThresholdRequestCount();

    for(let i:number = 0; i < counter; i++) {
        const key = BigNumber.from(i + 1);

        const newKey = await getStructSlot(key, storageSlot);

        const structSlot0 = BigNumber.from(newKey);
        const treshold = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot0)); 
        console.log("treshold:", treshold.toHexString());

        const structSlot1 = BigNumber.from(newKey).add(1);
        const status = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot1)); 
        console.log("status:", status.toHexString(), "\n");
    }
}

async function getSetResourceStruct(daoAddress: string, storageSlot: BigNumber) {  
    const dao = await ethers.getContractAt("DAO", daoAddress);

    const counter = await dao.getSetResourceRequestCount();

    for(let i:number = 0; i < counter; i++) {
        const key = BigNumber.from(i + 1);

        const newKey = await getStructSlot(key, storageSlot)

        const structSlot0 = BigNumber.from(newKey);
        const handlerAddress = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot0));
        console.log("handlerAddress:", handlerAddress.toHexString());

        const structSlot1 = BigNumber.from(newKey).add(1);
        const resourceId = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot1));
        console.log("resourceId:", resourceId.toHexString());

        const structSlot2 = BigNumber.from(newKey).add(2);
        const statusAndTokenAddress = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot2)); 
        // 0x0163b2de61aea347c6f39c5211cd7c353aba85c09c, where 0x01 - status; 63b2de61aea347c6f39c5211cd7c353aba85c09c - tokenAddress
        console.log("statusAndTokenAddress:", statusAndTokenAddress.toHexString(), "\n");
    }
}

async function getSetGenericResourceStruct(daoAddress: string, storageSlot: BigNumber) {  
    const dao = await ethers.getContractAt("DAO", daoAddress);

    const counter = await dao.getSetResourceRequestCount();

    for(let i:number = 0; i < counter; i++) {
        const key = BigNumber.from(i + 1);

        const newKey = await getStructSlot(key, storageSlot)

        const structSlot0 = BigNumber.from(newKey);
        const handlerAddress = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot0));
        console.log("handlerAddress:", handlerAddress.toHexString());

        const structSlot1 = BigNumber.from(newKey).add(1);
        const resourceId = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot1));
        console.log("resourceId:", resourceId.toHexString());

        const structSlot2 = BigNumber.from(newKey).add(2);
        const contractAddressAndDepositFunctionSig = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot2)); 
        // 0x01c28c23035325af9c8c02f955c40632091d132e26 where 0x01 - deposit functiun sig; c28c23035325af9c8c02f955c40632091d132e26 - contractAddress
        console.log("contractAddressAndDepositFunctionSig:", contractAddressAndDepositFunctionSig.toHexString(), "\n");

        const structSlot3 = BigNumber.from(newKey).add(3);
        const depositFunctionDepositerOffset = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot3)); 
        console.log("depositFunctionDepositerOffset:", depositFunctionDepositerOffset.toHexString());

        const structSlot4 = BigNumber.from(newKey).add(4);
        const executeFunctionSigAndStatus = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot4)); 
        // 0x0100000001 where 0x01 - statu; 0001 - executeFunctionSig
        console.log("executeFunctionSigAndStatus:", executeFunctionSigAndStatus.toHexString());
    }
}

async function getSetBurnableStruct(daoAddress: string, storageSlot: BigNumber) {  
    const dao = await ethers.getContractAt("DAO", daoAddress);

    const counter = await dao.getSetBurnableRequestCount();

    for(let i:number = 0; i < counter; i++) {
        const key = BigNumber.from(i + 1);

        const newKey = await getStructSlot(key, storageSlot);

        const structSlot0 = BigNumber.from(newKey);
        const treshold = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot0)); 
        console.log("handlerAddress:", treshold.toHexString());

        const structSlot1 = BigNumber.from(newKey).add(1);
        const tokenAddressAndStatus = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot1)); 
        // 0x0163b2de61aea347c6f39c5211cd7c353aba85c09c where 0x01 - status; 63b2de61aea347c6f39c5211cd7c353aba85c09c - tpokenAddress
        console.log("tokenAddressAndStatus:", tokenAddressAndStatus.toHexString(), "\n");
    }
}

async function getSetNonceStruct(daoAddress: string, storageSlot: BigNumber) {  
    const dao = await ethers.getContractAt("DAO", daoAddress);

    const counter = await dao.getSetNonceRequestCount();

    for(let i:number = 0; i < counter; i++) {
        const key = BigNumber.from(i + 1);

        const newKey = await getStructSlot(key, storageSlot);

        const structSlot0 = BigNumber.from(newKey);
        const domainIdAndNonceAndStatus = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot0)); 
        // 0x01000000000000270f01 where 0x01 - status; 000000000000270f - nonce; 01 - domainId
        console.log("domainIdAndNonceAndStatus:", domainIdAndNonceAndStatus.toHexString(), "\n");
    }
}

async function getSetForwarderStruct(daoAddress: string, storageSlot: BigNumber) {  
    const dao = await ethers.getContractAt("DAO", daoAddress);

    const counter = await dao.getSetForwarderRequestCount();

    for(let i:number = 0; i < counter; i++) {
        const key = BigNumber.from(i + 1);

        const newKey = await getStructSlot(key, storageSlot);

        const structSlot0 = BigNumber.from(newKey);
        const forwarderAddressAndValidAndStatus = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot0)); 
        // 0x0100012a1b8f33cefc233618716ca50fd670a784bb51 where 0x01 - status; 0001 - valid; 12a1b8f33cefc233618716ca50fd670a784bb51 - forwarderAddress
        // 0x0100cafecafecafecafecafecafecafecafecafecafe where 0x01 - status; 000 - valid; cafecafecafecafecafecafecafecafecafecafe - forwarderAddress
        console.log("forwarderAddressAndValidAndStatus:", forwarderAddressAndValidAndStatus.toHexString(), "\n");
    }
}

async function getChangeFeeStruct(daoAddress: string, storageSlot: BigNumber) {  
    const dao = await ethers.getContractAt("DAO", daoAddress);

    const counter = await dao.getChangeFeeRequestCount();

    for(let i:number = 0; i < counter; i++) {
        const key = BigNumber.from(i + 1);

        const newKey = await getStructSlot(key, storageSlot);

        const structSlot0 = BigNumber.from(newKey);
        const tokenAddressAndChainId = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot0)); 
        // 0x018748ad8c703bb5054c08a9064699be4a96285131 where 0x01 - chainId; 8748ad8c703bb5054c08a9064699be4a96285131 - tokenAddress
        console.log("tokenAddressAndhainId:", tokenAddressAndChainId.toHexString());

        const structSlot1 = BigNumber.from(newKey).add(1);
        const basicFee = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot1)); 
        console.log("basicFee:", basicFee.toHexString());

        const structSlot2 = BigNumber.from(newKey).add(2);
        const minAmount = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot2)); 
        console.log("minAmount:", minAmount.toHexString());

        const structSlot3 = BigNumber.from(newKey).add(3);
        const maxAmount = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot3)); 
        console.log("maxAmount:", maxAmount.toHexString(), "\n");
    }
}

async function getChangeFeePercentStruct(daoAddress: string, storageSlot: BigNumber) {  
    const dao = await ethers.getContractAt("DAO", daoAddress);

    const counter = await dao.getChangeFeePercentRequestCount();

    for(let i:number = 0; i < counter; i++) {
        const key = BigNumber.from(i + 1);

        const newKey = await getStructSlot(key, storageSlot);

        const structSlot0 = BigNumber.from(newKey);
        const feeMaxValueAndFeePercentAndStatus = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot0)); 
        // 0x010000000000000063000000000000000000000000000182b8 where 0x01 - status; 0000000000000063 - feePercent; 000000000000000000000000000182b8 - feeMaxValue
        console.log("feeMaxValueAndFeePercentAndStatus:", feeMaxValueAndFeePercentAndStatus.toHexString(), "\n");
    }
}

async function getWithdrawStruct(daoAddress: string, storageSlot: BigNumber) {  
    const dao = await ethers.getContractAt("DAO", daoAddress);

    const counter = await dao.getWithdrawRequestCount();

    for(let i:number = 0; i < counter; i++) {
        const key = BigNumber.from(i + 1);

        const newKey = await getStructSlot(key, storageSlot)

        const structSlot0 = BigNumber.from(newKey);
        const handlerAddress = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot0));
        console.log("handlerAddress:", handlerAddress.toHexString());

        const structSlot1 = BigNumber.from(newKey).add(1);
        const bytesKey = BigNumber.from(ethers.utils.keccak256(structSlot1.toHexString()));

        const tokenAdderess = BigNumber.from(await provider.getStorageAt(daoAddress, bytesKey));
        console.log("tokenAdderess:", tokenAdderess.toHexString());
        const recepientAddress = BigNumber.from(await provider.getStorageAt(daoAddress, bytesKey.add(1).toHexString()));
        console.log("recepientAddress:", recepientAddress.toHexString());
        const amount = BigNumber.from(await provider.getStorageAt(daoAddress, bytesKey.add(2).toHexString()));
        console.log("amount:", amount.toHexString());

        const structSlot2 = BigNumber.from(newKey).add(2);
        const status = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot2));
        console.log("status:", status.toHexString(), "\n");
    }
}

async function getSetTreasuryStruct(daoAddress: string, storageSlot: BigNumber) {  
    const dao = await ethers.getContractAt("DAO", daoAddress);

    const counter = await dao.getSetTreasuryRequestCount();

    for(let i:number = 0; i < counter; i++) {
        const key = BigNumber.from(i + 1);

        const newKey = await getStructSlot(key, storageSlot)

        const structSlot0 = BigNumber.from(newKey);
        const statusAndTreasuryAddress = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot0)); 
        // 0x01cafecafecafecafecafecafecafecafecafecafe where 0x01 - status; cafecafecafecafecafecafecafecafecafecafe - treasuryAddress
        console.log("statusAndTreasuryAddress:", statusAndTreasuryAddress.toHexString(), "\n");
    }
}

async function getSetNativeTokensForGasStruct(daoAddress: string, storageSlot: BigNumber) {  
    const dao = await ethers.getContractAt("DAO", daoAddress);

    const counter = await dao.getSetNativeTokensForGasRequestCount();

    for(let i:number = 0; i < counter; i++) {
        const key = BigNumber.from(i + 1);

        const newKey = await getStructSlot(key, storageSlot)

        const structSlot0 = BigNumber.from(newKey);
        const amount = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot0)); 
        console.log("amount:", amount.toHexString(), "\n");
    }
}

async function getTransferNativeStruct(daoAddress: string, storageSlot: BigNumber) {  
    const dao = await ethers.getContractAt("DAO", daoAddress);

    const counter = await dao.getTransferNativeRequestCount();

    for(let i:number = 0; i < counter; i++) {
        const key = BigNumber.from(i + 1);

        const newKey = await getStructSlot(key, storageSlot)

        const structSlot0 = BigNumber.from(newKey);
        const recepient = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot0)); 
        console.log("recepient:", recepient.toHexString());
        
        const structSlot1 = BigNumber.from(newKey).add(1);
        const amount = BigNumber.from(await provider.getStorageAt(daoAddress, structSlot1)); 
        console.log("amount:", amount.toHexString(), "\n");
    }
}

async function main() {
    const daoAddress = "0xdd1562d39c96Aa4ed3F360719138De2A030cB9cA";
    const storageSlot: BigNumber = BigNumber.from(10);

    await getTransferStruct(daoAddress, storageSlot);
}

main()
    .then(_ => console.log('Finished successfully'))
    .catch(console.error)