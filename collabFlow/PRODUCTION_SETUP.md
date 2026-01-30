# Production Backend Setup

Your frontend is now configured to connect to your deployed backend on Render.

## ✅ Configuration Complete

Your `.env.local` has been updated with:
- **API URL**: `https://collabflow-ckel.onrender.com/api`
- **Socket URL**: `https://collabflow-ckel.onrender.com`
- **Mock API**: `false` (using real backend)

## 🚀 Next Steps

### 1. Restart Development Server

After updating `.env.local`, you must restart your dev server:

```bash
# Stop current server (Ctrl+C)
npm run dev
```

**Important**: Vite requires a restart to pick up new environment variables.

### 2. Verify Backend is Running

Check if your backend is accessible:
- Visit: `https://collabflow-ckel.onrender.com/api`
- Should return a response (even if it's an error, it means the server is up)

### 3. Test the Connection

1. **Open Browser DevTools** → Network tab
2. **Try to login/signup**
3. **Check Network tab** for API calls to `collabflow-ckel.onrender.com`
4. **Verify responses** are coming from your backend

### 4. Common Issues & Solutions

#### Backend Returns 404
- Check if your backend routes are at `/api/*`
- Verify Render deployment is active (Render free tier spins down after inactivity)

#### CORS Errors
Your backend needs to allow requests from your frontend origin:

```javascript
// In your backend (Express.js)
app.use(cors({
  origin: [
    'http://localhost:5174',  // Dev
    'http://localhost:5173',  // Alternative dev port
    'https://your-frontend-domain.com'  // Production frontend
  ],
  credentials: true
}));
```

#### Socket.io Connection Failed
- Verify Socket.io is enabled on Render
- Check if WebSocket is supported (Render supports it)
- Ensure Socket.io CORS is configured:

```javascript
// In your backend
const io = require('socket.io')(server, {
  cors: {
    origin: [
      'http://localhost:5174',
      'https://your-frontend-domain.com'
    ],
    credentials: true
  }
});
```

#### Render Free Tier Spindown
- Render free tier spins down after 15 minutes of inactivity
- First request after spindown takes ~30-50 seconds
- Consider upgrading to paid tier for always-on service

### 5. Testing Checklist

- [ ] Backend URL accessible in browser
- [ ] Login works
- [ ] Signup works
- [ ] Projects load
- [ ] Create project works
- [ ] Tasks load
- [ ] Socket.io connects (check browser console)
- [ ] Real-time updates work

### 6. Production Frontend Deployment

When deploying your frontend (Vercel, Netlify, etc.):

1. **Set environment variables** in your hosting platform:
   ```
   VITE_API_URL=https://collabflow-ckel.onrender.com/api
   VITE_SOCKET_URL=https://collabflow-ckel.onrender.com
   VITE_USE_MOCK_API=false
   ```

2. **Rebuild** your frontend:
   ```bash
   npm run build
   ```

3. **Update backend CORS** to include your frontend domain:
   ```javascript
   origin: [
     'https://your-frontend-domain.vercel.app',
     'https://your-frontend-domain.netlify.app'
   ]
   ```

## 🔍 Debugging Tips

### Check API Calls
1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Look for requests to `collabflow-ckel.onrender.com`
4. Check request/response details

### Check Socket Connection
1. Open DevTools → Console
2. Look for: `Socket connected: <socket-id>`
3. If you see connection errors, check backend logs on Render

### Check Backend Logs
1. Go to Render dashboard
2. Click on your service
3. View "Logs" tab
4. Check for errors or connection attempts

## 📝 Quick Reference

**Backend URL**: `https://collabflow-ckel.onrender.com`  
**API Base**: `https://collabflow-ckel.onrender.com/api`  
**Socket URL**: `https://collabflow-ckel.onrender.com`

**Test Endpoints:**
- Health check: `https://collabflow-ckel.onrender.com/api`
- Login: `POST https://collabflow-ckel.onrender.com/api/auth/login`
- Projects: `GET https://collabflow-ckel.onrender.com/api/projects` (requires auth)

---

Your frontend is ready to connect! Just restart the dev server and test. 🚀
