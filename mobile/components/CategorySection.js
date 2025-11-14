import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import MarketCard from './MarketCard';

export default function CategorySection({ listings, navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'art', label: 'Art' },
    { key: 'real-estate', label: 'Real Estate' },
    { key: 'handicrafts', label: 'Handicrafts' },
  ];

  const filteredListings = selectedCategory === 'all'
    ? listings
    : listings.filter(listing => listing.category === selectedCategory);

  const renderItem = ({ item }) => (
    <MarketCard listing={item} navigation={navigation} />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Marketplace</Text>

      <View style={styles.categoryTabs}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryTab,
              selectedCategory === category.key && styles.activeCategoryTab,
            ]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <Text
              style={[
                styles.categoryTabText,
                selectedCategory === category.key && styles.activeCategoryTabText,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredListings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  categoryTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 4,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeCategoryTab: {
    backgroundColor: '#8b5cf6',
  },
  categoryTabText: {
    color: '#cccccc',
    fontSize: 14,
    fontWeight: '500',
  },
  activeCategoryTabText: {
    color: '#ffffff',
  },
  listContainer: {
    paddingBottom: 20,
  },
});
