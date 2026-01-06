import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';
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
