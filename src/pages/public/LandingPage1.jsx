// src/pages/public/LandingPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Heart, 
  Shield, 
  Globe, 
  Clock, 
  UserCheck, 
  PhoneCall, 
  Video, 
  MessageSquare,
  Star,
  ChevronRight,
  Play,
  CheckCircle,
  MapPin,
  Calendar,
  FileText,
  Users,
  Award,
  ChevronLeft,
  ArrowRight,
  Languages,
  Plane,
  CreditCard
} from 'lucide-react';

// Mock data for doctors
const mockDoctors = [
  {
    id: 1,
    name: "Dr. Hans Mueller",
    specialization: "Cardiology",
    experience: "15 years",
    rating: 4.9,
    languages: ["German", "English", "Spanish"],
    location: "Munich",
    image: "/api/placeholder/120/120",
    certifications: ["European Society of Cardiology", "German Cardiac Society"],
    consultationFee: "€150"
  },
  {
    id: 2,
    name: "Dr. Petra Schmidt",
    specialization: "Oncology",
    experience: "12 years",
    rating: 4.8,
    languages: ["German", "English", "Russian"],
    location: "Berlin",
    image: "/api/placeholder/120/120",
    certifications: ["German Cancer Society", "ESMO Certification"],
    consultationFee: "€200"
  },
  {
    id: 3,
    name: "Dr. Michael Weber",
    specialization: "Orthopedics",
    experience: "18 years",
    rating: 4.9,
    languages: ["German", "English", "Arabic"],
    location: "Hamburg",
    image: "/api/placeholder/120/120",
    certifications: ["AO Foundation", "German Orthopedic Society"],
    consultationFee: "€175"
  },
  {
    id: 4,
    name: "Dr. Lisa Hoffmann",
    specialization: "Neurology",
    experience: "10 years",
    rating: 4.7,
    languages: ["German", "English", "French"],
    location: "Frankfurt",
    image: "/api/placeholder/120/120",
    certifications: ["European Academy of Neurology", "DGN Certification"],
    consultationFee: "€180"
  },
  {
    id: 5,
    name: "Dr. Thomas Richter",
    specialization: "Gastroenterology",
    experience: "14 years",
    rating: 4.8,
    languages: ["German", "English", "Turkish"],
    location: "Stuttgart",
    image: "/api/placeholder/120/120",
    certifications: ["DGVS Certification", "ESGE Member"],
    consultationFee: "€165"
  },
  {
    id: 6,
    name: "Dr. Anna Bauer",
    specialization: "Dermatology",
    experience: "11 years",
    rating: 4.6,
    languages: ["German", "English", "Italian"],
    location: "Cologne",
    image: "/api/placeholder/120/120",
    certifications: ["German Dermatological Society", "AAD International"],
    consultationFee: "€140"
  }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentDoctorIndex, setCurrentDoctorIndex] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Auto-rotate doctors showcase
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDoctorIndex(prev => (prev + 1) % mockDoctors.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const DoctorModal = ({ doctor, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Doctor Profile</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Doctor Info */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-16 h-16 text-blue-600" />
              </div>
            </div>
            
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900 mb-2">{doctor.name}</h4>
              <p className="text-lg text-primary-600 font-semibold mb-3">{doctor.specialization}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-gray-600">{doctor.experience} Experience</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">{doctor.rating} Rating</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">{doctor.location}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">{doctor.consultationFee}</span>
                </div>
              </div>
              
              {/* Languages */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Languages</h5>
                <div className="flex flex-wrap gap-2">
                  {doctor.languages.map((lang, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Certifications */}
              <div className="mb-6">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Certifications</h5>
                <ul className="space-y-1">
                  {doctor.certifications.map((cert, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">{cert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              className="flex-1 bg-primary-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors"
              onClick={() => navigate('/register')}
            >
              Book Consultation
            </button>
            <button 
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              onClick={onClose}
            >
              View More Doctors
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MidiLink Germany</h1>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-600 hover:text-primary-600 font-medium">Services</a>
              <a href="#doctors" className="text-gray-600 hover:text-primary-600 font-medium">Doctors</a>
              <a href="#process" className="text-gray-600 hover:text-primary-600 font-medium">Process</a>
              <a href="#pricing" className="text-gray-600 hover:text-primary-600 font-medium">Pricing</a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-primary-600 font-medium"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  🇩🇪 German Quality Healthcare
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Expert Medical Consultations from 
                <span className="text-primary-600"> German Doctors</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Get second opinions, diagnostic reviews, and complete treatment organization 
                from verified German healthcare professionals. Access world-class medical expertise 
                from anywhere in the world.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button 
                  onClick={() => navigate('/register')}
                  className="bg-primary-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-600 transition-colors flex items-center justify-center"
                >
                  Start Consultation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                <button 
                  onClick={() => setIsVideoPlaying(true)}
                  className="border-2 border-primary-500 text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-colors flex items-center justify-center"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">500+</div>
                  <div className="text-sm text-gray-600">German Doctors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">50+</div>
                  <div className="text-sm text-gray-600">Medical Specialties</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">24/7</div>
                  <div className="text-sm text-gray-600">Support Available</div>
                </div>
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Video className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Live Consultation</h3>
                    <p className="text-sm text-gray-600">Dr. Mueller - Cardiology</p>
                  </div>
                  <div className="ml-auto">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Active</span>
                  </div>
                </div>
                
                <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Stethoscope className="w-16 h-16 text-primary-500 mx-auto mb-2" />
                    <p className="text-gray-600">Secure Video Consultation</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button className="p-2 bg-red-500 text-white rounded-lg">
                      <PhoneCall className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-gray-200 text-gray-600 rounded-lg">
                      <Video className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-gray-200 text-gray-600 rounded-lg">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">45:32</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Medical Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From online consultations to complete treatment organization in Germany
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Online Consultations */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Online Medical Consultations</h3>
              <p className="text-gray-600 mb-6">
                Connect with German doctors via secure video calls, receive expert medical opinions 
                and diagnostic reviews from the comfort of your home.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Secure video consultations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Second medical opinions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Diagnostic reviews</span>
                </li>
              </ul>
            </div>

            {/* Treatment Organization */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <Plane className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Complete Treatment Organization</h3>
              <p className="text-gray-600 mb-6">
                Need to travel to Germany for treatment? We handle everything - from visa support 
                to hospital appointments and interpretation services.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Visa support & documentation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Hospital appointments</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Interpretation & transfers</span>
                </li>
              </ul>
            </div>

            {/* Global Reach */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Worldwide Access</h3>
              <p className="text-gray-600 mb-6">
                Serving patients globally with focus on Middle East, CIS countries, and Africa. 
                Multiple language support and cultural understanding.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Multi-language support</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Cultural understanding</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Global patient support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Specializations Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Medical Specializations
            </h2>
            <p className="text-xl text-gray-600">
              Covering all major medical disciplines with German healthcare excellence
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: 'Oncology', icon: '🎗️', color: 'bg-red-100 text-red-600' },
              { name: 'Cardiology', icon: '❤️', color: 'bg-pink-100 text-pink-600' },
              { name: 'Orthopedics', icon: '🦴', color: 'bg-blue-100 text-blue-600' },
              { name: 'Neurology', icon: '🧠', color: 'bg-purple-100 text-purple-600' },
              { name: 'Gastroenterology', icon: '🫁', color: 'bg-green-100 text-green-600' },
              { name: 'Dermatology', icon: '🧴', color: 'bg-yellow-100 text-yellow-600' }
            ].map((spec, index) => (
              <div key={index} className="bg-white p-6 rounded-xl text-center hover:shadow-lg transition-shadow cursor-pointer">
                <div className={`w-16 h-16 rounded-full ${spec.color} flex items-center justify-center mx-auto mb-4 text-2xl`}>
                  {spec.icon}
                </div>
                <h3 className="font-semibold text-gray-900">{spec.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section id="doctors" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Meet Our German Medical Experts
            </h2>
            <p className="text-xl text-gray-600">
              Verified doctors with German medical licenses and international experience
            </p>
          </div>

          {/* Featured Doctor Showcase */}
          <div className="bg-gradient-to-r from-primary-500 to-green-600 rounded-2xl p-8 mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-4">Featured Specialist</h3>
                <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <Stethoscope className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">{mockDoctors[currentDoctorIndex].name}</h4>
                      <p className="text-white/80">{mockDoctors[currentDoctorIndex].specialization}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-white/60 text-sm">Experience</p>
                      <p className="font-semibold">{mockDoctors[currentDoctorIndex].experience}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Rating</p>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 font-semibold">{mockDoctors[currentDoctorIndex].rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedDoctor(mockDoctors[currentDoctorIndex])}
                    className="bg-white text-primary-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    View Profile
                  </button>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="w-64 h-64 bg-white/10 backdrop-blur rounded-full flex items-center justify-center">
                  <Stethoscope className="w-32 h-32 text-white/50" />
                </div>
              </div>
            </div>
          </div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockDoctors.slice(0, 6).map((doctor) => (
              <div key={doctor.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                      <Stethoscope className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{doctor.name}</h3>
                      <p className="text-primary-600 font-medium">{doctor.specialization}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Experience</span>
                      <span className="font-medium">{doctor.experience}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Rating</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 font-medium">{doctor.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Location</span>
                      <span className="font-medium">{doctor.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {doctor.languages.slice(0, 2).map((lang, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        {lang}
                      </span>
                    ))}
                    {doctor.languages.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{doctor.languages.length - 2} more
                      </span>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => setSelectedDoctor(doctor)}
                    className="w-full bg-primary-500 text-white py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Doctors */}
          <div className="text-center mt-12">
            <button className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              View All {mockDoctors.length} Doctors
            </button>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to access German medical expertise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Register & Upload',
                description: 'Create your account and securely upload your medical records',
                icon: <FileText className="w-8 h-8" />,
                color: 'from-blue-500 to-blue-600'
              },
              {
                step: '02',
                title: 'Doctor Assignment',
                description: 'Our system matches you with the right German specialist',
                icon: <UserCheck className="w-8 h-8" />,
                color: 'from-green-500 to-green-600'
              },
              {
                step: '03',
                title: 'Schedule Consultation',
                description: 'Book a convenient time for your video consultation',
                icon: <Calendar className="w-8 h-8" />,
                color: 'from-purple-500 to-purple-600'
              },
              {
                step: '04',
                title: 'Get Treatment Plan',
                description: 'Receive expert medical opinion and treatment recommendations',
                icon: <Heart className="w-8 h-8" />,
                color: 'from-red-500 to-red-600'
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className={`w-20 h-20 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg`}>
                  {item.icon}
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-sm font-bold text-gray-400 mb-2">STEP {item.step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Clear, upfront pricing with no hidden fees
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Basic Consultation */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Online Consultation</h3>
                <div className="text-4xl font-bold text-primary-600 mb-2">€150</div>
                <p className="text-gray-600">Per consultation</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>30-minute video consultation</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Medical record review</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Written medical report</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Treatment recommendations</span>
                </li>
              </ul>
              
              <button 
                onClick={() => navigate('/register')}
                className="w-full border-2 border-primary-500 text-primary-600 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
              >
                Book Consultation
              </button>
            </div>

            {/* Premium Package */}
            <div className="bg-gradient-to-br from-primary-500 to-green-600 text-white rounded-2xl p-8 transform scale-105 shadow-2xl">
              <div className="text-center mb-6">
                <div className="bg-white/20 backdrop-blur rounded-lg px-3 py-1 inline-block mb-4">
                  <span className="text-sm font-semibold">Most Popular</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Second Opinion Package</h3>
                <div className="text-4xl font-bold mb-2">€250</div>
                <p className="text-white/80">Comprehensive review</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>60-minute consultation</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>Detailed case analysis</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>Multiple specialist opinions</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>Follow-up consultation</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>Treatment plan options</span>
                </li>
              </ul>
              
              <button 
                onClick={() => navigate('/register')}
                className="w-full bg-white text-primary-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started
              </button>
            </div>

            {/* Treatment Organization */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Treatment Organization</h3>
                <div className="text-4xl font-bold text-primary-600 mb-2">€500</div>
                <p className="text-gray-600">Plus consultation fee</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Visa application support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Hospital appointments</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Medical interpretation</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Airport transfers</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Accommodation assistance</span>
                </li>
              </ul>
              
              <button 
                onClick={() => navigate('/register')}
                className="w-full border-2 border-primary-500 text-primary-600 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              All payments are processed securely via Stripe or PayPal
            </p>
            <div className="flex justify-center space-x-8 opacity-60">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm">GDPR Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span className="text-sm">Secure Payments</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Patients Say
            </h2>
            <p className="text-xl text-gray-600">
              Real experiences from patients worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Al-Mahmoud",
                location: "Dubai, UAE",
                rating: 5,
                comment: "The consultation with Dr. Mueller was exceptional. His expertise in cardiology helped me understand my condition better and provided peace of mind.",
                speciality: "Cardiology"
              },
              {
                name: "Ahmed Hassan",
                location: "Cairo, Egypt",
                rating: 5,
                comment: "MidiLink made it possible for me to get a second opinion from German oncologists. The entire process was smooth and professional.",
                speciality: "Oncology"
              },
              {
                name: "Maria Petrova",
                location: "Sofia, Bulgaria",
                rating: 5,
                comment: "Excellent service! They helped organize my treatment in Munich, including visa support and interpretation. Highly recommended.",
                speciality: "Treatment Organization"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.comment}"
                </p>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-primary-600 font-medium">{testimonial.speciality}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Access German Medical Expertise?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Join thousands of patients worldwide who trust MidiLink Germany 
            for their medical consultations and treatment organization.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/register')}
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Start Your Consultation
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">MidiLink Germany</h3>
              </div>
              <p className="text-gray-400 mb-6">
                Connecting patients worldwide with German medical excellence. 
                Your bridge to world-class healthcare.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-sm">f</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-sm">t</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-sm">in</span>
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Services</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Online Consultations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Second Opinions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Treatment Organization</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Diagnostic Reviews</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Contact</h4>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4" />
                  <span>Berlin, Germany</span>
                </div>
                <div className="flex items-center space-x-3">
                  <PhoneCall className="w-4 h-4" />
                  <span>+49 (0) 30 12345678</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-4 h-4" />
                  <span>contact@MidiLink.de</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400">
                © 2025 MidiLink Germany. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">German Law & EU GDPR</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Languages className="w-4 h-4" />
                  <span className="text-sm">Multi-language Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Doctor Profile Modal */}
      {selectedDoctor && (
        <DoctorModal 
          doctor={selectedDoctor} 
          onClose={() => setSelectedDoctor(null)} 
        />
      )}
    </div>
  );
};

export default LandingPage;