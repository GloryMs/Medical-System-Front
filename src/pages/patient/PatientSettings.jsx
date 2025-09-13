import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Settings, 
  Lock, 
  Bell, 
  Eye, 
  Globe, 
  Moon, 
  Sun, 
  Monitor,
  Shield,
  Activity,
  Save,
  Edit3,
  X
} from 'lucide-react';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import patientService from '../../services/api/patientService';

const PatientSettings = () => {
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // State management
  const [activeTab, setActiveTab] = useState('preferences');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      sms: true,
      push: true,
      appointments: true,
      reports: true,
      promotions: false
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
      medicalHistorySharing: true
    },
    accessibility: {
      theme: 'light',
      fontSize: 'medium',
      language: 'en'
    }
  });

  // Password form
  const passwordForm = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  // Load preferences on component mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const data = await execute(() => patientService.getPreferences());
      if (data) {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const handlePreferenceUpdate = async (category, updates) => {
    try {
      const updatedPreferences = {
        ...preferences,
        [category]: {
          ...preferences[category],
          ...updates
        }
      };
      
      await execute(() => patientService.updatePreferences(updatedPreferences));
      setPreferences(updatedPreferences);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const handlePasswordSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      passwordForm.setError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match'
      });
      return;
    }

    try {
      await execute(() => patientService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      }));
      setShowPasswordModal(false);
      passwordForm.reset();
      // Show success message
    } catch (error) {
      console.error('Failed to change password:', error);
      passwordForm.setError('currentPassword', {
        type: 'manual',
        message: 'Current password is incorrect'
      });
    }
  };

  const tabs = [
    { id: 'preferences', label: 'Preferences', icon: <Settings className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Lock className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-3">
              <Settings className="w-8 h-8 text-primary-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600">
                  Manage your preferences and security settings
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <nav className="space-y-1 p-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                {/* Notification Preferences */}
                <Card title="Notification Preferences">
                  <div className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Email Notifications</h4>
                          <p className="text-sm text-gray-600">Receive updates via email</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.notifications.email}
                          onChange={(e) => handlePreferenceUpdate('notifications', { email: e.target.checked })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                          <p className="text-sm text-gray-600">Receive text message alerts</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.notifications.sms}
                          onChange={(e) => handlePreferenceUpdate('notifications', { sms: e.target.checked })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Push Notifications</h4>
                          <p className="text-sm text-gray-600">Receive browser notifications</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.notifications.push}
                          onChange={(e) => handlePreferenceUpdate('notifications', { push: e.target.checked })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Appointment Reminders</h4>
                          <p className="text-sm text-gray-600">Get notified about upcoming appointments</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.notifications.appointments}
                          onChange={(e) => handlePreferenceUpdate('notifications', { appointments: e.target.checked })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Report Notifications</h4>
                          <p className="text-sm text-gray-600">Get notified when reports are ready</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.notifications.reports}
                          onChange={(e) => handlePreferenceUpdate('notifications', { reports: e.target.checked })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Promotional Emails</h4>
                          <p className="text-sm text-gray-600">Receive promotional offers and updates</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.notifications.promotions}
                          onChange={(e) => handlePreferenceUpdate('notifications', { promotions: e.target.checked })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Theme Preferences */}
                <Card title="Display Preferences">
                  <div className="p-6 space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Theme</h4>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="theme"
                            value="light"
                            checked={preferences.accessibility.theme === 'light'}
                            onChange={(e) => handlePreferenceUpdate('accessibility', { theme: e.target.value })}
                            className="text-primary-600 focus:ring-primary-500"
                          />
                          <Sun className="w-4 h-4" />
                          <span className="text-sm text-gray-700">Light</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="theme"
                            value="dark"
                            checked={preferences.accessibility.theme === 'dark'}
                            onChange={(e) => handlePreferenceUpdate('accessibility', { theme: e.target.value })}
                            className="text-primary-600 focus:ring-primary-500"
                          />
                          <Moon className="w-4 h-4" />
                          <span className="text-sm text-gray-700">Dark</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="theme"
                            value="system"
                            checked={preferences.accessibility.theme === 'system'}
                            onChange={(e) => handlePreferenceUpdate('accessibility', { theme: e.target.value })}
                            className="text-primary-600 focus:ring-primary-500"
                          />
                          <Monitor className="w-4 h-4" />
                          <span className="text-sm text-gray-700">System</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Font Size</h4>
                      <select 
                        value={preferences.accessibility.fontSize}
                        onChange={(e) => handlePreferenceUpdate('accessibility', { fontSize: e.target.value })}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Language</h4>
                      <select 
                        value={preferences.accessibility.language}
                        onChange={(e) => handlePreferenceUpdate('accessibility', { language: e.target.value })}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="en">English</option>
                        <option value="de">German</option>
                        <option value="fr">French</option>
                        <option value="es">Spanish</option>
                      </select>
                    </div>
                  </div>
                </Card>

                {/* Privacy Settings */}
                <Card title="Privacy Settings">
                  <div className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Profile Visibility</h4>
                          <p className="text-sm text-gray-600">Control who can see your profile information</p>
                        </div>
                        <select 
                          value={preferences.privacy.profileVisibility}
                          onChange={(e) => handlePreferenceUpdate('privacy', { profileVisibility: e.target.value })}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="private">Private</option>
                          <option value="doctors">Doctors Only</option>
                          <option value="public">Public</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Data Sharing</h4>
                          <p className="text-sm text-gray-600">Share anonymized data for research</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.privacy.dataSharing}
                          onChange={(e) => handlePreferenceUpdate('privacy', { dataSharing: e.target.checked })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Medical History Sharing</h4>
                          <p className="text-sm text-gray-600">Allow assigned doctors to view full medical history</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.privacy.medicalHistorySharing}
                          onChange={(e) => handlePreferenceUpdate('privacy', { medicalHistorySharing: e.target.checked })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Password Security */}
                <Card title="Password & Security">
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Lock className="w-5 h-5 text-gray-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">Password</h4>
                          <p className="text-sm text-gray-600">Last updated 3 months ago</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPasswordModal(true)}
                      >
                        Change Password
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-gray-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-600">Add an extra layer of security</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Enable 2FA
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Activity className="w-5 h-5 text-gray-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">Login Activity</h4>
                          <p className="text-sm text-gray-600">Monitor your account activity</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Activity
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Session Management */}
                <Card title="Active Sessions">
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <h4 className="font-medium text-gray-900">Current Session</h4>
                            <p className="text-sm text-gray-600">
                              Chrome on Windows • Last active now
                            </p>
                            <p className="text-sm text-gray-500">IP: 192.168.1.100</p>
                          </div>
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Active
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <div>
                            <h4 className="font-medium text-gray-900">Mobile App</h4>
                            <p className="text-sm text-gray-600">
                              iOS App • Last active 2 hours ago
                            </p>
                            <p className="text-sm text-gray-500">IP: 192.168.1.105</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Revoke
                        </Button>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button variant="outline">
                        Sign Out All Other Sessions
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Account Security */}
                <Card title="Account Security">
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Email Verification</h4>
                        <p className="text-sm text-gray-600">Your email address is verified</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Phone Verification</h4>
                        <p className="text-sm text-gray-600">Your phone number is verified</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Account Status</h4>
                        <p className="text-sm text-gray-600">Your account is active and secure</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Data Export */}
                <Card title="Data Management">
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Export Data</h4>
                        <p className="text-sm text-gray-600">Download a copy of your data</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Request Export
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Delete Account</h4>
                        <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                      </div>
                      <Button variant="danger" size="sm">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Change Password
            </h3>
            
            <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  {...passwordForm.register('currentPassword', { required: 'Current password is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  {...passwordForm.register('newPassword', { 
                    required: 'New password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  {...passwordForm.register('confirmPassword', { required: 'Please confirm your new password' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-900 mb-1">Password Requirements:</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Contains uppercase and lowercase letters</li>
                  <li>• Contains at least one number</li>
                  <li>• Contains at least one special character</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordModal(false);
                    passwordForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  Change Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientSettings;