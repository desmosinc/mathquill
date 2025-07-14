# Mathematical Structure Delimiters
start-block = Start { $blockType ->
    [Fraction] Fraction
    [Root] Root
    [CubeRoot] Cube Root
    [AbsoluteValue] Absolute Value
    [Binomial] Binomial
    [Token] Token
    [Text] Text
    *[other] { $blockType }
}

end-block = End { $blockType ->
    [Fraction] Fraction
    [Root] Root
    [CubeRoot] Cube Root
    [AbsoluteValue] Absolute Value
    [Binomial] Binomial
    [Token] Token
    [Text] Text
    *[other] { $blockType }
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
power-ordinal = to the { $number }{ $number ->
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
power-negative = to the negative { $number }{ $number ->
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

# Basic mathematical operators
plus = plus
positive = positive
minus = minus
negative = negative
times = times
dot = dot
equals = equals

# Inequality operators
less-than = less than
greater-than = greater than
less-than-or-equal-to = less than or equal to
greater-than-or-equal-to = greater than or equal to
not-equal-to = not equal to
approximately-equal-to = approximately equal to

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

# Fraction denominators (singular and plural forms)
fraction-denom-2-singular = half
fraction-denom-2-plural = halves
fraction-denom-3-singular = third
fraction-denom-3-plural = thirds
fraction-denom-4-singular = quarter
fraction-denom-4-plural = quarters
fraction-denom-5-singular = fifth
fraction-denom-5-plural = fifths
fraction-denom-6-singular = sixth
fraction-denom-6-plural = sixths
fraction-denom-7-singular = seventh
fraction-denom-7-plural = sevenths
fraction-denom-8-singular = eighth
fraction-denom-8-plural = eighths
fraction-denom-9-singular = ninth
fraction-denom-9-plural = ninths

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
algebraic-fraction = { $numerator } over { $denominator }
algebraic-power = { $base } to the { $exponent } power
algebraic-root = { $index ->
    [2] square root of { $radicand }
    [3] cube root of { $radicand }
    *[other] { $index } root of { $radicand }
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
auto-operator-standard-deviation = standard deviation