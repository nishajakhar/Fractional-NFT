const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("MyFNFT", function () {

    async function deployFNFTFixture() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const CryptoPuppies = await ethers.getContractFactory("CryptoPuppies");
    const cryptoPuppies = await CryptoPuppies.deploy();

    const address = cryptoPuppies.deployTransaction.creates;

    // const MyFNFT = await ethers.getContractFactory("MyFNFT");
    // const myFNFT = await MyFNFT.deploy(address, 1);

    return { owner, otherAccount, cryptoPuppies };
  }

   describe("Deployment", function () {
    it("Should deploy Cryptokitties", async function () {
      const { cryptoPuppies } = await loadFixture(deployFNFTFixture);

      expect(await cryptoPuppies.name()).to.equal("CryptoPuppies");
    });

    it("Should mint one NFT and update balance of msg.sender", async function () {
      const { cryptoPuppies, owner, otherAccount } = await loadFixture(deployFNFTFixture);
    const ETHER_PRICE = BigInt(50000000000000000);
    await cryptoPuppies.connect(otherAccount).mint({value : ETHER_PRICE});

    expect(await cryptoPuppies.balanceOf(otherAccount.address)).to.equal(1);
    });

    it("Should return error if enough ether not sent", async function () {
       const { cryptoPuppies, owner, otherAccount } = await loadFixture(deployFNFTFixture);
    await expect(cryptoPuppies.connect(otherAccount).mint({value : 50_000_000_000})).to.be.revertedWith('Not enough ether sent');

     });

   });

});