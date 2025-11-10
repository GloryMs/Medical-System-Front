import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AlertTriangle, Lock, ArrowRight } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import patientService from '../../services/api/patientService';

/**
 * SubscriptionGuard Component
 * Protects routes that require an active subscription
 * Redirects to subscription page if subscription is inactive or expired
 */
const SubscriptionGuard = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const subscription = await patientService.getSubscription();
      setSubscriptionStatus(subscription?.status);
    } catch (error) {
      console.error('Failed to check subscription:', error);
      setSubscriptionStatus(null);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking subscription status...</p>
        </div>
      </div>
    );
  }

  // Allow access if subscription is active
  if (subscriptionStatus === 'active' || subscriptionStatus === 'trialing') {
    return children;
  }

  // Show subscription required page
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <div className="p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-yellow-600" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Subscription Required
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            {subscriptionStatus === 'expired'
              ? 'Your subscription has expired. Please renew to continue accessing our services.'
              : subscriptionStatus === 'canceled'
              ? 'Your subscription has been canceled. Subscribe again to access medical consultations.'
              : 'You need an active subscription to access this feature. Choose a plan to get started.'}
          </p>

          {/* Features List */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">
              With a subscription, you can:
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-gray-700">Submit and manage medical cases</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-gray-700">Schedule appointments with doctors</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-gray-700">Access specialist consultations</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-gray-700">Store and manage medical records</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-gray-700">Get priority support</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => window.location.href = '/app/patient/subscription'}
              variant="primary"
              size="lg"
            >
              {subscriptionStatus === 'expired' || subscriptionStatus === 'canceled'
                ? 'Renew Subscription'
                : 'View Plans'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button
              onClick={() => window.location.href = '/app/patient'}
              variant="outline"
              size="lg"
            >
              Back to Dashboard
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-sm text-gray-500 mt-6">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@medicalconsultation.com" className="text-primary-600 hover:underline">
              support@medicalconsultation.com
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SubscriptionGuard;