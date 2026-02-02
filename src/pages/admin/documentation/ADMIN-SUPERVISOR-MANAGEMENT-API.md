# Admin Supervisor Management API Documentation

**Version:** 1.0
**Base URL:** `/api/admin/supervisors`
**Authentication:** Required (X-User-Id header with Admin user ID)

This documentation covers the API endpoints for managing medical supervisors from the admin portal.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Supervisor Management APIs](#supervisor-management-apis)
3. [Data Models](#data-models)
4. [Enumerations](#enumerations)
5. [Error Handling](#error-handling)
6. [Frontend Implementation Guide](#frontend-implementation-guide)

---

## Authentication

All endpoints require admin authentication via the X-User-Id header:

```http
X-User-Id: <admin-user-id>
```

---

## Supervisor Management APIs

**Base Path:** `/api/admin/supervisors`

### 1. Get All Supervisors

Retrieves all supervisors with optional status filter.

**Endpoint:** `GET /api/admin/supervisors`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | SupervisorVerificationStatus | No | Filter by verification status |

**Status Values:**
- `PENDING` - Awaiting verification
- `VERIFIED` - Approved and active
- `REJECTED` - Application rejected
- `SUSPENDED` - Account suspended

**Request Example:**

```http
GET /api/admin/supervisors?status=PENDING
Headers:
  X-User-Id: 1001
```

**Response Example (200 OK):**

```json
{
  "success": true,
  "message": "Retrieved 5 supervisors with status PENDING",
  "data": [
    {
      "id": 5001,
      "userId": 6001,
      "fullName": "Dr. Emily Williams",
      "organizationName": "City General Hospital",
      "organizationType": "HOSPITAL",
      "licenseNumber": "MED-SUP-2024-001",
      "licenseDocumentPath": "/documents/licenses/supervisor-5001.pdf",
      "phoneNumber": "+1-555-0123",
      "email": "emily.williams@cityhospital.com",
      "address": "123 Medical Center Drive",
      "city": "New York",
      "country": "USA",
      "verificationStatus": "PENDING",
      "verificationNotes": null,
      "verifiedAt": null,
      "verifiedBy": null,
      "rejectionReason": null,
      "maxPatientsLimit": 30,
      "maxActiveCasesPerPatient": 3,
      "isAvailable": false,
      "activePatientCount": 0,
      "availableCouponCount": 0,
      "createdAt": "2026-01-05T10:30:00",
      "updatedAt": "2026-01-05T10:30:00"
    }
  ],
  "timestamp": "2026-01-13T14:30:00",
  "errorCode": null
}
```

---

### 2. Get Pending Supervisors

Retrieves all supervisors pending verification.

**Endpoint:** `GET /api/admin/supervisors/pending`

**Request Example:**

```http
GET /api/admin/supervisors/pending
Headers:
  X-User-Id: 1001
```

**Response Example (200 OK):**

```json
{
  "success": true,
  "message": "Retrieved 3 pending supervisors",
  "data": [
    {
      "id": 5001,
      "userId": 6001,
      "fullName": "Dr. Emily Williams",
      "organizationName": "City General Hospital",
      "organizationType": "HOSPITAL",
      "licenseNumber": "MED-SUP-2024-001",
      "email": "emily.williams@cityhospital.com",
      "verificationStatus": "PENDING",
      "createdAt": "2026-01-05T10:30:00"
    }
  ],
  "timestamp": "2026-01-13T14:30:00",
  "errorCode": null
}
```

---

### 3. Get Supervisor by ID

Retrieves detailed information about a specific supervisor.

**Endpoint:** `GET /api/admin/supervisors/{supervisorId}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| supervisorId | Long | Yes | Supervisor ID |

**Request Example:**

```http
GET /api/admin/supervisors/5001
Headers:
  X-User-Id: 1001
```

**Response Example (200 OK):**

```json
{
  "success": true,
  "message": "Supervisor details retrieved successfully",
  "data": {
    "id": 5001,
    "userId": 6001,
    "fullName": "Dr. Emily Williams",
    "organizationName": "City General Hospital",
    "organizationType": "HOSPITAL",
    "licenseNumber": "MED-SUP-2024-001",
    "licenseDocumentPath": "/documents/licenses/supervisor-5001.pdf",
    "phoneNumber": "+1-555-0123",
    "email": "emily.williams@cityhospital.com",
    "address": "123 Medical Center Drive",
    "city": "New York",
    "country": "USA",
    "verificationStatus": "VERIFIED",
    "verificationNotes": "All credentials verified",
    "verifiedAt": "2026-01-06T09:15:00",
    "verifiedBy": 1001,
    "rejectionReason": null,
    "maxPatientsLimit": 30,
    "maxActiveCasesPerPatient": 3,
    "isAvailable": true,
    "activePatientCount": 15,
    "availableCouponCount": 45,
    "createdAt": "2026-01-05T10:30:00",
    "updatedAt": "2026-01-06T09:15:00"
  },
  "timestamp": "2026-01-13T14:30:00",
  "errorCode": null
}
```

---

### 4. Verify Supervisor

Approves a supervisor application.

**Endpoint:** `PUT /api/admin/supervisors/{supervisorId}/verify`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| supervisorId | Long | Yes | Supervisor ID to verify |

**Request Headers:**

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| X-User-Id | Long | Yes | Admin user ID performing verification |

**Request Body:**

```json
{
  "verificationNotes": "All credentials verified and approved. License documentation confirmed."
}
```

**Request Body Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| verificationNotes | String | No | Notes about the verification |

**Request Example:**

```http
PUT /api/admin/supervisors/5001/verify
Headers:
  X-User-Id: 1001
  Content-Type: application/json

Body:
{
  "verificationNotes": "All credentials verified and approved"
}
```

**Response Example (200 OK):**

```json
{
  "success": true,
  "message": "Supervisor verified successfully",
  "data": {
    "id": 5001,
    "userId": 6001,
    "fullName": "Dr. Emily Williams",
    "organizationName": "City General Hospital",
    "organizationType": "HOSPITAL",
    "licenseNumber": "MED-SUP-2024-001",
    "email": "emily.williams@cityhospital.com",
    "verificationStatus": "VERIFIED",
    "verificationNotes": "All credentials verified and approved",
    "verifiedAt": "2026-01-13T14:30:00",
    "verifiedBy": 1001,
    "isAvailable": true,
    "maxPatientsLimit": 30,
    "maxActiveCasesPerPatient": 3,
    "createdAt": "2026-01-05T10:30:00",
    "updatedAt": "2026-01-13T14:30:00"
  },
  "timestamp": "2026-01-13T14:30:00",
  "errorCode": null
}
```

---

### 5. Reject Supervisor

Rejects a supervisor application with a reason.

**Endpoint:** `PUT /api/admin/supervisors/{supervisorId}/reject`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| supervisorId | Long | Yes | Supervisor ID to reject |

**Request Body:**

```json
{
  "rejectionReason": "Invalid medical license documentation. License number could not be verified."
}
```

**Request Body Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| rejectionReason | String | Yes | Reason for rejection |

**Request Example:**

```http
PUT /api/admin/supervisors/5002/reject
Headers:
  X-User-Id: 1001
  Content-Type: application/json

Body:
{
  "rejectionReason": "Invalid medical license documentation"
}
```

**Response Example (200 OK):**

```json
{
  "success": true,
  "message": "Supervisor application rejected",
  "data": {
    "id": 5002,
    "userId": 6002,
    "fullName": "Dr. John Smith",
    "organizationName": "Community Care Center",
    "email": "john.smith@ccc.com",
    "verificationStatus": "REJECTED",
    "verificationNotes": null,
    "rejectionReason": "Invalid medical license documentation",
    "isAvailable": false,
    "createdAt": "2026-01-08T11:00:00",
    "updatedAt": "2026-01-13T14:35:00"
  },
  "timestamp": "2026-01-13T14:35:00",
  "errorCode": null
}
```

---

### 6. Suspend Supervisor

Suspends a supervisor account.

**Endpoint:** `PUT /api/admin/supervisors/{supervisorId}/suspend`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| supervisorId | Long | Yes | Supervisor ID to suspend |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| reason | String | Yes | Reason for suspension |

**Request Example:**

```http
PUT /api/admin/supervisors/5003/suspend?reason=Violation of service terms
Headers:
  X-User-Id: 1001
```

**Response Example (200 OK):**

```json
{
  "success": true,
  "message": "Supervisor suspended successfully",
  "data": {
    "id": 5003,
    "userId": 6003,
    "fullName": "Dr. Sarah Johnson",
    "organizationName": "Medical Group Associates",
    "email": "sarah.johnson@mga.com",
    "verificationStatus": "SUSPENDED",
    "rejectionReason": "Violation of service terms",
    "isAvailable": false,
    "activePatientCount": 12,
    "createdAt": "2025-12-15T09:00:00",
    "updatedAt": "2026-01-13T14:40:00"
  },
  "timestamp": "2026-01-13T14:40:00",
  "errorCode": null
}
```

---

### 7. Update Supervisor Limits

Updates supervisor patient and case limits.

**Endpoint:** `PUT /api/admin/supervisors/{supervisorId}/limits`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| supervisorId | Long | Yes | Supervisor ID |

**Request Body:**

```json
{
  "maxPatientsLimit": 50,
  "maxActiveCasesPerPatient": 5
}
```

**Request Body Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| maxPatientsLimit | Integer | Yes | Maximum patients supervisor can manage |
| maxActiveCasesPerPatient | Integer | Yes | Maximum active cases per patient |

**Validation:**
- `maxPatientsLimit`: Must be > 0, typically 10-100
- `maxActiveCasesPerPatient`: Must be > 0, typically 1-10

**Request Example:**

```http
PUT /api/admin/supervisors/5001/limits
Headers:
  X-User-Id: 1001
  Content-Type: application/json

Body:
{
  "maxPatientsLimit": 50,
  "maxActiveCasesPerPatient": 5
}
```

**Response Example (200 OK):**

```json
{
  "success": true,
  "message": "Supervisor limits updated successfully",
  "data": {
    "id": 5001,
    "userId": 6001,
    "fullName": "Dr. Emily Williams",
    "organizationName": "City General Hospital",
    "email": "emily.williams@cityhospital.com",
    "verificationStatus": "VERIFIED",
    "maxPatientsLimit": 50,
    "maxActiveCasesPerPatient": 5,
    "activePatientCount": 15,
    "isAvailable": true,
    "createdAt": "2026-01-05T10:30:00",
    "updatedAt": "2026-01-13T14:45:00"
  },
  "timestamp": "2026-01-13T14:45:00",
  "errorCode": null
}
```

---

### 8. Search Supervisors

Searches supervisors by name, email, or organization.

**Endpoint:** `GET /api/admin/supervisors/search`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | String | Yes | Search query |

**Search Fields:**
- Full name
- Email address
- Organization name
- License number

**Request Example:**

```http
GET /api/admin/supervisors/search?query=hospital
Headers:
  X-User-Id: 1001
```

**Response Example (200 OK):**

```json
{
  "success": true,
  "message": "Found 3 supervisors matching query: hospital",
  "data": [
    {
      "id": 5001,
      "userId": 6001,
      "fullName": "Dr. Emily Williams",
      "organizationName": "City General Hospital",
      "email": "emily.williams@cityhospital.com",
      "verificationStatus": "VERIFIED",
      "isAvailable": true,
      "activePatientCount": 15
    },
    {
      "id": 5004,
      "userId": 6004,
      "fullName": "Dr. Michael Brown",
      "organizationName": "Regional Hospital Network",
      "email": "michael.brown@regional.com",
      "verificationStatus": "VERIFIED",
      "isAvailable": true,
      "activePatientCount": 22
    }
  ],
  "timestamp": "2026-01-13T14:50:00",
  "errorCode": null
}
```

---

### 9. Get Supervisor Statistics

Retrieves comprehensive platform-wide supervisor statistics.

**Endpoint:** `GET /api/admin/supervisors/statistics`

**Request Example:**

```http
GET /api/admin/supervisors/statistics
Headers:
  X-User-Id: 1001
```

**Response Example (200 OK):**

```json
{
  "success": true,
  "message": "Supervisor statistics retrieved successfully",
  "data": {
    "totalSupervisors": 45,
    "activeSupervisors": 32,
    "pendingSupervisors": 8,
    "verifiedSupervisors": 35,
    "rejectedSupervisors": 2,
    "suspendedSupervisors": 0,
    "supervisorsByStatus": {
      "PENDING": 8,
      "VERIFIED": 35,
      "REJECTED": 2,
      "SUSPENDED": 0
    },
    "totalPatientAssignments": 520,
    "activePatientAssignments": 485,
    "inactivePatientAssignments": 35,
    "averagePatientsPerSupervisor": 15.16,
    "totalUniquePatientsManaged": 485,
    "totalCouponsIssued": 2500,
    "availableCoupons": 1850,
    "usedCoupons": 580,
    "expiredCoupons": 50,
    "cancelledCoupons": 20,
    "couponsExpiringSoon": 120,
    "totalAvailableCouponValue": 277500.00,
    "couponsByStatus": {
      "AVAILABLE": 1850,
      "USED": 580,
      "EXPIRED": 50,
      "CANCELLED": 20
    },
    "totalPaymentsProcessed": 620,
    "completedPayments": 580,
    "pendingPayments": 25,
    "failedPayments": 15,
    "totalAmountPaid": 87000.00,
    "totalDiscountAmount": 11600.00,
    "paymentsByMethod": {
      "STRIPE": 420,
      "PAYPAL": 85,
      "COUPON": 75
    },
    "averagePaymentAmount": 150.00,
    "supervisorsWithCapacity": 28,
    "averageCapacityUtilization": 75.78,
    "totalPatientCapacity": 640,
    "usedPatientCapacity": 485,
    "recentRegistrations": 12,
    "recentVerifications": 8,
    "recentAssignments": 45,
    "recentPayments": 89
  },
  "timestamp": "2026-01-13T14:55:00",
  "errorCode": null
}
```

---

## Data Models

### SupervisorProfileDto

```typescript
{
  id: number;                              // Supervisor ID
  userId: number;                          // Associated user account ID
  fullName: string;                        // Full name
  organizationName: string;                // Organization/Hospital name
  organizationType: string;                // HOSPITAL, CLINIC, NGO, GOVERNMENT, etc.
  licenseNumber: string;                   // Medical supervisor license number
  licenseDocumentPath: string | null;      // Path to license document
  phoneNumber: string;                     // Contact phone number
  email: string;                           // Email address
  address: string | null;                  // Street address
  city: string | null;                     // City
  country: string | null;                  // Country
  verificationStatus: SupervisorVerificationStatus; // Verification status
  verificationNotes: string | null;        // Admin notes on verification
  verifiedAt: string | null;               // Verification timestamp (ISO)
  verifiedBy: number | null;               // Admin user ID who verified
  rejectionReason: string | null;          // Rejection/suspension reason
  maxPatientsLimit: number;                // Maximum patients allowed
  maxActiveCasesPerPatient: number;        // Max active cases per patient
  isAvailable: boolean;                    // Currently available/active
  activePatientCount: number;              // Current active patient count
  availableCouponCount: number;            // Available coupons count
  createdAt: string;                       // ISO datetime
  updatedAt: string;                       // ISO datetime
}
```

### VerifySupervisorRequest

```typescript
{
  verificationNotes?: string;              // Optional notes about verification
}
```

### RejectSupervisorRequest

```typescript
{
  rejectionReason: string;                 // Required reason for rejection
}
```

### UpdateSupervisorLimitsRequest

```typescript
{
  maxPatientsLimit: number;                // Required: Max patients (>0)
  maxActiveCasesPerPatient: number;        // Required: Max cases per patient (>0)
}
```

### SupervisorStatisticsDto

```typescript
{
  // Supervisor Metrics
  totalSupervisors: number;
  activeSupervisors: number;
  pendingSupervisors: number;
  verifiedSupervisors: number;
  rejectedSupervisors: number;
  suspendedSupervisors: number;
  supervisorsByStatus: {
    [status: string]: number;              // Count by status
  };

  // Patient Assignment Metrics
  totalPatientAssignments: number;
  activePatientAssignments: number;
  inactivePatientAssignments: number;
  averagePatientsPerSupervisor: number;
  totalUniquePatientsManaged: number;

  // Coupon Metrics
  totalCouponsIssued: number;
  availableCoupons: number;
  usedCoupons: number;
  expiredCoupons: number;
  cancelledCoupons: number;
  couponsExpiringSoon: number;
  totalAvailableCouponValue: number;
  couponsByStatus: {
    [status: string]: number;              // Count by coupon status
  };

  // Payment Metrics
  totalPaymentsProcessed: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  totalAmountPaid: number;
  totalDiscountAmount: number;
  paymentsByMethod: {
    [method: string]: number;              // Count by payment method
  };
  averagePaymentAmount: number;

  // Capacity Metrics
  supervisorsWithCapacity: number;
  averageCapacityUtilization: number;      // Percentage
  totalPatientCapacity: number;
  usedPatientCapacity: number;

  // Recent Activity (Last 30 Days)
  recentRegistrations: number;
  recentVerifications: number;
  recentAssignments: number;
  recentPayments: number;
}
```

### ApiResponse<T> (Generic Wrapper)

```typescript
{
  success: boolean;
  message: string | null;
  data: T;                                 // Generic data payload
  timestamp: string;                       // ISO datetime
  errorCode: string | null;
}
```

---

## Enumerations

### SupervisorVerificationStatus

```typescript
enum SupervisorVerificationStatus {
  PENDING = "PENDING",           // Awaiting verification
  VERIFIED = "VERIFIED",         // Approved and active
  REJECTED = "REJECTED",         // Application rejected
  SUSPENDED = "SUSPENDED"        // Account suspended
}
```

### Organization Type (Common Values)

```typescript
enum OrganizationType {
  HOSPITAL = "HOSPITAL",
  CLINIC = "CLINIC",
  NGO = "NGO",
  GOVERNMENT = "GOVERNMENT",
  PRIVATE_PRACTICE = "PRIVATE_PRACTICE",
  RESEARCH_INSTITUTION = "RESEARCH_INSTITUTION"
}
```

---

## Error Handling

All endpoints follow a consistent error response format:

### Error Response Structure

```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "timestamp": "2026-01-13T15:00:00",
  "errorCode": "ERROR_CODE"
}
```

### Common HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 OK | Request successful |
| 400 Bad Request | Invalid request parameters or validation error |
| 401 Unauthorized | Missing or invalid authentication (X-User-Id) |
| 403 Forbidden | User does not have admin permissions |
| 404 Not Found | Supervisor not found |
| 500 Internal Server Error | Server-side error |

### Common Error Scenarios

**1. Unauthorized Access:**
```json
{
  "success": false,
  "message": "Unauthorized access. Admin privileges required.",
  "data": null,
  "timestamp": "2026-01-13T15:00:00",
  "errorCode": "UNAUTHORIZED"
}
```

**2. Supervisor Not Found:**
```json
{
  "success": false,
  "message": "Supervisor not found",
  "data": null,
  "timestamp": "2026-01-13T15:00:00",
  "errorCode": "NOT_FOUND"
}
```

**3. Validation Error (Missing Rejection Reason):**
```json
{
  "success": false,
  "message": "Rejection reason is required",
  "data": null,
  "timestamp": "2026-01-13T15:00:00",
  "errorCode": "VALIDATION_ERROR"
}
```

**4. Invalid Limits:**
```json
{
  "success": false,
  "message": "maxPatientsLimit must be greater than 0",
  "data": null,
  "timestamp": "2026-01-13T15:00:00",
  "errorCode": "VALIDATION_ERROR"
}
```

**5. Empty Search Query:**
```json
{
  "success": false,
  "message": "Search query is required",
  "data": null,
  "timestamp": "2026-01-13T15:00:00",
  "errorCode": "BAD_REQUEST"
}
```

---

## Frontend Implementation Guide

### 1. Authentication

Always include the admin user ID in request headers:

```javascript
const headers = {
  'X-User-Id': adminUserId,
  'Content-Type': 'application/json'
};
```

### 2. API Service Example

```javascript
// supervisorApi.js
const API_BASE_URL = '/api/admin/supervisors';

export const supervisorApi = {
  // Get all supervisors
  getAllSupervisors: async (status = null) => {
    const url = status
      ? `${API_BASE_URL}?status=${status}`
      : API_BASE_URL;

    const response = await fetch(url, {
      headers: {
        'X-User-Id': getAdminUserId()
      }
    });
    return handleResponse(response);
  },

  // Get pending supervisors
  getPending: async () => {
    const response = await fetch(`${API_BASE_URL}/pending`, {
      headers: {
        'X-User-Id': getAdminUserId()
      }
    });
    return handleResponse(response);
  },

  // Get supervisor by ID
  getSupervisor: async (supervisorId) => {
    const response = await fetch(`${API_BASE_URL}/${supervisorId}`, {
      headers: {
        'X-User-Id': getAdminUserId()
      }
    });
    return handleResponse(response);
  },

  // Verify supervisor
  verifySupervisor: async (supervisorId, verificationNotes) => {
    const response = await fetch(`${API_BASE_URL}/${supervisorId}/verify`, {
      method: 'PUT',
      headers: {
        'X-User-Id': getAdminUserId(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ verificationNotes })
    });
    return handleResponse(response);
  },

  // Reject supervisor
  rejectSupervisor: async (supervisorId, rejectionReason) => {
    const response = await fetch(`${API_BASE_URL}/${supervisorId}/reject`, {
      method: 'PUT',
      headers: {
        'X-User-Id': getAdminUserId(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rejectionReason })
    });
    return handleResponse(response);
  },

  // Suspend supervisor
  suspendSupervisor: async (supervisorId, reason) => {
    const response = await fetch(
      `${API_BASE_URL}/${supervisorId}/suspend?reason=${encodeURIComponent(reason)}`,
      {
        method: 'PUT',
        headers: {
          'X-User-Id': getAdminUserId()
        }
      }
    );
    return handleResponse(response);
  },

  // Update limits
  updateLimits: async (supervisorId, limits) => {
    const response = await fetch(`${API_BASE_URL}/${supervisorId}/limits`, {
      method: 'PUT',
      headers: {
        'X-User-Id': getAdminUserId(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(limits)
    });
    return handleResponse(response);
  },

  // Search supervisors
  searchSupervisors: async (query) => {
    const response = await fetch(
      `${API_BASE_URL}/search?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'X-User-Id': getAdminUserId()
        }
      }
    );
    return handleResponse(response);
  },

  // Get statistics
  getStatistics: async () => {
    const response = await fetch(`${API_BASE_URL}/statistics`, {
      headers: {
        'X-User-Id': getAdminUserId()
      }
    });
    return handleResponse(response);
  }
};

// Helper function to handle responses
const handleResponse = async (response) => {
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || 'Request failed');
  }

  return data.data;
};

// Helper to get admin user ID from auth context/storage
const getAdminUserId = () => {
  // Implement based on your auth system
  return localStorage.getItem('adminUserId');
};
```

### 3. React Component Example

```javascript
// SupervisorManagement.jsx
import React, { useState, useEffect } from 'react';
import { supervisorApi } from './services/supervisorApi';

const SupervisorManagement = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    loadSupervisors();
    loadStatistics();
  }, [filter]);

  const loadSupervisors = async () => {
    try {
      setLoading(true);
      const status = filter === 'ALL' ? null : filter;
      const data = await supervisorApi.getAllSupervisors(status);
      setSupervisors(data);
    } catch (error) {
      console.error('Failed to load supervisors:', error);
      // Show error notification
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await supervisorApi.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const handleVerify = async (supervisorId, notes) => {
    try {
      await supervisorApi.verifySupervisor(supervisorId, notes);
      // Show success notification
      loadSupervisors(); // Reload list
    } catch (error) {
      console.error('Failed to verify supervisor:', error);
      // Show error notification
    }
  };

  const handleReject = async (supervisorId, reason) => {
    try {
      await supervisorApi.rejectSupervisor(supervisorId, reason);
      // Show success notification
      loadSupervisors();
    } catch (error) {
      console.error('Failed to reject supervisor:', error);
      // Show error notification
    }
  };

  const handleUpdateLimits = async (supervisorId, limits) => {
    try {
      await supervisorApi.updateLimits(supervisorId, limits);
      // Show success notification
      loadSupervisors();
    } catch (error) {
      console.error('Failed to update limits:', error);
      // Show error notification
    }
  };

  return (
    <div className="supervisor-management">
      {/* Statistics Dashboard */}
      {statistics && (
        <div className="statistics-panel">
          <StatisticsCard
            title="Total Supervisors"
            value={statistics.totalSupervisors}
          />
          <StatisticsCard
            title="Pending"
            value={statistics.pendingSupervisors}
            highlight
          />
          <StatisticsCard
            title="Active Supervisors"
            value={statistics.activeSupervisors}
          />
          <StatisticsCard
            title="Patients Managed"
            value={statistics.totalUniquePatientsManaged}
          />
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button onClick={() => setFilter('ALL')}>All</button>
        <button onClick={() => setFilter('PENDING')}>Pending</button>
        <button onClick={() => setFilter('VERIFIED')}>Verified</button>
        <button onClick={() => setFilter('SUSPENDED')}>Suspended</button>
      </div>

      {/* Supervisors List */}
      <div className="supervisors-list">
        {loading ? (
          <LoadingSpinner />
        ) : (
          supervisors.map(supervisor => (
            <SupervisorCard
              key={supervisor.id}
              supervisor={supervisor}
              onVerify={handleVerify}
              onReject={handleReject}
              onUpdateLimits={handleUpdateLimits}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SupervisorManagement;
```

### 4. Error Handling

```javascript
// errorHandler.js
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  if (error.response) {
    // Server responded with error status
    const { data } = error.response;
    return data.message || defaultMessage;
  } else if (error.request) {
    // Request made but no response
    return 'No response from server. Please check your connection.';
  } else {
    // Error in request setup
    return error.message || defaultMessage;
  }
};
```

### 5. Status Badge Component

```javascript
// StatusBadge.jsx
const StatusBadge = ({ status }) => {
  const statusConfig = {
    PENDING: { color: 'orange', label: 'Pending Verification' },
    VERIFIED: { color: 'green', label: 'Verified' },
    REJECTED: { color: 'red', label: 'Rejected' },
    SUSPENDED: { color: 'gray', label: 'Suspended' }
  };

  const config = statusConfig[status] || { color: 'gray', label: status };

  return (
    <span className={`badge badge-${config.color}`}>
      {config.label}
    </span>
  );
};
```

---

## Testing Checklist

### Unit Tests
- [ ] Test API service functions
- [ ] Test error handling
- [ ] Test request header inclusion
- [ ] Test response parsing

### Integration Tests
- [ ] Test supervisor verification flow
- [ ] Test rejection flow
- [ ] Test limits update
- [ ] Test search functionality
- [ ] Test statistics loading

### UI Tests
- [ ] Test filter switching
- [ ] Test verification modal
- [ ] Test rejection modal
- [ ] Test limits edit form
- [ ] Test search input
- [ ] Test error notifications

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-13 | Initial API documentation |

---

## Support

For questions or issues with these APIs, please contact the backend development team or refer to the main Admin Service documentation.