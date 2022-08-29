// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

// Import the openzepplin contracts
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";


contract FractionPuppies is ERC20, ERC721Holder, ERC20Burnable {
    IERC721 public nftContractAddress;
    uint public nftId;
    uint public startsAt;
    uint public endsAt;
    uint public price;
    uint public auctionDurationInHours;
    address public seller;
    bool public initialized = false;

    constructor(string memory _name,  string memory _symbol, 
        address _nftContractAddress, uint _nftId) ERC20(_name, _symbol) {
        nftContractAddress = IERC721(_nftContractAddress);
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
    
    function initialize(uint _amount, uint _priceInWei, uint _auctionDurationInHours) public {
        require(!initialized, "Can only be called once");
        require(_auctionDurationInHours > 0, "Duration should be at least 1 Hour");
        startsAt = block.timestamp;
        endsAt = startsAt + (_auctionDurationInHours * 3600);
        price = _priceInWei;
        initialized = true;
        auctionDurationInHours = _auctionDurationInHours;
        nftContractAddress.safeTransferFrom(msg.sender, address(this), nftId);
        _mint(msg.sender, _amount);
    }

    function buy(uint _amount) external payable {
        require(block.timestamp < endsAt, "Auction Sale Period Ended");
        require(msg.value >= price * _amount, "Not Enough Ether Sent");
        require(balanceOf(seller) >= _amount, "Not Enough Tokens");
        _transfer(seller, msg.sender, _amount);
        if(msg.value > (price * _amount)) {
            address(msg.sender).call{value : msg.value - (price * _amount)}("");
        }
    }

    function hasAuctionStarted() public view returns (bool) {
        return block.timestamp > startsAt;
    }

    function hasAuctionEnded() public view returns (bool) {
         return block.timestamp > endsAt;
    }

    function totalCollection() public view returns (uint) {
        return address(this).balance;
    }
    function withdraw() external onlyOwner auctionEnded {
        address(seller).call{value : address(this).balance}("");
    }

}
