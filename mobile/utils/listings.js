import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockListings } from './mockData';

const LISTINGS_KEY = 'safarimart_listings';

export const getSavedListings = async () => {
  try {
    const saved = await AsyncStorage.getItem(LISTINGS_KEY);
    return saved ? JSON.parse(saved) : mockListings;
  } catch (error) {
    console.error('Error loading listings:', error);
    return mockListings;
  }
};

export const saveListings = async (listings) => {
  try {
    await AsyncStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
  } catch (error) {
    console.error('Error saving listings:', error);
  }
};

export const addListing = async (listing) => {
  try {
    const current = await getSavedListings();
    const updated = [...current, listing];
    await saveListings(updated);
    return updated;
  } catch (error) {
    console.error('Error adding listing:', error);
    throw error;
  }
};

export const getAllListings = async () => {
  return await getSavedListings();
};
