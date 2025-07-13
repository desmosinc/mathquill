#!/usr/bin/env node

/**
 * Script to bundle Fluent libraries for MathQuill
 * Run this script if you need to update the Fluent bundle
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 Bundling Fluent libraries for MathQuill...');

// Create temporary entry file
const entryFile = `
const { FluentBundle, FluentResource } = require('@fluent/bundle');
const { parse } = require('@fluent/syntax');
module.exports = { FluentBundle, FluentResource, parseResource: parse };
`;

fs.writeFileSync('temp-fluent-entry.js', entryFile);

// Create temporary webpack config
const webpackConfig = `
const path = require('path');
module.exports = {
  mode: 'production',
  entry: './temp-fluent-entry.js',
  output: {
    path: path.resolve(__dirname, 'src/services'),
    filename: 'fluent-bundle.js',
    library: { type: 'var', name: 'FluentLib' },
    globalObject: 'this'
  },
  target: 'web',
  optimization: { minimize: false }
};
`;

fs.writeFileSync('temp-webpack.config.js', webpackConfig);

try {
  // Run webpack
  console.log('Running webpack...');
  execSync('npx webpack --config temp-webpack.config.js', { stdio: 'inherit' });

  // Add global exports
  const globalExports = `
// Make Fluent functions globally available for MathQuill
var FluentBundle = FluentLib.FluentBundle;
var FluentResource = FluentLib.FluentResource;
var parseResource = FluentLib.parseResource;
`;

  fs.appendFileSync('src/services/fluent-bundle.js', globalExports);

  console.log('✅ Fluent bundle created successfully!');
  console.log('📍 Location: src/services/fluent-bundle.js');
} catch (error) {
  console.error('❌ Error bundling Fluent:', error.message);
} finally {
  // Clean up temporary files
  try {
    fs.unlinkSync('temp-fluent-entry.js');
    fs.unlinkSync('temp-webpack.config.js');
  } catch (e) {
    // Ignore cleanup errors
  }
}

console.log('🏁 Fluent bundling complete!');
