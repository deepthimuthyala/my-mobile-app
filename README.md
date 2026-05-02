# MyShopApp — React Native + Node.js + MySQL

A full-stack Android mobile app built with React Native (Expo SDK 54), Node.js + Express backend, and MySQL database.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Project Structure](#project-structure)
3. [Tech Stack](#tech-stack)
4. [Prerequisites](#prerequisites)
5. [Database Setup](#database-setup)
6. [Backend Setup](#backend-setup)
7. [Mobile Setup](#mobile-setup)
8. [Running the Project Locally](#running-the-project-locally)
9. [API Endpoints](#api-endpoints)
10. [Dependencies](#dependencies)
11. [Environment Variables](#environment-variables)
12. [Expo / Android Config](#expo--android-config)
13. [Building APK](#building-apk)
14. [Google Play Store Deployment](#google-play-store-deployment)
15. [Hosting Backend Online](#hosting-backend-online)
16. [Common Errors & Fixes](#common-errors--fixes)
17. [Future Features](#future-features)
18. [Important Notes](#important-notes)
19. [Quick Start Cheat Sheet](#quick-start-cheat-sheet)

---

## Project Overview

MyShopApp is a mobile application that allows users to view, add, and delete products. The app is connected to a real MySQL database via a REST API backend built with Express.js.

**What it does:**
- Fetches product data from MySQL database and displays it on the mobile screen
- Allows adding new products via a modal form
- Allows deleting products with confirmation
- Pull-to-refresh to reload latest data from backend

---

## Project Structure

```
my-app/
├── backend/                    → Node.js + Express + MySQL API
│   ├── server.js               → Main server file with all routes
│   ├── db.js                   → MySQL connection pool
│   ├── .env                    → Environment variables (DO NOT COMMIT)
│   ├── .gitignore
│   └── package.json
│
├── mobile/                     → React Native Expo App
│   ├── App.js                  → Root component with navigation setup
│   ├── app.json                → Expo app configuration
│   ├── babel.config.js         → Babel configuration
│   ├── eas.json                → EAS Build configuration
│   ├── package.json
│   ├── api/
│   │   └── products.js         → All API call functions (fetch/create/delete)
│   └── screens/
│       └── ProductsScreen.js   → Main products list screen UI
│
├── database/
│   └── schema.sql              → MySQL table creation + seed data
│
└── README.md
```

---

## Tech Stack

| Layer       | Technology              | Version        |
|-------------|-------------------------|----------------|
| Mobile      | React Native            | 0.81.4         |
| Framework   | Expo SDK                | 54.0.0         |
| React       | React                   | 19.1.0         |
| Backend     | Node.js + Express       | Express 4.18.2 |
| Database    | MySQL                   | 8.x            |
| DB Client   | mysql2                  | 3.6.0          |
| Build Tool  | EAS (Expo App Services) | Latest         |

---

## Prerequisites

Make sure you have the following installed before setting up the project:

| Tool              | Download Link                               | Purpose                        |
|-------------------|---------------------------------------------|--------------------------------|
| Node.js >= 18     | https://nodejs.org                          | Run backend and Expo CLI       |
| MySQL Workbench   | https://dev.mysql.com/downloads/workbench/  | Manage local MySQL database    |
| Git               | https://git-scm.com                         | Version control                |
| Expo Go (Android) | Google Play Store → search "Expo Go"        | Test app on real Android device|
| EAS CLI           | `npm install -g eas-cli`                    | Build APK / AAB files          |

**Accounts needed:**

| Account            | Link                                    | Cost        | Purpose                   |
|--------------------|-----------------------------------------|-------------|---------------------------|
| GitHub             | https://github.com                      | Free        | Code hosting              |
| Expo               | https://expo.dev/signup                 | Free        | Build APK using EAS       |
| Google Play Console| https://play.google.com/console         | $25 one-time| Publish to Play Store     |

---

## Database Setup

**Step 1 — Open MySQL Workbench and connect to your local MySQL server.**

**Step 2 — Run the following SQL** (also available in `database/schema.sql`):

```sql
CREATE DATABASE IF NOT EXISTS myappdb;
USE myappdb;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  price DECIMAL(10, 2),
  stock INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products (name, category, price, stock) VALUES
('iPhone 15 Pro', 'Electronics', 134900.00, 25),
('Samsung Galaxy S24', 'Electronics', 79999.00, 40),
('Nike Air Max', 'Footwear', 12999.00, 100),
('Levi\'s 501 Jeans', 'Clothing', 4999.00, 200),
('Sony WH-1000XM5', 'Electronics', 29990.00, 60),
('Adidas Running Shoes', 'Footwear', 8499.00, 80),
('Apple Watch Series 9', 'Electronics', 41900.00, 35),
('Cotton T-Shirt', 'Clothing', 999.00, 500);
```

**Step 3 — Verify data loaded:**
```sql
USE myappdb;
SELECT * FROM products;
```
You should see 8 rows.

---

## Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=myappdb
PORT=3001
```

> ⚠️ Replace `your_mysql_password` with your actual MySQL root password set during MySQL installation.

---

## Mobile Setup

```bash
cd mobile
npm install --legacy-peer-deps
```

**Find your PC's WiFi IP address:**

```cmd
# Windows - run in Command Prompt
ipconfig
# Look for → Wireless LAN adapter Wi-Fi → IPv4 Address
# Example: 192.168.31.33
```

**Update `mobile/api/products.js`:**
```js
const BASE_URL = 'http://YOUR_WIFI_IP:3001/api';
// Example: const BASE_URL = 'http://192.168.31.33:3001/api';
```

> ⚠️ Every time you change WiFi networks your IP will change. Update this file and restart Expo.

---

## Running the Project Locally

Always start **backend first**, then the **mobile app**.

**Terminal 1 — Start Backend:**
```bash
cd backend
npm run dev
```
Expected output:
```
✅ Backend running at http://0.0.0.0:3001
✅ Test ping at: http://192.168.31.33:3001/api/ping
```

**Terminal 2 — Start Mobile App:**
```bash
cd mobile
set REACT_NATIVE_PACKAGER_HOSTNAME=YOUR_WIFI_IP && npx expo start --clear
```
Example:
```bash
set REACT_NATIVE_PACKAGER_HOSTNAME=192.168.31.33 && npx expo start --clear
```

Expected terminal output:
```
› Metro waiting on exp://192.168.31.33:8081
› Scan the QR code above with Expo Go
```

**On Android phone:**
- Open **Expo Go** app
- Scan the QR code shown in terminal
- App loads and shows products from MySQL ✅

**If you face network errors, use tunnel mode:**
```bash
npx expo start --tunnel --clear
```

**Verify backend is reachable from phone browser:**
```
http://YOUR_WIFI_IP:3001/api/ping
```
Should return: `{ "success": true, "message": "Backend is alive!" }`

---

## API Endpoints

Base URL (local): `http://YOUR_WIFI_IP:3001`

| Method | Endpoint           | Description        | Request Body                        |
|--------|--------------------|--------------------|-------------------------------------|
| GET    | /api/ping          | Health check       | None                                |
| GET    | /api/products      | Get all products   | None                                |
| GET    | /api/products/:id  | Get one product    | None                                |
| POST   | /api/products      | Create a product   | `{ name, category, price, stock }`  |
| DELETE | /api/products/:id  | Delete a product   | None                                |

**Example POST body:**
```json
{
  "name": "MacBook Pro",
  "category": "Electronics",
  "price": 199900.00,
  "stock": 10
}
```

**Example success response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "iPhone 15 Pro",
      "category": "Electronics",
      "price": "134900.00",
      "stock": 25,
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Dependencies

### Mobile (`mobile/package.json`)

| Package                        | Version    | Purpose                           |
|--------------------------------|------------|-----------------------------------|
| expo                           | ~54.0.0    | Expo SDK core                     |
| expo-status-bar                | ~2.2.0     | Control device status bar         |
| react                          | 19.1.0     | React core library                |
| react-native                   | 0.81.4     | React Native core                 |
| @react-navigation/native       | ^7.0.14    | Navigation container              |
| @react-navigation/stack        | ^7.1.1     | Stack screen navigator            |
| react-native-screens           | ~4.4.0     | Native screen performance boost   |
| react-native-safe-area-context | ~5.6.0     | Handles notch and navbar safely   |
| react-native-gesture-handler   | ~2.28.0    | Touch and gesture support         |
| @expo/vector-icons             | ^14.0.4    | Icon library (Ionicons, etc.)     |

**Mobile Dev Dependencies:**

| Package       | Version   | Purpose               |
|---------------|-----------|-----------------------|
| @babel/core   | ^7.25.0   | JavaScript transpiler |

### Backend (`backend/package.json`)

| Package   | Version    | Purpose                          |
|-----------|------------|----------------------------------|
| express   | ^4.18.2    | HTTP server and API routing      |
| mysql2    | ^3.6.0     | MySQL driver for Node.js         |
| cors      | ^2.8.5     | Allow requests from mobile app   |
| dotenv    | ^17.4.2    | Load .env environment variables  |

**Backend Dev Dependencies:**

| Package   | Version   | Purpose                      |
|-----------|-----------|------------------------------|
| nodemon   | ^3.0.1    | Auto-restart server on save  |

---

## Environment Variables

**`backend/.env`** — Never commit this file to Git!

| Variable     | Description           | Example value     |
|--------------|-----------------------|-------------------|
| DB_HOST      | MySQL host            | localhost         |
| DB_USER      | MySQL username        | root              |
| DB_PASSWORD  | MySQL password        | yourpassword      |
| DB_NAME      | MySQL database name   | myappdb           |
| PORT         | Backend server port   | 3001              |

If you clone this project on a new machine, create the `.env` file manually with your own credentials.

---

## Expo / Android Config

**`mobile/app.json`:**

| Property              | Value                   | Notes                                     |
|-----------------------|-------------------------|-------------------------------------------|
| App Name              | MyShopApp               | Display name shown on device              |
| Slug                  | myshopapp               | Unique Expo project identifier            |
| Version               | 1.0.0                   | App version shown in Play Store           |
| Expo SDK Version      | 54.0.0                  | Must match expo package in package.json   |
| Orientation           | Portrait                | Screen locked to portrait mode            |
| Android Package       | com.yourname.myshopapp  | Unique app ID — cannot change after publish |
| usesCleartextTraffic  | true                    | Allows HTTP calls (local dev only)        |
| iOS Tablet Support    | true                    |                                           |

> ⚠️ `android.package` cannot be changed after you publish to Play Store. Choose your final name before first publish.

> ⚠️ Remove `usesCleartextTraffic: true` when going to production and switch backend to HTTPS.

---

## Building APK

**Step 1 — Create Expo account:**
```
https://expo.dev/signup
```

**Step 2 — Login via terminal:**
```bash
eas login
```

**Step 3 — Configure EAS (first time only):**
```bash
cd mobile
eas build:configure
```

**Step 4 — Make sure `eas.json` exists in mobile folder:**
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

**Step 5 — Build APK (direct install on any Android phone):**
```bash
eas build -p android --profile preview
```
- Builds on Expo cloud servers (~15–20 minutes)
- You get a download link for the `.apk` file
- Send to any Android phone and install directly

**Step 6 — Build AAB (for Google Play Store):**
```bash
eas build -p android --profile production
```

---

## Google Play Store Deployment

1. Create Google Play Developer account ($25 one-time)
   → https://play.google.com/console

2. Build production AAB:
   ```bash
   eas build -p android --profile production
   ```

3. In Play Console:
   - Create new app → fill in app name and language
   - Go to **Production → Create new release**
   - Upload `.aab` file
   - Fill store listing: description, screenshots (min 2), feature graphic, icon
   - Add Privacy Policy URL (required — use https://www.privacypolicygenerator.info for a free one)
   - Set content rating via questionnaire
   - Submit for review

4. First review takes **1–3 business days**.
5. After approval, your app is live on Play Store.

> ⚠️ Before Play Store release, host your backend online with HTTPS. See below.

---

## Hosting Backend Online

For production and Play Store, your backend must be hosted on a cloud server (not your PC).

**Recommended free platforms:**

| Platform    | Free Tier | Link                       | Notes                         |
|-------------|-----------|----------------------------|-------------------------------|
| Railway     | Yes       | https://railway.app        | Easiest, supports MySQL add-on|
| Render      | Yes       | https://render.com         | Free Node.js hosting          |
| PlanetScale | Yes       | https://planetscale.com    | MySQL-compatible cloud DB     |
| Supabase    | Yes       | https://supabase.com       | If switching to PostgreSQL    |

**Steps to deploy backend on Railway:**

1. Push backend code to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub repo
3. Select your repo and point to the `backend/` folder
4. Add environment variables in Railway dashboard (same as your `.env`)
5. Railway gives a public URL: `https://myapp-production.up.railway.app`
6. Update `mobile/api/products.js`:
   ```js
   const BASE_URL = 'https://myapp-production.up.railway.app/api';
   ```
7. Remove `usesCleartextTraffic: true` from `app.json`
8. Rebuild APK with `eas build -p android --profile production`

---

## Common Errors & Fixes

| Error Message | Cause | Fix |
|---------------|-------|-----|
| `exp://127.0.0.1:8081` in terminal | Expo using localhost instead of WiFi IP | Run `set REACT_NATIVE_PACKAGER_HOSTNAME=YOUR_IP && npx expo start` |
| `Failed to download remote update` | Phone cannot reach PC on network | Use `npx expo start --tunnel --clear` |
| `SDK mismatch` on Expo Go | Expo Go version doesn't match project SDK | Update Expo Go from Play Store to latest |
| `Network error` fetching products | Wrong IP in `api/products.js` | Run `ipconfig`, update IP in `api/products.js` |
| `ERR_PACKAGE_PATH_NOT_EXPORTED` | Package version conflict in node_modules | Delete `node_modules`, run `npm install --legacy-peer-deps` |
| `Runtime not ready` on phone | SDK version mismatch | Make sure `app.json` sdkVersion matches expo package version |
| `Connection refused` on backend | Backend server not running | Run `npm run dev` in `backend/` folder |
| `Access denied` for MySQL | Wrong DB credentials in `.env` | Check DB_USER and DB_PASSWORD in `.env` |
| `cleartext not permitted` Android error | Android blocking HTTP calls | Add `"usesCleartextTraffic": true` in `app.json` android section |
| `Author identity unknown` on git commit | Git email not configured | Run `git config --global user.email "you@example.com"` |
| `src refspec main does not match` | No commit made yet | Run `git add .` then `git commit -m "message"` before pushing |

---

## Future Features

- [ ] User login and registration (JWT authentication)
- [ ] Product image upload
- [ ] Search and filter products by category
- [ ] Edit existing product screen
- [ ] Dashboard with charts (revenue, stock levels)
- [ ] Pagination for large product lists
- [ ] Push notifications (low stock alerts)
- [ ] Dark / light mode toggle
- [ ] Barcode scanner for products
- [ ] Export data to Excel or PDF
- [ ] Multiple user roles (admin / staff)

---

## Important Notes

1. **IP changes every session** — Every time you reconnect to WiFi, your PC gets a new IP. Update `mobile/api/products.js` and restart Expo.

2. **Same WiFi required** — Phone and PC must be on the exact same WiFi router. Mobile data will not work for local development.

3. **Start backend before mobile** — Always run `npm run dev` in `backend/` first, then start Expo. Otherwise the app shows "network error".

4. **HTTP vs HTTPS** — `usesCleartextTraffic: true` is for local development only. Always use HTTPS with a hosted backend for production.

5. **Never commit `.env`** — Your database password is in `.env`. It is listed in `.gitignore` and must never be pushed to GitHub.

6. **Expo SDK versions must match** — The `sdkVersion` in `app.json` must match the `expo` version in `package.json`. Mismatches cause "Runtime not ready" errors.

7. **Android package name is permanent** — The `android.package` in `app.json` cannot be changed after publishing to Play Store. Choose the final name before first publish.

8. **APK vs AAB** — `.apk` is for direct install on Android. `.aab` (Android App Bundle) is required for Google Play Store submission.

9. **Free EAS build limits** — Expo free tier has limited build minutes per month. Check usage at https://expo.dev/pricing.

10. **MySQL must be running** — Make sure MySQL service is running on your PC before starting the backend. Check in Windows Services or MySQL Workbench.

11. **`--legacy-peer-deps` flag** — Always use this flag when running `npm install` for the mobile project to avoid peer dependency conflicts with React 19.

---

## Quick Start Cheat Sheet

```bash
# 1. Clone the repo
git clone https://github.com/deepthimuthyala/my-mobile-app.git
cd my-mobile-app

# 2. Setup database
# Open MySQL Workbench → run database/schema.sql

# 3. Setup and start backend
cd backend
npm install
# Create backend/.env with your DB credentials
npm run dev

# 4. Setup and start mobile (open new terminal)
cd mobile
npm install --legacy-peer-deps
# Update api/products.js with your WiFi IP (run ipconfig to find it)
set REACT_NATIVE_PACKAGER_HOSTNAME=YOUR_WIFI_IP && npx expo start --clear

# 5. On Android phone → Open Expo Go → Scan QR code → App works!

# 6. If network issues
npx expo start --tunnel --clear

# 7. Build APK when ready
cd mobile
eas login
eas build -p android --profile preview
```

---

*Built with React Native + Expo SDK 54 + Node.js + MySQL*