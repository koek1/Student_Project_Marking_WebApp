# Deployment Guide - Student Project Marking WebApp

## Production Deployment

### Prerequisites
- GitHub repository with your code
- MongoDB Atlas account (or production MongoDB instance)
- Netlify account (for frontend)
- Railway/Heroku account (for backend)

## 1. Backend Deployment (Railway)

### Step 1: Prepare Backend
1. **Update package.json** (if needed):
   ```json
   {
     "scripts": {
       "start": "node src/server.js",
       "dev": "nodemon src/server.js"
     }
   }
   ```

2. **Create railway.json** (optional):
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm start",
       "healthcheckPath": "/api/health"
     }
   }
   ```

### Step 2: Deploy to Railway
1. **Connect GitHub**:
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Choose "Backend" folder

2. **Configure Environment Variables**:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-marking-app
   JWT_SECRET=your-production-jwt-secret-here
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=production
   FRONTEND_URL=https://your-app.netlify.app
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

3. **Deploy**:
   - Railway will automatically build and deploy
   - Note the generated URL (e.g., `https://your-app.railway.app`)

## 2. Frontend Deployment (Netlify)

### Step 1: Prepare Frontend
1. **Update vite.config.js**:
   ```javascript
   export default defineConfig({
     plugins: [react()],
     server: {
       port: 3000,
       proxy: {
         '/api': {
           target: 'https://your-backend.railway.app',
           changeOrigin: true,
           secure: true
         }
       }
     },
     build: {
       outDir: 'dist',
       sourcemap: false
     }
   });
   ```

2. **Create netlify.toml**:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   
   [build.environment]
     NODE_VERSION = "18"
   ```

### Step 2: Deploy to Netlify
1. **Connect GitHub**:
   - Go to [netlify.com](https://netlify.com)
   - Sign in with GitHub
   - Click "New site from Git"
   - Select your repository
   - Choose "Frontend" folder

2. **Configure Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

3. **Set Environment Variables**:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```

4. **Deploy**:
   - Netlify will build and deploy automatically
   - Note the generated URL (e.g., `https://your-app.netlify.app`)

## 3. Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Cluster
1. **Sign up** at [cloud.mongodb.com](https://cloud.mongodb.com)
2. **Create New Cluster**:
   - Choose free tier (M0)
   - Select region closest to your users
   - Name your cluster

3. **Configure Database Access**:
   - Go to "Database Access"
   - Add new database user
   - Username: `admin`
   - Password: Generate secure password
   - Database User Privileges: "Read and write to any database"

4. **Configure Network Access**:
   - Go to "Network Access"
   - Add IP Address: `0.0.0.0/0` (allow all IPs)
   - Or add specific IPs for security

### Step 2: Get Connection String
1. **Go to "Clusters"**
2. **Click "Connect"**
3. **Choose "Connect your application"**
4. **Copy connection string**:
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/student-marking-app?retryWrites=true&w=majority
   ```
5. **Replace `<password>` with actual password**

## 4. Update Configuration

### Backend Environment Variables
Update your Railway deployment with:
```
MONGODB_URI=mongodb+srv://admin:your-password@cluster0.xxxxx.mongodb.net/student-marking-app?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-for-production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-app.netlify.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables
Update your Netlify deployment with:
```
VITE_API_URL=https://your-backend.railway.app
```

## 5. Domain Configuration (Optional)

### Custom Domain Setup
1. **Buy Domain** (e.g., from Namecheap, GoDaddy)
2. **Configure DNS**:
   - Add CNAME record pointing to your Netlify URL
   - Add CNAME record pointing to your Railway URL
3. **Update Netlify**:
   - Go to "Domain settings"
   - Add custom domain
   - Configure SSL certificate
4. **Update Railway**:
   - Go to "Settings" → "Domains"
   - Add custom domain

## 6. SSL and Security

### SSL Certificates
- **Netlify**: Automatic SSL with Let's Encrypt
- **Railway**: Automatic SSL for custom domains
- **MongoDB Atlas**: SSL enabled by default

### Security Headers
Add to your backend:
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

## 7. Monitoring and Maintenance

### Health Checks
- **Backend**: `https://your-backend.railway.app/api/health`
- **Frontend**: `https://your-app.netlify.app`

### Logs
- **Railway**: View logs in dashboard
- **Netlify**: View build logs and function logs
- **MongoDB Atlas**: View database logs

### Backup Strategy
1. **Database Backups**:
   - MongoDB Atlas automatic backups
   - Manual exports for critical data
2. **Code Backups**:
   - GitHub repository
   - Regular commits and tags

## 8. Performance Optimization

### Frontend Optimization
1. **Build Optimization**:
   ```javascript
   // vite.config.js
   export default defineConfig({
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['react', 'react-dom'],
             router: ['react-router-dom'],
             ui: ['@headlessui/react', 'lucide-react']
           }
         }
       }
     }
   });
   ```

2. **Image Optimization**:
   - Use WebP format
   - Implement lazy loading
   - Optimize image sizes

### Backend Optimization
1. **Database Indexing**:
   ```javascript
   // Add indexes for frequently queried fields
   db.users.createIndex({ email: 1 });
   db.teams.createIndex({ teamNumber: 1 });
   db.scores.createIndex({ judge: 1, team: 1, round: 1 });
   ```

2. **Caching**:
   - Implement Redis for session storage
   - Cache frequently accessed data

## 9. Testing Production Deployment

### Smoke Tests
1. **Frontend Tests**:
   - [ ] Application loads without errors
   - [ ] Login functionality works
   - [ ] All pages are accessible
   - [ ] Forms submit correctly

2. **Backend Tests**:
   - [ ] API endpoints respond correctly
   - [ ] Database connections work
   - [ ] Authentication works
   - [ ] File uploads work

3. **Integration Tests**:
   - [ ] Frontend can communicate with backend
   - [ ] Database operations work
   - [ ] Email notifications work (if implemented)

## 10. Troubleshooting

### Common Issues
1. **CORS Errors**:
   - Check `FRONTEND_URL` in backend
   - Verify domain configuration

2. **Database Connection Issues**:
   - Check MongoDB Atlas network access
   - Verify connection string
   - Check database user permissions

3. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

4. **Performance Issues**:
   - Monitor database query performance
   - Check for memory leaks
   - Optimize images and assets

### Support Resources
- **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
- **Netlify Documentation**: [docs.netlify.com](https://docs.netlify.com)
- **MongoDB Atlas Documentation**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

## 11. Cost Estimation

### Monthly Costs (Approximate)
- **MongoDB Atlas M0**: Free (512MB storage)
- **Railway**: $5/month (hobby plan)
- **Netlify**: Free (100GB bandwidth)
- **Domain**: $10-15/year (optional)

**Total**: ~$5-10/month

## 12. Scaling Considerations

### When to Scale
- **Database**: When approaching 512MB storage limit
- **Backend**: When experiencing high CPU/memory usage
- **Frontend**: When approaching bandwidth limits

### Scaling Options
1. **Database**: Upgrade to M2/M5 cluster
2. **Backend**: Upgrade Railway plan
3. **Frontend**: Upgrade Netlify plan
4. **CDN**: Add CloudFlare for global distribution

---

**Your application is now live and ready for production use!**
