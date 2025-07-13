#!/usr/bin/env node

/**
 * Script to generate locale-imports.ts from .ftl files
 * This reads the Fluent message files and creates the embedded locale imports
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Generating locale imports from .ftl files...');

const localeDir = path.join(__dirname, '..', 'src', 'locale');
const outputFile = path.join(
  __dirname,
  '..',
  'src',
  'services',
  'locale-imports.ts'
);

// Find all language directories
const languages = fs
  .readdirSync(localeDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

console.log(`Found languages: ${languages.join(', ')}`);

// Read messages for each language
const embeddedMessages = {};
for (const lang of languages) {
  const messagesFile = path.join(localeDir, lang, 'messages.ftl');
  if (fs.existsSync(messagesFile)) {
    const content = fs.readFileSync(messagesFile, 'utf8');
    // Strip out Fluent comments (lines starting with #) and empty lines
    const strippedContent = content
      .split('\n')
      .filter((line) => !line.trim().startsWith('#') && line.trim() !== '')
      .join('\n')
      .trim(); // Ensure clean content without trailing whitespace
    embeddedMessages[lang] = strippedContent;
    console.log(
      `✓ Loaded ${lang} messages (${content.length} chars -> ${strippedContent.length} chars after stripping comments)`
    );
  } else {
    console.warn(`⚠ Missing messages.ftl for language: ${lang}`);
  }
}

// Generate the TypeScript file
const template = `/**
 * MathQuill Locale Messages and Import Functions
 * 
 * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 * Generated from .ftl files in src/locale/ by script/generate-locale-imports.js
 * 
 * This file contains embedded Fluent localization messages for MathQuill's mathspeak functionality.
 * It provides synchronous access to locale messages without requiring external file loading.
 * 
 * Currently supports: ${languages.join(', ')}
 * 
 * To add a new language:
 * 1. Create src/locale/[lang]/messages.ftl with Fluent message strings
 * 2. Run 'node script/generate-locale-imports.js' to regenerate this file
 * 3. Add the language code to AVAILABLE_LOCALES if needed
 */

// Embedded locale messages for immediate synchronous access
const EMBEDDED_MESSAGES: Record<string, string> = {
${Object.entries(embeddedMessages)
  .map(
    ([lang, content]) =>
      `  ${lang}: \`${content.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\``
  )
  .join(',\n\n')}
};

function loadLocaleMessages(language: string): string | null {
  // Resolve the language to the actual language that will be loaded
  const resolvedLanguage = getResolvedLanguage(language);

  // Get the embedded messages
  const messages = EMBEDDED_MESSAGES[resolvedLanguage];
  if (messages) {
    if (resolvedLanguage !== language) {
      console.info(\`Language '\${language}' resolved to '\${resolvedLanguage}'\`);
    }
    return messages;
  }

  console.warn(\`No messages found for language: \${resolvedLanguage}\`);
  return null;
}

/**
 * Finds the best fallback language for a given language code.
 * Supports locale-specific codes (e.g., en-US → en, es-MX → es)
 */
function findFallbackLanguage(language: string): string | null {
  const normalizedLanguage = language.toLowerCase();

  // If it's a locale-specific code (e.g., en-GB), try the base language
  if (normalizedLanguage.includes('-')) {
    const baseLanguage = normalizedLanguage.split('-')[0];
    if (AVAILABLE_LOCALES.includes(baseLanguage as SupportedLocale)) {
      return baseLanguage;
    }
  }

  return null;
}

// Available locales registry
const AVAILABLE_LOCALES = ${JSON.stringify(languages)} as const;

type SupportedLocale = (typeof AVAILABLE_LOCALES)[number];

function isSupportedLocale(locale: string): locale is SupportedLocale {
  return AVAILABLE_LOCALES.includes(locale as SupportedLocale);
}

/**
 * Checks if a language is supported, either directly or through fallback.
 */
function hasLanguageSupport(language: string): boolean {
  const normalizedLanguage = language.toLowerCase();

  // Check exact match first
  if (isSupportedLocale(normalizedLanguage)) {
    return true;
  }

  // Check if fallback is available
  const fallback = findFallbackLanguage(normalizedLanguage);
  return fallback !== null;
}

/**
 * Gets the actual language that will be loaded for a given language request.
 */
function getResolvedLanguage(language: string): string {
  const normalizedLanguage = language.toLowerCase();

  // Check exact match first
  if (isSupportedLocale(normalizedLanguage)) {
    return normalizedLanguage;
  }

  // Try fallback
  const fallback = findFallbackLanguage(normalizedLanguage);
  if (fallback && isSupportedLocale(fallback)) {
    return fallback;
  }

  // Final fallback to English
  return 'en';
}

// Functions are made globally available below for MathQuill's concatenation build system

// @ts-ignore - Make functions globally available
if (typeof window !== 'undefined') {
  (window as any).loadLocaleMessages = loadLocaleMessages;
  (window as any).getResolvedLanguage = getResolvedLanguage;
  (window as any).hasLanguageSupport = hasLanguageSupport;
} else {
  (global as any).loadLocaleMessages = loadLocaleMessages;
  (global as any).getResolvedLanguage = getResolvedLanguage;
  (global as any).hasLanguageSupport = hasLanguageSupport;
}
`;

// Write the generated file
fs.writeFileSync(outputFile, template, 'utf8');

console.log('✅ Locale imports generated successfully!');
console.log(`📍 Location: ${outputFile}`);
console.log(
  `📊 Languages: ${languages.length}, Total messages: ${Object.values(embeddedMessages).reduce((sum, content) => sum + content.length, 0)} chars`
);
console.log('🏁 Locale import generation complete!');
