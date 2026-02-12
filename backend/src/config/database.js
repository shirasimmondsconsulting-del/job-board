const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    console.log("🔄 Connecting to MongoDB...");
    const dbHost = mongoUri.includes("@")
      ? mongoUri.split("@")[1].split("/")[0]
      : "localhost";
    console.log(`📍 Connecting to: ${dbHost}`);

    // Simplified options - removed deprecated ones
    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
      tls: true, // TLS enable karein
      tlsInsecure: true, // Local network restrictions bypass karne ke liye
    };

    await mongoose.connect(mongoUri, options);

    console.log("✅ MongoDB connected successfully");
    console.log(`📊 Database: ${mongoose.connection.name}`);

    // Monitor connection
    mongoose.connection.on("disconnected", () => {
      console.log("❌ MongoDB disconnected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err.message);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
    
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection failed!');
    console.error('Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check your internet connection');
    console.error('   2. Verify MongoDB Atlas cluster is running (not paused)');
    console.error('   3. Check IP whitelist: https://cloud.mongodb.com → Network Access');
    console.error('   4. Verify username and password in connection string');
    throw error;
  }
};

module.exports = connectDB;