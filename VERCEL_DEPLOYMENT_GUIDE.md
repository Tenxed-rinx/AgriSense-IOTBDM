# How to Deploy AgriSense IoT to Vercel (Step-by-Step Guide)

This guide walks you through deploying your **AgriSense IoT & Soil Intelligence System** to [Vercel](https://vercel.com) with full support for the **Vite React frontend** and the **Serverless Gemini AI API backend**.

---

## ⚡ What We Have Configured for You

Your codebase is now 100% pre-configured for Vercel:
1. **`vercel.json`**: Directs Vercel to build the frontend to `dist/`, routes all `/api/*` endpoints to the serverless function, and provides SPA routing for the client.
2. **`api/index.ts`**: Serverless function entry point exporting your Express API (diagnostics, AI agronomist chat, and IoT big data generator).
3. **`.npmrc`**: Configured with `legacy-peer-deps=true` so Vercel's `npm install` never errors out on strict peer dependency resolution.
4. **`npm run build`**: Runs `vite build` cleanly with zero errors.

---

## Method 1: Deploy via GitHub (Recommended & Easiest)

This method connects Vercel to your GitHub repository so that every commit automatically builds and deploys.

### Step 1: Push your Code to GitHub
Open your terminal inside your project folder and run:

```bash
# Initialize git if not already initialized
git init

# Stage all files
git add .

# Create your commit
git commit -m "Configure AgriSense for Vercel deployment"

# Rename branch to main
git branch -M main

# Add your remote GitHub repository (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/agrisense-iot.git

# Push to GitHub
git push -u origin main
```

---

### Step 2: Import into Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new) and log in with your GitHub account.
2. Under **"Import Git Repository"**, find your `agrisense-iot` repository and click **Import**.
3. Vercel will automatically detect the settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

---

### Step 3: Add Your Environment Variables (Important!)

Before clicking **Deploy**, expand the **"Environment Variables"** section in Vercel:

| Key | Value | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | `your_actual_gemini_api_key` | Enables real-time AI Soil Doctor & Agronomist Chat via Gemini Flash |

> **Note:** If you don't add the `GEMINI_API_KEY`, the app will automatically fall back to its built-in offline scientific agronomy engine, so it will still work smoothly without crashing!

---

### Step 4: Click Deploy!

Click the **Deploy** button. Vercel will:
- Install dependencies (`npm install`)
- Build the client (`vite build`)
- Package `/api/index.ts` into a fast, auto-scaling Serverless Function
- Provide you with a live URL (e.g. `https://agrisense-iot-delta.vercel.app`)

---

## Method 2: Deploy directly via Vercel CLI (Quick Terminal Deploy)

If you don't want to push to GitHub first, you can deploy straight from your local terminal using the Vercel CLI:

```bash
# 1. Install the Vercel CLI globally
npm install -g vercel

# 2. Log in to your Vercel account
vercel login

# 3. Deploy to preview
vercel

# Answer the prompts (defaults are correct):
# ? Set up and deploy? [Y/n] y
# ? Which scope? [your-account]
# ? Link to existing project? [y/N] n
# ? What's your project's name? agrisense-iot
# ? In which directory is your code located? ./

# 4. Add your Gemini API key to Vercel
vercel env add GEMINI_API_KEY

# 5. Deploy to Production
vercel --prod
```

---

## 🔍 How to Test Your Deployed Site

Once your deployment is complete, verify both parts:

1. **Frontend**: Open `https://your-project-name.vercel.app` in your browser.
   - Adjust the soil sliders (moisture, temperature, humidity, pH).
   - Check the **"What Your Soil is Saying"** analysis and the **"Best Crops to Plant"** rankings.
   - Open the **"Field Big Data Hub"** and inspect the 5 features (Hardpan compaction, GDD harvest predictor, Water budget, Fleet drift, Off-peak electricity).

2. **API Backend**: Visit `https://your-project-name.vercel.app/api/health` in your browser.
   - You should see:
     ```json
     {
       "status": "ok",
       "geminiConfigured": true,
       "timestamp": "2026-...",
       "platform": "vercel-serverless"
     }
     ```

---

## 🛠️ Common Questions & Troubleshooting

### Q1: Do I need a credit card on Vercel?
**No.** Vercel offers a generous free Hobby tier that supports unlimited hobby deployments, free SSL certificates, and serverless API execution.

### Q2: How do custom domains work?
In the Vercel Dashboard, go to **Settings > Domains**, type your custom domain (e.g. `agrisense.farm`), and follow Vercel's DNS instructions (pointing a CNAME record).

### Q3: How do automatic updates work?
Whenever you `git push` to your `main` branch, Vercel will automatically re-build and publish the latest version in under 60 seconds.
