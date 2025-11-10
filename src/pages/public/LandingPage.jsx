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
  CreditCard,
  Filter,
  Search,
  Grid3X3,
  List,
  TrendingUp,
  BookOpen,
  GraduationCap,
  Building
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
    consultationFee: "€150",
    availability: "Available Today",
    patientsHelped: 1200,
    university: "Ludwig Maximilian University",
    hospital: "Munich Heart Center"
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
    consultationFee: "€200",
    availability: "Available Tomorrow",
    patientsHelped: 950,
    university: "Charité Medical University",
    hospital: "Berlin Cancer Institute"
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
    consultationFee: "€175",
    availability: "Available Today",
    patientsHelped: 1500,
    university: "University of Hamburg",
    hospital: "Hamburg Orthopedic Clinic"
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
    consultationFee: "€180",
    availability: "Available in 2 days",
    patientsHelped: 800,
    university: "Goethe University Frankfurt",
    hospital: "Frankfurt Neurological Center"
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
    consultationFee: "€165",
    availability: "Available Today",
    patientsHelped: 1100,
    university: "University of Stuttgart",
    hospital: "Stuttgart Digestive Care Center"
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
    consultationFee: "€140",
    availability: "Available Tomorrow",
    patientsHelped: 900,
    university: "University of Cologne",
    hospital: "Cologne Skin Institute"
  },
  {
    id: 7,
    name: "Dr. Klaus Wagner",
    specialization: "Psychiatry",
    experience: "16 years",
    rating: 4.7,
    languages: ["German", "English", "Russian"],
    location: "Dresden",
    image: "/api/placeholder/120/120",
    certifications: ["German Psychiatric Society", "European Psychiatric Association"],
    consultationFee: "€160",
    availability: "Available Today",
    patientsHelped: 1300,
    university: "Technical University Dresden",
    hospital: "Dresden Mental Health Center"
  },
  {
    id: 8,
    name: "Dr. Maria Schneider",
    specialization: "Gynecology",
    experience: "13 years",
    rating: 4.8,
    languages: ["German", "English", "Polish"],
    location: "Düsseldorf",
    image: "/api/placeholder/120/120",
    certifications: ["German Society of Gynecology", "FIGO Certification"],
    consultationFee: "€155",
    availability: "Available Tomorrow",
    patientsHelped: 1050,
    university: "Heinrich Heine University",
    hospital: "Düsseldorf Women's Health Center"
  }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentDoctorIndex, setCurrentDoctorIndex] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [doctorViewMode, setDoctorViewMode] = useState('featured'); // 'featured', 'grid', 'list'
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 6;

  // Filter doctors based on search and specialty
  const filteredDoctors = mockDoctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || doctor.specialization === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);
  const startIndex = (currentPage - 1) * doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(startIndex, startIndex + doctorsPerPage);

  // Get unique specialties
  const specialties = ['All', ...new Set(mockDoctors.map(doctor => doctor.specialization))];

  // Auto-rotate featured doctors
  useEffect(() => {
    if (doctorViewMode === 'featured') {
      const interval = setInterval(() => {
        setCurrentDoctorIndex(prev => (prev + 1) % mockDoctors.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [doctorViewMode]);

  const DoctorModal = ({ doctor, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-90vh overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-gray-900">Doctor Profile</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Doctor Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Photo and Basic Info */}
            <div className="lg:col-span-1">
              <div className="text-center">
                <div className="w-48 h-48 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Stethoscope className="w-24 h-24 text-green-600" />
                </div>
                
                <h4 className="text-2xl font-bold text-gray-900 mb-2">{doctor.name}</h4>
                <p className="text-xl text-primary-600 font-semibold mb-4">{doctor.specialization}</p>
                
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.floor(doctor.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-lg font-bold text-gray-900">{doctor.rating}/5.0</p>
                  <p className="text-sm text-gray-600">Based on {doctor.patientsHelped}+ consultations</p>
                </div>
              </div>
            </div>

            {/* Middle Column - Professional Details */}
            <div className="lg:col-span-1">
              <h5 className="text-lg font-bold text-gray-900 mb-4">Professional Details</h5>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-gray-900">Experience</p>
                    <p className="text-gray-600">{doctor.experience}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Location</p>
                    <p className="text-gray-600">{doctor.location}, Germany</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Education</p>
                    <p className="text-gray-600">{doctor.university}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Hospital</p>
                    <p className="text-gray-600">{doctor.hospital}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Patients Helped</p>
                    <p className="text-gray-600">{doctor.patientsHelped.toLocaleString()}+</p>
                  </div>
                </div>
              </div>
              
              {/* Languages */}
              <div className="mb-6">
                <h6 className="font-medium text-gray-900 mb-3">Languages Spoken</h6>
                <div className="flex flex-wrap gap-2">
                  {doctor.languages.map((lang, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Certifications and Booking */}
            <div className="lg:col-span-1">
              <h5 className="text-lg font-bold text-gray-900 mb-4">Certifications & Booking</h5>
              
              {/* Certifications */}
              <div className="mb-6">
                <h6 className="font-medium text-gray-900 mb-3">Professional Certifications</h6>
                <ul className="space-y-2">
                  {doctor.certifications.map((cert, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{cert}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Booking Info */}
              <div className="bg-green-50 rounded-xl p-6">
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold text-green-600 mb-1">{doctor.consultationFee}</p>
                  <p className="text-sm text-gray-600">Per consultation</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900 mb-1">Availability</p>
                  <p className="text-sm text-green-600 font-semibold">{doctor.availability}</p>
                </div>
                
                <button 
                  className="w-full bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors mb-3"
                  onClick={() => navigate('/register')}
                >
                  Book Consultation Now
                </button>
                
                <button 
                  className="w-full bg-white border-2 border-primary-500 text-primary-600 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors"
                  onClick={onClose}
                >
                  View More Doctors
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header - Same as original */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MediLink24 Germany</h1>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-600 hover:text-primary-600 font-medium">Services</a>
              <a href="#doctors" className="text-gray-600 hover:text-primary-600 font-medium">Doctors</a>
              <a href="#process" className="text-gray-600 hover:text-primary-600 font-medium">Process</a>
              <a href="#pricing" className="text-gray-600 hover:text-primary-600 font-medium">Pricing</a>
            </div>

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

      {/* Hero Section - Same as original */}
      <section className="relative bg-gradient-to-br from-primary-50 to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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

      {/* NEW: Advanced Doctors Section */}
      <section id="doctors" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our German Medical Experts
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Connect with verified German doctors across all major medical specializations
            </p>

            {/* View Mode Toggle */}
            <div className="flex items-center justify-center space-x-2 mb-8">
              <button
                onClick={() => setDoctorViewMode('featured')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  doctorViewMode === 'featured' 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Featured
              </button>
              <button
                onClick={() => setDoctorViewMode('grid')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  doctorViewMode === 'grid' 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                <span>Grid View</span>
              </button>
              <button
                onClick={() => setDoctorViewMode('list')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  doctorViewMode === 'list' 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <List className="w-4 h-4" />
                <span>List View</span>
              </button>
            </div>
          </div>

          {/* Featured Doctor View */}
          {doctorViewMode === 'featured' && (
            <div className="mb-16">
              {/* Main Featured Doctor */}
              <div className="bg-gradient-to-r from-primary-500 via-green-500 to-blue-500 rounded-3xl p-8 mb-12">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="text-white">
                      <div className="flex items-center space-x-2 mb-4">
                        <Star className="w-5 h-5 text-yellow-300 fill-current" />
                        <span className="text-sm font-medium text-white/90">Featured Specialist</span>
                      </div>
                      
                      <h3 className="text-3xl font-bold mb-2">{mockDoctors[currentDoctorIndex].name}</h3>
                      <p className="text-xl text-white/90 mb-4">{mockDoctors[currentDoctorIndex].specialization} Specialist</p>
                      
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                          <p className="text-white/60 text-sm mb-1">Experience</p>
                          <p className="text-lg font-semibold">{mockDoctors[currentDoctorIndex].experience}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm mb-1">Rating</p>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-300 fill-current" />
                            <span className="text-lg font-semibold">{mockDoctors[currentDoctorIndex].rating}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm mb-1">Location</p>
                          <p className="text-lg font-semibold">{mockDoctors[currentDoctorIndex].location}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm mb-1">Fee</p>
                          <p className="text-lg font-semibold">{mockDoctors[currentDoctorIndex].consultationFee}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                          onClick={() => setSelectedDoctor(mockDoctors[currentDoctorIndex])}
                          className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                          View Full Profile
                        </button>
                        <button 
                          onClick={() => navigate('/register')}
                          className="bg-white/20 backdrop-blur text-white border border-white/30 px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors"
                        >
                          Book Consultation
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="w-80 h-80 bg-white/10 backdrop-blur rounded-full flex items-center justify-center">
                          <div className="w-64 h-64 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                            <Stethoscope className="w-32 h-32 text-white/70" />
                          </div>
                        </div>
                        {/* Floating info cards */}
                        <div className="absolute -top-4 -right-4 bg-white rounded-lg p-3 shadow-lg">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-900">98% Success Rate</span>
                          </div>
                        </div>
                        <div className="absolute -bottom-4 -left-4 bg-white rounded-lg p-3 shadow-lg">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-900">{mockDoctors[currentDoctorIndex].patientsHelped}+ Patients</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Access Doctor Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mockDoctors.slice(0, 3).map((doctor, index) => (
                  <div key={doctor.id} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
                       onClick={() => setSelectedDoctor(doctor)}>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                        <Stethoscope className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{doctor.name}</h4>
                        <p className="text-primary-600 font-medium text-sm">{doctor.specialization}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{doctor.rating}</span>
                        </div>
                        <p className="text-xs text-gray-600">{doctor.availability}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">{doctor.consultationFee}</span>
                      <button className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grid and List Views */}
          {(doctorViewMode === 'grid' || doctorViewMode === 'list') && (
            <div>
              {/* Search and Filter Bar */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search doctors, specialties, locations..."
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {/* Specialty Filter */}
                  <div className="relative">
                    <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <select
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                    >
                      {specialties.map((specialty) => (
                        <option key={specialty} value={specialty}>
                          {specialty === 'All' ? 'All Specialties' : specialty}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Results Count */}
                  <div className="flex items-center justify-center md:justify-start">
                    <span className="text-gray-600">
                      Found {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid View */}
              {doctorViewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                  {currentDoctors.map((doctor) => (
                    <div key={doctor.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow group">
                      {/* Header with availability status */}
                      <div className="bg-gradient-to-r from-primary-500 to-green-400 p-4">
                        <div className="flex items-center justify-between text-white">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">{doctor.availability}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-300 fill-current" />
                            <span className="text-sm font-medium">{doctor.rating}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        {/* Doctor Info */}
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                            <Stethoscope className="w-8 h-8 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg">{doctor.name}</h3>
                            <p className="text-primary-600 font-medium">{doctor.specialization}</p>
                            <p className="text-gray-500 text-sm">{doctor.location}, Germany</p>
                          </div>
                        </div>
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-gray-600 mb-1">Experience</p>
                            <p className="font-semibold text-gray-900">{doctor.experience}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-gray-600 mb-1">Patients</p>
                            <p className="font-semibold text-gray-900">{doctor.patientsHelped.toLocaleString()}+</p>
                          </div>
                        </div>
                        
                        {/* Languages */}
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {doctor.languages.slice(0, 2).map((lang, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                {lang}
                              </span>
                            ))}
                            {doctor.languages.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                +{doctor.languages.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Price and Action */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-bold text-gray-900">{doctor.consultationFee}</span>
                            <span className="text-gray-600 text-sm ml-1">per session</span>
                          </div>
                          <button 
                            onClick={() => setSelectedDoctor(doctor)}
                            className="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* List View */}
              {doctorViewMode === 'list' && (
                <div className="space-y-6 mb-8">
                  {currentDoctors.map((doctor) => (
                    <div key={doctor.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                        {/* Doctor Basic Info */}
                        <div className="lg:col-span-1">
                          <div className="flex items-center space-x-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                              <Stethoscope className="w-10 h-10 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg">{doctor.name}</h3>
                              <p className="text-primary-600 font-medium">{doctor.specialization}</p>
                              <p className="text-gray-500 text-sm">{doctor.location}, Germany</p>
                              <div className="flex items-center space-x-1 mt-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm font-medium">{doctor.rating}</span>
                                <span className="text-gray-500 text-xs">({doctor.patientsHelped}+ patients)</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Professional Details */}
                        <div className="lg:col-span-1">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <Award className="w-4 h-4 text-yellow-600" />
                              <span className="text-gray-600">Experience: <span className="font-medium text-gray-900">{doctor.experience}</span></span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <GraduationCap className="w-4 h-4 text-blue-600" />
                              <span className="text-gray-600 truncate">{doctor.university}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Building className="w-4 h-4 text-green-600" />
                              <span className="text-gray-600 truncate">{doctor.hospital}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Languages & Availability */}
                        <div className="lg:col-span-1">
                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-2">Languages:</p>
                            <div className="flex flex-wrap gap-1">
                              {doctor.languages.map((lang, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                  {lang}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Clock className="w-4 h-4 text-green-600" />
                            <span className="text-green-600 font-medium">{doctor.availability}</span>
                          </div>
                        </div>
                        
                        {/* Price and Action */}
                        <div className="lg:col-span-1 text-center lg:text-right">
                          <div className="mb-4">
                            <span className="text-3xl font-bold text-gray-900">{doctor.consultationFee}</span>
                            <p className="text-gray-600 text-sm">per consultation</p>
                          </div>
                          <div className="space-y-2">
                            <button 
                              onClick={() => setSelectedDoctor(doctor)}
                              className="w-full lg:w-auto bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
                            >
                              View Full Profile
                            </button>
                            <button 
                              onClick={() => navigate('/register')}
                              className="w-full lg:w-auto bg-white border-2 border-primary-500 text-primary-600 px-6 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors"
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        currentPage === index + 1
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Rest of the sections remain the same - Services, Specializations, Process, Pricing, Testimonials, CTA, Footer */}
      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Medical Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From online consultations to complete treatment organization in Germany
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
      <section className="py-20 bg-white">
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
              <div key={index} className="bg-white p-6 rounded-xl text-center hover:shadow-lg transition-shadow cursor-pointer border border-gray-100">
                <div className={`w-16 h-16 rounded-full ${spec.color} flex items-center justify-center mx-auto mb-4 text-2xl`}>
                  {spec.icon}
                </div>
                <h3 className="font-semibold text-gray-900">{spec.name}</h3>
              </div>
            ))}
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
                comment: "MediLink24 made it possible for me to get a second opinion from German oncologists. The entire process was smooth and professional.",
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
            Ready to Connect with German Medical Experts?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Choose your preferred way to explore our network of verified German doctors
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/register')}
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Start Your Consultation
            </button>
            <button 
              onClick={() => setDoctorViewMode('grid')}
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              Browse All Doctors
            </button>
          </div>
        </div>
      </section>

      {/* Footer - Same as original */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">MediLink24 Germany</h3>
              </div>
              <p className="text-gray-400 mb-6">
                Connecting patients worldwide with German medical excellence. 
                Your bridge to world-class healthcare.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">Services</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Online Consultations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Second Opinions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Treatment Organization</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Diagnostic Reviews</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>

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
                  <span>contact@MediLink24.de</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400">
                © 2024 MediLink24 Germany. All rights reserved.
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