import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from '../components/Header';
import PortfolioGrid from '../components/PortfolioGrid';

export default function PortfolioScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Header navigation={navigation} />
      <PortfolioGrid navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
});
