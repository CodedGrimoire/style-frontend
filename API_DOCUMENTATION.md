# StyleDecor Backend API Documentation

## Base URL
```
http://localhost:5001
```

## Authentication

Most endpoints require authentication using Firebase JWT tokens. Include the token in the `Authorization` header:

```
Authorization: Bearer YOUR_FIREBASE_JWT_TOKEN
```

---

## Public Endpoints (No Authentication Required)

### 1. Health Check

**GET** `/`

Check if the API is running.

**Response:**
```json
{
  "success": true,
  "message": "StyleDecor API is running",
  "version": "1.0.0"
}
```

---

### 2. Get All Services

**GET** `/services`

Get a list of all available services. Optionally filter by category.

**Query Parameters:**
- `category` (optional): Filter by category (`interior`, `exterior`, `event`, `commercial`, `residential`, `other`)

**Example Request:**
```
GET /services
GET /services?category=interior
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "service_name": "Interior Design Consultation",
      "cost": 150,
      "unit": "per hour",
      "category": "interior",
      "description": "Professional interior design consultation",
      "createdByEmail": "admin@example.com",
      "image": "https://example.com/image.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 3. Get Service by ID

**GET** `/services/:id`

Get details of a specific service.

**URL Parameters:**
- `id`: Service MongoDB ObjectId

**Example Request:**
```
GET /services/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "service_name": "Interior Design Consultation",
    "cost": 150,
    "unit": "per hour",
    "category": "interior",
    "description": "Professional interior design consultation",
    "createdByEmail": "admin@example.com",
    "image": "https://example.com/image.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Service not found."
}
```

**Error Response (400 - Invalid ID):**
```json
{
  "success": false,
  "message": "Invalid service ID format. Please provide a valid MongoDB ObjectId."
}
```

---

## User Endpoints (Authentication Required)

### 4. Create Booking

**POST** `/bookings`

Create a new booking for the authenticated user.

**Headers:**
```
Authorization: Bearer YOUR_FIREBASE_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "serviceId": "507f1f77bcf86cd799439011",
  "date": "2024-12-25T10:00:00Z",
  "location": "123 Main St, City, State 12345"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Booking created successfully.",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439013",
    "serviceId": {
      "_id": "507f1f77bcf86cd799439011",
      "service_name": "Interior Design Consultation",
      "cost": 150,
      "unit": "per hour",
      "category": "interior",
      "description": "Professional interior design consultation",
      "image": "https://example.com/image.jpg"
    },
    "date": "2024-12-25T10:00:00.000Z",
    "location": "123 Main St, City, State 12345",
    "paymentStatus": "pending",
    "status": "pending",
    "decoratorId": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Missing required fields or invalid date
- `404`: Service not found
- `401`: No token or invalid token

---

### 5. Get My Bookings

**GET** `/bookings/me`

Get all bookings for the authenticated user.

**Headers:**
```
Authorization: Bearer YOUR_FIREBASE_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439013",
      "serviceId": {
        "_id": "507f1f77bcf86cd799439011",
        "service_name": "Interior Design Consultation",
        "cost": 150,
        "unit": "per hour",
        "category": "interior",
        "description": "Professional interior design consultation",
        "image": "https://example.com/image.jpg"
      },
      "date": "2024-12-25T10:00:00.000Z",
      "location": "123 Main St, City, State 12345",
      "paymentStatus": "paid",
      "status": "confirmed",
      "decoratorId": {
        "userId": "507f1f77bcf86cd799439014"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 6. Cancel Booking

**DELETE** `/bookings/:id`

Cancel a booking. Only the user who created the booking can cancel it.

**Headers:**
```
Authorization: Bearer YOUR_FIREBASE_JWT_TOKEN
```

**URL Parameters:**
- `id`: Booking MongoDB ObjectId

**Response (200):**
```json
{
  "success": true,
  "message": "Booking cancelled successfully.",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "status": "cancelled",
    ...
  }
}
```

**Error Responses:**
- `400`: Cannot cancel booking that is in progress or completed
- `403`: You do not have permission to cancel this booking
- `404`: Booking not found

---

## Payment Endpoints (Authentication Required)

### 7. Create Payment Intent

**POST** `/payments/create-intent`

Create a Stripe payment intent for a booking.

**Headers:**
```
Authorization: Bearer YOUR_FIREBASE_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "bookingId": "507f1f77bcf86cd799439012"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Payment intent created successfully.",
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentId": "507f1f77bcf86cd799439015",
    "amount": 150.00
  }
}
```

**Note:** Use the `clientSecret` with Stripe.js on the frontend to complete the payment.

**Error Responses:**
- `400`: Booking already paid or invalid booking
- `403`: You do not have permission to pay for this booking
- `404`: Booking not found

---

### 8. Confirm Payment

**POST** `/payments/confirm`

Confirm that a payment was successful after Stripe payment is completed.

**Headers:**
```
Authorization: Bearer YOUR_FIREBASE_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "paymentId": "507f1f77bcf86cd799439015"
}
```

**OR**

```json
{
  "stripeIntentId": "pi_xxx"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Payment confirmed successfully.",
  "data": {
    "payment": {
      "_id": "507f1f77bcf86cd799439015",
      "bookingId": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439013",
      "amount": 15000,
      "stripeIntentId": "pi_xxx",
      "status": "succeeded",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "booking": {
      "_id": "507f1f77bcf86cd799439012",
      "paymentStatus": "paid",
      "status": "confirmed",
      ...
    }
  }
}
```

**Error Responses:**
- `400`: Payment not completed or invalid status
- `403`: You do not have permission to confirm this payment
- `404`: Payment record not found

---

## Decorator Endpoints (Authentication + Decorator Role Required)

### 9. Get Decorator Projects

**GET** `/decorator/projects`

Get all bookings assigned to the authenticated decorator.

**Headers:**
```
Authorization: Bearer YOUR_FIREBASE_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "John Doe",
        "email": "john@example.com",
        "image": "https://example.com/avatar.jpg"
      },
      "serviceId": {
        "_id": "507f1f77bcf86cd799439011",
        "service_name": "Interior Design Consultation",
        "cost": 150,
        "unit": "per hour",
        "category": "interior",
        "description": "Professional interior design consultation",
        "image": "https://example.com/image.jpg"
      },
      "date": "2024-12-25T10:00:00.000Z",
      "location": "123 Main St, City, State 12345",
      "paymentStatus": "paid",
      "status": "assigned",
      "decoratorId": "507f1f77bcf86cd799439016",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `403`: Decorator account not approved or not found
- `404`: Decorator profile not found

---

### 10. Update Project Status

**PUT** `/decorator/project/:bookingId/status`

Update the status of an assigned booking.

**Headers:**
```
Authorization: Bearer YOUR_FIREBASE_JWT_TOKEN
Content-Type: application/json
```

**URL Parameters:**
- `bookingId`: Booking MongoDB ObjectId

**Request Body:**
```json
{
  "status": "in-progress"
}
```

**Valid Status Values:**
- `assigned`
- `in-progress`
- `completed`

**Response (200):**
```json
{
  "success": true,
  "message": "Booking status updated successfully.",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "status": "in-progress",
    ...
  }
}
```

**Error Responses:**
- `400`: Invalid status or cannot update completed booking
- `403`: Booking not assigned to you
- `404`: Booking not found

---

## Admin Endpoints (Authentication + Admin Role Required)

### 11. Create Service

**POST** `/admin/services`

Create a new service.

**Headers:**
```
Authorization: Bearer YOUR_FIREBASE_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "service_name": "Interior Design Consultation",
  "cost": 150,
  "unit": "per hour",
  "category": "interior",
  "description": "Professional interior design consultation",
  "image": "https://example.com/image.jpg"
}
```

**Valid Units:**
- `per hour`
- `per room`
- `per project`
- `per square foot`
- `flat rate`

**Valid Categories:**
- `interior`
- `exterior`
- `event`
- `commercial`
- `residential`
- `other`

**Response (201):**
```json
{
  "success": true,
  "message": "Service created successfully.",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "service_name": "Interior Design Consultation",
    "cost": 150,
    "unit": "per hour",
    "category": "interior",
    "description": "Professional interior design consultation",
    "createdByEmail": "admin@example.com",
    "image": "https://example.com/image.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 12. Update Service

**PUT** `/admin/services/:id`

Update an existing service.

**Headers:**
```
Authorization: Bearer YOUR_FIREBASE_JWT_TOKEN
Content-Type: application/json
```

**URL Parameters:**
- `id`: Service MongoDB ObjectId

**Request Body (all fields optional):**
```json
{
  "service_name": "Updated Service Name",
  "cost": 200,
  "unit": "per hour",
  "category": "interior",
  "description": "Updated description",
  "image": "https://example.com/new-image.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Service updated successfully.",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "service_name": "Updated Service Name",
    "cost": 200,
    ...
  }
}
```

---

### 13. Delete Service

**DELETE** `/admin/services/:id`

Delete a service.

**Headers:**
```
Authorization: Bearer YOUR_FIREBASE_JWT_TOKEN
```

**URL Parameters:**
- `id`: Service MongoDB ObjectId

**Response (200):**
```json
{
  "success": true,
  "message": "Service deleted successfully."
}
```

---

### 14. Get All Bookings

**GET** `/admin/bookings`

Get all bookings in the system with optional filters.

**Headers:**
```
Authorization: Bearer YOUR_FIREBASE_JWT_TOKEN
```

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `confirmed`, `assigned`, `in-progress`, `completed`, `cancelled`)
- `paymentStatus` (optional): Filter by payment status (`pending`, `paid`, `failed`, `refunded`)

**Example Request:**
```
GET /admin/bookings?status=pending&paymentStatus=paid
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "John Doe",
        "email": "john@example.com",
        "image": "https://example.com/avatar.jpg"
      },
      "serviceId": {
        "_id": "507f1f77bcf86cd799439011",
        "service_name": "Interior Design Consultation",
        "cost": 150,
        "unit": "per hour",
        "category": "interior"
      },
      "date": "2024-12-25T10:00:00.000Z",
      "location": "123 Main St, City, State 12345",
      "paymentStatus": "paid",
      "status": "confirmed",
      "decoratorId": {
        "userId": "507f1f77bcf86cd799439014"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 15. Assign Decorator to Booking

**PUT** `/admin/bookings/:id/assign`

Assign a decorator to a booking.

**Headers:**
```
Authorization: Bearer YOUR_FIREBASE_JWT_TOKEN
Content-Type: application/json
```

**URL Parameters:**
- `id`: Booking MongoDB ObjectId

**Request Body:**
```json
{
  "decoratorId": "507f1f77bcf86cd799439016"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Decorator assigned successfully.",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "decoratorId": "507f1f77bcf86cd799439016",
    "status": "assigned",
    ...
  }
}
```

**Error Responses:**
- `400`: Decorator not approved
- `404`: Booking or decorator not found

---

### 16. Make User a Decorator

**PUT** `/admin/users/:id/make-decorator`

Convert a regular user to a decorator role and create a decorator profile.

**Headers:**
```
Authorization: Bearer YOUR_FIREBASE_JWT_TOKEN
Content-Type: application/json
```

**URL Parameters:**
- `id`: User MongoDB ObjectId

**Request Body:**
```json
{
  "specialties": ["interior", "residential"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User converted to decorator successfully. Decorator profile created with pending status.",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439013",
      "role": "decorator",
      ...
    },
    "decorator": {
      "_id": "507f1f77bcf86cd799439016",
      "userId": "507f1f77bcf86cd799439013",
      "specialties": ["interior", "residential"],
      "rating": 0,
      "status": "pending",
      ...
    }
  }
}
```

---

### 17. Approve Decorator

**PUT** `/admin/decorators/:id/approve`

Approve a decorator, allowing them to receive bookings.

**Headers:**
```
Authorization: Bearer YOUR_FIREBASE_JWT_TOKEN
```

**URL Parameters:**
- `id`: Decorator MongoDB ObjectId

**Response (200):**
```json
{
  "success": true,
  "message": "Decorator approved successfully.",
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "status": "approved",
    ...
  }
}
```

---

### 18. Disable Decorator

**PUT** `/admin/decorators/:id/disable`

Disable a decorator, preventing them from receiving new bookings.

**Headers:**
```
Authorization: Bearer YOUR_FIREBASE_JWT_TOKEN
```

**URL Parameters:**
- `id`: Decorator MongoDB ObjectId

**Response (200):**
```json
{
  "success": true,
  "message": "Decorator disabled successfully.",
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "status": "disabled",
    ...
  }
}
```

---

### 19. Get Revenue Analytics

**GET** `/admin/analytics/revenue`

Get revenue analytics including total revenue and revenue by month.

**Headers:**
```
Authorization: Bearer YOUR_FIREBASE_JWT_TOKEN
```

**Query Parameters:**
- `startDate` (optional): Start date filter (YYYY-MM-DD)
- `endDate` (optional): End date filter (YYYY-MM-DD)

**Example Request:**
```
GET /admin/analytics/revenue?startDate=2024-01-01&endDate=2024-12-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": "15000.00",
    "totalTransactions": 100,
    "revenueByMonth": {
      "2024-01": 5000.00,
      "2024-02": 6000.00,
      "2024-03": 4000.00
    }
  }
}
```

---

### 20. Get Service Demand Analytics

**GET** `/admin/analytics/service-demand`

Get analytics about which services are most in demand.

**Headers:**
```
Authorization: Bearer YOUR_FIREBASE_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "serviceDemand": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "serviceName": "Interior Design Consultation",
        "serviceCategory": "interior",
        "bookingCount": 50,
        "completedCount": 45
      }
    ],
    "demandByCategory": {
      "interior": {
        "totalBookings": 100,
        "totalCompleted": 90,
        "services": [
          {
            "name": "Interior Design Consultation",
            "bookings": 50,
            "completed": 45
          }
        ]
      }
    }
  }
}
```

---

## Error Responses

### Standard Error Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error, invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

### Common Error Messages

**Authentication Errors:**
```json
{
  "success": false,
  "message": "No token provided. Please include a Bearer token in the Authorization header."
}
```

```json
{
  "success": false,
  "message": "Invalid or expired token."
}
```

```json
{
  "success": false,
  "message": "User not found. Please complete your profile registration."
}
```

**Authorization Errors:**
```json
{
  "success": false,
  "message": "Access denied. This route requires one of the following roles: admin. Your role: user"
}
```

**Validation Errors:**
```json
{
  "success": false,
  "message": "Please provide serviceId, date, and location."
}
```

---

## Data Models

### User
```typescript
{
  _id: string;
  name: string;
  email: string;
  firebaseUid: string;
  role: "user" | "admin" | "decorator";
  image?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Service
```typescript
{
  _id: string;
  service_name: string;
  cost: number;
  unit: "per hour" | "per room" | "per project" | "per square foot" | "flat rate";
  category: "interior" | "exterior" | "event" | "commercial" | "residential" | "other";
  description: string;
  createdByEmail: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Booking
```typescript
{
  _id: string;
  userId: string | User;
  serviceId: string | Service;
  date: string; // ISO 8601 date
  location: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  status: "pending" | "confirmed" | "assigned" | "in-progress" | "completed" | "cancelled";
  decoratorId?: string | Decorator;
  createdAt: string;
  updatedAt: string;
}
```

### Decorator
```typescript
{
  _id: string;
  userId: string | User;
  specialties: string[];
  rating: number; // 0-5
  status: "pending" | "approved" | "disabled";
  createdAt: string;
  updatedAt: string;
}
```

### Payment
```typescript
{
  _id: string;
  bookingId: string | Booking;
  userId: string | User;
  amount: number; // in cents
  stripeIntentId: string;
  status: "pending" | "succeeded" | "failed" | "canceled";
  createdAt: string;
  updatedAt: string;
}
```

---

## Frontend Integration Examples

### React/Next.js Example

```javascript
// API Client Setup
const API_BASE_URL = 'http://localhost:5001';

async function apiRequest(endpoint, options = {}) {
  const token = await getFirebaseToken(); // Get Firebase JWT token
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

// Get all services
const services = await apiRequest('/services');

// Create a booking
const booking = await apiRequest('/bookings', {
  method: 'POST',
  body: JSON.stringify({
    serviceId: '507f1f77bcf86cd799439011',
    date: '2024-12-25T10:00:00Z',
    location: '123 Main St, City, State 12345',
  }),
});

// Get my bookings
const myBookings = await apiRequest('/bookings/me');
```

### Stripe Payment Integration

```javascript
// 1. Create payment intent
const { data } = await apiRequest('/payments/create-intent', {
  method: 'POST',
  body: JSON.stringify({ bookingId: '507f1f77bcf86cd799439012' }),
});

// 2. Use Stripe.js to confirm payment
const stripe = Stripe('pk_test_your_publishable_key');
const { error } = await stripe.confirmCardPayment(data.clientSecret, {
  payment_method: {
    card: cardElement,
  },
});

if (!error) {
  // 3. Confirm payment on backend
  await apiRequest('/payments/confirm', {
    method: 'POST',
    body: JSON.stringify({ paymentId: data.paymentId }),
  });
}
```

---

## Notes

1. **Date Format**: All dates should be in ISO 8601 format (e.g., `2024-12-25T10:00:00Z`)

2. **Amount Format**: Payment amounts are stored in cents (e.g., $150.00 = 15000 cents)

3. **ObjectId Format**: MongoDB ObjectIds are 24-character hexadecimal strings

4. **Pagination**: Currently not implemented. All endpoints return all matching records.

5. **Rate Limiting**: Not implemented. Consider adding for production.

6. **CORS**: Configured to allow requests from `FRONTEND_URL` environment variable (defaults to `*` in development)

---

## Support

For issues or questions, please refer to the backend codebase or contact the development team.

