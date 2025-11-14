import { ethers } from 'ethers';

// MetaMask connection function
export const connectWallet = async () => {
  if (typeof window === 'undefined') {
    throw new Error('Window is not defined. This function must be called in a browser environment.');
  }

  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed. Please install it to continue.');
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (accounts.length === 0) {
      throw new Error('No accounts found in MetaMask.');
    }

    // Switch to Polygon
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x89' }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x89',
            chainName: 'Polygon Mainnet',
            rpcUrls: ['https://polygon-rpc.com/'],
            nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
            blockExplorerUrls: ['https://polygonscan.com/'],
          }],
        });
      } else {
        throw switchError;
      }
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    return address;
  } catch (error) {
    console.error('Wallet connection error:', error);
    throw error;
  }
};
