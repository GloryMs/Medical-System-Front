# Medical Supervisor Role - Complete Implementation Plan

**Version**: 1.0 | **Created**: December 29, 2025 | **Status**: Ready for Implementation

---

## Main requirements:
We need to add a new role to the system, this role will be named Medical Supervisor, who will be responsible for managing the cases on behalf of the patients, i.e. we may have many account in the  system with such role, and they will add patient's profile, submit the cases on behalf the patient, follow up the case, organize the appointments (based on doctor suggestion as current situation), as well as the communication (based on case as current situation), ending with case closure. noting that the payments of cases submitted by this role will be available in two options: option #1 as current implementation i.e. pay for each case as usual, option #2 will be based on coupon for each patient. 

## 1. Executive Summary

The Medical Supervisor role is a new intermediary role that acts on behalf of patients to manage their medical cases. Key features include patient management, case submission, appointment handling, and dual payment options (Stripe or Coupons).

### Role Hierarchy
```
ADMIN → MEDICAL SUPERVISOR → DOCTOR → PATIENT
```

---

## 2. Confirmed Business Rules

| Question | Decision |
|----------|----------|
| Patient Awareness | **No** - Patients unaware of supervisor |
| Coupon Amount | **Fixed platform-wide fee ($100)** |
| Supervisor Limits | **Default: 3 patients, 2 active cases/patient** |
| Verification | **License document required** |
| Communication | **Supervisor only** |
| Coupon Expiration | **6 months default** |
| Coupon Transferability | **No** - Tied to specific patient |

---

## 3. Database Schema

### 3.1 New Enums (common-library)

```java
// Add to UserRole.java
MEDICAL_SUPERVISOR

// New enums
SupervisorVerificationStatus: PENDING, VERIFIED, REJECTED, SUSPENDED
SupervisorAssignmentStatus: ACTIVE, SUSPENDED, TERMINATED
CouponStatus: AVAILABLE, USED, EXPIRED, CANCELLED
```

### 3.2 New Tables (medical_supervisor_db)

```sql
-- medical_supervisors
CREATE TABLE medical_supervisors (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    organization_name VARCHAR(255),
    organization_type VARCHAR(100),
    license_number VARCHAR(100),
    license_document_path VARCHAR(500),
    phone_number VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    verification_status VARCHAR(50) DEFAULT 'PENDING',
    verification_notes TEXT,
    verified_at TIMESTAMP,
    verified_by BIGINT,
    rejection_reason TEXT,
    max_patients_limit INT,
    max_active_cases_per_patient INT,
    is_available BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- supervisor_patient_assignments
CREATE TABLE supervisor_patient_assignments (
    id BIGSERIAL PRIMARY KEY,
    supervisor_id BIGINT NOT NULL REFERENCES medical_supervisors(id),
    patient_id BIGINT NOT NULL,
    assignment_status VARCHAR(50) DEFAULT 'ACTIVE',
    assigned_at TIMESTAMP DEFAULT NOW(),
    assigned_by BIGINT,
    assignment_notes TEXT,
    terminated_at TIMESTAMP,
    termination_reason TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT uk_supervisor_patient UNIQUE(supervisor_id, patient_id)
);

-- supervisor_coupons
CREATE TABLE supervisor_coupons (
    id BIGSERIAL PRIMARY KEY,
    coupon_code VARCHAR(50) NOT NULL UNIQUE,
    supervisor_id BIGINT NOT NULL REFERENCES medical_supervisors(id),
    patient_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    case_id BIGINT,
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    issued_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    issued_by BIGINT NOT NULL,
    batch_id BIGINT,
    notes TEXT,
    cancellation_reason TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- coupon_batches
CREATE TABLE coupon_batches (
    id BIGSERIAL PRIMARY KEY,
    batch_code VARCHAR(50) NOT NULL UNIQUE,
    supervisor_id BIGINT NOT NULL REFERENCES medical_supervisors(id),
    patient_id BIGINT NOT NULL,
    total_coupons INT NOT NULL,
    amount_per_coupon DECIMAL(10,2) NOT NULL,
    expiry_months INT DEFAULT 6,
    issued_by BIGINT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- supervisor_settings
CREATE TABLE supervisor_settings (
    id BIGSERIAL PRIMARY KEY,
    supervisor_id BIGINT NOT NULL UNIQUE REFERENCES medical_supervisors(id),
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    push_notifications BOOLEAN DEFAULT TRUE,
    new_case_assignment_notification BOOLEAN DEFAULT TRUE,
    appointment_reminders_notification BOOLEAN DEFAULT TRUE,
    case_status_update_notification BOOLEAN DEFAULT TRUE,
    coupon_issued_notification BOOLEAN DEFAULT TRUE,
    coupon_expiring_notification BOOLEAN DEFAULT TRUE,
    preferred_language VARCHAR(10) DEFAULT 'EN',
    timezone VARCHAR(50) DEFAULT 'UTC',
    theme VARCHAR(20) DEFAULT 'light',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3.3 Updates to Existing Tables

```sql
-- patient-service: cases table
ALTER TABLE cases 
ADD COLUMN submitted_by_supervisor_id BIGINT,
ADD COLUMN is_supervisor_managed BOOLEAN DEFAULT FALSE;

-- patient-service: patients table
ALTER TABLE patients
ADD COLUMN created_by_supervisor_id BIGINT,
ADD COLUMN is_supervisor_managed BOOLEAN DEFAULT FALSE;

-- payment-service: payments table
ALTER TABLE payments 
ADD COLUMN coupon_id BIGINT,
ADD COLUMN payment_source VARCHAR(50) DEFAULT 'DIRECT';

-- payment-service: new table
CREATE TABLE coupon_redemptions (
    id BIGSERIAL PRIMARY KEY,
    coupon_id BIGINT NOT NULL,
    payment_id BIGINT NOT NULL,
    case_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    supervisor_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    redeemed_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.4 Configuration Values

```sql
INSERT INTO medical_configurations (config_key, config_value, config_type, description, is_active) VALUES
('SUPERVISOR_MAX_PATIENTS_DEFAULT', '3', 'SUPERVISOR', 'Default max patients', true),
('SUPERVISOR_MAX_ACTIVE_CASES_PER_PATIENT', '2', 'SUPERVISOR', 'Max active cases/patient', true),
('SUPERVISOR_COUPON_DEFAULT_EXPIRY_MONTHS', '6', 'SUPERVISOR', 'Coupon expiry months', true),
('COUPON_EXPIRY_WARNING_DAYS', '30', 'SUPERVISOR', 'Warning days before expiry', true),
('PLATFORM_CONSULTATION_FEE', '100.00', 'PAYMENT', 'Fixed consultation fee', true);
```

---

## 4. Backend Implementation

### 4.1 Service Structure

```
supervisor-service/
├── entity/
│   ├── MedicalSupervisor.java
│   ├── SupervisorPatientAssignment.java
│   ├── SupervisorCoupon.java
│   ├── CouponBatch.java
│   └── SupervisorSettings.java
├── repository/
├── service/
│   ├── SupervisorProfileService.java
│   ├── PatientManagementService.java
│   ├── CaseManagementService.java
│   ├── AppointmentManagementService.java
│   ├── CouponService.java
│   ├── SupervisorDashboardService.java
│   └── SupervisorValidationService.java
├── controller/
├── dto/
├── feign/
├── kafka/
└── exception/
```
### 4.2 Supervisor-Service API Documentation

## 👤 Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/supervisors/profile` | Create profile |
| GET | `/api/supervisors/profile` | Get profile |
| PUT | `/api/supervisors/profile` | Update profile |
| POST | `/api/supervisors/profile/license-document` | Upload license (multipart) |
| DELETE | `/api/supervisors/profile` | Delete profile |

---

## 👥 Patients

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/supervisors/patients` | Get all assigned patients |
| POST | `/api/supervisors/patients?patientId={id}&notes={notes}` | Assign patient by ID |
| POST | `/api/supervisors/patients/create-and-assign` | Create new patient and assign |
| POST | `/api/supervisors/patients/assign-by-email` | Assign existing patient by email |
| GET | `/api/supervisors/patients/{patientId}` | Get patient assignment |
| DELETE | `/api/supervisors/patients/{patientId}?reason={reason}` | Remove assignment |
| GET | `/api/supervisors/patients/ids` | Get patient IDs list |

---

## 📋 Cases

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/supervisors/cases/patient/{patientId}` | Submit case for patient |
| GET | `/api/supervisors/cases` | Get all cases |
| GET | `/api/supervisors/cases/patient/{patientId}` | Get patient cases |
| GET | `/api/supervisors/cases/{caseId}` | Get case details |
| PUT | `/api/supervisors/cases/{caseId}` | Update case |
| PUT | `/api/supervisors/cases/{caseId}/cancel?reason={reason}` | Cancel case |
| GET | `/api/supervisors/cases/patient/{patientId}/info` | Get patient info |

---

## 📊 Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/supervisors/dashboard/statistics` | Get dashboard stats |
| GET | `/api/supervisors/dashboard/activity?limit={n}` | Get recent activity |
| GET | `/api/supervisors/dashboard/metrics` | Get performance metrics |

---

## 💰 Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/supervisors/payments/coupon/{caseId}?patientId={id}` | Redeem coupon |
| GET | `/api/supervisors/payments/coupons` | Get coupon summary |
| GET | `/api/supervisors/payments/coupons/patient/{patientId}` | Get available coupons |
| GET | `/api/supervisors/payments/history?patientId={id}` | Get payment history |

---

## ⚙️ Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/supervisors/settings` | Get settings |
| PUT | `/api/supervisors/settings` | Update settings |

---

## 📝 Request Body Fields

### Create Patient and Assign (`/patients/create-and-assign`)
```json
{
  "email": "patient@example.com",
  "fullName": "John Doe",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "MALE",
  "bloodType": "O_POSITIVE"
}
```

### Assign Patient by Email (`/patients/assign-by-email`)
```json
{
  "patientEmail": "patient@example.com",
  "notes": "Optional assignment notes"
}
```

### Case Submission Fields (`/cases/patient/{patientId}`)

**Required:**
- `caseTitle` (string, 10-100 chars)
- `description` (string, 50-2000 chars)
- `requiredSpecialization` (string)
- `urgencyLevel` (enum: LOW, MEDIUM, HIGH, CRITICAL)

**Optional:**
- `primaryDiseaseCode` (string)
- `secondaryDiseaseCodes` (array)
- `symptomCodes` (array)
- `currentMedicationCodes` (array)
- `secondarySpecializations` (array)
- `complexity` (enum: SIMPLE, MODERATE, COMPLEX, VERY_COMPLEX)
- `requiresSecondOpinion` (boolean, default: true)
- `minDoctorsRequired` (integer, default: 2)
- `maxDoctorsAllowed` (integer, default: 3)
- `dependentId` (number, optional)

---

## 🎨 Common Enums

**VerificationStatus:** `PENDING` | `VERIFIED` | `REJECTED` | `SUSPENDED`

**CaseStatus:** `SUBMITTED` | `PENDING` | `ASSIGNED` | `IN_PROGRESS` | `COMPLETED` | `CLOSED`

**UrgencyLevel:** `LOW` | `MEDIUM` | `HIGH` | `CRITICAL`

**CaseComplexity:** `SIMPLE` | `MODERATE` | `COMPLEX` | `VERY_COMPLEX`

**PaymentStatus:** `PENDING` | `COMPLETED` | `FAILED` | `REFUNDED`

---

## ⚡ Response Format

```json
{
  "success": true,
  "message": "Optional message",
  "data": { /* Response data */ }
}
```

## 5. Frontend Implementation

### 5.1 Routes

```jsx
<Route path="supervisor/*">
  <Route path="dashboard" element={<SupervisorDashboard />} />
  <Route path="patients" element={<SupervisorPatients />} />
  <Route path="patients/create" element={<CreatePatient />} />
  <Route path="patients/:patientId" element={<PatientDetails />} />
  <Route path="patients/:patientId/cases/create" element={<CreateCaseForPatient />} />
  <Route path="cases" element={<SupervisorCases />} />
  <Route path="cases/:caseId" element={<SupervisorCaseDetails />} />
  <Route path="appointments" element={<SupervisorAppointments />} />
  <Route path="coupons" element={<CouponManagement />} />
  <Route path="payment/:caseId" element={<PaymentOptions />} />
  <Route path="payments" element={<SupervisorPayments />} />
  <Route path="communication" element={<SupervisorCommunication />} />
  <Route path="profile" element={<SupervisorProfile />} />
  <Route path="settings" element={<SupervisorSettings />} />
</Route>
```

### 5.2 Sidebar Navigation

```jsx
case 'MEDICAL_SUPERVISOR':
  return [
    { name: 'Dashboard', href: '/app/supervisor/dashboard', icon: Home },
    { name: 'My Patients', href: '/app/supervisor/patients', icon: Users },
    { name: 'All Cases', href: '/app/supervisor/cases', icon: FileText },
    { name: 'Appointments', href: '/app/supervisor/appointments', icon: Calendar },
    { name: 'Coupons', href: '/app/supervisor/coupons', icon: Ticket },
    { name: 'Payments', href: '/app/supervisor/payments', icon: CreditCard },
    { name: 'Messages', href: '/app/supervisor/communication', icon: MessageSquare },
    { name: 'Profile', href: '/app/supervisor/profile', icon: User },
    { name: 'Settings', href: '/app/supervisor/settings', icon: Settings },
  ];
```

### 5.3 supervisorService.js

```javascript
const supervisorService = {
  // Profile
  getProfile: () => api.get('/supervisors/profile'),
  createProfile: (data) => api.post('/supervisors/profile', data),
  updateProfile: (data) => api.put('/supervisors/profile', data),
  uploadLicenseDocument: (file) => { /* multipart form */ },

  // Patients
  getPatients: () => api.get('/supervisors/patients'),
  createPatient: (data) => api.post('/supervisors/patients', data),
  getPatientDetails: (id) => api.get(`/supervisors/patients/${id}`),
  getPatientCoupons: (id) => api.get(`/supervisors/patients/${id}/coupons`),

  // Cases
  getCases: (patientId, status) => api.get('/supervisors/cases', { params: { patientId, status } }),
  getCaseDetails: (id) => api.get(`/supervisors/cases/${id}`),
  submitCase: (patientId, data, files) => { /* multipart form */ },

  // Payments
  createDirectPaymentIntent: (caseId) => api.post(`/supervisors/payments/direct/${caseId}`),
  redeemCoupon: (caseId, couponCode) => api.post(`/supervisors/payments/coupon/${caseId}`, { couponCode }),
  getCouponSummary: () => api.get('/supervisors/payments/coupons'),

  // Dashboard
  getDashboard: () => api.get('/supervisors/dashboard'),
};
```

---

## 6. Payment Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    PAYMENT OPTIONS                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐          ┌─────────────────┐           │
│  │  DIRECT PAYMENT │          │  COUPON PAYMENT │           │
│  │  (Stripe)       │          │  (Pre-paid)     │           │
│  └────────┬────────┘          └────────┬────────┘           │
│           │                            │                     │
│           ▼                            ▼                     │
│  ┌─────────────────┐          ┌─────────────────┐           │
│  │ Create Payment  │          │ Select Coupon   │           │
│  │ Intent          │          │ for Patient     │           │
│  └────────┬────────┘          └────────┬────────┘           │
│           │                            │                     │
│           ▼                            ▼                     │
│  ┌─────────────────┐          ┌─────────────────┐           │
│  │ Stripe Checkout │          │ Validate Coupon │           │
│  └────────┬────────┘          │ - Status        │           │
│           │                   │ - Expiry        │           │
│           │                   │ - Patient Match │           │
│           │                   └────────┬────────┘           │
│           │                            │                     │
│           ▼                            ▼                     │
│  ┌─────────────────┐          ┌─────────────────┐           │
│  │ Webhook:        │          │ Mark Coupon     │           │
│  │ Payment Success │          │ as USED         │           │
│  └────────┬────────┘          └────────┬────────┘           │
│           │                            │                     │
│           └────────────┬───────────────┘                     │
│                        │                                     │
│                        ▼                                     │
│             ┌─────────────────┐                              │
│             │ Create Payment  │                              │
│             │ Record          │                              │
│             └────────┬────────┘                              │
│                      │                                       │
│                      ▼                                       │
│             ┌─────────────────┐                              │
│             │ Update Case     │                              │
│             │ Payment Status  │                              │
│             └─────────────────┘                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Kafka Events

```
supervisor.registered
supervisor.verified
supervisor.suspended
supervisor.patient.assigned
supervisor.patient.removed
supervisor.case.submitted
coupon.issued
coupon.redeemed
coupon.expired
coupon.cancelled
coupon.expiring-soon
```

---

## 8. Implementation Phases

| Phase | Week | Tasks |
|-------|------|-------|
| **1. Foundation** | 1-2 | Database schema, enums, project setup |
| **2. Core Backend** | 3-4 | Profile, patient, case management |
| **3. Coupon System** | 5-6 | Coupon CRUD, redemption, scheduled tasks |
| **4. Admin Panel** | 7-8 | Verification, coupon issuance, reports |
| **5. Frontend** | 9-10 | All supervisor pages and components |
| **6. Integration** | 11-12 | Testing, notifications, documentation |

---

## 9. Files Checklist

### Backend
- [ ] `common-library`: Add `MEDICAL_SUPERVISOR` to UserRole
- [ ] `common-library`: Create new enum files
- [ ] `supervisor-service`: Complete new microservice
- [ ] `patient-service`: Update Case and Patient entities


### Frontend
- [ ] 14 new pages in `src/pages/supervisor/`
- [ ] 7 new components in `src/components/supervisor/`
- [ ] `supervisorService.js` API client
- [ ] `supervisorSlice.js` Redux store
- [ ] Update `App.jsx` routes
- [ ] Update `Sidebar.jsx` navigation

---

## 10. Security Considerations

1. **Access Control**: Supervisor can ONLY access assigned patients
2. **Verification**: Admin verification required before activation
3. **Limits**: Max patients and active cases enforced
4. **Coupon Validation**: Ownership, patient match, expiry checks
5. **Data Isolation**: Patient unaware of supervisor management
6. **Audit Trail**: All actions logged, coupon redemptions tracked

---

**End of Document**
