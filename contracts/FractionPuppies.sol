// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

// Import the openzepplin contracts
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/** 
    @title Fractionalize Crypto Puppies
    @author Nisha R. Jakhar
    @notice You can use this contract to fractionalize your nft into erc20 tokens
    @dev You need a NFT contract address and a minted NFT to use with this contract 
*/
contract FractionPuppies is ERC20, ERC721Holder, ERC20Burnable {
    using SafeMath for uint256;
    IERC721 public nftContractAddress;
    uint public nftId;
    uint public startsAt;
    uint public endsAt;
    uint public price;
    uint public auctionDurationInHours;
    address public seller;
    bool public initialized = false;

/**
    @notice Constructor funtion
    @dev Sets up initial parameters of the contract
    @param _name Name of the ERC20 Token
    @param _symbol Symbol of the ERC20 Token
    @param _nftContractAddress Address of NFT Contract
    @param _nftId Id of the token to fractionalize
*/
    constructor(string memory _name,  string memory _symbol, 
        address _nftContractAddress, uint _nftId) ERC20(_name, _symbol) {
        nftContractAddress = IERC721(_nftContractAddress);
        require(nftContractAddress.ownerOf(_nftId) == msg.sender, "Only NFT Owner can Fractionalize the NFT");
        nftId = _nftId;
        seller = msg.sender;
    }

    modifier auctionEnded() {
        require(block.timestamp > endsAt, "Can only be called after Auction Ends");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == seller, "Only Owner allowed");
        _;
    }
    
/**
    @notice Initialize the Auction
    @dev Sets up auction Start Date and End Date and tranfers NFT of owner to itself in return of ERC20 tokens
    @param _amount The number of ERC20 tokens to mint
    @param _rate Token sale rate. Rate = No of token bits every 1 Wei
    @param _auctionDurationInHours The duration of contract in Hours
*/
    function initialize(uint _amount, uint _rate, uint _auctionDurationInHours) public {
        require(!initialized, "Can only be called once");
        require(_auctionDurationInHours > 0, "Duration should be at least 1 Hour");
        startsAt = block.timestamp;
        endsAt = startsAt + (_auctionDurationInHours * 3600);
        price = _rate; // Amount of tokens to get in 1 Wei
        initialized = true;
        auctionDurationInHours = _auctionDurationInHours;
        nftContractAddress.safeTransferFrom(msg.sender, address(this), nftId);
        _mint(msg.sender, _amount);
    }

/**
    @notice Buy Token in Auction
    @dev Transfers ERC20 tokens to buyer's address according to rate
*/
    function buy() external payable {
        require(block.timestamp < endsAt, "Auction Sale Period Ended");
        require(balanceOf(seller) != 0, "No Token Left");
        uint tokenAmount = msg.value.mul(price);
        if(balanceOf(seller) >= tokenAmount) {
             _transfer(seller, msg.sender, tokenAmount);
        }
        else {
            uint tokens = balanceOf(seller);
            uint amount = tokens.div(price);
            _transfer(seller, msg.sender, tokens);
            address(msg.sender).call{value : msg.value.sub(amount) }("");
        }
    }

/**
    @notice Auction start status
    @dev returns true if auction is started else false
    @return boolean 
*/
    function hasAuctionStarted() public view returns (bool) {
        return block.timestamp > startsAt;
    }

/**
    @notice Auction end status
    @dev returns true if auction is ended else false
    @return boolean
*/
    function hasAuctionEnded() public view returns (bool) {
         return block.timestamp > endsAt;
    }

/**
    @notice Total Wei Raised in Auction
    @dev returns balance of the contract
    @return an unsigned integer 
*/
    function totalCollection() public view returns (uint) {
        return address(this).balance;
    }

/**
    @notice Withdraw Funds after Auction for NFT Owner
    @dev tranfers all contract's wei balance to initial nft owner 
*/
    function withdraw() external onlyOwner auctionEnded {
        address(seller).call{value : address(this).balance}("");
    }


}
