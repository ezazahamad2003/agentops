# 🚀 Deploying AgentOps Frontend to Vercel

This guide will walk you through deploying your AgentOps frontend to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (free)
- Your backend API deployed and accessible
- Git repository with your code

## Quick Deploy (Recommended)

### Option 1: Deploy via Vercel Dashboard

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

3. **Click "Add New Project"**

4. **Import your GitHub repository**
   - Select the `frontend` folder as the root directory
   - Or if your entire repo is the frontend, select the repo root

5. **Configure the project:**
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `build` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

6. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add: `REACT_APP_API_URL` = `https://your-backend-url.com`
   - Make sure to use your actual backend URL

7. **Click "Deploy"**
   - Vercel will build and deploy your app
   - You'll get a URL like `your-app.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from the frontend directory**
   ```bash
   cd c:\Users\ezaza\Desktop\gentops\frontend
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy: `Y`
   - Which scope: Choose your account
   - Link to existing project: `N` (first time)
   - Project name: `agentops-frontend`
   - Directory: `./` (current directory)
   - Override settings: `N`

5. **Add environment variables:**
   ```bash
   vercel env add REACT_APP_API_URL
   ```
   - Select "Production"
   - Enter your backend URL: `https://your-backend-url.com`

6. **Deploy to production:**
   ```bash
   vercel --prod
   ```

## Environment Variables

Make sure to set these in Vercel:

| Variable | Value | Description |
|----------|-------|-------------|
| `REACT_APP_API_URL` | `https://your-backend-url.com` | Your backend API URL |

## Custom Domain (Optional)

1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## Automatic Deployments

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you push to other branches or open PRs

## Troubleshooting

### Build Fails

**Issue**: Build command fails
```bash
# Solution: Make sure all dependencies are in package.json
npm install
npm run build  # Test locally first
```

**Issue**: Environment variables not working
```bash
# Solution: Make sure variables are prefixed with REACT_APP_
# In Vercel, add them in Settings → Environment Variables
```

### API Connection Issues

**Issue**: Frontend can't connect to backend
```bash
# Solution: Check CORS settings in your backend
# Make sure your backend allows requests from your Vercel domain
```

### Routing Issues

**Issue**: Page refresh returns 404
```bash
# Solution: The vercel.json file handles this
# Make sure it's in your frontend directory
```

## Post-Deployment Checklist

- [ ] Site loads correctly at Vercel URL
- [ ] All routes work (try refreshing on different pages)
- [ ] Login/Register functionality works
- [ ] API calls connect to backend successfully
- [ ] Dark theme displays correctly
- [ ] All buttons and animations work
- [ ] Monitor page displays data
- [ ] Documentation page loads

## Update Backend CORS

Make sure your backend allows requests from your Vercel domain:

```python
# In your backend, update CORS settings
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://your-app.vercel.app",
    "https://your-custom-domain.com"  # if you have one
]
```

## Monitoring Deployments

- **Deployment Logs**: Available in Vercel Dashboard
- **Runtime Logs**: Check Vercel Functions logs
- **Analytics**: Enable Vercel Analytics in project settings

## Useful Commands

```bash
# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Remove deployment
vercel rm <deployment-url>

# Link local project to Vercel project
vercel link
```

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Discord](https://vercel.com/discord)
- [Create React App Deployment Guide](https://create-react-app.dev/docs/deployment/)

## Quick Reference

**Vercel Dashboard**: https://vercel.com/dashboard
**CLI Docs**: https://vercel.com/docs/cli
**Environment Variables**: https://vercel.com/docs/environment-variables

---

🎉 **Congratulations!** Your AgentOps frontend is now deployed and accessible worldwide!
