# Payment Analytics API Specification

## Overview
This document specifies the backend API endpoint needed for the Payment Analytics feature.

## API Endpoint

### Get Payment Analytics
**Endpoint:** `GET /admin-service/api/admin/payments/analytics`

**Query Parameters:**
- `startDate` (optional): ISO 8601 date string - Start of the analytics period
- `endDate` (optional): ISO 8601 date string - End of the analytics period

**Authentication:** Required (Admin role)

**Response Format:** JSON

---

## Response Data Structure

The endpoint should return a JSON object with the following structure:

```json
{
  "totalPaymentsAnalyzed": 1250,

  "overview": {
    // KPI Metrics
    "totalRevenue": 125000.50,
    "totalPayments": 1250,
    "completedPayments": 1150,
    "failedPayments": 75,
    "pendingPayments": 25,
    "totalRefunds": 45,
    "successRate": 92.0,

    // Trends (optional - for showing growth indicators)
    "revenueTrend": {
      "isPositive": true,
      "value": 15.5,
      "period": "vs last month"
    },
    "paymentTrend": {
      "isPositive": true,
      "value": 12.3,
      "period": "vs last month"
    },

    // Financial Metrics
    "avgTransactionValue": 100.00,
    "totalRefundedAmount": 4500.00,
    "refundRate": 3.6,
    "monthlyGrowth": 15.5,

    "avgTransactionTrend": {
      "isPositive": true,
      "value": 8.2,
      "period": "vs last month"
    },

    // Distribution Data for Charts
    "statusDistribution": {
      "completed": 1150,
      "pending": 25,
      "failed": 75,
      "refunded": 45,
      "cancelled": 10
    },

    "typeDistribution": {
      "subscription": 800,
      "consultation": 450
    }
  },

  "revenue": {
    // Revenue Trend Over Time (for Area Chart)
    "revenueTrend": [
      {
        "date": "2025-01-01",
        "revenue": 5000.00
      },
      {
        "date": "2025-01-02",
        "revenue": 5500.00
      }
      // ... more daily data points
    ],

    // Revenue by Payment Type (for Bar Chart)
    "revenueByType": [
      {
        "type": "subscription",
        "revenue": 80000.00
      },
      {
        "type": "consultation",
        "revenue": 45000.00
      }
    ],

    // Monthly Comparison (for Line Chart)
    "monthlyComparison": [
      {
        "month": "Jan",
        "currentYear": 125000.00,
        "previousYear": 100000.00
      },
      {
        "month": "Feb",
        "currentYear": 135000.00,
        "previousYear": 110000.00
      }
      // ... more months
    ],

    // Key Metrics
    "highestRevenueDay": {
      "date": "2025-01-15",
      "amount": 8500.00
    },
    "avgDailyRevenue": 4166.67,
    "growthRate": 15.5,
    "revenuePerTransaction": 100.00
  },

  "transactions": {
    // Transaction Volume Trend (for Multi-Line Chart)
    "volumeTrend": [
      {
        "date": "2025-01-01",
        "successful": 45,
        "failed": 3,
        "pending": 2
      },
      {
        "date": "2025-01-02",
        "successful": 50,
        "failed": 2,
        "pending": 1
      }
      // ... more daily data
    ],

    // Transaction Stats
    "totalTransactions": 1250,
    "successfulTransactions": 1150,
    "failedTransactions": 75,
    "successRate": 92.0,
    "failureRate": 6.0,
    "avgProcessingTime": 2.5,

    // Hourly Distribution (for Bar Chart)
    "hourlyDistribution": [
      {
        "hour": "00:00",
        "count": 10
      },
      {
        "hour": "01:00",
        "count": 8
      }
      // ... 24 hours
    ]
  },

  "paymentMethods": {
    // Method Distribution (for Pie Chart)
    "methodDistribution": [
      {
        "name": "Credit Card",
        "count": 800
      },
      {
        "name": "Debit Card",
        "count": 300
      },
      {
        "name": "PayPal",
        "count": 100
      },
      {
        "name": "Stripe",
        "count": 50
      }
    ],

    // Revenue by Method (for Bar Chart)
    "revenueByMethod": [
      {
        "method": "Credit Card",
        "revenue": 80000.00
      },
      {
        "method": "Debit Card",
        "revenue": 30000.00
      },
      {
        "method": "PayPal",
        "revenue": 10000.00
      },
      {
        "method": "Stripe",
        "revenue": 5000.00
      }
    ],

    // Method Performance Cards
    "methodPerformance": [
      {
        "name": "Credit Card",
        "count": 800,
        "revenue": 80000.00,
        "successRate": 95.5,
        "avgAmount": 100.00
      },
      {
        "name": "Debit Card",
        "count": 300,
        "revenue": 30000.00,
        "successRate": 92.0,
        "avgAmount": 100.00
      }
      // ... more methods
    ],

    // Gateway Performance (for Table)
    "gatewayPerformance": [
      {
        "name": "Stripe",
        "transactions": 900,
        "successRate": 95.5,
        "avgProcessingTime": 2.1,
        "revenue": 90000.00
      },
      {
        "name": "PayPal",
        "transactions": 350,
        "successRate": 88.5,
        "avgProcessingTime": 3.2,
        "revenue": 35000.00
      }
      // ... more gateways
    ]
  },

  "trends": {
    // Combined Revenue & Transaction Trend (for Composed Chart)
    "combinedTrend": [
      {
        "date": "2025-01-01",
        "revenue": 5000.00,
        "transactions": 50
      },
      {
        "date": "2025-01-02",
        "revenue": 5500.00,
        "transactions": 55
      }
      // ... more daily data
    ],

    // Day of Week Analysis (for Line Chart)
    "dayOfWeekTrend": [
      {
        "day": "Monday",
        "revenue": 18000.00,
        "transactions": 180
      },
      {
        "day": "Tuesday",
        "revenue": 17500.00,
        "transactions": 175
      }
      // ... all 7 days
    ],

    // Monthly Growth Rate (for Line Chart)
    "monthlyGrowth": [
      {
        "month": "Jan",
        "growth": 15.5
      },
      {
        "month": "Feb",
        "growth": 18.2
      }
      // ... more months
    ],

    // Peak Insights
    "peakDay": {
      "day": "Friday",
      "revenue": 22000.00
    },
    "bestMonth": {
      "month": "January",
      "revenue": 125000.00
    },
    "trendDirection": "up",  // "up", "down", or "stable"
    "forecastNextMonth": 145000.00,

    // Seasonal Analysis
    "seasonalAnalysis": [
      {
        "name": "Q1 (Jan-Mar)",
        "avgRevenue": 120000.00,
        "avgTransactions": 1200,
        "vsAverage": 12.5
      },
      {
        "name": "Q2 (Apr-Jun)",
        "avgRevenue": 110000.00,
        "avgTransactions": 1100,
        "vsAverage": 2.8
      },
      {
        "name": "Q3 (Jul-Sep)",
        "avgRevenue": 105000.00,
        "avgTransactions": 1050,
        "vsAverage": -1.9
      },
      {
        "name": "Q4 (Oct-Dec)",
        "avgRevenue": 130000.00,
        "avgTransactions": 1300,
        "vsAverage": 21.5
      }
    ]
  },

  "refunds": {
    // Refund Metrics
    "totalRefunds": 45,
    "totalRefundAmount": 4500.00,
    "refundRate": 3.6,
    "avgRefundAmount": 100.00,

    // Refund Trend Over Time (for Line Chart with dual Y-axis)
    "refundTrend": [
      {
        "date": "2025-01-01",
        "count": 2,
        "amount": 200.00
      },
      {
        "date": "2025-01-02",
        "count": 1,
        "amount": 100.00
      }
      // ... more daily data
    ],

    // Refund Reasons (for Pie Chart)
    "refundReasons": [
      {
        "name": "Customer Request",
        "count": 20
      },
      {
        "name": "Service Issue",
        "count": 15
      },
      {
        "name": "Billing Error",
        "count": 7
      },
      {
        "name": "Product Defect",
        "count": 3
      }
    ],

    // Refunds by Payment Type (for Bar Chart)
    "refundsByType": [
      {
        "type": "subscription",
        "count": 30
      },
      {
        "type": "consultation",
        "count": 15
      }
    ],

    // Detailed Refund Reasons (for Table)
    "detailedRefundReasons": [
      {
        "name": "Customer Request",
        "count": 20,
        "percentage": 44.4,
        "totalAmount": 2000.00,
        "avgAmount": 100.00
      },
      {
        "name": "Service Issue",
        "count": 15,
        "percentage": 33.3,
        "totalAmount": 1500.00,
        "avgAmount": 100.00
      }
      // ... more reasons
    ],

    // Impact Analysis
    "revenueLostToRefunds": 4500.00,
    "revenueImpactPercentage": 3.6,
    "avgRefundProcessingTime": 2.5,
    "refundTrendPercentage": -5.2  // negative means improvement (fewer refunds)
  }
}
```

---

## Implementation Notes

### 1. **Date Range Handling**
- If no dates provided, default to last 30 days
- All dates should be in ISO 8601 format
- Backend should handle timezone conversions appropriately

### 2. **Data Aggregation**
- Group payment data by relevant time periods (daily, weekly, monthly)
- Calculate all percentages to 1 decimal place
- Round currency values to 2 decimal places

### 3. **Performance Considerations**
- Consider caching analytics results for frequently requested date ranges
- Implement pagination if dataset is very large
- Use database indexes on payment date and status fields

### 4. **Data Privacy**
- Ensure no personally identifiable information (PII) is included in analytics
- Aggregate data only - no individual transaction details

### 5. **Error Handling**
Return appropriate HTTP status codes:
- `200 OK` - Success
- `400 Bad Request` - Invalid date range
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not admin user
- `500 Internal Server Error` - Server error

### 6. **Response Time**
- Target response time: < 2 seconds
- For large datasets, consider background processing with cache

---

## Sample Request

```bash
GET /admin-service/api/admin/payments/analytics?startDate=2025-01-01T00:00:00Z&endDate=2025-01-31T23:59:59Z
Authorization: Bearer {admin_jwt_token}
```

---

## Testing Checklist

- [ ] Test with no date parameters (default to last 30 days)
- [ ] Test with custom date range
- [ ] Test with invalid date format
- [ ] Test with future dates
- [ ] Test with date range > 1 year
- [ ] Test authentication/authorization
- [ ] Test with no payment data
- [ ] Test performance with large datasets
- [ ] Verify all calculations are accurate
- [ ] Verify all percentages sum correctly

---

## Database Queries Needed

The backend will need to query the following data from the payments table:

1. **Total counts** by status (completed, pending, failed, refunded, cancelled)
2. **Revenue sums** by payment type and date
3. **Transaction volumes** over time
4. **Payment method distributions**
5. **Refund data** with reasons and amounts
6. **Processing times** for transactions
7. **Gateway performance** metrics
8. **Time-based aggregations** (hourly, daily, weekly, monthly)

---

## Related Files

- **Frontend:** `src/pages/admin/PaymentAnalytics.jsx`
- **Service:** `src/services/api/adminService.js` (line 133-139)
- **Components:** `src/pages/admin/paymentAnalyticsComponents/*.jsx`

---

## Questions for Backend Team

1. What's the current database schema for payments table?
2. Are payment gateway names stored in the payments table?
3. Is refund reason a required field when processing refunds?
4. Should we include declined/cancelled payments in the analytics?
5. What's the expected maximum date range for analytics queries?
6. Should we implement real-time analytics or is cached data acceptable?

---

## Next Steps

1. Backend team implements the endpoint following this specification
2. Test endpoint with sample data
3. Frontend integration testing
4. Performance optimization if needed
5. Production deployment
