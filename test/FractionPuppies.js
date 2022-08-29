const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("CryptoPuppies", function () {
    // Contracts are deployed using the first signer/account by default

    async function deployCryptoPuppiesFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const CryptoPuppies = await ethers.getContractFactory("CryptoPuppies");
    const cryptoPuppies = await CryptoPuppies.deploy();

    return { cryptoPuppies , owner, otherAccount};
  }


    describe("Deployment", function () {
        it("Should deploy Cryptokitties NFT Contract and return the Token Name", async function () {
        const { cryptoPuppies } = await loadFixture(deployCryptoPuppiesFixture);
        expect(await cryptoPuppies.name()).to.equal("CryptoPuppies");
        });

        it("Should mint one NFT and update balance of msg.sender", async function () {
            const { cryptoPuppies, otherAccount } = await loadFixture(deployCryptoPuppiesFixture);
            const NFT_PRICE = BigInt(50000000000000000);
            await cryptoPuppies.connect(otherAccount).mint({value : NFT_PRICE});
            expect(await cryptoPuppies.balanceOf(otherAccount.address)).to.equal(1);
        });

        it("Should return error if enough ether not sent", async function () {
            const { cryptoPuppies, otherAccount } = await loadFixture(deployCryptoPuppiesFixture);
            await expect(cryptoPuppies.connect(otherAccount).mint({value : 50_000_000_000})).to.be.revertedWith('Not enough ether sent');
        });
   });
});

describe("FractionPuppies", function () {
    // Contracts are deployed using the first signer/account by default

    async function deployFixture() {
        const [owner, otherAccount] = await ethers.getSigners();

        const CryptoPuppies = await ethers.getContractFactory("CryptoPuppies");
        const cryptoPuppies = await CryptoPuppies.deploy();

        const cryptoPuppiesAddress = cryptoPuppies.deployTransaction.creates;

        const NFT_PRICE = BigInt(50000000000000000);
        
        await cryptoPuppies.mint({value : NFT_PRICE});
        const tokenId = 1;
        const FractionPuppies = await ethers.getContractFactory("FractionPuppies");
        const fractionPuppies = await FractionPuppies.deploy("FractionPuppies", "FPP", cryptoPuppiesAddress, tokenId);
        const fractionPuppiesAddress = fractionPuppies.deployTransaction.creates;

        return { cryptoPuppies, cryptoPuppiesAddress, fractionPuppies, fractionPuppiesAddress, tokenId , owner, otherAccount};
    }

  

    describe("Deployment", function () {
        it("Should deploy FractionPuppies Contract and return the Token Name", async function () {
            const { fractionPuppies, cryptoPuppiesAddress, fractionPuppiesAddress } = await loadFixture(deployFixture);
            expect(await fractionPuppies.name()).to.equal("FractionPuppies");
        });

        it("Should set CryptoPuppies Contract Address and NFT Id", async function () {
            const { cryptoPuppiesAddress, fractionPuppies, tokenId } = await loadFixture(deployFixture);
            expect(await fractionPuppies.nftContractAddress()).to.equal(cryptoPuppiesAddress);
            expect(await fractionPuppies.nftId()).to.equal(tokenId);
        });
    });
    describe("Initialize", function () {
        const AMOUNT =  BigInt(5000000000000000000); // 5 ERC20 Tokens with 18 decimals value
        const PRICE_IN_WEI = BigInt(1000000000000000000); // 1 Ether for 1 ERC20 Token
        const AUCTION_DURATION_IN_HOURS = 5; // Auction will last for 5 Hours
    
        it("Should throw error if initialize called without approve", async function () {
            const { fractionPuppies } = await loadFixture(deployFixture);
            const amount =  BigInt(5000000000000000000); // 5 ERC20 Tokens with 18 decimals value
            const priceInWei = BigInt(1000000000000000000); // 1 Ether for 1 ERC20 Token
            const auctionDurationInHours = 5; // Auction will last for 5 Hours

            await expect(fractionPuppies.initialize(amount, priceInWei, auctionDurationInHours)).to.be.reverted;
        });
        it("Should set auction dates on initialize", async function () {
            const { fractionPuppies, fractionPuppiesAddress, cryptoPuppies, tokenId } = await loadFixture(deployFixture);
            await cryptoPuppies.approve(fractionPuppiesAddress, tokenId);
            await fractionPuppies.initialize(AMOUNT, PRICE_IN_WEI, AUCTION_DURATION_IN_HOURS);
            const currentTime = await time.latest();
            const endTime = currentTime + (AUCTION_DURATION_IN_HOURS * 3600);
            expect(await fractionPuppies.startsAt()).to.equal(currentTime);
            expect(await fractionPuppies.endsAt()).to.equal(endTime);
            expect(await fractionPuppies.initialized()).to.equal(true);
        });
        it("Should throw error if initialize called more than once", async function () {
            const { fractionPuppies, cryptoPuppies, fractionPuppiesAddress, tokenId } = await loadFixture(deployFixture);
            await cryptoPuppies.approve(fractionPuppiesAddress, tokenId);
            await fractionPuppies.initialize(AMOUNT, PRICE_IN_WEI, AUCTION_DURATION_IN_HOURS);
            amount =  BigInt(8000000000000000000); // 8 ERC20 Tokens with 18 decimals value
            priceInWei = BigInt(2000000000000000000); // 2 Ether for 1 ERC20 Token
            auctionDurationInHours = 15; // Auction will last for 15 Hours
            await expect(fractionPuppies.initialize(amount, priceInWei, auctionDurationInHours)).to.be.revertedWith('Can only be called once');
        });
        
        it("Should transfer nft to contract on initialize", async function () {
            const { fractionPuppies, cryptoPuppies, fractionPuppiesAddress, tokenId} = await loadFixture(deployFixture);
            await cryptoPuppies.approve(fractionPuppiesAddress, tokenId);
            await fractionPuppies.initialize(AMOUNT, PRICE_IN_WEI, AUCTION_DURATION_IN_HOURS);
            expect(await cryptoPuppies.ownerOf(tokenId)).to.equal(fractionPuppiesAddress);
        });

        it("Should transfer fraction tokens amount to owner", async function () {
            const { fractionPuppies, cryptoPuppies, tokenId, fractionPuppiesAddress, owner } = await loadFixture(deployFixture);
            await cryptoPuppies.approve(fractionPuppiesAddress, tokenId);
            await fractionPuppies.initialize(AMOUNT, PRICE_IN_WEI, AUCTION_DURATION_IN_HOURS);
            expect(await fractionPuppies.balanceOf(owner)).to.equal(AMOUNT);
        });
    });
    describe("Buy Token", async function () {
        const AMOUNT_OF_TOKEN =  BigInt(2000000000000000000); // 2 ERC20 Tokens 
        const ETHER_PRICE = BigInt(2000000000000000000); // 2 Ether for 2 ERC20 Token
        const ETHER_PRICE_2 = BigInt(1000000000000000000); 
        
        const AMOUNT =  BigInt(5000000000000000000); // 5 ERC20 Tokens with 18 decimals value
        const PRICE_IN_WEI = BigInt(1000000000000000000); // 1 Ether for 1 ERC20 Token
        const AUCTION_DURATION_IN_HOURS = 5; // Auction will last for 5 Hours
    
        it("Should buy token if auction is ongoing", async function () {
        const { fractionPuppies, cryptoPuppies, fractionPuppiesAddress, tokenId, otherAccount } = await loadFixture(deployFixture);
           await cryptoPuppies.approve(fractionPuppiesAddress, tokenId);
        await fractionPuppies.initialize(AMOUNT, PRICE_IN_WEI, AUCTION_DURATION_IN_HOURS);
          
            await fractionPuppies.connect(otherAccount).buy(AMOUNT_OF_TOKEN, {value : ETHER_PRICE});
            expect(await fractionPuppies.balanceOf(otherAccount)).to.equal(AMOUNT_OF_TOKEN);
        });
        it("Should throw error if enough ether not sent to buy token", async function () {
        const { fractionPuppies, cryptoPuppies, fractionPuppiesAddress, tokenId, otherAccount } = await loadFixture(deployFixture);
         await cryptoPuppies.approve(fractionPuppiesAddress, tokenId);
        await fractionPuppies.initialize(AMOUNT, PRICE_IN_WEI, AUCTION_DURATION_IN_HOURS);
         
        await expect(fractionPuppies.connect(otherAccount).buy(AMOUNT_OF_TOKEN, {value : ETHER_PRICE_2})).to.be.revertedWith('Not enough ether sent');
        });

        it("Should revert on calling buy when auction ended", async function () {
            await time.increase(1000 * 3600); // Increase 10 hours
            const { fractionPuppies, cryptoPuppies, fractionPuppiesAddress, tokenId, otherAccount } = await loadFixture(deployFixture);
 await cryptoPuppies.approve(fractionPuppiesAddress, tokenId);
        await fractionPuppies.initialize(AMOUNT, PRICE_IN_WEI, AUCTION_DURATION_IN_HOURS);
         
        await expect(fractionPuppies.connect(otherAccount).buy(AMOUNT_OF_TOKEN, {value : ETHER_PRICE})).to.be.revertedWith('Auction Sale Period Ended');
        });
        
   });
});