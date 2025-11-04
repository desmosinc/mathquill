# Setting Configuration

The configuration options object is of the following form:

```js
{
  spaceBehavesLikeTab: true,
  leftRightIntoCmdGoes: 'up',
  restrictMismatchedBrackets: true,
  sumStartsWithNEquals: true,
  supSubsRequireOperand: true,
  charsThatBreakOutOfSupSub: '+-=<>',
  autoSubscriptNumerals: true,
  autoCommands: 'pi theta sqrt sum',
  autoOperatorNames: 'sin cos',
  maxDepth: 10,
  substituteTextarea: function() {
    const textarea = document.createElement('textarea');
    return textarea;
  },
  handlers: {
    edit: function(mathField) { ... },
    upOutOf: function(mathField) { ... },
    moveOutOf: function(dir, mathField) { if (dir === MQ.L) ... else ... }
  }
}
```

You can configure an editable math field by passing an options argument as the second argument to [the constructor (`MQ.MathField(html_element, config)`)](Api_Methods.md#mqmathfieldhtml_element-config), or by [calling `.config()` on the math field (`mathField.config(new_config)`)](Api_Methods.md#confignew_config).

Defaults may be set with [`MQ.config(global_config)`](Api_Methods.md#mqconfigconfig).

# Configuration Options

## spacesBehavesLikeTab

If `spaceBehavesLikeTab` is true the keystrokes `{Shift-,}Spacebar` will behave like `{Shift-,}Tab` escaping from the current block (as opposed to the default behavior of inserting a Space character).

The animated demo on <mathquill.com> has this behavior.

## leftRightIntoCmdGoes

This allows you to change the way the left and right keys move the cursor when there are items of different height, like fractions.

By default, the Left and Right keys move the cursor through all possible cursor positions in a particular order: right into a fraction puts the cursor at the left end of the numerator, right out of the numerator puts the cursor at the left end of the denominator, and right out of the denominator puts the cursor to the right of the fraction. Symmetrically, left into a fraction puts the cursor at the right end of the denominator, etc.

If instead you want right to always visually go right, and left to always go visually left, you can set `leftRightIntoCmdGoes` to `'up'` or `'down'` so that left and right go up or down (respectively) into commands. For example, `'up'` means that left into a fraction goes up into the numerator and right out of the numerator skips the denominator and puts the cursor to the right of the fraction. This behavior can be seen in the [Desmos calculator](https://www.desmos.com/calculator). If this property is set to `'down'` instead, the numerator is harder to navigate to, like in the Mac OS X built-in app Grapher.

## restrictMismatchedBrackets

If `restrictMismatchedBrackets` is true then you can type `[a,b)` and `(a,b]`, but if you try typing `[x}` or `\langle x|`, you'll get `[{x}]` or `\langle|x|\rangle` instead. This lets you type `(|x|+1)` normally; otherwise, you'd get `\left( \right| x \left| + 1 \right)`. Setting the option to `'none'` disables the range matching, so ( won't match with ] and vice versa.

## sumStartsWithNEquals

If `sumStartsWithNEquals` is true then when you type `\sum`, `\prod`, or `\coprod`, the lower limit starts out with `n=`, e.g. you get the LaTeX `\sum_{n=}^{ }`, rather than empty by default.

## supSubsRequireOperand

`supSubsRequireOperand` disables typing of superscripts and subscripts when there's nothing to the left of the cursor to be exponentiated or subscripted. Prevents the especially confusing typo `x^^2`, which looks much like `x^2`.

## charsThatBreakOutOfSupSub

`charsThatBreakOutOfSupSub` takes a string of the chars that when typed, "break out" of superscripts and subscripts.

Normally, to get out of a superscript or subscript, a user has to navigate out of it with the directional keys, a mouse click, tab, or Space if [`spaceBehavesLikeTab`](#spacesbehavesliketab) is true. For example, typing `x^2n+y` normally results in the LaTeX `x^{2n+y}`. If you wanted to get the LaTeX `x^{2n}+y`, the user would have to manually move the cursor out of the exponent.

If this option was set to `'+-'`, `+` and `-` would "break out" of the exponent. This doesn't apply to the first character in a superscript or subscript, so typing `x^-6` still results in `x^{-6}`. The downside to setting this option is that in order to type `x^{n+m}`, a workaround like typing `x^(n+m` and then deleting the `(` is required.

## autoCommands

`autoCommands` defines the set of commands automatically rendered by just typing the letters without typing a backslash first.

This takes a string formatted as a space-delimited list of LaTeX commands. Each LaTeX command must be at least letters only with a minimum length of 2 characters.

For example, with `autoCommands` set to `'pi theta'`, the word 'pi' automatically converts to the pi symbol and the word 'theta' automatically converts to the theta symbol.

## autoOperatorNames

`autoOperatorNames` overrides the set of operator names that automatically become non-italicized when typing the letters without typing a backslash first, like `sin`, `log`, etc.

This defaults to the LaTeX built-in operator names ([Section 3.17 of the Short Math Guide](http://tinyurl.com/jm9okjc)) with additional trig operators like `sech`, `arcsec`, `arsinh`, etc. If you want some of these italicized after setting this property, you will have to add them to the list.

Just like [`autoCommands`](#autocommands) above, this takes a string formatted as a space-delimited list of LaTeX commands.

autoOperatorNames can also accept a speech-friendly alternative for each operator name. This will get read out by screenreaders in place of the raw command. To specify a speech-friendly-alternative, add a `|` character after the command, and then add the speech-friendly-alternative as a string, with spaces replaced by `-`. E.g. `stdev|standard-deviation`.

## infixOperatorNames

`infixOperatorNames` specifies a set of operator names that should be treated as infix operators, for example for determining when to stop scanning left before a fraction.

For example, [Desmos](https://www.desmos.com/calculator) includes `for` in this option, so typing `(t,t) for 1/2 < t < 1` becomes `(t,t) for \frac{1}{2} < t < 1` and not `\frac{(t,t) for 1}{2} < t < 1`.

Also, a minus sign (`-`) after an infix operator is treated as prefix, so `(t,t) for -1 < t < 1` doesn't look like `(t,t) for - 1 < t < 1`.

This defaults to being empty.

Just like [`autoCommands`](#autocommands) above, this takes a string formatted as a space-delimited list of LaTeX commands.

## prefixOperatorNames

`prefixOperatorNames` specifies a set of operator names that appear as prefix operators. A minus sign after a prefix operator is treated as a negative, instead of a binary subtraction.

For example, Desmos includes `sin` in this option, so typing `sin -1` doesn't look like `sin - 1`.

## enableDigitGrouping and tripleDotsAreEllipsis

If `enableDigitGrouping` is true, then sequences of digits (and `.`) will have a thin space every three digits. If a sequence of digits has exactly one `.`, then the spacing will only be in the whole number part (before the `.`). If a sequence of digits contains more than one `.`, or at least one space, then digit grouping is always disabled for that sequence.

If `tripleDotsAreEllipsis` is true, then `...` is treated as an ellipsis, with the following three changes:

1. Digit grouping re-starts after `...`, so `12345...56789` puts a thin space in both `12345` and `56789`
2. A thin space surrounds `...`, so `123....456` looks more like `123 ... .456`.
3. The `...` is not included in automatic fractions, so typing `12...34/` leads to `12...\frac{34}{ }` instead of `\frac{12...34}{ }`.

## maxDepth

`maxDepth` specifies the maximum number of nested MathBlocks. When `maxDepth` is set to 1, the user can type simple math symbols directly into the editor but not into nested MathBlocks, e.g. the numerator and denominator of a fraction.

Nested content in latex rendered during initialization or pasted into mathquill is truncated to avoid violating `maxDepth`. When `maxDepth` is not set, no depth limit is applied by default.
You can also specify a speech-friendly representation of the operator name by supplying the operator name, a `|` and its speech alternative (separate multiple words with a `-`). For example, `'sin|sine cos|cosine tan|tangent sinh|hyperbolic-sine'`.

## substituteTextarea

`substituteTextarea` is a function that creates a focusable DOM element that is called when setting up a math field. Overwriting this may be useful for hacks like suppressing built-in virtual keyboards. It defaults to `<textarea autocorrect=off .../>`.
For example, [Desmos](https://www.desmos.com/calculator) substitutes `<textarea inputmode=none />` to suppress the native virtual keyboard in favor of a custom math keypad that calls the MathQuill API. On old iOS versions that don't support `inputmode=none`, it uses `<span tabindex=0></span>` to suppress the native virtual keyboard, at the cost of bluetooth keyboards not working.

## tabindex

Sets a tabindex on the field, following the standard spec. When tabindex is -1,
the math field is not part of the page's tab order. Despite that, the math field can still be focused when selected by a mouse.

Static math fields default to `tabindex: -1`, Editable math fields default to `tabindex: 0`.

## disableAutoSubstitutionInSubscripts

If `disableAutoSubstitutionInSubscripts` is `false` (default), then typing auto command names such as `int` will expand to `\int`, even in subscripts.

If `disableAutoSubstitutionInSubscripts` is `true`, then such expansions are disabled in all subscripts, so users can type `A_{point}` without getting `A_{po\int}`.

If `disableAutoSubstitutionInSubscripts` is `{except: "log"}`, then such expansions are disabled in all subscripts, _except_ for after `\log`, so users can type `\log_{\pi}(x)` again. Just like [`autoCommands`](#autocommands) above, the `except` property should be a string formatted as a space-delimited list of LaTeX commands.

# Handlers

Handlers are called after a specified event. They are called directly on the `handlers` object passed in, preserving the `this` value, so you can do stuff like:

```js
class MathList {
  constructor () {
    this.maths = [];
    this.el = ...
  };
  add () {
    var math = MQ.MathField($('<span/>')[0], { handlers: this });
    $(math.el()).appendTo(this.el);
    math.data.i = this.maths.length;
    this.maths.push(math);
  };
  moveOutOf (dir, math) {
    var adjacentI = (dir === MQ.L ? math.data.i - 1 : math.data.i + 1);
    var adjacentMath = this.maths[adjacentI];
    if (adjacentMath) adjacentMath.focus().moveToDirEnd(-dir);
  };
  ...
};
```

It's common to just ignore the last argument, like if the handlers close over the math field:

```js
var latex = '';
var mathField = MQ.MathField($('#mathfield')[0], {
  handlers: {
    edit: function () {
      latex = mathField.latex();
    },
    enter: function () {
      submitLatex(latex);
    }
  }
});
```

## \*OutOf handlers

`.moveOutOf(direction, mathField)`, `.deleteOutOf(direction, mathField)`, `.selectOutOf(direction, mathField)`, `.upOutOf(mathField)`, `.downOutOf(mathField)`

The `*OutOf` handlers are called when a cursor movement would cause the cursor to leave the MathQuill mathField. These let you integrate cursor movement seamlessly between your code and MathQuill. For example, when the cursor is at the right edge, pressing the Right key causes the `moveOutOf` handler to be called with `MQ.R` and the math field API object. Pressing Backspace causes `deleteOutOf` to be called with `MQ.L` and the API object.

## enter(mathField)

Called whenever Enter is pressed.

## edit(mathField)

This is called when the contents of the field might have been changed. This will be called with any edit, such as something being typed, deleted, or written with the API. Note that this may be called when nothing has actually changed.

Deprecated aliases: `edited`, `reflow`.

# Changing Colors

To change the foreground color, set both `color` and the `border-color` because some MathQuill symbols are implemented with borders instead of pure text.

For example, to style as white-on-black instead of black-on-white use:

    #my-math-input {
      color: white;
      border-color: white;
      background: black;
    }
