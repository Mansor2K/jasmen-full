require("dotenv").config();
require("../mongo_connection/mongo");
const Consumption = require("../model/consumption");
const User = require("../model/user");
const mongoose = require("mongoose");

/**
 * Script to remove fake/seed consumption data
 * Can remove all data or data for specific users
 */

// Helper function to format date as YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Main function to cleanup data
const cleanupConsumptionData = async () => {
  try {
    console.log("🧹 Starting consumption data cleanup...\n");

    // Get command line arguments
    const args = process.argv.slice(2);
    const removeAll = args.includes('--all');
    const userIdArg = args.find(arg => arg.startsWith('--userId='));
    const dateRangeArg = args.find(arg => arg.startsWith('--dateRange='));
    const confirmArg = args.includes('--confirm');

    if (!confirmArg && !removeAll && !userIdArg && !dateRangeArg) {
      console.log("⚠️  WARNING: This script will delete consumption data!");
      console.log("\nUsage options:");
      console.log("  --all                    : Remove ALL consumption data (use with --confirm)");
      console.log("  --userId=<userId>        : Remove data for specific user (use with --confirm)");
      console.log("  --dateRange=<start,end>   : Remove data in date range (use with --confirm)");
      console.log("  --confirm                : Confirm deletion");
      console.log("\nExamples:");
      console.log("  node scripts/cleanupConsumptionData.js --all --confirm");
      console.log("  node scripts/cleanupConsumptionData.js --userId=507f1f77bcf86cd799439011 --confirm");
      console.log("  node scripts/cleanupConsumptionData.js --dateRange=2024-01-01,2024-12-31 --confirm");
      process.exit(0);
    }

    if (!confirmArg) {
      console.log("❌ Please use --confirm flag to proceed with deletion");
      process.exit(1);
    }

    let query = {};
    let description = "";

    // Build query based on options
    if (removeAll) {
      description = "ALL consumption data";
      query = {};
    } else if (userIdArg) {
      const userId = userIdArg.split('=')[1];
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.log("❌ Invalid userId format");
        process.exit(1);
      }
      const user = await User.findById(userId);
      if (!user) {
        console.log(`❌ User with ID ${userId} not found`);
        process.exit(1);
      }
      description = `consumption data for user: ${user.userName} (${user.email})`;
      query = { userId: new mongoose.Types.ObjectId(userId) };
    } else if (dateRangeArg) {
      const dateRange = dateRangeArg.split('=')[1];
      const [startDateStr, endDateStr] = dateRange.split(',');
      
      if (!startDateStr || !endDateStr) {
        console.log("❌ Invalid date range format. Use: --dateRange=YYYY-MM-DD,YYYY-MM-DD");
        process.exit(1);
      }

      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      endDate.setHours(23, 59, 59, 999);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.log("❌ Invalid date format. Use: YYYY-MM-DD");
        process.exit(1);
      }

      description = `consumption data from ${formatDate(startDate)} to ${formatDate(endDate)}`;
      query = {
        date: {
          $gte: startDate,
          $lte: endDate
        }
      };
    } else {
      console.log("❌ Please specify --all, --userId, or --dateRange");
      process.exit(1);
    }

    // Count records to be deleted
    const countToDelete = await Consumption.countDocuments(query);
    
    if (countToDelete === 0) {
      console.log(`ℹ️  No records found matching the criteria`);
      process.exit(0);
    }

    console.log(`⚠️  About to delete ${countToDelete} records (${description})`);
    console.log("⏳ Deleting...\n");

    // Delete records
    const result = await Consumption.deleteMany(query);

    console.log("=".repeat(50));
    console.log("🗑️  Cleanup Summary:");
    console.log(`   ✅ Records deleted: ${result.deletedCount}`);
    console.log(`   📋 Description: ${description}`);
    console.log("=".repeat(50));
    console.log("\n✨ Cleanup completed successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error cleaning up consumption data:", error);
    process.exit(1);
  }
};

// Run the cleanup function
cleanupConsumptionData();

