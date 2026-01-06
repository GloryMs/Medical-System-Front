import React from 'react';
import { Settings } from 'lucide-react';
import Card from '../../components/common/Card';

const SupervisorSettings = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">Configure your supervisor preferences</p>
      </div>

      <Card title="Notification Preferences">
        <p className="text-gray-600">Notification settings will be available soon.</p>
      </Card>

      <Card title="Language & Region">
        <p className="text-gray-600">Language and region settings will be available soon.</p>
      </Card>

      <Card className="text-center py-8">
        <Settings className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-600">Advanced settings features are under development.</p>
      </Card>
    </div>
  );
};

export default SupervisorSettings;
