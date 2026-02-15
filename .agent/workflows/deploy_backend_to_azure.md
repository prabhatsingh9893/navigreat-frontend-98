---
description: Deploy Backend to Azure App Service
---

# Deploying Navigreat Backend to Azure App Service

You have confirmed you have Azure credits ($100). We will use these to host your backend on a **Standard (B1)** or **Basic** tier so it **never sleeps** (unlike Render/Glitch).

## Step 1: Create the Web App in Azure
1.  Go to the [Azure Portal](https://portal.azure.com).
2.  Search for **"App Services"** in the top search bar and click it.
3.  Click **+ Create** -> **+ Web App**.
4.  Fill in the **Basics** tab:
    *   **Subscription**: Select "Azure for Students".
    *   **Resource Group**: Click "Create new" and name it `navigreat-rg`.
    *   **Name**: `navigreat-backend-98` (or something unique).
    *   **Publish**: Select "Code".
    *   **Runtime stack**: Select **Node 20 LTS**.
    *   **Operating System**: Select **Linux**.
    *   **Region**: Select **Central India** (or closest to you).
    *   **Pricing Plan**:
        *   Click "Change size" (or "Explore pricing plans").
        *   Select **Basic B1** (Recommended). This costs ~$12/month, covered by your $100 credits. It has dedicated performance and won't sleep.
        *   *If you want to save credits, you can choose Free F1, but it might be slow.*

## Step 2: Connect GitHub Repository
1.  Go to the **Deployment** tab (at the top).
2.  **Continuous deployment**: Enable (On).
3.  **Source**: Select **GitHub**.
4.  **Authorize**: Log in to your GitHub account if asked.
5.  **Organization**: Select your username (`prabhatsingh9893`).
6.  **Repository**: Select `navigreat-backend-98`.
7.  **Branch**: Select `main`.
8.  Click **Review + create** at the bottom, then click **Create**.
9.  Wait for the deployment to finish (approx. 2-5 minutes).

## Step 3: Configure Environment Variables
**Critical Step:** Your app will crash if you don't do this, because it needs your secrets (MongoDB URI, Cloudinary keys, etc.).

1.  Once the resource is created, click **Go to resource**.
2.  On the left sidebar, under **Settings**, click on **Environment variables**.
3.  Click **+ Add** for EACH variable in your local `.env` file.
    *   Open your local `.env` file in VS Code to see the values.
    *   Add the following (Name -> Value):
        *   `MONGO_URI` -> (Your MongoDB connection string)
        *   `JWT_SECRET` -> (Your secret key)
        *   `CLOUDINARY_CLOUD_NAME` -> (Your cloud name)
        *   `CLOUDINARY_API_KEY` -> (Your api key)
        *   `CLOUDINARY_API_SECRET` -> (Your api secret)
        *   `ZOOM_CLIENT_ID` -> (Your zoom key)
        *   `ZOOM_CLIENT_SECRET` -> (Your zoom secret)
        *   `PORT` -> `8080` (Optional, Azure sets this automatically, but good to have)
4.  Click **Apply** -> **Confirm** at the top.

## Step 4: Verify Deployment
1.  Go to the **Overview** (left sidebar).
2.  Click the **Default domain** URL (e.g., `https://navigreat-backend-98.azurewebsites.net`).
3.  You should see: `Navigreat Backend is Running! 🚀 | MongoDB Status: Connected`.

## Step 5: Update Frontend
Once the backend is running, you need to tell your frontend to use this new URL.
1.  Go to your frontend project.
2.  Open `src/config.js` or `.env`.
3.  Update the `API_BASE_URL` to your new Azure URL (e.g., `https://navigreat-backend-98.azurewebsites.net/api`).
