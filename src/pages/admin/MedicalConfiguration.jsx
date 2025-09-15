import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Stethoscope,
  Pill,
  Activity,
  Heart,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Save,
  X,
  Check,
  AlertTriangle,
  Info,
  FileText,
  Database,
  Settings,
  Tag,
  Layers,
  BookOpen,
  Shield,
  Target,
  List,
  Grid,
  MoreVertical,
  Copy,
  ExternalLink,
  Archive,
  RotateCcw,
  Calendar,
  User,
  Building2,
  Beaker,
  Brain,
  Zap
} from 'lucide-react';

import Card, { StatsCard, AlertCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Modal, { ConfirmModal, FormModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import adminService from '../../services/api/adminService';
import commonService from '../../services/api/commonService';

// Validation schemas
const diseaseSchema = yup.object({
  icdCode: yup.string().required('ICD-10 code is required').min(3, 'ICD code too short'),
  name: yup.string().required('Disease name is required').min(2, 'Name too short'),
  description: yup.string().optional(),
  category: yup.string().required('Category is required'),
  subCategory: yup.string().optional(),
  requiredSpecializations: yup.array().min(1, 'At least one specialization required'),
  commonSymptoms: yup.array().optional(),
  defaultSeverity: yup.string().required('Default severity is required'),
  isActive: yup.boolean()
});

const medicationSchema = yup.object({
  atcCode: yup.string().required('ATC code is required').min(3, 'ATC code too short'),
  name: yup.string().required('Medication name is required').min(2, 'Name too short'),
  genericName: yup.string().required('Generic name is required'),
  category: yup.string().required('Category is required'),
  subCategory: yup.string().optional(),
  indications: yup.array().min(1, 'At least one indication required'),
  contraindications: yup.array().optional(),
  isActive: yup.boolean()
});

const symptomSchema = yup.object({
  code: yup.string().required('Symptom code is required').min(2, 'Code too short'),
  name: yup.string().required('Symptom name is required').min(2, 'Name too short'),
  description: yup.string().optional(),
  bodySystem: yup.string().required('Body system is required'),
  relatedDiseases: yup.array().optional(),
  relevantSpecializations: yup.array().optional(),
  isActive: yup.boolean()
});

const MedicalConfiguration = () => {
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // State management
  const [activeTab, setActiveTab] = useState('diseases');
  const [diseases, setDiseases] = useState([]);
  const [medications, setMedications] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('table'); // table or grid
  const [stats, setStats] = useState({
    diseases: { total: 0, active: 0, categories: 0 },
    medications: { total: 0, active: 0, categories: 0 },
    symptoms: { total: 0, active: 0, bodySystems: 0 }
  });

  // Form setup for different types
  const diseaseForm = useForm({
    resolver: yupResolver(diseaseSchema),
    defaultValues: {
      icdCode: '',
      name: '',
      description: '',
      category: '',
      subCategory: '',
      requiredSpecializations: [],
      commonSymptoms: [],
      defaultSeverity: 'MEDIUM',
      isActive: true
    }
  });

  const medicationForm = useForm({
    resolver: yupResolver(medicationSchema),
    defaultValues: {
      atcCode: '',
      name: '',
      genericName: '',
      category: '',
      subCategory: '',
      indications: [],
      contraindications: [],
      isActive: true
    }
  });

  const symptomForm = useForm({
    resolver: yupResolver(symptomSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      bodySystem: '',
      relatedDiseases: [],
      relevantSpecializations: [],
      isActive: true
    }
  });

  // Load data on component mount and tab change
  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Filter data when filters change
  useEffect(() => {
    filterData();
  }, [searchTerm, categoryFilter, statusFilter, sortBy, diseases, medications, symptoms, activeTab]);

  const loadData = async () => {
    try {
      switch (activeTab) {
        case 'diseases':
          const diseasesData = await execute(() => adminService.getAllDiseases());
          setDiseases(diseasesData || []);
          break;
        case 'medications':
          const medicationsData = await execute(() => adminService.getAllMedications());
          setMedications(medicationsData || []);
          break;
        case 'symptoms':
          const symptomsData = await execute(() => adminService.getAllSymptoms());
          setSymptoms(symptomsData || []);
          break;
      }
      calculateStats();
    } catch (error) {
      console.error(`Failed to load ${activeTab}:`, error);
    }
  };

  const calculateStats = () => {
    const diseaseStats = {
      total: diseases.length,
      active: diseases.filter(d => d.isActive).length,
      categories: new Set(diseases.map(d => d.category)).size
    };

    const medicationStats = {
      total: medications.length,
      active: medications.filter(m => m.isActive).length,
      categories: new Set(medications.map(m => m.category)).size
    };

    const symptomStats = {
      total: symptoms.length,
      active: symptoms.filter(s => s.isActive).length,
      bodySystems: new Set(symptoms.map(s => s.bodySystem)).size
    };

    setStats({ diseases: diseaseStats, medications: medicationStats, symptoms: symptomStats });
  };

  const filterData = () => {
    let data = [];
    switch (activeTab) {
      case 'diseases':
        data = [...diseases];
        break;
      case 'medications':
        data = [...medications];
        break;
      case 'symptoms':
        data = [...symptoms];
        break;
    }

    // Search filter
    if (searchTerm) {
      data = data.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.icdCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.atcCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter) {
      data = data.filter(item => 
        item.category?.toLowerCase() === categoryFilter.toLowerCase() ||
        item.bodySystem?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Status filter
    if (statusFilter) {
      const isActive = statusFilter === 'active';
      data = data.filter(item => item.isActive === isActive);
    }

    // Sort
    data.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'code':
          const codeA = a.icdCode || a.atcCode || a.code || '';
          const codeB = b.icdCode || b.atcCode || b.code || '';
          return codeA.localeCompare(codeB);
        case 'category':
          const catA = a.category || a.bodySystem || '';
          const catB = b.category || b.bodySystem || '';
          return catA.localeCompare(catB);
        case 'status':
          return b.isActive - a.isActive;
        default:
          return 0;
      }
    });

    setFilteredData(data);
  };

  const handleCreate = (tabType) => {
    setSelectedItem(null);
    // Reset appropriate form
    switch (tabType) {
      case 'diseases':
        diseaseForm.reset();
        break;
      case 'medications':
        medicationForm.reset();
        break;
      case 'symptoms':
        symptomForm.reset();
        break;
    }
    setShowCreateModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    // Populate appropriate form
    switch (activeTab) {
      case 'diseases':
        diseaseForm.reset({
          ...item,
          requiredSpecializations: item.requiredSpecializations || [],
          commonSymptoms: item.commonSymptoms || []
        });
        break;
      case 'medications':
        medicationForm.reset({
          ...item,
          indications: item.indications || [],
          contraindications: item.contraindications || []
        });
        break;
      case 'symptoms':
        symptomForm.reset({
          ...item,
          relatedDiseases: item.relatedDiseases || [],
          relevantSpecializations: item.relevantSpecializations || []
        });
        break;
    }
    setShowEditModal(true);
  };

  const handleSave = async (data) => {
    try {
      let result;
      const isEdit = selectedItem?.id;

      switch (activeTab) {
        case 'diseases':
          if (isEdit) {
            result = await execute(() => adminService.updateDisease(selectedItem.id, data));
          } else {
            result = await execute(() => adminService.createDisease(data));
          }
          break;
        case 'medications':
          if (isEdit) {
            result = await execute(() => adminService.updateMedication(selectedItem.id, data));
          } else {
            result = await execute(() => adminService.createMedication(data));
          }
          break;
        case 'symptoms':
          if (isEdit) {
            result = await execute(() => adminService.updateSymptom(selectedItem.id, data));
          } else {
            result = await execute(() => adminService.createSymptom(data));
          }
          break;
      }

      // Refresh data
      await loadData();
      
      setShowCreateModal(false);
      setShowEditModal(false);
      setSelectedItem(null);
      
      alert(`${activeTab.slice(0, -1)} ${isEdit ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error(`Failed to save ${activeTab}:`, error);
      alert(`Failed to save ${activeTab.slice(0, -1)}. Please try again.`);
    }
  };

  const handleDelete = async () => {
    try {
      switch (activeTab) {
        case 'diseases':
          await execute(() => adminService.deleteDisease(selectedItem.id));
          break;
        case 'medications':
          await execute(() => adminService.deleteMedication(selectedItem.id));
          break;
        case 'symptoms':
          await execute(() => adminService.deleteSymptom(selectedItem.id));
          break;
      }

      await loadData();
      setShowDeleteModal(false);
      setSelectedItem(null);
      
      alert(`${activeTab.slice(0, -1)} deleted successfully!`);
    } catch (error) {
      console.error(`Failed to delete ${activeTab}:`, error);
      alert(`Failed to delete ${activeTab.slice(0, -1)}. Please try again.`);
    }
  };

  const handleExport = () => {
    const csvContent = [
      getTableHeaders().join(','),
      ...filteredData.map(item => getTableRow(item).map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getTableHeaders = () => {
    switch (activeTab) {
      case 'diseases':
        return ['ICD Code', 'Name', 'Category', 'Sub Category', 'Specializations', 'Severity', 'Status'];
      case 'medications':
        return ['ATC Code', 'Name', 'Generic Name', 'Category', 'Sub Category', 'Indications', 'Status'];
      case 'symptoms':
        return ['Code', 'Name', 'Body System', 'Related Diseases', 'Specializations', 'Status'];
      default:
        return [];
    }
  };

  const getTableRow = (item) => {
    switch (activeTab) {
      case 'diseases':
        return [
          item.icdCode,
          item.name,
          item.category,
          item.subCategory || '',
          item.requiredSpecializations?.join('; ') || '',
          item.defaultSeverity,
          item.isActive ? 'Active' : 'Inactive'
        ];
      case 'medications':
        return [
          item.atcCode,
          item.name,
          item.genericName,
          item.category,
          item.subCategory || '',
          item.indications?.join('; ') || '',
          item.isActive ? 'Active' : 'Inactive'
        ];
      case 'symptoms':
        return [
          item.code,
          item.name,
          item.bodySystem,
          item.relatedDiseases?.join('; ') || '',
          item.relevantSpecializations?.join('; ') || '',
          item.isActive ? 'Active' : 'Inactive'
        ];
      default:
        return [];
    }
  };

  const getTabIcon = (tab) => {
    switch (tab) {
      case 'diseases':
        return <Stethoscope className="w-4 h-4" />;
      case 'medications':
        return <Pill className="w-4 h-4" />;
      case 'symptoms':
        return <Activity className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  const getCurrentStats = () => {
    return stats[activeTab] || { total: 0, active: 0, categories: 0 };
  };

  const getCurrentForm = () => {
    switch (activeTab) {
      case 'diseases':
        return diseaseForm;
      case 'medications':
        return medicationForm;
      case 'symptoms':
        return symptomForm;
      default:
        return diseaseForm;
    }
  };

  // Predefined options
  const diseaseCategories = [
    'Infectious Diseases', 'Cardiovascular', 'Respiratory', 'Neurological',
    'Endocrine', 'Gastrointestinal', 'Orthopedic', 'Dermatology',
    'Hematology', 'Oncology', 'Psychiatric', 'Other'
  ];

  const medicationCategories = [
    'Analgesics', 'Antibiotics', 'Antivirals', 'Cardiovascular',
    'Respiratory', 'Endocrine', 'Gastrointestinal', 'Neurological',
    'Dermatological', 'Oncology', 'Psychiatric', 'Other'
  ];

  const bodySystems = [
    'Cardiovascular', 'Respiratory', 'Neurological', 'Gastrointestinal',
    'Musculoskeletal', 'Integumentary', 'Endocrine', 'Genitourinary',
    'Hematologic', 'Immune', 'Sensory', 'Psychiatric'
  ];

  const specializations = [
    'Cardiology', 'Pulmonology', 'Neurology', 'Gastroenterology',
    'Orthopedics', 'Dermatology', 'Endocrinology', 'Psychiatry',
    'Oncology', 'Hematology', 'Infectious Disease', 'General Medicine'
  ];

  const severityLevels = [
    { value: 'MILD', label: 'Mild' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'SEVERE', label: 'Severe' },
    { value: 'CRITICAL', label: 'Critical' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medical Configuration</h1>
          <p className="text-gray-600 mt-1">Manage diseases, medications, and symptoms database</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            icon={<RefreshCw className={loading ? "w-4 h-4 animate-spin" : "w-4 h-4"} />}
            onClick={loadData}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            icon={<Upload className="w-4 h-4" />}
            onClick={() => setShowImportModal(true)}
          >
            Import
          </Button>
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => handleCreate(activeTab)}
          >
            Add {activeTab.slice(0, -1)}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card className="p-0">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['diseases', 'medications', 'symptoms'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {getTabIcon(tab)}
                <span className="capitalize">{tab}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Stats for current tab */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard
              title={`Total ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
              value={getCurrentStats().total}
              icon={getTabIcon(activeTab)}
              color="blue"
            />
            <StatsCard
              title="Active"
              value={getCurrentStats().active}
              icon={<Check className="w-8 h-8" />}
              color="green"
            />
            <StatsCard
              title="Categories/Systems"
              value={getCurrentStats().categories || getCurrentStats().bodySystems}
              icon={<Layers className="w-8 h-8" />}
              color="purple"
            />
            <StatsCard
              title="Inactive"
              value={getCurrentStats().total - getCurrentStats().active}
              icon={<X className="w-8 h-8" />}
              color="red"
            />
          </div>
        </div>
      </Card>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Search ${activeTab} by name or code...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {activeTab === 'diseases' && diseaseCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              {activeTab === 'medications' && medicationCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              {activeTab === 'symptoms' && bodySystems.map(sys => (
                <option key={sys} value={sys}>{sys}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="code">Sort by Code</option>
              <option value="category">Sort by Category</option>
              <option value="status">Sort by Status</option>
            </select>

            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 border-l border-gray-300 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Data Display */}
      {viewMode === 'table' ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {getTableHeaders().map((header, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={getTableHeaders().length + 1} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mr-2" />
                        <span className="text-gray-500">Loading {activeTab}...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={getTableHeaders().length + 1} className="px-6 py-12 text-center">
                      {getTabIcon(activeTab)}
                      <p className="text-gray-500 mt-2">No {activeTab} found</p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      {activeTab === 'diseases' && (
                        <>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                {item.icdCode}
                              </code>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.name}</p>
                              {item.description && (
                                <p className="text-sm text-gray-600 truncate max-w-xs">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline">{item.category}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">
                              {item.subCategory || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {item.requiredSpecializations?.slice(0, 2).map(spec => (
                                <Badge key={spec} variant="secondary" size="sm">
                                  {spec}
                                </Badge>
                              ))}
                              {item.requiredSpecializations?.length > 2 && (
                                <Badge variant="secondary" size="sm">
                                  +{item.requiredSpecializations.length - 2}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge 
                              className={
                                item.defaultSeverity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                item.defaultSeverity === 'SEVERE' ? 'bg-orange-100 text-orange-800' :
                                item.defaultSeverity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }
                            >
                              {item.defaultSeverity}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge 
                              status={item.isActive ? 'active' : 'inactive'}
                              variant={item.isActive ? 'green' : 'gray'}
                            >
                              {item.isActive ? 'Active' : 'Inactive'}
                            </StatusBadge>
                          </td>
                        </>
                      )}
                      
                      {activeTab === 'medications' && (
                        <>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                {item.atcCode}
                              </code>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-600">{item.genericName}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">{item.genericName}</span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline">{item.category}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">
                              {item.subCategory || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {item.indications?.slice(0, 2).map(indication => (
                                <Badge key={indication} variant="secondary" size="sm">
                                  {indication}
                                </Badge>
                              ))}
                              {item.indications?.length > 2 && (
                                <Badge variant="secondary" size="sm">
                                  +{item.indications.length - 2}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge 
                              status={item.isActive ? 'active' : 'inactive'}
                              variant={item.isActive ? 'green' : 'gray'}
                            >
                              {item.isActive ? 'Active' : 'Inactive'}
                            </StatusBadge>
                          </td>
                        </>
                      )}

                      {activeTab === 'symptoms' && (
                        <>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                {item.code}
                              </code>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.name}</p>
                              {item.description && (
                                <p className="text-sm text-gray-600 truncate max-w-xs">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline">{item.bodySystem}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {item.relatedDiseases?.slice(0, 2).map(disease => (
                                <Badge key={disease} variant="secondary" size="sm">
                                  {disease}
                                </Badge>
                              ))}
                              {item.relatedDiseases?.length > 2 && (
                                <Badge variant="secondary" size="sm">
                                  +{item.relatedDiseases.length - 2}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {item.relevantSpecializations?.slice(0, 2).map(spec => (
                                <Badge key={spec} variant="secondary" size="sm">
                                  {spec}
                                </Badge>
                              ))}
                              {item.relevantSpecializations?.length > 2 && (
                                <Badge variant="secondary" size="sm">
                                  +{item.relevantSpecializations.length - 2}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge 
                              status={item.isActive ? 'active' : 'inactive'}
                              variant={item.isActive ? 'green' : 'gray'}
                            >
                              {item.isActive ? 'Active' : 'Inactive'}
                            </StatusBadge>
                          </td>
                        </>
                      )}

                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Eye className="w-4 h-4" />}
                            onClick={() => handleEdit(item)}
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Edit className="w-4 h-4" />}
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Trash2 className="w-4 h-4" />}
                            onClick={() => {
                              setSelectedItem(item);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item) => (
            <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getTabIcon(activeTab)}
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {item.icdCode || item.atcCode || item.code}
                  </code>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Eye className="w-4 h-4" />}
                    onClick={() => handleEdit(item)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Edit className="w-4 h-4" />}
                    onClick={() => handleEdit(item)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={() => {
                      setSelectedItem(item);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-600 hover:text-red-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">{item.name}</h3>
                {activeTab === 'medications' && item.genericName && (
                  <p className="text-sm text-gray-600">Generic: {item.genericName}</p>
                )}
                {item.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                )}

                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="outline">
                    {item.category || item.bodySystem}
                  </Badge>
                  {item.defaultSeverity && (
                    <Badge 
                      className={
                        item.defaultSeverity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                        item.defaultSeverity === 'SEVERE' ? 'bg-orange-100 text-orange-800' :
                        item.defaultSeverity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }
                    >
                      {item.defaultSeverity}
                    </Badge>
                  )}
                  <StatusBadge 
                    status={item.isActive ? 'active' : 'inactive'}
                    variant={item.isActive ? 'green' : 'gray'}
                  >
                    {item.isActive ? 'Active' : 'Inactive'}
                  </StatusBadge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <FormModal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          setSelectedItem(null);
        }}
        title={`${selectedItem ? 'Edit' : 'Create'} ${activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(1, -1)}`}
        loading={loading}
        size="4xl"
      >
        <form
          onSubmit={getCurrentForm().handleSubmit(handleSave)}
          className="space-y-6"
        >
          {/* Disease Form */}
          {activeTab === 'diseases' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ICD-10 Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...diseaseForm.register('icdCode')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., A00.0"
                />
                {diseaseForm.formState.errors.icdCode && (
                  <p className="mt-1 text-sm text-red-600">
                    {diseaseForm.formState.errors.icdCode.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disease Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...diseaseForm.register('name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter disease name"
                />
                {diseaseForm.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {diseaseForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  {...diseaseForm.register('description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter disease description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  {...diseaseForm.register('category')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  {diseaseCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {diseaseForm.formState.errors.category && (
                  <p className="mt-1 text-sm text-red-600">
                    {diseaseForm.formState.errors.category.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub Category
                </label>
                <input
                  type="text"
                  {...diseaseForm.register('subCategory')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter sub category"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Severity <span className="text-red-500">*</span>
                </label>
                <select
                  {...diseaseForm.register('defaultSeverity')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {severityLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...diseaseForm.register('isActive')}
                  id="diseaseActive"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="diseaseActive" className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>
          )}

          {/* Medication Form */}
          {activeTab === 'medications' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ATC Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...medicationForm.register('atcCode')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., N02BA01"
                />
                {medicationForm.formState.errors.atcCode && (
                  <p className="mt-1 text-sm text-red-600">
                    {medicationForm.formState.errors.atcCode.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...medicationForm.register('name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter brand name"
                />
                {medicationForm.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {medicationForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Generic Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...medicationForm.register('genericName')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter generic name"
                />
                {medicationForm.formState.errors.genericName && (
                  <p className="mt-1 text-sm text-red-600">
                    {medicationForm.formState.errors.genericName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  {...medicationForm.register('category')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  {medicationCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {medicationForm.formState.errors.category && (
                  <p className="mt-1 text-sm text-red-600">
                    {medicationForm.formState.errors.category.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub Category
                </label>
                <input
                  type="text"
                  {...medicationForm.register('subCategory')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter sub category"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...medicationForm.register('isActive')}
                  id="medicationActive"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="medicationActive" className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>
          )}

          {/* Symptom Form */}
          {activeTab === 'symptoms' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptom Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...symptomForm.register('code')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., SYM001"
                />
                {symptomForm.formState.errors.code && (
                  <p className="mt-1 text-sm text-red-600">
                    {symptomForm.formState.errors.code.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptom Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...symptomForm.register('name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter symptom name"
                />
                {symptomForm.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {symptomForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  {...symptomForm.register('description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter symptom description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Body System <span className="text-red-500">*</span>
                </label>
                <select
                  {...symptomForm.register('bodySystem')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Body System</option>
                  {bodySystems.map(sys => (
                    <option key={sys} value={sys}>{sys}</option>
                  ))}
                </select>
                {symptomForm.formState.errors.bodySystem && (
                  <p className="mt-1 text-sm text-red-600">
                    {symptomForm.formState.errors.bodySystem.message}
                  </p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...symptomForm.register('isActive')}
                  id="symptomActive"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="symptomActive" className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                setSelectedItem(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              icon={<Save className="w-4 h-4" />}
            >
              {selectedItem ? 'Update' : 'Create'} {activeTab.slice(0, -1)}
            </Button>
          </div>
        </form>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedItem(null);
        }}
        onConfirm={handleDelete}
        title={`Delete ${activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(1, -1)}`}
        message={`Are you sure you want to delete "${selectedItem?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmStyle="danger"
        loading={loading}
      />

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title={`Import ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Upload {activeTab} data
            </p>
            <p className="text-gray-600 mb-4">
              Select a CSV or JSON file to import {activeTab} data
            </p>
            <input
              type="file"
              accept=".csv,.json"
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              Choose File
            </label>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Import Guidelines</h4>
                <div className="mt-2 text-sm text-blue-800">
                  <ul className="list-disc list-inside space-y-1">
                    <li>File should contain all required fields</li>
                    <li>Use the export feature to see the expected format</li>
                    <li>Duplicate codes will be skipped</li>
                    <li>Invalid entries will be reported</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowImportModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={<Upload className="w-4 h-4" />}
            >
              Import Data
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MedicalConfiguration;