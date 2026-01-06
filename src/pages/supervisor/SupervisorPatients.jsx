import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Plus, Search, Filter, Eye, FileText, UserPlus, Mail, Hash, Phone, Calendar, MapPin, AlertCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import { fetchPatients, selectSupervisorPatients } from '../../store/slices/supervisorSlice';
import supervisorService from '../../services/api/supervisorService';

const SupervisorPatients = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const patients = useSelector(selectSupervisorPatients) || [];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = dispatch(fetchPatients());
      if (fetchPatients.rejected.match(result)) {
        setError(result.payload || 'Failed to load patients');
      }
    } catch (error) {
      console.error('Failed to load patients:', error);
      setError('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = (patients || []).filter(patient => {
    const matchesSearch =
      patient.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientFirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientLastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId?.toString().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'ACTIVE' && patient.assignmentStatus === 'ACTIVE') ||
      (statusFilter === 'TERMINATED' && patient.assignmentStatus === 'TERMINATED');
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your assigned patients and their medical cases
          </p>
        </div>
        <Button
          icon={<Plus />}
          onClick={() => setShowAssignModal(true)}
        >
          Add Patient
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadPatients}
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="TERMINATED">Terminated</option>
            </select>
          </div>
          <div className="text-sm text-gray-600 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            {filteredPatients.length} of {patients.length} patients
          </div>
        </div>
      </Card>

      {/* Patients List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Patient Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {patient.patientName ||
                         (patient.patientFirstName || patient.patientLastName
                           ? `${patient.patientFirstName || ''} ${patient.patientLastName || ''}`.trim()
                           : `Patient #${patient.patientId}`)}
                      </h3>
                      {patient.patientEmail ? (
                        <p className="text-sm text-gray-500 truncate">{patient.patientEmail}</p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Email not available</p>
                      )}
                      {patient.patientPhoneNumber && (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Phone className="w-3 h-3 mr-1" />
                          {patient.patientPhoneNumber}
                        </div>
                      )}
                    </div>
                  </div>
                  <StatusBadge
                    status={patient.assignmentStatus || 'ACTIVE'}
                    size="sm"
                  />
                </div>

                {/* Assignment Info */}
                {patient.assignedAt && (
                  <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span className="font-medium">Assigned:</span>
                      <span className="ml-1">{new Date(patient.assignedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Eye />}
                    fullWidth
                    onClick={() => navigate(`/app/supervisor/patients/${patient.patientId}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<FileText />}
                    fullWidth
                    onClick={() => navigate(`/app/supervisor/patients/${patient.patientId}/cases/create`)}
                  >
                    Submit Case
                  </Button>
                </div>

                {/* Assignment Notes */}
                {patient.assignmentNotes && (
                  <div className="text-xs text-gray-600 pt-2 border-t">
                    <strong className="text-gray-700">Notes:</strong> {patient.assignmentNotes}
                  </div>
                )}
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by adding your first patient'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button
                  icon={<Plus />}
                  onClick={() => setShowAssignModal(true)}
                >
                  Add First Patient
                </Button>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      {showAssignModal && (
        <AssignPatientModal
          onClose={() => setShowAssignModal(false)}
          onSuccess={() => {
            setShowAssignModal(false);
            loadPatients();
          }}
        />
      )}
    </div>
  );
};

// Assign Patient Modal Component
const AssignPatientModal = ({ onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('create'); // create, assignById, assignByEmail
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create New Patient Form - Complete with all fields from API
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    country: '',
    state: '',
    zipCode: '',
    bloodType: '',
    allergies: '',
    chronicConditions: '',
    currentMedications: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    notes: '',
    autoAssignToSupervisor: true
  });

  // Assign by ID Form
  const [assignIdForm, setAssignIdForm] = useState({
    patientId: '',
    notes: ''
  });

  // Assign by Email Form
  const [assignEmailForm, setAssignEmailForm] = useState({
    patientEmail: '',
    assignmentNotes: '',
    patientFullName: ''
  });

  const handleCreateAndAssign = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await supervisorService.createAndAssignPatient(createForm);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create and assign patient');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignById = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await supervisorService.assignPatientById(assignIdForm.patientId, assignIdForm.notes);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign patient');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignByEmail = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await supervisorService.assignPatientByEmail(assignEmailForm.patientEmail, assignEmailForm.assignmentNotes);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">Add Patient</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex px-6">
            <button
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'create'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('create')}
            >
              <div className="flex items-center space-x-2">
                <UserPlus className="w-4 h-4" />
                <span>Create New Patient</span>
              </div>
            </button>
            <button
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'assignById'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('assignById')}
            >
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4" />
                <span>Assign by ID</span>
              </div>
            </button>
            <button
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'assignByEmail'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('assignByEmail')}
            >
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Assign by Email</span>
              </div>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Create New Patient Form */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateAndAssign} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={createForm.fullName}
                      onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                      placeholder="e.g., Sarah Martinez"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      placeholder="patient@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={createForm.phoneNumber}
                      onChange={(e) => setCreateForm({ ...createForm, phoneNumber: e.target.value })}
                      placeholder="+1234567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={createForm.dateOfBirth}
                      onChange={(e) => setCreateForm({ ...createForm, dateOfBirth: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={createForm.gender}
                      onChange={(e) => setCreateForm({ ...createForm, gender: e.target.value })}
                    >
                      <option value="">Select...</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Type
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={createForm.bloodType}
                      onChange={(e) => setCreateForm({ ...createForm, bloodType: e.target.value })}
                    >
                      <option value="">Select...</option>
                      <option value="A_POSITIVE">A+</option>
                      <option value="A_NEGATIVE">A-</option>
                      <option value="B_POSITIVE">B+</option>
                      <option value="B_NEGATIVE">B-</option>
                      <option value="AB_POSITIVE">AB+</option>
                      <option value="AB_NEGATIVE">AB-</option>
                      <option value="O_POSITIVE">O+</option>
                      <option value="O_NEGATIVE">O-</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={createForm.address}
                      onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                      placeholder="789 Pine St"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={createForm.city}
                      onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
                      placeholder="Los Angeles"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={createForm.state}
                      onChange={(e) => setCreateForm({ ...createForm, state: e.target.value })}
                      placeholder="CA"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={createForm.country}
                      onChange={(e) => setCreateForm({ ...createForm, country: e.target.value })}
                      placeholder="USA"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={createForm.zipCode}
                      onChange={(e) => setCreateForm({ ...createForm, zipCode: e.target.value })}
                      placeholder="90001"
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allergies
                    </label>
                    <textarea
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={createForm.allergies}
                      onChange={(e) => setCreateForm({ ...createForm, allergies: e.target.value })}
                      placeholder="e.g., Penicillin, Peanuts"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chronic Conditions
                    </label>
                    <textarea
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={createForm.chronicConditions}
                      onChange={(e) => setCreateForm({ ...createForm, chronicConditions: e.target.value })}
                      placeholder="e.g., Diabetes Type 2, Hypertension"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Medications
                    </label>
                    <textarea
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={createForm.currentMedications}
                      onChange={(e) => setCreateForm({ ...createForm, currentMedications: e.target.value })}
                      placeholder="e.g., Metformin, Lisinopril"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={createForm.emergencyContactName}
                      onChange={(e) => setCreateForm({ ...createForm, emergencyContactName: e.target.value })}
                      placeholder="Carlos Martinez"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={createForm.emergencyContactPhone}
                      onChange={(e) => setCreateForm({ ...createForm, emergencyContactPhone: e.target.value })}
                      placeholder="+1234567893"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Relationship
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={createForm.emergencyContactRelationship}
                      onChange={(e) => setCreateForm({ ...createForm, emergencyContactRelationship: e.target.value })}
                      placeholder="e.g., Spouse, Parent, Sibling"
                    />
                  </div>
                </div>
              </div>

              {/* Assignment Notes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Notes</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={createForm.notes}
                    onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                    placeholder="Any special notes about this patient or assignment..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                >
                  Create & Assign Patient
                </Button>
              </div>
            </form>
          )}

          {/* Assign by ID Form */}
          {activeTab === 'assignById' && (
            <form onSubmit={handleAssignById} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This option assigns an existing patient from the system to you using their Patient ID.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={assignIdForm.patientId}
                  onChange={(e) => setAssignIdForm({ ...assignIdForm, patientId: e.target.value })}
                  placeholder="Enter patient ID (e.g., 50)"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter the unique ID of an existing patient in the system
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Notes
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={assignIdForm.notes}
                  onChange={(e) => setAssignIdForm({ ...assignIdForm, notes: e.target.value })}
                  placeholder="Any notes about this assignment (e.g., High priority patient)..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                >
                  Assign Patient
                </Button>
              </div>
            </form>
          )}

          {/* Assign by Email Form */}
          {activeTab === 'assignByEmail' && (
            <form onSubmit={handleAssignByEmail} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This option assigns an existing patient from the system to you using their email address.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={assignEmailForm.patientEmail}
                  onChange={(e) => setAssignEmailForm({ ...assignEmailForm, patientEmail: e.target.value })}
                  placeholder="patient@example.com"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter the email of an existing patient in the system
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Full Name (Optional)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={assignEmailForm.patientFullName}
                  onChange={(e) => setAssignEmailForm({ ...assignEmailForm, patientFullName: e.target.value })}
                  placeholder="Alice Johnson"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Optional: Enter the patient's name for verification
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Notes
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={assignEmailForm.assignmentNotes}
                  onChange={(e) => setAssignEmailForm({ ...assignEmailForm, assignmentNotes: e.target.value })}
                  placeholder="Any notes about this assignment (e.g., Patient requested transfer)..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                >
                  Assign Patient
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupervisorPatients;
