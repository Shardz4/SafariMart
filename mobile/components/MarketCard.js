import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { MapPin, CheckCircle } from 'lucide-react-native';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/AuthContext';
import { ethers } from 'ethers';
import { getUSDCContract, getRWAMarketplaceContract, RWA_MARKETPLACE_ADDRESS, USDC_ADDRESS } from '../utils/contracts';
import { getSavedListings, saveListings } from '../utils/listings';

export default function MarketCard({ listing, navigation }) {
  const { user } = useAuth();
  const { walletAddress } = useWeb3();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBuy = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login first');
      navigation.navigate('SignIn');
      return;
    }
    if (!walletAddress) {
      Alert.alert('Error', 'Please connect your wallet');
      return;
    }

    setIsProcessing(true);
    try {
      // If marketplace address isn't configured or there's no wallet provider, fallback to local purchase
      if (!RWA_MARKETPLACE_ADDRESS || typeof window === 'undefined' || !window.ethereum) {
        // Simulate purchase: remove from saved listings if it exists there
        const saved = getSavedListings();
        const remaining = saved.filter((l) => String(l.id) !== String(listing.id));
        saveListings(remaining);
        Alert.alert('Success', `Purchased ${listing.title} (local simulation).`);
        return;
      }

      // On-chain flow
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Use USDC contract to check allowance and approve if needed
      const usdc = getUSDCContract(signer);
      const marketplace = getRWAMarketplaceContract(signer);

      if (!usdc || !marketplace) {
        throw new Error('USDC or marketplace contract not configured');
      }

      const decimals = await usdc.decimals().catch(() => 6);
      const priceAmount = ethers.parseUnits(String(listing.price), decimals);

      const ownerAddress = await signer.getAddress();

      // Check allowance
      const allowance = await usdc.allowance(ownerAddress, RWA_MARKETPLACE_ADDRESS);
      if (allowance < priceAmount) {
        const approveTx = await usdc.approve(RWA_MARKETPLACE_ADDRESS, priceAmount);
        await approveTx.wait();
      }

      // Call marketplace buyAsset. We assume listing.id maps to on-chain listingId for on-chain listings.
      const tx = await marketplace.buyAsset(listing.id);
      await tx.wait();
      Alert.alert('Success', 'Purchase successful on-chain');
    } catch (error) {
      console.error('Purchase failed:', error);
      Alert.alert('Error', `Purchase failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: listing.image }} style={styles.image} />
        {listing.verified && (
          <View style={styles.verifiedBadge}>
            <CheckCircle size={12} color="#10b981" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{listing.description}</Text>
        <View style={styles.location}>
          <MapPin size={14} color="#8b5cf6" />
          <Text style={styles.locationText}>{listing.location}</Text>
        </View>
        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.price}>${listing.price}</Text>
            <Text style={styles.currency}>USDC</Text>
          </View>
          <TouchableOpacity
            style={[styles.buyButton, isProcessing && styles.disabledButton]}
            onPress={handleBuy}
            disabled={isProcessing}
          >
            <Text style={styles.buyButtonText}>
              {isProcessing ? 'Processing...' : 'Buy Now'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    margin: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 160,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 8,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    color: '#cccccc',
    fontSize: 12,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    color: '#666',
    fontSize: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
    backgroundClip: 'text',
    color: '#8b5cf6',
  },
  currency: {
    color: '#666',
    fontSize: 12,
  },
  buyButton: {
    backgroundColor: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
