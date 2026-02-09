Frontend Implementation Prompt for Claude VS Code Plugin
Context
I have implemented a new backend feature for doctor document upload and admin verification in my Medical Consultation System. I need you to implement the corresponding frontend React components and integrate them with the existing application.
Feature Summary
What it does:

Doctors can upload verification documents (medical license, certificate, experience docs)
Documents are encrypted and stored securely on the backend
Admins can review uploaded documents and verify/reject them
Doctors must have verified documents before their account is fully approved

Required Documents:

LICENSE (Required) - Medical license
CERTIFICATE (Required) - Professional certificate/degree
EXPERIENCE (Optional) - Experience letters, additional certifications

File Restrictions:

Types: PDF, JPG, JPEG, PNG only
Max size: 5MB per file
All files are AES-256 encrypted and GZIP compressed on the backend

API Endpoints
Doctor Service (http://172.16.1.122:8083)

Upload Document: POST /api/doctors/profile/documents/upload

Headers: X-User-Id
Body: FormData with file, documentType, description
Response: { documentId, fileName, documentType, fileSizeKB, fileUrl }


Get My Documents: GET /api/doctors/profile/documents

Headers: X-User-Id
Response: { doctorId, documents[], hasAllRequiredDocuments, allDocumentsVerified, totalDocuments, verifiedDocuments }


Download Document: GET /api/doctors/profile/documents/{documentId}/download

Returns: Binary file with proper headers


View Document: GET /api/doctors/profile/documents/{documentId}/view

Returns: Binary file for inline viewing


Delete Document: DELETE /api/doctors/profile/documents/{documentId}

Response: Success message


Submit for Review: POST /api/doctors/profile/documents/submit

Body: { additionalNotes: string }
Response: { success, documentsSubmitted, hasAllRequiredDocuments }



Admin Service (http://172.16.1.122:8084)

Get Verification Details (Enhanced): GET /api/admin/doctors/{doctorId}/verification-details

Now includes documents[] array with document info


View Document: GET /api/admin/doctors/{doctorId}/documents/{documentId}/content

Returns: Binary file for viewing


Download Document: GET /api/admin/doctors/{doctorId}/documents/{documentId}/download

Returns: Binary file for download


Verify Document: PUT /api/admin/doctors/documents/{documentId}/verify

Body: { verified: boolean, verificationNotes: string }


Verify All Documents: POST /api/admin/doctors/{doctorId}/documents/verify-all

Body: { verified: boolean, verificationNotes: string }



Frontend Tasks
1. Doctor Side Components
Location: src/pages/doctor/profile/
Components to Create:

DoctorDocumentUpload.jsx - Main document management component
Include upload interface for each document type (LICENSE, CERTIFICATE, EXPERIENCE)
Show uploaded documents with preview thumbnails
Display verification status for each document
"Submit for Review" button (enabled only when all required docs uploaded)

Features Needed:

Drag-and-drop file upload
File validation (type, size)
Progress indicator during upload
Document preview (PDF inline viewer for PDFs, image preview for images)
Delete document functionality (before submission)
Visual progress indicator: "2 of 2 required documents uploaded ✓"
Status badges: "Not Uploaded", "Uploaded", "Pending", "Verified", "Rejected"

Integration Point:

Add new tab to existing DoctorProfile.jsx called "Verification Documents"

2. Admin Side Components
Location: src/pages/admin/
Update Existing:

DoctorVerificationDetails.jsx - Add document review section

Components to Create:

DocumentReviewSection.jsx - Shows all documents for a doctor
DocumentViewerModal.jsx - Modal for viewing PDF/images inline
Individual document cards with actions: View, Download, Verify, Reject

Features Needed:

Document gallery view with thumbnails
Click to view in modal (PDF viewer for PDFs, image viewer for images)
Download button for each document
Verify/Reject buttons with notes input
"Verify All" bulk action button
Show verification status and notes for each document

3. API Service Updates
File: src/services/api/doctorService.js
Add methods:
javascriptuploadDocument: async (file, documentType, description)
getMyDocuments: async ()
downloadDocument: async (documentId, filename)
deleteDocument: async (documentId)
submitDocumentsForReview: async (additionalNotes)
File: src/services/api/adminService.js
Add methods:
javascriptviewDocument: async (doctorId, documentId)
downloadDocument: async (doctorId, documentId, filename)
verifyDocument: async (documentId, verificationData)
verifyAllDocuments: async (doctorId, verificationData)
4. Existing Patterns to Follow
Use existing components:

Button component from src/components/common/Button.jsx
Card component from src/components/common/Card.jsx
Badge component from src/components/common/Badge.jsx
Modal component from src/components/common/Modal.jsx
Toast notifications via react-toastify

Use existing patterns:

React Hook Form for forms
Yup for validation
Tailwind CSS for styling
Lucide React for icons
Existing color scheme and design system

File Upload Pattern:
javascriptconst formData = new FormData();
formData.append('file', file);
formData.append('documentType', 'LICENSE');
return api.upload('/doctor-service/api/doctors/profile/documents/upload', formData);
File Download Pattern:
javascriptconst response = await fetch(url, { headers });
const blob = await response.blob();
const downloadUrl = window.URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = downloadUrl;
link.download = filename;
link.click();
5. Validation Rules
javascript// File validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

// Required documents check
const hasRequiredDocs = documents.some(d => d.documentType === 'LICENSE') && 
                        documents.some(d => d.documentType === 'CERTIFICATE');
6. UI/UX Guidelines
Doctor Upload Interface:

Show clear section for each document type
Required documents marked with asterisk (*)
Optional documents clearly labeled
Upload button or drag-drop area
File name and size display after upload
Trash icon to delete before submission
Green checkmark when verified
Red X when rejected with admin notes displayed

Admin Review Interface:

Documents section in verification details page
Grid or list view of all documents
Thumbnail previews if possible
Click thumbnail to view full size in modal
Verification status indicators
Quick action buttons: View, Download, Verify, Reject
Bulk "Verify All" button at top

Document Viewer Modal:

Large modal with close button
PDF: Use <iframe> or PDF viewer library
Images: Use <img> with zoom capability
Download button in modal
Verify/Reject actions available in modal

7. Error Handling

Show validation errors for file type/size
Handle upload failures gracefully
Show clear error messages from backend
Prevent submission if required docs missing
Confirm before deleting documents
Show loading states during upload/download

Implementation Instructions

Start by updating the API service files (doctorService.js, adminService.js)
Create the doctor-side document upload component
Integrate it into the existing DoctorProfile page as a new tab
Update the admin verification details page to show documents
Create the document viewer modal component
Add verification actions to admin interface
Test the complete workflow:

Doctor uploads documents
Doctor submits for review
Admin views documents
Admin verifies documents
Doctor sees verified status



Files to Modify

src/services/api/doctorService.js - Add document methods
src/services/api/adminService.js - Add document review methods
src/pages/doctor/profile/DoctorProfile.jsx - Add documents tab
src/pages/admin/DoctorVerificationDetails.jsx - Add document review section

Files to Create

src/pages/doctor/profile/DoctorDocumentUpload.jsx
src/components/doctor/DocumentUploadCard.jsx
src/components/admin/DocumentReviewSection.jsx
src/components/admin/DocumentViewerModal.jsx

Success Criteria

 Doctor can upload LICENSE document (PDF/Image)
 Doctor can upload CERTIFICATE document (PDF/Image)
 Doctor can upload optional EXPERIENCE documents
 File validation works (type and size)
 Doctor can view uploaded documents
 Doctor can delete documents before submission
 Doctor can submit documents for review
 Submit button disabled until required docs uploaded
 Admin sees documents in verification details
 Admin can view documents in modal (PDF viewer for PDFs, image for images)
 Admin can download documents
 Admin can verify individual documents
 Admin can verify all documents at once
 Verification status updates in real-time
 Error handling works properly
 Loading states shown during operations
 UI matches existing design system

Please implement these features following the existing codebase patterns and architecture. Maintain consistency with the current UI/UX design and ensure all components are production-ready with proper error handling and validation.