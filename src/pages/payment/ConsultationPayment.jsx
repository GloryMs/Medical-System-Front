import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  CreditCard,
  ArrowLeft,
  CheckCircle,
  User,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  DollarSign,
  Shield,
  Info
} from 'lucide-react';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StripePaymentForm from './Stripepaymentform';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import patientService from '../../services/api/patientService';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

/**
 * Consultation Payment Page
 * Handles payment for consultation fees with Stripe
 */
const ConsultationPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { caseId } = useParams();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // State
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);
  const [useNewCard, setUseNewCard] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  // Load appointment details
  useEffect(() => {
    if (location.state?.appointment) {
      setAppointmentDetails(location.state.appointment);
      createPaymentIntent(location.state.appointment);
    } else if (caseId) {
      loadCaseDetails();
    }
  }, [location.state, caseId]);

  // Load saved payment methods
  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadCaseDetails = async () => {
    try {
      const caseData = await execute(() =>
        patientService.getCaseDetails(caseId)
      );
      setAppointmentDetails(caseData);
      createPaymentIntent(caseData);
    } catch (error) {
      console.error('Failed to load case details:', error);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const methods = await execute(() =>
        patientService.getPaymentMethods()
      );
      setSavedPaymentMethods(methods.filter(m => m.isActive));
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    }
  };

  const createPaymentIntent = async (appointment) => {
    try {
      const response = await execute(() =>
        fetch('/api/payment-service/api/payments/consultations/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            patientId: user.id,
            doctorId: appointment.doctor?.id || appointment.doctor?.userId,
            caseId: appointment.caseId || appointment.id,
            amount: appointment.consultationFee || appointment.doctor?.consultationFee
          })
        }).then(res => res.json())
      );

      setClientSecret(response.clientSecret);
    } catch (error) {
      console.error('Failed to create payment intent:', error);
    }
  };

  const handlePaymentSuccess = async (paymentMethod) => {
    try {
      // Process payment with backend
      await execute(() =>
        patientService.payConsultationFee({
          patientId: user.id,
          doctorId: appointmentDetails.doctor?.id || appointmentDetails.doctor?.userId,
          caseId: appointmentDetails.caseId || appointmentDetails.id,
          paymentType: 'CONSULTATION',
          amount: appointmentDetails.consultationFee || appointmentDetails.doctor?.consultationFee,
          paymentMethodId: paymentMethod.id,
          paymentIntentId: clientSecret.split('_secret_')[0]
        })
      );

      setPaymentSuccess(true);

      // Redirect after success
      setTimeout(() => {
        navigate('/app/patient/appointments', {
          state: { paymentCompleted: true, caseId: appointmentDetails.caseId || appointmentDetails.id }
        });
      }, 2000);

    } catch (error) {
      console.error('Payment confirmation failed:', error);
      throw error;
    }
  };

  const handleSavedCardPayment = async () => {
    if (!selectedPaymentMethod) return;

    try {
      await execute(() =>
        patientService.payConsultationFee({
          patientId: user.id,
          doctorId: appointmentDetails.doctor?.id || appointmentDetails.doctor?.userId,
          caseId: appointmentDetails.caseId || appointmentDetails.id,
          paymentType: 'CONSULTATION',
          amount: appointmentDetails.consultationFee || appointmentDetails.doctor?.consultationFee,
          paymentMethod: selectedPaymentMethod
        })
      );

      setPaymentSuccess(true);

      setTimeout(() => {
        navigate('/app/patient/appointments', {
          state: { paymentCompleted: true, caseId: appointmentDetails.caseId || appointmentDetails.id }
        });
      }, 2000);

    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Success screen
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your consultation payment has been processed. Your appointment is now confirmed.
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!appointmentDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card>
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading appointment details...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Button
          variant="outline"
          onClick={() => navigate('/app/patient/appointments')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Appointments
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Payment Section */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Pay Consultation Fee
                </h2>

                {/* Appointment Details */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Appointment Details
                  </h3>

                  <div className="space-y-3">
                    {/* Doctor */}
                    <div className="flex items-start space-x-3">
                      <User className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Doctor</p>
                        <p className="font-medium text-gray-900">
                          Dr. {appointmentDetails.doctor?.firstName} {appointmentDetails.doctor?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {appointmentDetails.doctor?.specialization}
                        </p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(appointmentDetails.appointmentDate)}
                        </p>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Time</p>
                        <p className="font-medium text-gray-900">
                          {formatTime(appointmentDetails.appointmentTime)}
                        </p>
                      </div>
                    </div>

                    {/* Case */}
                    <div className="flex items-start space-x-3">
                      <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Case</p>
                        <p className="font-medium text-gray-900">
                          {appointmentDetails.caseTitle || `Case #${appointmentDetails.caseId}`}
                        </p>
                      </div>
                    </div>

                    {/* Fee */}
                    <div className="flex items-start space-x-3">
                      <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Consultation Fee</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ${appointmentDetails.consultationFee || appointmentDetails.doctor?.consultationFee}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection */}
                {savedPaymentMethods.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Select Payment Method
                    </h3>

                    <div className="space-y-3">
                      {/* Saved Cards */}
                      {savedPaymentMethods.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => {
                            setUseNewCard(false);
                            setSelectedPaymentMethod(method.code);
                          }}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                            !useNewCard && selectedPaymentMethod === method.code
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <CreditCard className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {method.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  •••• {method.lastFour || '****'}
                                </p>
                              </div>
                            </div>
                            {method.isDefault && (
                              <Badge variant="success" size="sm">Default</Badge>
                            )}
                          </div>
                        </button>
                      ))}

                      {/* New Card Option */}
                      <button
                        onClick={() => {
                          setUseNewCard(true);
                          setSelectedPaymentMethod(null);
                        }}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          useNewCard
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            Pay with new card
                          </span>
                        </div>
                      </button>
                    </div>

                    {/* Pay with Saved Card Button */}
                    {!useNewCard && selectedPaymentMethod && (
                      <Button
                        onClick={handleSavedCardPayment}
                        className="w-full mt-4"
                        loading={loading}
                      >
                        Pay ${appointmentDetails.consultationFee || appointmentDetails.doctor?.consultationFee}
                      </Button>
                    )}
                  </div>
                )}

                {/* Stripe Payment Form */}
                {useNewCard && clientSecret && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Payment Information
                    </h3>
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <StripePaymentForm
                        amount={appointmentDetails.consultationFee || appointmentDetails.doctor?.consultationFee}
                        currency="USD"
                        onSuccess={handlePaymentSuccess}
                        buttonText={`Pay $${appointmentDetails.consultationFee || appointmentDetails.doctor?.consultationFee}`}
                        description="Consultation fee payment"
                      />
                    </Elements>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar - Payment Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Payment Summary
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Consultation Fee:</span>
                    <span className="font-medium text-gray-900">
                      ${appointmentDetails.consultationFee || appointmentDetails.doctor?.consultationFee}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Processing Fee:</span>
                    <span className="font-medium text-gray-900">
                      $0.00
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-gray-900">
                        ${appointmentDetails.consultationFee || appointmentDetails.doctor?.consultationFee}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Important Info */}
                <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Payment Required
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Your appointment will be confirmed once payment is completed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Secure Payment
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Your payment is protected with 256-bit encryption
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Refund Policy
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Cancel 24 hours before for full refund
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationPayment;