// Test file for slug utilities - you can run this to test the functions
import { generateSlug, createUniqueSlugFromName } from './slugUtils';

// Test cases for slug generation
const testCases = [
  'Headache',
  'Cold & Flu', 
  'Anxiety & Depression',
  'Joint Pain!!!',
  'Multiple   Spaces   Test',
  'Special@#$%Characters',
  'Nasal polyps',
  'Back pain',
  'High blood pressure',
  'Cuts, bruises, and burns'
];

export async function testSlugGeneration() {
  console.log('Testing slug generation...\n');
  
  for (const testCase of testCases) {
    const basicSlug = generateSlug(testCase);
    console.log(`"${testCase}" -> "${basicSlug}"`);
  }
  
  console.log('\nTesting unique slug generation...\n');
  
  // Test unique slug generation (this would need actual database connection)
  try {
    const uniqueSlug = await createUniqueSlugFromName('Headache');
    console.log(`Unique slug for "Headache": "${uniqueSlug}"`);
  } catch (error) {
    console.log('Unique slug test requires database connection');
  }
}

// Uncomment to run tests
// testSlugGeneration();