import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { getRWATokenContract, getRWAMarketplaceContract, getUSDCContract, RWA_TOKEN_ADDRESS, RWA_MARKETPLACE_ADDRESS, USDC_ADDRESS } from '../utils/contracts';

export default function SellForm({ navigation }) {
  const { user } = useAuth();
  const { walletAddress } = useWeb3();
  const [formData, setFormData] = useState({
    title: '',
    category: 'art',
    price: '',
    location: '',
    description: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const categoryMap = { art: 0, 'real-estate': 1, handicrafts: 2 };

  const toBase64 = (str) => {
    try {
      return typeof window !== 'undefined' ? window.btoa(unescape(encodeURIComponent(str))) : Buffer.from(str).toString('base64');
    } catch (err) {
      return Buffer.from(str).toString('base64');
    }
  };



  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login first');
      navigation.navigate('SignIn');
      return;
    }
    if (!walletAddress) {
      Alert.alert('Error', 'Please connect your wallet');
      return;
    }
    if (!formData.title || !formData.price || !formData.location || !formData.description) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setIsProcessing(true);
    try {
      // If on-chain addresses are configured and MetaMask is available, mint and list on-chain
      if (RWA_TOKEN_ADDRESS && RWA_MARKETPLACE_ADDRESS && typeof window !== 'undefined' && window.ethereum) {
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
          image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
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
        const { addListing } = await import('../utils/listings');
        addListing({
          id: tokenId,
          title: formData.title,
          category: formData.category,
          price: formData.price,
          location: formData.location,
          description: formData.description,
          image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400',
          verified: true,
          createdAt: Date.now(),
        });

        Alert.alert('Success', 'Minted and listed on-chain successfully');
        setFormData({ title: '', category: 'art', price: '', location: '', description: '' });
      } else {
        // Fallback: Save listing to localStorage
        const { addListing } = await import('../utils/listings');
        const listing = {
          id: Date.now(),
          title: formData.title,
          category: formData.category,
          price: formData.price,
          location: formData.location,
          description: formData.description,
          image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400',
          verified: false,
          createdAt: Date.now(),
        };
        addListing(listing);
        Alert.alert('Success', 'Asset listed locally. It will appear in the marketplace.');
        setFormData({ title: '', category: 'art', price: '', location: '', description: '' });
      }
    } catch (err) {
      console.error('Listing failed', err);
      Alert.alert('Error', `Listing failed: ${err.message || err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>List Your Asset</Text>

        <Text style={styles.label}>Asset Title *</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
          placeholder="e.g., Traditional Maasai Artwork"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Category *</Text>
        <View style={styles.pickerContainer}>
          {['art', 'real-estate', 'handicrafts'].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryOption,
                formData.category === cat && styles.activeCategoryOption,
              ]}
              onPress={() => setFormData({ ...formData, category: cat })}
            >
              <Text
                style={[
                  styles.categoryOptionText,
                  formData.category === cat && styles.activeCategoryOptionText,
                ]}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Price (USDC) *</Text>
        <TextInput
          style={styles.input}
          value={formData.price}
          onChangeText={(text) => setFormData({ ...formData, price: text })}
          placeholder="e.g., 500"
          keyboardType="numeric"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Location *</Text>
        <TextInput
          style={styles.input}
          value={formData.location}
          onChangeText={(text) => setFormData({ ...formData, location: text })}
          placeholder="e.g., Nairobi, Kenya"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={styles.multilineInput}
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          placeholder="Describe your asset..."
          multiline
          numberOfLines={4}
          placeholderTextColor="#666"
        />



        <TouchableOpacity
          style={[styles.submitButton, isProcessing && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isProcessing}
        >
          <Text style={styles.submitButtonText}>
            {isProcessing ? 'Processing...' : 'List Asset'}
          </Text>
        </TouchableOpacity>

        {(!user || !walletAddress) && (
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              ⚠️ {!user ? 'Please login and connect your wallet to list assets.' : 'Please connect your wallet to list assets.'}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  form: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#333',
  },
  multilineInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#333',
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryOption: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  activeCategoryOption: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  categoryOptionText: {
    color: '#cccccc',
  },
  activeCategoryOptionText: {
    color: '#ffffff',
  },

  submitButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  warning: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  warningText: {
    color: '#f59e0b',
    fontSize: 14,
  },
});
