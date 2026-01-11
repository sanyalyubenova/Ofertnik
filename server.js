// Load environment variables from .env file
try {
    require('dotenv').config();
} catch (e) {
    // dotenv not available, continue without it
}

const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const multer = require('multer');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');

// Database connection (optional - uses file system if DATABASE_URL is not set)
let db = null;
let dbQueries = null;
let authQueries = null;
let sessionPool = null;
if (process.env.DATABASE_URL) {
    try {
        db = require('./db/connection');
        dbQueries = require('./db/queries');
        authQueries = require('./db/auth-queries');
        console.log('📦 Using Neon PostgreSQL database');
        
        // Create pool for sessions
        sessionPool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : false
        });
    } catch (error) {
        console.warn('⚠️ Database connection failed, using file system:', error.message);
    }
}

const app = express();
const PORT = process.env.PORT || 3000; // Render автоматично задава PORT
const TARIFFS_FILE = path.join(__dirname, 'data', 'tariffs.json');
// For deployment, use relative paths. For local development, these can be absolute paths
const CASCO_TARIFFS_DIR = process.env.CASCO_TARIFFS_DIR || path.join(__dirname, 'data', 'admin-tariffs');
const MTPL_TARIFFS_DIR = process.env.MTPL_TARIFFS_DIR || path.join(__dirname, 'data', 'admin-tariffs');

// Session configuration
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'ofertnik-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
};

// Use PostgreSQL session store if database is available
if (sessionPool) {
    sessionConfig.store = new pgSession({
        pool: sessionPool,
        tableName: 'session', // Optional: customize table name
        createTableIfMissing: true // Automatically create table if it doesn't exist
    });
    console.log('✅ Using PostgreSQL session store');
} else {
    console.warn('⚠️ Using MemoryStore for sessions (not recommended for production)');
}

app.use(session(sessionConfig));

// Middleware
app.use(express.json());
// Note: express.static is moved after routes to ensure authentication middleware works for index.html

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Ensure data directory exists
fs.ensureDirSync(path.dirname(TARIFFS_FILE));

// Helper function to get tariffs from directories
function getTariffs() {
  try {
    const tariffs = {
      casco: null,
      mtpl: null,
      gap: null
    };
    
    // Try to load CASCO tariffs from directory
    if (fs.existsSync(CASCO_TARIFFS_DIR)) {
      try {
        const cascoFiles = fs.readdirSync(CASCO_TARIFFS_DIR);
        const cascoJsonFile = cascoFiles.find(f => f.toLowerCase().endsWith('.json'));
        if (cascoJsonFile) {
          const cascoPath = path.join(CASCO_TARIFFS_DIR, cascoJsonFile);
          tariffs.casco = JSON.parse(fs.readFileSync(cascoPath, 'utf8'));
          console.log(`Loaded CASCO tariffs from: ${cascoPath}`);
        }
      } catch (error) {
        console.error('Error reading CASCO tariffs directory:', error);
      }
    }
    
    // Try to load MTPL tariffs from directory
    if (fs.existsSync(MTPL_TARIFFS_DIR)) {
      try {
        const mtplFiles = fs.readdirSync(MTPL_TARIFFS_DIR);
        const mtplJsonFile = mtplFiles.find(f => f.toLowerCase().endsWith('.json'));
        if (mtplJsonFile) {
          const mtplPath = path.join(MTPL_TARIFFS_DIR, mtplJsonFile);
          tariffs.mtpl = JSON.parse(fs.readFileSync(mtplPath, 'utf8'));
          console.log(`Loaded MTPL tariffs from: ${mtplPath}`);
        }
      } catch (error) {
        console.error('Error reading MTPL tariffs directory:', error);
      }
    }
    
    // Fallback to default file if directories don't have JSON files
    if (fs.existsSync(TARIFFS_FILE)) {
      try {
        const defaultTariffs = JSON.parse(fs.readFileSync(TARIFFS_FILE, 'utf8'));
        if (!tariffs.casco && defaultTariffs.casco) tariffs.casco = defaultTariffs.casco;
        if (!tariffs.mtpl && defaultTariffs.mtpl) tariffs.mtpl = defaultTariffs.mtpl;
        if (!tariffs.gap && defaultTariffs.gap) tariffs.gap = defaultTariffs.gap;
      } catch (error) {
        console.error('Error reading default tariffs file:', error);
      }
    }
    
    // Return null only if we have nothing
    if (!tariffs.casco && !tariffs.mtpl && !tariffs.gap) {
      return null;
    }
    
    return tariffs;
  } catch (error) {
    console.error('Error reading tariffs:', error);
    return null;
  }
}

// Helper function to save tariffs
function saveTariffs(tariffs) {
  try {
    fs.writeFileSync(TARIFFS_FILE, JSON.stringify(tariffs, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving tariffs:', error);
    return false;
  }
}

// API: Get tariffs
app.get('/api/tariffs', (req, res) => {
  const tariffs = getTariffs();
  if (tariffs) {
    res.json(tariffs);
  } else {
    res.status(404).json({ error: 'Tariffs not found' });
  }
});

// API: Update tariffs (from JSON file upload)
app.post('/api/tariffs/upload', upload.single('tariffFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const newTariffs = JSON.parse(fileContent);

    // Validate tariff structure
    if (!newTariffs.casco || !newTariffs.mtpl || !newTariffs.gap) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Invalid tariff structure. Must include casco, mtpl, and gap' });
    }

    if (saveTariffs(newTariffs)) {
      fs.unlinkSync(filePath); // Clean up uploaded file
      res.json({ success: true, message: 'Tariffs updated successfully' });
    } else {
      fs.unlinkSync(filePath);
      res.status(500).json({ error: 'Failed to save tariffs' });
    }
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ error: 'Invalid JSON file: ' + error.message });
  }
});

// API: Update tariffs (from JSON body)
app.post('/api/tariffs', (req, res) => {
  try {
    const newTariffs = req.body;

    // Validate tariff structure
    if (!newTariffs.casco || !newTariffs.mtpl || !newTariffs.gap) {
      return res.status(400).json({ error: 'Invalid tariff structure. Must include casco, mtpl, and gap' });
    }

    if (saveTariffs(newTariffs)) {
      res.json({ success: true, message: 'Tariffs updated successfully' });
    } else {
      res.status(500).json({ error: 'Failed to save tariffs' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Invalid data: ' + error.message });
  }
});

// Helper function to calculate tariff rate from tariff data
function calculateTariffRate(data, tariff) {
  if (!tariff) return 0; // default rate (0% to show error if tariff is missing)
  
  // Calculate vehicle age
  let vehicleAge = 0;
  if (data.firstRegistrationDate) {
    const registrationDate = new Date(data.firstRegistrationDate);
    const today = new Date();
    vehicleAge = Math.floor((today - registrationDate) / (365.25 * 24 * 60 * 60 * 1000));
  }
  const insuranceSum = parseFloat(data.insuranceSum) || 0;
  
  // Check if new admin tariff structure (has tariffs array)
  if (tariff.tariffs && Array.isArray(tariff.tariffs)) {
    for (const tariffRow of tariff.tariffs) {
      const fromAge = tariffRow.fromAge !== null && tariffRow.fromAge !== undefined ? tariffRow.fromAge : 0;
      const toAge = tariffRow.toAge !== null && tariffRow.toAge !== undefined ? tariffRow.toAge : Infinity;
      const fromValue = tariffRow.fromValue !== null && tariffRow.fromValue !== undefined ? tariffRow.fromValue : 0;
      const toValue = tariffRow.toValue !== null && tariffRow.toValue !== undefined ? tariffRow.toValue : Infinity;
      
      if (vehicleAge >= fromAge && vehicleAge <= toAge && 
          insuranceSum >= fromValue && insuranceSum <= toValue) {
        return (tariffRow.rate || 0) / 100; // Convert percentage to decimal
      }
    }
  } else {
    // Old tariff structure - use vehicleValueRanges for backward compatibility
    if (tariff.vehicleValueRanges) {
      for (const [range, rate] of Object.entries(tariff.vehicleValueRanges)) {
        const [min, max] = range.split('-').map(n => n === '+' ? Infinity : parseInt(n));
        if (insuranceSum >= min && insuranceSum <= max) {
          return rate;
        }
      }
    } else if (tariff.baseRate) {
      return tariff.baseRate;
    }
  }
  
  return 0; // default rate (0% to show error if tariff is missing)
}

// API: Calculate premium
app.post('/api/calculate', (req, res) => {
  try {
    const { insuranceType, data, insurer } = req.body;
    const tariffs = getTariffs();

    if (!tariffs) {
      return res.status(500).json({ error: 'Tariffs not loaded' });
    }

    if (!tariffs[insuranceType]) {
      return res.status(400).json({ error: 'Invalid insurance type or tariff not found' });
    }

    let premium = 0;
    let tariffRate = 0.03;
    const tariff = tariffs[insuranceType];

    switch (insuranceType) {
      case 'casco':
        // If insurer is specified, use that specific tariff
        if (insurer) {
          const adminTariffsDir = path.join(__dirname, 'data', 'admin-tariffs');
          const insurerFile = path.join(adminTariffsDir, `${insurer}-casco.json`);
          if (fs.existsSync(insurerFile)) {
            const insurerTariff = JSON.parse(fs.readFileSync(insurerFile, 'utf8'));
            premium = calculateCascoPremium(data, insurerTariff);
            tariffRate = calculateTariffRate(data, insurerTariff);
            return res.json({ premium: Math.round(premium * 100) / 100, currency: 'EUR', tariffRate });
          }
        }
        premium = calculateCascoPremium(data, tariff);
        tariffRate = calculateTariffRate(data, tariff);
        return res.json({ premium: Math.round(premium * 100) / 100, currency: 'EUR', tariffRate });
        break;
      case 'mtpl':
        premium = calculateMTPLPremium(data, tariff);
        break;
      case 'gap':
        premium = calculateGAPPremium(data, tariff);
        break;
      default:
        return res.status(400).json({ error: 'Unknown insurance type' });
    }

    res.json({ premium: Math.round(premium * 100) / 100, currency: 'EUR' });
  } catch (error) {
    res.status(400).json({ error: 'Calculation error: ' + error.message });
  }
});

// Helper function to check if tariff data is valid
function hasValidTariff(tariffData, insuranceType) {
  if (!tariffData) return false;
  
  if (insuranceType === 'casco') {
    // For CASCO, need tariffs array with at least one entry
    if (tariffData.tariffs && Array.isArray(tariffData.tariffs) && tariffData.tariffs.length > 0) {
      return true;
    }
    // Also check for old structure
    if (tariffData.vehicleValueRanges && Object.keys(tariffData.vehicleValueRanges).length > 0) {
      return true;
    }
    if (tariffData.baseRate) {
      return true;
    }
    return false;
  } else if (insuranceType === 'mtpl') {
    // For MTPL, need basePremium
    if (tariffData.basePremium) {
      return true;
    }
    return false;
  }
  
  return false;
}

// API: Compare premiums across all insurers
app.post('/api/compare', (req, res) => {
  try {
    const { insuranceType, data } = req.body;
    
    if (insuranceType !== 'casco' && insuranceType !== 'mtpl') {
      return res.status(400).json({ error: 'Comparison is only available for CASCO and MTPL' });
    }

    const adminTariffsDir = path.join(__dirname, 'data', 'admin-tariffs');
    const insurerNames = {
      'generali': 'Дженерали',
      'armeec': 'Армеец',
      'bulstrad': 'Булстрад',
      'dzi': 'ДЗИ',
      'unika': 'Уника',
      'grupama': 'Групама',
      'bul-ins': 'Бул Инс',
      'allianz': 'Алианц'
    };

    const results = [];
    
    // Get all tariff files for this insurance type
    if (fs.existsSync(adminTariffsDir)) {
      const files = fs.readdirSync(adminTariffsDir);
      const pattern = new RegExp(`^(.+)-${insuranceType}\\.json$`);
      
      for (const file of files) {
        const match = file.match(pattern);
        if (match) {
          const insurer = match[1];
          const insurerFile = path.join(adminTariffsDir, file);
          
          try {
            const tariffData = JSON.parse(fs.readFileSync(insurerFile, 'utf8'));
            
            // Check if tariff data is valid before calculating
            if (!hasValidTariff(tariffData, insuranceType)) {
              console.log(`Skipping ${insurer} - no valid tariff data`);
              continue; // Skip this insurer if no valid tariff
            }
            
            let premium = 0;
            let basePremium = 0;
            let tax = 0;
            let gf = 0;
            let of = 0;
            if (insuranceType === 'casco') {
              premium = calculateCascoPremium(data, tariffData);
            } else if (insuranceType === 'mtpl') {
              basePremium = calculateMTPLPremium(data, tariffData);
              tax = Math.round(basePremium * 0.02 * 100) / 100;
              gf = 6.50;
              of = Math.max(Math.round(basePremium * 0.01 * 100) / 100, 2.00);
              premium = Math.round((basePremium + tax + gf + of) * 100) / 100;
            }
            
            const result = {
              insurer: insurer,
              insurerName: insurerNames[insurer] || insurer,
              premium: Math.round(premium * 100) / 100
            };
            
            if (insuranceType === 'mtpl') {
              result.basePremium = Math.round(basePremium * 100) / 100;
              result.tax = tax;
              result.gf = gf;
              result.of = of;
            }
            
            results.push(result);
          } catch (error) {
            console.error(`Error calculating premium for ${insurer}:`, error);
            // Skip this insurer if calculation fails
          }
        }
      }
    }
    
    // Sort by premium (lowest first)
    results.sort((a, b) => a.premium - b.premium);
    
    res.json({ results, currency: 'EUR' });
  } catch (error) {
    console.error('Error comparing premiums:', error);
    res.status(500).json({ error: 'Comparison error: ' + error.message });
  }
});

// Helper function to calculate total discount percentage from admin discounts
function calculateTotalDiscountPercent(data, discounts, selectedDiscounts = {}) {
  if (!discounts || !Array.isArray(discounts)) return 0;
  
  let totalDiscount = 0;
  const vehicleAge = data.firstRegistrationDate ? 
    Math.floor((new Date() - new Date(data.firstRegistrationDate)) / (365.25 * 24 * 60 * 60 * 1000)) : 0;
  
  for (const discount of discounts) {
    const discountKey = discount.type + '-' + (discount.value || discount.age || '');
    // Only apply discount if it's selected by user
    if (!selectedDiscounts || !selectedDiscounts[discountKey]) continue;
    
    if (discount.type === 'go' && data.hasGO) {
      totalDiscount += parseFloat(discount.value) || 0;
    } else if (discount.type === 'age' && vehicleAge > (parseFloat(discount.value) || parseFloat(discount.age) || 0)) {
      totalDiscount += parseFloat(discount.value) || 0;
    } else if (discount.type === 'new' && data.isNew) {
      totalDiscount += parseFloat(discount.value) || 0;
    } else if (discount.type === 'combined' && data.hasCombined) {
      totalDiscount += parseFloat(discount.value) || 0;
    } else if (discount.type === 'other') {
      totalDiscount += parseFloat(discount.value) || 0;
    } else {
      // For any other type, just apply the discount if selected
      totalDiscount += parseFloat(discount.value) || 0;
    }
  }
  
  return totalDiscount;
}

// Helper function to calculate total surcharge percentage from admin surcharges (in %)
function calculateTotalSurchargePercent(data, surcharges, selectedSurcharges = {}) {
  if (!surcharges || !Array.isArray(surcharges)) return 0;
  
  let totalSurchargePercent = 0;
  
  for (const surcharge of surcharges) {
    const surchargeKey = surcharge.type + '-' + (surcharge.value || '');
    // Only apply surcharge if it's selected by user
    if (!selectedSurcharges || !selectedSurcharges[surchargeKey]) continue;
    
    totalSurchargePercent += parseFloat(surcharge.value) || 0;
  }
  
  return totalSurchargePercent;
}

// CASCO Premium Calculation
// Formula: Застрахователна сума * (((тарифно число/100) * (1 +(-отстъпки + надбавки))) + допълнителни надбавки в лв.) * 1.02
// Тарифното число е в проценти, но calculateTariffRate връща десетична форма (0.057 за 5.7%)
// Отстъпките са отрицателни, надбавките са положителни
function calculateCascoPremium(data, tariff) {
  const insuranceSum = parseFloat(data.insuranceSum) || 0;
  const bonusMalus = parseFloat(data.bonusMalus) || 0; // % отстъпка/надбавка
  const surcharges = parseFloat(data.surcharges) || 0; // допълнителни надбавки в лв
  
  // Calculate vehicle age from first registration date
  let vehicleAge = 0;
  if (data.firstRegistrationDate) {
    const registrationDate = new Date(data.firstRegistrationDate);
    const today = new Date();
    vehicleAge = Math.floor((today - registrationDate) / (365.25 * 24 * 60 * 60 * 1000));
  }

  // Find tariff rate based on vehicle age and insurance sum (returns decimal, e.g. 0.057 for 5.7%)
  const tariffRate = calculateTariffRate(data, tariff);

  // Step 1: Сумиране на отстъпки и надбавки в %
  // Отстъпките са отрицателни, надбавките са положителни
  // bonusMalus: положителна стойност = бонус (отстъпка), отрицателна = малус (надбавка)
  let totalPercent = 0;
  
  // Добави бонус/малус: бонус (положителен) → отрицателен в сумата, малус (отрицателен) → положителен в сумата
  totalPercent -= bonusMalus; // Ако bonusMalus = 5 (бонус) → -5; Ако bonusMalus = -5 (малус) → -(-5) = +5
  
  // Добави административни отстъпки (отстъпките са отрицателни в сумата)
  if (tariff.discounts) {
    const selectedDiscounts = data.selectedDiscounts || {};
    const adminDiscountPercent = calculateTotalDiscountPercent(data, tariff.discounts, selectedDiscounts);
    totalPercent -= adminDiscountPercent; // Отстъпките се изваждат (стават отрицателни)
  }
  
  // Добави административни надбавки в % (от тарифите)
  if (tariff.surcharges) {
    const selectedSurcharges = data.selectedSurcharges || {};
    const adminSurchargePercent = calculateTotalSurchargePercent(data, tariff.surcharges, selectedSurcharges);
    totalPercent += adminSurchargePercent; // Надбавките се добавят (са положителни)
  }
  
  // Step 2: Изчисляване на премията според новата формула
  // Формула: Застрахователна сума * (((тарифно число/100) * (1 +(-отстъпки + надбавки)) + допълнителни надбавки в лв.) * 1.02
  // Тъй като tariffRate вече е в десетична форма (0.057 за 5.7%), не делим на 100
  // Формулата е: (insuranceSum * tariffRate * (1 + totalPercent/100) + допълнителни надбавки в лв) * 1.02
  let premiumBeforeSurcharges = insuranceSum * tariffRate * (1 + totalPercent / 100);
  
  // Step 3: Добави допълнителни надбавки в лв (от input полето)
  let premiumBeforeTax = premiumBeforeSurcharges + surcharges;

  // Step 4: Добави 2% данък върху застрахователните премии
  let premium = premiumBeforeTax * 1.02;

  return premium;
}

// MTPL Premium Calculation
function calculateMTPLPremium(data, tariff) {
  const engineSize = parseFloat(data.engineSize) || 0;
  const powerKW = parseFloat(data.powerKW) || 0;

  let premium = tariff.basePremium;

  // Engine size multiplier
  let engineMultiplier = 1.0;
  for (const [range, mult] of Object.entries(tariff.engineSizeMultiplier)) {
    const [min, max] = range.split('-').map(n => n === '+' ? Infinity : parseInt(n));
    if (engineSize >= min && engineSize <= max) {
      engineMultiplier = mult;
      break;
    }
  }
  premium *= engineMultiplier;

  // Power multiplier (if exists in tariff)
  if (tariff.powerMultiplier && powerKW > 0) {
    let powerMultiplier = 1.0;
    for (const [range, mult] of Object.entries(tariff.powerMultiplier)) {
      const [min, max] = range.split('-').map(n => n === '+' ? Infinity : parseFloat(n));
      if (powerKW >= min && powerKW <= max) {
        powerMultiplier = mult;
        break;
      }
    }
    premium *= powerMultiplier;
  }

  // Add 2% tax on insurance premiums (like CASCO)
  premium = premium * 1.02;

  return premium;
}

// GAP Premium Calculation
function calculateGAPPremium(data, tariff) {
  const insuranceSum = parseFloat(data.insuranceSum) || 0;
  const registrationDate = data.registrationDate || data.firstRegistrationDate;
  const cascoInsurer = data.cascoInsurer || 'other';

  // Calculate vehicle age from registration date
  let vehicleAge = 0;
  if (registrationDate) {
    const regDate = new Date(registrationDate);
    const today = new Date();
    vehicleAge = Math.floor((today - regDate) / (365.25 * 24 * 60 * 60 * 1000));
  }

  // Base rate from insurance sum
  let baseRate = 0.015;
  for (const [range, rate] of Object.entries(tariff.vehicleValueRanges)) {
    const [min, max] = range.split('-').map(n => n === '+' ? Infinity : parseInt(n));
    if (insuranceSum >= min && insuranceSum <= max) {
      baseRate = rate;
      break;
    }
  }

  let premium = insuranceSum * baseRate;

  // Vehicle age multiplier (if exists in tariff)
  if (tariff.vehicleAgeMultiplier) {
    let ageMultiplier = 1.0;
    for (const [range, mult] of Object.entries(tariff.vehicleAgeMultiplier)) {
      const [min, max] = range.split('-').map(n => n === '+' ? Infinity : parseInt(n));
      if (vehicleAge >= min && vehicleAge <= max) {
        ageMultiplier = mult;
        break;
      }
    }
    premium *= ageMultiplier;
  }

  // Casco insurer multiplier (Bulstrad vs other)
  let insurerMultiplier = 1.0;
  if (tariff.insurerMultiplier) {
    insurerMultiplier = tariff.insurerMultiplier[cascoInsurer] || 1.0;
  } else {
    // Default: Bulstrad gets discount
    insurerMultiplier = cascoInsurer === 'bulstrad' ? 0.95 : 1.0;
  }
  premium *= insurerMultiplier;

  return premium;
}

// Import auth middleware
const { requireAuth, requireAdmin, redirectToLogin, redirectToLoginIfNotAdmin } = require('./middleware/auth');

// Admin API: Get tariffs for specific insurer (requires authentication)
app.get('/api/admin/tariffs/:insurer', requireAuth, async (req, res) => {
  try {
    const insurer = req.params.insurer;
    const adminTariffsDir = path.join(__dirname, 'data', 'admin-tariffs');
    const insurerFile = path.join(adminTariffsDir, `${insurer}.json`);

    if (fs.existsSync(insurerFile)) {
      const data = JSON.parse(fs.readFileSync(insurerFile, 'utf8'));
      res.json(data);
    } else {
      res.json({ tariffs: [], discounts: [], surcharges: [] });
    }
  } catch (error) {
    console.error('Error loading admin tariffs:', error);
    res.status(500).json({ error: 'Error loading tariff data' });
  }
});

// Admin API: Save tariffs for specific insurer (requires authentication)
app.post('/api/admin/tariffs/:insurer', requireAuth, async (req, res) => {
  try {
    const insurer = req.params.insurer;
    const data = req.body;
    const adminTariffsDir = path.join(__dirname, 'data', 'admin-tariffs');
    
    // Ensure directory exists
    fs.ensureDirSync(adminTariffsDir);
    
    const insurerFile = path.join(adminTariffsDir, `${insurer}.json`);
    fs.writeFileSync(insurerFile, JSON.stringify(data, null, 2));
    
    res.json({ success: true, message: 'Tariffs saved successfully' });
  } catch (error) {
    console.error('Error saving admin tariffs:', error);
    res.status(500).json({ error: 'Error saving tariff data' });
  }
});

// Authentication routes (public)
app.get('/login', (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!authQueries) {
      return res.status(503).json({ error: 'Authentication not available - database not connected' });
    }
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const user = await authQueries.verifyPassword(username, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Set session
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
    
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

app.get('/api/me', requireAuth, async (req, res) => {
  try {
    if (!authQueries) {
      return res.status(503).json({ error: 'Authentication not available' });
    }
    
    const user = await authQueries.getUserById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.status(401).json({ error: 'User not found' });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      role: user.role
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Admin user management routes
app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    if (!authQueries) {
      return res.status(503).json({ error: 'Authentication not available' });
    }
    
    const users = await authQueries.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

app.post('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    if (!authQueries) {
      return res.status(503).json({ error: 'Authentication not available' });
    }
    
    const { username, email, password, role } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Check if username already exists
    const existingUser = await authQueries.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await authQueries.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }
    
    const userRole = role === 'admin' ? 'admin' : 'user';
    const user = await authQueries.createUser(username, email, password, userRole);
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.delete('/api/admin/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    if (!authQueries) {
      return res.status(503).json({ error: 'Authentication not available' });
    }
    
    const userId = parseInt(req.params.id);
    
    // Don't allow deleting yourself
    if (userId === req.session.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    await authQueries.deleteUser(userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Route for admin page (requires authentication)
app.get('/admin', redirectToLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Route for admin users page (requires authentication and admin role)
app.get('/admin-users', redirectToLoginIfNotAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-users.html'));
});

// Route for the main page (requires authentication)
app.get('/', redirectToLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Static files (served after routes to ensure authentication middleware works for index.html)
app.use(express.static('public'));

// API: Get list of CASCO insurers with their tariff structure
app.get('/api/casco-insurers', (req, res) => {
  try {
    const adminTariffsDir = path.join(__dirname, 'data', 'admin-tariffs');
    const insurerNames = {
      'generali': 'Дженерали',
      'armeec': 'Армеец',
      'bulstrad': 'Булстрад',
      'dzi': 'ДЗИ',
      'unika': 'Уника',
      'grupama': 'Групама',
      'bul-ins': 'Бул Инс',
      'allianz': 'Алианц'
    };

    const insurers = [];
    
    if (fs.existsSync(adminTariffsDir)) {
      const files = fs.readdirSync(adminTariffsDir);
      const pattern = /^(.+)-casco\.json$/;
      
      for (const file of files) {
        const match = file.match(pattern);
        if (match) {
          const insurer = match[1];
          const insurerFile = path.join(adminTariffsDir, file);
          
          try {
            const tariffData = JSON.parse(fs.readFileSync(insurerFile, 'utf8'));
            
            // Check if tariff data is valid
            if (hasValidTariff(tariffData, 'casco')) {
              insurers.push({
                insurer: insurer,
                insurerName: insurerNames[insurer] || insurer,
                discounts: tariffData.discounts || [],
                surcharges: tariffData.surcharges || []
              });
            }
          } catch (error) {
            console.error(`Error reading tariff for ${insurer}:`, error);
          }
        }
      }
    }
    
    res.json({ insurers });
  } catch (error) {
    console.error('Error getting CASCO insurers:', error);
    res.status(500).json({ error: 'Error getting CASCO insurers: ' + error.message });
  }
});

// Route for offer page
app.get('/offer', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'offer.html'));
});

// Word Document Export endpoint
app.post('/api/export-docx', async (req, res) => {
  try {
    const JSZip = require('jszip');
    const { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType } = require('docx');
    const { commonData, offers, insuranceTypes } = req.body;
    
    const children = [];
    
    // Template file path
    const templatePath = path.join(__dirname, 'public', 'offer-template.docx');
    if (!fs.existsSync(templatePath)) {
      return res.status(500).json({ error: 'Template file not found' });
    }
    
    // Offer number and date
    const today = new Date();
    const dateStr = today.toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const offerNumber = commonData.registrationNumber || '1234';
    
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `ОФЕРТА № ${offerNumber} / ${dateStr}`, bold: true })
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 200 }
      })
    );
    
    // Main title
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'За подновяване на застраховки „Каско" и „Гражданска отговорност"', bold: true })
        ],
        spacing: { after: 400 }
      })
    );
    
    // Common data table
    const vehicleInfo = `${commonData.vehicleBrand || ''} ${commonData.vehicleModel || ''} ${commonData.registrationNumber || ''}`.trim();
    const commonDataTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Застраховащ:', bold: true })] })],
              width: { size: 50, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: commonData.ownerName || '-' })] })],
              width: { size: 50, type: WidthType.PERCENTAGE }
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Застрахован обект:', bold: true })] })],
              width: { size: 50, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: vehicleInfo })] })],
              width: { size: 50, type: WidthType.PERCENTAGE }
            })
          ]
        })
      ],
      width: { size: 100, type: WidthType.PERCENTAGE }
    });
    
    children.push(commonDataTable);
    children.push(new Paragraph({ text: '', spacing: { after: 400 } }));
    
    // Group offers by insurer
    const offersByInsurer = {};
    offers.forEach(offer => {
      if (!offersByInsurer[offer.insurerName]) {
        offersByInsurer[offer.insurerName] = {};
      }
      insuranceTypes.forEach(type => {
        if (offer.insuranceTypes?.[type]?.premium) {
          offersByInsurer[offer.insurerName][type] = offer.insuranceTypes[type];
        }
      });
    });
    
    // For each insurer
    Object.keys(offersByInsurer).forEach(insurerName => {
      const insurerData = offersByInsurer[insurerName];
      
      // Insurer name
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: insurerName, bold: true })
          ],
          spacing: { after: 200 }
        })
      );
      
      // CASCO section
      if (insurerData.casco) {
        const cascoData = insurerData.casco;
        const insuranceData = cascoData.insuranceData || {};
        
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Тип на застраховката: „Каско"', bold: true })
            ],
            spacing: { after: 100 }
          })
        );
        
        // Calculate tax (2% of premium)
        // Note: calculateCascoPremium returns premium WITH tax (premium * 1.02)
        // So we need to extract premium without tax first
        const premiumWithTax = parseFloat(cascoData.premium) || 0;
        const premiumWithoutTax = premiumWithTax / 1.02; // Remove tax to get base premium
        const tax = Math.round(premiumWithoutTax * 0.02 * 100) / 100; // Round to 2 decimal places
        const totalPremium = Math.round(premiumWithTax * 100) / 100; // Premium with tax (what user sees)
        // All values are already in EUR, no conversion needed
        const totalPremiumEUR = totalPremium.toFixed(2);
        const premiumWithoutTaxEUR = premiumWithoutTax.toFixed(2);
        const taxEUR = tax.toFixed(2);
        
        // CASCO data table
        const cascoTable = new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Застрахователна сума:', bold: true })] })],
                  width: { size: 60, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: `${parseFloat(insuranceData.insuranceSum || 0).toFixed(2)} €` })]
                  })],
                  width: { size: 40, type: WidthType.PERCENTAGE }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Застрахователна премия:', bold: true })] })],
                  width: { size: 60, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: `${premiumWithoutTaxEUR} €` })]
                  })],
                  width: { size: 40, type: WidthType.PERCENTAGE }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Дължим данък върху застрахователните премии:', bold: true })] })],
                  width: { size: 60, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: `${taxEUR} €` })]
                  })],
                  width: { size: 40, type: WidthType.PERCENTAGE }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Общо дължима премия:', bold: true })] })],
                  width: { size: 60, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: `${totalPremiumEUR} €`, bold: true })]
                  })],
                  width: { size: 40, type: WidthType.PERCENTAGE }
                })
              ]
            })
          ],
          width: { size: 100, type: WidthType.PERCENTAGE }
        });
        
        children.push(cascoTable);
        children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
        
        // Additional details
        if (insuranceData.service) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: 'Допълнителни договорености: ', bold: true }),
                new TextRun({ text: getServiceNameForPdf(insuranceData.service) })
              ],
              spacing: { after: 100 }
            })
          );
        }
        
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Териториално покритие: ', bold: true }),
              new TextRun({ text: 'Р. България и чужбина' })
            ],
            spacing: { after: 100 }
          })
        );
        
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Период на застрахователно покритие: ', bold: true }),
              new TextRun({ text: '12 месеца.' })
            ],
            spacing: { after: 100 }
          })
        );
        
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Начин на плащане: ', bold: true }),
              new TextRun({ text: `еднократно ${totalPremiumEUR} €` })
            ],
            spacing: { after: 400 }
          })
        );
      }
      
      // MTPL section
      if (insurerData.mtpl) {
        const mtplData = insurerData.mtpl;
        // MTPL premium structure: basePremium, tax, gf, of, premium (total)
        const basePremium = parseFloat(mtplData.basePremium || 0);
        const tax = parseFloat(mtplData.tax || 0);
        const gf = parseFloat(mtplData.gf || 6.50);
        const of = parseFloat(mtplData.of || 0);
        const totalPremium = parseFloat(mtplData.premium || 0);
        
        // All values are already in EUR, no conversion needed
        const basePremiumEUR = basePremium.toFixed(2);
        const taxEUR = tax.toFixed(2);
        const gfEUR = gf.toFixed(2);
        const ofEUR = of.toFixed(2);
        const totalPremiumEUR = totalPremium.toFixed(2);
        
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Тип на застраховката: „Гражданска Отговорност"', bold: true })
            ],
            spacing: { after: 100 }
          })
        );
        
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Застрахователна сума (Лимит на отговорност): Съгласно действащите разпоредби на Кодекса за застраховането към датата на възникване на застрахователно събитие.' })
            ],
            spacing: { after: 200 }
          })
        );
        
        const mtplTable = new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Основна премия:', bold: true })] })],
                  width: { size: 60, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: `${basePremiumEUR} €` })]
                  })],
                  width: { size: 40, type: WidthType.PERCENTAGE }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'ГФ:', bold: true })] })],
                  width: { size: 60, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: `${gfEUR} €` })]
                  })],
                  width: { size: 40, type: WidthType.PERCENTAGE }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'ОФ:', bold: true })] })],
                  width: { size: 60, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: `${ofEUR} €` })]
                  })],
                  width: { size: 40, type: WidthType.PERCENTAGE }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Крайна премия:', bold: true })] })],
                  width: { size: 60, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: `${totalPremiumEUR} €`, bold: true })]
                  })],
                  width: { size: 40, type: WidthType.PERCENTAGE }
                })
              ]
            })
          ],
          width: { size: 100, type: WidthType.PERCENTAGE }
        });
        
        children.push(mtplTable);
        children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
        
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Период на застрахователно покритие: ', bold: true }),
              new TextRun({ text: '12 месеца. ' }),
              new TextRun({ text: 'Начин на плащане: ', bold: true }),
              new TextRun({ text: 'еднократно; на каса/по банков' })
            ],
            spacing: { after: 400 }
          })
        );
      }
      
      // GAP section (if exists)
      if (insurerData.gap) {
        const gapData = insurerData.gap;
        const premium = parseFloat(gapData.premium) || 0;
        const tax = Math.round(premium * 0.02 * 100) / 100; // Round to 2 decimal places
        const totalPremium = Math.round((premium + tax) * 100) / 100; // Round to 2 decimal places
        // All values are already in EUR, no conversion needed
        const totalPremiumEUR = totalPremium.toFixed(2);
        const premiumEUR = premium.toFixed(2);
        const taxEUR = tax.toFixed(2);
        
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Тип на застраховката: „GAP"', bold: true })
            ],
            spacing: { after: 100 }
          })
        );
        
        const gapTable = new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Застрахователна премия:', bold: true })] })],
                  width: { size: 60, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: `${premiumEUR} €` })]
                  })],
                  width: { size: 40, type: WidthType.PERCENTAGE }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Дължим данък върху застрахователните премии:', bold: true })] })],
                  width: { size: 60, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: `${taxEUR} €` })]
                  })],
                  width: { size: 40, type: WidthType.PERCENTAGE }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Общо дължима премия:', bold: true })] })],
                  width: { size: 60, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: `${totalPremiumEUR} €`, bold: true })]
                  })],
                  width: { size: 40, type: WidthType.PERCENTAGE }
                })
              ]
            })
          ],
          width: { size: 100, type: WidthType.PERCENTAGE }
        });
        
        children.push(gapTable);
        children.push(new Paragraph({ text: '', spacing: { after: 400 } }));
      }
    });
    
    // Create a temporary document with content only (no headers/footers)
    const tempDoc = new Document({
      sections: [{
        children: children
      }]
    });
    
    // Generate temporary document to extract document.xml
    const tempBuffer = await Packer.toBuffer(tempDoc);
    const tempZip = await JSZip.loadAsync(tempBuffer);
    let newDocumentXml = await tempZip.file('word/document.xml').async('string');
    
    // Load template file
    const templateBuffer = fs.readFileSync(templatePath);
    const templateZip = await JSZip.loadAsync(templateBuffer);
    const templateDocumentXml = await templateZip.file('word/document.xml').async('string');
    
    // Extract sectPr from template (contains header/footer references)
    const sectPrMatch = templateDocumentXml.match(/<w:sectPr[\s\S]*?<\/w:sectPr>/);
    if (sectPrMatch) {
      const templateSectPr = sectPrMatch[0];
      // Remove existing sectPr from new document (if any) and add template's sectPr
      newDocumentXml = newDocumentXml.replace(/<w:sectPr[\s\S]*?<\/w:sectPr>/, templateSectPr);
      // If no sectPr was found in new document, add it before closing w:body tag
      if (!newDocumentXml.includes('<w:sectPr')) {
        newDocumentXml = newDocumentXml.replace('</w:body>', templateSectPr + '</w:body>');
      }
    }
    
    // Replace document.xml in template with new content (now with template's sectPr)
    templateZip.file('word/document.xml', newDocumentXml);
    
    // Generate final document
    const finalBuffer = await templateZip.generateAsync({ type: 'nodebuffer' });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename=offers.docx');
    
    res.send(finalBuffer);
  } catch (error) {
    console.error('Error generating DOCX:', error);
    res.status(500).json({ error: 'Error generating DOCX: ' + error.message });
  }
});

function convertToRtfUnicode(text) {
  if (!text) return '';
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.charCodeAt(0);
    if (code > 127) {
      // Unicode character - convert to RTF Unicode escape
      result += '\\u' + code + '?';
    } else {
      // ASCII character - escape special RTF characters
      if (char === '\\') result += '\\\\';
      else if (char === '{') result += '\\{';
      else if (char === '}') result += '\\}';
      else if (char === '\n') result += '\\par\n';
      else result += char;
    }
  }
  return result;
}

function getInsuranceTypeNameForPdf(type) {
  const names = {
    'casco': 'Каско',
    'mtpl': 'Гражданска отговорност',
    'gap': 'GAP'
  };
  return names[type] || type;
}

function getServiceNameForPdf(service) {
  const names = {
    'official': 'Официален',
    'trusted': 'Доверен',
    'trusted-original': 'Доверен с оригинални части',
    'expert': 'Експертна оценка'
  };
  return names[service] || service || '-';
}

function getDiscountTextForPdf(discount) {
  if (typeof discount === 'string') {
    return discount;
  }
  if (discount.type === 'go') return 'За ГО: ' + discount.value + '%';
  if (discount.type === 'age') return 'Възраст над ' + (discount.value || discount.age) + ' години: ' + discount.value + '%';
  if (discount.type === 'new') return 'За новозастрахован: ' + discount.value + '%';
  if (discount.type === 'combined') return 'За комбиниран продукт: ' + discount.value + '%';
  return discount.value + '%';
}

function getSurchargeTextForPdf(surcharge) {
  if (typeof surcharge === 'string') {
    return surcharge;
  }
  return surcharge.value + '%';
}

// Export app for serverless functions (Netlify)
module.exports = app;

// Only start listening if not in serverless environment
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀 Сървър за калкулатор на застраховки работи на http://localhost:${PORT}`);
    console.log(`📱 Отворете този URL в браузъра си, за да видите приложението\n`);
  });
}

