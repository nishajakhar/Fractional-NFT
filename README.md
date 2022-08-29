# FractionPuppies - Fractional NFT

This project demonstrates dividing ownership of an NFT among multiple partial owners called fractionalization of NFT. ERC20 tokens represent such partial ownership of the NFT. We have 2 contracts in this project. One is the NFT contract which holds and mints NFTs. And second one fraction contract build with openzeppelin erc20 contracts.

## Features and Actions :
-----
- Fractionalize: An NFT owner can fractionalize their NFT by transferring the NFT to the contract. In return the NFT owner receives the entire supply of a newly created ERC20 token that they specified at fractionalization. 
- Auction: NFT Owner can put the newly minted ERC20 token on auction with duration and price fixed.


## Deployed Address :
-----
CryptoPuppies Address : 0x89077F193F07447c7249A3De4BA35d86519302f8 (Goerli)
FractionPuppies Address : 0x84b7F36b9003A950BfEEd655F1Fd9867F4879f2C (Goerli)

## Folder Structure
-----
- ``` contracts ```: CryptoPuppies ERC721 Contract, FractionPuppies ERC20 Contract and other inherited contract.
- ``` tests ```: Contract unit tests (executed via hardhat and ethers).
- ``` scripts ```: Deploy script of the contracts


## Requirements :
----
- Node.js >= v14
- NPM
- Hardhat

## Project Installation and Setup
-----
- Clone the repo
    ```git clone <repo>```
- Enter into the cloned directory
    ```cd <directory>```
- Install the dependencies
    ```npm install```

## Running Test
- ```npx hardhat test```

## Deploying contracts
- Create Alchemy account and create a app on goerli. You can use other test network but you have to add that in hardhat.config.js file
- Add the Alchemy Key ID in .env file and Your account's private key
- First you have to deploy CryptoPuppies contract
    ``` npx hardhat run scripts/deploy.js --network goerli```
- Get the Contract address from console
- Mint a NFT on this contract and get the tokenId
- Then comment the CryptoPuppies deploy code.
- Uncomment the FractionPuppies contract
- Replace nftAddress and tokenId
- Run above hardhat deploy command again
- Get the Contract Address from console


## Possible Improvements :
- Buyout Feature: A different buyer can put the request to buy the locked NFT by funding the specified amount of ETH in the contract. The NFT gets transferred to the new buyer's account.
- Claim Feature: ERC20 Token holders of fractionPuppies can claim their eth value based on percentage of token holding
- Redeem Feature:  ERC20 Token holders of fractionPuppies can give back their ERC20 tokens and get their eth back and this way a NFT can be defractionalized again.

