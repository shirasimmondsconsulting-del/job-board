const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Normalize origin by removing trailing slash for comparison
    const normalizedOrigin = origin.replace(/\/$/, "");

    const allowedOrigins = [
      process.env.CLIENT_URL,
      "http://localhost:5173", // Vite dev server
      "http://localhost:3000", // React dev server
      "http://localhost:3001", // React dev server (alt port)
      "http://localhost:3002", // React dev server (alt port)
      "http://10.8.24.87:3001", // Local IP for mobile testing
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
      "http://127.0.0.1:3002",
      "https://www.habaytajobs.com",
      "https://habaytajobs.com",
      "https://job-board-yahk.onrender.com", // Backend URL (for API testing)
    ].map((url) => url && url.replace(/\/$/, "")); // Remove trailing slashes from all allowed origins

    // console.log(`🔍 CORS Check - Origin: ${normalizedOrigin}`);
    // console.log(`✅ Allowed Origins:`, allowedOrigins.filter(Boolean));

    if (allowedOrigins.indexOf(normalizedOrigin) !== -1) {
      console.log(`✅ Origin allowed: ${normalizedOrigin}`);
      callback(null, true);
    } else {
      console.log(`❌ Origin blocked: ${normalizedOrigin}`);
      callback(new Error(`Not allowed by CORS. Origin: ${normalizedOrigin}`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ]
};

module.exports = cors(corsOptions);