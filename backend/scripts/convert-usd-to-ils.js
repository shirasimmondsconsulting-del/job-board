/*
  Migration script — convert job salaries from USD to ILS.
  Usage:
    EXCHANGE_USD_TO_ILS=3.6 node scripts/convert-usd-to-ils.js
  Defaults to 3.6 if EXCHANGE_USD_TO_ILS is not provided.
*/

require('dotenv').config()
const connectDB = require('../src/config/database')
const mongoose = require('mongoose')
const Job = require('../src/models/Job')

async function run() {
  const rate = parseFloat(process.env.EXCHANGE_USD_TO_ILS) || 3.6
  console.log(`🔁 Converting USD -> ILS using rate = ${rate}`)

  await connectDB()

  try {
    const filter = { 'salary.currency': 'USD', $or: [ { 'salary.minSalary': { $exists: true } }, { 'salary.maxSalary': { $exists: true } } ] }
    const jobs = await Job.find(filter).lean()

    if (!jobs.length) {
      console.log('✅ No jobs with USD salaries found. Nothing to do.')
      process.exit(0)
    }

    console.log(`⚠️ Found ${jobs.length} job(s) with USD salaries — converting now...`)

    let updated = 0
    for (const j of jobs) {
      const update = {}
      if (j.salary?.minSalary) update['salary.minSalary'] = Math.round(j.salary.minSalary * rate)
      if (j.salary?.maxSalary) update['salary.maxSalary'] = Math.round(j.salary.maxSalary * rate)
      update['salary.currency'] = 'ILS'

      await Job.updateOne({ _id: j._id }, { $set: update })
      updated++
      console.log(`  • Job ${j._id} — ${j.salary.minSalary || '-'}-${j.salary.maxSalary || '-'} USD -> ${update['salary.minSalary'] || '-'}-${update['salary.maxSalary'] || '-'} ILS`)
    }

    console.log(`✅ Migration complete — ${updated} job(s) updated to ILS.`)
    process.exit(0)
  } catch (err) {
    console.error('Migration failed:', err)
    process.exit(1)
  } finally {
    // allow graceful exit
    try { await mongoose.disconnect() } catch (e) { /* ignore */ }
  }
}

run()
