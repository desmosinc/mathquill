# Mathematical Structure Delimiters
start-block = Inicio{ $blockType ->
    [Fraction] Fracción
    [Root] Raíz
    [CubeRoot] Raíz Cúbica
    [AbsoluteValue] Valor Absoluto
    [Binomial] Binomial
    [Token] Token
    [Text] Texto
    *[other] { $blockType }
}

end-block = Fin{ $blockType ->
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
start-fraction = InicioFracción
end-fraction = FinFracción
start-nested-fraction = InicioFracciónAnidada
nested-over = SobreAnidado
end-nested-fraction = FinFracciónAnidada
over = Sobre

# Root-specific messages
start-root = InicioRaíz
end-root = FinRaíz
start-cube-root = Inicio Raíz Cúbica
end-cube-root = Fin Raíz Cúbica
root-index = Índice de Raíz
start-nth-root = Inicio Raíz
end-nth-root = Fin Raíz

# Other structures
start-absolute-value = InicioValorAbsoluto
end-absolute-value = FinValorAbsoluto
start-binomial = InicioBinomial
end-binomial = FinBinomial
choose = Elige

# Text blocks
start-text = InicioTexto
end-text = FinTexto

# Token blocks
start-token = InicioToken
end-token = FinToken

# Subscript and Superscript
subscript = Subíndice
superscript = Superíndice
baseline = Línea Base

# Power expressions
power-squared = al cuadrado
power-cubed = al cubo
power-ordinal = a la { $number }{ $number ->
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
end-sum = , fin suma
start-product = Inicio producto desde
end-product = , fin producto
start-coproduct = Inicio co producto desde
end-coproduct = , fin co producto

# Integrals
start-integral = Inicio integral desde
end-integral = , fin integral

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
auto-operator-sine = seno
auto-operator-cosine = coseno
auto-operator-tangent = tangente
auto-operator-secant = secante
auto-operator-cosecant = cosecante
auto-operator-cotangent = cotangente
auto-operator-hyperbolic-sine = seno hiperbólico
auto-operator-hyperbolic-cosine = coseno hiperbólico
auto-operator-hyperbolic-tangent = tangente hiperbólica
auto-operator-logarithm = logaritmo
auto-operator-natural-logarithm = logaritmo natural
auto-operator-common-logarithm = logaritmo común
auto-operator-exponential = exponencial
auto-operator-limit = límite
auto-operator-supremum = supremo
auto-operator-infimum = ínfimo
auto-operator-maximum = máximo
auto-operator-minimum = mínimo
auto-operator-greatest-common-divisor = máximo común divisor
auto-operator-standard-deviation = desviación estándar