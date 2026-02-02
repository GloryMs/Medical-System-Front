# Admin Coupon Management API Documentation

## Overview
This API provides comprehensive coupon management capabilities for administrators. It allows creating, distributing, validating, cancelling, and tracking coupons that can be issued to supervisors or patients for consultation fee discounts.

## Base URL
```
/api/admin/coupons
```

## Authentication
All endpoints (except internal service-to-service calls) require admin authentication:
- **Header**: `X-User-Id: {adminUserId}` (Long)

## Response Format
All endpoints return responses wrapped in the `ApiResponse` structure:

```json
{
  "success": true,
  "message": "Operation message",
  "data": { ... },
  "timestamp": "2026-01-14T10:30:00"
}
```

---

## Enums & Constants

### AdminCouponStatus
| Status | Description |
|--------|-------------|
| `CREATED` | Coupon created but not distributed |
| `DISTRIBUTED` | Coupon distributed to beneficiary |
| `USED` | Coupon has been redeemed (terminal) |
| `EXPIRED` | Coupon expired without use (terminal) |
| `CANCELLED` | Coupon cancelled by admin (terminal) |
| `SUSPENDED` | Temporarily suspended |

### BeneficiaryType
| Type | Description |
|------|-------------|
| `MEDICAL_SUPERVISOR` | Coupon issued to supervisor |
| `PATIENT` | Coupon issued directly to patient |

### DiscountType
| Type | Description |
|------|-------------|
| `PERCENTAGE` | Percentage discount (e.g., 20%) |
| `FIXED_AMOUNT` | Fixed amount discount (e.g., $50) |
| `FULL_COVERAGE` | Covers entire consultation fee |

### CouponBatchStatus
| Status | Description |
|--------|-------------|
| `CREATED` | Batch created, coupons not distributed |
| `DISTRIBUTED` | All coupons distributed |
| `PARTIALLY_USED` | Some coupons used |
| `FULLY_USED` | All coupons used |
| `EXPIRED` | All coupons expired |
| `CANCELLED` | Batch cancelled |

---

## API Endpoints

## 1. Coupon Creation

### 1.1 Create Single Coupon
Creates a new coupon with specified discount configuration.

**Endpoint**: `POST /api/admin/coupons`

**Headers**:
```
X-User-Id: 123
Content-Type: application/json
```

**Request Body**:
```json
{
  "couponCode": "SPRING2026",
  "discountType": "PERCENTAGE",
  "discountValue": 25.00,
  "maxDiscountAmount": 50.00,
  "currency": "USD",
  "beneficiaryType": "MEDICAL_SUPERVISOR",
  "beneficiaryId": 456,
  "expiresAt": "2026-12-31T23:59:59",
  "isTransferable": true,
  "notes": "Spring promotion coupon",
  "autoDistribute": false
}
```

**Request Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| couponCode | String | No | Custom code (auto-generated if not provided) |
| discountType | Enum | Yes | Type of discount: PERCENTAGE, FIXED_AMOUNT, FULL_COVERAGE |
| discountValue | BigDecimal | Yes | Discount value (1-100 for percentage, amount for fixed) |
| maxDiscountAmount | BigDecimal | No | Cap for percentage discounts |
| currency | String | No | Currency code (default: USD) |
| beneficiaryType | Enum | Yes | MEDICAL_SUPERVISOR or PATIENT |
| beneficiaryId | Long | No | Can distribute later if null |
| expiresAt | LocalDateTime | Yes | Must be in future |
| isTransferable | Boolean | No | Can be transferred between patients (default: true) |
| notes | String | No | Notes about the coupon |
| autoDistribute | Boolean | No | Auto-distribute after creation (default: false) |

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Coupon created successfully",
  "data": {
    "id": 1,
    "couponCode": "SPRING2026",
    "discountType": "PERCENTAGE",
    "discountValue": 25.00,
    "maxDiscountAmount": 50.00,
    "currency": "USD",
    "beneficiaryType": "MEDICAL_SUPERVISOR",
    "beneficiaryId": 456,
    "beneficiaryName": "Dr. John Smith",
    "status": "CREATED",
    "batchId": null,
    "batchCode": null,
    "createdBy": 123,
    "distributedBy": null,
    "distributedAt": null,
    "usedAt": null,
    "usedForCaseId": null,
    "usedForPaymentId": null,
    "usedByPatientId": null,
    "expiresAt": "2026-12-31T23:59:59",
    "isExpiringSoon": false,
    "daysUntilExpiry": 351,
    "isTransferable": true,
    "notes": "Spring promotion coupon",
    "cancellationReason": null,
    "cancelledAt": null,
    "cancelledBy": null,
    "createdAt": "2026-01-14T10:30:00",
    "updatedAt": "2026-01-14T10:30:00"
  },
  "timestamp": "2026-01-14T10:30:00"
}
```

---

### 1.2 Create Batch Coupons
Creates multiple coupons at once with the same configuration.

**Endpoint**: `POST /api/admin/coupons/batch`

**Headers**:
```
X-User-Id: 123
Content-Type: application/json
```

**Request Body**:
```json
{
  "batchCodePrefix": "WINTER2026",
  "totalCoupons": 100,
  "discountType": "FIXED_AMOUNT",
  "discountValue": 30.00,
  "maxDiscountAmount": null,
  "currency": "USD",
  "beneficiaryType": "MEDICAL_SUPERVISOR",
  "beneficiaryId": 456,
  "expiryDays": 180,
  "isTransferable": true,
  "notes": "Winter batch for supervisor",
  "autoDistribute": false
}
```

**Request Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| batchCodePrefix | String | No | Prefix for batch code (auto-generated if not provided) |
| totalCoupons | Integer | Yes | Number of coupons (1-1000) |
| discountType | Enum | Yes | PERCENTAGE, FIXED_AMOUNT, or FULL_COVERAGE |
| discountValue | BigDecimal | Yes | Discount value |
| maxDiscountAmount | BigDecimal | No | Cap for percentage discounts |
| currency | String | No | Currency code (default: USD) |
| beneficiaryType | Enum | Yes | MEDICAL_SUPERVISOR or PATIENT |
| beneficiaryId | Long | No | Can distribute later if null |
| expiryDays | Integer | Yes | Days until expiration (1-730) |
| isTransferable | Boolean | No | Default: true |
| notes | String | No | Notes about the batch |
| autoDistribute | Boolean | No | Default: false |

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Batch created with 100 coupons",
  "data": {
    "id": 10,
    "batchCode": "WINTER2026-BATCH-001",
    "beneficiaryType": "MEDICAL_SUPERVISOR",
    "beneficiaryId": 456,
    "beneficiaryName": "Dr. John Smith",
    "totalCoupons": 100,
    "availableCoupons": 100,
    "usedCoupons": 0,
    "expiredCoupons": 0,
    "cancelledCoupons": 0,
    "discountType": "FIXED_AMOUNT",
    "discountValue": 30.00,
    "maxDiscountAmount": null,
    "currency": "USD",
    "expiryDays": 180,
    "status": "CREATED",
    "createdBy": 123,
    "distributedBy": null,
    "distributedAt": null,
    "notes": "Winter batch for supervisor",
    "createdAt": "2026-01-14T10:30:00",
    "updatedAt": "2026-01-14T10:30:00"
  },
  "timestamp": "2026-01-14T10:30:00"
}
```

---

## 2. Coupon Distribution

### 2.1 Distribute Single Coupon
Distributes a coupon to a supervisor or patient.

**Endpoint**: `POST /api/admin/coupons/{couponId}/distribute`

**Path Parameters**:
- `couponId` (Long): ID of the coupon to distribute

**Headers**:
```
X-User-Id: 123
Content-Type: application/json
```

**Request Body**:
```json
{
  "beneficiaryType": "MEDICAL_SUPERVISOR",
  "beneficiaryId": 456,
  "notes": "Distributing for Q1 promotion",
  "sendNotification": true
}
```

**Request Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| beneficiaryType | Enum | Yes | MEDICAL_SUPERVISOR or PATIENT |
| beneficiaryId | Long | Yes | Supervisor or patient ID |
| notes | String | No | Distribution notes |
| sendNotification | Boolean | No | Send notification (default: true) |

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Coupon distributed successfully",
  "data": {
    "id": 1,
    "couponCode": "SPRING2026",
    "discountType": "PERCENTAGE",
    "discountValue": 25.00,
    "status": "DISTRIBUTED",
    "beneficiaryType": "MEDICAL_SUPERVISOR",
    "beneficiaryId": 456,
    "beneficiaryName": "Dr. John Smith",
    "distributedBy": 123,
    "distributedAt": "2026-01-14T10:35:00",
    ...
  },
  "timestamp": "2026-01-14T10:35:00"
}
```

---

### 2.2 Distribute Batch
Distributes all coupons in a batch to a beneficiary.

**Endpoint**: `POST /api/admin/coupons/batch/{batchId}/distribute`

**Path Parameters**:
- `batchId` (Long): ID of the batch to distribute

**Headers**:
```
X-User-Id: 123
Content-Type: application/json
```

**Request Body**:
```json
{
  "beneficiaryType": "MEDICAL_SUPERVISOR",
  "beneficiaryId": 456,
  "notes": "Q1 batch distribution",
  "sendNotification": true
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Batch distributed successfully",
  "data": {
    "id": 10,
    "batchCode": "WINTER2026-BATCH-001",
    "status": "DISTRIBUTED",
    "totalCoupons": 100,
    "availableCoupons": 100,
    "distributedBy": 123,
    "distributedAt": "2026-01-14T10:40:00",
    ...
  },
  "timestamp": "2026-01-14T10:40:00"
}
```

---

## 3. Coupon Validation (Internal API)

### 3.1 Validate Coupon
Validates a coupon for redemption. Called by payment-service before processing payment.

**Endpoint**: `POST /api/admin/coupons/validate`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "couponCode": "SPRING2026",
  "beneficiaryType": "MEDICAL_SUPERVISOR",
  "beneficiaryId": 456,
  "patientId": 789,
  "caseId": 1001,
  "requestedAmount": 200.00
}
```

**Request Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| couponCode | String | Yes | Coupon code to validate |
| beneficiaryType | Enum | Yes | MEDICAL_SUPERVISOR or PATIENT |
| beneficiaryId | Long | Yes | Beneficiary ID |
| patientId | Long | Yes | Patient using the coupon |
| caseId | Long | Yes | Case ID for payment |
| requestedAmount | BigDecimal | Yes | Consultation fee amount |

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "valid": true,
    "couponId": 1,
    "couponCode": "SPRING2026",
    "discountType": "PERCENTAGE",
    "discountValue": 25.00,
    "maxDiscountAmount": 50.00,
    "discountAmount": 50.00,
    "remainingAmount": 150.00,
    "originalAmount": 200.00,
    "currency": "USD",
    "expiresAt": "2026-12-31T23:59:59",
    "patientId": 789,
    "beneficiaryId": 456,
    "message": "Coupon is valid",
    "errorCode": null
  },
  "timestamp": "2026-01-14T10:45:00"
}
```

**Validation Failure Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "valid": false,
    "couponCode": "SPRING2026",
    "message": "Coupon has already been used",
    "errorCode": "COUPON_ALREADY_USED"
  },
  "timestamp": "2026-01-14T10:45:00"
}
```

**Error Codes**:
- `COUPON_NOT_FOUND` - Coupon code doesn't exist
- `COUPON_ALREADY_USED` - Coupon has been redeemed
- `COUPON_EXPIRED` - Coupon has expired
- `COUPON_CANCELLED` - Coupon was cancelled
- `COUPON_SUSPENDED` - Coupon is suspended
- `INVALID_BENEFICIARY` - Wrong beneficiary trying to use
- `COUPON_NOT_DISTRIBUTED` - Coupon hasn't been distributed yet

---

## 4. Mark Coupon as Used (Internal API)

### 4.1 Mark Coupon as Used
Marks a coupon as used after successful payment. Called by payment-service.

**Endpoint**: `POST /api/admin/coupons/{couponCode}/mark-used`

**Path Parameters**:
- `couponCode` (String): Coupon code to mark as used

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "couponCode": "SPRING2026",
  "caseId": 1001,
  "patientId": 789,
  "paymentId": 5001,
  "discountApplied": 50.00,
  "amountCharged": 150.00,
  "usedAt": "2026-01-14T10:50:00",
  "redeemedByUserId": 456
}
```

**Request Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| couponCode | String | Yes | Coupon code |
| caseId | Long | Yes | Case ID |
| patientId | Long | Yes | Patient ID |
| paymentId | Long | Yes | Payment ID |
| discountApplied | BigDecimal | Yes | Discount amount applied |
| amountCharged | BigDecimal | Yes | Remaining amount charged |
| usedAt | LocalDateTime | Yes | When coupon was used |
| redeemedByUserId | Long | Yes | User ID who redeemed |

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "success": true,
    "couponId": 1,
    "couponCode": "SPRING2026",
    "usedAt": "2026-01-14T10:50:00",
    "paymentId": 5001,
    "message": "Coupon marked as used successfully",
    "errorCode": null
  },
  "timestamp": "2026-01-14T10:50:00"
}
```

---

## 5. Coupon Cancellation

### 5.1 Cancel Single Coupon
Cancels a coupon (cannot cancel used coupons).

**Endpoint**: `POST /api/admin/coupons/{couponId}/cancel`

**Path Parameters**:
- `couponId` (Long): ID of the coupon to cancel

**Headers**:
```
X-User-Id: 123
Content-Type: application/json
```

**Request Body**:
```json
{
  "reason": "Customer request for refund",
  "sendNotification": true
}
```

**Request Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reason | String | Yes | Cancellation reason |
| sendNotification | Boolean | No | Send notification (default: true) |

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Coupon cancelled successfully",
  "data": {
    "id": 1,
    "couponCode": "SPRING2026",
    "status": "CANCELLED",
    "cancellationReason": "Customer request for refund",
    "cancelledAt": "2026-01-14T11:00:00",
    "cancelledBy": 123,
    ...
  },
  "timestamp": "2026-01-14T11:00:00"
}
```

---

### 5.2 Cancel Batch
Cancels all non-used coupons in a batch.

**Endpoint**: `POST /api/admin/coupons/batch/{batchId}/cancel`

**Path Parameters**:
- `batchId` (Long): ID of the batch to cancel

**Headers**:
```
X-User-Id: 123
Content-Type: application/json
```

**Request Body**:
```json
{
  "reason": "Promotion ended early",
  "sendNotification": true
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Batch cancelled successfully",
  "data": {
    "id": 10,
    "batchCode": "WINTER2026-BATCH-001",
    "status": "CANCELLED",
    "totalCoupons": 100,
    "cancelledCoupons": 95,
    "usedCoupons": 5,
    ...
  },
  "timestamp": "2026-01-14T11:05:00"
}
```

---

## 6. Coupon Retrieval

### 6.1 Get Coupon by ID
Retrieves a specific coupon by ID.

**Endpoint**: `GET /api/admin/coupons/{couponId}`

**Path Parameters**:
- `couponId` (Long): Coupon ID

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "couponCode": "SPRING2026",
    "discountType": "PERCENTAGE",
    "discountValue": 25.00,
    "status": "DISTRIBUTED",
    ...
  },
  "timestamp": "2026-01-14T11:10:00"
}
```

---

### 6.2 Get Coupon by Code
Retrieves a specific coupon by code.

**Endpoint**: `GET /api/admin/coupons/code/{couponCode}`

**Path Parameters**:
- `couponCode` (String): Coupon code

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "couponCode": "SPRING2026",
    "discountType": "PERCENTAGE",
    "discountValue": 25.00,
    "status": "DISTRIBUTED",
    ...
  },
  "timestamp": "2026-01-14T11:10:00"
}
```

---

### 6.3 Get All Coupons (with Filters)
Retrieves coupons with optional filters and pagination.

**Endpoint**: `GET /api/admin/coupons`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | Enum | No | Filter by AdminCouponStatus |
| beneficiaryType | Enum | No | Filter by BeneficiaryType |
| beneficiaryId | Long | No | Filter by beneficiary ID |
| batchId | Long | No | Filter by batch ID |
| couponCode | String | No | Filter by coupon code (partial match) |
| page | Integer | No | Page number (default: 0) |
| size | Integer | No | Page size (default: 20) |
| sortBy | String | No | Sort field (default: createdAt) |
| sortDir | String | No | Sort direction: asc/desc (default: desc) |

**Example Request**:
```
GET /api/admin/coupons?status=DISTRIBUTED&beneficiaryType=MEDICAL_SUPERVISOR&page=0&size=10
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "couponCode": "SPRING2026",
        "discountType": "PERCENTAGE",
        "discountValue": 25.00,
        "status": "DISTRIBUTED",
        ...
      },
      {
        "id": 2,
        "couponCode": "SUMMER2026",
        "discountType": "FIXED_AMOUNT",
        "discountValue": 30.00,
        "status": "DISTRIBUTED",
        ...
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10,
      "sort": {
        "sorted": true,
        "unsorted": false,
        "empty": false
      },
      "offset": 0,
      "paged": true,
      "unpaged": false
    },
    "totalPages": 5,
    "totalElements": 50,
    "last": false,
    "size": 10,
    "number": 0,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    },
    "numberOfElements": 10,
    "first": true,
    "empty": false
  },
  "timestamp": "2026-01-14T11:15:00"
}
```

---

### 6.4 Get Coupons for Beneficiary
Retrieves all coupons for a specific supervisor or patient.

**Endpoint**: `GET /api/admin/coupons/beneficiary/{type}/{beneficiaryId}`

**Path Parameters**:
- `type` (BeneficiaryType): MEDICAL_SUPERVISOR or PATIENT
- `beneficiaryId` (Long): Beneficiary ID

**Example Request**:
```
GET /api/admin/coupons/beneficiary/MEDICAL_SUPERVISOR/456
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "couponCode": "SPRING2026",
      "discountType": "PERCENTAGE",
      "discountValue": 25.00,
      "status": "DISTRIBUTED",
      "beneficiaryType": "MEDICAL_SUPERVISOR",
      "beneficiaryId": 456,
      ...
    },
    {
      "id": 2,
      "couponCode": "SUMMER2026",
      "discountType": "FIXED_AMOUNT",
      "discountValue": 30.00,
      "status": "USED",
      ...
    }
  ],
  "timestamp": "2026-01-14T11:20:00"
}
```

---

### 6.5 Get Available Coupons for Beneficiary
Retrieves available (not used, not expired) coupons for a beneficiary.

**Endpoint**: `GET /api/admin/coupons/beneficiary/{type}/{beneficiaryId}/available`

**Path Parameters**:
- `type` (BeneficiaryType): MEDICAL_SUPERVISOR or PATIENT
- `beneficiaryId` (Long): Beneficiary ID

**Example Request**:
```
GET /api/admin/coupons/beneficiary/MEDICAL_SUPERVISOR/456/available
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "couponCode": "SPRING2026",
      "discountType": "PERCENTAGE",
      "discountValue": 25.00,
      "status": "DISTRIBUTED",
      "expiresAt": "2026-12-31T23:59:59",
      "daysUntilExpiry": 351,
      ...
    }
  ],
  "timestamp": "2026-01-14T11:25:00"
}
```

---

### 6.6 Get Expiring Coupons
Retrieves coupons expiring within specified days.

**Endpoint**: `GET /api/admin/coupons/expiring`

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| days | Integer | No | 30 | Days until expiration |

**Example Request**:
```
GET /api/admin/coupons/expiring?days=30
```

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Found 15 coupons expiring within 30 days",
  "data": [
    {
      "id": 1,
      "couponCode": "SPRING2026",
      "status": "DISTRIBUTED",
      "expiresAt": "2026-02-10T23:59:59",
      "daysUntilExpiry": 27,
      "isExpiringSoon": true,
      ...
    }
  ],
  "timestamp": "2026-01-14T11:30:00"
}
```

---

## 7. Batch Retrieval

### 7.1 Get Batch by ID
Retrieves a specific batch by ID.

**Endpoint**: `GET /api/admin/coupons/batch/{batchId}`

**Path Parameters**:
- `batchId` (Long): Batch ID

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 10,
    "batchCode": "WINTER2026-BATCH-001",
    "beneficiaryType": "MEDICAL_SUPERVISOR",
    "beneficiaryId": 456,
    "beneficiaryName": "Dr. John Smith",
    "totalCoupons": 100,
    "availableCoupons": 85,
    "usedCoupons": 10,
    "expiredCoupons": 3,
    "cancelledCoupons": 2,
    "discountType": "FIXED_AMOUNT",
    "discountValue": 30.00,
    "status": "PARTIALLY_USED",
    ...
  },
  "timestamp": "2026-01-14T11:35:00"
}
```

---

### 7.2 Get All Batches (with Filters)
Retrieves batches with optional filters and pagination.

**Endpoint**: `GET /api/admin/coupons/batches`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | CouponBatchStatus | No | Filter by batch status |
| beneficiaryType | BeneficiaryType | No | Filter by beneficiary type |
| beneficiaryId | Long | No | Filter by beneficiary ID |
| batchCode | String | No | Filter by batch code (partial match) |
| page | Integer | No | Page number (default: 0) |
| size | Integer | No | Page size (default: 20) |
| sortBy | String | No | Sort field (default: createdAt) |
| sortDir | String | No | Sort direction: asc/desc (default: desc) |

**Example Request**:
```
GET /api/admin/coupons/batches?status=DISTRIBUTED&page=0&size=10
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 10,
        "batchCode": "WINTER2026-BATCH-001",
        "totalCoupons": 100,
        "availableCoupons": 85,
        "usedCoupons": 10,
        "status": "PARTIALLY_USED",
        ...
      }
    ],
    "pageable": { ... },
    "totalPages": 3,
    "totalElements": 25,
    ...
  },
  "timestamp": "2026-01-14T11:40:00"
}
```

---

### 7.3 Get Coupons in Batch
Retrieves all coupons belonging to a specific batch.

**Endpoint**: `GET /api/admin/coupons/batch/{batchId}/coupons`

**Path Parameters**:
- `batchId` (Long): Batch ID

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | Integer | No | 0 | Page number |
| size | Integer | No | 20 | Page size |

**Example Request**:
```
GET /api/admin/coupons/batch/10/coupons?page=0&size=50
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "couponCode": "WINTER2026-001",
        "batchId": 10,
        "batchCode": "WINTER2026-BATCH-001",
        "status": "DISTRIBUTED",
        ...
      },
      {
        "id": 2,
        "couponCode": "WINTER2026-002",
        "batchId": 10,
        "batchCode": "WINTER2026-BATCH-001",
        "status": "USED",
        ...
      }
    ],
    "pageable": { ... },
    "totalElements": 100,
    ...
  },
  "timestamp": "2026-01-14T11:45:00"
}
```

---

## 8. Statistics & Analytics

### 8.1 Get Coupon Summary
Retrieves overall coupon statistics and counts.

**Endpoint**: `GET /api/admin/coupons/summary`

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "totalCoupons": 500,
    "createdCoupons": 50,
    "distributedCoupons": 300,
    "usedCoupons": 100,
    "expiredCoupons": 30,
    "cancelledCoupons": 20,
    "expiringSoonCoupons": 45,
    "totalAvailableValue": 15000.00,
    "totalRedeemedValue": 5000.00,
    "totalExpiredValue": 1500.00,
    "beneficiarySummaries": [
      {
        "beneficiaryType": "MEDICAL_SUPERVISOR",
        "beneficiaryId": 456,
        "beneficiaryName": "Dr. John Smith",
        "totalCoupons": 150,
        "availableCoupons": 100,
        "usedCoupons": 40,
        "expiredCoupons": 10,
        "availableValue": 5000.00,
        "usedValue": 2000.00
      },
      {
        "beneficiaryType": "PATIENT",
        "beneficiaryId": 789,
        "beneficiaryName": "Jane Doe",
        "totalCoupons": 10,
        "availableCoupons": 5,
        "usedCoupons": 3,
        "expiredCoupons": 2,
        "availableValue": 250.00,
        "usedValue": 150.00
      }
    ]
  },
  "timestamp": "2026-01-14T11:50:00"
}
```

---

### 8.2 Get Coupon Summary for Beneficiary
Retrieves coupon statistics for a specific supervisor or patient.

**Endpoint**: `GET /api/admin/coupons/summary/beneficiary/{type}/{beneficiaryId}`

**Path Parameters**:
- `type` (BeneficiaryType): MEDICAL_SUPERVISOR or PATIENT
- `beneficiaryId` (Long): Beneficiary ID

**Example Request**:
```
GET /api/admin/coupons/summary/beneficiary/MEDICAL_SUPERVISOR/456
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "totalCoupons": 150,
    "createdCoupons": 0,
    "distributedCoupons": 100,
    "usedCoupons": 40,
    "expiredCoupons": 8,
    "cancelledCoupons": 2,
    "expiringSoonCoupons": 15,
    "totalAvailableValue": 5000.00,
    "totalRedeemedValue": 2000.00,
    "totalExpiredValue": 400.00,
    "patientSummaries": [
      {
        "patientId": 789,
        "patientName": "Jane Doe",
        "availableCoupons": 3,
        "usedCoupons": 2,
        "expiredCoupons": 1,
        "availableValue": 150.00,
        "usedValue": 100.00
      },
      {
        "patientId": 790,
        "patientName": "John Patient",
        "availableCoupons": 5,
        "usedCoupons": 3,
        "expiredCoupons": 0,
        "availableValue": 250.00,
        "usedValue": 150.00
      }
    ]
  },
  "timestamp": "2026-01-14T11:55:00"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "timestamp": "2026-01-14T12:00:00"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Coupon not found with ID: 999",
  "data": null,
  "timestamp": "2026-01-14T12:00:00"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Cannot cancel coupon: Coupon has already been used",
  "data": null,
  "timestamp": "2026-01-14T12:00:00"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "An unexpected error occurred",
  "data": null,
  "timestamp": "2026-01-14T12:00:00"
}
```

---

## Common Use Cases

### Use Case 1: Create and Distribute Individual Coupon
1. Create coupon: `POST /api/admin/coupons`
2. Distribute to supervisor: `POST /api/admin/coupons/{couponId}/distribute`
3. Supervisor or patient redeems during payment (payment-service calls validate & mark-used)

### Use Case 2: Create Batch for Supervisor
1. Create batch: `POST /api/admin/coupons/batch` with `beneficiaryType=MEDICAL_SUPERVISOR`
2. Distribute batch: `POST /api/admin/coupons/batch/{batchId}/distribute`
3. View coupons in batch: `GET /api/admin/coupons/batch/{batchId}/coupons`

### Use Case 3: Monitor Coupon Usage
1. Get overall summary: `GET /api/admin/coupons/summary`
2. Check expiring coupons: `GET /api/admin/coupons/expiring?days=30`
3. View supervisor's coupons: `GET /api/admin/coupons/beneficiary/MEDICAL_SUPERVISOR/456`

### Use Case 4: Cancel Promotion
1. Find batch: `GET /api/admin/coupons/batches?batchCode=PROMO2026`
2. Cancel batch: `POST /api/admin/coupons/batch/{batchId}/cancel`

---

## Frontend Implementation Notes

### For AdminCouponManagement.jsx

**Key Features to Implement**:
1. **Coupon List View**: Use `GET /api/admin/coupons` with filters and pagination
2. **Create Coupon Form**: Use `POST /api/admin/coupons`
3. **Create Batch Form**: Use `POST /api/admin/coupons/batch`
4. **Distribute Modal**: Use `POST /api/admin/coupons/{couponId}/distribute`
5. **Cancel Action**: Use `POST /api/admin/coupons/{couponId}/cancel`
6. **Statistics Dashboard**: Use `GET /api/admin/coupons/summary`
7. **Expiring Coupons Alert**: Use `GET /api/admin/coupons/expiring?days=30`
8. **Batch Management**: Use batch endpoints for viewing and managing batches

**Recommended State Management**:
- List of coupons with pagination
- List of batches with pagination
- Summary statistics
- Filters (status, beneficiaryType, etc.)
- Selected coupon/batch for actions

**UI Components Needed**:
- Coupon list table with filters
- Create/Edit coupon form
- Create batch form
- Distribute modal
- Cancel confirmation modal
- Statistics cards
- Batch details view
- Expiring coupons alert banner

---

## API Base Configuration

**For development**:
```javascript
const API_BASE_URL = 'http://localhost:8081/api/admin/coupons';
```

**Example Axios Configuration**:
```javascript
import axios from 'axios';

const couponApi = axios.create({
  baseURL: 'http://localhost:8081/api/admin/coupons',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add auth interceptor
couponApi.interceptors.request.use(config => {
  const adminUserId = localStorage.getItem('adminUserId');
  if (adminUserId) {
    config.headers['X-User-Id'] = adminUserId;
  }
  return config;
});
```

---

**Document Version**: 1.0
**Last Updated**: 2026-01-14
**API Version**: v1