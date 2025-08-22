import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Home, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';

const AccessDenied = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
          
          <h1 className="text-6xl font-bold text-red-500">403</h1>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Access Denied</h2>
          <p className="text-gray-600 mt-2">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Go Back
          </Button>
          
          <Link to="/">
            <Button icon={<Home className="w-4 h-4" />}>
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;