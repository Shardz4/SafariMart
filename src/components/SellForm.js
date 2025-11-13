'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { getRWATokenContract, getRWAMarketplaceContract, getUSDCContract, RWA_TOKEN_ADDRESS, RWA_MARKETPLACE_ADDRESS, USDC_ADDRESS } from '../lib/contracts';
import { storage } from '../lib/firebase';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function SellForm() {
  const { user } = useAuth();
  const { walletAddress } = useWeb3();
  const [formData, setFormData] = useState({
    title: '',
    category: 'art',
    price: '',
    location: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const categoryMap = { art: 0, 'real-estate': 1, handicrafts: 2 };

  const toBase64 = (str) => {
    // safe base64 for utf-8
    try {
      return typeof window !== 'undefined' ? window.btoa(unescape(encodeURIComponent(str))) : Buffer.from(str).toString('base64');
    } catch (err) {
      return Buffer.from(str).toString('base64');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login first');
    if (!walletAddress) return alert('Please connect your wallet');
    if (!formData.title || !formData.price || !formData.location || !formData.description) {
      return alert('Please fill all required fields');
    }

    // If imageFile is present, upload it to Firebase Storage first (if configured)
    let hostedImageUrl = null;
    if (imageFile && storage) {
      try {
        const path = `images/${walletAddress || 'anon'}/${Date.now()}-${imageFile.name}`;
        const sRef = storageRef(storage, path);
        const uploadTask = uploadBytesResumable(sRef, imageFile);

        // wait for upload and track progress
        await new Promise((resolve, reject) => {
          uploadTask.on('state_changed', (snapshot) => {
            const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setUploadProgress(prog);
          }, (err) => reject(err), () => resolve());
        });

        hostedImageUrl = await getDownloadURL(sRef);
      } catch (err) {
        console.error('Image upload failed, continuing without hosted image', err);
        hostedImageUrl = null;
      }
    }

    // If on-chain addresses are configured and MetaMask is available, mint and list on-chain
    if (RWA_TOKEN_ADDRESS && RWA_MARKETPLACE_ADDRESS && typeof window !== 'undefined' && window.ethereum) {
      setIsProcessing(true);
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const rwa = getRWATokenContract(signer);
        const marketplace = getRWAMarketplaceContract(signer);
        const usdc = getUSDCContract(signer);

        if (!rwa || !marketplace) throw new Error('Token or marketplace contract not available');

        // Estimate tokenId by reading totalSupply first (assumes sequential minting)
        const total = await rwa.totalSupply().catch(() => 0);
        const nextId = Number(total.toString ? total.toString() : total) + 1;

        // Build metadata JSON and use data URL as tokenURI (replace with IPFS later)
        const metadata = {
          name: formData.title,
          description: formData.description,
          image: hostedImageUrl || previewUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
          attributes: [{ trait_type: 'category', value: formData.category }, { trait_type: 'location', value: formData.location }],
        };

        const tokenURI = `data:application/json;base64,${toBase64(JSON.stringify(metadata))}`;

        // Call mintAsset(to, tokenURI, category, location)
        const catIndex = categoryMap[formData.category] ?? 0;
        const mintTx = await rwa.mintAsset(walletAddress, tokenURI, catIndex, formData.location);
        await mintTx.wait();

        const tokenId = nextId; // best-effort mapping

        // Approve marketplace to transfer/list tokens
        try {
          const approvalTx = await rwa.setApprovalForAll(RWA_MARKETPLACE_ADDRESS, true);
          await approvalTx.wait();
        } catch (err) {
          console.warn('Approval failed', err);
        }

        // Convert price to USDC smallest units using USDC decimals (fallback to 6)
        const decimals = usdc ? await usdc.decimals().catch(() => 6) : 6;
        const priceAmount = ethers.parseUnits(String(formData.price), decimals);

        const listTx = await marketplace.listAsset(tokenId, priceAmount);
        await listTx.wait();

        // Save listing locally for immediate visibility
        const { addListing } = await import('../lib/listings');
        addListing({
          id: tokenId,
          title: formData.title,
          category: formData.category,
          price: formData.price,
          location: formData.location,
          description: formData.description,
          image: hostedImageUrl || previewUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400',
          verified: true,
          createdAt: Date.now(),
        });

        alert('Minted and listed on-chain successfully');
        setFormData({ title: '', category: 'art', price: '', location: '', description: '' });
        setImageData(null);
      } catch (err) {
        console.error('On-chain listing failed', err);
        alert('On-chain listing failed: ' + (err.message || err));
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Fallback: Save listing to localStorage
    try {
      const { addListing } = await import('../lib/listings');
      const listing = {
        id: Date.now(),
        title: formData.title,
        category: formData.category,
        price: formData.price,
        location: formData.location,
        description: formData.description,
        image: hostedImageUrl || previewUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400',
        verified: false,
        createdAt: Date.now(),
      };
      addListing(listing);
      alert('Asset listed locally. It will appear in the marketplace.');
      setFormData({ title: '', category: 'art', price: '', location: '', description: '' });
      setImageData(null);
    } catch (err) {
      console.error('Failed to save listing', err);
      alert('Failed to save listing. See console for details.');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    try {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } catch (err) {
      setPreviewUrl(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
        <h2 className="text-2xl font-bold mb-6">List Your Asset</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Asset Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
              placeholder="e.g., Traditional Maasai Artwork"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
              required
            >
              <option value="art">Art</option>
              <option value="real-estate">Real Estate</option>
              <option value="handicrafts">Handicrafts</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Price (USDC) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
              placeholder="e.g., 500"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Location *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
              placeholder="e.g., Nairobi, Kenya"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 rounded-lg border border-gray-700 focus:border-purple-500 outline-none h-32 resize-none"
              placeholder="Describe your asset..."
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Image (optional)</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {previewUrl && (
              <div className="mt-3">
                <img src={previewUrl} alt="preview" className="w-full h-40 object-cover rounded" />
              </div>
            )}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-2 text-sm text-gray-400">Uploading image: {uploadProgress}%</div>
            )}
          </div>
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full px-6 py-4 bg-purple-600 rounded-lg hover:bg-purple-700 transition font-bold text-lg disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'List Asset'}
          </button>
        </form>
        {(!user || !walletAddress) && (
          <div className="mt-6 p-4 bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg">
            <p className="text-yellow-400 text-sm">
              ⚠️ {!user ? 'Please login and connect your wallet to list assets.' : 'Please connect your wallet to list assets.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}