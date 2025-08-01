const path = require('path');
const fs = require('fs');

// Test the upload paths
const uploadDirFromIndex = path.resolve(__dirname, 'uploads');
const uploadDirFromMiddleware = path.resolve(__dirname, 'uploads');

console.log('Upload directory (from index):', uploadDirFromIndex);
console.log('Upload directory (from middleware):', uploadDirFromMiddleware);

// Check if directories exist
try {
  fs.accessSync(uploadDirFromIndex);
  console.log('✓ Upload directory exists and is accessible');
} catch (error) {
  console.log('✗ Upload directory does not exist or is not accessible');
  
  // Try to create it
  try {
    fs.mkdirSync(uploadDirFromIndex, { recursive: true });
    console.log('✓ Created upload directory');
  } catch (createError) {
    console.log('✗ Failed to create upload directory:', createError.message);
  }
}

// List contents if exists
try {
  const files = fs.readdirSync(uploadDirFromIndex);
  console.log('Files in upload directory:', files);
} catch (error) {
  console.log('Cannot read upload directory contents');
}
