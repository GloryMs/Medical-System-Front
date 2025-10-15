import React from 'react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="space-y-4 text-gray-700">
          <p>This is a development version of the Medical Consultation System.</p>
          <p>By using this application, you agree to use it for testing purposes only.</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;