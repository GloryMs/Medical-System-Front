import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Button from '../../components/common/Button';

const ServerError = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-yellow-600" />
          </div>
          
          <h1 className="text-6xl font-bold text-yellow-500">500</h1>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Server Error</h2>
          <p className="text-gray-600 mt-2">
            Something went wrong on our end. We're working to fix this issue. Please try again later.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={handleRefresh}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Try Again
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

export default ServerError;