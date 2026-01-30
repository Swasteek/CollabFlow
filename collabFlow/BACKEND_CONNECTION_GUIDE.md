# Backend Connection Guide

This guide will help you connect the CollabFlow frontend to your backend API.

## Quick Start

### 1. Environment Configuration

The frontend uses environment variables to configure the backend URL. Create a `.env.local` file in the root directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api

# WebSocket URL (for real-time features)
VITE_SOCKET_URL=http://localhost:5000

# Set to 'true' to use mock data instead of real API
VITE_USE_MOCK_API=false
```

**Important:** Update `VITE_API_URL` and `VITE_SOCKET_URL` to match your backend server address.

### 2. Enable Real API Calls

By default, the app uses mock data. To connect to your backend:

1. Set `VITE_USE_MOCK_API=false` in `.env.local`
2. Restart your development server (`npm run dev`)

### 3. Backend API Requirements

Your backend should implement the following endpoints:

#### Authentication Endpoints

```
POST /api/auth/login
Body: { email: string, password: string }
Response: { data: { token: string, user: { id, name, email, avatar, role } } }

POST /api/auth/signup
Body: { name: string, email: string, password: string, role?: string }
Response: { data: { token: string, user: { id, name, email, avatar, role } } }

POST /api/auth/logout
Headers: { Authorization: "Bearer <token>" }
Response: { success: true }

GET /api/auth/me
Headers: { Authorization: "Bearer <token>" }
Response: { user: { id, name, email, avatar, role } } or { data: { user: {...} } }
```

#### Projects Endpoints

```
GET /api/projects
Headers: { Authorization: "Bearer <token>" }
Response: { projects: [{ id, name, description, taskCount, activeTaskCount, progress, status, icon, members, updatedAt }] } or { data: [...] }

GET /api/projects/:id
Headers: { Authorization: "Bearer <token>" }
Response: { data: { id, name, description, ... } }

POST /api/projects
Headers: { Authorization: "Bearer <token>" }
Body: { name: string, description?: string, members?: string[] }
Response: { data: { id, name, description, ... } }

PUT /api/projects/:id
Headers: { Authorization: "Bearer <token>" }
Body: { name?: string, description?: string, ... }
Response: { data: { id, name, description, ... } }

DELETE /api/projects/:id
Headers: { Authorization: "Bearer <token>" }
Response: { success: true }

POST /api/projects/:id/invite
Headers: { Authorization: "Bearer <token>" }
Body: { emails: string[] }
Response: { success: true }
```

#### Tasks Endpoints

```
GET /api/projects/:projectId/tasks
Headers: { Authorization: "Bearer <token>" }
Response: { data: { tasks: {}, columns: {}, columnOrder: [] } }

GET /api/tasks/:id
Headers: { Authorization: "Bearer <token>" }
Response: { data: { id, title, description, priority, status, assignee, dueDate, ... } }

POST /api/tasks
Headers: { Authorization: "Bearer <token>" }
Body: { projectId, title, description?, priority?, status?, assignee?, dueDate? }
Response: { data: { id, title, ... } }

PUT /api/tasks/:id
Headers: { Authorization: "Bearer <token>" }
Body: { title?, description?, priority?, status?, assignee?, dueDate? }
Response: { data: { id, title, ... } }

DELETE /api/tasks/:id
Headers: { Authorization: "Bearer <token>" }
Response: { success: true }

PATCH /api/tasks/:id/move
Headers: { Authorization: "Bearer <token>" }
Body: { status: string }
Response: { data: { id, status, ... } }
```

#### Activities Endpoints

```
GET /api/activities/project/:projectId
Headers: { Authorization: "Bearer <token>" }
Query: ?limit=20&skip=0
Response: { activities: [{ id, action, user, task, metadata, createdAt }] } or { data: [...] }
```

### 4. WebSocket Events (Socket.io)

Your backend should emit and listen to these Socket.io events:

#### Client → Server Events

```javascript
// Join project room (user info comes from socket auth token)
socket.emit('project:join', { projectId });

// Leave project room
socket.emit('project:leave', { projectId });

// Task moved (backend calculates oldStatus from current task state)
socket.emit('task:move', { taskId, newStatus, projectId });

// Note: Task create/update/delete are handled via REST API, not Socket.io
// Backend will automatically broadcast these events after REST operations
// Client should NOT emit these events
```

#### Server → Client Events

```javascript
// Task created
socket.on('task:created', (data) => {
  // data: { taskId, projectId, task, username }
});

// Task updated
socket.on('task:updated', (data) => {
  // data: { taskId, updates, projectId, username }
});

// Task moved
socket.on('task:moved', (data) => {
  // data: { taskId, oldStatus, newStatus, projectId, username }
});

// Task deleted
socket.on('task:deleted', (data) => {
  // data: { taskId, projectId, username }
});

// User joined
socket.on('user:joined', (data) => {
  // data: { userId, username, projectId }
});

// User left
socket.on('user:left', (data) => {
  // data: { userId, projectId }
});

// New activity
socket.on('activity:new', (data) => {
  // data: { id, type, user, task, details, timestamp }
});
```

### 5. CORS Configuration

Your backend must allow CORS requests from the frontend. Example for Express.js:

```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5174', // Your Vite dev server URL
  credentials: true
}));
```

### 6. Authentication

The frontend sends JWT tokens in the Authorization header:

```
Authorization: Bearer <token>
```

Your backend should:
1. Validate the token on protected routes
2. Return 401 Unauthorized if token is invalid/expired
3. Extract user info from the token

### 7. Data Format Transformations

**Important**: The frontend uses display-friendly formats that need to be transformed for the backend:

**Status Values:**
- Frontend Display: `'To Do'`, `'In Progress'`, `'Done'`
- Backend API: `'todo'`, `'in_progress'`, `'done'`
- The frontend automatically transforms these values when sending/receiving data

**Priority Values:**
- Frontend Display: `'Low'`, `'Medium'`, `'High'`
- Backend API: `'low'`, `'medium'`, `'high'`
- The frontend automatically transforms these values

**Task Status in Backend:**
- Must be one of: `'todo'`, `'in_progress'`, `'done'` (lowercase with underscore)
- Frontend will send these values automatically

**Task Priority in Backend:**
- Must be one of: `'low'`, `'medium'`, `'high'` (lowercase)
- Frontend will send these values automatically

### 8. Error Response Format

All error responses should follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### 9. Success Response Format

All success responses should follow this format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### 10. Testing the Connection

1. **Start your backend server** (e.g., `npm start` on port 5000)

2. **Update `.env.local`**:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   VITE_USE_MOCK_API=false
   ```

3. **Restart the frontend dev server**:
   ```bash
   npm run dev
   ```

4. **Test authentication**:
   - Try logging in with valid credentials
   - Check browser Network tab for API calls
   - Verify token is stored in localStorage

5. **Test projects**:
   - Create a new project
   - Check if it appears in the dashboard
   - Verify API calls in Network tab

### 11. Troubleshooting

#### CORS Errors
- Ensure your backend allows requests from `http://localhost:5174`
- Check CORS configuration includes credentials

#### 401 Unauthorized
- Verify token is being sent in Authorization header
- Check token format: `Bearer <token>`
- Ensure token hasn't expired

#### Network Errors
- Verify backend server is running
- Check `VITE_API_URL` matches your backend URL
- Ensure backend is accessible (try accessing API URL in browser)

#### WebSocket Connection Failed
- Verify `VITE_SOCKET_URL` matches your Socket.io server
- Check Socket.io server is running
- Ensure Socket.io CORS is configured

### 12. Development vs Production

**Development:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

**Production:**
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_SOCKET_URL=https://api.yourdomain.com
```

Remember to rebuild the frontend after changing environment variables:
```bash
npm run build
```

### 13. Mock Mode (Fallback)

If you want to temporarily use mock data while developing:

```env
VITE_USE_MOCK_API=true
```

This will bypass all API calls and use localStorage/mock data instead.

---

## Next Steps

1. ✅ Set up your backend API endpoints
2. ✅ Configure CORS
3. ✅ Implement JWT authentication
4. ✅ Set up Socket.io for real-time features
5. ✅ Update `.env.local` with your backend URLs
6. ✅ Test the connection
7. ✅ Deploy both frontend and backend

For questions or issues, check the browser console and Network tab for detailed error messages.
