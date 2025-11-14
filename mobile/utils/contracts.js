import { ethers } from 'ethers';
import RWAMarketplaceABI from '../../public/abi/RWAMarketplace.json';
import RWATokenABI from '../../public/abi/RWAToken.json';

// Contract addresses - these should be set in environment variables
export const RWA_TOKEN_ADDRESS = process.env.EXPO_PUBLIC_RWA_TOKEN_ADDRESS || '';
export const RWA_MARKETPLACE_ADDRESS = process.env.EXPO_PUBLIC_RWA_MARKETPLACE_ADDRESS || '';
export const USDC_ADDRESS = process.env.EXPO_PUBLIC_USDC_ADDRESS || '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'; // Polygon USDC

// Contract instances
let rwaTokenContract = null;
let rwaMarketplaceContract = null;
let usdcContract = null;

export const getRWATokenContract = (signer) => {
  if (!RWA_TOKEN_ADDRESS) return null;
  if (!rwaTokenContract) {
    rwaTokenContract = new ethers.Contract(RWA_TOKEN_ADDRESS, RWATokenABI, signer);
  }
  return rwaTokenContract;
};

export const getRWAMarketplaceContract = (signer) => {
  if (!RWA_MARKETPLACE_ADDRESS) return null;
  if (!rwaMarketplaceContract) {
    rwaMarketplaceContract = new ethers.Contract(RWA_MARKETPLACE_ADDRESS, RWAMarketplaceABI, signer);
  }
  return rwaMarketplaceContract;
};

export const getUSDCContract = (signer) => {
  if (!USDC_ADDRESS) return null;
  if (!usdcContract) {
    usdcContract = new ethers.Contract(USDC_ADDRESS, [
      'function decimals() view returns (uint8)',
      'function allowance(address owner, address spender) view returns (uint256)',
      'function approve(address spender, uint256 amount) returns (bool)',
      'function balanceOf(address account) view returns (uint256)',
    ], signer);
  }
  return usdcContract;
};
