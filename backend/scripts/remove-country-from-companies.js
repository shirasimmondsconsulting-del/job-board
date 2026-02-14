/*
  Destructive migration: remove stored headquarters.country from all Company documents.
  Usage: node scripts/remove-country-from-companies.js
  IMPORTANT: Run a DB backup before running this on production.
*/

require('dotenv').config();
const mongoose = require('mongoose');

const Company = require('../src/models/Company');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function run() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not set. Aborting.');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    const res = await Company.updateMany(
      { 'headquarters.country': { $exists: true } },
      { $unset: { 'headquarters.country': '' } }
    );

    console.log(`✅ Removed country from ${res.modifiedCount} company(s).`);
  } catch (err) {
    console.error('Failed to remove country from companies:', err);
    process.exitCode = 2;
  } finally {
    await mongoose.disconnect();
  }
}

run();
