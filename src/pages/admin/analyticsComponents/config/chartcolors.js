/**
 * Chart color configuration for Case Analytics
 * Provides consistent color schemes across all charts
 */

export const CHART_COLORS = {
  // Primary color palette
  primary: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'],
  
  // Success colors
  success: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'],
  
  // Warning colors
  warning: ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7'],
  
  // Danger colors
  danger: ['#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2'],
  
  // Purple colors
  purple: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'],
  
  // Teal colors
  teal: ['#14B8A6', '#2DD4BF', '#5EEAD4', '#99F6E4', '#CCFBF1'],
  
  // Status-specific colors (matches backend CaseStatus enum)
  status: {
    SUBMITTED: '#3B82F6',          // Blue
    PENDING: '#F59E0B',            // Orange
    ASSIGNED: '#8B5CF6',           // Purple
    ACCEPTED: '#10B981',           // Green
    SCHEDULED: '#06B6D4',          // Cyan
    IN_PROGRESS: '#6366F1',        // Indigo
    CONSULTATION_COMPLETE: '#10B981', // Green
    COMPLETE: '#10B981',           // Green
    CLOSED: '#6B7280',             // Gray
    REJECTED: '#EF4444'            // Red
  },
  
  // Urgency-specific colors (matches backend UrgencyLevel enum)
  urgency: {
    CRITICAL: '#EF4444',           // Red
    HIGH: '#F59E0B',               // Orange
    MEDIUM: '#FBBF24',             // Yellow
    LOW: '#10B981'                 // Green
  },
  
  // Performance level colors
  performance: {
    EXCELLENT: '#10B981',          // Green
    GOOD: '#3B82F6',               // Blue
    AVERAGE: '#F59E0B',            // Orange
    NEEDS_IMPROVEMENT: '#EF4444'   // Red
  },
  
  // Utilization colors
  utilization: {
    UNDERUTILIZED: '#EF4444',      // Red (bad - under-utilized)
    OPTIMAL: '#10B981',            // Green (good - optimal load)
    OVERUTILIZED: '#F59E0B'        // Orange (warning - over-utilized)
  },
  
  // Trend direction colors
  trend: {
    UP: '#10B981',                 // Green (positive growth)
    DOWN: '#EF4444',               // Red (negative growth)
    STABLE: '#6B7280'              // Gray (no change)
  },
  
  // SLA compliance colors
  sla: {
    EXCELLENT: '#10B981',          // >= 90%
    GOOD: '#3B82F6',               // >= 75%
    FAIR: '#F59E0B',               // >= 60%
    POOR: '#EF4444'                // < 60%
  },
  
  // Quality score colors
  quality: {
    HIGH: '#10B981',               // >= 80
    MEDIUM: '#F59E0B',             // >= 60
    LOW: '#EF4444'                 // < 60
  },
  
  // Gradient definitions for area charts
  gradients: {
    blue: ['#3B82F6', '#BFDBFE'],
    green: ['#10B981', '#A7F3D0'],
    purple: ['#8B5CF6', '#DDD6FE'],
    orange: ['#F59E0B', '#FDE68A']
  }
};

/**
 * Get color based on performance score
 * @param {number} score - Score value (0-100)
 * @returns {string} Hex color code
 */
export const getPerformanceColor = (score) => {
  if (score >= 90) return CHART_COLORS.performance.EXCELLENT;
  if (score >= 75) return CHART_COLORS.performance.GOOD;
  if (score >= 60) return CHART_COLORS.performance.AVERAGE;
  return CHART_COLORS.performance.NEEDS_IMPROVEMENT;
};

/**
 * Get color based on SLA compliance
 * @param {number} compliance - Compliance percentage (0-100)
 * @returns {string} Hex color code
 */
export const getSlaColor = (compliance) => {
  if (compliance >= 90) return CHART_COLORS.sla.EXCELLENT;
  if (compliance >= 75) return CHART_COLORS.sla.GOOD;
  if (compliance >= 60) return CHART_COLORS.sla.FAIR;
  return CHART_COLORS.sla.POOR;
};

/**
 * Get color based on quality score
 * @param {number} quality - Quality score (0-100)
 * @returns {string} Hex color code
 */
export const getQualityColor = (quality) => {
  if (quality >= 80) return CHART_COLORS.quality.HIGH;
  if (quality >= 60) return CHART_COLORS.quality.MEDIUM;
  return CHART_COLORS.quality.LOW;
};

/**
 * Get color for trend direction
 * @param {string} direction - 'UP', 'DOWN', or 'STABLE'
 * @returns {string} Hex color code
 */
export const getTrendColor = (direction) => {
  return CHART_COLORS.trend[direction] || CHART_COLORS.trend.STABLE;
};

/**
 * Get color from palette by index (with wrapping)
 * @param {Array} palette - Color palette array
 * @param {number} index - Index to get color for
 * @returns {string} Hex color code
 */
export const getColorByIndex = (palette, index) => {
  return palette[index % palette.length];
};

export default CHART_COLORS;