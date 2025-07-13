/**
 * MathQuill Locale Messages and Import Functions
 * 
 * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 * Generated from .ftl files in src/locale/ by script/generate-locale-imports.js
 * 
 * This file contains embedded Fluent localization messages for MathQuill's mathspeak functionality.
 * It provides synchronous access to locale messages without requiring external file loading.
 * 
 * Currently supports: en, es
 * 
 * To add a new language:
 * 1. Create src/locale/[lang]/messages.ftl with Fluent message strings
 * 2. Run 'node script/generate-locale-imports.js' to regenerate this file
 * 3. Add the language code to AVAILABLE_LOCALES if needed
 */

// Embedded locale messages for immediate synchronous access
const EMBEDDED_MESSAGES: Record<string, string> = {
  en: `# Mathematical Structure Delimiters
start-block = Start { \$blockType ->
    [Fraction] Fraction
    [Root] Root
    [CubeRoot] Cube Root
    [AbsoluteValue] Absolute Value
    [Binomial] Binomial
    [Token] Token
    [Text] Text
    *[other] { \$blockType }
}

end-block = End { \$blockType ->
    [Fraction] Fraction
    [Root] Root
    [CubeRoot] Cube Root
    [AbsoluteValue] Absolute Value
    [Binomial] Binomial
    [Token] Token
    [Text] Text
    *[other] { \$blockType }
}

# Fraction-specific messages
start-fraction = Start Fraction
end-fraction = End Fraction
start-nested-fraction = Start Nested Fraction
nested-over = nested over
end-nested-fraction = End Nested Fraction
over = over

# Root-specific messages
start-root = Start Root
end-root = End Root
start-cube-root = Start Cube Root
end-cube-root = End Cube Root
root-index = Root Index
start-nth-root = Start Root
end-nth-root = End Root

# Other structures
start-absolute-value = Start Absolute Value
end-absolute-value = End Absolute Value
start-binomial = Start Binomial
end-binomial = End Binomial
choose = Choose

# Summation and bounds
start-lower-bound = Start Lower Bound
end-lower-bound = End Lower Bound
start-upper-bound = Start Upper Bound
end-upper-bound = End Upper Bound

# Binomial indices
start-upper-index = Start Upper Index
end-upper-index = End Upper Index
start-lower-index = Start Lower Index
end-lower-index = End Lower Index

# Text blocks
start-text = Start Text
end-text = End Text

# Token blocks
start-token = Start Token
end-token = End Token

# Subscript and Superscript
subscript = Subscript
superscript = Superscript
baseline = Baseline

# Power expressions
power-squared = squared
power-cubed = cubed
power-ordinal = to the { \$number }{ \$number ->
    [1] st
    [21] st
    [31] st
    [41] st
    [51] st
    [61] st
    [71] st
    [81] st
    [91] st
    [2] nd
    [22] nd
    [32] nd
    [42] nd
    [52] nd
    [62] nd
    [72] nd
    [82] nd
    [92] nd
    [3] rd
    [23] rd
    [33] rd
    [43] rd
    [53] rd
    [63] rd
    [73] rd
    [83] rd
    [93] rd
    *[other] th
} power
power-zero = to the 0 power

# Basic mathematical operators
plus = plus
positive = positive
minus = minus
negative = negative
times = times
dot = dot

# Mixed fractions
and = and

# Fraction shortcuts with simple key-value pairs
fraction-shortcut-1-2 = 1 half
fraction-shortcut-1-3 = 1 third
fraction-shortcut-1-4 = 1 quarter
fraction-shortcut-1-5 = 1 fifth
fraction-shortcut-1-6 = 1 sixth
fraction-shortcut-1-7 = 1 seventh
fraction-shortcut-1-8 = 1 eighth
fraction-shortcut-1-9 = 1 ninth
fraction-shortcut-2-2 = 2 halves
fraction-shortcut-2-3 = 2 thirds
fraction-shortcut-2-4 = 2 quarters
fraction-shortcut-2-5 = 2 fifths
fraction-shortcut-2-6 = 2 sixths
fraction-shortcut-2-7 = 2 sevenths
fraction-shortcut-2-8 = 2 eighths
fraction-shortcut-2-9 = 2 ninths
fraction-shortcut-3-3 = 3 thirds
fraction-shortcut-3-4 = 3 quarters
fraction-shortcut-3-5 = 3 fifths
fraction-shortcut-3-6 = 3 sixths
fraction-shortcut-3-7 = 3 sevenths
fraction-shortcut-3-8 = 3 eighths
fraction-shortcut-3-9 = 3 ninths
fraction-shortcut-4-4 = 4 quarters
fraction-shortcut-4-5 = 4 fifths
fraction-shortcut-4-6 = 4 sixths
fraction-shortcut-4-7 = 4 sevenths
fraction-shortcut-4-8 = 4 eighths
fraction-shortcut-4-9 = 4 ninths
fraction-shortcut-5-5 = 5 fifths
fraction-shortcut-5-6 = 5 sixths
fraction-shortcut-5-7 = 5 sevenths
fraction-shortcut-5-8 = 5 eighths
fraction-shortcut-5-9 = 5 ninths
fraction-shortcut-6-6 = 6 sixths
fraction-shortcut-6-7 = 6 sevenths
fraction-shortcut-6-8 = 6 eighths
fraction-shortcut-6-9 = 6 ninths
fraction-shortcut-7-7 = 7 sevenths
fraction-shortcut-7-8 = 7 eighths
fraction-shortcut-7-9 = 7 ninths
fraction-shortcut-8-8 = 8 eighths
fraction-shortcut-8-9 = 8 ninths
fraction-shortcut-9-9 = 9 ninths

# Summation and Product Notation
start-sum = Start sum from
end-sum = end sum
start-product = Start product from
end-product = end product
start-coproduct = Start co product from
end-coproduct = end co product

# Integrals
start-integral = Start integral from
end-integral = end integral

# Consolidated "to" message (used by summation, product, coproduct, integral)
to = to

# Directional navigation
before = before
after = after
beginning-of = beginning of
end-of = end of

# Generic fallback messages
algebraic-fraction = { \$numerator } over { \$denominator }
algebraic-power = { \$base } to the { \$exponent } power
algebraic-root = { \$index ->
    [2] square root of { \$radicand }
    [3] cube root of { \$radicand }
    *[other] { \$index } root of { \$radicand }
}

# Default ARIA labels
default-aria-label = Math Input

# Auto operator names (can be overridden by user configuration)
auto-operator-sin = sine
auto-operator-cos = cosine
auto-operator-tan = tangent
auto-operator-sec = secant
auto-operator-csc = cosecant
auto-operator-cot = cotangent
auto-operator-sinh = hyperbolic sine
auto-operator-cosh = hyperbolic cosine
auto-operator-tanh = hyperbolic tangent
auto-operator-log = logarithm
auto-operator-ln = natural logarithm
auto-operator-lg = common logarithm
auto-operator-exp = exponential
auto-operator-lim = limit
auto-operator-sup = supremum
auto-operator-inf = infimum
auto-operator-max = maximum
auto-operator-min = minimum
auto-operator-gcd = greatest common divisor
auto-operator-standard-deviation = standard deviation`,

  es: `# Mathematical Structure Delimiters
start-block = Inicio { \$blockType ->
    [Fraction] Fracción
    [Root] Raíz
    [CubeRoot] Raíz Cúbica
    [AbsoluteValue] Valor Absoluto
    [Binomial] Binomial
    [Token] Token
    [Text] Texto
    *[other] { \$blockType }
}

end-block = Fin { \$blockType ->
    [Fraction] Fracción
    [Root] Raíz
    [CubeRoot] Raíz Cúbica
    [AbsoluteValue] Valor Absoluto
    [Binomial] Binomial
    [Token] Token
    [Text] Texto
    *[other] { \$blockType }
}

# Fraction-specific messages
start-fraction = Inicio Fracción
end-fraction = Fin Fracción
start-nested-fraction = Inicio Fracción Anidada
nested-over = sobre anidado
end-nested-fraction = Fin Fracción Anidada
over = sobre

# Root-specific messages
start-root = Inicio Raíz
end-root = Fin Raíz
start-cube-root = Inicio Raíz Cúbica
end-cube-root = Fin Raíz Cúbica
root-index = Índice de Raíz
start-nth-root = Inicio Raíz
end-nth-root = Fin Raíz

# Other structures
start-absolute-value = Inicio Valor Absoluto
end-absolute-value = Fin Valor Absoluto
start-binomial = Inicio Binomial
end-binomial = Fin Binomial
choose = Elige

# Summation and bounds
start-lower-bound = Inicio Límite Inferior
end-lower-bound = Fin Límite Inferior
start-upper-bound = Inicio Límite Superior
end-upper-bound = Fin Límite Superior

# Binomial indices
start-upper-index = Inicio Índice Superior
end-upper-index = Fin Índice Superior
start-lower-index = Inicio Índice Inferior
end-lower-index = Fin Índice Inferior

# Text blocks
start-text = Inicio Texto
end-text = Fin Texto

# Token blocks
start-token = Inicio Token
end-token = Fin Token

# Subscript and Superscript
subscript = Subíndice
superscript = Superíndice
baseline = Línea Base

# Power expressions
power-squared = al cuadrado
power-cubed = al cubo
power-ordinal = a la { \$number ->
    [1] primera
    [2] segunda
    [3] tercera
    [4] cuarta
    [5] quinta
    [6] sexta
    [7] séptima
    [8] octava
    [9] novena
    *[other] { \$number }ª
} potencia
power-zero = a la 0 potencia

# Basic mathematical operators
plus = más
positive = positivo
minus = menos
negative = negativo
times = por
dot = punto

# Mixed fractions
and = y

# Fraction shortcuts with simple key-value pairs
fraction-shortcut-1-2 = 1 medio
fraction-shortcut-1-3 = 1 tercio
fraction-shortcut-1-4 = 1 cuarto
fraction-shortcut-1-5 = 1 quinto
fraction-shortcut-1-6 = 1 sexto
fraction-shortcut-1-7 = 1 séptimo
fraction-shortcut-1-8 = 1 octavo
fraction-shortcut-1-9 = 1 noveno
fraction-shortcut-2-2 = 2 medios
fraction-shortcut-2-3 = 2 tercios
fraction-shortcut-2-4 = 2 cuartos
fraction-shortcut-2-5 = 2 quintos
fraction-shortcut-2-6 = 2 sextos
fraction-shortcut-2-7 = 2 séptimos
fraction-shortcut-2-8 = 2 octavos
fraction-shortcut-2-9 = 2 novenos
fraction-shortcut-3-3 = 3 tercios
fraction-shortcut-3-4 = 3 cuartos
fraction-shortcut-3-5 = 3 quintos
fraction-shortcut-3-6 = 3 sextos
fraction-shortcut-3-7 = 3 séptimos
fraction-shortcut-3-8 = 3 octavos
fraction-shortcut-3-9 = 3 novenos
fraction-shortcut-4-4 = 4 cuartos
fraction-shortcut-4-5 = 4 quintos
fraction-shortcut-4-6 = 4 sextos
fraction-shortcut-4-7 = 4 séptimos
fraction-shortcut-4-8 = 4 octavos
fraction-shortcut-4-9 = 4 novenos
fraction-shortcut-5-5 = 5 quintos
fraction-shortcut-5-6 = 5 sextos
fraction-shortcut-5-7 = 5 séptimos
fraction-shortcut-5-8 = 5 octavos
fraction-shortcut-5-9 = 5 novenos
fraction-shortcut-6-6 = 6 sextos
fraction-shortcut-6-7 = 6 séptimos
fraction-shortcut-6-8 = 6 octavos
fraction-shortcut-6-9 = 6 novenos
fraction-shortcut-7-7 = 7 séptimos
fraction-shortcut-7-8 = 7 octavos
fraction-shortcut-7-9 = 7 novenos
fraction-shortcut-8-8 = 8 octavos
fraction-shortcut-8-9 = 8 novenos
fraction-shortcut-9-9 = 9 novenos

# Summation and Product Notation
start-sum = Inicio suma desde
end-sum = fin suma
start-product = Inicio producto desde
end-product = fin producto
start-coproduct = Inicio co producto desde
end-coproduct = fin co producto

# Integrals
start-integral = Inicio integral desde
end-integral = fin integral

# Consolidated "to" message (used by summation, product, coproduct, integral)
to = hasta

# Directional navigation
before = antes
after = después
beginning-of = principio de
end-of = final de

# Generic fallback messages
algebraic-fraction = { \$numerator } sobre { \$denominator }
algebraic-power = { \$base } a la { \$exponent } potencia
algebraic-root = { \$index ->
    [2] raíz cuadrada de { \$radicand }
    [3] raíz cúbica de { \$radicand }
    *[other] raíz { \$index } de { \$radicand }
}

# Default ARIA labels
default-aria-label = Entrada Matemática

# Auto operator names (can be overridden by user configuration)
auto-operator-sin = seno
auto-operator-cos = coseno
auto-operator-tan = tangente
auto-operator-sec = secante
auto-operator-csc = cosecante
auto-operator-cot = cotangente
auto-operator-sinh = seno hiperbólico
auto-operator-cosh = coseno hiperbólico
auto-operator-tanh = tangente hiperbólica
auto-operator-log = logaritmo
auto-operator-ln = logaritmo natural
auto-operator-lg = logaritmo común
auto-operator-exp = exponencial
auto-operator-lim = límite
auto-operator-sup = supremo
auto-operator-inf = ínfimo
auto-operator-max = máximo
auto-operator-min = mínimo
auto-operator-gcd = máximo común divisor
auto-operator-std = desviación estándar`
};

function loadLocaleMessages(language: string): string | null {
  // Resolve the language to the actual language that will be loaded
  const resolvedLanguage = getResolvedLanguage(language);

  // Get the embedded messages
  const messages = EMBEDDED_MESSAGES[resolvedLanguage];
  if (messages) {
    if (resolvedLanguage !== language) {
      console.info(`Language '${language}' resolved to '${resolvedLanguage}'`);
    }
    return messages;
  }

  console.warn(`No messages found for language: ${resolvedLanguage}`);
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
const AVAILABLE_LOCALES = ["en","es"] as const;

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
