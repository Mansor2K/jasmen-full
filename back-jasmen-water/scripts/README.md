# Consumption Data Scripts

This directory contains scripts for seeding and cleaning up consumption data for testing purposes.

## Scripts

### 1. Seed Consumption Data (`seedConsumptionData.js`)

Generates fake consumption data for all users over the past year with realistic variations.

**Features:**
- Generates data for the past 365 days
- Creates realistic consumption patterns with:
  - Weekend variations (higher consumption on weekends)
  - Seasonal variations (higher in summer months)
  - Daily random variations
  - Pump-related metrics (flow rates, cycles, resets)
- Skips existing records (won't duplicate data)
- Shows progress for each user

**Usage:**

```bash
# Using npm script
npm run seed:consumption

# Or directly with node
node scripts/seedConsumptionData.js
```

**What it does:**
- Finds all non-admin users in the database
- Generates consumption records for each day in the past year
- Creates realistic data with variations based on:
  - Day of week (weekends have higher consumption)
  - Month (summer months have higher consumption)
  - User's consumption limit (if set)
- Skips dates that already have consumption records

**Example Output:**
```
🌱 Starting consumption data seeding...

📊 Found 5 users to seed data for

📅 Date range: 2023-12-01 to 2024-12-01

👤 Processing user: John Doe (john@example.com)
   ✅ Created: 365 records
   ⏭️  Skipped: 0 existing records

👤 Processing user: Jane Smith (jane@example.com)
   ✅ Created: 365 records
   ⏭️  Skipped: 0 existing records

==================================================
📈 Seeding Summary:
   ✅ Total records created: 1825
   ⏭️  Total records skipped: 0
   👥 Users processed: 5
==================================================

✨ Seeding completed successfully!
```

---

### 2. Cleanup Consumption Data (`cleanupConsumptionData.js`)

Removes consumption data based on various criteria.

**Usage:**

```bash
# Using npm script
npm run cleanup:consumption

# Or directly with node
node scripts/cleanupConsumptionData.js
```

**Options:**

1. **Remove ALL consumption data:**
   ```bash
   node scripts/cleanupConsumptionData.js --all --confirm
   ```

2. **Remove data for a specific user:**
   ```bash
   node scripts/cleanupConsumptionData.js --userId=507f1f77bcf86cd799439011 --confirm
   ```

3. **Remove data in a date range:**
   ```bash
   node scripts/cleanupConsumptionData.js --dateRange=2024-01-01,2024-12-31 --confirm
   ```

**Safety:**
- Requires `--confirm` flag to proceed with deletion
- Shows count of records to be deleted before deletion
- Provides clear summary after deletion

**Example Output:**
```
🧹 Starting consumption data cleanup...

⚠️  About to delete 1825 records (ALL consumption data)
⏳ Deleting...

==================================================
🗑️  Cleanup Summary:
   ✅ Records deleted: 1825
   📋 Description: ALL consumption data
==================================================

✨ Cleanup completed successfully!
```

---

## Testing Endpoints

After seeding data, you can test all the consumption analysis endpoints:

### Period-based queries:
```bash
# Get consumption by period
GET /GetConsumptionByPeriod/:userId?period=month&count=3

# Get consumption analysis
GET /GetConsumptionAnalysis/:userId?period=week&count=4

# Get forecast
GET /GetConsumptionForecast/:userId?period=month&count=2

# Get correlation analysis
GET /GetConsumptionCorrelation/:userId?period=month&count=1
```

### Custom date range queries:
```bash
# Get consumption for specific date range
GET /GetConsumptionForecast/:userId?startDate=2024-01-01&endDate=2024-06-30

# Get pump efficiency analysis
GET /GetPumpEfficiencyAnalysis/:userId?startDate=2024-01-01&endDate=2024-03-31
```

---

## Notes

- **Database Connection**: Scripts use the same database connection as the main application (`mongo_connection/mongo.js`)
- **Existing Data**: The seed script will skip dates that already have consumption records
- **Realistic Data**: Generated data includes realistic patterns:
  - Higher consumption on weekends
  - Seasonal variations (summer months)
  - Pump cycles and flow rates
  - Reset counts and status changes
- **Performance**: For large numbers of users, the seeding process may take several minutes

---

## Troubleshooting

**Error: "No users found"**
- Make sure you have users in the database (non-admin users)
- Users must have valid ObjectIds

**Error: "Connection failed"**
- Check your MongoDB connection string in `mongo_connection/mongo.js`
- Ensure MongoDB is running

**Script runs slowly**
- This is normal for large datasets
- The script processes one user at a time to avoid memory issues
- Progress is shown for each user

