import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from '../components/Header';
import SellForm from '../components/SellForm';

export default function SellScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Header navigation={navigation} />
      <SellForm navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
});
