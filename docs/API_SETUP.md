
# ⚽ API-Sports Setup Guide

To enable live sports markets (like automatic Premier League or NBA games), you need a free API Key from **API-Sports (API-Football)**.

## 1. Register
Go to the dashboard registration page:
👉 **[https://dashboard.api-football.com/register](https://dashboard.api-football.com/register)**

*   Sign up with Email or Google/Github.
*   It is **Free** (100 requests/day), which is plenty for testing.

## 2. Get Your Key
1.  Login to the **[Dashboard](https://dashboard.api-football.com/)**.
2.  Go to **Account** > **My Access**.
3.  Look for the **API Key** field.
4.  Click "Copy".

## 3. Configure Your Project
1.  Open the file `contracts/.env` in your editor.
2.  Add a new line at the bottom:
    ```env
    SPORTS_API_KEY=your_copied_key_here
    ```
3.  Save the file.

## 4. Run the Updates
Once configured, you can test the integration by running:
```bash
# In the contracts directory
npx hardhat run scripts/autoUpdateMarkets.js --network arcTestnet
```
