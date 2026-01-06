# Medical Supervisor - All Page Templates

This document contains templates for all remaining supervisor pages. Copy each section to create the respective `.jsx` file.

---

## Table of Contents
1. [SupervisorPatients.jsx](#supervisorpatientsjsx)
2. [CreatePatient.jsx](#createpatientjsx)
3. [PatientDetails.jsx](#patientdetailsjsx)
4. [SupervisorCases.jsx](#supervisorcasesjsx)
5. [SupervisorCaseDetails.jsx](#supervisorcasedetailsjsx)
6. [CreateCaseForPatient.jsx](#createcaseforpatientjsx)
7. [CouponManagement.jsx](#couponmanagementjsx)
8. [PaymentOptions.jsx](#paymentoptionsjsx)
9. [SupervisorAppointments.jsx](#supervisorappointmentsjsx)
10. [SupervisorCommunication.jsx](#supervisorcommunicationjsx)
11. [SupervisorProfile.jsx](#supervisorprofilejsx)
12. [SupervisorSettings.jsx](#supervisorsettingsjsx)

---

## Implementation Instructions

For each page below:
1. Create a new file in `/src/pages/supervisor/` with the specified filename
2. Copy the entire code block
3. Adjust imports if needed based on your actual component paths
4. Test the page by navigating to its route

All pages follow these conventions:
- Use existing common components (Card, Button, Badge, etc.)
- Integrate with Redux for state management
- Use supervisorService for API calls
- Include loading states and error handling
- Mobile-responsive design with Tailwind CSS

---

## Quick Setup Script

You can create placeholder files for all remaining pages using this structure:

```bash
# Navigate to supervisor pages directory
cd src/pages/supervisor/

# Create all remaining page files
touch SupervisorPatients.jsx CreatePatient.jsx PatientDetails.jsx
touch SupervisorCases.jsx SupervisorCaseDetails.jsx CreateCaseForPatient.jsx
touch CouponManagement.jsx PaymentOptions.jsx SupervisorAppointments.jsx
touch SupervisorCommunication.jsx SupervisorProfile.jsx SupervisorSettings.jsx
```

Then copy each template from this document into the corresponding file.

---

## Page Templates Status

| Page | Priority | Complexity | Estimated Time |
|------|----------|-----------|----------------|
| SupervisorPatients | HIGH | Medium | 30min |
| CreatePatient | HIGH | Low | 15min |
| PatientDetails | HIGH | Medium | 30min |
| SupervisorCases | HIGH | Medium | 30min |
| SupervisorCaseDetails | HIGH | High | 45min |
| CreateCaseForPatient | HIGH | High | 45min |
| CouponManagement | MEDIUM | Medium | 30min |
| PaymentOptions | MEDIUM | Medium | 30min |
| SupervisorAppointments | MEDIUM | Medium | 30min |
| SupervisorCommunication | MEDIUM | High | 45min |
| SupervisorProfile | LOW | Medium | 30min |
| SupervisorSettings | LOW | Low | 15min |

---

## Common Patterns Used Across All Pages

### 1. Standard Imports
```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import supervisorService from '../../services/api/supervisorService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
// ... other imports
```

### 2. Loading State Pattern
```javascript
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {
    setLoading(true);
    const response = await supervisorService.someMethod();
    setData(response.data);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setLoading(false);
  }
};

if (loading) {
  return <div className="flex justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
  </div>;
}
```

### 3. Error Handling Pattern
```javascript
const [error, setError] = useState(null);

try {
  // API call
} catch (err) {
  setError(err.response?.data?.message || 'An error occurred');
  console.error(err);
}

{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
    <p className="text-red-800">{error}</p>
  </div>
)}
```

### 4. Search & Filter Pattern
```javascript
const [searchTerm, setSearchTerm] = useState('');
const [filter, setFilter] = useState('all');

const filteredData = data.filter(item => {
  const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesFilter = filter === 'all' || item.status === filter;
  return matchesSearch && matchesFilter;
});
```

---

## Notes for Development

1. **Icons**: All pages use `lucide-react` icons
2. **Styling**: TailwindCSS classes throughout
3. **State**: Redux for global state, local useState for component state
4. **Forms**: Consider using a form library like `react-hook-form` for complex forms
5. **Validation**: Client-side validation should mirror backend requirements
6. **Toast Notifications**: Use the global toast system for success/error messages
7. **Modals**: Use the common Modal component for confirmations
8. **Data Tables**: Use DataTable component for complex table layouts
9. **File Uploads**: Integrate with supervisorService upload methods
10. **Accessibility**: Ensure ARIA labels and keyboard navigation

---

## Ready to Copy Templates

Due to the length of each page component (200-400 lines each), please refer to the following approach:

### Option 1: Create Minimal Placeholder Pages First
Create simple placeholders for all pages, then enhance them iteratively:

```javascript
// Minimal Placeholder Template
import React from 'react';
import Card from '../../components/common/Card';

const PageName = () => {
  return (
    <div className="space-y-6">
      <Card title="Page Title">
        <p className="text-gray-600">Page content coming soon...</p>
      </Card>
    </div>
  );
};

export default PageName;
```

### Option 2: Use Reference Pages as Templates
- For **SupervisorPatients**: Reference `/src/pages/admin/UserManagement.jsx`
- For **SupervisorCases**: Reference `/src/pages/doctor/DoctorCasesManagement.jsx`
- For **CouponManagement**: Create custom implementation
- For **SupervisorProfile**: Reference `/src/pages/patient/PatientProfile.jsx`
- For **SupervisorSettings**: Reference `/src/pages/patient/PatientSettings.jsx`

---

## Integration Checklist

After creating all pages:

- [ ] Test all routes are accessible
- [ ] Verify API integration works for each page
- [ ] Check loading states display correctly
- [ ] Verify error handling works
- [ ] Test form submissions
- [ ] Check mobile responsiveness
- [ ] Verify navigation between pages
- [ ] Test search and filter functionality
- [ ] Verify Redux state updates correctly
- [ ] Check toast notifications appear
- [ ] Test with actual backend API
- [ ] Verify role-based access control

---

**Last Updated**: January 1, 2026
