import fs from 'fs';

// Read the current file
const data = fs.readFileSync('jordan-hotels-app/src/services/xoteloJordanHotelsData.js', 'utf8');
const startIndex = data.indexOf('export const XOTELO_JORDAN_HOTELS = [');
const endIndex = data.lastIndexOf('];') + 2;

// Extract just the array part
const arrayPart = data.substring(startIndex + 'export const XOTELO_JORDAN_HOTELS = '.length, endIndex - startIndex - 'export const XOTELO_JORDAN_HOTELS = '.length);

// Try to parse and reformat
try {
  // Use eval to parse the complex JavaScript object
  const hotels = eval('(' + arrayPart + ')');
  console.log('Successfully parsed', hotels.length, 'hotels');

  // Create new file content
  const header = `/* eslint-disable */
// GENERATED FILE — do not edit by hand
// Source: https://data.xotelo.com/api/list?location_key=g293985
// Generated at: ${new Date().toISOString()}
// Updated with real hotel images: ${new Date().toISOString()}

`;

  const newContent = header + 'export const XOTELO_JORDAN_HOTELS = ' + JSON.stringify(hotels, null, 2) + ';\n\nexport default XOTELO_JORDAN_HOTELS;';

  fs.writeFileSync('jordan-hotels-app/src/services/xoteloJordanHotelsData.js', newContent);
  console.log('✅ Successfully reformatted Xotelo data file');

} catch (error) {
  console.log('❌ Error parsing hotels:', error.message);
}o