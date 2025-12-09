# Frontend Guide - Update On-Site Service Status

## API Endpoint

**PUT** `/api/decorator/project/:bookingId/status1`

## Request

**Headers:**
```
Authorization: Bearer <firebase-jwt-token>
Content-Type: application/json
```

**Body:**
```json
{
  "status1": "planning-phase"
}
```

## Valid Status Values

- `"assigned"`
- `"planning-phase"`
- `"materials-prepared"`
- `"on-the-way-to-venue"`
- `"setup-in-progress"`
- `"completed"`

## Example Code

```javascript
const updateStatus1 = async (bookingId, status1, firebaseToken) => {
  const response = await fetch(
    `${API_BASE_URL}/api/decorator/project/${bookingId}/status1`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${firebaseToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status1 }),
    }
  );

  const data = await response.json();
  return data;
};
```

## Status Display Labels

```javascript
const statusLabels = {
  'assigned': 'Assigned',
  'planning-phase': 'Planning Phase',
  'materials-prepared': 'Materials Prepared',
  'on-the-way-to-venue': 'On the Way to Venue',
  'setup-in-progress': 'Setup in Progress',
  'completed': 'Completed'
};
```

## Notes

- Only the assigned decorator can update status1
- Status cannot be moved backwards (e.g., from "setup-in-progress" to "planning-phase")
- When status1 is set to "completed", the main booking status is also updated to "completed"
