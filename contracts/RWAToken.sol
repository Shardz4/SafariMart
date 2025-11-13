pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";



contract RWAToken is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    enum AssetCategory { ART, REAL_ESTATE, HANDICRAFTS }

    struct Asset {
        uint256 tokenId;
        address creator;
        AssetCategory category;
        string location;
        uint256 createdAt;
        bool verified;
    }

    mapping(uint256 => Asset) public assets;
    mapping(address => bool) public verifiers;

    event AssetMinted(
        uint256 indexed tokenId,
        address indexed creator,
        AssetCategory category,
        string tokenURI
    );

    event AssetVerified(uint256 indexed tokenId, address verifier);

    constructor() ERC721("RWA Token", "RWA") Ownable(msg.sender) {}

    function mintAsset(
        address to,
        string memory tokenURI,
        AssetCategory category,
        string memory location
    ) public returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        assets[newTokenId] = Asset({
            tokenId: newTokenId,
            creator: to,
            category: category,
            location: location,
            createdAt: block.timestamp,
            verified: false
        });

        emit AssetMinted(newTokenId, to, category, tokenURI);
        return newTokenId;
    }

    function verifyAsset(uint256 tokenId) public {
        require(verifiers[msg.sender], "Not authorized verifier");
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        assets[tokenId].verified = true;
        emit AssetVerified(tokenId, msg.sender);
    }

    function addVerifier(address verifier) public onlyOwner {
        verifiers[verifier] = true;
    }

    function removeVerifier(address verifier) public onlyOwner {
        verifiers[verifier] = false;
    }

    function getAsset(uint256 tokenId) public view returns (Asset memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return assets[tokenId];
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
}