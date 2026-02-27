# 🚀 PMS Deployment Guide

## Stack

| Layer    | Service       | Cost                 |
| -------- | ------------- | -------------------- |
| Database | MongoDB Atlas | Free (M0 Shared)     |
| Backend  | Render        | Free (750 hrs/month) |
| Frontend | Vercel        | Free                 |

---

## Step 1 — MongoDB Atlas (Cloud Database)

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) → **Create a free account**
2. Create a **New Project** → Create a **Free M0 Cluster** (choose any region)
3. **Database Access** → Add a Database User with Username + Password
4. **Network Access** → Add IP Address → `0.0.0.0/0` (Allow from anywhere)
5. Click **Connect** → **Drivers** → Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/pms-db?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` in the string, then **seed the cloud database**:
   ```bash
   cd pms-backend
   MONGO_URI="mongodb+srv://..." node seed.js
   ```

---

## Step 2 — Backend on Render

1. Push your code to GitHub (see below)
2. Go to [https://render.com](https://render.com) → **New Web Service** → Connect your GitHub repo
3. Set these settings:
   - **Root Directory:** `pms-backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add Environment Variables:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | Your Atlas connection string |
   | `JWT_SECRET` | Any long random string (e.g. 64-char hex) |
   | `PORT` | `5001` |
   | `CORS_ORIGIN` | Your Vercel URL (set after Step 3, e.g. `https://pms.vercel.app`) |
5. Deploy → Your backend URL will be: `https://pms-backend-xxxx.onrender.com`

---

## Step 3 — Frontend on Vercel

1. Go to [https://vercel.com](https://vercel.com) → **Add New Project** → Connect your GitHub repo
2. Set these settings:
   - **Root Directory:** `project-harmony-hub-main`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add Environment Variable:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://pms-backend-xxxx.onrender.com/api` |
4. Deploy → Your frontend URL will be: `https://pms-xxxx.vercel.app`
5. **Go back to Render** and update `CORS_ORIGIN` to your Vercel URL, then **Restart the backend**

---

## Step 4 — Push Code to GitHub

```bash
cd /Users/shubham/Desktop/Shubham/Internship/PMS

# Initialize git repo
git init

# Add all files
git add .

# Commit
git commit -m "Initial deployment setup"

# Push to GitHub (create the repo on github.com first, then:)
git remote add origin https://github.com/YOUR_USERNAME/PMS.git
git branch -M main
git push -u origin main
```

---

## ⚠️ Important Notes

- **Render Free Tier sleeps after 15 min of inactivity** — first request after sleep takes ~30 seconds
- **File uploads** on Render's free tier are **ephemeral** (deleted on restart). For persistent uploads, integrate **Cloudinary** or **AWS S3**
- After seeding the Atlas database once, you don't need to seed again unless you reset it

---

## Default Login Credentials

| Role   | Email               | Password  |
| ------ | ------------------- | --------- |
| Admin  | admin@sandip.edu    | admin123  |
| Mentor | v.b.ohol@sandip.edu | mentor123 |
