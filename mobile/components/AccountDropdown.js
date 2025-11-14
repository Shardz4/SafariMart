import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';

export default function AccountDropdown({ navigation }) {
  const { user, logout } = useAuth();
  const { walletAddress, disconnectWallet } = useWeb3();
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = async () => {
    await logout();
    disconnectWallet();
    setModalVisible(false);
    navigation.navigate('Home');
  };

  return (
    <>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Text style={styles.accountButton}>
          {user?.displayName || user?.email?.split('@')[0] || 'User'}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.dropdown}>
            <Text style={styles.userInfo}>
              {user?.displayName || user?.email}
            </Text>
            {walletAddress && (
              <Text style={styles.walletInfo}>
                Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </Text>
            )}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  accountButton: {
    color: '#ffffff',
    fontSize: 14,
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 20,
  },
  dropdown: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    minWidth: 200,
    borderWidth: 1,
    borderColor: '#333',
  },
  userInfo: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  walletInfo: {
    color: '#10b981',
    fontSize: 14,
    marginBottom: 16,
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
  },
});
