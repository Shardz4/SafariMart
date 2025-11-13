**SafariMart**

**Overview:**
- **Project:**: A Next.js marketplace for tokenized real-world assets (RWA). Users can sign in with Google (Firebase), connect a wallet (MetaMask), list assets (with images uploaded to Firebase Storage), mint/list on-chain when contract addresses are configured, and buy assets either on-chain or via a local simulation.

**Features:**
- **Auth:**: Firebase authentication using Google (redirect flow) and email/password.
- **Storage:**: Images uploaded from the `Sell` form are stored in Firebase Storage and used in token metadata.
- **On-chain mint & list:**: `SellForm` mints an RWA token (`mintAsset`) and calls `listAsset` when `NEXT_PUBLIC_RWA_TOKEN_ADDRESS` and `NEXT_PUBLIC_RWA_MARKETPLACE_ADDRESS` are set and a wallet is connected.
- **Local fallback:**: If contracts or wallet are not available, listings are saved to `localStorage` and appear in the marketplace immediately.
- **Buy flow:**: `MarketCard` will attempt on-chain purchases (approve USDC then call `buyAsset`) when contract addresses and MetaMask are available; otherwise it simulates the purchase and removes a locally-saved listing.

**Important files:**
- **`src/components/SellForm.js`**: Upload UI + on-chain mint/list logic and local fallback.
- **`src/components/MarketCard.js`**: Buy button (on-chain or local simulation).
- **`src/components/AccountDropdown.js`**: Navigates to `/signin` (redirect Google sign-in handled in `src/lib/firebase.js`).
- **`src/lib/firebase.js`**: Firebase initialization, exports `auth`, `storage`, and redirect sign-in helpers.
- **`src/lib/contracts.js`**: Contract ABIs and helper constructors; expects addresses in env.
- **`src/lib/listings.js`**: localStorage persistence for user listings.
- **`src/app/signin/page.js`**: Dedicated sign-in page.

**Local setup**
- **Install dependencies:**
  - Run: `npm install`
- **Create environment file:**
  - Add a `.env.local` file at the project root with the variables below.
- **Run dev server:**
  - Start: `npm run dev` (the dev server will pick an available port; default is `http://localhost:3000`).

**Recommended `.env.local`** (replace placeholders):
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXX

# Optional: on-chain addresses to enable full on-chain flows
NEXT_PUBLIC_RWA_TOKEN_ADDRESS=0x...   # RWA token contract
NEXT_PUBLIC_RWA_MARKETPLACE_ADDRESS=0x...   # Marketplace contract
NEXT_PUBLIC_USDC_ADDRESS=0x...   # USDC token used for payments
```

**How to test the main flows**
- **Sign in:** Visit `/signin` and use Google sign-in (redirect). After sign-in you'll be returned and `onAuthStateChanged` will update UI.
- **List an asset:** Go to `/sell`, fill the form and choose an image. The image will upload to Firebase Storage. If on-chain addresses are configured and MetaMask is connected, the app will mint and list the token on-chain; otherwise the listing is saved locally.
- **View marketplace:** Visit `/market` to see merged listings (mock + saved). Local listings appear at the top.
- **Buy an asset:** Click `Buy Now` on a listing. If contracts and MetaMask are configured the front-end will attempt to approve USDC (if necessary) and call `buyAsset`. Otherwise the purchase is simulated and a local listing is removed.

**Wallet / network**
- **MetaMask**: Required for on-chain mint/list/buy flows. The app attempts to switch the user to Polygon Mainnet (`0x89`) during wallet connection.

**Notes & next steps**
- **TokenId detection:** The current mint flow uses `totalSupply + 1` as a best-effort tokenId mapping after minting. For reliable token IDs we can parse the mint event from the transaction receipt — I can add that.
- **IPFS / permanence:** Images and metadata are stored in Firebase Storage. If you want permanent, content-addressed storage for NFTs, I can add `web3.storage` or `nft.storage` to pin assets to IPFS.
- **Security:** Firebase Storage files are public for ease of use; if you need restricted access, we should add Firebase Storage security rules.

If you want, I can:
- parse mint receipts for accurate `tokenId`s,
- add IPFS upload (web3.storage) alongside Firebase,
- or tighten Firebase Storage rules.

---

If you'd like any of the next steps implemented now, tell me which one and I'll proceed.
