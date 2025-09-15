import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Settings,
  Globe,
  DollarSign,
  Users,
  Mail,
  Shield,
  Database,
  Clock,
  FileText,
  Languages,
  Bell,
  Palette,
  Code,
  Save,
  RefreshCw,
  Upload,
  Download,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Info,
  Lock,
  Unlock,
  Key,
  Server,
  Cloud,
  Smartphone,
  Monitor,
  Wifi,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  CreditCard,
  Building,
  MapPin,
  Phone,
  HelpCircle,
  Search
} from 'lucide-react';

import Card, { StatsCard, AlertCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Modal, { ConfirmModal, FormModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import adminService from '../../services/api/adminService';

// Validation schemas
const systemConfigSchema = yup.object({
  configKey: yup.string().required('Configuration key is required'),
  configValue: yup.string().required('Configuration value is required'),
  configType: yup.string().required('Configuration type is required'),
  description: yup.string().optional()
});

const staticContentSchema = yup.object({
  page: yup.string().required('Page is required'),
  content: yup.string().required('Content is required'),
  contentType: yup.string().optional()
});

const specializationSchema = yup.object({
  specializations: yup.array()
    .of(yup.string().required('Specialization name is required'))
    .min(1, 'At least one specialization is required')
});

const AdminSettings = () => {
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // State management
  const [activeTab, setActiveTab] = useState('system');
  const [systemConfigs, setSystemConfigs] = useState([]);
  const [staticContents, setStaticContents] = useState({});
  const [specializations, setSpecializations] = useState([]);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showSpecializationModal, setShowSpecializationModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Form setups
  const configForm = useForm({
    resolver: yupResolver(systemConfigSchema),
    defaultValues: {
      configKey: '',
      configValue: '',
      configType: 'STRING',
      description: ''
    }
  });

  const contentForm = useForm({
    resolver: yupResolver(staticContentSchema),
    defaultValues: {
      page: '',
      content: '',
      contentType: 'HTML'
    }
  });

  const specializationForm = useForm({
    resolver: yupResolver(specializationSchema),
    defaultValues: {
      specializations: []
    }
  });

  // Load data on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load system configurations
      const configData = await execute(() => adminService.getSystemConfiguration());
      setSystemConfigs(configData || []);

      // Load static content
      const pages = ['about-us', 'contact-us', 'terms-of-service', 'privacy-policy', 'help'];
      const contentData = {};
      for (const page of pages) {
        try {
          const content = await execute(() => adminService.getStaticContent(page));
          contentData[page] = content;
        } catch (error) {
          console.warn(`Failed to load content for ${page}:`, error);
        }
      }
      setStaticContents(contentData);

      // Load specializations
      const specializationConfig = systemConfigs.find(config => config.configKey === 'SPECIALIZATIONS');
      if (specializationConfig) {
        setSpecializations(specializationConfig.configValue.split(','));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSaveConfig = async (data) => {
    try {
      const configData = {
        ...data,
        id: selectedConfig?.id
      };

      await execute(() => adminService.updateSystemConfiguration(configData));
      
      // Update local state
      if (selectedConfig) {
        setSystemConfigs(prev =>
          prev.map(config =>
            config.id === selectedConfig.id ? { ...config, ...data } : config
          )
        );
      } else {
        setSystemConfigs(prev => [...prev, { ...data, id: Date.now() }]);
      }

      setShowConfigModal(false);
      setSelectedConfig(null);
      configForm.reset();
      
      alert('Configuration saved successfully!');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      alert('Failed to save configuration. Please try again.');
    }
  };

  const handleSaveContent = async (data) => {
    try {
      await execute(() => adminService.updateStaticContent(data));
      
      // Update local state
      setStaticContents(prev => ({
        ...prev,
        [data.page]: data.content
      }));

      setShowContentModal(false);
      setSelectedContent(null);
      contentForm.reset();
      
      alert('Content updated successfully!');
    } catch (error) {
      console.error('Failed to save content:', error);
      alert('Failed to save content. Please try again.');
    }
  };

  const handleSaveSpecializations = async (data) => {
    try {
      await execute(() => adminService.manageSpecializations({
        specializations: data.specializations
      }));
      
      setSpecializations(data.specializations);
      setShowSpecializationModal(false);
      specializationForm.reset();
      
      alert('Specializations updated successfully!');
    } catch (error) {
      console.error('Failed to save specializations:', error);
      alert('Failed to save specializations. Please try again.');
    }
  };

  const handleEditConfig = (config) => {
    setSelectedConfig(config);
    configForm.reset(config);
    setShowConfigModal(true);
  };

  const handleEditContent = (page, content) => {
    setSelectedContent({ page, content });
    contentForm.reset({
      page,
      content,
      contentType: 'HTML'
    });
    setShowContentModal(true);
  };

  const handleEditSpecializations = () => {
    specializationForm.reset({
      specializations: [...specializations]
    });
    setShowSpecializationModal(true);
  };

  // Predefined system configurations
  const defaultConfigs = [
    {
      key: 'CONSULTATION_MIN_FEE',
      label: 'Minimum Consultation Fee',
      type: 'NUMBER',
      description: 'Minimum fee that doctors can charge for consultations'
    },
    {
      key: 'CONSULTATION_MAX_FEE',
      label: 'Maximum Consultation Fee',
      type: 'NUMBER',
      description: 'Maximum fee that doctors can charge for consultations'
    },
    {
      key: 'SUBSCRIPTION_MONTHLY_RATE',
      label: 'Monthly Subscription Rate',
      type: 'NUMBER',
      description: 'Monthly subscription fee for patients'
    },
    {
      key: 'SUBSCRIPTION_ANNUAL_RATE',
      label: 'Annual Subscription Rate',
      type: 'NUMBER',
      description: 'Annual subscription fee for patients (with discount)'
    },
    {
      key: 'SESSION_TIMEOUT_MINUTES',
      label: 'Session Timeout (Minutes)',
      type: 'NUMBER',
      description: 'User session timeout duration in minutes'
    },
    {
      key: 'MAX_FILE_UPLOAD_SIZE_MB',
      label: 'Max File Upload Size (MB)',
      type: 'NUMBER',
      description: 'Maximum file size allowed for uploads'
    },
    {
      key: 'SYSTEM_MAINTENANCE_MODE',
      label: 'Maintenance Mode',
      type: 'BOOLEAN',
      description: 'Enable/disable system maintenance mode'
    },
    {
      key: 'EMAIL_NOTIFICATIONS_ENABLED',
      label: 'Email Notifications',
      type: 'BOOLEAN',
      description: 'Enable/disable email notifications system-wide'
    },
    {
      key: 'SUPPORTED_LANGUAGES',
      label: 'Supported Languages',
      type: 'LIST',
      description: 'Comma-separated list of supported language codes'
    },
    {
      key: 'DEFAULT_LANGUAGE',
      label: 'Default Language',
      type: 'STRING',
      description: 'Default language for new users'
    }
  ];

  const staticPages = [
    { key: 'about-us', label: 'About Us', icon: <Info className="w-4 h-4" /> },
    { key: 'contact-us', label: 'Contact Us', icon: <Mail className="w-4 h-4" /> },
    { key: 'terms-of-service', label: 'Terms of Service', icon: <FileText className="w-4 h-4" /> },
    { key: 'privacy-policy', label: 'Privacy Policy', icon: <Shield className="w-4 h-4" /> },
    { key: 'help', label: 'Help & Support', icon: <HelpCircle className="w-4 h-4" /> }
  ];

  const configTypes = [
    { value: 'STRING', label: 'Text' },
    { value: 'NUMBER', label: 'Number' },
    { value: 'BOOLEAN', label: 'Boolean' },
    { value: 'LIST', label: 'List' },
    { value: 'JSON', label: 'JSON' }
  ];

  const tabs = [
    { id: 'system', label: 'System Config', icon: <Settings className="w-4 h-4" /> },
    { id: 'content', label: 'Static Content', icon: <FileText className="w-4 h-4" /> },
    { id: 'specializations', label: 'Specializations', icon: <Users className="w-4 h-4" /> },
    { id: 'payments', label: 'Payment Settings', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> }
  ];

  const filteredConfigs = systemConfigs.filter(config =>
    config.configKey?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-600 mt-1">Configure system parameters and content</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            icon={<RefreshCw className={loading ? "w-4 h-4 animate-spin" : "w-4 h-4"} />}
            onClick={loadSettings}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
          >
            Export Settings
          </Button>
          <Button
            variant="outline"
            icon={<Upload className="w-4 h-4" />}
          >
            Import Settings
          </Button>
        </div>
      </div>

      {/* Warning for unsaved changes */}
      {unsavedChanges && (
        <AlertCard
          type="warning"
          title="Unsaved Changes"
          message="You have unsaved changes. Make sure to save your configuration before leaving this page."
          action={
            <Button size="sm" onClick={() => setUnsavedChanges(false)}>
              Dismiss
            </Button>
          }
        />
      )}

      {/* Tabs */}
      <Card className="p-0">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </Card>

      {/* System Configuration Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          {/* Header with search and add button */}
          <Card className="p-4">
            <div className="flex justify-between items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search configurations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  setSelectedConfig(null);
                  configForm.reset();
                  setShowConfigModal(true);
                }}
              >
                Add Configuration
              </Button>
            </div>
          </Card>

          {/* System Configuration List */}
          <div className="grid gap-4">
            {filteredConfigs.map((config) => (
              <Card key={config.id || config.configKey} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium text-gray-900">{config.configKey}</h3>
                      <Badge variant="outline">{config.configType}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-sm text-gray-500 mr-2">Value:</span>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {config.configType === 'BOOLEAN' 
                          ? (config.configValue === 'true' ? 'Enabled' : 'Disabled')
                          : config.configValue
                        }
                      </code>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Edit className="w-4 h-4" />}
                      onClick={() => handleEditConfig(config)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {filteredConfigs.length === 0 && (
              <Card className="p-8 text-center">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No configurations found</p>
              </Card>
            )}
          </div>

          {/* Quick Setup for Default Configs */}
          <Card>
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quick Setup</h3>
              <p className="text-sm text-gray-600 mt-1">
                Configure commonly used system parameters
              </p>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {defaultConfigs.map((config) => {
                  const existingConfig = systemConfigs.find(c => c.configKey === config.key);
                  return (
                    <div key={config.key} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{config.label}</h4>
                          <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                          {existingConfig && (
                            <div className="mt-2">
                              <span className="text-sm text-gray-500">Current: </span>
                              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                {existingConfig.configValue}
                              </code>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit className="w-4 h-4" />}
                          onClick={() => handleEditConfig(existingConfig || {
                            configKey: config.key,
                            configType: config.type,
                            description: config.description,
                            configValue: ''
                          })}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Static Content Tab */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="grid gap-6">
            {staticPages.map((page) => (
              <Card key={page.key}>
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {page.icon}
                      <h3 className="text-lg font-medium text-gray-900">{page.label}</h3>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Edit className="w-4 h-4" />}
                      onClick={() => handleEditContent(page.key, staticContents[page.key])}
                    >
                      Edit Content
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                    {staticContents[page.key] ? (
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: staticContents[page.key] }}
                      />
                    ) : (
                      <p className="text-gray-500 italic">No content available</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Specializations Tab */}
      {activeTab === 'specializations' && (
        <div className="space-y-6">
          <Card>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Medical Specializations</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage the list of medical specializations available in the system
                  </p>
                </div>
                <Button
                  variant="primary"
                  icon={<Edit className="w-4 h-4" />}
                  onClick={handleEditSpecializations}
                >
                  Edit Specializations
                </Button>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {specializations.map((spec, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Users className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{spec}</span>
                  </div>
                ))}
                {specializations.length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No specializations configured</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Payment Settings Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Payment Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">SMS Settings</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-gray-900">Enable SMS Notifications</label>
                    <p className="text-sm text-gray-600">Send SMS for urgent notifications</p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">SMS Provider</label>
                  <select className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>Twilio</option>
                    <option>AWS SNS</option>
                    <option>Nexmo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">API Key</label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Notification Templates */}
          <Card>
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Notification Templates</h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {[
                  { key: 'case_assigned', label: 'Case Assigned to Doctor', type: 'Email + SMS' },
                  { key: 'appointment_scheduled', label: 'Appointment Scheduled', type: 'Email' },
                  { key: 'payment_confirmation', label: 'Payment Confirmation', type: 'Email' },
                  { key: 'subscription_expiry', label: 'Subscription Expiry Warning', type: 'Email + SMS' },
                  { key: 'password_reset', label: 'Password Reset', type: 'Email' }
                ].map((template) => (
                  <div key={template.key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{template.label}</h4>
                      <p className="text-sm text-gray-600">Delivery: {template.type}</p>
                    </div>
                    <Button variant="outline" size="sm" icon={<Edit className="w-4 h-4" />}>
                      Edit Template
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Authentication Settings</h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    placeholder="30"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Login Attempts</label>
                  <input
                    type="number"
                    placeholder="5"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-gray-900">Require Email Verification</label>
                    <p className="text-sm text-gray-600">Users must verify email before activation</p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-gray-900">Enable Two-Factor Authentication</label>
                    <p className="text-sm text-gray-600">Optional 2FA for enhanced security</p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Password Policy</h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Minimum Length</label>
                  <input
                    type="number"
                    placeholder="8"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Requirements</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2" />
                      <span className="text-sm">Require uppercase letter</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2" />
                      <span className="text-sm">Require lowercase letter</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2" />
                      <span className="text-sm">Require numbers</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2" />
                      <span className="text-sm">Require special characters</span>
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* API Security */}
          <Card>
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">API Security</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rate Limit (requests/minute)</label>
                  <input
                    type="number"
                    placeholder="100"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">JWT Expiry (hours)</label>
                  <input
                    type="number"
                    placeholder="24"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Refresh Token Expiry (days)</label>
                  <input
                    type="number"
                    placeholder="30"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* System Maintenance */}
          <Card>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">System Maintenance</h3>
                <Badge variant="success">System Online</Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-yellow-800">Maintenance Mode</h4>
                  <p className="text-sm text-yellow-700">Temporarily disable system access for maintenance</p>
                </div>
                <Button variant="warning" size="sm">
                  Enable Maintenance Mode
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* System Configuration Modal */}
      <FormModal
        isOpen={showConfigModal}
        onClose={() => {
          setShowConfigModal(false);
          setSelectedConfig(null);
          configForm.reset();
        }}
        title={`${selectedConfig ? 'Edit' : 'Add'} System Configuration`}
        loading={loading}
      >
        <form onSubmit={configForm.handleSubmit(handleSaveConfig)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Configuration Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...configForm.register('configKey')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., SYSTEM_TIMEOUT_MINUTES"
            />
            {configForm.formState.errors.configKey && (
              <p className="mt-1 text-sm text-red-600">
                {configForm.formState.errors.configKey.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Configuration Type <span className="text-red-500">*</span>
            </label>
            <select
              {...configForm.register('configType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {configTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Configuration Value <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...configForm.register('configValue')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter configuration value"
            />
            {configForm.formState.errors.configValue && (
              <p className="mt-1 text-sm text-red-600">
                {configForm.formState.errors.configValue.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...configForm.register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe what this configuration controls"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowConfigModal(false);
                setSelectedConfig(null);
                configForm.reset();
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
              {selectedConfig ? 'Update' : 'Save'} Configuration
            </Button>
          </div>
        </form>
      </FormModal>

      {/* Static Content Modal */}
      <FormModal
        isOpen={showContentModal}
        onClose={() => {
          setShowContentModal(false);
          setSelectedContent(null);
          contentForm.reset();
        }}
        title="Edit Static Content"
        loading={loading}
        size="6xl"
      >
        <form onSubmit={contentForm.handleSubmit(handleSaveContent)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page <span className="text-red-500">*</span>
            </label>
            <select
              {...contentForm.register('page')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {staticPages.map(page => (
                <option key={page.key} value={page.key}>{page.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              {...contentForm.register('content')}
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="Enter HTML content..."
            />
            {contentForm.formState.errors.content && (
              <p className="mt-1 text-sm text-red-600">
                {contentForm.formState.errors.content.message}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowContentModal(false);
                setSelectedContent(null);
                contentForm.reset();
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
              Save Content
            </Button>
          </div>
        </form>
      </FormModal>

      {/* Specializations Modal */}
      <FormModal
        isOpen={showSpecializationModal}
        onClose={() => {
          setShowSpecializationModal(false);
          specializationForm.reset();
        }}
        title="Edit Medical Specializations"
        loading={loading}
        size="2xl"
      >
        <form onSubmit={specializationForm.handleSubmit(handleSaveSpecializations)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specializations <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {specializationForm.watch('specializations').map((spec, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={spec}
                    onChange={(e) => {
                      const newSpecs = [...specializationForm.getValues('specializations')];
                      newSpecs[index] = e.target.value;
                      specializationForm.setValue('specializations', newSpecs);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter specialization name"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={() => {
                      const newSpecs = [...specializationForm.getValues('specializations')];
                      newSpecs.splice(index, 1);
                      specializationForm.setValue('specializations', newSpecs);
                    }}
                    className="text-red-600 hover:text-red-700"
                  />
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                const currentSpecs = specializationForm.getValues('specializations');
                specializationForm.setValue('specializations', [...currentSpecs, '']);
              }}
              className="mt-2"
            >
              Add Specialization
            </Button>
            {specializationForm.formState.errors.specializations && (
              <p className="mt-1 text-sm text-red-600">
                {specializationForm.formState.errors.specializations.message}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowSpecializationModal(false);
                specializationForm.reset();
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
              Save Specializations
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};

export default AdminSettings;