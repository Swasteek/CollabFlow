# Quick Start: Connecting to Backend

## Step 1: Configure Environment Variables

Create `.env.local` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_USE_MOCK_API=false
```

**Update the URLs to match your backend server.**

## Step 2: Start Your Backend Server

Make sure your backend is running and accessible at the URLs specified in `.env.local`.

## Step 3: Restart Frontend Dev Server

```bash
npm run dev
```

## Step 4: Test Connection

1. Open browser DevTools → Network tab
2. Try logging in or creating a project
3. Check if API calls are being made to your backend
4. Verify responses in the Network tab

## Switching Between Mock and Real API

**Use Mock Data (for development without backend):**
```env
VITE_USE_MOCK_API=true
```

**Use Real Backend:**
```env
VITE_USE_MOCK_API=false
```

## Common Issues

### CORS Error
- Backend must allow requests from `http://localhost:5174`
- Add CORS middleware to your backend

### 401 Unauthorized
- Check if token is being sent: `Authorization: Bearer <token>`
- Verify token format and expiration

### Connection Refused
- Verify backend server is running
- Check `VITE_API_URL` matches your backend URL
- Ensure backend is accessible

## Full Documentation

See `BACKEND_CONNECTION_GUIDE.md` for complete API specifications and troubleshooting.
