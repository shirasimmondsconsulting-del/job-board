const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../src/models/User');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const deleteUsers = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        const result = await User.deleteMany({});
        console.log(`Deleted ${result.deletedCount} users from the database.`);

        process.exit(0);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};

deleteUsers();
