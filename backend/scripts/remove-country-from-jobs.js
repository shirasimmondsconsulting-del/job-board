/*
  Destructive migration: remove stored location.country from all Job documents.
  Usage:
    node scripts/remove-country-from-jobs.js
  IMPORTANT: This is destructive — values will be permanently removed.
*/

require('dotenv').config()
const connectDB = require('../src/config/database')
const mongoose = require('mongoose')
const Job = require('../src/models/Job')

async function run() {
  await connectDB()

  try {
    const res = await Job.updateMany(
      { 'location.country': { $exists: true } },
      { $unset: { 'location.country': '' } }
    )

    console.log(`✅ Removed country from ${res.modifiedCount} job(s).`)
    process.exit(0)
  } catch (err) {
    console.error('Failed to remove country:', err)
    process.exit(1)
  } finally {
    try { await mongoose.disconnect() } catch (e) { /* ignore */ }
  }
}

run()
