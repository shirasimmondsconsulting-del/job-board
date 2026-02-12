require('dotenv').config();
const app = require('./src/app');
const connectDB = require("./src/config/database");
// const { setServers } = require('dns');

// setServers(['1.1.1.1', '8.8.8.8']);
const PORT = process.env.PORT || 5000;

// Start server function
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();

    // Then start the server
    const server = app.listen(PORT, () => {
      console.log(
        `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`,
      );
      console.log(`🔗 Client URL: ${process.env.CLIENT_URL || "Not Set"}`);
    });

    // Handle shutdown gracefully
    const gracefulShutdown = () => {
      console.log("\n🔄 Shutting down gracefully...");
      server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
      });
    };

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      console.error("Unhandled Rejection:", err);
      gracefulShutdown();
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (err) => {
      console.error("Uncaught Exception:", err);
      gracefulShutdown();
    });

    // Handle SIGTERM
    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});