// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./RWAToken.sol";

contract RWAMarketplace is Ownable {
    uint256 private _listingIds;

    RWAToken public rwaToken;
    IERC20 public paymentToken; // USDC on Polygon

    struct Listing {
        uint256 listingId;
        uint256 tokenId;
        address seller;
        uint256 price;
        bool active;
        uint256 listedAt;
    }

    struct Offer {
        address buyer;
        uint256 amount;
        uint256 timestamp;
        bool accepted;
    }

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Offer[]) public offers;
    mapping(address => uint256[]) public userListings;
    
    uint256 public platformFee = 250; // 2.5% in basis points
    uint256 public constant FEE_DENOMINATOR = 10000;

    event Listed(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );

    event Sold(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price
    );

    event ListingCancelled(uint256 indexed listingId);

    event OfferMade(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 amount
    );

    event OfferAccepted(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 amount
    );

    constructor(address _rwaTokenAddress, address _paymentTokenAddress) Ownable(msg.sender) {
        rwaToken = RWAToken(_rwaTokenAddress);
        paymentToken = IERC20(_paymentTokenAddress);
    }

    function listAsset(uint256 tokenId, uint256 price) public {
        require(rwaToken.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(price > 0, "Price must be greater than 0");
        require(
            rwaToken.getApproved(tokenId) == address(this) ||
            rwaToken.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );

        _listingIds++;
        uint256 listingId = _listingIds;

        listings[listingId] = Listing({
            listingId: listingId,
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            active: true,
            listedAt: block.timestamp
        });

        userListings[msg.sender].push(listingId);

        emit Listed(listingId, tokenId, msg.sender, price);
    }

    function buyAsset(uint256 listingId) public {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(paymentToken.balanceOf(msg.sender) >= listing.price, "Insufficient USDC balance");
        require(paymentToken.allowance(msg.sender, address(this)) >= listing.price, "Insufficient USDC allowance");

        listing.active = false;

        uint256 fee = (listing.price * platformFee) / FEE_DENOMINATOR;
        uint256 sellerAmount = listing.price - fee;

        // Transfer NFT to buyer
        rwaToken.safeTransferFrom(listing.seller, msg.sender, listing.tokenId);

        // Transfer USDC from buyer to seller and platform
        require(paymentToken.transferFrom(msg.sender, listing.seller, sellerAmount), "Seller payment failed");
        require(paymentToken.transferFrom(msg.sender, owner(), fee), "Fee payment failed");

        emit Sold(listingId, listing.tokenId, listing.seller, msg.sender, listing.price);
    }

    function cancelListing(uint256 listingId) public {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not listing owner");
        require(listing.active, "Listing not active");

        listing.active = false;
        emit ListingCancelled(listingId);
    }

    function makeOffer(uint256 listingId, uint256 amount) public {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(amount > 0, "Offer must be greater than 0");
        require(msg.sender != listing.seller, "Cannot offer on own listing");
        require(paymentToken.balanceOf(msg.sender) >= amount, "Insufficient USDC balance");
        require(paymentToken.allowance(msg.sender, address(this)) >= amount, "Insufficient USDC allowance");

        // Transfer USDC to contract to hold offer
        require(paymentToken.transferFrom(msg.sender, address(this), amount), "Offer transfer failed");

        offers[listingId].push(Offer({
            buyer: msg.sender,
            amount: amount,
            timestamp: block.timestamp,
            accepted: false
        }));

        emit OfferMade(listingId, msg.sender, amount);
    }

    function acceptOffer(uint256 listingId, uint256 offerIndex) public {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not listing owner");
        require(listing.active, "Listing not active");
        require(offerIndex < offers[listingId].length, "Invalid offer");

        Offer storage offer = offers[listingId][offerIndex];
        require(!offer.accepted, "Offer already processed");

        listing.active = false;
        offer.accepted = true;

        uint256 fee = (offer.amount * platformFee) / FEE_DENOMINATOR;
        uint256 sellerAmount = offer.amount - fee;

        // Transfer NFT to buyer
        rwaToken.safeTransferFrom(listing.seller, offer.buyer, listing.tokenId);

        // Transfer USDC from contract to seller and platform
        require(paymentToken.transfer(listing.seller, sellerAmount), "Seller payment failed");
        require(paymentToken.transfer(owner(), fee), "Fee payment failed");

        // Refund other offers
        for (uint256 i = 0; i < offers[listingId].length; i++) {
            if (i != offerIndex && !offers[listingId][i].accepted) {
                require(paymentToken.transfer(offers[listingId][i].buyer, offers[listingId][i].amount), "Refund failed");
            }
        }

        emit OfferAccepted(listingId, offer.buyer, offer.amount);
        emit Sold(listingId, listing.tokenId, listing.seller, offer.buyer, offer.amount);
    }

    function getActiveListings() public view returns (Listing[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= _listingIds; i++) {
            if (listings[i].active) {
                activeCount++;
            }
        }

        Listing[] memory activeListings = new Listing[](activeCount);
        uint256 currentIndex = 0;

        for (uint256 i = 1; i <= _listingIds; i++) {
            if (listings[i].active) {
                activeListings[currentIndex] = listings[i];
                currentIndex++;
            }
        }

        return activeListings;
    }

    function getListingsByCategory(RWAToken.AssetCategory category) 
        public 
        view 
        returns (Listing[] memory) 
    {
        uint256 count = 0;
        for (uint256 i = 1; i <= _listingIds; i++) {
            if (listings[i].active) {
                RWAToken.Asset memory asset = rwaToken.getAsset(listings[i].tokenId);
                if (asset.category == category) {
                    count++;
                }
            }
        }

        Listing[] memory categoryListings = new Listing[](count);
        uint256 currentIndex = 0;

        for (uint256 i = 1; i <= _listingIds; i++) {
            if (listings[i].active) {
                RWAToken.Asset memory asset = rwaToken.getAsset(listings[i].tokenId);
                if (asset.category == category) {
                    categoryListings[currentIndex] = listings[i];
                    currentIndex++;
                }
            }
        }

        return categoryListings;
    }

    function getUserListings(address user) public view returns (uint256[] memory) {
        return userListings[user];
    }

    function getOffers(uint256 listingId) public view returns (Offer[] memory) {
        return offers[listingId];
    }

    function updatePlatformFee(uint256 newFee) public onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = newFee;
    }

    function withdrawUSDC() public onlyOwner {
        uint256 balance = paymentToken.balanceOf(address(this));
        require(paymentToken.transfer(owner(), balance), "Withdrawal failed");
    }

    function updatePaymentToken(address _newPaymentToken) public onlyOwner {
        paymentToken = IERC20(_newPaymentToken);
    }
}