/*
  Destructive migration: remove applicationDeadline from all Job documents.
  Usage:
    node scripts/remove-application-deadline.js
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
      { applicationDeadline: { $exists: true } },
      { $unset: { applicationDeadline: '' } }
    )

    console.log(`✅ Removed applicationDeadline from ${res.modifiedCount} job(s).`)
    process.exit(0)
  } catch (err) {
    console.error('Failed to remove applicationDeadline:', err)
    process.exit(1)
  } finally {
    try { await mongoose.disconnect() } catch (e) { /* ignore */ }
  }
}

run()
