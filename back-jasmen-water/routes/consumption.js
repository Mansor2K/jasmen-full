const express = require('express');
const { 
  addConsumption, 
  getAllConsumptions, 
  getConsumptionsByUser, 
  getConsumptionsByDate,
  getConsumptionStats,
  getLatestConsumption,
  deleteConsumption,
  deleteOldConsumptions,
  getConsumptionByPeriod,
  getConsumptionAnalysis,
  getConsumptionByPeriodEnhanced,
  getConsumptionAnalysisEnhanced,
  getConsumptionForecast,
  getConsumptionCorrelation,
  getConsumptionSeasonality,
  getConsumptionBenchmark,
  getConsumptionRiskAssessment,
  getConsumptionPerformanceMetrics,
  getPumpEfficiencyAnalysis,
  getLeakDetectionAnalysis,
  getPumpCycleAnalysis,
  getPumpHealthMonitoring,
  getPumpOperationOptimization
} = require('../controller/consumption');
const router = express.Router();
const { verfiyAdmin, verfiyUser } = require('../utils/verfy_user_token/verfy');

// Consumption routes
router.post("/AddConsumption", verfiyAdmin, addConsumption);
router.get("/GetAllConsumptions", verfiyAdmin, getAllConsumptions);
router.get("/GetConsumptionsByUser/:userId", verfiyAdmin, getConsumptionsByUser);
router.get("/GetConsumptionsByDate", verfiyAdmin, getConsumptionsByDate);
router.get("/GetConsumptionStats", verfiyAdmin, getConsumptionStats);
router.get("/GetLatestConsumption/:userId", verfiyAdmin, getLatestConsumption);
router.delete("/DeleteConsumption/:id", verfiyAdmin, deleteConsumption);
router.delete("/DeleteOldConsumptions", verfiyAdmin, deleteOldConsumptions);

// Consumption analysis routes (Enhanced)
router.get("/GetConsumptionByPeriod/:userId", verfiyUser, getConsumptionByPeriodEnhanced);
router.get("/GetConsumptionAnalysis/:userId", verfiyUser, getConsumptionAnalysisEnhanced);

// Professional Data Analysis Endpoints
router.get("/GetConsumptionForecast/:userId", verfiyUser, getConsumptionForecast);
router.get("/GetConsumptionCorrelation/:userId", verfiyUser, getConsumptionCorrelation);
router.get("/GetConsumptionSeasonality/:userId", verfiyUser, getConsumptionSeasonality);
router.get("/GetConsumptionBenchmark/:userId", verfiyUser, getConsumptionBenchmark);
router.get("/GetConsumptionRiskAssessment/:userId", verfiyUser, getConsumptionRiskAssessment);
router.get("/GetConsumptionPerformanceMetrics/:userId", verfiyUser, getConsumptionPerformanceMetrics);

// Water Pump Specific Analysis Endpoints
router.get("/GetPumpEfficiencyAnalysis/:userId", verfiyUser, getPumpEfficiencyAnalysis);
router.get("/GetLeakDetectionAnalysis/:userId", verfiyUser, getLeakDetectionAnalysis);
router.get("/GetPumpCycleAnalysis/:userId", verfiyUser, getPumpCycleAnalysis);
router.get("/GetPumpHealthMonitoring/:userId", verfiyUser, getPumpHealthMonitoring);
router.get("/GetPumpOperationOptimization/:userId", verfiyUser, getPumpOperationOptimization);

module.exports = router;
