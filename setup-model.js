const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up ML model for Next.js integration...\n');

// Check if model file exists in the parent directory
const modelPath = path.join(__dirname, '..', 'MLBeam_model.pkl');
const targetPath = path.join(__dirname, '..', 'MLBeam_model.pkl');

if (fs.existsSync(modelPath)) {
  console.log('✅ Found MLBeam_model.pkl in parent directory');
  console.log('✅ Model is ready for use with the Next.js API');
} else {
  console.log('❌ MLBeam_model.pkl not found in parent directory');
  console.log('\n📋 To complete the setup:');
  console.log('1. Run your Train_Model.py script to train the model');
  console.log('2. Save the model file as "MLBeam_model.pkl" in the project root (same level as my-app folder)');
  console.log('3. The model file should contain the trained RandomForest model with standardization parameters');
}

console.log('\n🚀 Next steps:');
console.log('1. Ensure Python is installed and accessible from command line');
console.log('2. Install required Python packages: pip install scikit-learn joblib numpy pandas');
console.log('3. Run: npm run dev');
console.log('4. Open http://localhost:3000 and test the beam analysis form');
