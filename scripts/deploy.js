// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const CryptoPuppies = await hre.ethers.getContractFactory("CryptoPuppies");
  const cryptoPuppies = await CryptoPuppies.deploy();

  await cryptoPuppies.deployed();  
  console.log(
    `CryptoPuppies deployed to ${cryptoPuppies.address}`
  );

  /* Step to perform Now
      Step 1: Mint a token in the cryptoPuppies contract and set the tokenId with the id of token you want to fractionalize
      Step 2 : Comment the code of above this comment and uncomment below this
      Step 3 : Replace nftAddress and tokenId with yours
      Step 4 : Now run the deploy script to deploy fraction Puppies contract
  */
  // const tokenId = 1;
  // const nftAddress = '0x89077F193F07447c7249A3De4BA35d86519302f8';
  // const FractionPuppies = await hre.ethers.getContractFactory("FractionPuppies");
  // const fractionPuppies = await FractionPuppies.deploy("FractionPuppies", "FPP", nftAddress, tokenId);

  // await fractionPuppies.deployed();

  // console.log(
  //   `FractionPuppies deployed to ${fractionPuppies.address}`
  // );

}

// FractionPuppies Address : 0x84b7F36b9003A950BfEEd655F1Fd9867F4879f2C (Goerli)
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
