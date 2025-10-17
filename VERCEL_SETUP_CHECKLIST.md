# ✅ Vercel Deployment Checklist for Ekistia

## Before Deploying

### 1. Get Your Credentials
- [ ] Mapbox Token: https://account.mapbox.com/access-tokens/
- [ ] Supabase URL: https://app.supabase.com/project/_/settings/api
- [ ] Supabase Anon Key: https://app.supabase.com/project/_/settings/api

## Vercel Dashboard Setup

### 2. Import Project
- [ ] Go to https://vercel.com/new
- [ ] Select your GitHub repository: `cliniko/ekistia`
- [ ] Framework: Will auto-detect as **Vite**
- [ ] **DO NOT CLICK DEPLOY YET**

### 3. Add Environment Variables (CRITICAL)
Navigate to: **Settings** → **Environment Variables**

Add these **THREE** variables:

#### Variable 1: VITE_MAPBOX_TOKEN
- **Key**: `VITE_MAPBOX_TOKEN`
- **Value**: `pk.eyJ1IjoieW91cl9tYXBib3hfdXNlcm5hbWUiLCJhIjoi...` (your actual token)
- **Environments**: ✅ Production ✅ Preview ✅ Development
- [ ] Added and Saved

#### Variable 2: VITE_SUPABASE_URL
- **Key**: `VITE_SUPABASE_URL`
- **Value**: `https://xxxxxxxxxxxxx.supabase.co` (your project URL)
- **Environments**: ✅ Production ✅ Preview ✅ Development
- [ ] Added and Saved

#### Variable 3: VITE_SUPABASE_ANON_KEY
- **Key**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your anon key)
- **Environments**: ✅ Production ✅ Preview ✅ Development
- [ ] Added and Saved

### 4. Deploy
- [ ] Click **Deploy** button
- [ ] Wait 2-3 minutes for build to complete
- [ ] Check deployment logs for any errors

## After First Deployment

### 5. Verify Deployment
Open your deployed site and check:

- [ ] Site loads without errors
- [ ] Open browser console (F12)
- [ ] Check for `❌ MAPBOX TOKEN MISSING` error
- [ ] If you see the error → Variables not set correctly

### 6. Test Map Loading
- [ ] Map displays with terrain
- [ ] SAFDZ data loads (colored zones)
- [ ] Can interact with map (zoom, pan, rotate)
- [ ] No console errors

### 7. Test Environment Variables
In browser console on your deployed site, run:
```javascript
console.log('Mapbox:', import.meta.env.VITE_MAPBOX_TOKEN ? 'Present ✓' : 'Missing ✗');
console.log('Supabase:', import.meta.env.VITE_SUPABASE_URL ? 'Present ✓' : 'Missing ✗');
```

**Expected output**:
```
Mapbox: Present ✓
Supabase: Present ✓
```

## Common Issues & Fixes

### Issue 1: Map Not Showing

**Symptom**: Blank white/gray area where map should be

**Fix**:
1. Check browser console for error message
2. Verify environment variables are set in Vercel Dashboard
3. Go to Vercel: Settings → Environment Variables
4. Ensure all three variables are there
5. If missing or incorrect → Add them correctly
6. Go to Deployments → Click "⋮" → Redeploy

### Issue 2: "Token Missing" Error

**Symptom**: Console shows `❌ MAPBOX TOKEN MISSING`

**Fix**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Check if `VITE_MAPBOX_TOKEN` exists
3. If it exists, verify it's set for **Production** environment
4. If missing → Add it with your actual Mapbox token
5. **Redeploy** after adding/changing

### Issue 3: Variables Added But Still Not Working

**Symptom**: Added variables but map still doesn't load

**Fix**:
1. Environment variables only apply to NEW deployments
2. Go to: Deployments tab
3. Find latest deployment
4. Click "⋮" (three dots) → **Redeploy**
5. Wait for new build to complete

### Issue 4: Build Succeeds But Runtime Errors

**Symptom**: Build passes but app crashes when loading

**Fix**:
1. Check browser console for specific error
2. Verify Mapbox token is valid (test on mapbox.com)
3. Ensure token has no extra spaces or quotes
4. Format should be: `pk.eyJ1...` (starts with pk.)

## Validation Checklist

After deployment, verify:

- [ ] No errors in browser console
- [ ] Map renders with 3D terrain
- [ ] SAFDZ zones visible (colored areas)
- [ ] Can zoom, pan, and rotate map
- [ ] Barangay boundaries visible
- [ ] Click on map features works
- [ ] Legend shows correctly
- [ ] Performance is good (<2s initial load)

## Important Notes

⚠️ **CRITICAL**: 
- Environment variables MUST have `VITE_` prefix for Vite projects
- Variables are only exposed to the client if they start with `VITE_`
- Changes to environment variables require a NEW deployment
- **DO NOT** put tokens in vercel.json - use Dashboard UI only

✅ **Best Practices**:
- Use separate tokens for development and production
- Restrict Mapbox token to your domain in Mapbox dashboard
- Never commit actual tokens to Git
- Keep Supabase anon key safe (it's meant to be public-facing)

## Getting Help

If you're still having issues:

1. **Check Build Logs**: 
   - Vercel Dashboard → Deployments → Click on deployment → View Logs
   - Look for environment variable references

2. **Check Runtime Logs**:
   - Vercel Dashboard → Your Project → Logs
   - Filter by Production

3. **Verify Token Format**:
   - Mapbox token: `pk.eyJ1Ijoi...` (starts with pk.)
   - Supabase URL: `https://xxxxx.supabase.co` (full HTTPS URL)
   - Supabase Key: `eyJhbGciOi...` (JWT format)

4. **Test Locally First**:
   ```bash
   # Create .env file locally
   echo "VITE_MAPBOX_TOKEN=your_token" > .env
   echo "VITE_SUPABASE_URL=your_url" >> .env  
   echo "VITE_SUPABASE_ANON_KEY=your_key" >> .env
   
   # Test build
   npm run build
   npm run preview
   ```

## Success Criteria

✅ Your deployment is successful when:
1. Site loads without errors
2. Map displays with terrain
3. SAFDZ data visible
4. No console errors
5. All interactive features work

---

**Need more help?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed troubleshooting guide.

