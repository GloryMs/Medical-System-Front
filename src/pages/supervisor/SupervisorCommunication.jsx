import React from 'react';
import { MessageSquare } from 'lucide-react';
import Card from '../../components/common/Card';

const SupervisorCommunication = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="mt-1 text-sm text-gray-600">Communicate with doctors about patient cases</p>
      </div>

      <Card className="text-center py-12">
        <MessageSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Communication Center</h3>
        <p className="text-gray-600">Messaging features are under development.</p>
      </Card>
    </div>
  );
};

export default SupervisorCommunication;
