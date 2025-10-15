import React from 'react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="space-y-4 text-gray-700">
          <p>This is a development version of the Medical Consultation System.</p>
          <p>We collect and use your email and profile information solely for authentication purposes.</p>
          <p>Your data is stored securely and is not shared with third parties.</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;