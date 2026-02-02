# 🚀 Deploying Stockify to Vercel

This guide will walk you through deploying your Stockify application to Vercel for production use.

## 📋 Prerequisites

Before deploying, ensure you have:

1. ✅ A [Vercel account](https://vercel.com/signup) (free tier works)
2. ✅ A [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas/register) for cloud database
3. ✅ Your code pushed to GitHub repository
4. ✅ All environment variables ready (see below)

## 🗄️ Step 1: Set Up MongoDB Atlas

1. **Create a MongoDB Atlas Cluster:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster (free tier M0 is sufficient to start)
   - Choose a cloud provider and region close to your target users

2. **Configure Network Access:**
   - Go to Network Access → Add IP Address
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for Vercel deployment
   - Click "Confirm"

3. **Create Database User:**
   - Go to Database Access → Add New Database User
   - Choose "Password" authentication
   - Create username and strong password
   - Set role as "Atlas admin" or "Read and write to any database"
   - Save credentials securely

4. **Get Connection String:**
   - Go to your cluster → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/`)
   - Replace `<password>` with your actual password
   - Add database name at the end: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/stockify`

## 🔐 Step 2: Prepare Environment Variables

You'll need to set these environment variables in Vercel:

### Backend Variables:
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/stockify

# JWT & Session (generate secure random strings)
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters-long-random-string
SESSION_SECRET=your-super-secure-session-secret-random-string

# Frontend URL (will update after first deployment)
FRONTEND_URL=https://your-app-name.vercel.app

# Server Config
PORT=5000
NODE_ENV=production

# CORS
ALLOWED_ORIGINS=https://your-app-name.vercel.app

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-app-name.vercel.app/api/auth/google/callback
```

### Frontend Variables:
```env
# API URL (will be auto-configured)
VITE_API_URL=https://your-app-name.vercel.app/api

# Optional: Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# App Config
VITE_APP_NAME=Stockify
VITE_APP_VERSION=1.0.0
NODE_ENV=production
```

### 🔑 Generate Secure Secrets:

**Option 1 - PowerShell (Windows):**
```powershell
# Generate JWT_SECRET
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Generate SESSION_SECRET
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Option 2 - Node.js (any OS):**
```javascript
// Run in terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 3 - Online:**
Use [RandomKeygen](https://randomkeygen.com/) for secure random strings

## 📦 Step 3: Deploy to Vercel

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Select your `stockify` repository
   - Click "Import"

3. **Configure Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Output Directory:** `frontend/dist`
   - **Install Command:** `npm install`

4. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add ALL the variables from Step 2 above
   - Make sure to add them one by one
   - Click "Deploy"

5. **Wait for Deployment:**
   - First deployment takes 2-5 minutes
   - Watch the build logs for any errors

6. **Update FRONTEND_URL:**
   - After first deployment, note your Vercel URL (e.g., `stockify-xyz123.vercel.app`)
   - Go to Settings → Environment Variables
   - Update `FRONTEND_URL` to `https://stockify-xyz123.vercel.app`
   - Update `ALLOWED_ORIGINS` to `https://stockify-xyz123.vercel.app`
   - Update `VITE_API_URL` to `https://stockify-xyz123.vercel.app/api`
   - Redeploy (Deployments → click ⋯ → Redeploy)

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
# From project root
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Choose your account
# - Link to existing project? No
# - Project name? stockify (or your preferred name)
# - Directory? ./ 
# - Override settings? No
```

4. **Add Environment Variables:**
```bash
# Add each variable
vercel env add MONGODB_URI production
vercel env add JWT_SECRET production
vercel env add SESSION_SECRET production
# ... add all others
```

5. **Deploy to Production:**
```bash
vercel --prod
```

## ✅ Step 4: Verify Deployment

1. **Test Backend API:**
   - Visit: `https://your-app-name.vercel.app/api/products`
   - Should return JSON response

2. **Test Frontend:**
   - Visit: `https://your-app-name.vercel.app`
   - Should load the landing page

3. **Test Authentication:**
   - Try signing up/logging in
   - Check if JWT tokens work

4. **Test Database Connection:**
   - Create a test product
   - Verify it saves to MongoDB Atlas

## 🔧 Post-Deployment Configuration

### Custom Domain (Optional)

1. **Add Custom Domain:**
   - Go to Project Settings → Domains
   - Add your domain (e.g., `stockify.yourdomain.com`)
   - Update DNS records as instructed
   - Update `FRONTEND_URL` environment variable

### Google OAuth Setup (Optional)

1. **Create Google OAuth App:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-app-name.vercel.app/api/auth/google/callback`

2. **Update Environment Variables:**
   - Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Vercel
   - Add `VITE_GOOGLE_CLIENT_ID` in frontend env vars
   - Redeploy

### Monitoring & Logs

1. **View Logs:**
   - Go to your project in Vercel
   - Click "Deployments" → Select deployment → "Logs"
   - Filter by Function logs or Build logs

2. **Monitor Performance:**
   - Vercel Dashboard shows analytics
   - Set up error tracking (optional: Sentry, LogRocket)

## 🐛 Troubleshooting

### Build Fails

**Error: "Cannot find module"**
```bash
# Solution: Clear build cache
vercel --force
```

**Error: "Environment variable not found"**
- Check all required env vars are set in Vercel dashboard
- Ensure no typos in variable names
- Redeploy after adding variables

### Database Connection Fails

**Error: "MongooseServerSelectionError"**
- Verify MongoDB Atlas connection string
- Ensure IP whitelist includes 0.0.0.0/0
- Check database user has correct permissions
- Verify password has no special characters that need URL encoding

### CORS Errors

**Error: "blocked by CORS policy"**
- Update `ALLOWED_ORIGINS` to include your Vercel URL
- Ensure `FRONTEND_URL` matches your deployment URL
- Redeploy after updating

### API Routes Not Working

**Error: 404 on /api/* routes**
- Check `vercel.json` is in project root
- Verify routes configuration in `vercel.json`
- Ensure backend code exports `module.exports = app`

## 📊 Performance Optimization

1. **Enable Edge Caching:**
   - Add caching headers to static routes
   - Configure in `vercel.json`

2. **Optimize Images:**
   - Use Vercel Image Optimization
   - Compress images before upload

3. **Database Indexing:**
   - Add indexes to frequently queried fields in MongoDB
   - Monitor slow queries in Atlas

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

1. **Production Branch:** `main` or `master`
   - Pushes to this branch deploy to production
   
2. **Development Branch:** `dev`
   - Creates preview deployments
   - Get unique URL for testing

3. **Pull Requests:**
   - Each PR gets its own preview deployment
   - Test before merging

## 📝 Maintenance

### Update Dependencies
```bash
# Update packages
npm update
cd backend && npm update
cd ../frontend && npm update

# Test locally
npm run start:dev

# Push to trigger deployment
git add .
git commit -m "Update dependencies"
git push
```

### Monitor MongoDB Usage
- Check MongoDB Atlas for storage usage
- Upgrade plan if needed
- Set up alerts for quota limits

### Backup Database
```bash
# Using MongoDB Atlas
# Go to Atlas → Clusters → ... → Create Snapshot
# Or use mongodump locally
mongodump --uri="your-connection-string" --out=./backup
```

## 🎉 Success!

Your Stockify application is now live and production-ready!

**Next Steps:**
- Add your live URL to your CV/resume
- Share with potential employers
- Continue adding features
- Monitor user feedback

**Live URLs to include in CV:**
- Production App: `https://your-app-name.vercel.app`
- GitHub Repo: `https://github.com/Princelad/stockify`
- API Docs: `https://your-app-name.vercel.app/api/products/test/routes`

---

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review MongoDB Atlas metrics
3. Check browser console for frontend errors
4. Review GitHub Issues in the repository

**Common Resources:**
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
