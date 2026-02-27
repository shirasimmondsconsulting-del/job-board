/**
 * Transforms scraped job datasets into the app's internal job format.
 * Jobs from this source get source: 'external' so the UI shows an external-redirect Apply.
 *
 * ─── HOW TO ADD A NEW MONTH'S DATA ─────────────────────────────────────────
 *  1. Drop the new JSON file into  src/assets/
 *  2. Update the import below to include the new file OR use import.meta.glob pattern
 *  3. Add it to the `allDatasets` array
 * ────────────────────────────────────────────────────────────────────────────
 */

// Import dataset(s)
import dataset_2026_02 from '../assets/dataset_indeed-scraper_2026-02-22_13-28-07-423.json'

// Combine all datasets
const allDatasets = [dataset_2026_02]

// Flatten all datasets into one array
const rawJobs = allDatasets.flatMap((dataset) => (Array.isArray(dataset) ? dataset : []))

// Debug: Check raw import
if (typeof window !== 'undefined') {
  console.log('📦 Raw Dataset Import:', {
    allDatasets: allDatasets.length,
    dataset_2026_02_length: dataset_2026_02.length,
    rawJobs: rawJobs.length
  })
}

// ---------------------------------------------------------------------------
// City mapping: Hebrew → English (matching the filter dropdown values)
// ---------------------------------------------------------------------------
const CITY_MAP = {
  'תל אביב -יפו': 'Tel Aviv',
  'תל אביב-יפו': 'Tel Aviv',
  'תל אביב': 'Tel Aviv',
  'ירושלים': 'Jerusalem',
  'חיפה': 'Haifa',
  'פתח תקווה': 'Petah Tikva',
  'פתח-תקווה': 'Petah Tikva',
  'ראשון לציון': 'Tel Aviv',
  'בני ברק': 'Tel Aviv',
  'נתניה': 'Sharon',
  'הרצליה': 'Tel Aviv',
  'רמת גן': 'Tel Aviv',
  'אשדוד': 'South',
  'באר שבע': 'South',
  'רחובות': 'Tel Aviv',
  'כפר סבא': 'Sharon',
  'רעננה': 'Sharon',
  'הוד השרון': 'Sharon',
  'נס ציונה': 'Tel Aviv',
  'מודיעין': 'Tel Aviv',
  'מודיעין-מכבים-רעות': 'Tel Aviv',
  'אילת': 'South',
  'חולון': 'Tel Aviv',
  'בת ים': 'Tel Aviv',
  'לוד': 'Tel Aviv',
  'רמלה': 'Tel Aviv',
  'עפולה': 'North',
  'נצרת': 'North',
  'כרמיאל': 'North',
  'טבריה': 'North',
  'קריית שמונה': 'North',
  'צפת': 'North',
  'אשקלון': 'South',
  'קריית גת': 'South',
  'דימונה': 'South',
  'ערד': 'South',
  'אריאל': 'Shomron',
  'מעלה אדומים': 'Jerusalem',
  'בית שמש': 'Jerusalem',
  'גוש עציון': 'Gush Etzion',
  'פתח תקווה': 'Petah Tikva',
}

function mapCity(cityStr) {
  if (!cityStr) return 'Israel'
  // Exact match
  if (CITY_MAP[cityStr]) return CITY_MAP[cityStr]
  // Partial / prefix match
  for (const [heb, eng] of Object.entries(CITY_MAP)) {
    if (cityStr.startsWith(heb) || cityStr.includes(heb)) return eng
  }
  // Fall back to raw value (may be English already or unknown Hebrew)
  return cityStr
}

// ---------------------------------------------------------------------------
// Industry guesser based on title + description keywords
// ---------------------------------------------------------------------------
const INDUSTRY_RULES = [
  {
    key: 'tech',
    keywords: [
      'software', 'developer', 'engineer', 'tech', 'data', 'devops', 'cyber',
      'programmer', 'coding', 'frontend', 'backend', 'fullstack', 'qa', 'testing',
      'cloud', 'it ', 'network', 'security', 'ai ', 'machine learning', 'r&d',
      'product manager', 'scrum', 'agile', 'architect', 'infrastructure',
    ],
  },
  {
    key: 'finance',
    keywords: [
      'finance', 'accounting', 'financial', 'bank', 'investment', 'cfo', 'budget',
      'payroll', 'bookkeeping', 'tax', 'audit', 'controller', 'treasurer',
      'insurance', 'actuar',
    ],
  },
  {
    key: 'marketing',
    keywords: [
      'marketing', 'brand', 'content', 'seo', 'social media', 'campaign',
      'copywriter', 'advertising', 'pr ', 'public relations', 'growth', 'crm',
      'digital media', 'email marketing',
    ],
  },
  {
    key: 'healthcare',
    keywords: [
      'health', 'medical', 'nurse', 'doctor', 'clinical', 'pharma', 'hospital',
      'therapist', 'dentist', 'pharmacy', 'biotech', 'life sciences', 'laboratory',
    ],
  },
  {
    key: 'education',
    keywords: [
      'teach', 'education', 'school', 'tutor', 'professor', 'faculty',
      'curriculum', 'instructor', 'academy', 'university', 'college',
    ],
  },
]

function guessIndustry(title = '', description = '') {
  const text = (title + ' ' + description).toLowerCase()
  for (const rule of INDUSTRY_RULES) {
    if (rule.keywords.some((kw) => text.includes(kw))) return rule.key
  }
  return 'tech' // default
}

// ---------------------------------------------------------------------------
// Source label (platform name shown on button)
// ---------------------------------------------------------------------------
function getSourceLabel(jobUrl = '') {
  if (jobUrl.includes('indeed.com')) return 'Indeed'
  if (jobUrl.includes('linkedin.com')) return 'LinkedIn'
  if (jobUrl.includes('glassdoor.com')) return 'Glassdoor'
  return 'External Site'
}

// ---------------------------------------------------------------------------
// Main transformer
// ---------------------------------------------------------------------------
const transformedJobs = rawJobs
  .filter((job) => job.jobKey && job.title) // keep all jobs, expired or not
  .map((job, index) => {
    const city = job.location?.city || ''
    const enCity = mapCity(city)
    const jobType =
      Array.isArray(job.jobType) && job.jobType.length > 0
        ? job.jobType[0]
        : 'Full-time'
    const isRemote = job.isRemote || false
    const industry = guessIndustry(job.title, job.descriptionText)

    // Salary
    let salaryRange = 'Competitive'
    const sal = job.salary || {}
    if (sal.minSalary && sal.maxSalary) {
      salaryRange = `₪${Number(sal.minSalary).toLocaleString()} – ₪${Number(sal.maxSalary).toLocaleString()}`
    } else if (sal.minSalary) {
      salaryRange = `₪${Number(sal.minSalary).toLocaleString()}+`
    } else if (sal.maxSalary) {
      salaryRange = `Up to ₪${Number(sal.maxSalary).toLocaleString()}`
    }

    const sourceLabel = getSourceLabel(job.jobUrl || '')
    
    // Create a truly unique ID (jobKey can have duplicates in the dataset)
    // Use jobKey + source + date to ensure uniqueness
    const uniqueId = `${job.jobKey}_${job.source || 'indeed'}_${(job.datePublished || '').replace(/\D/g, '')}_${index}`

    return {
      // Identity - use uniqueId as the primary key to avoid deduplication of duplicate jobKeys
      _id: uniqueId,
      id: uniqueId,
      jobKey: job.jobKey, // keep original jobKey for reference

      // Content
      title: job.title,
      company: job.companyName || 'Unknown Company',
      companyId: {
        name: job.companyName || 'Unknown Company',
        logo: job.companyLogoUrl || null,
        website: job.companyUrl || null,
        rating: job.rating || null,
        headerImage: job.companyHeaderUrl || null,
      },
      companyLogoUrl: job.companyLogoUrl || null,

      // Location
      location: enCity,
      locationRaw: city,

      // Description
      description: job.descriptionText || '',
      shortDescription: job.descriptionText
        ? job.descriptionText.slice(0, 200).trimEnd() + '…'
        : '',

      // Salary
      salary: sal,
      salaryRange,

      // Language / Work Auth
      hebrewLevel: 'None Required',
      englishLevel: 'Fluent',
      workAuth: 'Support Provided',

      // Timeline / Category
      timeline: 'now',
      industry,
      category: industry,

      // Job details
      type: jobType,
      jobType,
      remote: isRemote,
      experienceLevel: null,
      requiredSkills: Array.isArray(job.requirements) ? job.requirements : [],
      benefits: Array.isArray(job.benefits) ? job.benefits : [],

      // Apply
      applyUrl: job.jobUrl || '#',
      source: 'external',
      sourceLabel, // e.g. "Indeed"

      // Dates
      postedDate: job.datePublished || null,
      createdAt: job.datePublished || null,
      publishedAt: job.datePublished || null,

      // Status
      status: 'published',
      jobStatus: 'published',
    }
  })

// NO deduplication — keep all jobs including duplicate jobKeys
// Each entry is a unique job posting (different posting date/url)
export const scrapedJobs = transformedJobs.sort((a, b) => {
  const da = a.publishedAt ? new Date(a.publishedAt) : new Date(0)
  const db = b.publishedAt ? new Date(b.publishedAt) : new Date(0)
  return db - da
})

// Debug logging
if (typeof window !== 'undefined') {
  console.log('🔍 Scraped Jobs Loaded:', {
    total: scrapedJobs.length,
    rawJobs: rawJobs.length,
    transformed: transformedJobs.length,
  })
}

/** Look up a single scraped job by its jobKey (used in JobDetail fallback). */
export function findScrapedJob(id) {
  return scrapedJobs.find((j) => j.jobKey === id) || null
}
