# MyShopApp — React Native + MySQL

A full-stack mobile app built with React Native (Expo) and Node.js + MySQL backend.

## Project Structure


## Prerequisites
- Node.js >= 18
- MySQL Workbench
- Expo Go app on Android

## Backend Setup
```bash
cd backend
npm install
# Create .env file with your DB credentials
npm run dev
```

## Mobile Setup
```bash
cd mobile
npm install
# Update api/products.js with your PC's IP
npx expo start --clear
```

## Environment Variables (backend/.env)