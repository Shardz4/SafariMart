import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import Header from '../components/Header';
import CategorySection from '../components/CategorySection';
import { getAllListings } from '../utils/listings';

export default function MarketScreen({ navigation }) {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    setListings(getAllListings());
  }, []);

  return (
    <View style={styles.container}>
      <Header navigation={navigation} />
      <ScrollView style={styles.content}>
        <CategorySection listings={listings} navigation={navigation} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  content: {
    flex: 1,
  },
});
