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
