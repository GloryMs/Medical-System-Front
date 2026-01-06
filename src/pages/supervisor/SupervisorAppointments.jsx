import React from 'react';
import { Calendar } from 'lucide-react';
import Card from '../../components/common/Card';

const SupervisorAppointments = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <p className="mt-1 text-sm text-gray-600">View and manage patient appointments</p>
      </div>

      <Card className="text-center py-12">
        <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Appointments</h3>
        <p className="text-gray-600">Appointment management features are under development.</p>
      </Card>
    </div>
  );
};

export default SupervisorAppointments;
