// Script to import Bulgarian cities/villages data from NSI (National Statistical Institute)
// Usage: node scripts/import-nsi-data.js [path-to-nsi-data.json or path-to-nsi-data.csv]
// 
// NSI data format: EKATTE (Единен класификатор на административно-териториалните единици)
// You can download the data from: https://www.nsi.bg/nrnm/
//
// Supports both JSON and CSV formats:
// - JSON: Preferred format, easier to parse
// - CSV: Alternative format (columns: Наименование, Област, Община, Тип)

const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');
const csv = require('csv-parser');

// Parse CSV manually to handle encoding properly
function parseCSV(csvPath, encoding) {
    const buffer = fs.readFileSync(csvPath);
    const text = encoding === 'win1251' ? iconv.decode(buffer, 'win1251') : buffer.toString('utf8');
    
    // Split into proper CSV lines (handling quoted fields with newlines)
    const lines = [];
    let currentLine = '';
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                currentLine += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
                currentLine += char;
            }
        } else if (char === '\n' && !inQuotes) {
            // End of line (only if not in quotes)
            if (currentLine.trim()) {
                lines.push(currentLine.trim());
            }
            currentLine = '';
        } else {
            currentLine += char;
        }
    }
    
    // Add last line if exists
    if (currentLine.trim()) {
        lines.push(currentLine.trim());
    }
    
    if (lines.length === 0) {
        return [];
    }
    
    // Try to detect delimiter
    const firstLine = lines[0];
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    const delimiter = semicolonCount > commaCount ? ';' : ',';
    
    console.log(`Detected delimiter: ${delimiter === ';' ? 'semicolon' : 'comma'}`);
    console.log(`Total lines after parsing: ${lines.length}`);
    
    // Parse header row - it might be in quotes or have special format
    let headerLine = lines[0];
    
    // Remove quotes if present
    if (headerLine.startsWith('"') && headerLine.endsWith('"')) {
        headerLine = headerLine.slice(1, -1);
    }
    
    // Split by delimiter
    const headers = headerLine.split(delimiter).map(h => h.trim());
    const cleanHeaders = headers.map(h => {
        // Clean headers: remove text before slash, keep only after
        // Format is like "???/Type" or "????????????/Name"
        const match = h.match(/\/([^\/]+)$/);
        if (match) {
            return match[1].trim();
        }
        // If no slash, try to extract meaningful part
        return h.trim();
    });
    
    console.log('Raw headers:', headers);
    console.log('Clean headers:', cleanHeaders);
    
    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        let line = lines[i];
        
        // Remove outer quotes if the entire line is quoted
        if (line.startsWith('"') && line.endsWith('"')) {
            line = line.slice(1, -1);
        }
        
        const values = parseCSVLine(line, delimiter);
        
        // Debug first row
        if (i === 1) {
            console.log('First data row (first 200 chars):', line.substring(0, 200));
            console.log('First data row values:', values.slice(0, 5));
        }
        
        if (values.length >= cleanHeaders.length) {
            const row = {};
            cleanHeaders.forEach((header, index) => {
                row[header] = values[index] ? values[index].trim() : '';
            });
            data.push(row);
        } else if (i === 1) {
            console.log(`Warning: First row has ${values.length} values but expected ${cleanHeaders.length} headers`);
        }
    }
    
    console.log(`Parsed ${data.length} data rows`);
    return data;
}

function parseCSVLine(line, delimiter = ',') {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                current += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
            }
        } else if (char === delimiter && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current); // Add last value
    
    return values;
}

function convertToJavaScriptArray(data, isJSON = false) {
    const result = [];
    const seen = new Set();
    
    // Map region names to match our format
    const regionMap = {
        'София': 'София (град)',
        'София - град': 'София (град)',
        'София област': 'София (област)',
        'Софийска': 'София (област)'
    };
    
    // If data is from JSON, extract directly
    if (isJSON) {
        data.forEach(item => {
            // Try different possible property names in NSI JSON
            let name = item['name'] || item['Name'] || item['наименование'] || item['Наименование'] || 
                      item['name_bg'] || item['nameCyr'] || item['name_cyrillic'] || '';
            let region = item['region'] || item['Region'] || item['област'] || item['Област'] || 
                        item['oblast'] || item['oblastName'] || item['regionName'] || '';
            let municipality = item['municipality'] || item['Municipality'] || item['община'] || item['Община'] || 
                              item['obshtina'] || item['obshtinaName'] || item['municipalityName'] || '';
            
            // If still empty, try camelCase variations
            if (!name) name = item['nameBg'] || item['nameEn'] || item['nameLatin'] || '';
            if (!region) region = item['oblastName'] || item['regionNameBg'] || '';
            if (!municipality) municipality = item['obshtinaName'] || item['municipalityNameBg'] || '';
            
            // Normalize region names
            if (regionMap[region]) {
                region = regionMap[region];
            }
            
            // Remove duplicates
            const key = `${name}|${region}|${municipality}`;
            if (name && region && municipality && !seen.has(key)) {
                seen.add(key);
                result.push({
                    name: String(name).trim(),
                    region: String(region).trim(),
                    municipality: String(municipality).trim()
                });
            }
        });
        
        return result;
    }
    
    // CSV parsing logic continues below...
    
    // Find the correct column names (try different variations)
    const firstRow = data[0] || {};
    const columnNames = Object.keys(firstRow);
    console.log(`Available columns (${columnNames.length}):`, columnNames.slice(0, 10));
    
    // Show sample data to help identify columns
    if (data.length > 0) {
        console.log('\nSample data (first row, first 10 columns):');
        columnNames.slice(0, 10).forEach((col, i) => {
            console.log(`  ${i}: [${col}] = "${firstRow[col]}"`);
        });
    }
    
    // Based on EKATTE structure, typical columns are:
    // 0: EKATTE код
    // 1: Тип (с./гр.)
    // 2: Име на кирилица
    // 3: Наименование (на латиница)
    // 4: Област код
    // 5: Област наименование
    // 6: Община код
    // 7: Община наименование
    // ...
    
    // Try to find columns by name first (case-insensitive)
    let nameCol, regionCol, municipalityCol;
    
    // Direct name matching (case-insensitive)
    columnNames.forEach((col, index) => {
        const colLower = col.toLowerCase();
        if (!nameCol && (colLower === 'name' || colLower.includes('наименование') || colLower.includes('име'))) {
            nameCol = col;
            console.log(`✓ Found name column: "${col}"`);
        }
        if (!regionCol && (colLower === 'region' || colLower.includes('област'))) {
            regionCol = col;
            console.log(`✓ Found region column: "${col}"`);
        }
        if (!municipalityCol && (colLower === 'municipality' || colLower.includes('община'))) {
            municipalityCol = col;
            console.log(`✓ Found municipality column: "${col}"`);
        }
    });
    
    // If not found by name, try by position and content patterns
    if (!nameCol || !regionCol || !municipalityCol) {
        // Try different column indices based on EKATTE structure
        if (columnNames.length >= 4) {
            // Check column 1 (usually name)
            const col1 = columnNames[1];
            const col1Value = firstRow[col1];
            if (!nameCol && col1Value && col1Value.length > 0) {
                nameCol = col1;
                console.log(`✓ Found name column at index 1: "${col1}" = "${col1Value}"`);
            }
            
            // Check column 2 (usually region)
            const col2 = columnNames[2];
            const col2Value = firstRow[col2];
            if (!regionCol && col2Value && col2Value.length > 0) {
                regionCol = col2;
                console.log(`✓ Found region column at index 2: "${col2}" = "${col2Value}"`);
            }
            
            // Check column 3 (usually municipality)
            const col3 = columnNames[3];
            const col3Value = firstRow[col3];
            if (!municipalityCol && col3Value && col3Value.length > 0) {
                municipalityCol = col3;
                console.log(`✓ Found municipality column at index 3: "${col3}" = "${col3Value}"`);
            }
        }
    }
    
    // Fallback: search by content patterns
    if (!nameCol || !regionCol || !municipalityCol) {
        columnNames.forEach((col, index) => {
            const value = firstRow[col];
            if (!value) return;
            
            // Try to identify name column
            if (!nameCol && value && typeof value === 'string') {
                if (/^[А-Яа-яЁё][а-яё]/.test(value.trim()) || /^[A-Za-z]{3,}/.test(value.trim())) {
                    nameCol = col;
                    console.log(`✓ Found name column at index ${index}: "${col}" = "${value}"`);
                }
            }
            
            // Try to identify region column
            if (!regionCol && value && typeof value === 'string') {
                if (value.includes('област') || value.includes('град') || (value.length > 5 && /^[А-Яа-яЁё]/.test(value.trim()))) {
                    regionCol = col;
                    console.log(`✓ Found region column at index ${index}: "${col}" = "${value}"`);
                }
            }
            
            // Try to identify municipality column
            if (!municipalityCol && value && typeof value === 'string' && index > 5) {
                if (/^[А-Яа-яЁё]/.test(value.trim()) && value.length > 2) {
                    municipalityCol = col;
                    console.log(`✓ Found municipality column at index ${index}: "${col}" = "${value}"`);
                }
            }
        });
    }
    
    console.log(`\nFound columns - Name: ${nameCol || 'NOT FOUND'}, Region: ${regionCol || 'NOT FOUND'}, Municipality: ${municipalityCol || 'NOT FOUND'}`);
    
    if (!nameCol || !regionCol || !municipalityCol) {
        console.error('\nError: Could not find required columns in CSV file.');
        console.log('Please check the CSV format. Expected columns with: Name, Region, Municipality');
        console.log('\nPlease run: node scripts/debug-csv.js to inspect the file structure');
        process.exit(1);
    }
    
    data.forEach(item => {
        // Use the found column names
        let name = item[nameCol] || '';
        let region = item[regionCol] || '';
        let municipality = item[municipalityCol] || '';
        
        // Normalize region names
        if (regionMap[region]) {
            region = regionMap[region];
        }
        
        // Remove duplicates
        const key = `${name}|${region}|${municipality}`;
        if (name && region && municipality && !seen.has(key)) {
            seen.add(key);
            result.push({
                name: name.trim(),
                region: region.trim(),
                municipality: municipality.trim()
            });
        }
    });
    
    // Sort by region, then municipality, then name
    result.sort((a, b) => {
        if (a.region !== b.region) return a.region.localeCompare(b.region, 'bg');
        if (a.municipality !== b.municipality) return a.municipality.localeCompare(b.municipality, 'bg');
        return a.name.localeCompare(b.name, 'bg');
    });
    
    return result;
}

function generateJavaScriptFile(cities) {
    const header = `// Bulgarian cities and villages database
// Comprehensive list imported from NSI (National Statistical Institute)
// Last updated: ${new Date().toLocaleDateString('bg-BG')}
// Format: { name: 'City/Village', region: 'Region', municipality: 'Municipality' }
// Total: ${cities.length} populated places
const bulgarianCities = [
`;

    const footer = `
];
`;

    const entries = cities.map(city => {
        return `    { name: '${city.name.replace(/'/g, "\\'")}', region: '${city.region.replace(/'/g, "\\'")}', municipality: '${city.municipality.replace(/'/g, "\\'")}' }`;
    }).join(',\n');

    return header + entries + footer;
}

// Parse JSON file from NSI
function parseJSON(jsonPath) {
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(jsonContent);
    
    // NSI JSON can be either array or object with data property
    if (Array.isArray(data)) {
        return data;
    } else if (data.data && Array.isArray(data.data)) {
        return data.data;
    } else if (data.ekatte && Array.isArray(data.ekatte)) {
        return data.ekatte;
    } else {
        throw new Error('Unknown JSON structure. Expected array or object with data/ekatte property.');
    }
}

// Main function
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage: node scripts/import-nsi-data.js [path-to-nsi-data.json or path-to-nsi-data.csv]');
        console.log('');
        console.log('Steps:');
        console.log('1. Download NSI data from: https://www.nsi.bg/nrnm/');
        console.log('2. Save as JSON file (preferred) or CSV file');
        console.log('3. Run: node scripts/import-nsi-data.js path/to/file.json');
        console.log('');
        console.log('The script will generate bulgarian-cities.js with all populated places.');
        process.exit(1);
    }
    
    const inputPath = args[0];
    
    if (!fs.existsSync(inputPath)) {
        console.error(`Error: File not found: ${inputPath}`);
        process.exit(1);
    }
    
    const fileExt = path.extname(inputPath).toLowerCase();
    let data;
    
    if (fileExt === '.json') {
        console.log(`Reading JSON file: ${inputPath}`);
        try {
            data = parseJSON(inputPath);
            console.log(`✅ Parsed ${data.length} records from JSON`);
        } catch (e) {
            console.error(`Error parsing JSON: ${e.message}`);
            process.exit(1);
        }
    } else {
        console.log(`Reading CSV file: ${inputPath}`);
        
        // Try different encodings
        let encoding = 'win1251';
        
        try {
            console.log('Trying Windows-1251 encoding...');
            data = await parseCSV(inputPath, 'win1251');
            
            // Check if we got valid data
            if (data.length > 0) {
                const firstRow = data[0];
                const columns = Object.keys(firstRow);
                console.log(`Found ${columns.length} columns`);
                console.log('Sample columns (first 10):', columns.slice(0, 10));
                
                // Check for Cyrillic in column names or values
                const hasCyrillic = columns.some(col => {
                    // Check column name
                    if (col && col.length > 0) {
                        const hasCyrillicInName = Array.from(col).some(char => {
                            const code = char.charCodeAt(0);
                            return (code >= 0x0400 && code <= 0x04FF); // Cyrillic range
                        });
                        if (hasCyrillicInName) return true;
                    }
                    // Check first value in this column
                    const value = firstRow[col];
                    if (value && typeof value === 'string' && value.length > 0) {
                        return Array.from(value).some(char => {
                            const code = char.charCodeAt(0);
                            return (code >= 0x0400 && code <= 0x04FF);
                        });
                    }
                    return false;
                });
                
                if (hasCyrillic || columns.length > 10) {
                    console.log('✅ Detected encoding: Windows-1251');
                } else {
                    throw new Error('No valid data detected');
                }
            } else {
                throw new Error('No data parsed');
            }
        } catch (e) {
            console.log(`Windows-1251 failed (${e.message}), trying UTF-8...`);
            try {
                data = await parseCSV(inputPath, 'utf8');
                encoding = 'utf8';
                console.log('✅ Using UTF-8 encoding');
            } catch (e2) {
                console.error('Error parsing CSV:', e2.message);
                process.exit(1);
            }
        }
        
        console.log(`Parsed ${data.length} rows from CSV`);
    }
    
    if (data.length === 0) {
        console.error('Error: No data found in file. Please check the format.');
        process.exit(1);
    }
    
    // Show first row for debugging
    console.log('\nSample record:', JSON.stringify(data[0], null, 2).substring(0, 300));
    
    console.log('Converting to JavaScript format...');
    const isJSON = fileExt === '.json';
    const cities = convertToJavaScriptArray(data, isJSON);
    console.log(`Converted to ${cities.length} unique cities/villages`);
    
    console.log('Generating JavaScript file...');
    const jsContent = generateJavaScriptFile(cities);
    
    const outputPath = path.join(__dirname, '..', 'public', 'bulgarian-cities.js');
    fs.writeFileSync(outputPath, jsContent, 'utf8');
    
    console.log(`✅ Successfully generated ${outputPath}`);
    console.log(`   Total populated places: ${cities.length}`);
    console.log('');
    console.log('Next steps:');
    console.log('1. Review the generated file');
    console.log('2. Test the autocomplete functionality');
    console.log('3. If needed, adjust column mapping in the script');
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});

