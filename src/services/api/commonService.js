import { api } from './apiClient';

const commonService = {
  // ====== MEDICAL configuration ======

  // Get all medical configuration by type (generic endpoint)
  getMedicalConfigurations: async (configType) => {
    return await api.get(`/config-service/api/configuration/${configType}`);
  },

  // Get configuration with filters
  getMedicalConfigurationsWithFilters: async (configType, filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/config-service/api/configuration/${configType}?${params}`);
  },

  // ====== DISEASES ======

  // Get all active diseases
  getAllDiseases: async () => {
    return await api.get('/config-service/api/configuration/diseases');
  },

  // Get diseases by category
  getDiseasesByCategory: async (category) => {
    return await api.get(`/config-service/api/configuration/diseases/${category}/active`);
  },

  // Get disease by ICD code
  getDiseaseByCode: async (icdCode) => {
    return await api.get(`/config-service/api/configuration/diseases/code/${icdCode}`);
  },

  // Search diseases
  searchDiseases: async (query) => {
    return await api.get(`/config-service/api/configuration/diseases/search?q=${encodeURIComponent(query)}`);
  },

  // Get specializations for a disease
  getSpecializationsForDisease: async (diseaseCode) => {
    return await api.get(`/config-service/api/configuration/diseases/${diseaseCode}/specializations`);
  },

  // ====== SYMPTOMS ======

  // Get all active symptoms
  getAllSymptoms: async () => {
    return await api.get('/config-service/api/configuration/symptoms');
  },

  // Get symptoms by body system
  getSymptomsByBodySystem: async (bodySystem) => {
    return await api.get(`/config-service/api/configuration/symptoms/system/${bodySystem}`);
  },

  // Search symptoms
  searchSymptoms: async (query) => {
    return await api.get(`/config-service/api/configuration/symptoms/search?q=${encodeURIComponent(query)}`);
  },

  // Get related diseases for symptoms
  getRelatedDiseasesForSymptoms: async (symptomCodes) => {
    const params = symptomCodes.map(code => `symptoms=${code}`).join('&');
    return await api.get(`/config-service/api/configuration/symptoms/related-diseases?${params}`);
  },

  // Get symptoms by disease
  getSymptomsByDisease: async (diseaseCode) => {
    return await api.get(`/config-service/api/configuration/diseases/${diseaseCode}/symptoms`);
  },

  // ====== MEDICATIONS ======

  // Get all active medications
  getAllMedications: async () => {
    return await api.get('/config-service/api/configuration/medications');
  },

  // Get medications by category
  getMedicationsByCategory: async (category) => {
    return await api.get(`/config-service/api/configuration/medications/category/${category}`);
  },

  // Get medication by ATC code
  getMedicationByCode: async (atcCode) => {
    return await api.get(`/config-service/api/configuration/medications/code/${atcCode}`);
  },

  // Search medications
  searchMedications: async (query) => {
    return await api.get(`/config-service/api/configuration/medications/search?q=${encodeURIComponent(query)}`);
  },

  // Get medication interactions
  getMedicationInteractions: async (medicationCodes) => {
    const params = medicationCodes.map(code => `medications=${code}`).join('&');
    return await api.get(`/config-service/api/configuration/medications/interactions?${params}`);
  },

  // Get medications for disease
  getMedicationsForDisease: async (diseaseCode) => {
    return await api.get(`/config-service/api/configuration/diseases/${diseaseCode}/medications`);
  },

  // ====== SPECIALIZATIONS ======

  // Get all specializations
  getAllSpecializations: async () => {
    return await api.get('/config-service/api/configuration/specializations');
  },

  // Get subspecializations for a specialization
  getSubspecializations: async (specializationCode) => {
    return await api.get(`/config-service/api/configuration/specializations/${specializationCode}/subspecializations`);
  },

  // Get specializations by level (primary/secondary)
  getSpecializationsByLevel: async (level) => {
    return await api.get(`/config-service/api/configuration/specializations/level/${level}`);
  },

  // Search specializations
  searchSpecializations: async (query) => {
    return await api.get(`/config-service/api/configuration/specializations/search?q=${encodeURIComponent(query)}`);
  },

  // ====== CASE TYPES ======

  // Get all case types
  getAllCaseTypes: async () => {
    return await api.get('/config-service/api/configuration/case-types');
  },

  // ====== COUNTRIES AND REGIONS ======

  // Get all countries
  getAllCountries: async () => {
    return await api.get('/config-service/api/configuration/countries');
  },

  // Get states/provinces by country
  getStatesByCountry: async (countryCode) => {
    return await api.get(`/config-service/api/configuration/countries/${countryCode}/states`);
  },

  // ====== LANGUAGES ======

  // Get all supported languages
  getAllLanguages: async () => {
    return await api.get('/config-service/api/configuration/languages');
  },

  // ====== URGENCY LEVELS ======

  // Get all urgency levels
  getUrgencyLevels: async () => {
    return await api.get('/config-service/api/configuration/urgency-levels');
  },

  // ====== COMPLEXITY LEVELS ======

  // Get all complexity levels
  getComplexityLevels: async () => {
    return await api.get('/config-service/api/configuration/complexity-levels');
  },

  // ====== SEARCH AND SUGGESTIONS ======

  // Universal search across all medical configuration
  globalSearch: async (query, types = []) => {
    const params = new URLSearchParams({ q: query });
    if (types.length > 0) {
      types.forEach(type => params.append('types', type));
    }
    return await api.get(`/config-service/api/configuration/search?${params}`);
  },

  // Get suggestions based on input
  getSuggestions: async (configType, query, limit = 10) => {
    return await api.get(`/config-service/api/configuration/${configType}/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  // Get autocomplete suggestions
  getAutocomplete: async (configType, query, limit = 5) => {
    return await api.get(`/config-service/api/configuration/${configType}/autocomplete?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  // ====== VALIDATION AND VERIFICATION ======

  // Validate medical codes
  validateMedicalCode: async (configType, code) => {
    return await api.get(`/config-service/api/configuration/${configType}/validate/${code}`);
  },

  // Verify multiple codes at once
  validateMultipleCodes: async (configType, codes) => {
    return await api.post(`/config-service/api/configuration/${configType}/validate`, { codes });
  },

  // Check if code exists
  checkCodeExists: async (configType, code) => {
    return await api.get(`/config-service/api/configuration/${configType}/exists/${code}`);
  },

  // ====== HIERARCHICAL DATA ======

  // Get parent configuration
  getParentConfigurations: async (configType, parentCode) => {
    return await api.get(`/config-service/api/configuration/${configType}/parent/${parentCode}`);
  },

  // Get child configuration
  getChildConfigurations: async (configType, parentCode) => {
    return await api.get(`/config-service/api/configuration/${configType}/children/${parentCode}`);
  },

  // Get configuration hierarchy
  getConfigurationHierarchy: async (configType) => {
    return await api.get(`/config-service/api/configuration/${configType}/hierarchy`);
  },

  // ====== RELATIONSHIPS ======

  // Get related configuration
  getRelatedConfigurations: async (configType, code, relationType) => {
    return await api.get(`/config-service/api/configuration/${configType}/${code}/related/${relationType}`);
  },

  // Get disease-symptom relationships
  getDiseaseSymptomRelationships: async (diseaseCode) => {
    return await api.get(`/config-service/api/configuration/relationships/disease-symptoms/${diseaseCode}`);
  },

  // Get disease-specialization relationships
  getDiseaseSpecializationRelationships: async (diseaseCode) => {
    return await api.get(`/config-service/api/configuration/relationships/disease-specializations/${diseaseCode}`);
  },

  // ====== COMPATIBILITY AND MATCHING ======

  // Find compatible specializations for symptoms
  findCompatibleSpecializations: async (symptomCodes) => {
    const params = symptomCodes.map(code => `symptoms=${code}`).join('&');
    return await api.get(`/config-service/api/configuration/match/specializations?${params}`);
  },

  // Get recommended specializations for a case
  getRecommendedSpecializations: async (caseData) => {
    return await api.post('/config-service/api/configuration/match/recommend-specializations', caseData);
  },

  // Find doctors by medical criteria
  findDoctorsByMedicalCriteria: async (criteria) => {
    return await api.post('/config-service/api/configuration/match/doctors', criteria);
  },

  // ====== BULK OPERATIONS ======

  // Get multiple configuration by type and codes
  getMultipleConfigurations: async (requests) => {
    return await api.post('/config-service/api/configuration/bulk/get', { requests });
  },

  // Batch validate configuration
  batchValidateConfigurations: async (validations) => {
    return await api.post('/config-service/api/configuration/bulk/validate', { validations });
  },

  // ====== CACHING AND METADATA ======

  // Get configuration metadata
  getConfigurationMetadata: async (configType) => {
    return await api.get(`/config-service/api/configuration/${configType}/metadata`);
  },

  // Get last updated timestamp
  getLastUpdated: async (configType) => {
    return await api.get(`/config-service/api/configuration/${configType}/last-updated`);
  },

  // Refresh configuration cache
  refreshCache: async (configType) => {
    return await api.post(`/config-service/api/configuration/${configType}/refresh-cache`);
  },

  // Get configuration statistics
  getConfigurationStats: async () => {
    return await api.get('/config-service/api/configuration/stats');
  },

  // ====== ADMINISTRATION (for admins) ======

  // Create new configuration
  createConfiguration: async (configType, configData) => {
    return await api.post(`/config-service/api/configuration/${configType}`, configData);
  },

  // Update configuration
  updateConfiguration: async (configType, configId, configData) => {
    return await api.put(`/config-service/api/configuration/${configType}/${configId}`, configData);
  },

  // Delete configuration
  deleteConfiguration: async (configType, configId) => {
    return await api.delete(`/config-service/api/configuration/${configType}/${configId}`);
  },

  // Toggle configuration active status
  toggleConfigurationStatus: async (configType, configId) => {
    return await api.post(`/config-service/api/configuration/${configType}/${configId}/toggle-status`);
  },

  // Bulk update configuration
  bulkUpdateConfigurations: async (configType, updates) => {
    return await api.post(`/config-service/api/configuration/${configType}/bulk-update`, { updates });
  },

  // Import configuration from file
  importConfigurations: async (configType, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await api.upload(`/config-service/api/configuration/${configType}/import`, formData);
  },

  // Export configuration
  exportConfigurations: async (configType, format = 'json', filters = {}) => {
    const params = new URLSearchParams({ format, ...filters });
    return await api.download(`/config-service/api/configuration/${configType}/export?${params}`, `${configType}_export.${format}`);
  },

  // ====== FALLBACK METHODS FOR BACKWARD COMPATIBILITY ======

  // Fallback to admin service endpoints if common service is not available
  _fallbackGetDiseases: async () => {
    return await api.get('/admin-service/api/admin/config/diseases');
  },

  _fallbackGetMedications: async () => {
    return await api.get('/admin-service/api/admin/config/medications');
  },

  _fallbackGetSymptoms: async () => {
    return await api.get('/admin-service/api/admin/config/symptoms');
  },

  _fallbackGetSpecializations: async () => {
    return await api.get('/admin-service/api/admin/config/specializations');
  },

  // Wrapper methods with fallback logic
  getDiseases: async () => {
    try {
      return await commonService.getAllDiseases();
    } catch (error) {
      console.warn('Common service unavailable, falling back to admin service for diseases');
      return await commonService._fallbackGetDiseases();
    }
  },

  getMedications: async () => {
    try {
      return await commonService.getAllMedications();
    } catch (error) {
      console.warn('Common service unavailable, falling back to admin service for medications');
      return await commonService._fallbackGetMedications();
    }
  },

  getSymptoms: async () => {
    try {
      return await commonService.getAllSymptoms();
    } catch (error) {
      console.warn('Common service unavailable, falling back to admin service for symptoms');
      return await commonService._fallbackGetSymptoms();
    }
  },

  getSpecializations: async () => {
    try {
      return await commonService.getAllSpecializations();
    } catch (error) {
      console.warn('Common service unavailable, falling back to admin service for specializations');
      return await commonService._fallbackGetSpecializations();
    }
  }
};

export default commonService;