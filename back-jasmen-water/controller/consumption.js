const Consumption = require("../model/consumption");
const User = require("../model/user");
const mongoose = require("mongoose");

/**
 * Helper function to calculate date range based on period
 * Supports both period-based calculation and custom date ranges
 * 
 * @param {string} period - Period type: 'day', 'week', 'month', 'year'
 * @param {number} count - Number of periods (default: 1)
 * @param {string|Date} startDate - Optional custom start date (ISO format: YYYY-MM-DD)
 * @param {string|Date} endDate - Optional custom end date (ISO format: YYYY-MM-DD)
 * @returns {Object} { startDate, endDate, period, count }
 * 
 * Usage:
 * - With period: calculatePeriodDateRange("month", 2) // Last 2 months
 * - With custom dates: calculatePeriodDateRange("month", 1, "2024-01-01", "2024-01-31")
 * - Custom dates override period calculation when both startDate and endDate are provided
 */
const calculatePeriodDateRange = (period = "month", count = 1, startDate = null, endDate = null) => {
  const now = new Date();
  let queryStartDate, queryEndDate;

  // If both startDate and endDate are provided, use them (overrides period calculation)
  if (startDate && endDate) {
    queryStartDate = new Date(startDate);
    queryEndDate = new Date(endDate);
    queryStartDate.setHours(0, 0, 0, 0);
    queryEndDate.setHours(23, 59, 59, 999);
  } else {
    // Calculate based on period
    queryEndDate = new Date(now);
    queryEndDate.setHours(23, 59, 59, 999);
    queryStartDate = new Date(now);

    const periodCount = parseInt(count) || 1;

    switch (period.toLowerCase()) {
      case "day":
        queryStartDate.setDate(queryStartDate.getDate() - periodCount);
        queryStartDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        queryStartDate.setDate(queryStartDate.getDate() - (periodCount * 7));
        queryStartDate.setHours(0, 0, 0, 0);
        break;
      case "month":
        queryStartDate.setMonth(queryStartDate.getMonth() - periodCount);
        queryStartDate.setHours(0, 0, 0, 0);
        break;
      case "year":
        queryStartDate.setFullYear(queryStartDate.getFullYear() - periodCount);
        queryStartDate.setHours(0, 0, 0, 0);
        break;
      default:
        // Default to month
        queryStartDate.setMonth(queryStartDate.getMonth() - periodCount);
        queryStartDate.setHours(0, 0, 0, 0);
    }
  }

  return {
    startDate: queryStartDate,
    endDate: queryEndDate,
    period: period.toLowerCase(),
    count: parseInt(count) || 1,
  };
};

const addConsumption = async (req, res) => {
  try {
    const {
      userId,
      date,
      dailyConsumption,
      maxConsumption,
      minConsumption,
      avgConsumption,
      maxFlowRate,
      minFlowRate,
      avgFlowRate,
      consumptionLimit,
      totalReadings,
      resetCount,
      statusChanges,
    } = req.body;

    // Basic validation for required fields
    if (!userId || !date || dailyConsumption === undefined || consumptionLimit === undefined) {
      return res.status(400).json({
        error: "userId, date, dailyConsumption, and consumptionLimit are required",
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if consumption record already exists for this date
    const existingConsumption = await Consumption.findOne({
      userId,
      date: new Date(date)
    });

    if (existingConsumption) {
      return res.status(400).json({ error: "Consumption record already exists for this date" });
    }

    // Create a new daily consumption record
    const newConsumption = new Consumption({
      userId,
      date: new Date(date),
      dailyConsumption: dailyConsumption || 0,
      maxConsumption: maxConsumption || 0,
      minConsumption: minConsumption || 0,
      avgConsumption: avgConsumption || 0,
      maxFlowRate: maxFlowRate || 0,
      minFlowRate: minFlowRate || 0,
      avgFlowRate: avgFlowRate || 0,
      consumptionLimit,
      totalReadings: totalReadings || 0,
      resetCount: resetCount || 0,
      statusChanges: statusChanges || 0,
    });

    // Save the consumption record
    const savedConsumption = await newConsumption.save();

    res.status(201).json(savedConsumption);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllConsumptions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get consumptions with pagination
    const consumptions = await Consumption.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalConsumptions = await Consumption.countDocuments();

    res.status(200).json({
      consumptions,
      currentPage: page,
      totalPages: Math.ceil(totalConsumptions / limit),
      totalConsumptions,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getConsumptionsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get daily consumptions for specific user
    const consumptions = await Consumption.find({ userId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalConsumptions = await Consumption.countDocuments({ userId });

    res.status(200).json({
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        roomNumber: user.roomNumber,
      },
      consumptions,
      currentPage: page,
      totalPages: Math.ceil(totalConsumptions / limit),
      totalConsumptions,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getConsumptionsByDate = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (userId) {
      query.userId = userId;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get daily consumptions with date filter
    const consumptions = await Consumption.find(query)
      .populate('userId', 'userName email roomNumber')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalConsumptions = await Consumption.countDocuments(query);

    res.status(200).json({
      consumptions,
      currentPage: page,
      totalPages: Math.ceil(totalConsumptions / limit),
      totalConsumptions,
      filters: { startDate, endDate, userId }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getConsumptionStats = async (req, res) => {
  try {
    const { 
      userId, 
      period = "month",
      count = 1,
      days, // Keep for backward compatibility
      startDate: customStartDate,
      endDate: customEndDate
    } = req.query;
    
    // Calculate date range - support both period and days (backward compatibility)
    let dateRange;
    if (days) {
      // Backward compatibility: use days if provided
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      dateRange = { startDate, endDate, period: "custom", count: parseInt(days) };
    } else {
      dateRange = calculatePeriodDateRange(period, count, customStartDate, customEndDate);
    }
    const { startDate, endDate } = dateRange;

    // Build query
    let query = {
      date: {
        $gte: startDate,
        $lte: endDate
      }
    };
    
    if (userId) {
      query.userId = userId;
    }

    // Get consumption statistics
    const stats = await Consumption.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          avgDailyConsumption: { $avg: "$dailyConsumption" },
          maxDailyConsumption: { $max: "$dailyConsumption" },
          minDailyConsumption: { $min: "$dailyConsumption" },
          totalDailyConsumption: { $sum: "$dailyConsumption" },
          avgMaxConsumption: { $avg: "$maxConsumption" },
          avgMinConsumption: { $avg: "$minConsumption" },
          avgFlowRate: { $avg: "$avgFlowRate" },
          maxFlowRate: { $max: "$maxFlowRate" },
          minFlowRate: { $min: "$minFlowRate" },
          totalReadings: { $sum: "$totalReadings" },
          totalResets: { $sum: "$resetCount" },
          totalStatusChanges: { $sum: "$statusChanges" }
        }
      }
    ]);

    // Get daily consumption breakdown
    const dailyStats = await Consumption.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            day: { $dayOfMonth: "$date" }
          },
          dailyConsumption: { $sum: "$dailyConsumption" },
          avgConsumption: { $avg: "$avgConsumption" },
          maxConsumption: { $max: "$maxConsumption" },
          minConsumption: { $min: "$minConsumption" },
          recordCount: { $sum: 1 },
          totalReadings: { $sum: "$totalReadings" }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
      { $limit: parseInt(count) || parseInt(days) || 30 }
    ]);

    res.status(200).json({
      period: { startDate, endDate, period: dateRange.period, count: dateRange.count },
      overallStats: stats[0] || {
        totalRecords: 0,
        avgDailyConsumption: 0,
        maxDailyConsumption: 0,
        minDailyConsumption: 0,
        totalDailyConsumption: 0,
        avgMaxConsumption: 0,
        avgMinConsumption: 0,
        avgFlowRate: 0,
        maxFlowRate: 0,
        minFlowRate: 0,
        totalReadings: 0,
        totalResets: 0,
        totalStatusChanges: 0
      },
      dailyStats
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getLatestConsumption = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get latest daily consumption for user
    const latestConsumption = await Consumption.findOne({ userId })
      .sort({ date: -1 })
      .lean();

    if (!latestConsumption) {
      return res.status(404).json({ error: "No consumption data found for this user" });
    }

    res.status(200).json(latestConsumption);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteConsumption = async (req, res) => {
  try {
    const consumptionId = req.params.id;

    const consumption = await Consumption.findByIdAndDelete(consumptionId);
    if (!consumption) {
      return res.status(404).json({ error: "Consumption record not found" });
    }

    res.status(200).json({ message: "Consumption record deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteOldConsumptions = async (req, res) => {
  try {
    const { days = 90 } = req.body; // Default to delete records older than 90 days

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const result = await Consumption.deleteMany({
      date: { $lt: cutoffDate }
    });

    res.status(200).json({
      message: `Deleted ${result.deletedCount} consumption records older than ${days} days`,
      deletedCount: result.deletedCount,
      cutoffDate
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get consumption data by user filtered by day, week, month, or year
 * Query params: userId (required), period (day/week/month/year), startDate (optional), endDate (optional)
 */
const getConsumptionByPeriod = async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = "day", startDate, endDate } = req.query;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate period
    const validPeriods = ["day", "week", "month", "year"];
    if (!validPeriods.includes(period.toLowerCase())) {
      return res.status(400).json({ 
        error: "Invalid period. Must be 'day', 'week', 'month', or 'year'" 
      });
    }

    // Calculate date range based on period
    let queryStartDate, queryEndDate;
    const now = new Date();

    if (startDate && endDate) {
      // Use provided date range
      queryStartDate = new Date(startDate);
      queryEndDate = new Date(endDate);
      queryStartDate.setHours(0, 0, 0, 0);
      queryEndDate.setHours(23, 59, 59, 999);
    } else {
      // Calculate based on period
      queryEndDate = new Date(now);
      queryEndDate.setHours(23, 59, 59, 999);
      queryStartDate = new Date(now);

      switch (period.toLowerCase()) {
        case "day":
          queryStartDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          queryStartDate.setDate(queryStartDate.getDate() - 7);
          queryStartDate.setHours(0, 0, 0, 0);
          break;
        case "month":
          queryStartDate.setMonth(queryStartDate.getMonth() - 1);
          queryStartDate.setHours(0, 0, 0, 0);
          break;
        case "year":
          queryStartDate.setFullYear(queryStartDate.getFullYear() - 1);
          queryStartDate.setHours(0, 0, 0, 0);
          break;
      }
    }

    // Build aggregation pipeline based on period
    let groupBy;
    switch (period.toLowerCase()) {
      case "day":
        groupBy = {
          year: { $year: "$date" },
          month: { $month: "$date" },
          day: { $dayOfMonth: "$date" },
        };
        break;
      case "week":
        groupBy = {
          year: { $year: "$date" },
          week: { $week: "$date" },
        };
        break;
      case "month":
        groupBy = {
          year: { $year: "$date" },
          month: { $month: "$date" },
        };
        break;
      case "year":
        groupBy = {
          year: { $year: "$date" },
        };
        break;
    }

    // Aggregate consumption data
    const consumptionData = await Consumption.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: {
            $gte: queryStartDate,
            $lte: queryEndDate,
          },
        },
      },
      {
        $group: {
          _id: groupBy,
          totalConsumption: { $sum: "$dailyConsumption" },
          avgConsumption: { $avg: "$avgConsumption" },
          maxConsumption: { $max: "$maxConsumption" },
          minConsumption: { $min: "$minConsumption" },
          avgFlowRate: { $avg: "$avgFlowRate" },
          maxFlowRate: { $max: "$maxFlowRate" },
          minFlowRate: { $min: "$minFlowRate" },
          totalReadings: { $sum: "$totalReadings" },
          resetCount: { $sum: "$resetCount" },
          statusChanges: { $sum: "$statusChanges" },
          firstDate: { $min: "$date" },
          lastDate: { $max: "$date" },
        },
      },
      {
        $sort: {
          "_id.year": -1,
          "_id.month": period === "day" ? -1 : period === "week" ? 1 : period === "year" ? 1 : -1,
          "_id.day": period === "day" ? -1 : 1,
          "_id.week": period === "week" ? -1 : 1,
        },
      },
    ]);

    // Format the response
    const formattedData = consumptionData.map((item) => {
      let dateLabel;
      if (period === "day") {
        dateLabel = `${item._id.year}-${String(item._id.month).padStart(2, "0")}-${String(item._id.day).padStart(2, "0")}`;
      } else if (period === "week") {
        dateLabel = `Week ${item._id.week}, ${item._id.year}`;
      } else if (period === "month") {
        dateLabel = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
      } else {
        dateLabel = `${item._id.year}`;
      }

      return {
        period: dateLabel,
        totalConsumption: item.totalConsumption,
        avgConsumption: parseFloat(item.avgConsumption.toFixed(2)),
        maxConsumption: item.maxConsumption,
        minConsumption: item.minConsumption,
        avgFlowRate: parseFloat(item.avgFlowRate.toFixed(2)),
        maxFlowRate: item.maxFlowRate,
        minFlowRate: item.minFlowRate,
        totalReadings: item.totalReadings,
        resetCount: item.resetCount,
        statusChanges: item.statusChanges,
        firstDate: item.firstDate,
        lastDate: item.lastDate,
      };
    });

    res.status(200).json({
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        roomNumber: user.roomNumber,
      },
      period: period.toLowerCase(),
      dateRange: {
        startDate: queryStartDate,
        endDate: queryEndDate,
      },
      data: formattedData,
      totalRecords: formattedData.length,
      message: formattedData.length === 0 ? "No consumption data found for the specified period." : null,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Professional analysis endpoint for consumption differences and trends
 * Query params: userId (required), comparePeriod (day/week/month/year), compareCount (optional, default 2)
 */
const getConsumptionAnalysis = async (req, res) => {
  try {
    const { userId } = req.params;
    const { comparePeriod = "day", compareCount = 2 } = req.query;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate period
    const validPeriods = ["day", "week", "month", "year"];
    if (!validPeriods.includes(comparePeriod.toLowerCase())) {
      return res.status(400).json({ 
        error: "Invalid comparePeriod. Must be 'day', 'week', 'month', or 'year'" 
      });
    }

    const count = parseInt(compareCount) || 2;
    const maxCount = comparePeriod === "year" ? 10 : comparePeriod === "month" ? 24 : comparePeriod === "week" ? 52 : 30;
    if (count < 2 || count > maxCount) {
      return res.status(400).json({ 
        error: `compareCount must be between 2 and ${maxCount} for ${comparePeriod} period` 
      });
    }

    // Calculate date ranges for comparison
    const now = new Date();
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    let startDate = new Date(now);
    switch (comparePeriod.toLowerCase()) {
      case "day":
        startDate.setDate(startDate.getDate() - count);
        break;
      case "week":
        startDate.setDate(startDate.getDate() - (count * 7));
        break;
      case "month":
        startDate.setMonth(startDate.getMonth() - count);
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - count);
        break;
    }
    startDate.setHours(0, 0, 0, 0);

    // Build group by based on period
    let groupBy;
    switch (comparePeriod.toLowerCase()) {
      case "day":
        groupBy = {
          year: { $year: "$date" },
          month: { $month: "$date" },
          day: { $dayOfMonth: "$date" },
        };
        break;
      case "week":
        groupBy = {
          year: { $year: "$date" },
          week: { $week: "$date" },
        };
        break;
      case "month":
        groupBy = {
          year: { $year: "$date" },
          month: { $month: "$date" },
        };
        break;
      case "year":
        groupBy = {
          year: { $year: "$date" },
        };
        break;
    }

    // Aggregate consumption data
    const consumptionData = await Consumption.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: groupBy,
          totalConsumption: { $sum: "$dailyConsumption" },
          avgConsumption: { $avg: "$avgConsumption" },
          maxConsumption: { $max: "$maxConsumption" },
          minConsumption: { $min: "$minConsumption" },
          avgFlowRate: { $avg: "$avgFlowRate" },
          maxFlowRate: { $max: "$maxFlowRate" },
          minFlowRate: { $min: "$minFlowRate" },
          totalReadings: { $sum: "$totalReadings" },
          resetCount: { $sum: "$resetCount" },
          firstDate: { $min: "$date" },
          lastDate: { $max: "$date" },
        },
      },
      {
        $sort: {
          "_id.year": -1,
          "_id.month": comparePeriod === "day" ? -1 : comparePeriod === "week" ? 1 : comparePeriod === "year" ? 1 : -1,
          "_id.day": comparePeriod === "day" ? -1 : 1,
          "_id.week": comparePeriod === "week" ? -1 : 1,
        },
      },
      { $limit: count },
    ]);

    // Handle case when there's no data or insufficient data
    if (consumptionData.length === 0) {
      return res.status(200).json({
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          roomNumber: user.roomNumber,
        },
        period: comparePeriod.toLowerCase(),
        dateRange: {
          startDate: startDate,
          endDate: endDate,
        },
        periods: [],
        comparisons: [],
        statistics: {
          descriptive: {
            overallAvgConsumption: 0,
            overallTotalConsumption: 0,
            maxConsumption: 0,
            minConsumption: 0,
            consumptionRange: 0,
            medianConsumption: 0,
            overallAvgFlowRate: 0,
            maxFlowRate: 0,
            minFlowRate: 0,
            totalReadings: 0,
            avgReadingsPerPeriod: 0,
          },
          variability: {
            consumptionStandardDeviation: 0,
            consumptionVariance: 0,
            coefficientOfVariation: 0,
            avgConsumptionStandardDeviation: 0,
            flowRateStandardDeviation: 0,
          },
          trend: {
            direction: "stable",
            slope: 0,
            intercept: 0,
            magnitude: 0,
            totalGrowthPercent: 0,
            cagr: null,
          },
          patterns: {
            peaks: [],
            valleys: [],
            movingAverages: {
              threePeriod: [],
              fivePeriod: [],
            },
            consumptionPattern: {
              isIncreasing: false,
              isDecreasing: false,
              isStable: true,
              volatility: "low",
              consistency: "high",
            },
          },
          anomalies: [],
          efficiency: {
            overallEfficiency: 0,
            avgEfficiencyPerPeriod: [],
          },
        },
        message: "No consumption data available for analysis. Data will be available after daily consumption records are created.",
      });
    }

    if (consumptionData.length < 2) {
      // Return available data with a message indicating insufficient data for comparison
      const formattedData = consumptionData.map((item, index) => {
        let dateLabel;
        if (comparePeriod === "day") {
          dateLabel = `${item._id.year}-${String(item._id.month).padStart(2, "0")}-${String(item._id.day).padStart(2, "0")}`;
        } else if (comparePeriod === "week") {
          dateLabel = `Week ${item._id.week}, ${item._id.year}`;
        } else if (comparePeriod === "month") {
          dateLabel = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
        } else {
          dateLabel = `${item._id.year}`;
        }

        return {
          period: dateLabel,
          totalConsumption: item.totalConsumption,
          avgConsumption: parseFloat(item.avgConsumption.toFixed(2)),
          maxConsumption: item.maxConsumption,
          minConsumption: item.minConsumption,
          avgFlowRate: parseFloat(item.avgFlowRate.toFixed(2)),
          maxFlowRate: item.maxFlowRate,
          minFlowRate: item.minFlowRate,
          totalReadings: item.totalReadings,
          resetCount: item.resetCount,
          firstDate: item.firstDate,
          lastDate: item.lastDate,
        };
      });

      return res.status(200).json({
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          roomNumber: user.roomNumber,
        },
        period: comparePeriod.toLowerCase(),
        dateRange: {
          startDate: startDate,
          endDate: endDate,
        },
        periods: formattedData,
        comparisons: [],
        statistics: {
          descriptive: {
            overallAvgConsumption: parseFloat((formattedData[0].avgConsumption || 0).toFixed(2)),
            overallTotalConsumption: parseFloat((formattedData[0].totalConsumption || 0).toFixed(2)),
            maxConsumption: formattedData[0].maxConsumption || 0,
            minConsumption: formattedData[0].minConsumption || 0,
            consumptionRange: parseFloat(((formattedData[0].maxConsumption || 0) - (formattedData[0].minConsumption || 0)).toFixed(2)),
            medianConsumption: parseFloat((formattedData[0].totalConsumption || 0).toFixed(2)),
            overallAvgFlowRate: parseFloat((formattedData[0].avgFlowRate || 0).toFixed(2)),
            maxFlowRate: formattedData[0].maxFlowRate || 0,
            minFlowRate: formattedData[0].minFlowRate || 0,
            totalReadings: formattedData[0].totalReadings || 0,
            avgReadingsPerPeriod: parseFloat((formattedData[0].totalReadings || 0).toFixed(2)),
          },
          variability: {
            consumptionStandardDeviation: 0,
            consumptionVariance: 0,
            coefficientOfVariation: 0,
            avgConsumptionStandardDeviation: 0,
            flowRateStandardDeviation: 0,
          },
          trend: {
            direction: "stable",
            slope: 0,
            intercept: 0,
            magnitude: 0,
            totalGrowthPercent: 0,
            cagr: null,
          },
          patterns: {
            peaks: [],
            valleys: [],
            movingAverages: {
              threePeriod: [],
              fivePeriod: [],
            },
            consumptionPattern: {
              isIncreasing: false,
              isDecreasing: false,
              isStable: true,
              volatility: "low",
              consistency: "high",
            },
          },
          anomalies: [],
          efficiency: {
            overallEfficiency: formattedData[0].totalReadings > 0 
              ? parseFloat((formattedData[0].totalConsumption / formattedData[0].totalReadings).toFixed(4))
              : 0,
            avgEfficiencyPerPeriod: formattedData.map(d => ({
              period: d.period,
              efficiency: d.totalReadings > 0 
                ? parseFloat((d.totalConsumption / d.totalReadings).toFixed(4))
                : 0
            })),
          },
        },
        message: "Insufficient data for comparison. Need at least 2 periods of data. Currently showing available data.",
      });
    }

    // Format and calculate differences
    const formattedData = consumptionData.map((item, index) => {
      let dateLabel;
      if (comparePeriod === "day") {
        dateLabel = `${item._id.year}-${String(item._id.month).padStart(2, "0")}-${String(item._id.day).padStart(2, "0")}`;
      } else if (comparePeriod === "week") {
        dateLabel = `Week ${item._id.week}, ${item._id.year}`;
      } else if (comparePeriod === "month") {
        dateLabel = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
      } else {
        dateLabel = `${item._id.year}`;
      }

      return {
        period: dateLabel,
        totalConsumption: item.totalConsumption,
        avgConsumption: parseFloat(item.avgConsumption.toFixed(2)),
        maxConsumption: item.maxConsumption,
        minConsumption: item.minConsumption,
        avgFlowRate: parseFloat(item.avgFlowRate.toFixed(2)),
        maxFlowRate: item.maxFlowRate,
        minFlowRate: item.minFlowRate,
        totalReadings: item.totalReadings,
        resetCount: item.resetCount,
        firstDate: item.firstDate,
        lastDate: item.lastDate,
      };
    });

    // Helper function to calculate standard deviation
    const calculateStdDev = (values, mean) => {
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      return Math.sqrt(variance);
    };

    // Helper function to calculate linear regression (trend line)
    const calculateLinearRegression = (data) => {
      const n = data.length;
      const x = data.map((_, i) => i + 1);
      const y = data.map(d => d.totalConsumption);
      
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
      const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      return { slope, intercept, rSquared: 0 };
    };

    // Calculate differences between periods with enhanced metrics
    const comparisons = [];
    for (let i = 0; i < formattedData.length - 1; i++) {
      const current = formattedData[i];
      const previous = formattedData[i + 1];

      const consumptionDiff = current.totalConsumption - previous.totalConsumption;
      const avgConsumptionDiff = current.avgConsumption - previous.avgConsumption;
      const avgFlowRateDiff = current.avgFlowRate - previous.avgFlowRate;
      const maxConsumptionDiff = current.maxConsumption - previous.maxConsumption;
      const minConsumptionDiff = current.minConsumption - previous.minConsumption;
      const readingDiff = current.totalReadings - previous.totalReadings;
      const resetDiff = current.resetCount - previous.resetCount;

      const consumptionPercentChange = previous.totalConsumption !== 0
        ? parseFloat(((consumptionDiff / previous.totalConsumption) * 100).toFixed(2))
        : 0;

      const avgConsumptionPercentChange = previous.avgConsumption !== 0
        ? parseFloat(((avgConsumptionDiff / previous.avgConsumption) * 100).toFixed(2))
        : 0;

      const avgFlowRatePercentChange = previous.avgFlowRate !== 0
        ? parseFloat(((avgFlowRateDiff / previous.avgFlowRate) * 100).toFixed(2))
        : 0;

      // Calculate efficiency (consumption per reading)
      const currentEfficiency = current.totalReadings > 0 
        ? current.totalConsumption / current.totalReadings 
        : 0;
      const previousEfficiency = previous.totalReadings > 0 
        ? previous.totalConsumption / previous.totalReadings 
        : 0;
      const efficiencyDiff = currentEfficiency - previousEfficiency;

      comparisons.push({
        fromPeriod: previous.period,
        toPeriod: current.period,
        consumptionDifference: parseFloat(consumptionDiff.toFixed(2)),
        consumptionPercentChange: consumptionPercentChange,
        avgConsumptionDifference: parseFloat(avgConsumptionDiff.toFixed(2)),
        avgConsumptionPercentChange: avgConsumptionPercentChange,
        avgFlowRateDifference: parseFloat(avgFlowRateDiff.toFixed(2)),
        avgFlowRatePercentChange: avgFlowRatePercentChange,
        maxConsumptionDifference: parseFloat(maxConsumptionDiff.toFixed(2)),
        minConsumptionDifference: parseFloat(minConsumptionDiff.toFixed(2)),
        readingCountDifference: readingDiff,
        resetCountDifference: resetDiff,
        efficiencyDifference: parseFloat(efficiencyDiff.toFixed(4)),
        currentEfficiency: parseFloat(currentEfficiency.toFixed(4)),
        previousEfficiency: parseFloat(previousEfficiency.toFixed(4)),
        trend: consumptionDiff > 0 ? "increasing" : consumptionDiff < 0 ? "decreasing" : "stable",
        trendStrength: Math.abs(consumptionPercentChange) > 10 ? "strong" : Math.abs(consumptionPercentChange) > 5 ? "moderate" : "weak",
      });
    }

    // Calculate comprehensive overall statistics
    const totalConsumptions = formattedData.map(d => d.totalConsumption);
    const avgConsumptions = formattedData.map(d => d.avgConsumption);
    const flowRates = formattedData.map(d => d.avgFlowRate);
    const maxConsumptions = formattedData.map(d => d.maxConsumption);
    const minConsumptions = formattedData.map(d => d.minConsumption);
    const readingCounts = formattedData.map(d => d.totalReadings);

    const overallAvgConsumption = avgConsumptions.reduce((a, b) => a + b, 0) / avgConsumptions.length;
    const overallTotalConsumption = totalConsumptions.reduce((a, b) => a + b, 0);
    const overallAvgFlowRate = flowRates.reduce((a, b) => a + b, 0) / flowRates.length;
    const maxConsumption = Math.max(...totalConsumptions);
    const minConsumption = Math.min(...totalConsumptions);
    const maxFlowRate = Math.max(...flowRates);
    const minFlowRate = Math.min(...flowRates);
    const totalReadings = readingCounts.reduce((a, b) => a + b, 0);
    const avgReadings = readingCounts.reduce((a, b) => a + b, 0) / readingCounts.length;

    // Calculate standard deviations
    const consumptionStdDev = totalConsumptions.length > 1 
      ? calculateStdDev(totalConsumptions, overallAvgConsumption)
      : 0;
    const avgConsumptionStdDev = avgConsumptions.length > 1
      ? calculateStdDev(avgConsumptions, overallAvgConsumption)
      : 0;
    const flowRateStdDev = flowRates.length > 1
      ? calculateStdDev(flowRates, overallAvgFlowRate)
      : 0;

    // Calculate coefficient of variation (CV) - relative variability
    const consumptionCV = overallAvgConsumption !== 0 
      ? parseFloat(((consumptionStdDev / overallAvgConsumption) * 100).toFixed(2))
      : 0;

    // Calculate variance
    const consumptionVariance = parseFloat(
      (totalConsumptions.reduce((sum, val) => sum + Math.pow(val - overallAvgConsumption, 2), 0) / totalConsumptions.length).toFixed(2)
    );

    // Calculate linear regression for trend analysis
    const regression = calculateLinearRegression(formattedData);
    const trendDirection = regression.slope > 0 ? "increasing" : regression.slope < 0 ? "decreasing" : "stable";
    const trendMagnitude = Math.abs(regression.slope);

    // Detect peaks and valleys
    const peaks = [];
    const valleys = [];
    for (let i = 1; i < totalConsumptions.length - 1; i++) {
      if (totalConsumptions[i] > totalConsumptions[i - 1] && totalConsumptions[i] > totalConsumptions[i + 1]) {
        peaks.push({
          period: formattedData[i].period,
          value: totalConsumptions[i],
          index: i
        });
      }
      if (totalConsumptions[i] < totalConsumptions[i - 1] && totalConsumptions[i] < totalConsumptions[i + 1]) {
        valleys.push({
          period: formattedData[i].period,
          value: totalConsumptions[i],
          index: i
        });
      }
    }

    // Calculate growth rates
    const firstPeriod = formattedData[formattedData.length - 1];
    const lastPeriod = formattedData[0];
    const totalGrowth = firstPeriod.totalConsumption !== 0
      ? parseFloat((((lastPeriod.totalConsumption - firstPeriod.totalConsumption) / firstPeriod.totalConsumption) * 100).toFixed(2))
      : 0;

    // Calculate CAGR (Compound Annual Growth Rate) if we have year data
    let cagr = null;
    if (comparePeriod === "year" && formattedData.length >= 2) {
      const years = formattedData.length - 1;
      const endValue = lastPeriod.totalConsumption;
      const startValue = firstPeriod.totalConsumption;
      if (startValue > 0) {
        cagr = parseFloat((((Math.pow(endValue / startValue, 1 / years) - 1) * 100).toFixed(2)));
      }
    }

    // Calculate moving averages (3-period and 5-period if enough data)
    const movingAverages = {
      threePeriod: [],
      fivePeriod: []
    };
    if (formattedData.length >= 3) {
      for (let i = 2; i < formattedData.length; i++) {
        const avg = (totalConsumptions[i] + totalConsumptions[i - 1] + totalConsumptions[i - 2]) / 3;
        movingAverages.threePeriod.push({
          period: formattedData[i].period,
          value: parseFloat(avg.toFixed(2))
        });
      }
    }
    if (formattedData.length >= 5) {
      for (let i = 4; i < formattedData.length; i++) {
        const avg = (totalConsumptions[i] + totalConsumptions[i - 1] + totalConsumptions[i - 2] + 
                    totalConsumptions[i - 3] + totalConsumptions[i - 4]) / 5;
        movingAverages.fivePeriod.push({
          period: formattedData[i].period,
          value: parseFloat(avg.toFixed(2))
        });
      }
    }

    // Anomaly detection (values more than 2 standard deviations from mean)
    const anomalies = consumptionStdDev > 0
      ? formattedData.filter((item, index) => {
          const zScore = Math.abs((item.totalConsumption - overallAvgConsumption) / consumptionStdDev);
          return zScore > 2;
        }).map(item => ({
          period: item.period,
          consumption: item.totalConsumption,
          deviation: parseFloat((item.totalConsumption - overallAvgConsumption).toFixed(2)),
          zScore: parseFloat((Math.abs(item.totalConsumption - overallAvgConsumption) / consumptionStdDev).toFixed(2))
        }))
      : [];

    // Calculate consumption patterns
    const consumptionPattern = {
      isIncreasing: regression.slope > 0,
      isDecreasing: regression.slope < 0,
      isStable: Math.abs(regression.slope) < 0.1,
      volatility: consumptionCV > 20 ? "high" : consumptionCV > 10 ? "moderate" : "low",
      consistency: consumptionStdDev < (overallAvgConsumption * 0.1) ? "high" : consumptionStdDev < (overallAvgConsumption * 0.2) ? "moderate" : "low"
    };

    res.status(200).json({
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        roomNumber: user.roomNumber,
      },
      period: comparePeriod.toLowerCase(),
      dateRange: {
        startDate: startDate,
        endDate: endDate,
      },
      periods: formattedData,
      comparisons: comparisons,
      statistics: {
        descriptive: {
          overallAvgConsumption: parseFloat(overallAvgConsumption.toFixed(2)),
          overallTotalConsumption: parseFloat(overallTotalConsumption.toFixed(2)),
          maxConsumption: maxConsumption,
          minConsumption: minConsumption,
          consumptionRange: parseFloat((maxConsumption - minConsumption).toFixed(2)),
          medianConsumption: totalConsumptions.length > 0
            ? parseFloat([...totalConsumptions].sort((a, b) => a - b)[Math.floor(totalConsumptions.length / 2)].toFixed(2))
            : 0,
          overallAvgFlowRate: parseFloat(overallAvgFlowRate.toFixed(2)),
          maxFlowRate: maxFlowRate,
          minFlowRate: minFlowRate,
          totalReadings: totalReadings,
          avgReadingsPerPeriod: parseFloat(avgReadings.toFixed(2)),
        },
        variability: {
          consumptionStandardDeviation: parseFloat(consumptionStdDev.toFixed(2)),
          consumptionVariance: consumptionVariance,
          coefficientOfVariation: consumptionCV,
          avgConsumptionStandardDeviation: parseFloat(avgConsumptionStdDev.toFixed(2)),
          flowRateStandardDeviation: parseFloat(flowRateStdDev.toFixed(2)),
        },
        trend: {
          direction: trendDirection,
          slope: parseFloat(regression.slope.toFixed(4)),
          intercept: parseFloat(regression.intercept.toFixed(2)),
          magnitude: parseFloat(trendMagnitude.toFixed(2)),
          totalGrowthPercent: totalGrowth,
          cagr: cagr,
        },
        patterns: {
          peaks: peaks,
          valleys: valleys,
          movingAverages: movingAverages,
          consumptionPattern: consumptionPattern,
        },
        anomalies: anomalies,
        efficiency: {
          overallEfficiency: totalReadings > 0 
            ? parseFloat((overallTotalConsumption / totalReadings).toFixed(4))
            : 0,
          avgEfficiencyPerPeriod: formattedData.map(d => ({
            period: d.period,
            efficiency: d.totalReadings > 0 
              ? parseFloat((d.totalConsumption / d.totalReadings).toFixed(4))
              : 0
          })),
        },
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Enhanced GetConsumptionByPeriod with advanced filtering and export options
 */
const getConsumptionByPeriodEnhanced = async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      period = "day", 
      startDate, 
      endDate,
      groupBy = "auto",
      includeProjections = false,
      exportFormat = "json"
    } = req.query;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate period
    const validPeriods = ["day", "week", "month", "year", "hour", "quarter"];
    if (!validPeriods.includes(period.toLowerCase())) {
      return res.status(400).json({ 
        error: "Invalid period. Must be 'day', 'week', 'month', 'year', 'hour', or 'quarter'" 
      });
    }

    // Calculate date range
    let queryStartDate, queryEndDate;
    const now = new Date();

    if (startDate && endDate) {
      queryStartDate = new Date(startDate);
      queryEndDate = new Date(endDate);
      queryStartDate.setHours(0, 0, 0, 0);
      queryEndDate.setHours(23, 59, 59, 999);
    } else {
      queryEndDate = new Date(now);
      queryEndDate.setHours(23, 59, 59, 999);
      queryStartDate = new Date(now);

      switch (period.toLowerCase()) {
        case "hour":
          queryStartDate.setHours(queryStartDate.getHours() - 24);
          break;
        case "day":
          queryStartDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          queryStartDate.setDate(queryStartDate.getDate() - 7);
          queryStartDate.setHours(0, 0, 0, 0);
          break;
        case "month":
          queryStartDate.setMonth(queryStartDate.getMonth() - 1);
          queryStartDate.setHours(0, 0, 0, 0);
          break;
        case "quarter":
          queryStartDate.setMonth(queryStartDate.getMonth() - 3);
          queryStartDate.setHours(0, 0, 0, 0);
          break;
        case "year":
          queryStartDate.setFullYear(queryStartDate.getFullYear() - 1);
          queryStartDate.setHours(0, 0, 0, 0);
          break;
      }
    }

    // Build group by based on period
    let groupByField;
    switch (period.toLowerCase()) {
      case "hour":
        groupByField = {
          year: { $year: "$date" },
          month: { $month: "$date" },
          day: { $dayOfMonth: "$date" },
          hour: { $hour: "$date" },
        };
        break;
      case "day":
        groupByField = {
          year: { $year: "$date" },
          month: { $month: "$date" },
          day: { $dayOfMonth: "$date" },
        };
        break;
      case "week":
        groupByField = {
          year: { $year: "$date" },
          week: { $week: "$date" },
        };
        break;
      case "month":
        groupByField = {
          year: { $year: "$date" },
          month: { $month: "$date" },
        };
        break;
      case "quarter":
        groupByField = {
          year: { $year: "$date" },
          quarter: { $ceil: { $divide: [{ $month: "$date" }, 3] } },
        };
        break;
      case "year":
        groupByField = {
          year: { $year: "$date" },
        };
        break;
    }

    // Aggregate consumption data
    const consumptionData = await Consumption.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: {
            $gte: queryStartDate,
            $lte: queryEndDate,
          },
        },
      },
      {
        $group: {
          _id: groupByField,
          totalConsumption: { $sum: "$dailyConsumption" },
          avgConsumption: { $avg: "$avgConsumption" },
          maxConsumption: { $max: "$maxConsumption" },
          minConsumption: { $min: "$minConsumption" },
          avgFlowRate: { $avg: "$avgFlowRate" },
          maxFlowRate: { $max: "$maxFlowRate" },
          minFlowRate: { $min: "$minFlowRate" },
          totalReadings: { $sum: "$totalReadings" },
          resetCount: { $sum: "$resetCount" },
          statusChanges: { $sum: "$statusChanges" },
          firstDate: { $min: "$date" },
          lastDate: { $max: "$date" },
          recordCount: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": -1,
          "_id.quarter": period === "quarter" ? -1 : 1,
          "_id.month": period === "day" || period === "month" ? -1 : period === "week" ? 1 : period === "year" ? 1 : -1,
          "_id.day": period === "day" || period === "hour" ? -1 : 1,
          "_id.hour": period === "hour" ? -1 : 1,
          "_id.week": period === "week" ? -1 : 1,
        },
      },
    ]);

    // Handle no data case
    if (consumptionData.length === 0) {
      return res.status(200).json({
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          roomNumber: user.roomNumber,
        },
        period: period.toLowerCase(),
        dateRange: {
          startDate: queryStartDate,
          endDate: queryEndDate,
        },
        data: [],
        summary: {
          totalPeriods: 0,
          totalConsumption: 0,
          avgConsumptionPerPeriod: 0,
          maxPeriod: null,
          minPeriod: null,
        },
        projections: null,
        totalRecords: 0,
        hasData: false,
        message: "No consumption data available for this period. Data will appear once water consumption records are created.",
        metadata: {
          generatedAt: new Date(),
          exportFormat,
          groupBy,
        },
      });
    }

    // Format the response
    const formattedData = consumptionData.map((item) => {
      let dateLabel;
      if (period === "hour") {
        dateLabel = `${item._id.year}-${String(item._id.month).padStart(2, "0")}-${String(item._id.day).padStart(2, "0")} ${String(item._id.hour).padStart(2, "0")}:00`;
      } else if (period === "day") {
        dateLabel = `${item._id.year}-${String(item._id.month).padStart(2, "0")}-${String(item._id.day).padStart(2, "0")}`;
      } else if (period === "week") {
        dateLabel = `Week ${item._id.week}, ${item._id.year}`;
      } else if (period === "month") {
        dateLabel = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
      } else if (period === "quarter") {
        dateLabel = `Q${item._id.quarter} ${item._id.year}`;
      } else {
        dateLabel = `${item._id.year}`;
      }

      return {
        period: dateLabel,
        totalConsumption: parseFloat(item.totalConsumption.toFixed(2)),
        avgConsumption: parseFloat(item.avgConsumption.toFixed(2)),
        maxConsumption: item.maxConsumption,
        minConsumption: item.minConsumption,
        avgFlowRate: parseFloat(item.avgFlowRate.toFixed(2)),
        maxFlowRate: item.maxFlowRate,
        minFlowRate: item.minFlowRate || 0,
        totalReadings: item.totalReadings,
        resetCount: item.resetCount,
        statusChanges: item.statusChanges,
        recordCount: item.recordCount,
        firstDate: item.firstDate,
        lastDate: item.lastDate,
        efficiency: item.totalReadings > 0 
          ? parseFloat((item.totalConsumption / item.totalReadings).toFixed(4))
          : 0,
      };
    });

    // Calculate projections if requested
    let projections = null;
    if (includeProjections === "true" && formattedData.length >= 3) {
      const recentData = formattedData.slice(0, 3).map(d => d.totalConsumption);
      const avgGrowth = (recentData[0] - recentData[recentData.length - 1]) / recentData.length;
      const projectedValue = formattedData[0].totalConsumption + avgGrowth;
      
      projections = {
        nextPeriod: parseFloat(projectedValue.toFixed(2)),
        growthRate: parseFloat((avgGrowth > 0 ? (avgGrowth / recentData[recentData.length - 1]) * 100 : 0).toFixed(2)),
        confidence: formattedData.length >= 7 ? "high" : formattedData.length >= 4 ? "medium" : "low",
      };
    }

    // Calculate summary statistics
    const summary = {
      totalPeriods: formattedData.length,
      totalConsumption: parseFloat(formattedData.reduce((sum, d) => sum + d.totalConsumption, 0).toFixed(2)),
      avgConsumptionPerPeriod: formattedData.length > 0
        ? parseFloat((formattedData.reduce((sum, d) => sum + d.totalConsumption, 0) / formattedData.length).toFixed(2))
        : 0,
      maxPeriod: formattedData.length > 0 
        ? formattedData.reduce((max, d) => d.totalConsumption > max.totalConsumption ? d : max, formattedData[0])
        : null,
      minPeriod: formattedData.length > 0
        ? formattedData.reduce((min, d) => d.totalConsumption < min.totalConsumption ? d : min, formattedData[0])
        : null,
    };

    res.status(200).json({
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        roomNumber: user.roomNumber,
      },
      period: period.toLowerCase(),
      dateRange: {
        startDate: queryStartDate,
        endDate: queryEndDate,
      },
      data: formattedData,
      summary,
      projections,
      totalRecords: formattedData.length,
      hasData: true,
      message: formattedData.length > 0 ? null : "No consumption data available for this period.",
      metadata: {
        generatedAt: new Date(),
        exportFormat,
        groupBy,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Enhanced GetConsumptionAnalysis with advanced statistical methods
 */
const getConsumptionAnalysisEnhanced = async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      comparePeriod = "day", 
      compareCount = 2,
      includeForecast = false,
      includeSeasonality = false,
      statisticalLevel = "advanced"
    } = req.query;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate period
    const validPeriods = ["day", "week", "month", "year"];
    if (!validPeriods.includes(comparePeriod.toLowerCase())) {
      return res.status(400).json({ 
        error: "Invalid comparePeriod. Must be 'day', 'week', 'month', or 'year'" 
      });
    }

    const count = parseInt(compareCount) || 2;
    const maxCount = comparePeriod === "year" ? 10 : comparePeriod === "month" ? 24 : comparePeriod === "week" ? 52 : 30;
    if (count < 2 || count > maxCount) {
      return res.status(400).json({ 
        error: `compareCount must be between 2 and ${maxCount} for ${comparePeriod} period` 
      });
    }

    // Calculate date ranges
    const now = new Date();
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    let startDate = new Date(now);
    switch (comparePeriod.toLowerCase()) {
      case "day":
        startDate.setDate(startDate.getDate() - count);
        break;
      case "week":
        startDate.setDate(startDate.getDate() - (count * 7));
        break;
      case "month":
        startDate.setMonth(startDate.getMonth() - count);
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - count);
        break;
    }
    startDate.setHours(0, 0, 0, 0);

    // Build group by
    let groupBy;
    switch (comparePeriod.toLowerCase()) {
      case "day":
        groupBy = {
          year: { $year: "$date" },
          month: { $month: "$date" },
          day: { $dayOfMonth: "$date" },
        };
        break;
      case "week":
        groupBy = {
          year: { $year: "$date" },
          week: { $week: "$date" },
        };
        break;
      case "month":
        groupBy = {
          year: { $year: "$date" },
          month: { $month: "$date" },
        };
        break;
      case "year":
        groupBy = {
          year: { $year: "$date" },
        };
        break;
    }

    // Aggregate consumption data
    const consumptionData = await Consumption.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: groupBy,
          totalConsumption: { $sum: "$dailyConsumption" },
          avgConsumption: { $avg: "$avgConsumption" },
          maxConsumption: { $max: "$maxConsumption" },
          minConsumption: { $min: "$minConsumption" },
          avgFlowRate: { $avg: "$avgFlowRate" },
          maxFlowRate: { $max: "$maxFlowRate" },
          minFlowRate: { $min: "$minFlowRate" },
          totalReadings: { $sum: "$totalReadings" },
          resetCount: { $sum: "$resetCount" },
          firstDate: { $min: "$date" },
          lastDate: { $max: "$date" },
        },
      },
      {
        $sort: {
          "_id.year": -1,
          "_id.month": comparePeriod === "day" ? -1 : comparePeriod === "week" ? 1 : comparePeriod === "year" ? 1 : -1,
          "_id.day": comparePeriod === "day" ? -1 : 1,
          "_id.week": comparePeriod === "week" ? -1 : 1,
        },
      },
      { $limit: count },
    ]);

    if (consumptionData.length === 0) {
      return res.status(200).json({
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          roomNumber: user.roomNumber,
        },
        period: comparePeriod.toLowerCase(),
        dateRange: { startDate, endDate },
        periods: [],
        comparisons: [],
        statistics: {
          descriptive: {
            overallAvgConsumption: 0,
            consumptionStandardDeviation: 0,
            coefficientOfVariation: 0,
          },
          trend: {
            direction: "stable",
            slope: 0,
            intercept: 0,
            rSquared: 0,
          },
          forecast: null,
          seasonality: null,
        },
        hasData: false,
        message: "No consumption data available for analysis. Data will appear once water consumption records are created for this user.",
      });
    }

    // Format data
    const formattedData = consumptionData.map((item) => {
      let dateLabel;
      if (comparePeriod === "day") {
        dateLabel = `${item._id.year}-${String(item._id.month).padStart(2, "0")}-${String(item._id.day).padStart(2, "0")}`;
      } else if (comparePeriod === "week") {
        dateLabel = `Week ${item._id.week}, ${item._id.year}`;
      } else if (comparePeriod === "month") {
        dateLabel = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
      } else {
        dateLabel = `${item._id.year}`;
      }

      return {
        period: dateLabel,
        totalConsumption: item.totalConsumption,
        avgConsumption: parseFloat(item.avgConsumption.toFixed(2)),
        maxConsumption: item.maxConsumption,
        minConsumption: item.minConsumption,
        avgFlowRate: parseFloat(item.avgFlowRate.toFixed(2)),
        maxFlowRate: item.maxFlowRate,
        minFlowRate: item.minFlowRate,
        totalReadings: item.totalReadings,
        resetCount: item.resetCount,
        firstDate: item.firstDate,
        lastDate: item.lastDate,
      };
    });

    // Enhanced calculations (reuse existing logic from getConsumptionAnalysis)
    const calculateStdDev = (values, mean) => {
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      return Math.sqrt(variance);
    };

    const calculateLinearRegression = (data) => {
      const n = data.length;
      const x = data.map((_, i) => i + 1);
      const y = data.map(d => d.totalConsumption);
      
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
      const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      // Calculate R-squared
      const yMean = sumY / n;
      const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - (slope * x[i] + intercept), 2), 0);
      const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
      const rSquared = 1 - (ssRes / ssTot);
      
      return { slope, intercept, rSquared };
    };

    // Calculate comparisons
    const comparisons = [];
    for (let i = 0; i < formattedData.length - 1; i++) {
      const current = formattedData[i];
      const previous = formattedData[i + 1];

      const consumptionDiff = current.totalConsumption - previous.totalConsumption;
      const consumptionPercentChange = previous.totalConsumption !== 0
        ? parseFloat(((consumptionDiff / previous.totalConsumption) * 100).toFixed(2))
        : 0;

      comparisons.push({
        fromPeriod: previous.period,
        toPeriod: current.period,
        consumptionDifference: parseFloat(consumptionDiff.toFixed(2)),
        consumptionPercentChange: consumptionPercentChange,
        trend: consumptionDiff > 0 ? "increasing" : consumptionDiff < 0 ? "decreasing" : "stable",
        trendStrength: Math.abs(consumptionPercentChange) > 10 ? "strong" : Math.abs(consumptionPercentChange) > 5 ? "moderate" : "weak",
      });
    }

    // Calculate statistics
    const totalConsumptions = formattedData.map(d => d.totalConsumption);
    const overallAvgConsumption = totalConsumptions.reduce((a, b) => a + b, 0) / totalConsumptions.length;
    const consumptionStdDev = totalConsumptions.length > 1 
      ? calculateStdDev(totalConsumptions, overallAvgConsumption)
      : 0;

    const regression = calculateLinearRegression(formattedData);
    const trendDirection = regression.slope > 0 ? "increasing" : regression.slope < 0 ? "decreasing" : "stable";

    // Forecast calculation
    let forecast = null;
    if (includeForecast === "true" && formattedData.length >= 3) {
      const nextPeriodValue = regression.slope * (formattedData.length + 1) + regression.intercept;
      forecast = {
        nextPeriod: parseFloat(nextPeriodValue.toFixed(2)),
        confidence: regression.rSquared > 0.7 ? "high" : regression.rSquared > 0.4 ? "medium" : "low",
        rSquared: parseFloat(regression.rSquared.toFixed(4)),
      };
    }

    // Seasonality analysis
    let seasonality = null;
    if (includeSeasonality === "true" && formattedData.length >= 4) {
      const seasonalPattern = [];
      const periodLength = comparePeriod === "day" ? 7 : comparePeriod === "week" ? 4 : comparePeriod === "month" ? 12 : 1;
      
      for (let i = 0; i < Math.min(periodLength, formattedData.length); i++) {
        seasonalPattern.push({
          position: i + 1,
          avgConsumption: formattedData[i]?.totalConsumption || 0,
        });
      }
      
      seasonality = {
        pattern: seasonalPattern,
        hasSeasonality: consumptionStdDev > overallAvgConsumption * 0.2,
        strength: consumptionStdDev > overallAvgConsumption * 0.3 ? "strong" : "moderate",
      };
    }

    res.status(200).json({
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        roomNumber: user.roomNumber,
      },
      period: comparePeriod.toLowerCase(),
      dateRange: { startDate, endDate },
      periods: formattedData,
      comparisons,
      statistics: {
        descriptive: {
          overallAvgConsumption: parseFloat(overallAvgConsumption.toFixed(2)),
          consumptionStandardDeviation: parseFloat(consumptionStdDev.toFixed(2)),
          coefficientOfVariation: overallAvgConsumption !== 0 
            ? parseFloat(((consumptionStdDev / overallAvgConsumption) * 100).toFixed(2))
            : 0,
        },
        trend: {
          direction: trendDirection,
          slope: parseFloat(regression.slope.toFixed(4)),
          intercept: parseFloat(regression.intercept.toFixed(2)),
          rSquared: parseFloat(regression.rSquared.toFixed(4)),
        },
        forecast,
        seasonality,
      },
      hasData: true,
      message: null,
      metadata: {
        statisticalLevel,
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Predictive Analysis - Forecasting future consumption
 */
const getConsumptionForecast = async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      forecastPeriods = 7,
      method = "linear",
      confidenceLevel = 0.95,
      period = "month",
      count = 1,
      startDate: customStartDate,
      endDate: customEndDate
    } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate date range based on period
    const dateRange = calculatePeriodDateRange(period, count, customStartDate, customEndDate);
    const { startDate, endDate } = dateRange;

    const historicalData = await Consumption.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: startDate, $lte: endDate }
    })
      .sort({ date: 1 })
      .lean();

    if (historicalData.length === 0) {
      return res.status(200).json({
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          roomNumber: user.roomNumber,
        },
        forecast: {
          method,
          periods: parseInt(forecastPeriods),
          confidenceLevel: parseFloat(confidenceLevel),
          modelAccuracy: {
            rSquared: 0,
            meanAbsoluteError: 0,
            meanAbsolutePercentageError: 0,
            quality: "insufficient_data",
          },
          forecasts: [],
        },
        historicalData: {
          period: { startDate, endDate, period: dateRange.period, count: dateRange.count },
          dataPoints: 0,
          avgConsumption: 0,
          trend: "unknown",
        },
        hasData: false,
        message: "No historical data available for forecasting. At least 7 days of consumption data are required. Data will appear once water consumption records are created.",
        metadata: {
          generatedAt: new Date(),
          method,
        },
      });
    }

    if (historicalData.length < 7) {
      return res.status(200).json({
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          roomNumber: user.roomNumber,
        },
        forecast: {
          method,
          periods: parseInt(forecastPeriods),
          confidenceLevel: parseFloat(confidenceLevel),
          modelAccuracy: {
            rSquared: 0,
            meanAbsoluteError: 0,
            meanAbsolutePercentageError: 0,
            quality: "insufficient_data",
          },
          forecasts: [],
        },
        historicalData: {
          period: { startDate, endDate, period: dateRange.period, count: dateRange.count },
          dataPoints: historicalData.length,
          avgConsumption: parseFloat((historicalData.reduce((sum, d) => sum + d.dailyConsumption, 0) / historicalData.length).toFixed(2)),
          trend: "unknown",
        },
        hasData: false,
        message: `Insufficient historical data for accurate forecasting. Currently have ${historicalData.length} day(s) of data. Need at least 7 days for reliable forecasts.`,
        metadata: {
          generatedAt: new Date(),
          method,
        },
      });
    }

    // Prepare data for forecasting
    const consumptionValues = historicalData.map(d => d.dailyConsumption);
    const dates = historicalData.map(d => new Date(d.date));

    // Linear regression for forecasting
    const n = consumptionValues.length;
    const x = consumptionValues.map((_, i) => i + 1);
    const y = consumptionValues;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared
    const yMean = sumY / n;
    const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - (slope * x[i] + intercept), 2), 0);
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const rSquared = 1 - (ssRes / ssTot);

    // Calculate standard error
    const standardError = Math.sqrt(ssRes / (n - 2));

    // Generate forecasts
    const forecasts = [];
    const lastDate = new Date(dates[dates.length - 1]);
    
    for (let i = 1; i <= parseInt(forecastPeriods); i++) {
      const forecastValue = slope * (n + i) + intercept;
      const forecastDate = new Date(lastDate);
      forecastDate.setDate(forecastDate.getDate() + i);
      
      // Calculate confidence intervals
      const tValue = 1.96; // For 95% confidence
      const marginOfError = tValue * standardError * Math.sqrt(1 + 1/n + Math.pow(n + i - (sumX/n), 2) / (sumXX - sumX*sumX/n));
      
      forecasts.push({
        date: forecastDate,
        forecastedConsumption: parseFloat(Math.max(0, forecastValue).toFixed(2)),
        lowerBound: parseFloat(Math.max(0, forecastValue - marginOfError).toFixed(2)),
        upperBound: parseFloat(Math.max(0, forecastValue + marginOfError).toFixed(2)),
        confidence: parseFloat((confidenceLevel * 100).toFixed(0)),
      });
    }

    // Calculate forecast accuracy metrics
    const recentActual = consumptionValues.slice(-7);
    const recentPredicted = recentActual.map((_, i) => slope * (n - 7 + i + 1) + intercept);
    const mae = recentActual.reduce((sum, actual, i) => sum + Math.abs(actual - recentPredicted[i]), 0) / recentActual.length;
    const mape = recentActual.reduce((sum, actual, i) => {
      if (actual !== 0) return sum + Math.abs((actual - recentPredicted[i]) / actual) * 100;
      return sum;
    }, 0) / recentActual.length;

    res.status(200).json({
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        roomNumber: user.roomNumber,
      },
      forecast: {
        method,
        periods: parseInt(forecastPeriods),
        confidenceLevel: parseFloat(confidenceLevel),
        modelAccuracy: {
          rSquared: parseFloat(rSquared.toFixed(4)),
          meanAbsoluteError: parseFloat(mae.toFixed(2)),
          meanAbsolutePercentageError: parseFloat(mape.toFixed(2)),
          quality: rSquared > 0.7 ? "high" : rSquared > 0.4 ? "medium" : "low",
        },
        forecasts,
      },
      historicalData: {
        period: { startDate, endDate, period: dateRange.period, count: dateRange.count },
        dataPoints: historicalData.length,
        avgConsumption: parseFloat((sumY / n).toFixed(2)),
        trend: slope > 0 ? "increasing" : slope < 0 ? "decreasing" : "stable",
      },
      hasData: true,
      message: null,
      metadata: {
        generatedAt: new Date(),
        method,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Correlation Analysis - Find relationships between consumption metrics
 */
const getConsumptionCorrelation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      period = "month",
      count = 1,
      days, // Keep for backward compatibility
      startDate: customStartDate,
      endDate: customEndDate
    } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate date range - support both period and days (backward compatibility)
    let dateRange;
    if (days) {
      // Backward compatibility: use days if provided
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      dateRange = { startDate, endDate, period: "custom", count: parseInt(days) };
    } else {
      dateRange = calculatePeriodDateRange(period, count, customStartDate, customEndDate);
    }
    const { startDate, endDate } = dateRange;

    const data = await Consumption.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: startDate, $lte: endDate }
    })
      .sort({ date: 1 })
      .lean();

    if (data.length === 0) {
      return res.status(200).json({
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          roomNumber: user.roomNumber,
        },
        period: { startDate, endDate, period: dateRange.period, count: dateRange.count },
        dataPoints: 0,
        correlations: {
          consumptionVsFlowRate: {
            coefficient: 0,
            strength: "insufficient_data",
            interpretation: "No data available for correlation analysis",
          },
          consumptionVsReadings: {
            coefficient: 0,
            strength: "insufficient_data",
          },
          consumptionVsResets: {
            coefficient: 0,
            strength: "insufficient_data",
          },
          flowRateVsReadings: {
            coefficient: 0,
            strength: "insufficient_data",
          },
        },
        insights: {
          strongestCorrelation: null,
          keyFindings: [],
        },
        hasData: false,
        message: "No consumption data available for correlation analysis. Need at least 5 data points. Data will appear once water consumption records are created.",
        metadata: {
          generatedAt: new Date(),
        },
      });
    }

    if (data.length < 5) {
      return res.status(200).json({
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          roomNumber: user.roomNumber,
        },
        period: { startDate, endDate, period: dateRange.period, count: dateRange.count },
        dataPoints: data.length,
        correlations: {
          consumptionVsFlowRate: {
            coefficient: 0,
            strength: "insufficient_data",
            interpretation: `Insufficient data for reliable correlation. Currently have ${data.length} data point(s). Need at least 5.`,
          },
          consumptionVsReadings: {
            coefficient: 0,
            strength: "insufficient_data",
          },
          consumptionVsResets: {
            coefficient: 0,
            strength: "insufficient_data",
          },
          flowRateVsReadings: {
            coefficient: 0,
            strength: "insufficient_data",
          },
        },
        insights: {
          strongestCorrelation: null,
          keyFindings: [],
        },
        hasData: false,
        message: `Insufficient data for correlation analysis. Currently have ${data.length} data point(s). Need at least 5 for reliable correlation analysis.`,
        metadata: {
          generatedAt: new Date(),
        },
      });
    }

    // Extract metrics
    const dailyConsumptions = data.map(d => d.dailyConsumption);
    const avgFlowRates = data.map(d => d.avgFlowRate);
    const totalReadings = data.map(d => d.totalReadings);
    const resetCounts = data.map(d => d.resetCount);
    const statusChanges = data.map(d => d.statusChanges);

    // Calculate correlation coefficient
    const calculateCorrelation = (x, y) => {
      const n = x.length;
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
      const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
      const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
      
      const numerator = n * sumXY - sumX * sumY;
      const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
      
      return denominator !== 0 ? numerator / denominator : 0;
    };

    const correlations = {
      consumptionVsFlowRate: {
        coefficient: parseFloat(calculateCorrelation(dailyConsumptions, avgFlowRates).toFixed(4)),
        strength: (() => {
          const corr = Math.abs(calculateCorrelation(dailyConsumptions, avgFlowRates));
          return corr > 0.7 ? "strong" : corr > 0.4 ? "moderate" : "weak";
        })(),
        interpretation: (() => {
          const corr = calculateCorrelation(dailyConsumptions, avgFlowRates);
          if (corr > 0.7) return "Strong positive correlation - Higher flow rates indicate higher consumption";
          if (corr > 0.4) return "Moderate positive correlation - Flow rate and consumption are related";
          if (corr > -0.4) return "Weak correlation - Limited relationship between flow rate and consumption";
          return "Negative correlation - Higher flow rates may indicate lower consumption";
        })(),
      },
      consumptionVsReadings: {
        coefficient: parseFloat(calculateCorrelation(dailyConsumptions, totalReadings).toFixed(4)),
        strength: (() => {
          const corr = Math.abs(calculateCorrelation(dailyConsumptions, totalReadings));
          return corr > 0.7 ? "strong" : corr > 0.4 ? "moderate" : "weak";
        })(),
      },
      consumptionVsResets: {
        coefficient: parseFloat(calculateCorrelation(dailyConsumptions, resetCounts).toFixed(4)),
        strength: (() => {
          const corr = Math.abs(calculateCorrelation(dailyConsumptions, resetCounts));
          return corr > 0.7 ? "strong" : corr > 0.4 ? "moderate" : "weak";
        })(),
      },
      flowRateVsReadings: {
        coefficient: parseFloat(calculateCorrelation(avgFlowRates, totalReadings).toFixed(4)),
        strength: (() => {
          const corr = Math.abs(calculateCorrelation(avgFlowRates, totalReadings));
          return corr > 0.7 ? "strong" : corr > 0.4 ? "moderate" : "weak";
        })(),
      },
    };

    res.status(200).json({
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        roomNumber: user.roomNumber,
      },
      period: { startDate, endDate, period: dateRange.period, count: dateRange.count },
      dataPoints: data.length,
      correlations,
      insights: {
        strongestCorrelation: Object.entries(correlations)
          .sort((a, b) => Math.abs(b[1].coefficient) - Math.abs(a[1].coefficient))[0],
        keyFindings: Object.entries(correlations)
          .filter(([_, corr]) => Math.abs(corr.coefficient) > 0.5)
          .map(([name, corr]) => `${name} shows ${corr.strength} correlation (${corr.coefficient})`),
      },
      hasData: true,
      message: null,
      metadata: {
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Seasonal Analysis - Identify seasonal patterns
 */
const getConsumptionSeasonality = async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      period: periodType = "month", // Period for grouping (month/week/day)
      years, // Keep for backward compatibility
      dateRangePeriod = "year", // Period for date range calculation
      count = 1,
      startDate: customStartDate,
      endDate: customEndDate
    } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate date range - support both years and period (backward compatibility)
    let dateRange;
    if (years) {
      // Backward compatibility: use years if provided
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - parseInt(years));
      dateRange = { startDate, endDate, period: "year", count: parseInt(years) };
    } else {
      dateRange = calculatePeriodDateRange(dateRangePeriod, count, customStartDate, customEndDate);
    }
    const { startDate, endDate } = dateRange;

    const data = await Consumption.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: startDate, $lte: endDate }
    })
      .sort({ date: 1 })
      .lean();

    if (data.length === 0) {
      return res.status(200).json({
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          roomNumber: user.roomNumber,
        },
        period: periodType,
        dateRange: { startDate, endDate, period: dateRange.period, count: dateRange.count },
        overallAverage: 0,
        seasonalPattern: [],
        insights: {
          peakPeriods: [],
          lowPeriods: [],
          seasonalVariation: 0,
          hasStrongSeasonality: false,
        },
        hasData: false,
        message: "No consumption data available for seasonal analysis. Need at least 12 months of data. Data will appear once water consumption records are created.",
        metadata: {
          generatedAt: new Date(),
        },
      });
    }

    if (data.length < 12) {
      return res.status(200).json({
        user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        roomNumber: user.roomNumber,
      },
      period: periodType,
      dateRange: { startDate, endDate, period: dateRange.period, count: dateRange.count },
      overallAverage: parseFloat((data.reduce((sum, d) => sum + d.dailyConsumption, 0) / data.length).toFixed(2)),
        seasonalPattern: [],
        insights: {
          peakPeriods: [],
          lowPeriods: [],
          seasonalVariation: 0,
          hasStrongSeasonality: false,
        },
        hasData: false,
        message: `Insufficient data for seasonal analysis. Currently have ${data.length} month(s) of data. Need at least 12 months for reliable seasonal pattern detection.`,
        metadata: {
          generatedAt: new Date(),
        },
      });
    }

    // Group by period (periodType is for grouping, not date range)
    let groupBy;
    if (periodType === "month") {
      groupBy = {
        month: { $month: "$date" },
      };
    } else if (periodType === "week") {
      groupBy = {
        week: { $week: "$date" },
      };
    } else {
      groupBy = {
        day: { $dayOfMonth: "$date" },
      };
    }

    const seasonalData = await Consumption.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: groupBy,
          avgConsumption: { $avg: "$dailyConsumption" },
          totalConsumption: { $sum: "$dailyConsumption" },
          count: { $sum: 1 },
          maxConsumption: { $max: "$dailyConsumption" },
          minConsumption: { $min: "$dailyConsumption" },
        },
      },
      {
        $sort: { "_id": 1 },
      },
    ]);

    const overallAvg = seasonalData.reduce((sum, d) => sum + d.avgConsumption, 0) / seasonalData.length;

    const seasonalPattern = seasonalData.map(item => ({
      period: periodType === "month" ? item._id.month : periodType === "week" ? item._id.week : item._id.day,
      avgConsumption: parseFloat(item.avgConsumption.toFixed(2)),
      totalConsumption: parseFloat(item.totalConsumption.toFixed(2)),
      deviationFromAverage: parseFloat((item.avgConsumption - overallAvg).toFixed(2)),
      percentDeviation: parseFloat(((item.avgConsumption - overallAvg) / overallAvg * 100).toFixed(2)),
      maxConsumption: item.maxConsumption,
      minConsumption: item.minConsumption,
      recordCount: item.count,
    }));

    // Identify peak and low seasons
    const sortedByConsumption = [...seasonalPattern].sort((a, b) => b.avgConsumption - a.avgConsumption);
    const peakPeriods = sortedByConsumption.slice(0, 3);
    const lowPeriods = sortedByConsumption.slice(-3).reverse();

    res.status(200).json({
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        roomNumber: user.roomNumber,
      },
      period: periodType,
      dateRange: { startDate, endDate, period: dateRange.period, count: dateRange.count },
      overallAverage: parseFloat(overallAvg.toFixed(2)),
      seasonalPattern,
      insights: {
        peakPeriods,
        lowPeriods,
        seasonalVariation: parseFloat((Math.max(...seasonalPattern.map(p => p.avgConsumption)) - Math.min(...seasonalPattern.map(p => p.avgConsumption))).toFixed(2)),
        hasStrongSeasonality: Math.max(...seasonalPattern.map(p => Math.abs(p.percentDeviation))) > 20,
      },
      hasData: true,
      message: null,
      metadata: {
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Benchmarking Analysis - Compare user consumption against averages
 */
const getConsumptionBenchmark = async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = "month", compareWith = "all" } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const endDate = new Date();
    const startDate = new Date();
    if (period === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === "week") {
      startDate.setDate(startDate.getDate() - 7);
    } else {
      startDate.setDate(startDate.getDate() - 30);
    }

    // Get user's consumption
    const userConsumption = await Consumption.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          avgConsumption: { $avg: "$dailyConsumption" },
          totalConsumption: { $sum: "$dailyConsumption" },
          maxConsumption: { $max: "$dailyConsumption" },
          minConsumption: { $min: "$dailyConsumption" },
          recordCount: { $sum: 1 },
        },
      },
    ]);

    if (userConsumption.length === 0) {
      return res.status(200).json({
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          roomNumber: user.roomNumber,
        },
        period: { startDate, endDate, period },
        userMetrics: {
          avgConsumption: 0,
          totalConsumption: 0,
          maxConsumption: 0,
          minConsumption: 0,
          recordCount: 0,
        },
        benchmarkMetrics: {
          avgConsumption: 0,
          totalConsumption: 0,
          maxConsumption: 0,
          minConsumption: 0,
          userCount: 0,
        },
        comparison: {
          difference: 0,
          percentDifference: 0,
          status: "no_data",
          percentile: null,
          efficiency: 0,
        },
        recommendations: ["No consumption data available yet. Data will appear once water consumption records are created for this user."],
        hasData: false,
        message: "No consumption data found for user in this period. Data will appear once water consumption records are created.",
        metadata: {
          generatedAt: new Date(),
          compareWith,
        },
      });
    }

    // Get benchmark (all users average)
    const benchmarkConsumption = await Consumption.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          avgConsumption: { $avg: "$dailyConsumption" },
          totalConsumption: { $sum: "$dailyConsumption" },
          maxConsumption: { $max: "$dailyConsumption" },
          minConsumption: { $min: "$dailyConsumption" },
          recordCount: { $sum: 1 },
          userCount: { $addToSet: "$userId" },
        },
      },
    ]);

    const userData = userConsumption[0];
    const benchmarkData = benchmarkConsumption[0] || { avgConsumption: 0 };

    const userAvg = userData.avgConsumption;
    const benchmarkAvg = benchmarkData.avgConsumption;

    const difference = userAvg - benchmarkAvg;
    const percentDifference = benchmarkAvg !== 0 
      ? parseFloat((difference / benchmarkAvg * 100).toFixed(2))
      : 0;

    const percentile = benchmarkData.userCount && benchmarkData.userCount.length > 0
      ? parseFloat((50 + (percentDifference / 2)).toFixed(2))
      : null;

    res.status(200).json({
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        roomNumber: user.roomNumber,
      },
      period: { startDate, endDate, period },
      userMetrics: {
        avgConsumption: parseFloat(userAvg.toFixed(2)),
        totalConsumption: parseFloat(userData.totalConsumption.toFixed(2)),
        maxConsumption: userData.maxConsumption,
        minConsumption: userData.minConsumption,
        recordCount: userData.recordCount,
      },
      benchmarkMetrics: {
        avgConsumption: parseFloat(benchmarkAvg.toFixed(2)),
        totalConsumption: parseFloat((benchmarkData.totalConsumption || 0).toFixed(2)),
        maxConsumption: benchmarkData.maxConsumption || 0,
        minConsumption: benchmarkData.minConsumption || 0,
        userCount: benchmarkData.userCount ? benchmarkData.userCount.length : 0,
      },
      comparison: {
        difference: parseFloat(difference.toFixed(2)),
        percentDifference,
        status: percentDifference > 10 ? "above_average" : percentDifference < -10 ? "below_average" : "average",
        percentile: percentile,
        efficiency: userData.recordCount > 0 
          ? parseFloat((userAvg / userData.recordCount).toFixed(4))
          : 0,
      },
      recommendations: (() => {
        const recommendations = [];
        if (percentDifference > 20) {
          recommendations.push("Your consumption is significantly above average. Consider reviewing usage patterns.");
        } else if (percentDifference < -20) {
          recommendations.push("Your consumption is significantly below average. Great job on conservation!");
        }
        if (userData.maxConsumption > benchmarkAvg * 1.5) {
          recommendations.push("Peak consumption days are high. Monitor for unusual patterns.");
        }
        return recommendations;
      })(),
      hasData: true,
      message: null,
      metadata: {
        generatedAt: new Date(),
        compareWith,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Risk Assessment - Identify consumption risks and anomalies
 */
const getConsumptionRiskAssessment = async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      period = "month",
      count = 1,
      days, // Keep for backward compatibility
      startDate: customStartDate,
      endDate: customEndDate
    } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate date range - support both period and days (backward compatibility)
    let dateRange;
    if (days) {
      // Backward compatibility: use days if provided
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      dateRange = { startDate, endDate, period: "custom", count: parseInt(days) };
    } else {
      dateRange = calculatePeriodDateRange(period, count, customStartDate, customEndDate);
    }
    const { startDate, endDate } = dateRange;

    const data = await Consumption.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: startDate, $lte: endDate }
    })
      .sort({ date: 1 })
      .lean();

    if (data.length === 0) {
      return res.status(200).json({
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          roomNumber: user.roomNumber,
        },
        period: { startDate, endDate, period: dateRange.period, count: dateRange.count },
        riskAssessment: {
          riskScore: 0,
          riskLevel: "no_data",
          risks: [],
          anomalies: [],
          statistics: {
            avgConsumption: 0,
            stdDeviation: 0,
            currentConsumption: 0,
            consumptionLimit: 0,
            limitUtilization: 0,
          },
        },
        recommendations: ["No consumption data available yet. Data will appear once water consumption records are created for this user."],
        hasData: false,
        message: "No consumption data available for risk assessment. Need at least 5 data points. Data will appear once water consumption records are created.",
        metadata: {
          generatedAt: new Date(),
        },
      });
    }

    if (data.length < 5) {
      return res.status(200).json({
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          roomNumber: user.roomNumber,
        },
        period: { startDate, endDate, period: dateRange.period, count: dateRange.count },
        riskAssessment: {
          riskScore: 0,
          riskLevel: "insufficient_data",
          risks: [],
          anomalies: [],
          statistics: {
            avgConsumption: parseFloat((data.reduce((sum, d) => sum + d.dailyConsumption, 0) / data.length).toFixed(2)),
            stdDeviation: 0,
            currentConsumption: data[data.length - 1]?.dailyConsumption || 0,
            consumptionLimit: data[data.length - 1]?.consumptionLimit || 0,
            limitUtilization: data[data.length - 1]?.consumptionLimit > 0 
              ? parseFloat(((data[data.length - 1]?.dailyConsumption || 0) / data[data.length - 1]?.consumptionLimit * 100).toFixed(2))
              : 0,
          },
        },
        recommendations: [`Insufficient data for comprehensive risk assessment. Currently have ${data.length} data point(s). Need at least 5 for reliable risk analysis.`],
        hasData: false,
        message: `Insufficient data for risk assessment. Currently have ${data.length} data point(s). Need at least 5 for reliable risk analysis.`,
        metadata: {
          generatedAt: new Date(),
        },
      });
    }

    const consumptions = data.map(d => d.dailyConsumption);
    const avgConsumption = consumptions.reduce((a, b) => a + b, 0) / consumptions.length;
    const latestConsumption = data[data.length - 1];

    // Calculate standard deviation
    const variance = consumptions.reduce((sum, val) => sum + Math.pow(val - avgConsumption, 2), 0) / consumptions.length;
    const stdDev = Math.sqrt(variance);

    // Identify risks
    const risks = [];
    const anomalies = [];

    // High consumption risk
    if (latestConsumption.dailyConsumption > avgConsumption + 2 * stdDev) {
      risks.push({
        type: "high_consumption",
        severity: "high",
        description: `Current consumption (${latestConsumption.dailyConsumption}) is significantly above average (${avgConsumption.toFixed(2)})`,
        recommendation: "Review recent usage patterns and check for leaks or unusual activity",
      });
    }

    // Trend risk
    const recentTrend = consumptions.slice(-7);
    const earlierTrend = consumptions.slice(-14, -7);
    const recentAvg = recentTrend.reduce((a, b) => a + b, 0) / recentTrend.length;
    const earlierAvg = earlierTrend.length > 0 
      ? earlierTrend.reduce((a, b) => a + b, 0) / earlierTrend.length 
      : avgConsumption;
    
    if (recentAvg > earlierAvg * 1.3) {
      risks.push({
        type: "increasing_trend",
        severity: "medium",
        description: `Consumption has increased by ${((recentAvg - earlierAvg) / earlierAvg * 100).toFixed(2)}% in the last week`,
        recommendation: "Monitor consumption closely and investigate the cause of the increase",
      });
    }

    // Limit breach risk
    if (latestConsumption.dailyConsumption > latestConsumption.consumptionLimit * 0.9) {
      risks.push({
        type: "approaching_limit",
        severity: "high",
        description: `Consumption (${latestConsumption.dailyConsumption}) is approaching the limit (${latestConsumption.consumptionLimit})`,
        recommendation: "Reduce consumption to avoid exceeding your limit",
      });
    }

    // Anomaly detection
    consumptions.forEach((consumption, index) => {
      const zScore = Math.abs((consumption - avgConsumption) / stdDev);
      if (zScore > 2) {
        anomalies.push({
          date: data[index].date,
          consumption,
          zScore: parseFloat(zScore.toFixed(2)),
          deviation: parseFloat((consumption - avgConsumption).toFixed(2)),
          type: consumption > avgConsumption ? "spike" : "drop",
        });
      }
    });

    // Calculate risk score (0-100)
    let riskScore = 0;
    risks.forEach(risk => {
      if (risk.severity === "high") riskScore += 30;
      else if (risk.severity === "medium") riskScore += 15;
      else riskScore += 5;
    });
    riskScore = Math.min(100, riskScore);

    res.status(200).json({
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        roomNumber: user.roomNumber,
      },
      period: { startDate, endDate, period: dateRange.period, count: dateRange.count },
      riskAssessment: {
        riskScore,
        riskLevel: riskScore > 70 ? "high" : riskScore > 40 ? "medium" : "low",
        risks,
        anomalies: anomalies.slice(0, 10), // Top 10 anomalies
        statistics: {
          avgConsumption: parseFloat(avgConsumption.toFixed(2)),
          stdDeviation: parseFloat(stdDev.toFixed(2)),
          currentConsumption: latestConsumption.dailyConsumption,
          consumptionLimit: latestConsumption.consumptionLimit,
          limitUtilization: parseFloat((latestConsumption.dailyConsumption / latestConsumption.consumptionLimit * 100).toFixed(2)),
        },
      },
      recommendations: [
        ...risks.map(r => r.recommendation),
        anomalies.length > 5 ? "Multiple consumption anomalies detected. Review usage patterns." : null,
        riskScore > 50 ? "Consider implementing consumption monitoring alerts" : null,
      ].filter(Boolean),
      metadata: {
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Performance Metrics - Comprehensive performance analysis
 */
const getConsumptionPerformanceMetrics = async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = "month" } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const endDate = new Date();
    const startDate = new Date();
    if (period === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === "week") {
      startDate.setDate(startDate.getDate() - 7);
    } else {
      startDate.setDate(startDate.getDate() - 30);
    }

    const data = await Consumption.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: startDate, $lte: endDate }
    })
      .sort({ date: 1 })
      .lean();

    if (data.length === 0) {
      return res.status(200).json({
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          roomNumber: user.roomNumber,
        },
        period: { startDate, endDate, period },
        performanceScore: 0,
        performanceLevel: "no_data",
        metrics: {
          consumption: {
            total: 0,
            average: 0,
            median: 0,
            max: 0,
            min: 0,
            stdDeviation: 0,
          },
          flowRate: {
            average: 0,
            max: 0,
            min: 0,
          },
          efficiency: {
            avgConsumptionPerReading: 0,
            totalReadings: 0,
            readingsPerDay: 0,
          },
          consistency: {
            coefficientOfVariation: 0,
            stability: "unknown",
          },
          trends: {
            direction: "unknown",
            growthRate: 0,
          },
        },
        insights: {
          strengths: [],
          areasForImprovement: [],
        },
        hasData: false,
        message: "No consumption data found for this period. Data will appear once water consumption records are created.",
        metadata: {
          generatedAt: new Date(),
          dataPoints: 0,
        },
      });
    }

    const consumptions = data.map(d => d.dailyConsumption);
    const flowRates = data.map(d => d.avgFlowRate);
    const readings = data.map(d => d.totalReadings);

    // Calculate comprehensive metrics
    const metrics = {
      consumption: {
        total: parseFloat(consumptions.reduce((a, b) => a + b, 0).toFixed(2)),
        average: parseFloat((consumptions.reduce((a, b) => a + b, 0) / consumptions.length).toFixed(2)),
        median: (() => {
          const sorted = [...consumptions].sort((a, b) => a - b);
          return parseFloat((sorted[Math.floor(sorted.length / 2)]).toFixed(2));
        })(),
        max: Math.max(...consumptions),
        min: Math.min(...consumptions),
        stdDeviation: (() => {
          const avg = consumptions.reduce((a, b) => a + b, 0) / consumptions.length;
          const variance = consumptions.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / consumptions.length;
          return parseFloat(Math.sqrt(variance).toFixed(2));
        })(),
      },
      flowRate: {
        average: parseFloat((flowRates.reduce((a, b) => a + b, 0) / flowRates.length).toFixed(2)),
        max: Math.max(...flowRates),
        min: Math.min(...flowRates),
      },
      efficiency: {
        avgConsumptionPerReading: readings.reduce((a, b) => a + b, 0) > 0
          ? parseFloat((consumptions.reduce((a, b) => a + b, 0) / readings.reduce((a, b) => a + b, 0)).toFixed(4))
          : 0,
        totalReadings: readings.reduce((a, b) => a + b, 0),
        readingsPerDay: parseFloat((readings.reduce((a, b) => a + b, 0) / data.length).toFixed(2)),
      },
      consistency: {
        coefficientOfVariation: (() => {
          const avg = consumptions.reduce((a, b) => a + b, 0) / consumptions.length;
          const stdDev = Math.sqrt(consumptions.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / consumptions.length);
          return avg !== 0 ? parseFloat((stdDev / avg * 100).toFixed(2)) : 0;
        })(),
        stability: (() => {
          const avg = consumptions.reduce((a, b) => a + b, 0) / consumptions.length;
          const stdDev = Math.sqrt(consumptions.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / consumptions.length);
          const cv = avg !== 0 ? stdDev / avg : 0;
          return cv < 0.1 ? "very_stable" : cv < 0.2 ? "stable" : cv < 0.3 ? "moderate" : "variable";
        })(),
      },
      trends: {
        direction: (() => {
          const firstHalf = consumptions.slice(0, Math.floor(consumptions.length / 2));
          const secondHalf = consumptions.slice(Math.floor(consumptions.length / 2));
          const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
          const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
          return secondAvg > firstAvg * 1.1 ? "increasing" : secondAvg < firstAvg * 0.9 ? "decreasing" : "stable";
        })(),
        growthRate: (() => {
          const firstHalf = consumptions.slice(0, Math.floor(consumptions.length / 2));
          const secondHalf = consumptions.slice(Math.floor(consumptions.length / 2));
          const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
          const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
          return firstAvg !== 0 ? parseFloat(((secondAvg - firstAvg) / firstAvg * 100).toFixed(2)) : 0;
        })(),
      },
    };

    // Performance score (0-100)
    const performanceScore = (() => {
      let score = 100;
      // Deduct for high variability
      if (metrics.consistency.coefficientOfVariation > 30) score -= 20;
      else if (metrics.consistency.coefficientOfVariation > 20) score -= 10;
      // Deduct for increasing trend (if consumption is already high)
      if (metrics.trends.direction === "increasing" && metrics.consumption.average > 100) score -= 15;
      // Add for efficiency
      if (metrics.efficiency.avgConsumptionPerReading > 0 && metrics.efficiency.avgConsumptionPerReading < 0.5) score += 10;
      return Math.max(0, Math.min(100, score));
    })();

    res.status(200).json({
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        roomNumber: user.roomNumber,
      },
      period: { startDate, endDate, period },
      performanceScore: parseFloat(performanceScore.toFixed(2)),
      performanceLevel: performanceScore > 80 ? "excellent" : performanceScore > 60 ? "good" : performanceScore > 40 ? "fair" : "needs_improvement",
      metrics,
      insights: {
        strengths: [
          metrics.consistency.stability === "very_stable" || metrics.consistency.stability === "stable" 
            ? "Consistent consumption patterns" : null,
          metrics.efficiency.avgConsumptionPerReading < 0.5 
            ? "Efficient consumption per reading" : null,
        ].filter(Boolean),
        areasForImprovement: [
          metrics.consistency.coefficientOfVariation > 25 
            ? "High consumption variability - consider stabilizing usage patterns" : null,
          metrics.trends.direction === "increasing" && metrics.trends.growthRate > 10
            ? "Consumption is increasing - review usage habits" : null,
        ].filter(Boolean),
      },
      hasData: true,
      message: null,
      metadata: {
        generatedAt: new Date(),
        dataPoints: data.length,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Pump Efficiency Analysis - Analyze pump performance and efficiency
 */
const getPumpEfficiencyAnalysis = async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      period = "month",
      count = 1,
      days, // Keep for backward compatibility
      startDate: customStartDate,
      endDate: customEndDate
    } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate date range - support both period and days (backward compatibility)
    let dateRange;
    if (days) {
      // Backward compatibility: use days if provided
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      dateRange = { startDate, endDate, period: "custom", count: parseInt(days) };
    } else {
      dateRange = calculatePeriodDateRange(period, count, customStartDate, customEndDate);
    }
    const { startDate, endDate } = dateRange;

    const data = await Consumption.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: startDate, $lte: endDate }
    })
      .sort({ date: 1 })
      .lean();

    if (data.length === 0) {
      return res.status(200).json({
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          roomNumber: user.roomNumber,
        },
        period: { startDate, endDate, period: dateRange.period, count: dateRange.count },
        overallEfficiency: {
          avgConsumptionPerCycle: 0,
          avgFlowEfficiency: 0,
          avgReadingEfficiency: 0,
          pumpUtilizationRate: 0,
          cyclesPerDay: 0,
          avgConsumptionPerDay: 0,
        },
        efficiencyTrend: "unknown",
        dailyEfficiency: [],
        insights: {
          pumpHealth: "unknown",
          recommendations: ["No consumption data available yet. Data will appear once water consumption records are created for this user."],
        },
        hasData: false,
        message: "No consumption data found for this period. Data will appear once water consumption records are created.",
        metadata: {
          generatedAt: new Date(),
        },
      });
    }

    // Calculate pump efficiency metrics
    const efficiencyMetrics = data.map(record => {
      // Pump efficiency = water delivered per pump cycle
      const consumptionPerCycle = record.statusChanges > 0 
        ? record.dailyConsumption / record.statusChanges 
        : 0;
      
      // Flow efficiency = consumption per flow rate unit
      const flowEfficiency = record.avgFlowRate > 0 
        ? record.dailyConsumption / record.avgFlowRate 
        : 0;
      
      // Reading efficiency = consumption per sensor reading
      const readingEfficiency = record.totalReadings > 0 
        ? record.dailyConsumption / record.totalReadings 
        : 0;

      return {
        date: record.date,
        dailyConsumption: record.dailyConsumption,
        avgFlowRate: record.avgFlowRate,
        statusChanges: record.statusChanges,
        totalReadings: record.totalReadings,
        consumptionPerCycle: parseFloat(consumptionPerCycle.toFixed(2)),
        flowEfficiency: parseFloat(flowEfficiency.toFixed(4)),
        readingEfficiency: parseFloat(readingEfficiency.toFixed(4)),
        pumpUtilization: record.statusChanges > 0 ? parseFloat((record.statusChanges / record.totalReadings * 100).toFixed(2)) : 0,
      };
    });

    // Calculate overall efficiency
    const totalConsumption = data.reduce((sum, d) => sum + d.dailyConsumption, 0);
    const totalStatusChanges = data.reduce((sum, d) => sum + d.statusChanges, 0);
    const totalReadings = data.reduce((sum, d) => sum + d.totalReadings, 0);
    const avgFlowRate = data.reduce((sum, d) => sum + d.avgFlowRate, 0) / data.length;

    const overallEfficiency = {
      avgConsumptionPerCycle: totalStatusChanges > 0 
        ? parseFloat((totalConsumption / totalStatusChanges).toFixed(2))
        : 0,
      avgFlowEfficiency: avgFlowRate > 0 
        ? parseFloat((totalConsumption / (avgFlowRate * data.length)).toFixed(4))
        : 0,
      avgReadingEfficiency: totalReadings > 0 
        ? parseFloat((totalConsumption / totalReadings).toFixed(4))
        : 0,
      pumpUtilizationRate: totalReadings > 0 
        ? parseFloat((totalStatusChanges / totalReadings * 100).toFixed(2))
        : 0,
      cyclesPerDay: parseFloat((totalStatusChanges / data.length).toFixed(2)),
      avgConsumptionPerDay: parseFloat((totalConsumption / data.length).toFixed(2)),
    };

    // Identify efficiency trends
    const recentEfficiency = efficiencyMetrics.slice(-7);
    const earlierEfficiency = efficiencyMetrics.slice(0, 7);
    const recentAvg = recentEfficiency.reduce((sum, e) => sum + e.consumptionPerCycle, 0) / recentEfficiency.length;
    const earlierAvg = earlierEfficiency.length > 0 
      ? earlierEfficiency.reduce((sum, e) => sum + e.consumptionPerCycle, 0) / earlierEfficiency.length 
      : recentAvg;

    const efficiencyTrend = recentAvg > earlierAvg * 1.1 ? "improving" 
      : recentAvg < earlierAvg * 0.9 ? "declining" 
      : "stable";

    res.status(200).json({
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        roomNumber: user.roomNumber,
      },
        period: { startDate, endDate, period: dateRange.period, count: dateRange.count },
      overallEfficiency,
      efficiencyTrend,
      dailyEfficiency: efficiencyMetrics,
      insights: {
        pumpHealth: overallEfficiency.avgConsumptionPerCycle > 0 
          ? overallEfficiency.avgConsumptionPerCycle > 50 ? "good" : overallEfficiency.avgConsumptionPerCycle > 25 ? "moderate" : "needs_attention"
          : "unknown",
        recommendations: [
          overallEfficiency.pumpUtilizationRate > 50 
            ? "High pump utilization - consider optimizing pump cycles" 
            : null,
          efficiencyTrend === "declining" 
            ? "Pump efficiency is declining - check for pump maintenance needs" 
            : null,
          overallEfficiency.avgConsumptionPerCycle < 20 
            ? "Low consumption per cycle - possible pump inefficiency or leaks" 
            : null,
        ].filter(Boolean),
      },
      hasData: true,
      message: null,
      metadata: {
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Leak Detection Analysis - Detect potential water leaks
 */
const getLeakDetectionAnalysis = async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      period = "week",
      count = 1,
      days, // Keep for backward compatibility (default 7 days)
      threshold = 0.1,
      startDate: customStartDate,
      endDate: customEndDate
    } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate date range - support both period and days (backward compatibility)
    let dateRange;
    if (days) {
      // Backward compatibility: use days if provided
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      dateRange = { startDate, endDate, period: "custom", count: parseInt(days) };
    } else {
      dateRange = calculatePeriodDateRange(period, count, customStartDate, customEndDate);
    }
    const { startDate, endDate } = dateRange;

    const data = await Consumption.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: startDate, $lte: endDate }
    })
      .sort({ date: 1 })
      .lean();

    if (data.length === 0) {
      return res.status(200).json({
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          roomNumber: user.roomNumber,
        },
        period: { startDate, endDate, period: dateRange.period, count: dateRange.count },
        leakDetection: {
          leakRiskScore: 0,
          riskLevel: "no_data",
          suspiciousDays: 0,
          consecutiveLeakDays: 0,
          leakIndicators: [],
          baseline: {
            avgConsumption: 0,
            avgFlowRate: 0,
          },
        },
        recommendations: ["No consumption data available yet. Data will appear once water consumption records are created for this user."],
        hasData: false,
        message: "No consumption data available for leak detection. Need at least 3 days of data. Data will appear once water consumption records are created.",
        metadata: {
          generatedAt: new Date(),
          threshold: parseFloat(threshold),
        },
      });
    }

    if (data.length < 3) {
      return res.status(200).json({
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          roomNumber: user.roomNumber,
        },
        period: { startDate, endDate, period: dateRange.period, count: dateRange.count },
        leakDetection: {
          leakRiskScore: 0,
          riskLevel: "insufficient_data",
          suspiciousDays: 0,
          consecutiveLeakDays: 0,
          leakIndicators: [],
          baseline: {
            avgConsumption: parseFloat((data.reduce((sum, d) => sum + d.dailyConsumption, 0) / data.length).toFixed(2)),
            avgFlowRate: parseFloat((data.reduce((sum, d) => sum + d.avgFlowRate, 0) / data.length).toFixed(2)),
          },
        },
        recommendations: [`Insufficient data for leak detection. Currently have ${data.length} day(s) of data. Need at least 3 days for reliable leak detection.`],
        hasData: false,
        message: `Insufficient data for leak detection. Currently have ${data.length} day(s) of data. Need at least 3 days for reliable leak detection.`,
        metadata: {
          generatedAt: new Date(),
          threshold: parseFloat(threshold),
        },
      });
    }

    // Enhanced leak detection logic
    const leakIndicators = [];
    
    // Calculate baseline metrics (using first 30% of data or minimum 7 days for baseline)
    const baselineDays = Math.max(7, Math.floor(data.length * 0.3));
    const baselineData = data.slice(0, baselineDays);
    const avgConsumption = baselineData.reduce((sum, d) => sum + d.dailyConsumption, 0) / baselineData.length;
    const avgFlowRate = baselineData.reduce((sum, d) => sum + d.avgFlowRate, 0) / baselineData.length;
    const avgStatusChanges = baselineData.reduce((sum, d) => sum + d.statusChanges, 0) / baselineData.length;
    const avgReadings = baselineData.reduce((sum, d) => sum + d.totalReadings, 0) / baselineData.length;
    
    // Calculate standard deviations for anomaly detection
    const consumptionStdDev = Math.sqrt(
      baselineData.reduce((sum, d) => sum + Math.pow(d.dailyConsumption - avgConsumption, 2), 0) / baselineData.length
    );
    const flowRateStdDev = Math.sqrt(
      baselineData.reduce((sum, d) => sum + Math.pow(d.avgFlowRate - avgFlowRate, 2), 0) / baselineData.length
    );

    // Analyze each record
    data.forEach((record, index) => {
      const indicators = [];
      let leakScore = 0; // 0-100 score for this day

      // 1. Continuous flow with low consumption (dripping leak)
      const flowToConsumptionRatio = record.avgFlowRate > 0 
        ? record.dailyConsumption / record.avgFlowRate 
        : 0;
      const expectedRatio = avgConsumption / avgFlowRate;
      
      if (record.avgFlowRate > avgFlowRate * 0.3 && flowToConsumptionRatio < expectedRatio * parseFloat(threshold)) {
        const severity = flowToConsumptionRatio < expectedRatio * 0.3 ? "high" : "medium";
        leakScore += severity === "high" ? 30 : 15;
        indicators.push({
          type: "continuous_flow_low_consumption",
          severity,
          description: `Flow rate (${record.avgFlowRate.toFixed(2)}) is significant but consumption (${record.dailyConsumption.toFixed(2)}) is very low - possible continuous leak`,
          flowToConsumptionRatio: parseFloat(flowToConsumptionRatio.toFixed(3)),
          expectedRatio: parseFloat(expectedRatio.toFixed(3)),
        });
      }

      // 2. Flow rate without status changes (pump running continuously - leak indicator)
      if (record.avgFlowRate > avgFlowRate * 0.4 && record.statusChanges < avgStatusChanges * 0.3) {
        const severity = record.statusChanges === 0 ? "high" : "medium";
        leakScore += severity === "high" ? 25 : 12;
        indicators.push({
          type: "continuous_flow_no_cycles",
          severity,
          description: `Flow detected (${record.avgFlowRate.toFixed(2)}) but very few pump cycles (${record.statusChanges}) - possible continuous leak`,
          expectedCycles: Math.round(avgStatusChanges),
        });
      }

      // 3. High flow rate with minimal consumption increase (inefficient flow)
      if (record.avgFlowRate > avgFlowRate * 1.5 && record.dailyConsumption < avgConsumption * 1.2) {
        leakScore += 20;
        indicators.push({
          type: "high_flow_low_consumption",
          severity: "medium",
          description: `High flow rate (${record.avgFlowRate.toFixed(2)}) not matching consumption increase (${record.dailyConsumption.toFixed(2)}) - possible leak or system inefficiency`,
          flowIncrease: parseFloat(((record.avgFlowRate / avgFlowRate - 1) * 100).toFixed(1)),
          consumptionIncrease: parseFloat(((record.dailyConsumption / avgConsumption - 1) * 100).toFixed(1)),
        });
      }

      // 4. Consumption during inactive periods (consumption without pump activity)
      if (record.statusChanges < 3 && record.dailyConsumption > avgConsumption * 0.4) {
        leakScore += 25;
        indicators.push({
          type: "consumption_without_pump",
          severity: "high",
          description: `Consumption (${record.dailyConsumption.toFixed(2)}) detected with minimal pump activity (${record.statusChanges} cycles) - possible leak`,
          expectedConsumption: parseFloat(avgConsumption.toFixed(2)),
        });
      }

      // 5. Unusually high readings with low consumption (continuous monitoring of leak)
      if (record.totalReadings > avgReadings * 1.5 && record.dailyConsumption < avgConsumption * 0.6) {
        leakScore += 15;
        indicators.push({
          type: "high_readings_low_consumption",
          severity: "medium",
          description: `Many sensor readings (${record.totalReadings}) but low consumption (${record.dailyConsumption.toFixed(2)}) - possible continuous leak monitoring`,
          readingsRatio: parseFloat((record.totalReadings / avgReadings).toFixed(2)),
        });
      }

      // 6. Z-score anomaly detection (statistical outlier)
      const consumptionZScore = consumptionStdDev > 0 
        ? Math.abs((record.dailyConsumption - avgConsumption) / consumptionStdDev)
        : 0;
      const flowZScore = flowRateStdDev > 0
        ? Math.abs((record.avgFlowRate - avgFlowRate) / flowRateStdDev)
        : 0;

      if (consumptionZScore > 2.5 || flowZScore > 2.5) {
        const severity = consumptionZScore > 3.5 || flowZScore > 3.5 ? "high" : "medium";
        leakScore += severity === "high" ? 20 : 10;
        indicators.push({
          type: "statistical_anomaly",
          severity,
          description: `Statistical anomaly detected - consumption Z-score: ${consumptionZScore.toFixed(2)}, flow Z-score: ${flowZScore.toFixed(2)}`,
          consumptionZScore: parseFloat(consumptionZScore.toFixed(2)),
          flowZScore: parseFloat(flowZScore.toFixed(2)),
        });
      }

      // 7. High reset count (pump struggling with pressure - possible leak)
      if (record.resetCount > 3) {
        leakScore += 15;
        indicators.push({
          type: "high_reset_count",
          severity: "medium",
          description: `High reset count (${record.resetCount}) - pump may be struggling with pressure, possible leak`,
        });
      }

      // 8. Minimum flow rate never drops to zero (continuous leak)
      if (record.minFlowRate > 5 && record.statusChanges < avgStatusChanges * 0.5) {
        leakScore += 18;
        indicators.push({
          type: "continuous_minimum_flow",
          severity: "medium",
          description: `Minimum flow rate (${record.minFlowRate.toFixed(2)}) never drops to zero with low cycles - possible continuous leak`,
          minFlowRate: parseFloat(record.minFlowRate.toFixed(2)),
        });
      }

      // 9. Sudden consumption spike (burst pipe)
      if (index > 0) {
        const previousConsumption = data[index - 1].dailyConsumption;
        const consumptionIncrease = ((record.dailyConsumption - previousConsumption) / previousConsumption) * 100;
        
        if (consumptionIncrease > 150 && record.dailyConsumption > avgConsumption * 1.5) {
          leakScore += 30;
          indicators.push({
            type: "sudden_consumption_spike",
            severity: "high",
            description: `Sudden consumption spike: ${consumptionIncrease.toFixed(1)}% increase - possible burst pipe or major leak`,
            previousConsumption: parseFloat(previousConsumption.toFixed(2)),
            currentConsumption: parseFloat(record.dailyConsumption.toFixed(2)),
            increasePercent: parseFloat(consumptionIncrease.toFixed(1)),
          });
        }
      }

      // Only add to leak indicators if score is significant
      if (indicators.length > 0 || leakScore > 20) {
        leakIndicators.push({
          date: record.date,
          dailyConsumption: parseFloat(record.dailyConsumption.toFixed(2)),
          avgFlowRate: parseFloat(record.avgFlowRate.toFixed(2)),
          minFlowRate: parseFloat(record.minFlowRate.toFixed(2)),
          statusChanges: record.statusChanges,
          totalReadings: record.totalReadings,
          resetCount: record.resetCount,
          indicators,
          leakScore: Math.min(100, leakScore),
          leakProbability: leakScore > 60 ? "high" : leakScore > 35 ? "medium" : "low",
        });
      }
    });

    // Calculate overall leak risk score (weighted average)
    const totalLeakScore = leakIndicators.reduce((sum, li) => sum + li.leakScore, 0);
    const avgLeakScore = leakIndicators.length > 0 ? totalLeakScore / leakIndicators.length : 0;
    const leakRiskScore = Math.min(100, (avgLeakScore * leakIndicators.length / data.length) * 1.5);

    // Pattern analysis
    const consecutiveLeakDays = (() => {
      let maxConsecutive = 0;
      let current = 0;
      data.forEach((record, index) => {
        const recordDate = new Date(record.date).toDateString();
        const hasLeak = leakIndicators.some(li => {
          const leakDate = new Date(li.date).toDateString();
          return leakDate === recordDate;
        });
        if (hasLeak) {
          current++;
          maxConsecutive = Math.max(maxConsecutive, current);
        } else {
          current = 0;
        }
      });
      return maxConsecutive;
    })();

    res.status(200).json({
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        roomNumber: user.roomNumber,
      },
        period: { startDate, endDate, period: dateRange.period, count: dateRange.count },
      leakDetection: {
        leakRiskScore: parseFloat(leakRiskScore.toFixed(2)),
        riskLevel: leakRiskScore > 70 ? "high" : leakRiskScore > 40 ? "medium" : leakRiskScore > 20 ? "low" : "minimal",
        suspiciousDays: leakIndicators.length,
        totalDaysAnalyzed: data.length,
        suspiciousDaysPercentage: parseFloat(((leakIndicators.length / data.length) * 100).toFixed(2)),
        consecutiveLeakDays,
        highRiskDays: leakIndicators.filter(li => li.leakProbability === "high").length,
        mediumRiskDays: leakIndicators.filter(li => li.leakProbability === "medium").length,
        lowRiskDays: leakIndicators.filter(li => li.leakProbability === "low").length,
        leakIndicators: leakIndicators.slice(0, 50), // Limit to top 50 for response size
        baseline: {
          avgConsumption: parseFloat(avgConsumption.toFixed(2)),
          avgFlowRate: parseFloat(avgFlowRate.toFixed(2)),
          avgStatusChanges: parseFloat(avgStatusChanges.toFixed(2)),
          avgReadings: parseFloat(avgReadings.toFixed(2)),
          consumptionStdDev: parseFloat(consumptionStdDev.toFixed(2)),
          flowRateStdDev: parseFloat(flowRateStdDev.toFixed(2)),
          baselineDays,
        },
        leakPatterns: {
          continuousLeak: leakIndicators.filter(li => 
            li.indicators.some(i => i.type === "continuous_flow_low_consumption" || i.type === "continuous_flow_no_cycles")
          ).length,
          suddenSpike: leakIndicators.filter(li => 
            li.indicators.some(i => i.type === "sudden_consumption_spike")
          ).length,
          statisticalAnomaly: leakIndicators.filter(li => 
            li.indicators.some(i => i.type === "statistical_anomaly")
          ).length,
          consumptionWithoutPump: leakIndicators.filter(li => 
            li.indicators.some(i => i.type === "consumption_without_pump")
          ).length,
        },
      },
      recommendations: [
        leakRiskScore > 70 
          ? "🚨 URGENT: High leak risk detected. Immediate inspection and repair recommended. Check all water connections, pipes, and fixtures." 
          : null,
        consecutiveLeakDays > 5 
          ? "⚠️ Multiple consecutive days with leak indicators detected. This suggests an ongoing leak that needs immediate attention."
          : consecutiveLeakDays > 3
          ? "⚠️ Several consecutive days with leak indicators - investigate immediately"
          : null,
        leakIndicators.filter(li => li.leakProbability === "high").length > 3
          ? "🔍 High probability leak indicators found on multiple days. Check water connections, pipes, toilets, and faucets."
          : leakIndicators.filter(li => li.leakProbability === "high").length > 0
          ? "🔍 High probability leak indicators found - check water connections and pipes"
          : null,
        leakRiskScore > 40 && leakRiskScore <= 70
          ? "📊 Moderate leak risk detected. Monitor closely and check for minor leaks, dripping faucets, or running toilets."
          : null,
        leakIndicators.filter(li => li.indicators.some(i => i.type === "sudden_consumption_spike")).length > 0
          ? "💥 Sudden consumption spikes detected - possible burst pipe or major leak. Check immediately."
          : null,
        leakIndicators.filter(li => li.indicators.some(i => i.type === "continuous_minimum_flow")).length > 0
          ? "💧 Continuous minimum flow detected - possible slow leak or running toilet. Check fixtures."
          : null,
        leakRiskScore > 20 && leakRiskScore <= 40
          ? "📈 Low leak risk - monitor consumption patterns and check for minor issues."
          : null,
      ].filter(Boolean),
      hasData: true,
      message: null,
      metadata: {
        generatedAt: new Date(),
        threshold: parseFloat(threshold),
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Pump Cycle Analysis - Analyze pump on/off patterns and cycles
 */
const getPumpCycleAnalysis = async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      period = "month",
      count = 1,
      days, // Keep for backward compatibility
      startDate: customStartDate,
      endDate: customEndDate
    } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate date range - support both period and days (backward compatibility)
    let dateRange;
    if (days) {
      // Backward compatibility: use days if provided
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      dateRange = { startDate, endDate, period: "custom", count: parseInt(days) };
    } else {
      dateRange = calculatePeriodDateRange(period, count, customStartDate, customEndDate);
    }
    const { startDate, endDate } = dateRange;

    const data = await Consumption.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: startDate, $lte: endDate }
    })
      .sort({ date: 1 })
      .lean();

    if (data.length === 0) {
      return res.status(200).json({
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          roomNumber: user.roomNumber,
        },
        period: { startDate, endDate, period: dateRange.period, count: dateRange.count },
        cycleStatistics: {
          totalCycles: 0,
          totalResets: 0,
          avgCyclesPerDay: 0,
          avgResetsPerDay: 0,
          avgConsumptionPerCycle: 0,
          resetToCycleRatio: 0,
        },
        patterns: {
          weekdayVsWeekend: {
            avgWeekdayCycles: 0,
            avgWeekendCycles: 0,
            difference: 0,
          },
          excessiveCyclingDays: 0,
          excessiveCyclingDetails: [],
        },
        dailyCycleAnalysis: [],
        insights: {
          pumpHealth: "unknown",
          recommendations: ["No consumption data available yet. Data will appear once water consumption records are created for this user."],
        },
        hasData: false,
        message: "No consumption data found for this period. Data will appear once water consumption records are created.",
        metadata: {
          generatedAt: new Date(),
        },
      });
    }

    // Analyze pump cycles
    const cycleAnalysis = data.map(record => ({
      date: record.date,
      statusChanges: record.statusChanges,
      resetCount: record.resetCount,
      totalReadings: record.totalReadings,
      dailyConsumption: record.dailyConsumption,
      avgFlowRate: record.avgFlowRate,
      cyclesPerReading: record.totalReadings > 0 
        ? parseFloat((record.statusChanges / record.totalReadings).toFixed(4))
        : 0,
      consumptionPerCycle: record.statusChanges > 0 
        ? parseFloat((record.dailyConsumption / record.statusChanges).toFixed(2))
        : 0,
      avgCycleDuration: record.statusChanges > 0 && record.totalReadings > 0
        ? parseFloat((record.totalReadings / record.statusChanges).toFixed(2))
        : 0,
    }));

    // Calculate cycle statistics
    const totalCycles = data.reduce((sum, d) => sum + d.statusChanges, 0);
    const totalResets = data.reduce((sum, d) => sum + d.resetCount, 0);
    const totalReadings = data.reduce((sum, d) => sum + d.totalReadings, 0);
    const avgCyclesPerDay = totalCycles / data.length;
    const avgResetsPerDay = totalResets / data.length;

    // Identify patterns
    const weekdayCycles = [];
    const weekendCycles = [];
    
    data.forEach(record => {
      const dayOfWeek = new Date(record.date).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      if (isWeekend) {
        weekendCycles.push(record.statusChanges);
      } else {
        weekdayCycles.push(record.statusChanges);
      }
    });

    const avgWeekdayCycles = weekdayCycles.length > 0 
      ? weekdayCycles.reduce((a, b) => a + b, 0) / weekdayCycles.length 
      : 0;
    const avgWeekendCycles = weekendCycles.length > 0 
      ? weekendCycles.reduce((a, b) => a + b, 0) / weekendCycles.length 
      : 0;

    // Cycle efficiency
    const avgConsumptionPerCycle = totalCycles > 0 
      ? data.reduce((sum, d) => sum + d.dailyConsumption, 0) / totalCycles 
      : 0;

    // Identify excessive cycling
    const excessiveCyclingDays = cycleAnalysis.filter(ca => 
      ca.statusChanges > avgCyclesPerDay * 2
    );

    res.status(200).json({
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        roomNumber: user.roomNumber,
      },
        period: { startDate, endDate, period: dateRange.period, count: dateRange.count },
      cycleStatistics: {
        totalCycles: totalCycles,
        totalResets: totalResets,
        avgCyclesPerDay: parseFloat(avgCyclesPerDay.toFixed(2)),
        avgResetsPerDay: parseFloat(avgResetsPerDay.toFixed(2)),
        avgConsumptionPerCycle: parseFloat(avgConsumptionPerCycle.toFixed(2)),
        resetToCycleRatio: totalCycles > 0 
          ? parseFloat((totalResets / totalCycles * 100).toFixed(2))
          : 0,
      },
      patterns: {
        weekdayVsWeekend: {
          avgWeekdayCycles: parseFloat(avgWeekdayCycles.toFixed(2)),
          avgWeekendCycles: parseFloat(avgWeekendCycles.toFixed(2)),
          difference: parseFloat((avgWeekdayCycles - avgWeekendCycles).toFixed(2)),
        },
        excessiveCyclingDays: excessiveCyclingDays.length,
        excessiveCyclingDetails: excessiveCyclingDays.slice(0, 10),
      },
      dailyCycleAnalysis: cycleAnalysis,
      insights: {
        pumpHealth: avgCyclesPerDay > 50 ? "high_activity" 
          : avgCyclesPerDay > 20 ? "normal" 
          : avgCyclesPerDay > 5 ? "low_activity" 
          : "minimal_activity",
        recommendations: [
          excessiveCyclingDays.length > 5 
            ? "Excessive pump cycling detected - may indicate pressure issues or leaks" 
            : null,
          totalResets > totalCycles * 0.1 
            ? "High reset count - check pump control system stability" 
            : null,
          avgConsumptionPerCycle < 10 
            ? "Low consumption per cycle - optimize pump operation or check for inefficiencies" 
            : null,
          Math.abs(avgWeekdayCycles - avgWeekendCycles) > avgCyclesPerDay * 0.3
            ? "Significant difference between weekday and weekend usage - consider usage pattern optimization"
            : null,
        ].filter(Boolean),
      },
      hasData: true,
      message: null,
      metadata: {
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Pump Health Monitoring - Comprehensive pump health assessment
 */
const getPumpHealthMonitoring = async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      period = "month",
      count = 1,
      days, // Keep for backward compatibility
      startDate: customStartDate,
      endDate: customEndDate
    } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate date range - support both period and days (backward compatibility)
    let dateRange;
    if (days) {
      // Backward compatibility: use days if provided
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      dateRange = { startDate, endDate, period: "custom", count: parseInt(days) };
    } else {
      dateRange = calculatePeriodDateRange(period, count, customStartDate, customEndDate);
    }
    const { startDate, endDate } = dateRange;

    const data = await Consumption.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: startDate, $lte: endDate }
    })
      .sort({ date: 1 })
      .lean();

    if (data.length === 0) {
      return res.status(200).json({
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          roomNumber: user.roomNumber,
        },
        period: { startDate, endDate, period: dateRange.period, count: dateRange.count },
        pumpHealth: {
          overallHealthScore: 0,
          healthLevel: "no_data",
          trend: "unknown",
          healthIndicators: {
            efficiency: {
              consumptionPerCycle: 0,
              flowRateStability: 0,
              status: "unknown",
            },
            reliability: {
              resetRate: 0,
              cycleConsistency: 0,
              status: "unknown",
            },
            performance: {
              avgFlowRate: 0,
              flowRateRange: {
                min: 0,
                max: 0,
              },
              status: "unknown",
            },
          },
          summary: {
            totalCycles: 0,
            totalResets: 0,
            totalConsumption: 0,
            avgCyclesPerDay: 0,
            avgConsumptionPerDay: 0,
          },
        },
        recommendations: ["No consumption data available yet. Data will appear once water consumption records are created for this user."],
        hasData: false,
        message: "No consumption data found for this period. Data will appear once water consumption records are created.",
        metadata: {
          generatedAt: new Date(),
        },
      });
    }

    // Calculate health metrics
    const totalConsumption = data.reduce((sum, d) => sum + d.dailyConsumption, 0);
    const totalCycles = data.reduce((sum, d) => sum + d.statusChanges, 0);
    const totalResets = data.reduce((sum, d) => sum + d.resetCount, 0);
    const totalReadings = data.reduce((sum, d) => sum + d.totalReadings, 0);
    const avgFlowRate = data.reduce((sum, d) => sum + d.avgFlowRate, 0) / data.length;

    // Health indicators
    const healthIndicators = {
      efficiency: {
        consumptionPerCycle: totalCycles > 0 
          ? parseFloat((totalConsumption / totalCycles).toFixed(2))
          : 0,
        flowRateStability: (() => {
          const flowRates = data.map(d => d.avgFlowRate);
          const avg = flowRates.reduce((a, b) => a + b, 0) / flowRates.length;
          const variance = flowRates.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / flowRates.length;
          const stdDev = Math.sqrt(variance);
          return avg > 0 ? parseFloat((stdDev / avg * 100).toFixed(2)) : 0;
        })(),
        status: (() => {
          const efficiency = totalCycles > 0 ? totalConsumption / totalCycles : 0;
          if (efficiency > 50) return "excellent";
          if (efficiency > 25) return "good";
          if (efficiency > 10) return "fair";
          return "poor";
        })(),
      },
      reliability: {
        resetRate: totalCycles > 0 
          ? parseFloat((totalResets / totalCycles * 100).toFixed(2))
          : 0,
        cycleConsistency: (() => {
          const cycles = data.map(d => d.statusChanges);
          const avg = cycles.reduce((a, b) => a + b, 0) / cycles.length;
          const variance = cycles.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / cycles.length;
          const stdDev = Math.sqrt(variance);
          return avg > 0 ? parseFloat((stdDev / avg * 100).toFixed(2)) : 0;
        })(),
        status: (() => {
          const resetRate = totalCycles > 0 ? totalResets / totalCycles : 0;
          if (resetRate < 5) return "excellent";
          if (resetRate < 10) return "good";
          if (resetRate < 20) return "fair";
          return "poor";
        })(),
      },
      performance: {
        avgFlowRate: parseFloat(avgFlowRate.toFixed(2)),
        flowRateRange: {
          min: Math.min(...data.map(d => d.minFlowRate)),
          max: Math.max(...data.map(d => d.maxFlowRate)),
        },
        status: (() => {
          if (avgFlowRate > 50) return "excellent";
          if (avgFlowRate > 25) return "good";
          if (avgFlowRate > 10) return "fair";
          return "poor";
        })(),
      },
    };

    // Calculate overall health score (0-100)
    let healthScore = 100;
    
    // Deduct for low efficiency
    if (healthIndicators.efficiency.consumptionPerCycle < 10) healthScore -= 20;
    else if (healthIndicators.efficiency.consumptionPerCycle < 25) healthScore -= 10;
    
    // Deduct for high reset rate
    if (healthIndicators.reliability.resetRate > 20) healthScore -= 20;
    else if (healthIndicators.reliability.resetRate > 10) healthScore -= 10;
    
    // Deduct for flow rate instability
    if (healthIndicators.efficiency.flowRateStability > 30) healthScore -= 15;
    else if (healthIndicators.efficiency.flowRateStability > 20) healthScore -= 7;
    
    // Deduct for low flow rate
    if (healthIndicators.performance.avgFlowRate < 10) healthScore -= 15;
    else if (healthIndicators.performance.avgFlowRate < 25) healthScore -= 7;

    healthScore = Math.max(0, Math.min(100, healthScore));

    // Trend analysis
    const recentData = data.slice(-7);
    const earlierData = data.slice(0, 7);
    const recentAvgEfficiency = recentData.reduce((sum, d) => 
      sum + (d.statusChanges > 0 ? d.dailyConsumption / d.statusChanges : 0), 0) / recentData.length;
    const earlierAvgEfficiency = earlierData.length > 0 
      ? earlierData.reduce((sum, d) => sum + (d.statusChanges > 0 ? d.dailyConsumption / d.statusChanges : 0), 0) / earlierData.length 
      : recentAvgEfficiency;

    const trend = recentAvgEfficiency > earlierAvgEfficiency * 1.1 ? "improving"
      : recentAvgEfficiency < earlierAvgEfficiency * 0.9 ? "declining"
      : "stable";

    res.status(200).json({
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        roomNumber: user.roomNumber,
      },
        period: { startDate, endDate, period: dateRange.period, count: dateRange.count },
      pumpHealth: {
        overallHealthScore: parseFloat(healthScore.toFixed(2)),
        healthLevel: healthScore > 80 ? "excellent" 
          : healthScore > 60 ? "good" 
          : healthScore > 40 ? "fair" 
          : "needs_attention",
        trend,
        healthIndicators,
        summary: {
          totalCycles: totalCycles,
          totalResets: totalResets,
          totalConsumption: parseFloat(totalConsumption.toFixed(2)),
          avgCyclesPerDay: parseFloat((totalCycles / data.length).toFixed(2)),
          avgConsumptionPerDay: parseFloat((totalConsumption / data.length).toFixed(2)),
        },
      },
      recommendations: [
        healthScore < 40 
          ? "URGENT: Pump health is poor. Immediate maintenance recommended." 
          : null,
        healthIndicators.reliability.resetRate > 15 
          ? "High reset rate detected - check pump control system and electrical connections" 
          : null,
        healthIndicators.efficiency.consumptionPerCycle < 15 
          ? "Low consumption per cycle - possible pump inefficiency or system issues" 
          : null,
        healthIndicators.efficiency.flowRateStability > 25 
          ? "Unstable flow rate - check for pressure issues or pump wear" 
          : null,
        trend === "declining" 
          ? "Pump performance is declining - schedule maintenance check" 
          : null,
        healthScore > 60 && healthScore <= 80 
          ? "Pump health is good but monitor for any changes" 
          : null,
      ].filter(Boolean),
      hasData: true,
      message: null,
      metadata: {
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Pump Operation Optimization - Recommendations for optimal pump operation
 */
const getPumpOperationOptimization = async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      period = "month",
      count = 1,
      days, // Keep for backward compatibility
      startDate: customStartDate,
      endDate: customEndDate
    } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate date range - support both period and days (backward compatibility)
    let dateRange;
    if (days) {
      // Backward compatibility: use days if provided
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      dateRange = { startDate, endDate, period: "custom", count: parseInt(days) };
    } else {
      dateRange = calculatePeriodDateRange(period, count, customStartDate, customEndDate);
    }
    const { startDate, endDate } = dateRange;

    const data = await Consumption.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: startDate, $lte: endDate }
    })
      .sort({ date: 1 })
      .lean();

    if (data.length === 0) {
      return res.status(200).json({
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          roomNumber: user.roomNumber,
        },
        period: { startDate, endDate, period: dateRange.period, count: dateRange.count },
        currentOperation: {
          avgConsumptionPerDay: 0,
          avgCyclesPerDay: 0,
          avgConsumptionPerCycle: 0,
          efficiencyScore: 0,
        },
        optimalOperation: {
          recommendedConsumptionPerCycle: 0,
          optimalDaysCount: 0,
          optimalDaysPercentage: 0,
        },
        optimizations: [],
        potentialSavings: {
          reducedCycling: null,
          improvedEfficiency: null,
        },
        actionPlan: [],
        hasData: false,
        message: "No consumption data found for this period. Data will appear once water consumption records are created.",
        metadata: {
          generatedAt: new Date(),
        },
      });
    }

    // Analyze operation patterns
    const totalConsumption = data.reduce((sum, d) => sum + d.dailyConsumption, 0);
    const totalCycles = data.reduce((sum, d) => sum + d.statusChanges, 0);
    const avgConsumptionPerDay = totalConsumption / data.length;
    const avgCyclesPerDay = totalCycles / data.length;
    const avgConsumptionPerCycle = totalCycles > 0 ? totalConsumption / totalCycles : 0;

    // Identify optimal operation parameters
    const optimalDays = data.filter(d => 
      d.statusChanges > 0 && 
      (d.dailyConsumption / d.statusChanges) > avgConsumptionPerCycle * 0.8 &&
      d.statusChanges < avgCyclesPerDay * 1.5
    );

    const optimalConsumptionPerCycle = optimalDays.length > 0
      ? optimalDays.reduce((sum, d) => sum + (d.dailyConsumption / d.statusChanges), 0) / optimalDays.length
      : avgConsumptionPerCycle;

    // Calculate efficiency metrics
    const efficiencyScore = (() => {
      let score = 100;
      
      // Deduct for excessive cycling
      if (avgCyclesPerDay > 50) score -= 20;
      else if (avgCyclesPerDay > 30) score -= 10;
      
      // Deduct for low consumption per cycle
      if (avgConsumptionPerCycle < 15) score -= 20;
      else if (avgConsumptionPerCycle < 25) score -= 10;
      
      // Add bonus for optimal operation
      if (optimalDays.length > data.length * 0.6) score += 10;
      
      return Math.max(0, Math.min(100, score));
    })();

    // Generate optimization recommendations
    const optimizations = [];

    if (avgCyclesPerDay > 40) {
      optimizations.push({
        type: "reduce_cycling",
        priority: "high",
        description: "Pump is cycling too frequently",
        recommendation: "Increase pump runtime per cycle or check for pressure issues causing frequent on/off cycles",
        expectedImpact: "Reduce wear, improve efficiency, lower energy consumption",
      });
    }

    if (avgConsumptionPerCycle < 20) {
      optimizations.push({
        type: "improve_cycle_efficiency",
        priority: "high",
        description: "Low water delivery per pump cycle",
        recommendation: "Optimize pump operation timing or check for system inefficiencies",
        expectedImpact: "Increase water delivery efficiency, reduce pump wear",
      });
    }

    const flowRates = data.map(d => d.avgFlowRate);
    const avgFlowRate = flowRates.reduce((a, b) => a + b, 0) / flowRates.length;
    const flowRateVariance = flowRates.reduce((sum, val) => sum + Math.pow(val - avgFlowRate, 2), 0) / flowRates.length;
    const flowRateStdDev = Math.sqrt(flowRateVariance);

    if (flowRateStdDev > avgFlowRate * 0.3) {
      optimizations.push({
        type: "stabilize_flow_rate",
        priority: "medium",
        description: "Inconsistent flow rates detected",
        recommendation: "Check pressure regulation and pump settings for consistent operation",
        expectedImpact: "Improve system stability and water delivery consistency",
      });
    }

    const resetRate = data.reduce((sum, d) => sum + d.resetCount, 0) / totalCycles * 100;
    if (resetRate > 10) {
      optimizations.push({
        type: "reduce_resets",
        priority: "medium",
        description: "High number of pump resets",
        recommendation: "Investigate control system stability and electrical connections",
        expectedImpact: "Improve reliability and reduce maintenance needs",
      });
    }

    // Calculate potential savings
    const potentialSavings = {
      reducedCycling: avgCyclesPerDay > 40 
        ? {
            currentCycles: avgCyclesPerDay,
            recommendedCycles: avgCyclesPerDay * 0.7,
            reduction: parseFloat((avgCyclesPerDay * 0.3).toFixed(2)),
            impact: "Reduce pump wear and energy consumption by ~30%",
          }
        : null,
      improvedEfficiency: avgConsumptionPerCycle < 20
        ? {
            currentEfficiency: parseFloat(avgConsumptionPerCycle.toFixed(2)),
            targetEfficiency: parseFloat((avgConsumptionPerCycle * 1.5).toFixed(2)),
            improvement: "50% increase in water delivery per cycle",
            impact: "Better water utilization and reduced cycling",
          }
        : null,
    };

    res.status(200).json({
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        roomNumber: user.roomNumber,
      },
        period: { startDate, endDate, period: dateRange.period, count: dateRange.count },
      currentOperation: {
        avgConsumptionPerDay: parseFloat(avgConsumptionPerDay.toFixed(2)),
        avgCyclesPerDay: parseFloat(avgCyclesPerDay.toFixed(2)),
        avgConsumptionPerCycle: parseFloat(avgConsumptionPerCycle.toFixed(2)),
        efficiencyScore: parseFloat(efficiencyScore.toFixed(2)),
      },
      optimalOperation: {
        recommendedConsumptionPerCycle: parseFloat(optimalConsumptionPerCycle.toFixed(2)),
        optimalDaysCount: optimalDays.length,
        optimalDaysPercentage: parseFloat((optimalDays.length / data.length * 100).toFixed(2)),
      },
      optimizations,
      potentialSavings,
      actionPlan: optimizations
        .filter(o => o.priority === "high")
        .map(o => ({
          action: o.recommendation,
          priority: o.priority,
          expectedImpact: o.expectedImpact,
        })),
      hasData: true,
      message: null,
      metadata: {
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
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
  getPumpOperationOptimization,
};
