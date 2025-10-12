import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Settings, Lock, Bell, Eye, Globe, Moon, Sun, Monitor,
  Shield, Activity, Save, Clock, Calendar, Users, MessageSquare
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import doctorService from '../../services/api/doctorService';

const DoctorSettings = () => {
  const { user } = useAuth();
  const { execute, loading } = useApi();

  const [activeTab, setActiveTab] = useState('preferences');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalPreferences, setOriginalPreferences] = useState(null);
  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      sms: true,
      push: true,
      newCaseAssignment: true,
      appointmentReminders: true,
      patientMessages: true,
      systemUpdates: true,
      promotions: false
    },
    availability: {
      autoAcceptCases: false,
      maxDailyCases: 10,
      allowEmergencyCases: true,
      requiresConsultationFee: true
    },
    privacy: {
      profileVisibility: 'verified_patients',
      showRating: true,
      showExperience: true,
      allowReviews: true
    },
    accessibility: {
      theme: 'light',
      fontSize: 'medium',
      language: 'en',
      timezone: 'UTC'
    }
  });

  const passwordForm = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const data = await execute(() => doctorService.getSettings());
      if (data) {
        setPreferences(data);
        setOriginalPreferences(JSON.parse(JSON.stringify(data)));
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const handlePreferenceChange = (category, updates) => {
    const updatedPreferences = {
      ...preferences,
      [category]: {
        ...preferences[category],
        ...updates
      }
    };
    setPreferences(updatedPreferences);
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      await execute(() => doctorService.updateSettings(preferences));
      setOriginalPreferences(JSON.parse(JSON.stringify(preferences)));
      setHasChanges(false);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to update preferences:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  const handleCancelChanges = () => {
    setPreferences(JSON.parse(JSON.stringify(originalPreferences)));
    setHasChanges(false);
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
      await execute(() => doctorService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      }));
      setShowPasswordModal(false);
      passwordForm.reset();
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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-3">
              <Settings className="w-8 h-8 text-primary-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600">Manage your preferences and security settings</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <nav className="space-y-1 p-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id ? 'bg-primary-100 text-primary-900' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {/* Save/Cancel Buttons - Show when there are changes */}
            {hasChanges && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      You have unsaved changes
                    </span>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelChanges}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveSettings}
                      disabled={loading}
                      icon={<Save className="w-4 h-4" />}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                {/* Notification Settings */}
                <Card title="Notification Preferences">
                  <div className="p-6 space-y-4">
                    {Object.entries({
                      email: { title: 'Email Notifications', desc: 'Receive updates via email' },
                      sms: { title: 'SMS Notifications', desc: 'Receive text message alerts' },
                      push: { title: 'Push Notifications', desc: 'Receive browser notifications' },
                      newCaseAssignment: { title: 'New Case Assignments', desc: 'Get notified about new case assignments' },
                      appointmentReminders: { title: 'Appointment Reminders', desc: 'Get notified about upcoming appointments' },
                      patientMessages: { title: 'Patient Messages', desc: 'Get notified about new patient messages' }
                    }).map(([key, { title, desc }]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{title}</h4>
                          <p className="text-sm text-gray-600">{desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.notifications[key]}
                          onChange={(e) => handlePreferenceChange('notifications', { [key]: e.target.checked })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Availability Settings */}
                <Card title="Availability Settings">
                  <div className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Auto-Accept Cases</h4>
                          <p className="text-sm text-gray-600">Automatically accept matched cases</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.availability.autoAcceptCases}
                          onChange={(e) => handlePreferenceChange('availability', { autoAcceptCases: e.target.checked })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Maximum Daily Cases</label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={preferences.availability.maxDailyCases}
                          onChange={(e) => handlePreferenceChange('availability', { maxDailyCases: parseInt(e.target.value) })}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                        <p className="text-sm text-gray-600 mt-1">Maximum cases per day</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Accept Emergency Cases</h4>
                          <p className="text-sm text-gray-600">Allow urgent/emergency case assignments</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.availability.allowEmergencyCases}
                          onChange={(e) => handlePreferenceChange('availability', { allowEmergencyCases: e.target.checked })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Accessibility Settings */}
                <Card title="Accessibility & Display">
                  <div className="p-6 space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Theme</h4>
                      <div className="flex space-x-4">
                        {[
                          { value: 'light', icon: <Sun className="w-5 h-5" />, label: 'Light' },
                          { value: 'dark', icon: <Moon className="w-5 h-5" />, label: 'Dark' },
                          { value: 'system', icon: <Monitor className="w-5 h-5" />, label: 'System' }
                        ].map(theme => (
                          <button
                            key={theme.value}
                            onClick={() => handlePreferenceChange('accessibility', { theme: theme.value })}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                              preferences.accessibility.theme === theme.value
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-gray-300 text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            {theme.icon}
                            <span className="font-medium">{theme.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Language</h4>
                      <select 
                        value={preferences.accessibility.language}
                        onChange={(e) => handlePreferenceChange('accessibility', { language: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Profile Visibility</h4>
                      <select 
                        value={preferences.privacy.profileVisibility}
                        onChange={(e) => handlePreferenceChange('privacy', { profileVisibility: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="private">Private</option>
                        <option value="verified_patients">Verified Patients Only</option>
                        <option value="all_patients">All Patients</option>
                        <option value="public">Public</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      {Object.entries({
                        showRating: { title: 'Show Rating', desc: 'Display your rating on profile' },
                        showExperience: { title: 'Show Experience', desc: 'Display years of experience' },
                        allowReviews: { title: 'Allow Patient Reviews', desc: 'Let patients leave reviews' }
                      }).map(([key, { title, desc }]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{title}</h4>
                            <p className="text-sm text-gray-600">{desc}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={preferences.privacy[key]}
                            onChange={(e) => handlePreferenceChange('privacy', { [key]: e.target.checked })}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
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
                      <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>
                        Change Password
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-gray-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-600">Add extra security</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Enable</Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  {...passwordForm.register('currentPassword', { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  {...passwordForm.register('newPassword', { required: true, minLength: 8 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  {...passwordForm.register('confirmPassword', { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
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
                <Button onClick={passwordForm.handleSubmit(handlePasswordSubmit)} disabled={loading}>
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSettings;