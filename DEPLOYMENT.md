# 🚀 Deploying Ekistia to Vercel

## Prerequisites

Before deploying, you'll need:
1. A [Vercel](https://vercel.com) account
2. A [Mapbox](https://account.mapbox.com/access-tokens/) access token
3. Your [Supabase](https://app.supabase.com) project credentials

## Environment Variables Setup

### Required Environment Variables

Add these environment variables in your Vercel project settings:

```bash
VITE_MAPBOX_TOKEN=your_mapbox_token_here
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### How to Add Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: `VITE_MAPBOX_TOKEN`
   - **Value**: Your Mapbox token from https://account.mapbox.com/access-tokens/
   - **Environment**: Select all (Production, Preview, Development)
4. Repeat for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
5. Click **Save**
6. **IMPORTANT**: After adding environment variables, **redeploy** your project for changes to take effect

> ⚠️ **Critical Note**: Vercel does NOT use the `@variable_name` syntax from vercel.json. You must add the actual environment variables directly in the Vercel Dashboard settings.

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard

1. **Import Project**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite project

2. **Configure Build Settings** (usually auto-detected)
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Add Environment Variables**
   - Follow the steps above to add all required variables

4. **Deploy**
   - Click **Deploy**
   - Wait for build to complete (~2-3 minutes)

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Add environment variables via CLI
vercel env add VITE_MAPBOX_TOKEN production
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# Redeploy with new environment variables
vercel --prod
```

## Troubleshooting

### Map Not Loading

**Symptom**: Blank map or error in console

**Common Causes & Solutions**:

1. **Missing Environment Variable**
   - Check browser console for: `❌ MAPBOX TOKEN MISSING`
   - Verify `VITE_MAPBOX_TOKEN` is set in Vercel Dashboard
   - Ensure it's set for **Production** environment
   - **Must redeploy** after adding variables

2. **Environment Variables Not Exposed to Client**
   - Vite requires `VITE_` prefix for client-side variables
   - Verify your token starts with `VITE_MAPBOX_TOKEN` (not just `MAPBOX_TOKEN`)
   - Check build logs to ensure variables are being loaded

3. **Vercel Configuration**
   - **Do NOT use** `@variable_name` syntax in vercel.json
   - Environment variables must be added in **Vercel Dashboard UI**
   - After adding variables, **trigger a new deployment**

4. **Validation Steps**:
   ```bash
   # In browser console on deployed site:
   console.log(import.meta.env.VITE_MAPBOX_TOKEN ? 'Token present' : 'Token missing');
   ```

5. **Quick Fix**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `VITE_MAPBOX_TOKEN` = `your_actual_token_here`
   - Select: Production, Preview, Development
   - Go to Deployments → Redeploy latest deployment

### Build Fails

**Symptom**: Build error during deployment
**Solution**:
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Run `npm run build` locally to test

### SAFDZ Data Not Loading

**Symptom**: Agricultural zones don't appear
**Solution**:
1. Check that `/public/safdz_agri_barangays.geojson` exists
2. Verify the file size is reasonable (<10MB)
3. Check Network tab in browser DevTools for 404 errors

### Environment Variables Not Working

**Symptom**: Variables are undefined in production
**Solution**:
1. Ensure variable names start with `VITE_` prefix
2. Redeploy after adding variables (changes require new deployment)
3. Check that variables are set for **Production** environment
4. Clear browser cache and hard refresh

## Vercel Configuration

The project includes a `vercel.json` file with optimized settings:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

## Performance Optimization

### Automatic Optimizations by Vercel:
- ✅ Global CDN distribution
- ✅ Automatic HTTPS
- ✅ Compression (Brotli/Gzip)
- ✅ Image optimization
- ✅ Edge caching

### Custom Optimizations in Code:
- ✅ SAFDZ data caching (instant subsequent loads)
- ✅ Lazy loading of map layers
- ✅ Optimized GeoJSON parsing
- ✅ Efficient layer rendering

## Monitoring

After deployment:
1. Check **Vercel Analytics** for performance metrics
2. Monitor **Function Logs** for any runtime errors
3. Test map functionality from different locations
4. Verify all environment-dependent features work

## Domain Configuration

To use a custom domain:
1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5-60 minutes)

## Continuous Deployment

Once connected to GitHub:
- **Production**: Automatic deployment on push to `main` branch
- **Preview**: Automatic deployment for pull requests
- **Development**: Manual deployments via CLI

## Getting Help

If you encounter issues:
1. Check [Vercel Documentation](https://vercel.com/docs)
2. Review [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
3. Check browser console for specific error messages
4. Review Vercel build logs in the dashboard

---

## Quick Checklist

Before deploying, ensure:
- [ ] Mapbox token is valid and added to Vercel
- [ ] Supabase credentials are added to Vercel
- [ ] Build succeeds locally with `npm run build`
- [ ] All public assets (GeoJSON files) are in `/public` folder
- [ ] No hardcoded localhost URLs in code
- [ ] Environment variables use `VITE_` prefix

Your Ekistia deployment should now be live! 🎉

