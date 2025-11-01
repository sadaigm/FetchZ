import fs from 'fs';
import path from 'path';

// Function to convert RGB values from CSS format to RGB string format
function convertRgb(cssRgb) {
  // Extract RGB values from "rgb(170 199 255)" format
  const matches = cssRgb.match(/rgb\((\d+)\s+(\d+)\s+(\d+)\)/);
  if (matches) {
    return `rgb(${matches[1]}, ${matches[2]}, ${matches[3]})`;
  }
  return cssRgb;
}

// Function to map Material Design colors to Ant Design theme tokens
function mapMaterialToAntd(materialColors) {
  return {
    token: {
      // Primary colors
      colorPrimary: convertRgb(materialColors['--md-sys-color-primary']),
      colorPrimaryBg: convertRgb(materialColors['--md-sys-color-primary-container']),
      colorPrimaryText: convertRgb(materialColors['--md-sys-color-on-primary']),
      
      // Background colors
      colorBgBase: convertRgb(materialColors['--md-sys-color-background']),
      colorBgContainer: convertRgb(materialColors['--md-sys-color-surface-container']),
      colorBgElevated: convertRgb(materialColors['--md-sys-color-surface-container-high']),
      colorBgLayout: convertRgb(materialColors['--md-sys-color-surface']),
      
      // Text colors
      colorTextBase: convertRgb(materialColors['--md-sys-color-on-background']),
      colorTextSecondary: convertRgb(materialColors['--md-sys-color-on-surface-variant']),
      colorTextTertiary: convertRgb(materialColors['--md-sys-color-on-surface-variant']),
      colorTextQuaternary: convertRgb(materialColors['--md-sys-color-outline']),
      
      // Border colors
      colorBorder: convertRgb(materialColors['--md-sys-color-outline']),
      colorBorderSecondary: convertRgb(materialColors['--md-sys-color-outline-variant']),
      
      // Status colors
      colorError: convertRgb(materialColors['--md-sys-color-error']),
      colorErrorBg: convertRgb(materialColors['--md-sys-color-error-container']),
      colorErrorText: convertRgb(materialColors['--md-sys-color-on-error']),
      
      colorSuccess: convertRgb(materialColors['--md-sys-color-primary']), // Using primary as success
      colorSuccessBg: convertRgb(materialColors['--md-sys-color-primary-container']),
      colorSuccessText: convertRgb(materialColors['--md-sys-color-on-primary-container']),
      
      colorWarning: convertRgb(materialColors['--md-sys-color-tertiary']), // Using tertiary as warning
      colorWarningBg: convertRgb(materialColors['--md-sys-color-tertiary-container']),
      colorWarningText: convertRgb(materialColors['--md-sys-color-on-tertiary-container']),
      
      colorInfo: convertRgb(materialColors['--md-sys-color-secondary']), // Using secondary as info
      colorInfoBg: convertRgb(materialColors['--md-sys-color-secondary-container']),
      colorInfoText: convertRgb(materialColors['--md-sys-color-on-secondary-container']),
      
      // Other properties
      borderRadius: 6,
      fontSize: 14,
    }
  };
}

// Function to parse CSS file and extract color variables
function parseMaterialCss(filePath) {
  const cssContent = fs.readFileSync(filePath, 'utf8');
  const colorVariables = {};
  
  // Regular expression to match CSS custom properties
  const regex = /--md-sys-color-([a-zA-Z0-9-]+):\s*(rgb\([^)]+\))/g;
  let match;
  
  while ((match = regex.exec(cssContent)) !== null) {
    colorVariables[`--md-sys-color-${match[1]}`] = match[2];
  }
  
  return colorVariables;
}

// Main conversion function
function convertMaterialThemeToAntd(inputPath, outputPath) {
  try {
    console.log(`Reading Material Design theme from: ${inputPath}`);
    const materialColors = parseMaterialCss(inputPath);
    
    console.log('Converting to Ant Design theme format...');
    const antdTheme = mapMaterialToAntd(materialColors);
    
    // Generate the output file content
    const outputContent = `// Auto-generated Ant Design theme from Material Design colors
// Generated on: ${new Date().toISOString()}

export const materialDarkTheme = ${JSON.stringify(antdTheme, null, 2)};
`;
    
    console.log(`Writing Ant Design theme to: ${outputPath}`);
    fs.writeFileSync(outputPath, outputContent, 'utf8');
    
    console.log('✅ Theme conversion completed successfully!');
    console.log(`📁 Output file: ${outputPath}`);
  } catch (error) {
    console.error('❌ Error converting theme:', error.message);
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node convert-material-theme.js <input-css-file> <output-js-file>');
  console.log('Example: node convert-material-theme.js "../../../Downloads/material-theme (1)/css/dark.css" "src/themes/material-dark-theme.ts"');
  process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1];

// Run the conversion
convertMaterialThemeToAntd(inputFile, outputFile);