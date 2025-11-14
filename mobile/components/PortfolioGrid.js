import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { getRWATokenContract, RWA_TOKEN_ADDRESS } from '../utils/contracts';
import MarketCard from './MarketCard';

export default function PortfolioGrid({ navigation }) {
  const { user } = useAuth();
  const { walletAddress } = useWeb3();
  const [ownedAssets, setOwnedAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && walletAddress) {
      loadOwnedAssets();
    }
  }, [user, walletAddress]);

  const loadOwnedAssets = async () => {
    if (!walletAddress || !RWA_TOKEN_ADDRESS) {
      // Fallback to localStorage listings if no wallet/contract
      const { getSavedListings } = await import('../utils/listings');
      const listings = getSavedListings();
      setOwnedAssets(listings.filter(listing => listing.verified)); // Assume verified means owned
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const rwa = getRWATokenContract(signer);

      if (!rwa) {
        Alert.alert('Error', 'Contract not available');
        return;
      }

      // Get balance of tokens owned by user
      const balance = await rwa.balanceOf(walletAddress);
      const tokenCount = Number(balance.toString());

      const assets = [];
      for (let i = 0; i < tokenCount; i++) {
        try {
          const tokenId = await rwa.tokenOfOwnerByIndex(walletAddress, i);
          const tokenURI = await rwa.tokenURI(tokenId);
          const metadata = JSON.parse(atob(tokenURI.split(',')[1]));

          assets.push({
            id: tokenId.toString(),
            title: metadata.name,
            description: metadata.description,
            image: metadata.image,
            category: metadata.attributes.find(attr => attr.trait_type === 'category')?.value || 'art',
            location: metadata.attributes.find(attr => attr.trait_type === 'location')?.value || '',
            price: '0', // Would need to get from marketplace contract
            verified: true,
          });
        } catch (err) {
          console.error('Error loading token', i, err);
        }
      }

      setOwnedAssets(assets);
    } catch (error) {
      console.error('Error loading owned assets:', error);
      Alert.alert('Error', 'Failed to load owned assets');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.portfolioCard}>
      <MarketCard listing={item} navigation={navigation} />
      <Text style={styles.ownedLabel}>Owned</Text>
    </View>
  );

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.message}>Please sign in to view your portfolio</Text>
      </View>
    );
  }

  if (!walletAddress) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.message}>Please connect your wallet to view owned assets</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Portfolio</Text>

      {loading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading your assets...</Text>
        </View>
      ) : ownedAssets.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No owned assets found</Text>
          <Text style={styles.emptySubtext}>Assets you purchase will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={ownedAssets}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0f0f0f',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8b5cf6',
  },
  emptyText: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  portfolioCard: {
    position: 'relative',
  },
  ownedLabel: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#10b981',
    color: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    zIndex: 1,
  },
});
