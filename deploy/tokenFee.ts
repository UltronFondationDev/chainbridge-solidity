import { BigNumber, BigNumberish, ethers } from "ethers";

export class Token {
    tokenName: string;
    tokenAddress: string;;

    constructor(tokenName: string, tokenAddress: string) {
      this.tokenName = tokenName;
      this.tokenAddress = tokenAddress;
    }  
}

export class TokenResourceId {
    tokenName: string;
    resourceId: string;;

    constructor(tokenName: string, resourceId: string) {
      this.tokenName = tokenName;
      this.resourceId = resourceId;
    }  
}

export class TokenFee extends Token {
    destinationDomainId: BigNumberish;
    basicFee: BigNumber;
    minAmount: BigNumber;
    maxAmount: BigNumber;
   
    constructor(tokenName: string, tokenAddress: string, destinationDomainId: BigNumberish,  
        basicFee: BigNumber, minAmount: BigNumber,  maxAmount: BigNumber) {
      super(tokenName, tokenAddress);
      this.destinationDomainId = destinationDomainId;
      this.basicFee = basicFee;
      this.minAmount = minAmount;
      this.maxAmount = maxAmount;
    }  
}