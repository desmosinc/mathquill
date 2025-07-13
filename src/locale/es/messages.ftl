# Mathematical Structure Delimiters
start-block = Inicio { $blockType ->
    [Fraction] Fracción
    [Root] Raíz
    [CubeRoot] Raíz Cúbica
    [AbsoluteValue] Valor Absoluto
    [Binomial] Binomial
    [Token] Token
    [Text] Texto
    *[other] { $blockType }
}

end-block = Fin { $blockType ->
    [Fraction] Fracción
    [Root] Raíz
    [CubeRoot] Raíz Cúbica
    [AbsoluteValue] Valor Absoluto
    [Binomial] Binomial
    [Token] Token
    [Text] Texto
    *[other] { $blockType }
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
power-ordinal = a la { $number ->
    [1] primera
    [2] segunda
    [3] tercera
    [4] cuarta
    [5] quinta
    [6] sexta
    [7] séptima
    [8] octava
    [9] novena
    *[other] { $number }ª
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
algebraic-fraction = { $numerator } sobre { $denominator }
algebraic-power = { $base } a la { $exponent } potencia
algebraic-root = { $index ->
    [2] raíz cuadrada de { $radicand }
    [3] raíz cúbica de { $radicand }
    *[other] raíz { $index } de { $radicand }
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
auto-operator-std = desviación estándar