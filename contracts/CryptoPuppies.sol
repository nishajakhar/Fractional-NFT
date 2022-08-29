// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

// Import the openzepplin contracts
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CryptoPuppies is ERC721, Ownable {
     using Counters for Counters.Counter;
  uint256 public cost = 0.05 ether;

    Counters.Counter private _tokenIdCounter;
    constructor() ERC721("CryptoPuppies", "CPP") {
    }

      function mint() public payable returns (uint) {
        require(msg.value >= cost, "Not enough ether sent");
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId + 1);
        return tokenId+1;
      }
}