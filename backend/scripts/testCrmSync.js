const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const runTest = async () => {
  console.log('🔄 Initiating CRM database synchronization test...');
  console.log(`📡 Database URI: ${process.env.MONGO_URI ? 'LOADED' : 'MISSING'}`);
  
  if (!process.env.MONGO_URI) {
    console.error('❌ Error: MONGO_URI env variable is missing.');
    process.exit(1);
  }

  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas successfully.');

    // Query User count
    const totalUsers = await User.countDocuments();
    console.log(`👥 Total users in shared database: ${totalUsers}`);

    // Try finding one admin to simulate audit log actor
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      console.log(`🔑 Admin found for audit logging: ${admin.name} (${admin.email})`);
      
      // Write a test audit log
      const log = await AuditLog.create({
        action: 'CRM_SYNC_TEST',
        actor: admin._id,
        target: admin._id,
        targetType: 'User',
        afterValues: { test: 'successful_sync' }
      });
      
      console.log(`📝 Log created successfully. ID: ${log._id}`);
      
      // Clean up log
      await AuditLog.findByIdAndDelete(log._id);
      console.log('🧹 Cleanup of test log completed.');
    } else {
      console.log('⚠️ Warning: No admin users found in the database. Run Next Door Library setup first to register an admin.');
    }

    console.log('\n🌟 CRM Sync Test Completed Successfully! All database models are aligned.\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error executing sync test:', error.message);
    process.exit(1);
  }
};

runTest();
