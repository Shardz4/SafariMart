import { mockListings } from './mockData';

const STORAGE_KEY = 'safarimart_user_listings_v1';

export const getSavedListings = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read saved listings', err);
    return [];
  }
};

export const saveListings = (listings) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
  } catch (err) {
    console.error('Failed to save listings', err);
  }
};

export const addListing = (listing) => {
  const existing = getSavedListings();
  const withNew = [listing, ...existing];
  saveListings(withNew);
};

export const getAllListings = () => {
  // Merge mock listings (read-only) with user-saved listings
  const saved = getSavedListings();
  return [...saved, ...mockListings];
};
