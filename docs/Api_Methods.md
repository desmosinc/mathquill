# API Methods

To use the MathQuill API, first get an instance of the latest version of the interface:

```js
var MQ = MathQuill.getInterface(3);
```

By default, MathQuill overwrites the global `MathQuill` variable when loaded. If you do not want this behavior, you can use `.noConflict()` ([similar to `jQuery.noConflict()`](http://api.jquery.com/jQuery.noConflict)):

```html
<script src="/path/to/first-mathquill.js"></script>
<script src="/path/to/second-mathquill.js"></script>
<script>
  var secondMQ = MathQuill.noConflict().getInterface(3);
  secondMQ.MathField(...);

  var firstMQ = MathQuill.getInterface(3);
  firstMQ.MathField(...);
</script>
```

This lets different copies of MathQuill each power their own math fields, but using different copies on the same DOM element won't work. `.noConflict()` is primarily intended to help you reduce globals.

# Constructors

## MQ.StaticMath(html_element)

Creates a non-editable MathQuill initialized with the contents of the HTML element and returns a [StaticMath object](#mathquill-base-methods).

If the given element is already a static math instance, this will return a new StaticMath object with the same `.id`. If the element is a different type of MathQuill, this will return `null`.

## MQ.MathField(html_element, [ config ])

Creates an editable MathQuill initialized with the contents of the HTML element and returns a [MathField object](#editable-mathfield-methods).

If the given element is already an editable math field, this will return a new editable MathField object with the same `.id`. If the element is a different type of MathQuill, this will return `null`.

## \MathQuillMathField LaTeX command

`\MathQuillMathField` can be used to embed editable math fields inside static math, like:

```html
<span id="fill-in-the-blank"
  >\sqrt{ \MathQuillMathField{x}^2 + \MathQuillMathField{y}^2 }</span
>
<script>
  var fillInTheBlank = MQ.StaticMath(
    document.getElementById('fill-in-the-blank')
  );
  fillInTheBlank.innerFields[0].latex(); // => 'x'
  fillInTheBlank.innerFields[1].latex(); // => 'y'
</script>
```

As you can see, they can be accessed on the StaticMath object via `.innerFields`.

## MQ(html_element)

`MQ` itself is a function that takes an HTML element and, if it's the root
HTML element of a static math or math field, returns an API object for it
(if not, `null`):

```js
MQ(mathFieldSpan) instanceof MQ.MathField; // => true
MQ(otherSpan); // => null
```

## MQ.config(config)

Updates the default [configuration options](Config.md) for this instance of the API (which can be overridden on a per-field basis -- see the `MQ.MathField` and `MQ.StaticMath` constructors above).

If there are multiple instances of the MathQuill API, `MQ.config()` only affects the math MathQuill objects created by `MQ`. E.g.:

```js
var MQ1 = MathQuill.getInterface(3),
  MQ2 = MathQuill.getInterface(3);

MQ1.config(myConfig);
MQ1.MathField(a); // configured with myConfig
MQ1.MathField(b);

MQ2.MathField(c); // unaffected by myConfig
```

# Comparing MathFields

## Checking Type

```js
var staticMath = MQ.StaticMath(staticMathSpan);
mathField instanceof MQ.StaticMath; // => true
mathField instanceof MQ; // => true
mathField instanceof MathQuill; // => true

var mathField = MQ.MathField(mathFieldSpan);
mathField instanceof MQ.MathField; // => true
mathField instanceof MQ.EditableField; // => true
mathField instanceof MQ; // => true
mathField instanceof MathQuill; // => true
```

## Comparing IDs

API objects for the same MathQuill instance have the same `.id`, which will always be a unique truthy primitive value that can be used as an object key (like an ad hoc [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) or [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)):

```js
MQ(mathFieldSpan).id === mathField.id; // => true

var setOfMathFields = {};
setOfMathFields[mathField.id] = mathField;
MQ(mathFieldSpan).id in setOfMathFields; // => true
staticMath.id in setOfMathFields; // => false
```

## Data Object

Similarly, API objects for the same MathQuill instance share a `.data` object (which can be used like an ad hoc [`WeakMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) or [`WeakSet`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet)):

```js
MQ(mathFieldSpan).data === mathField.data; // => true
mathField.data.foo = 'bar';
MQ(mathFieldSpan).data.foo; // => 'bar'
```

# MathQuill base methods

The following are methods that every MathQuill object has. These are the only methods that static math instances have and a subset of the methods that editable fields have.

## .revert()

Any element that has been turned into a MathQuill instance can be reverted:

```html
<span id="revert-me" class="mathquill-static-math">
  some <code>HTML</code>
</span>
```

```js
mathfield.revert().innerHTML; // => 'some <code>HTML</code>'
```

## .reflow()

MathQuill uses computed dimensions, so if they change (because an element was mathquill-ified before it was in the visible HTML DOM, or the font size changed), then you'll need to tell MathQuill to recompute:

```js
var mathFieldSpan = $('<span>\\sqrt{2}</span>');
var mathField = MQ.MathField(mathFieldSpan[0]);
mathFieldSpan.appendTo(document.body);
mathField.reflow();
```

## .el()

Returns the root HTML element.

## .latex()

Returns the contents as LaTeX.

## .latex(latex_string)

This will render the argument as LaTeX in the MathQuill instance.

## .selection()

Returns the current cursor position / selection within the latex.
If the cursor is before the plus this method would return:

```js
{
  latex: 'a+b',
  startIndex: 1,
  endIndex: 1,
  opaqueSnapshot: {...}
}
```

You can pass the result of `.selection()` back into `.selection()` to restore a cursor / selection. This works by taking a snapshot of the selection you currently have and recording
enough information to restore it within `opaqueSnapshot`. You should not peek inside of `opaqueSnapshot` or permanently store it. This is valid only for this version of MathQuill. This selection is also only valid if the MQ's latex is identical. The MQ can go through changes, but when you try to restore the selection the current latex must match the latex when the selection snapshot was created.

```js
// this would work
mq.latex('abc');
mq.select();
const selection = mq.selection(); // takes a snapshot of the selection
mq.latex('123');
mq.latex('abc');
mq.selection(selection); // will restore the selection
```

```js
// this would not work
mq.latex('abc');
mq.select();
const selection = mq.selection(); // takes a snapshot of the selection
mq.latex('123');
mq.selection(selection); // will restore the selection
```

# Editable MathField methods

Editable math fields have all of the [above](#mathquill-base-methods) methods in addition to the ones listed here.

## .focus()

Puts the focus on the editable field.

## .blur()

Removes focus from the editable field.

## .write(latex_string)

Write the given LaTeX at the current cursor position. If the cursor does not have focus, writes to last position the cursor occupied in the editable field.

```js
mathField.write(' - 1'); // writes ' - 1' to mathField at the cursor position
```

## .cmd(latex_string)

Enter a LaTeX command at the current cursor position or with the current selection. If the cursor does not have focus, it writes it to last position the cursor occupied in the editable field.

```js
mathField.cmd('\\sqrt'); // writes a square root command at the cursor position
```

## .select()

Selects the contents (just like [on `textarea`s](http://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-48880622) and [on `input`s](http://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-34677168)).

## .clearSelection()

Clears the selection.

## .moveToLeftEnd(), .moveToRightEnd()

Move the cursor to the left/right end of the editable field, respectively. These are shorthand for [`.moveToDirEnd(L/R)`](#movetodirenddirection), respectively.

## .moveToDirEnd(direction)

Moves the cursor to the end of the mathfield in the direction specified. The direction can be one of `MQ.L` or `MQ.R`. These are constants, where `MQ.L === -MQ.R` and vice versa. This function may be easier to use than [moveToLeftEnd or moveToRightEnd](#movetoleftend-movetorightend) if used in the [`moveOutOf` handler](Config.md#outof-handlers).

```js
var config = {
  handlers: {
    moveOutOf: function(direction) {
      nextMathFieldOver.movetoDirEnd(-direction);
    }
  }
});
```

## .keystroke(keys)

Simulates keystrokes given a string like `"Ctrl-Home Del"`, a whitespace-delimited list of [key inputs](http://www.w3.org/TR/2012/WD-DOM-Level-3-Events-20120614/#fixed-virtual-key-codes) with optional prefixes.

```js
mathField.keystroke('Shift-Left'); // Selects character before the current cursor position
```

## .typedText(text)

Simulates typing text, one character at a time from where the cursor currently is. This is supposed to be identical to what would happen if a user were typing the text in.

```js
// Types part of the demo from mathquill.com without delays between keystrokes
mathField.typedText('x=-b\\pm \\sqrt b^2 -4ac');
```

## .setAriaLabel(ariaLabel)

Specify an [ARIA label][`aria-label`] for this field, for screen readers. The actual [`aria-label`] includes this label followed by the math content of the field as speech. Default: `'Math Input'` for English or `'Entrada Matemática'` for Spanish

## .getAriaLabel()

Returns the [ARIA label][`aria-label`] for this field, for screen readers. If no ARIA label has been specified, the default is returned (`'Math Input'` for English, `'Entrada Matemática'` for Spanish).

## .setAriaPostLabel(ariaPostLabel, timeout)

Specify a suffix to be appended to the [ARIA label][`aria-label`], after the math content of the field. Default: `''` (empty string)

If a timeout (in ms) is supplied, and the math field has keyboard focus when the time has elapsed, an ARIA alert will fire which will cause a screen reader to read the content of the field along with the ARIA post-label. This is useful if the post-label contains an evaluation, error message, or other text that the user needs to know about.

## .getAriaPostLabel()

Returns the suffix to be appended to the [ARIA label][`aria-label`], after the math content of the field. If no ARIA post-label has been specified, `''` (empty string) is returned.

## .isUserSelecting()

Returns `true` if the user is currently selecting text with the mouse, `false` otherwise. This can be useful for preventing certain actions (like setting the cursor position) while the user is actively dragging to select text. The method tracks mouse selection from the moment the user presses the mouse button down to start selecting until they release it or the selection is cancelled due to an edit operation.

```js
if (!mathField.isUserSelecting()) {
  // Safe to programmatically change cursor position
  mathField.moveToLeftEnd();
}
```


[`aria-label`]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-label_attribute

## .config(new_config)

Changes the [configuration](Config.md) of just this math field.

## Language Support

MathQuill supports internationalization through the `language` configuration option. This affects how mathematical expressions are read aloud for screen readers and accessibility tools.

### Setting Language

You can set the language when creating a MathField:

```js
var mathField = MQ.MathField(document.getElementById('math-input'), {
  language: 'es' // Spanish
});
```

Or change it later using the config method:

```js
mathField.config({ language: 'en' }); // Switch to English
```

### Supported Languages

Currently supported language codes:

- `'en'` - English (default)
- `'es'` - Spanish (Español)

### Language Features

The language setting affects how mathematical expressions are read aloud by screen readers. This includes operators, inequalities, fractions, powers, mathematical structures, and function names. For example, `sin(x^2) ≤ 1/2` reads as "sine of x squared less than or equal to 1 half" in English or "seno de x al cuadrado menor o igual que 1 medio" in Spanish.

### Language Validation and Fallback

MathQuill provides graceful fallback for unsupported languages. When an unsupported language is specified, it will automatically fall back to the closest supported language or English as a final fallback:

```js
// Language variants are resolved automatically
var mathField = MQ.MathField(element, { language: 'en-US' }); // Uses 'en'
var mathField = MQ.MathField(element, { language: 'es-MX' }); // Uses 'es'

// Unsupported languages fall back to English with a console warning
var mathField = MQ.MathField(element, { language: 'fr' }); // Falls back to 'en', logs warning
```

The fallback system works for both initial configuration and runtime language changes:

```js
mathField.config({ language: 'fr-CA' }); // Falls back to 'en', logs warning
```

### Examples

```js
// English math field (default)
var englishField = MQ.MathField(document.getElementById('english-math'));

// Spanish math field
var spanishField = MQ.MathField(document.getElementById('spanish-math'), {
  language: 'es'
});

// Global default language
MQ.config({ language: 'es' }); // All new fields will default to Spanish
```

### Localization API

MathQuill provides a localization API accessible through `MQ.L10N` for working with languages and translations:

```js
// Check if a language is supported
var isSupported = MQ.L10N.isLanguageSupported('es'); // true

// Resolve language codes (handles variants like 'en-US' → 'en')
var resolved = MQ.L10N.resolveLanguage('en-US'); // returns 'en'

// Set global default language for new MathQuill instances
MQ.L10N.setLanguage('es');

// Get current global default language
var currentLang = MQ.L10N.getLanguage(); // returns current language

// Listen for global language changes
var unsubscribe = MQ.L10N.onLanguageChange(function() {
  console.log('Language changed to:', MQ.L10N.getLanguage());
});

// Later, unsubscribe from changes
unsubscribe();

// Create a localization instance for custom use (advanced)
var localization = MQ.L10N.create('es');
var translation = localization.formatMessage('plus'); // 'más'
```

#### MQ.L10N.onLanguageChange(callback)

Registers a callback function that will be called whenever the global default language changes. This is useful for updating UI elements or re-rendering content when the language changes.

```js
// Listen for language changes
var unsubscribe = MQ.L10N.onLanguageChange(function() {
  // This will be called whenever MQ.L10N.setLanguage() is called
  var newLanguage = MQ.L10N.getLanguage();
  console.log('Language changed to:', newLanguage);

  // Update your UI or re-render content as needed
});

// To stop listening for changes, call the returned function
unsubscribe();
```

The callback receives no arguments. Use `MQ.L10N.getLanguage()` to get the current language within the callback.

**Returns:** A function that can be called to unregister the callback.

## .dropEmbedded(pageX, pageY, options) **[ᴇxᴘᴇʀɪᴍᴇɴᴛᴀʟ](#note-on-experimental-features)**

Insert a custom embedded element at the given coordinates, where `options` is an object like:

```js
{
  htmlString: '<span class="custom-embed"></span>',
  text: function() { return 'custom_embed'; },
  latex: function() { return '\\customEmbed'; }
}
```

## .registerEmbed('name', function(id){ return options; }) **[ᴇxᴘᴇʀɪᴍᴇɴᴛᴀʟ](#note-on-experimental-features)**

Allows MathQuill to parse custom embedded objects from latex, where `options` is an object like the one defined above in `.dropEmbedded()`. This will parse the following latex into the embedded object you defined: `\embed{name}[id]}`.

## Note on Experimental Features

Methods marked as experimental may be altered drastically or removed in future versions. They may also receive less maintenance than other non-experimental features.

# Inner MathField methods

Inner math fields have all of the [above](#editable-mathfield-methods) methods in addition to the ones listed here.

## makeStatic()

Converts the editable inner field into a static one.

## makeEditable()

Converts the static inner field into an editable one.
