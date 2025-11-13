import { ethers } from 'ethers';

// Contract addresses from .env.local
export const RWA_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_RWA_TOKEN_ADDRESS;
export const RWA_MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_RWA_MARKETPLACE_ADDRESS;
export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS;

// Minimal ABIs for contract interaction
const RWA_TOKEN_ABI = [
  "function mintAsset(address to, string memory tokenURI, uint8 category, string memory location) public returns (uint256)",
  "function getAsset(uint256 tokenId) public view returns (tuple(uint256 tokenId, address creator, uint8 category, string location, uint256 createdAt, bool verified))",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function approve(address to, uint256 tokenId) public",
  "function setApprovalForAll(address operator, bool approved) public",
  "function isApprovedForAll(address owner, address operator) public view returns (bool)",
  "function totalSupply() public view returns (uint256)"
];

// USDC ERC20 ABI (minimal)
const USDC_ABI = [
  "function balanceOf(address owner) public view returns (uint256)",
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function decimals() public view returns (uint8)",
  "function faucet() public" // Only for mock USDC
];

const RWA_MARKETPLACE_ABI = [
  "function listAsset(uint256 tokenId, uint256 price) public",
  "function buyAsset(uint256 listingId) public",
  "function cancelListing(uint256 listingId) public",
  "function makeOffer(uint256 listingId, uint256 amount) public",
  "function acceptOffer(uint256 listingId, uint256 offerIndex) public",
  "function getActiveListings() public view returns (tuple(uint256 listingId, uint256 tokenId, address seller, uint256 price, bool active, uint256 listedAt)[] memory)",
  "function getUserListings(address user) public view returns (uint256[] memory)",
  "function getOffers(uint256 listingId) public view returns (tuple(address buyer, uint256 amount, uint256 timestamp, bool accepted)[] memory)",
  "function paymentToken() public view returns (address)"
];

export const getRWATokenContract = (signerOrProvider) => {
  if (!RWA_TOKEN_ADDRESS) {
    console.warn('RWA Token address not configured');
    return null;
  }
  return new ethers.Contract(RWA_TOKEN_ADDRESS, RWA_TOKEN_ABI, signerOrProvider);
};

export const getUSDCContract = (signerOrProvider) => {
  if (!USDC_ADDRESS) {
    console.warn('USDC address not configured');
    return null;
  }
  return new ethers.Contract(USDC_ADDRESS, USDC_ABI, signerOrProvider);
};

export const getRWAMarketplaceContract = (signerOrProvider) => {
  if (!RWA_MARKETPLACE_ADDRESS) {
    console.warn('RWA Marketplace address not configured');
    return null;
  }
  return new ethers.Contract(RWA_MARKETPLACE_ADDRESS, RWA_MARKETPLACE_ABI, signerOrProvider);
};