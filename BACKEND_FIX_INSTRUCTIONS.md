# Backend Fix Instructions: Make User a Decorator Endpoint

## Issue
The endpoint `PUT /api/admin/users/:id/make-decorator` is returning a 500 Internal Server Error when called from the frontend.

## Frontend Requirements

### Request Details
- **Method**: `PUT`
- **Endpoint**: `/api/admin/users/:id/make-decorator`
- **Headers Required**:
  - `Authorization: Bearer <Firebase_JWT_Token>`
  - `Content-Type: application/json`
- **URL Parameter**: `id` - User MongoDB ObjectId (e.g., `69358dbbc2ac4db9378cd2d2`)
- **Request Body**:
  ```json
  {
    "specialties": ["interior", "residential", "wedding"]
  }
  ```
  - `specialties` is an **array of strings**
  - At least one specialty is required (frontend validates this)

### Expected Response (Success - 200)
```json
{
  "success": true,
  "message": "User converted to decorator successfully. Decorator profile created with pending status.",
  "data": {
    "user": {
      "_id": "69358dbbc2ac4db9378cd2d2",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "decorator",
      "firebaseUid": "...",
      "image": "...",
      "createdAt": "...",
      "updatedAt": "..."
    },
    "decorator": {
      "_id": "507f1f77bcf86cd799439016",
      "userId": "69358dbbc2ac4db9378cd2d2",
      "specialties": ["interior", "residential", "wedding"],
      "rating": 0,
      "status": "pending",
      "completedProjects": 0,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "User is already a decorator."
}
```
OR
```json
{
  "success": false,
  "message": "Specialties must be an array of strings."
}
```
OR
```json
{
  "success": false,
  "message": "At least one specialty is required."
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided. Please include a Bearer token in the Authorization header."
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. This route requires admin role."
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "User not found."
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

## Backend Implementation Checklist

### 1. Route Setup
```javascript
// Example Express.js route
router.put('/api/admin/users/:id/make-decorator', 
  authenticateToken,        // Middleware to verify JWT
  requireAdmin,            // Middleware to check admin role
  makeUserDecorator        // Handler function
);
```

### 2. Authentication & Authorization
- Verify Firebase JWT token from `Authorization: Bearer <token>` header
- Extract user info from token (email, firebaseUid)
- Verify the authenticated user has `admin` role
- Return 401 if no token or invalid token
- Return 403 if user is not admin

### 3. Request Validation
```javascript
// Validate URL parameter
const { id } = req.params;
if (!id || !isValidObjectId(id)) {
  return res.status(400).json({
    success: false,
    message: "Invalid user ID format."
  });
}

// Validate request body
const { specialties } = req.body;

// Check if specialties is provided
if (!specialties) {
  return res.status(400).json({
    success: false,
    message: "Specialties are required."
  });
}

// Check if specialties is an array
if (!Array.isArray(specialties)) {
  return res.status(400).json({
    success: false,
    message: "Specialties must be an array."
  });
}

// Check if array is not empty
if (specialties.length === 0) {
  return res.status(400).json({
    success: false,
    message: "At least one specialty is required."
  });
}

// Validate each specialty is a string
if (!specialties.every(s => typeof s === 'string' && s.trim().length > 0)) {
  return res.status(400).json({
    success: false,
    message: "All specialties must be non-empty strings."
  });
}

// Trim and filter empty strings
const cleanedSpecialties = specialties
  .map(s => s.trim())
  .filter(s => s.length > 0);
```

### 4. Database Operations

#### Step 1: Find the User
```javascript
const user = await User.findById(id);
if (!user) {
  return res.status(404).json({
    success: false,
    message: "User not found."
  });
}
```

#### Step 2: Check if User is Already a Decorator
```javascript
// Check if user already has decorator role
if (user.role === 'decorator') {
  // Check if decorator profile already exists
  const existingDecorator = await Decorator.findOne({ userId: user._id });
  if (existingDecorator) {
    return res.status(400).json({
      success: false,
      message: "User is already a decorator."
    });
  }
}
```

#### Step 3: Update User Role
```javascript
// Update user role to decorator
user.role = 'decorator';
await user.save();
```

#### Step 4: Create Decorator Profile
```javascript
// Create decorator profile with pending status
const decorator = new Decorator({
  userId: user._id,
  specialties: cleanedSpecialties,
  rating: 0,
  status: 'pending',  // Important: new decorators start as 'pending'
  completedProjects: 0
});

await decorator.save();
```

### 5. Response
```javascript
// Populate user and decorator data for response
const populatedDecorator = await Decorator.findById(decorator._id)
  .populate('userId', 'name email role image');

return res.status(200).json({
  success: true,
  message: "User converted to decorator successfully. Decorator profile created with pending status.",
  data: {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      firebaseUid: user.firebaseUid,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    },
    decorator: {
      _id: decorator._id,
      userId: decorator.userId,
      specialties: decorator.specialties,
      rating: decorator.rating,
      status: decorator.status,
      completedProjects: decorator.completedProjects,
      createdAt: decorator.createdAt,
      updatedAt: decorator.updatedAt
    }
  }
});
```

### 6. Error Handling
```javascript
try {
  // ... all the code above ...
} catch (error) {
  console.error('Error making user decorator:', error);
  
  // Handle specific database errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: `Validation error: ${error.message}`
    });
  }
  
  if (error.name === 'MongoServerError' && error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Decorator profile already exists for this user."
    });
  }
  
  // Generic error
  return res.status(500).json({
    success: false,
    message: error.message || "An error occurred while converting user to decorator."
  });
}
```

## Common Issues to Check

1. **User ID Format**: Ensure the `:id` parameter is a valid MongoDB ObjectId
2. **Specialties Array**: Ensure `req.body.specialties` is parsed as an array (not a string)
3. **User Role Update**: Make sure the user's role is actually updated in the database
4. **Decorator Profile**: Ensure a new Decorator document is created (not just updated)
5. **Status Field**: New decorators should have `status: 'pending'` (not 'approved')
6. **Database Transactions**: Consider using transactions if you need atomicity
7. **Populate References**: If using Mongoose, ensure `userId` is populated in the response

## Testing

Test with curl:
```bash
curl -X PUT http://localhost:5001/api/admin/users/69358dbbc2ac4db9378cd2d2/make-decorator \
  -H "Authorization: Bearer YOUR_FIREBASE_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"specialties": ["interior", "residential"]}'
```

Expected: 200 OK with the response structure shown above.

## Notes

- The frontend expects the decorator to be created with `status: 'pending'`
- After creation, admin must approve the decorator using `PUT /api/admin/decorators/:id/approve`
- The user's role should be updated to `'decorator'` in the User collection
- The specialties array should be stored as-is (trimmed and validated)

