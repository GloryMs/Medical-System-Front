import React from 'react';
import CommunicationPage from '../communication/components/CommunicationPage';

/**
 * SupervisorCommunication Component
 *
 * IMPORTANT: Medical supervisors act on behalf of patients.
 * They should see conversations from the PATIENT'S perspective:
 *
 * Expected conversation display:
 * - Title/otherUserName: Doctor's name (who the patient is communicating with)
 * - Latest message preview
 * - Case number
 * - Unread count
 *
 * The backend messaging-service should automatically determine this perspective
 * based on the user's role (MEDICAL_SUPERVISOR) from the JWT token and return:
 * - otherUserName = doctor's name
 * - otherUserId = doctor's ID
 *
 * If supervisors are seeing patient names instead of doctor names,
 * the backend needs to be updated to handle MEDICAL_SUPERVISOR role correctly.
 */
const SupervisorCommunication = () => {
  return <CommunicationPage />;
};

export default SupervisorCommunication;
