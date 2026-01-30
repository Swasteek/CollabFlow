# Backend Alignment Checklist

This document verifies that the frontend is properly aligned with the backend PRD.

## ✅ API Endpoints Alignment

### Authentication
- [x] `POST /api/auth/login` - Matches backend
- [x] `POST /api/auth/signup` - Matches backend
- [x] `POST /api/auth/logout` - Matches backend
- [x] `GET /api/auth/me` - **FIXED** (was `/auth/profile`, now `/auth/me`)

### Projects
- [x] `GET /api/projects` - Matches backend
- [x] `GET /api/projects/:id` - Matches backend
- [x] `POST /api/projects` - Matches backend
- [x] `PUT /api/projects/:id` - Matches backend
- [x] `DELETE /api/projects/:id` - Matches backend
- [x] `POST /api/projects/:id/invite` - Matches backend

### Tasks
- [x] `GET /api/projects/:projectId/tasks` - Matches backend
- [x] `POST /api/tasks` - Matches backend
- [x] `PUT /api/tasks/:id` - Matches backend
- [x] `DELETE /api/tasks/:id` - Matches backend
- [x] `PATCH /api/tasks/:id/move` - Matches backend

### Activities
- [x] `GET /api/activities/project/:projectId` - **FIXED** (was `/activities/:projectId`, now `/activities/project/:projectId`)

## ✅ Data Format Transformations

### Status Mapping
- **Backend Format**: `'todo'`, `'in_progress'`, `'done'` (lowercase with underscore)
- **Frontend Display**: `'To Do'`, `'In Progress'`, `'Done'` (title case)
- [x] Created `apiHelpers.js` with transformation functions
- [x] All task operations transform between formats

### Priority Mapping
- **Backend Format**: `'low'`, `'medium'`, `'high'` (lowercase)
- **Frontend Display**: `'Low'`, `'Medium'`, `'High'` (title case)
- [x] Transformation functions implemented
- [x] All task operations transform between formats

### Response Format Handling
- **Backend Format**: `{ success: true, data: {...} }` or `{ projects: [...] }`
- [x] Created `extractResponseData()` utility
- [x] All API calls use this utility to handle different response formats

## ✅ Socket.io Events Alignment

### Client → Server Events
- [x] `project:join` - **FIXED** (now sends only `{ projectId }`, user info from socket auth)
- [x] `project:leave` - **FIXED** (now sends only `{ projectId }`)
- [x] `task:move` - **FIXED** (now sends `{ taskId, newStatus, projectId }` - backend calculates oldStatus)

### Server → Client Events
- [x] `task:created` - Listens correctly
- [x] `task:updated` - Listens correctly
- [x] `task:moved` - Listens correctly, transforms status formats
- [x] `task:deleted` - Listens correctly
- [x] `user:joined` - Listens correctly
- [x] `user:left` - Listens correctly
- [x] `activity:new` - Listens correctly

### Socket Authentication
- [x] Token sent via `auth: { token }` in socket connection
- [x] Matches backend expectation

## ✅ Request/Response Handling

### Request Bodies
- [x] Task creation: Transforms frontend format → backend format
- [x] Task updates: Transforms frontend format → backend format
- [x] Task move: Converts status to backend format

### Response Parsing
- [x] Handles `{ success: true, data: {...} }` format
- [x] Handles `{ projects: [...] }` format
- [x] Handles `{ user: {...} }` format
- [x] Handles `{ token, user }` format

### Error Handling
- [x] Extracts error messages from `error.response.data.error`
- [x] Extracts error messages from `error.response.data.message`
- [x] Falls back to `error.message`
- [x] Displays errors via toast notifications

## ✅ Data Model Transformations

### Task Transformation
- [x] `_id` → `id` (MongoDB ObjectId to frontend ID)
- [x] Status: `'todo'` → `'To Do'`
- [x] Priority: `'low'` → `'Low'`
- [x] Assignee: Handles both object and string formats
- [x] DueDate: Converts Date to display format

### Project Transformation
- [x] `_id` → `id`
- [x] Members array transformation (handles nested user objects)
- [x] Calculated fields (taskCount, progress, etc.)

## ✅ Component Updates

### TaskDetailModal
- [x] Status dropdown uses frontend format
- [x] Priority buttons use frontend format
- [x] Saves transform to backend format

### TaskColumn
- [x] Column titles match frontend status format
- [x] Task status displayed in frontend format

### ProjectBoard
- [x] Handles socket events with format transformation
- [x] Updates tasks with correct format

## ⚠️ Notes & Considerations

### Socket.io Task Events
- **Note**: According to backend PRD, task create/update/delete events are broadcast by the backend AFTER REST API calls, not emitted by the client
- The frontend still has emit functions for these events, but they may not be used
- Backend will handle broadcasting after REST operations

### Response Format Variations
- Backend may return different formats:
  - `GET /api/projects` → `{ projects: [...] }`
  - Other endpoints → `{ success: true, data: {...} }`
- Frontend handles both via `extractResponseData()` utility

### Status Column Mapping
- Frontend columns use display names: "To Do", "In Progress", "Done"
- Backend uses: "todo", "in_progress", "done"
- All transformations handled automatically

## 🎯 Summary

**All major alignment issues have been fixed:**

1. ✅ API endpoints match backend PRD
2. ✅ Status/Priority format transformations implemented
3. ✅ Socket.io events aligned with backend expectations
4. ✅ Response format handling robust
5. ✅ Error handling comprehensive
6. ✅ Data model transformations complete

The frontend is now **fully aligned** with the backend PRD and ready to connect to your backend API!
