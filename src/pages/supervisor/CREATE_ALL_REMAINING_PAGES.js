/**
 * This file contains all remaining supervisor pages as templates
 * Copy each section to create the individual .jsx files
 *
 * Files to create:
 * 1. CreatePatient.jsx
 * 2. PatientDetails.jsx
 * 3. SupervisorCases.jsx
 * 4. SupervisorCaseDetails.jsx
 * 5. CreateCaseForPatient.jsx
 * 6. CouponManagement.jsx
 * 7. PaymentOptions.jsx
 * 8. SupervisorAppointments.jsx
 * 9. SupervisorCommunication.jsx
 * 10. SupervisorProfile.jsx
 * 11. SupervisorSettings.jsx
 */

// ======================================================================
// CreatePatient.jsx
// ======================================================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import supervisorService from '../../services/api/supervisorService';

const CreatePatient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await supervisorService.assignPatient(formData.patientId, formData.notes);
      navigate('/app/supervisor/patients');
    } catch (error) {
      console.error('Failed to assign patient:', error);
      alert(error.response?.data?.message || 'Failed to assign patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          icon={<ArrowLeft />}
          onClick={() => navigate('/app/supervisor/patients')}
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assign Patient</h1>
          <p className="text-sm text-gray-600">Add a new patient to your supervision</p>
        </div>
      </div>

      <Card title="Patient Information">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient ID *
            </label>
            <input
              type="number"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              placeholder="Enter patient ID"
            />
            <p className="mt-1 text-sm text-gray-500">
              The unique ID of the patient in the system
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Notes
            </label>
            <textarea
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes about this assignment..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/app/supervisor/patients')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              icon={<UserPlus />}
              loading={loading}
              disabled={loading}
            >
              Assign Patient
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreatePatient;


// ======================================================================
// PatientDetails.jsx
// ======================================================================
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, Ticket, Plus } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import supervisorService from '../../services/api/supervisorService';

const PatientDetails = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [cases, setCases] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      const [patientRes, casesRes, couponsRes] = await Promise.all([
        supervisorService.getPatientDetails(patientId),
        supervisorService.getCasesByPatient(patientId),
        supervisorService.getPatientCoupons(patientId)
      ]);
      setPatient(patientRes.data);
      setCases(casesRes.data || []);
      setCoupons(couponsRes.data || []);
    } catch (error) {
      console.error('Failed to load patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          icon={<ArrowLeft />}
          onClick={() => navigate('/app/supervisor/patients')}
        />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{patient?.patientName}</h1>
          <p className="text-sm text-gray-600">{patient?.patientEmail}</p>
        </div>
        <Button
          icon={<Plus />}
          onClick={() => navigate(`/app/supervisor/patients/${patientId}/cases/create`)}
        >
          Submit Case
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Active Cases" icon={<FileText />}>
          <p className="text-3xl font-bold text-gray-900">{patient?.activeCasesCount || 0}</p>
        </Card>
        <Card title="Total Cases" icon={<Calendar />}>
          <p className="text-3xl font-bold text-gray-900">{patient?.totalCasesCount || 0}</p>
        </Card>
        <Card title="Available Coupons" icon={<Ticket />}>
          <p className="text-3xl font-bold text-gray-900">{coupons.filter(c => c.status === 'AVAILABLE').length}</p>
        </Card>
      </div>

      <Card title="Recent Cases">
        {cases.length > 0 ? (
          <div className="divide-y">
            {cases.slice(0, 5).map(c => (
              <div key={c.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{c.caseTitle}</p>
                  <p className="text-sm text-gray-500">{c.status}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate(`/app/supervisor/cases/${c.id}`)}>
                  View
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No cases yet</p>
        )}
      </Card>

      <Card title="Available Coupons">
        {coupons.filter(c => c.status === 'AVAILABLE').length > 0 ? (
          <div className="space-y-3">
            {coupons.filter(c => c.status === 'AVAILABLE').map(coupon => (
              <div key={coupon.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{coupon.couponCode}</p>
                    <p className="text-sm text-gray-500">
                      ${coupon.discountAmount} - Expires {new Date(coupon.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={coupon.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No available coupons</p>
        )}
      </Card>
    </div>
  );
};

export default PatientDetails;


// ======================================================================
// For the remaining pages, create minimal functional placeholders:
// ======================================================================

// SupervisorCases.jsx, SupervisorCaseDetails.jsx, CreateCaseForPatient.jsx,
// CouponManagement.jsx, PaymentOptions.jsx, SupervisorAppointments.jsx,
// SupervisorCommunication.jsx, SupervisorProfile.jsx, SupervisorSettings.jsx

// Use this template for each:
import React from 'react';
import Card from '../../components/common/Card';

const PageName = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Page Title</h1>
      <Card>
        <p className="text-gray-600">
          This page is under development. Please check back later.
        </p>
      </Card>
    </div>
  );
};

export default PageName;
