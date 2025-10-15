import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Eye } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useApi } from '../../hooks/useApi';
import patientService from '../../services/api/patientService';

const DependentsManagement = () => {
  const [dependents, setDependents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDependent, setSelectedDependent] = useState(null);
  const { execute, loading } = useApi();

  const [formData, setFormData] = useState({
    fullName: '',
    relationship: '',
    dateOfBirth: '',
    gender: '',
    medicalHistory: '',
    bloodGroup: '',
    allergies: '',
    chronicConditions: '',
    phoneNumber: ''
  });

  const relationships = [
    { value: 'SON', label: 'Son' },
    { value: 'DAUGHTER', label: 'Daughter' },
    { value: 'WIFE', label: 'Wife' },
    { value: 'HUSBAND', label: 'Husband' },
    { value: 'MOTHER', label: 'Mother' },
    { value: 'FATHER', label: 'Father' },
    { value: 'OTHER', label: 'Other' }
  ];

  useEffect(() => {
    loadDependents();
  }, []);

  const loadDependents = async () => {
    try {
      const data = await execute(() => patientService.getDependents());
      setDependents(data || []);
    } catch (error) {
      console.error('Error loading dependents:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedDependent) {
        await execute(() => patientService.updateDependent(selectedDependent.id, formData));
      } else {
        await execute(() => patientService.createDependent(formData));
      }
      loadDependents();
      resetForm();
      setShowAddModal(false);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error saving dependent:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this dependent?')) {
      try {
        await execute(() => patientService.deleteDependent(id));
        loadDependents();
      } catch (error) {
        console.error('Error deleting dependent:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      relationship: '',
      dateOfBirth: '',
      gender: '',
      medicalHistory: '',
      bloodGroup: '',
      allergies: '',
      chronicConditions: '',
      phoneNumber: ''
    });
    setSelectedDependent(null);
  };

  const handleEdit = (dependent) => {
    setSelectedDependent(dependent);
    setFormData({
      fullName: dependent.fullName,
      relationship: dependent.relationship,
      dateOfBirth: dependent.dateOfBirth,
      gender: dependent.gender,
      medicalHistory: dependent.medicalHistory || '',
      bloodGroup: dependent.bloodGroup || '',
      allergies: dependent.allergies || '',
      chronicConditions: dependent.chronicConditions || '',
      phoneNumber: dependent.phoneNumber || ''
    });
    setShowEditModal(true);
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Family Members</h1>
          <p className="text-gray-600 mt-1">Manage dependents for whom you can submit cases</p>
        </div>
        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowAddModal(true)}
        >
          Add Family Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dependents.map((dependent) => (
          <Card key={dependent.id} className="hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{dependent.fullName}</h3>
                    <span className="text-sm text-gray-500">{dependent.relationship}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-medium">{calculateAge(dependent.dateOfBirth)} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-medium">{dependent.gender || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Blood Group:</span>
                  <span className="font-medium">{dependent.bloodGroup || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cases:</span>
                  <span className="font-medium">{dependent.casesCount || 0}</span>
                </div>
              </div>

              <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  icon={<Edit className="w-4 h-4" />}
                  onClick={() => handleEdit(dependent)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={() => handleDelete(dependent.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {dependents.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No family members added yet</p>
            <p className="text-sm text-gray-400 mt-1">Add family members to submit cases on their behalf</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <Modal
          isOpen={showAddModal || showEditModal}
          onClose={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            resetForm();
          }}
          title={selectedDependent ? 'Edit Family Member' : 'Add Family Member'}
        >
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Personal Information Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Personal Information
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  >
                    <option value="">Select relationship</option>
                    {relationships.map((rel) => (
                      <option key={rel.value} value={rel.value}>{rel.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            {/* Medical Information Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Medical Information
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  >
                    <option value="">Select blood group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allergies
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    placeholder="Food allergies, drug allergies, environmental allergies"
                  />
                  <p className="text-xs text-gray-500 mt-1">List any known allergies</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chronic Conditions
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    value={formData.chronicConditions}
                    onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
                    placeholder="Diabetes, hypertension, asthma, etc."
                  />
                  <p className="text-xs text-gray-500 mt-1">List any ongoing medical conditions</p>
                </div>

                                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medical History
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    value={formData.medicalHistory}
                    onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                    placeholder="Previous surgeries, major illnesses, etc."
                  />
                  <p className="text-xs text-gray-500 mt-1">Include any past medical conditions or treatments</p>
                </div>

                
              </div>
            </div>

            <div className="flex space-x-3 pt-4 sticky bottom-0 bg-white pb-2">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                fullWidth
                loading={loading}
              >
                {selectedDependent ? 'Update' : 'Add'} Family Member
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default DependentsManagement;