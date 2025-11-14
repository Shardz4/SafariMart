import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import AccountDropdown from './AccountDropdown';

export default function Header({ navigation }) {
  const { user } = useAuth();
  const { walletAddress, connectWallet } = useWeb3();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Text style={styles.logo}>SafariMart</Text>
      </TouchableOpacity>

      <View style={styles.nav}>
        <TouchableOpacity onPress={() => navigation.navigate('Market')}>
          <Text style={styles.navItem}>Market</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Sell')}>
          <Text style={styles.navItem}>Sell</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Portfolio')}>
          <Text style={styles.navItem}>Portfolio</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.account}>
        {walletAddress ? (
          <Text style={styles.walletAddress}>
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </Text>
        ) : (
          <TouchableOpacity onPress={connectWallet}>
            <Text style={styles.connectWallet}>Connect Wallet</Text>
          </TouchableOpacity>
        )}

        {user ? (
          <AccountDropdown navigation={navigation} />
        ) : (
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.signIn}>Sign In</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  nav: {
    flexDirection: 'row',
    gap: 20,
  },
  navItem: {
    color: '#cccccc',
    fontSize: 16,
  },
  account: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  walletAddress: {
    color: '#10b981',
    fontSize: 14,
    backgroundColor: '#10b98120',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  connectWallet: {
    color: '#3b82f6',
    fontSize: 14,
    backgroundColor: '#3b82f620',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  signIn: {
    color: '#ffffff',
    fontSize: 14,
  },
});
