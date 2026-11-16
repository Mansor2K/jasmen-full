# Water Consumption Analysis API Documentation

## Overview

This API provides comprehensive analysis tools for water consumption and pump performance monitoring. The system tracks water usage, pump cycles, flow rates, and provides intelligent insights to help optimize water management and detect issues early.

---

## Table of Contents

1. [Enhanced Analysis Endpoints](#enhanced-analysis-endpoints)
2. [Professional Data Analysis Endpoints](#professional-data-analysis-endpoints)
3. [Water Pump Specific Analysis Endpoints](#water-pump-specific-analysis-endpoints)
4. [Common Response Format](#common-response-format)
5. [Error Handling](#error-handling)
6. [Use Cases](#use-cases)

---

## Enhanced Analysis Endpoints

### 1. Get Consumption By Period (Enhanced)

**Endpoint:** `GET /GetConsumptionByPeriod/:userId`

**Description:**  
Retrieves water consumption data grouped by different time periods (hour, day, week, month, quarter, year) with advanced filtering and projection capabilities.

**Query Parameters:**
- `period` (optional, default: "day") - Time period: `hour`, `day`, `week`, `month`, `quarter`, `year`
- `startDate` (optional) - Start date in ISO format (YYYY-MM-DD)
- `endDate` (optional) - End date in ISO format (YYYY-MM-DD)
- `includeProjections` (optional, default: false) - Include next period projections: `true` or `false`
- `exportFormat` (optional, default: "json") - Export format: `json`

**How It Works:**
1. Groups consumption data by the specified time period
2. Calculates totals, averages, min/max values for each period
3. Optionally projects next period consumption based on recent trends
4. Provides summary statistics including max/min periods

**Example Request:**
```
GET /GetConsumptionByPeriod/507f1f77bcf86cd799439011?period=month&includeProjections=true
```

**Example Response:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "userName": "John Doe",
    "email": "john@example.com",
    "roomNumber": "101"
  },
  "period": "month",
  "dateRange": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z"
  },
  "data": [
    {
      "period": "2024-01",
      "totalConsumption": 1250.50,
      "avgConsumption": 40.34,
      "maxConsumption": 85.20,
      "minConsumption": 15.30,
      "avgFlowRate": 2.5,
      "totalReadings": 1240,
      "efficiency": 1.01
    }
  ],
  "summary": {
    "totalPeriods": 1,
    "totalConsumption": 1250.50,
    "avgConsumptionPerPeriod": 1250.50,
    "maxPeriod": { "period": "2024-01", "totalConsumption": 1250.50 },
    "minPeriod": { "period": "2024-01", "totalConsumption": 1250.50 }
  },
  "projections": {
    "nextPeriod": 1280.25,
    "growthRate": 2.37,
    "confidence": "high"
  }
}
```

**Business Value:**
- Track consumption trends over different time periods
- Plan water usage based on historical patterns
- Get early warnings about consumption increases

---

### 2. Get Consumption Analysis (Enhanced)

**Endpoint:** `GET /GetConsumptionAnalysis/:userId`

**Description:**  
Provides comprehensive statistical analysis comparing consumption across multiple periods with advanced forecasting and seasonality detection.

**Query Parameters:**
- `comparePeriod` (optional, default: "day") - Period type: `day`, `week`, `month`, `year`
- `compareCount` (optional, default: 2) - Number of periods to compare (2-30 for days, 2-52 for weeks, etc.)
- `includeForecast` (optional, default: false) - Include forecast: `true` or `false`
- `includeSeasonality` (optional, default: false) - Include seasonality analysis: `true` or `false`
- `statisticalLevel` (optional, default: "advanced") - Statistical analysis level

**How It Works:**
1. Retrieves consumption data for specified number of periods
2. Calculates period-to-period comparisons with percentage changes
3. Performs linear regression to identify trends
4. Optionally forecasts next period consumption
5. Detects seasonal patterns if requested

**Example Request:**
```
GET /GetConsumptionAnalysis/507f1f77bcf86cd799439011?comparePeriod=week&compareCount=4&includeForecast=true
```

**Example Response:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "userName": "John Doe",
    "email": "john@example.com",
    "roomNumber": "101"
  },
  "period": "week",
  "dateRange": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-28T23:59:59.999Z"
  },
  "periods": [
    {
      "period": "Week 4, 2024",
      "totalConsumption": 350.50,
      "avgConsumption": 50.07,
      "maxConsumption": 85.20,
      "minConsumption": 15.30
    }
  ],
  "comparisons": [
    {
      "fromPeriod": "Week 3, 2024",
      "toPeriod": "Week 4, 2024",
      "consumptionDifference": 25.50,
      "consumptionPercentChange": 7.85,
      "trend": "increasing",
      "trendStrength": "moderate"
    }
  ],
  "statistics": {
    "descriptive": {
      "overallAvgConsumption": 48.50,
      "consumptionStandardDeviation": 12.30,
      "coefficientOfVariation": 25.36
    },
    "trend": {
      "direction": "increasing",
      "slope": 2.15,
      "rSquared": 0.78
    },
    "forecast": {
      "nextPeriod": 375.25,
      "confidence": "high",
      "rSquared": 0.78
    }
  }
}
```

**Business Value:**
- Understand consumption trends and patterns
- Predict future consumption needs
- Identify unusual consumption spikes
- Make data-driven decisions about water usage

---

## Professional Data Analysis Endpoints

### 3. Get Consumption Forecast

**Endpoint:** `GET /GetConsumptionForecast/:userId`

**Description:**  
Predicts future water consumption using linear regression analysis based on historical data. Provides confidence intervals and accuracy metrics.

**Query Parameters:**
- `forecastPeriods` (optional, default: 7) - Number of future periods to forecast (days)
- `method` (optional, default: "linear") - Forecasting method: `linear`
- `confidenceLevel` (optional, default: 0.95) - Confidence level (0-1)

**How It Works:**
1. Analyzes last 30 days of historical consumption data
2. Applies linear regression to identify consumption trend
3. Projects future consumption for specified number of periods
4. Calculates confidence intervals (upper and lower bounds)
5. Provides model accuracy metrics (R², MAE, MAPE)

**Example Request:**
```
GET /GetConsumptionForecast/507f1f77bcf86cd799439011?forecastPeriods=7&confidenceLevel=0.95
```

**Example Response:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "userName": "John Doe",
    "email": "john@example.com",
    "roomNumber": "101"
  },
  "forecast": {
    "method": "linear",
    "periods": 7,
    "confidenceLevel": 0.95,
    "modelAccuracy": {
      "rSquared": 0.85,
      "meanAbsoluteError": 5.20,
      "meanAbsolutePercentageError": 8.5,
      "quality": "high"
    },
    "forecasts": [
      {
        "date": "2024-02-01T00:00:00.000Z",
        "forecastedConsumption": 52.30,
        "lowerBound": 47.10,
        "upperBound": 57.50,
        "confidence": 95
      }
    ]
  },
  "historicalData": {
    "period": {
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.999Z"
    },
    "dataPoints": 30,
    "avgConsumption": 48.50,
    "trend": "increasing"
  }
}
```

**Business Value:**
- Plan water supply and storage needs
- Budget for water consumption
- Set realistic consumption targets
- Early warning for consumption increases

---

### 4. Get Consumption Correlation

**Endpoint:** `GET /GetConsumptionCorrelation/:userId`

**Description:**  
Analyzes relationships between different consumption metrics (consumption vs flow rate, readings, resets) to identify patterns and dependencies.

**Query Parameters:**
- `days` (optional, default: 30) - Number of days to analyze

**How It Works:**
1. Collects consumption data for specified period
2. Calculates correlation coefficients between:
   - Consumption vs Flow Rate
   - Consumption vs Sensor Readings
   - Consumption vs Pump Resets
   - Flow Rate vs Readings
3. Interprets correlation strength (strong/moderate/weak)
4. Provides insights on key relationships

**Example Request:**
```
GET /GetConsumptionCorrelation/507f1f77bcf86cd799439011?days=30
```

**Example Response:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "userName": "John Doe",
    "email": "john@example.com",
    "roomNumber": "101"
  },
  "period": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z",
    "days": 30
  },
  "dataPoints": 30,
  "correlations": {
    "consumptionVsFlowRate": {
      "coefficient": 0.85,
      "strength": "strong",
      "interpretation": "Strong positive correlation - Higher flow rates indicate higher consumption"
    },
    "consumptionVsReadings": {
      "coefficient": 0.72,
      "strength": "strong"
    },
    "consumptionVsResets": {
      "coefficient": -0.15,
      "strength": "weak"
    }
  },
  "insights": {
    "strongestCorrelation": ["consumptionVsFlowRate", {
      "coefficient": 0.85,
      "strength": "strong"
    }],
    "keyFindings": [
      "consumptionVsFlowRate shows strong correlation (0.85)",
      "consumptionVsReadings shows strong correlation (0.72)"
    ]
  }
}
```

**Business Value:**
- Understand what factors drive consumption
- Identify system inefficiencies
- Optimize pump operation based on correlations
- Detect abnormal relationships that may indicate issues

---

### 5. Get Consumption Seasonality

**Endpoint:** `GET /GetConsumptionSeasonality/:userId`

**Description:**  
Identifies seasonal patterns in water consumption (monthly, weekly, or daily patterns) to understand usage cycles.

**Query Parameters:**
- `period` (optional, default: "month") - Period type: `month`, `week`, `day`
- `years` (optional, default: 1) - Number of years to analyze

**How It Works:**
1. Groups consumption data by specified period (month/week/day)
2. Calculates average consumption for each period
3. Identifies deviations from overall average
4. Detects peak and low consumption periods
5. Determines if strong seasonality exists

**Example Request:**
```
GET /GetConsumptionSeasonality/507f1f77bcf86cd799439011?period=month&years=1
```

**Example Response:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "userName": "John Doe",
    "email": "john@example.com",
    "roomNumber": "101"
  },
  "period": "month",
  "dateRange": {
    "startDate": "2023-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z",
    "years": 1
  },
  "overallAverage": 45.50,
  "seasonalPattern": [
    {
      "period": 1,
      "avgConsumption": 42.30,
      "deviationFromAverage": -3.20,
      "percentDeviation": -7.03
    },
    {
      "period": 7,
      "avgConsumption": 58.20,
      "deviationFromAverage": 12.70,
      "percentDeviation": 27.91
    }
  ],
  "insights": {
    "peakPeriods": [
      { "period": 7, "avgConsumption": 58.20 }
    ],
    "lowPeriods": [
      { "period": 1, "avgConsumption": 42.30 }
    ],
    "seasonalVariation": 15.90,
    "hasStrongSeasonality": true
  }
}
```

**Business Value:**
- Plan for seasonal consumption variations
- Adjust water supply during peak periods
- Understand usage patterns throughout the year
- Optimize resource allocation based on seasons

---

### 6. Get Consumption Benchmark

**Endpoint:** `GET /GetConsumptionBenchmark/:userId`

**Description:**  
Compares individual user consumption against system-wide averages to identify above/below average usage and provide performance context.

**Query Parameters:**
- `period` (optional, default: "month") - Period type: `month`, `week`, `day`
- `compareWith` (optional, default: "all") - Comparison group: `all`

**How It Works:**
1. Calculates user's average consumption for the period
2. Calculates system-wide average consumption
3. Computes difference and percentage difference
4. Determines percentile ranking
5. Provides status (above_average/below_average/average)
6. Generates personalized recommendations

**Example Request:**
```
GET /GetConsumptionBenchmark/507f1f77bcf86cd799439011?period=month
```

**Example Response:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "userName": "John Doe",
    "email": "john@example.com",
    "roomNumber": "101"
  },
  "period": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z",
    "period": "month"
  },
  "userMetrics": {
    "avgConsumption": 48.50,
    "totalConsumption": 1503.50,
    "maxConsumption": 85.20,
    "minConsumption": 15.30
  },
  "benchmarkMetrics": {
    "avgConsumption": 52.30,
    "totalConsumption": 52300.00,
    "userCount": 100
  },
  "comparison": {
    "difference": -3.80,
    "percentDifference": -7.27,
    "status": "below_average",
    "percentile": 42.50,
    "efficiency": 0.039
  },
  "recommendations": [
    "Your consumption is significantly below average. Great job on conservation!"
  ]
}
```

**Business Value:**
- Understand how consumption compares to others
- Identify high consumers for targeted interventions
- Reward efficient users
- Set realistic consumption targets

---

### 7. Get Consumption Risk Assessment

**Endpoint:** `GET /GetConsumptionRiskAssessment/:userId`

**Description:**  
Identifies consumption risks, anomalies, and potential issues that require attention. Provides risk scoring and actionable recommendations.

**Query Parameters:**
- `days` (optional, default: 30) - Number of days to analyze

**How It Works:**
1. Analyzes consumption patterns over specified period
2. Detects anomalies using statistical methods (z-scores)
3. Identifies risks:
   - High consumption spikes
   - Increasing consumption trends
   - Approaching consumption limits
4. Calculates risk score (0-100)
5. Provides prioritized recommendations

**Example Request:**
```
GET /GetConsumptionRiskAssessment/507f1f77bcf86cd799439011?days=30
```

**Example Response:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "userName": "John Doe",
    "email": "john@example.com",
    "roomNumber": "101"
  },
  "period": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z",
    "days": 30
  },
  "riskAssessment": {
    "riskScore": 45.00,
    "riskLevel": "medium",
    "risks": [
      {
        "type": "increasing_trend",
        "severity": "medium",
        "description": "Consumption has increased by 15.30% in the last week",
        "recommendation": "Monitor consumption closely and investigate the cause of the increase"
      }
    ],
    "anomalies": [
      {
        "date": "2024-01-15T00:00:00.000Z",
        "consumption": 95.50,
        "zScore": 2.35,
        "deviation": 47.00,
        "type": "spike"
      }
    ],
    "statistics": {
      "avgConsumption": 48.50,
      "stdDeviation": 20.00,
      "currentConsumption": 52.30,
      "consumptionLimit": 100.00,
      "limitUtilization": 52.30
    }
  },
  "recommendations": [
    "Monitor consumption closely and investigate the cause of the increase",
    "Moderate leak risk - monitor closely and check for minor leaks"
  ]
}
```

**Business Value:**
- Early warning system for consumption issues
- Prevent exceeding consumption limits
- Identify unusual patterns requiring investigation
- Proactive risk management

---

### 8. Get Consumption Performance Metrics

**Endpoint:** `GET /GetConsumptionPerformanceMetrics/:userId`

**Description:**  
Provides comprehensive performance analysis including consumption metrics, efficiency, consistency, and trends. Calculates overall performance score.

**Query Parameters:**
- `period` (optional, default: "month") - Period type: `month`, `week`, `day`

**How It Works:**
1. Calculates comprehensive metrics:
   - Consumption statistics (total, average, median, min, max, std deviation)
   - Flow rate metrics
   - Efficiency metrics (consumption per reading)
   - Consistency metrics (coefficient of variation, stability)
   - Trend analysis (direction, growth rate)
2. Computes performance score (0-100)
3. Identifies strengths and areas for improvement
4. Provides actionable insights

**Example Request:**
```
GET /GetConsumptionPerformanceMetrics/507f1f77bcf86cd799439011?period=month
```

**Example Response:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "userName": "John Doe",
    "email": "john@example.com",
    "roomNumber": "101"
  },
  "period": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z",
    "period": "month"
  },
  "performanceScore": 75.00,
  "performanceLevel": "good",
  "metrics": {
    "consumption": {
      "total": 1503.50,
      "average": 48.50,
      "median": 47.20,
      "max": 85.20,
      "min": 15.30,
      "stdDeviation": 18.50
    },
    "flowRate": {
      "average": 2.5,
      "max": 4.2,
      "min": 0.8
    },
    "efficiency": {
      "avgConsumptionPerReading": 1.21,
      "totalReadings": 1240,
      "readingsPerDay": 40.00
    },
    "consistency": {
      "coefficientOfVariation": 38.14,
      "stability": "moderate"
    },
    "trends": {
      "direction": "stable",
      "growthRate": 2.50
    }
  },
  "insights": {
    "strengths": [
      "Efficient consumption per reading"
    ],
    "areasForImprovement": [
      "High consumption variability - consider stabilizing usage patterns"
    ]
  }
}
```

**Business Value:**
- Comprehensive performance overview
- Identify optimization opportunities
- Track performance improvements over time
- Data-driven decision making

---

## Water Pump Specific Analysis Endpoints

### 9. Get Pump Efficiency Analysis

**Endpoint:** `GET /GetPumpEfficiencyAnalysis/:userId`

**Description:**  
Analyzes water pump performance and efficiency by calculating water delivery per pump cycle, flow efficiency, and pump utilization rates.

**Query Parameters:**
- `days` (optional, default: 30) - Number of days to analyze

**How It Works:**
1. Calculates efficiency metrics:
   - Consumption per pump cycle (water delivered per on/off cycle)
   - Flow efficiency (consumption per flow rate unit)
   - Reading efficiency (consumption per sensor reading)
   - Pump utilization rate (cycles per readings)
2. Tracks efficiency trends (improving/declining/stable)
3. Assesses pump health status
4. Provides maintenance recommendations

**Example Request:**
```
GET /GetPumpEfficiencyAnalysis/507f1f77bcf86cd799439011?days=30
```

**Example Response:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "userName": "John Doe",
    "email": "john@example.com",
    "roomNumber": "101"
  },
  "period": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z",
    "days": 30
  },
  "overallEfficiency": {
    "avgConsumptionPerCycle": 35.50,
    "avgFlowEfficiency": 19.40,
    "avgReadingEfficiency": 1.21,
    "pumpUtilizationRate": 28.50,
    "cyclesPerDay": 12.50,
    "avgConsumptionPerDay": 48.50
  },
  "efficiencyTrend": "stable",
  "dailyEfficiency": [
    {
      "date": "2024-01-01T00:00:00.000Z",
      "dailyConsumption": 45.20,
      "avgFlowRate": 2.3,
      "statusChanges": 15,
      "consumptionPerCycle": 3.01,
      "flowEfficiency": 19.65,
      "pumpUtilization": 30.00
    }
  ],
  "insights": {
    "pumpHealth": "good",
    "recommendations": []
  }
}
```

**Business Value:**
- Monitor pump performance over time
- Identify when pump efficiency is declining
- Optimize pump operation for better efficiency
- Schedule maintenance based on efficiency trends

---

### 10. Get Leak Detection Analysis

**Endpoint:** `GET /GetLeakDetectionAnalysis/:userId`

**Description:**  
Detects potential water leaks by analyzing flow patterns, consumption anomalies, and pump activity. Uses multiple detection algorithms to identify leak indicators.

**Query Parameters:**
- `days` (optional, default: 7) - Number of days to analyze
- `threshold` (optional, default: 0.1) - Leak detection sensitivity (0-1)

**How It Works:**
1. Analyzes consumption and flow rate patterns
2. Detects leak indicators:
   - Continuous flow with low consumption (possible leak)
   - Flow without pump cycles (pump running continuously)
   - High flow rate with minimal consumption increase
   - Consumption without pump activity
   - High sensor readings with low consumption
3. Calculates leak risk score (0-100)
4. Identifies consecutive leak days
5. Provides urgent recommendations

**Example Request:**
```
GET /GetLeakDetectionAnalysis/507f1f77bcf86cd799439011?days=7&threshold=0.1
```

**Example Response:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "userName": "John Doe",
    "email": "john@example.com",
    "roomNumber": "101"
  },
  "period": {
    "startDate": "2024-01-25T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z",
    "days": 7
  },
  "leakDetection": {
    "leakRiskScore": 65.00,
    "riskLevel": "medium",
    "suspiciousDays": 3,
    "consecutiveLeakDays": 2,
    "leakIndicators": [
      {
        "date": "2024-01-28T00:00:00.000Z",
        "dailyConsumption": 8.50,
        "avgFlowRate": 2.5,
        "statusChanges": 0,
        "indicators": [
          {
            "type": "continuous_flow_no_cycles",
            "severity": "high",
            "description": "Flow detected but no pump cycles - possible continuous leak"
          }
        ],
        "leakProbability": "high"
      }
    ],
    "baseline": {
      "avgConsumption": 48.50,
      "avgFlowRate": 2.5
    }
  },
  "recommendations": [
    "Moderate leak risk - monitor closely and check for minor leaks",
    "High probability leak indicators found - check water connections and pipes"
  ]
}
```

**Business Value:**
- Early leak detection to prevent water waste
- Reduce water loss and costs
- Prevent property damage from leaks
- Proactive maintenance alerts

---

### 11. Get Pump Cycle Analysis

**Endpoint:** `GET /GetPumpCycleAnalysis/:userId`

**Description:**  
Analyzes pump on/off cycles, cycling patterns, and identifies excessive cycling that may indicate system issues or inefficiencies.

**Query Parameters:**
- `days` (optional, default: 30) - Number of days to analyze

**How It Works:**
1. Analyzes pump cycles (statusChanges) per day
2. Calculates cycle statistics:
   - Total cycles and resets
   - Average cycles per day
   - Consumption per cycle
   - Average cycle duration
3. Compares weekday vs weekend patterns
4. Identifies excessive cycling days
5. Analyzes reset-to-cycle ratio

**Example Request:**
```
GET /GetPumpCycleAnalysis/507f1f77bcf86cd799439011?days=30
```

**Example Response:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "userName": "John Doe",
    "email": "john@example.com",
    "roomNumber": "101"
  },
  "period": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z",
    "days": 30
  },
  "cycleStatistics": {
    "totalCycles": 375,
    "totalResets": 12,
    "avgCyclesPerDay": 12.50,
    "avgResetsPerDay": 0.40,
    "avgConsumptionPerCycle": 4.01,
    "resetToCycleRatio": 3.20
  },
  "patterns": {
    "weekdayVsWeekend": {
      "avgWeekdayCycles": 14.20,
      "avgWeekendCycles": 8.50,
      "difference": 5.70
    },
    "excessiveCyclingDays": 2,
    "excessiveCyclingDetails": [
      {
        "date": "2024-01-15T00:00:00.000Z",
        "statusChanges": 35,
        "consumptionPerCycle": 2.10
      }
    ]
  },
  "dailyCycleAnalysis": [
    {
      "date": "2024-01-01T00:00:00.000Z",
      "statusChanges": 15,
      "resetCount": 0,
      "consumptionPerCycle": 3.01,
      "avgCycleDuration": 2.67
    }
  ],
  "insights": {
    "pumpHealth": "normal",
    "recommendations": [
      "Significant difference between weekday and weekend usage - consider usage pattern optimization"
    ]
  }
}
```

**Business Value:**
- Identify excessive pump cycling (causes wear and energy waste)
- Understand usage patterns (weekday vs weekend)
- Optimize pump operation to reduce cycling
- Detect pressure issues or system problems

---

### 12. Get Pump Health Monitoring

**Endpoint:** `GET /GetPumpHealthMonitoring/:userId`

**Description:**  
Comprehensive pump health assessment providing overall health score, efficiency metrics, reliability indicators, and performance status.

**Query Parameters:**
- `days` (optional, default: 30) - Number of days to analyze

**How It Works:**
1. Calculates health indicators:
   - **Efficiency**: Consumption per cycle, flow rate stability
   - **Reliability**: Reset rate, cycle consistency
   - **Performance**: Average flow rate, flow rate range
2. Computes overall health score (0-100)
3. Analyzes health trends (improving/declining/stable)
4. Provides maintenance recommendations based on health status

**Example Request:**
```
GET /GetPumpHealthMonitoring/507f1f77bcf86cd799439011?days=30
```

**Example Response:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "userName": "John Doe",
    "email": "john@example.com",
    "roomNumber": "101"
  },
  "period": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z",
    "days": 30
  },
  "pumpHealth": {
    "overallHealthScore": 78.00,
    "healthLevel": "good",
    "trend": "stable",
    "healthIndicators": {
      "efficiency": {
        "consumptionPerCycle": 35.50,
        "flowRateStability": 18.50,
        "status": "good"
      },
      "reliability": {
        "resetRate": 3.20,
        "cycleConsistency": 22.30,
        "status": "excellent"
      },
      "performance": {
        "avgFlowRate": 2.5,
        "flowRateRange": {
          "min": 0.8,
          "max": 4.2
        },
        "status": "good"
      }
    },
    "summary": {
      "totalCycles": 375,
      "totalResets": 12,
      "totalConsumption": 1503.50,
      "avgCyclesPerDay": 12.50,
      "avgConsumptionPerDay": 48.50
    }
  },
  "recommendations": [
    "Pump health is good but monitor for any changes"
  ]
}
```

**Business Value:**
- Proactive pump health monitoring
- Prevent pump failures through early detection
- Schedule maintenance based on health status
- Optimize pump lifespan and performance

---

### 13. Get Pump Operation Optimization

**Endpoint:** `GET /GetPumpOperationOptimization/:userId`

**Description:**  
Provides recommendations for optimizing pump operation to reduce energy consumption, minimize wear, and improve efficiency.

**Query Parameters:**
- `days` (optional, default: 30) - Number of days to analyze

**How It Works:**
1. Analyzes current pump operation patterns
2. Identifies optimal operation parameters
3. Calculates efficiency score
4. Generates optimization recommendations:
   - Reduce excessive cycling
   - Improve cycle efficiency
   - Stabilize flow rates
   - Reduce resets
5. Calculates potential savings (energy, wear reduction)
6. Provides actionable optimization plan

**Example Request:**
```
GET /GetPumpOperationOptimization/507f1f77bcf86cd799439011?days=30
```

**Example Response:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "userName": "John Doe",
    "email": "john@example.com",
    "roomNumber": "101"
  },
  "period": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z",
    "days": 30
  },
  "currentOperation": {
    "avgConsumptionPerDay": 48.50,
    "avgCyclesPerDay": 12.50,
    "avgConsumptionPerCycle": 3.88,
    "efficiencyScore": 82.00
  },
  "optimalOperation": {
    "recommendedConsumptionPerCycle": 4.20,
    "optimalDaysCount": 22,
    "optimalDaysPercentage": 73.33
  },
  "optimizations": [
    {
      "type": "stabilize_flow_rate",
      "priority": "medium",
      "description": "Inconsistent flow rates detected",
      "recommendation": "Check pressure regulation and pump settings for consistent operation",
      "expectedImpact": "Improve system stability and water delivery consistency"
    }
  ],
  "potentialSavings": {
    "improvedEfficiency": {
      "currentEfficiency": 3.88,
      "targetEfficiency": 5.82,
      "improvement": "50% increase in water delivery per cycle",
      "impact": "Better water utilization and reduced cycling"
    }
  },
  "actionPlan": [
    {
      "action": "Check pressure regulation and pump settings for consistent operation",
      "priority": "medium",
      "expectedImpact": "Improve system stability and water delivery consistency"
    }
  ]
}
```

**Business Value:**
- Reduce energy consumption
- Minimize pump wear and maintenance costs
- Improve water delivery efficiency
- Extend pump lifespan
- Lower operational costs

---

## Common Response Format

All endpoints follow a consistent response structure:

```json
{
  "user": {
    "_id": "userId",
    "userName": "User Name",
    "email": "user@example.com",
    "roomNumber": "Room Number"
  },
  "period": {
    "startDate": "ISO Date",
    "endDate": "ISO Date",
    "days/period": "value"
  },
  // Endpoint-specific data
  "metadata": {
    "generatedAt": "ISO Date",
    // Additional metadata
  }
}
```

---

## Error Handling

All endpoints return standard HTTP status codes:

- **200 OK**: Successful request
- **400 Bad Request**: Invalid parameters or insufficient data
- **404 Not Found**: User not found or no data available
- **401 Unauthorized**: Invalid or missing authentication token

Error response format:
```json
{
  "error": "Error message describing what went wrong"
}
```

---

## Use Cases

### For Property Managers
- Monitor overall water consumption across all users
- Identify high consumers for targeted interventions
- Detect leaks early to prevent water waste
- Optimize pump operation to reduce energy costs

### For Individual Users
- Track personal water consumption patterns
- Understand how consumption compares to others
- Receive alerts about unusual consumption
- Get recommendations for water conservation

### For Maintenance Teams
- Monitor pump health and performance
- Schedule preventive maintenance based on health scores
- Identify pump issues before they become critical
- Optimize pump operation for efficiency

### For System Administrators
- Analyze system-wide consumption trends
- Forecast future water needs
- Identify seasonal patterns
- Make data-driven decisions about infrastructure

---

## Authentication

All endpoints require authentication using the `verfiyUser` middleware. Include the access token in the request header:

```
access_token: <your_jwt_token>
```

---

## Rate Limiting

To ensure system stability, API requests may be rate-limited. Contact your system administrator for rate limit information.

---

## Support

For questions or support regarding these APIs, please contact your system administrator or refer to the system documentation.

---

**Last Updated:** 2024-01-31  
**API Version:** 1.0

