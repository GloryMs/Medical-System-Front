import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User } from 'lucide-react';
import Card from '../../components/common/Card';
import { StatusBadge } from '../../components/common/Badge';
import { fetchSupervisorProfile, selectSupervisorProfile } from '../../store/slices/supervisorSlice';

const SupervisorProfile = () => {
  const dispatch = useDispatch();
  const profile = useSelector(selectSupervisorProfile);

  useEffect(() => {
    dispatch(fetchSupervisorProfile());
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-600">Manage your supervisor profile</p>
      </div>

      <Card title="Profile Information">
        {profile ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <p className="mt-1 text-gray-900">{profile.fullName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{profile.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-gray-900">{profile.phoneNumber || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Verification Status</label>
                <div className="mt-1">
                  <StatusBadge status={profile.verificationStatus} size="sm" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Max Patients Limit</label>
                <p className="mt-1 text-gray-900">{profile.maxPatientsLimit}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Max Cases Per Patient</label>
                <p className="mt-1 text-gray-900">{profile.maxActiveCasesPerPatient}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">Loading profile...</p>
        )}
      </Card>

      <Card className="text-center py-8">
        <User className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-600">Profile editing features are under development.</p>
      </Card>
    </div>
  );
};

export default SupervisorProfile;
