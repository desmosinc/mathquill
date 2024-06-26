/************************************
 * Symbols for Advanced Mathematics
 ***********************************/

function bindSimpleBinop(latex: string) {
  return bindBinaryOperator('\\' + latex + ' ', '&' + latex + ';', latex);
}

LatexCmds['∉'] = LatexCmds.notin = bindSimpleBinop('notin');
LatexCmds['≅'] = LatexCmds.cong = bindSimpleBinop('cong');
LatexCmds['≡'] = LatexCmds.equiv = bindSimpleBinop('equiv');
LatexCmds['⊕'] = LatexCmds.oplus = bindSimpleBinop('oplus');
LatexCmds['⊗'] = LatexCmds.otimes = bindSimpleBinop('otimes');

LatexCmds['∗'] =
  LatexCmds.ast =
  LatexCmds.star =
  LatexCmds.loast =
  LatexCmds.lowast =
    bindBinaryOperator('\\ast ', '&lowast;', 'low asterisk');

LatexCmds['∴'] =
  LatexCmds.therefor =
  LatexCmds.therefore =
    bindBinaryOperator('\\therefore ', '&there4;', 'therefore');

LatexCmds['∵'] =
  LatexCmds.cuz =
  LatexCmds.because =
    bindBinaryOperator(
      // l33t
      '\\because ',
      '&#8757;',
      'because'
    );

LatexCmds['∝'] =
  LatexCmds.prop =
  LatexCmds.propto =
    bindBinaryOperator('\\propto ', '&prop;', 'proportional to');

// Note "≈" is dupliucated in basicSymbols.
LatexCmds['≈'] =
  LatexCmds.asymp =
  LatexCmds.approx =
    bindBinaryOperator('\\approx ', '&asymp;', 'approximately equal to');

LatexCmds['∈'] =
  LatexCmds.isin =
  LatexCmds['in'] =
    bindBinaryOperator('\\in ', '&isin;', 'is in');

LatexCmds['∋'] =
  LatexCmds.ni =
  LatexCmds.contains =
    bindBinaryOperator('\\ni ', '&ni;', 'contains');

LatexCmds['∌'] =
  LatexCmds.notni =
  LatexCmds.niton =
  LatexCmds.notcontains =
  LatexCmds.doesnotcontain =
    bindBinaryOperator('\\not\\ni ', '&#8716;', 'does not contain');

LatexCmds['⊂'] =
  LatexCmds.sub =
  LatexCmds.subset =
    bindBinaryOperator('\\subset ', '&sub;', 'subset');

LatexCmds['⊃'] =
  LatexCmds.sup =
  LatexCmds.supset =
  LatexCmds.superset =
    bindBinaryOperator('\\supset ', '&sup;', 'superset');

LatexCmds['⊄'] =
  LatexCmds.nsub =
  LatexCmds.notsub =
  LatexCmds.nsubset =
  LatexCmds.notsubset =
    bindBinaryOperator('\\not\\subset ', '&#8836;', 'not a subset');

LatexCmds['⊅'] =
  LatexCmds.nsup =
  LatexCmds.notsup =
  LatexCmds.nsupset =
  LatexCmds.notsupset =
  LatexCmds.nsuperset =
  LatexCmds.notsuperset =
    bindBinaryOperator('\\not\\supset ', '&#8837;', 'not a superset');

LatexCmds['⊆'] =
  LatexCmds.sube =
  LatexCmds.subeq =
  LatexCmds.subsete =
  LatexCmds.subseteq =
    bindBinaryOperator('\\subseteq ', '&sube;', 'subset or equal to');

LatexCmds['⊇'] =
  LatexCmds.supe =
  LatexCmds.supeq =
  LatexCmds.supsete =
  LatexCmds.supseteq =
  LatexCmds.supersete =
  LatexCmds.superseteq =
    bindBinaryOperator('\\supseteq ', '&supe;', 'superset or equal to');

LatexCmds['⊊'] =
  LatexCmds.nsube =
  LatexCmds.nsubeq =
  LatexCmds.notsube =
  LatexCmds.notsubeq =
  LatexCmds.nsubsete =
  LatexCmds.nsubseteq =
  LatexCmds.notsubsete =
  LatexCmds.notsubseteq =
    bindBinaryOperator('\\not\\subseteq ', '&#8840;', 'not subset or equal to');

LatexCmds['⊋'] =
  LatexCmds.nsupe =
  LatexCmds.nsupeq =
  LatexCmds.notsupe =
  LatexCmds.notsupeq =
  LatexCmds.nsupsete =
  LatexCmds.nsupseteq =
  LatexCmds.notsupsete =
  LatexCmds.notsupseteq =
  LatexCmds.nsupersete =
  LatexCmds.nsuperseteq =
  LatexCmds.notsupersete =
  LatexCmds.notsuperseteq =
    bindBinaryOperator(
      '\\not\\supseteq ',
      '&#8841;',
      'not superset or equal to'
    );

//the canonical sets of numbers
LatexCmds.mathbb = class extends MathCommand {
  createLeftOf(_cursor: Cursor) {}
  numBlocks() {
    return 1 as const;
  }
  parser() {
    var string = Parser.string;
    var regex = Parser.regex;
    var optWhitespace = Parser.optWhitespace;
    return optWhitespace
      .then(string('{'))
      .then(optWhitespace)
      .then(regex(/^[NPZQRCH]/))
      .skip(optWhitespace)
      .skip(string('}'))
      .map(function (c) {
        // instantiate the class for the matching char
        var cmd = LatexCmds[c];
        if (isMQNodeClass(cmd)) {
          return new cmd();
        } else {
          return (cmd as MQNodeBuilderNoParam)();
        }
      });
  }
};

LatexCmds['ℕ'] =
  LatexCmds.N =
  LatexCmds.naturals =
  LatexCmds.Naturals =
    bindVanillaSymbol('\\mathbb{N}', '&#8469;', 'naturals');

LatexCmds['ℙ'] =
  LatexCmds.P =
  LatexCmds.primes =
  LatexCmds.Primes =
  LatexCmds.projective =
  LatexCmds.Projective =
  LatexCmds.probability =
  LatexCmds.Probability =
    bindVanillaSymbol('\\mathbb{P}', '&#8473;', 'P');

LatexCmds['ℤ'] =
  LatexCmds.Z =
  LatexCmds.integers =
  LatexCmds.Integers =
    bindVanillaSymbol('\\mathbb{Z}', '&#8484;', 'integers');

LatexCmds['ℚ'] =
  LatexCmds.Q =
  LatexCmds.rationals =
  LatexCmds.Rationals =
    bindVanillaSymbol('\\mathbb{Q}', '&#8474;', 'rationals');

LatexCmds['ℝ'] =
  LatexCmds.R =
  LatexCmds.reals =
  LatexCmds.Reals =
    bindVanillaSymbol('\\mathbb{R}', '&#8477;', 'reals');

LatexCmds['ℂ'] =
  LatexCmds.C =
  LatexCmds.complex =
  LatexCmds.Complex =
  LatexCmds.complexes =
  LatexCmds.Complexes =
  LatexCmds.complexplane =
  LatexCmds.Complexplane =
  LatexCmds.ComplexPlane =
    bindVanillaSymbol('\\mathbb{C}', '&#8450;', 'complexes');

LatexCmds['ℍ'] =
  LatexCmds.H =
  LatexCmds.Hamiltonian =
  LatexCmds.quaternions =
  LatexCmds.Quaternions =
    bindVanillaSymbol('\\mathbb{H}', '&#8461;', 'quaternions');

//spacing
LatexCmds.quad = LatexCmds.emsp = bindVanillaSymbol(
  '\\quad ',
  '    ',
  '4 spaces'
);
LatexCmds.qquad = bindVanillaSymbol('\\qquad ', '        ', '8 spaces');
/* spacing special characters, gonna have to implement this in LatexCommandInput::onText somehow
case ',':
  return VanillaSymbol('\\, ',' ', 'comma');
case ':':
  return VanillaSymbol('\\: ','  ', 'colon');
case ';':
  return VanillaSymbol('\\; ','   ', 'semicolon');
case '!':
  return MQSymbol('\\! ','<span style="margin-right:-.2em"></span>', 'exclamation point');
*/

//binary operators
LatexCmds['◇'] = LatexCmds.diamond = bindVanillaSymbol(
  '\\diamond ',
  '&#9671;',
  'diamond'
);
LatexCmds.bigtriangleup = bindVanillaSymbol(
  '\\bigtriangleup ',
  '&#9651;',
  'triangle up'
);
LatexCmds['⊖'] = LatexCmds.ominus = bindVanillaSymbol(
  '\\ominus ',
  '&#8854;',
  'o minus'
);
LatexCmds['⊎'] = LatexCmds.uplus = bindVanillaSymbol(
  '\\uplus ',
  '&#8846;',
  'disjoint union'
);
LatexCmds.bigtriangledown = bindVanillaSymbol(
  '\\bigtriangledown ',
  '&#9661;',
  'triangle down'
);
LatexCmds['⊓'] = LatexCmds.sqcap = bindVanillaSymbol(
  '\\sqcap ',
  '&#8851;',
  'greatest lower bound'
);
LatexCmds['⊲'] = LatexCmds.triangleleft = bindVanillaSymbol(
  '\\triangleleft ',
  '&#8882;',
  'triangle left'
);
LatexCmds['⊔'] = LatexCmds.sqcup = bindVanillaSymbol(
  '\\sqcup ',
  '&#8852;',
  'least upper bound'
);
LatexCmds['⊳'] = LatexCmds.triangleright = bindVanillaSymbol(
  '\\triangleright ',
  '&#8883;',
  'triangle right'
);
//circledot is not a not real LaTex command see https://github.com/mathquill/mathquill/pull/552 for more details
LatexCmds['⊙'] =
  LatexCmds.odot =
  LatexCmds.circledot =
    bindVanillaSymbol('\\odot ', '&#8857;', 'circle dot');
LatexCmds['◯'] = LatexCmds.bigcirc = bindVanillaSymbol(
  '\\bigcirc ',
  '&#9711;',
  'circle'
);
LatexCmds['†'] = LatexCmds.dagger = bindVanillaSymbol(
  '\\dagger ',
  '&#0134;',
  'dagger'
);
LatexCmds['‡'] = LatexCmds.ddagger = bindVanillaSymbol(
  '\\ddagger ',
  '&#135;',
  'big dagger'
);
LatexCmds['≀'] = LatexCmds.wr = bindVanillaSymbol('\\wr ', '&#8768;', 'wreath');
LatexCmds['∐'] = LatexCmds.amalg = bindVanillaSymbol(
  '\\amalg ',
  '&#8720;',
  'amalgam'
);

//relationship symbols
LatexCmds['⊨'] = LatexCmds.models = bindVanillaSymbol(
  '\\models ',
  '&#8872;',
  'models'
);
LatexCmds['≺'] = LatexCmds.prec = bindVanillaSymbol(
  '\\prec ',
  '&#8826;',
  'precedes'
);
LatexCmds['≻'] = LatexCmds.succ = bindVanillaSymbol(
  '\\succ ',
  '&#8827;',
  'succeeds'
);
LatexCmds['≼'] = LatexCmds.preceq = bindVanillaSymbol(
  '\\preceq ',
  '&#8828;',
  'precedes or equals'
);
LatexCmds['≽'] = LatexCmds.succeq = bindVanillaSymbol(
  '\\succeq ',
  '&#8829;',
  'succeeds or equals'
);
LatexCmds['≃'] = LatexCmds.simeq = bindVanillaSymbol(
  '\\simeq ',
  '&#8771;',
  'similar or equal to'
);
LatexCmds['∣'] = LatexCmds.mid = bindVanillaSymbol(
  '\\mid ',
  '&#8739;',
  'divides'
);
LatexCmds['≪'] = LatexCmds.ll = bindVanillaSymbol('\\ll ', '&#8810;', 'll');
LatexCmds['≫'] = LatexCmds.gg = bindVanillaSymbol('\\gg ', '&#8811;', 'gg');
LatexCmds.parallel = bindVanillaSymbol(
  '\\parallel ',
  '&#8741;',
  'parallel with'
);
LatexCmds.nparallel = bindVanillaSymbol(
  '\\nparallel ',
  '&#8742;',
  'not parallel with'
);
LatexCmds['⋈'] = LatexCmds.bowtie = bindVanillaSymbol(
  '\\bowtie ',
  '&#8904;',
  'bowtie'
);
LatexCmds['⊏'] = LatexCmds.sqsubset = bindVanillaSymbol(
  '\\sqsubset ',
  '&#8847;',
  'square subset'
);
LatexCmds['⊐'] = LatexCmds.sqsupset = bindVanillaSymbol(
  '\\sqsupset ',
  '&#8848;',
  'square superset'
);
LatexCmds['⌣'] = LatexCmds.smile = bindVanillaSymbol(
  '\\smile ',
  '&#8995;',
  'smile'
);
LatexCmds['⊑'] = LatexCmds.sqsubseteq = bindVanillaSymbol(
  '\\sqsubseteq ',
  '&#8849;',
  'square subset or equal to'
);
LatexCmds['⊒'] = LatexCmds.sqsupseteq = bindVanillaSymbol(
  '\\sqsupseteq ',
  '&#8850;',
  'square superset or equal to'
);
LatexCmds['≐'] = LatexCmds.doteq = bindVanillaSymbol(
  '\\doteq ',
  '&#8784;',
  'dotted equals'
);
LatexCmds['⌢'] = LatexCmds.frown = bindVanillaSymbol(
  '\\frown ',
  '&#8994;',
  'frown'
);
LatexCmds['⊦'] = LatexCmds.vdash = bindVanillaSymbol(
  '\\vdash ',
  '&#8870;',
  'v dash'
);
LatexCmds['⊣'] = LatexCmds.dashv = bindVanillaSymbol(
  '\\dashv ',
  '&#8867;',
  'dash v'
);
LatexCmds['≮'] = LatexCmds.nless = bindVanillaSymbol(
  '\\nless ',
  '&#8814;',
  'not less than'
);
LatexCmds['≯'] = LatexCmds.ngtr = bindVanillaSymbol(
  '\\ngtr ',
  '&#8815;',
  'not greater than'
);

//arrows
LatexCmds.longleftarrow = bindVanillaSymbol(
  '\\longleftarrow ',
  '&#8592;',
  'left arrow'
);
LatexCmds.longrightarrow = bindVanillaSymbol(
  '\\longrightarrow ',
  '&#8594;',
  'right arrow'
);
LatexCmds.Longleftarrow = bindVanillaSymbol(
  '\\Longleftarrow ',
  '&#8656;',
  'left arrow'
);
LatexCmds.Longrightarrow = bindVanillaSymbol(
  '\\Longrightarrow ',
  '&#8658;',
  'right arrow'
);
LatexCmds.longleftrightarrow = bindVanillaSymbol(
  '\\longleftrightarrow ',
  '&#8596;',
  'left and right arrow'
);
LatexCmds['↕'] = LatexCmds.updownarrow = bindVanillaSymbol(
  '\\updownarrow ',
  '&#8597;',
  'up and down arrow'
);
LatexCmds.Longleftrightarrow = bindVanillaSymbol(
  '\\Longleftrightarrow ',
  '&#8660;',
  'left and right arrow'
);
LatexCmds['⇕'] = LatexCmds.Updownarrow = bindVanillaSymbol(
  '\\Updownarrow ',
  '&#8661;',
  'up and down arrow'
);
LatexCmds['↦'] = LatexCmds.mapsto = bindVanillaSymbol(
  '\\mapsto ',
  '&#8614;',
  'maps to'
);
LatexCmds['↗'] = LatexCmds.nearrow = bindVanillaSymbol(
  '\\nearrow ',
  '&#8599;',
  'northeast arrow'
);
LatexCmds['↩'] = LatexCmds.hookleftarrow = bindVanillaSymbol(
  '\\hookleftarrow ',
  '&#8617;',
  'hook left arrow'
);
LatexCmds['↪'] = LatexCmds.hookrightarrow = bindVanillaSymbol(
  '\\hookrightarrow ',
  '&#8618;',
  'hook right arrow'
);
LatexCmds['↘'] = LatexCmds.searrow = bindVanillaSymbol(
  '\\searrow ',
  '&#8600;',
  'southeast arrow'
);
LatexCmds['↼'] = LatexCmds.leftharpoonup = bindVanillaSymbol(
  '\\leftharpoonup ',
  '&#8636;',
  'left harpoon up'
);
LatexCmds['⇀'] = LatexCmds.rightharpoonup = bindVanillaSymbol(
  '\\rightharpoonup ',
  '&#8640;',
  'right harpoon up'
);
LatexCmds['↙'] = LatexCmds.swarrow = bindVanillaSymbol(
  '\\swarrow ',
  '&#8601;',
  'southwest arrow'
);
LatexCmds['↽'] = LatexCmds.leftharpoondown = bindVanillaSymbol(
  '\\leftharpoondown ',
  '&#8637;',
  'left harpoon down'
);
LatexCmds['⇁'] = LatexCmds.rightharpoondown = bindVanillaSymbol(
  '\\rightharpoondown ',
  '&#8641;',
  'right harpoon down'
);
LatexCmds['↖'] = LatexCmds.nwarrow = bindVanillaSymbol(
  '\\nwarrow ',
  '&#8598;',
  'northwest arrow'
);

//Misc
// \dots has the unicode for \ldots
LatexCmds.ldots = bindVanillaSymbol('\\ldots ', '&#8230;', 'l dots');
LatexCmds['⋯'] = LatexCmds.cdots = bindVanillaSymbol(
  '\\cdots ',
  '&#8943;',
  'c dots'
);
LatexCmds['⋮'] = LatexCmds.vdots = bindVanillaSymbol(
  '\\vdots ',
  '&#8942;',
  'v dots'
);
LatexCmds['⋱'] = LatexCmds.ddots = bindVanillaSymbol(
  '\\ddots ',
  '&#8945;',
  'd dots'
);
// LatexCmds['√'] is defined in basicSymbols
LatexCmds.surd = bindVanillaSymbol('\\surd ', '&#8730;', 'unresolved root');
LatexCmds['△'] = LatexCmds.triangle = bindVanillaSymbol(
  '\\triangle ',
  '&#9651;',
  'triangle'
);
LatexCmds['ℓ'] = LatexCmds.ell = bindVanillaSymbol('\\ell ', '&#8467;', 'ell');
LatexCmds['⊤'] = LatexCmds.top = bindVanillaSymbol('\\top ', '&#8868;', 'top');
LatexCmds['♭'] = LatexCmds.flat = bindVanillaSymbol(
  '\\flat ',
  '&#9837;',
  'flat'
);
LatexCmds['♮'] = LatexCmds.natural = bindVanillaSymbol(
  '\\natural ',
  '&#9838;',
  'natural'
);
LatexCmds['♯'] = LatexCmds.sharp = bindVanillaSymbol(
  '\\sharp ',
  '&#9839;',
  'sharp'
);
LatexCmds['℘'] = LatexCmds.wp = bindVanillaSymbol('\\wp ', '&#8472;', 'wp');
LatexCmds['⊥'] = LatexCmds.bot = bindVanillaSymbol('\\bot ', '&#8869;', 'bot');
LatexCmds['♣'] = LatexCmds.clubsuit = bindVanillaSymbol(
  '\\clubsuit ',
  '&#9827;',
  'club suit'
);
LatexCmds['♢'] = LatexCmds.diamondsuit = bindVanillaSymbol(
  '\\diamondsuit ',
  '&#9826;',
  'diamond suit'
);
LatexCmds['♡'] = LatexCmds.heartsuit = bindVanillaSymbol(
  '\\heartsuit ',
  '&#9825;',
  'heart suit'
);
LatexCmds['♠'] = LatexCmds.spadesuit = bindVanillaSymbol(
  '\\spadesuit ',
  '&#9824;',
  'spade suit'
);
//not real LaTex command see https://github.com/mathquill/mathquill/pull/552 for more details
LatexCmds['▱'] = LatexCmds.parallelogram = bindVanillaSymbol(
  '\\parallelogram ',
  '&#9649;',
  'parallelogram'
);
LatexCmds['⬜'] = LatexCmds.square = bindVanillaSymbol(
  '\\square ',
  '&#11036;',
  'square'
);

//variable-sized
// These are not actually variable-sized, and bigX (bigcap...) is the same as X (cap...)
LatexCmds['∮'] = LatexCmds.oint = bindVanillaSymbol(
  '\\oint ',
  '&#8750;',
  'o int'
);
LatexCmds.bigcap = bindVanillaSymbol('\\bigcap ', '&#8745;', 'big cap');
LatexCmds.bigcup = bindVanillaSymbol('\\bigcup ', '&#8746;', 'big cup');
LatexCmds.bigsqcup = bindVanillaSymbol(
  '\\bigsqcup ',
  '&#8852;',
  'big square cup'
);
LatexCmds.bigvee = bindVanillaSymbol('\\bigvee ', '&#8744;', 'big vee');
LatexCmds.bigwedge = bindVanillaSymbol('\\bigwedge ', '&#8743;', 'big wedge');
LatexCmds.bigodot = bindVanillaSymbol('\\bigodot ', '&#8857;', 'big o dot');
LatexCmds.bigotimes = bindVanillaSymbol(
  '\\bigotimes ',
  '&#8855;',
  'big o times'
);
LatexCmds.bigoplus = bindVanillaSymbol('\\bigoplus ', '&#8853;', 'big o plus');
LatexCmds.biguplus = bindVanillaSymbol('\\biguplus ', '&#8846;', 'big u plus');

//delimiters
LatexCmds['⌊'] = LatexCmds.lfloor = bindVanillaSymbol(
  '\\lfloor ',
  '&#8970;',
  'left floor'
);
LatexCmds['⌋'] = LatexCmds.rfloor = bindVanillaSymbol(
  '\\rfloor ',
  '&#8971;',
  'right floor'
);
LatexCmds['⌈'] = LatexCmds.lceil = bindVanillaSymbol(
  '\\lceil ',
  '&#8968;',
  'left ceiling'
);
LatexCmds['⌉'] = LatexCmds.rceil = bindVanillaSymbol(
  '\\rceil ',
  '&#8969;',
  'right ceiling'
);
LatexCmds.opencurlybrace = LatexCmds.lbrace = bindVanillaSymbol(
  '\\lbrace ',
  '{',
  'left brace'
);
LatexCmds.closecurlybrace = LatexCmds.rbrace = bindVanillaSymbol(
  '\\rbrace ',
  '}',
  'right brace'
);
LatexCmds.lbrack = bindVanillaSymbol('[', '[', 'left bracket');
LatexCmds.rbrack = bindVanillaSymbol(']', ']', 'right bracket');

//various symbols
LatexCmds.slash = bindVanillaSymbol('/', '/', 'slash');
LatexCmds.vert = bindVanillaSymbol('|', '|', 'vertical bar');
LatexCmds.perp = LatexCmds.perpendicular = bindVanillaSymbol(
  '\\perp ',
  '&perp;',
  'perpendicular'
);
LatexCmds['∇'] =
  LatexCmds.nabla =
  LatexCmds.del =
    bindVanillaSymbol('\\nabla ', '&nabla;');
LatexCmds['ℏ'] = LatexCmds.hbar = bindVanillaSymbol(
  '\\hbar ',
  '&#8463;',
  'horizontal bar'
);

LatexCmds['Å'] =
  LatexCmds.AA =
  LatexCmds.Angstrom =
  LatexCmds.angstrom =
    bindVanillaSymbol('\\text\\AA ', '&#8491;', 'AA');

LatexCmds['∘'] =
  LatexCmds.ring =
  LatexCmds.circ =
  LatexCmds.circle =
    bindVanillaSymbol('\\circ ', '&#8728;', 'circle');

LatexCmds['•'] =
  LatexCmds.bull =
  LatexCmds.bullet =
    bindVanillaSymbol('\\bullet ', '&bull;', 'bullet');

LatexCmds['∖'] =
  LatexCmds.setminus =
  LatexCmds.smallsetminus =
    bindVanillaSymbol('\\setminus ', '&#8726;', 'set minus');

LatexCmds.not = //bind(MQSymbol,'\\not ','<span class="not">/</span>', 'not');
  LatexCmds['¬'] =
  LatexCmds.neg =
    bindVanillaSymbol('\\neg ', '&not;', 'not');

LatexCmds['…'] =
  LatexCmds.dots =
  LatexCmds.ellip =
  LatexCmds.hellip =
  LatexCmds.ellipsis =
  LatexCmds.hellipsis =
    bindVanillaSymbol('\\dots ', '&hellip;', 'ellipsis');

LatexCmds['↓'] =
  LatexCmds.converges =
  LatexCmds.darr =
  LatexCmds.dnarr =
  LatexCmds.dnarrow =
  LatexCmds.downarrow =
    bindVanillaSymbol('\\downarrow ', '&darr;', 'converges with');

LatexCmds['⇓'] =
  LatexCmds.dArr =
  LatexCmds.dnArr =
  LatexCmds.dnArrow =
  LatexCmds.Downarrow =
    bindVanillaSymbol('\\Downarrow ', '&dArr;', 'down arrow');

LatexCmds['↑'] =
  LatexCmds.diverges =
  LatexCmds.uarr =
  LatexCmds.uparrow =
    bindVanillaSymbol('\\uparrow ', '&uarr;', 'diverges from');

LatexCmds['⇑'] =
  LatexCmds.uArr =
  LatexCmds.Uparrow =
    bindVanillaSymbol('\\Uparrow ', '&uArr;', 'up arrow');

LatexCmds.rarr = LatexCmds.rightarrow = bindVanillaSymbol(
  '\\rightarrow ',
  '&rarr;',
  'right arrow'
);

LatexCmds.implies = bindBinaryOperator('\\Rightarrow ', '&rArr;', 'implies');

LatexCmds['⇒'] =
  LatexCmds.rArr =
  LatexCmds.Rightarrow =
    bindVanillaSymbol('\\Rightarrow ', '&rArr;', 'right arrow');

LatexCmds.gets = bindBinaryOperator('\\gets ', '&larr;', 'gets');

LatexCmds['←'] =
  LatexCmds.larr =
  LatexCmds.leftarrow =
    bindVanillaSymbol('\\leftarrow ', '&larr;', 'left arrow');

LatexCmds.impliedby = bindBinaryOperator(
  '\\Leftarrow ',
  '&lArr;',
  'implied by'
);

LatexCmds['⇐'] =
  LatexCmds.lArr =
  LatexCmds.Leftarrow =
    bindVanillaSymbol('\\Leftarrow ', '&lArr;', 'left arrow');

LatexCmds['↔'] =
  LatexCmds.harr =
  LatexCmds.lrarr =
  LatexCmds.leftrightarrow =
    bindVanillaSymbol('\\leftrightarrow ', '&harr;', 'left and right arrow');

LatexCmds.iff = bindBinaryOperator(
  '\\Leftrightarrow ',
  '&hArr;',
  'if and only if'
);

LatexCmds['⇔'];
LatexCmds.hArr =
  LatexCmds.lrArr =
  LatexCmds.Leftrightarrow =
    bindVanillaSymbol('\\Leftrightarrow ', '&hArr;', 'left and right arrow');

LatexCmds.Re =
  LatexCmds.Real =
  LatexCmds.real =
    bindVanillaSymbol('\\Re ', '&real;', 'real');

LatexCmds.Im =
  LatexCmds.imag =
  LatexCmds.image =
  LatexCmds.imagin =
  LatexCmds.imaginary =
  LatexCmds.Imaginary =
    bindVanillaSymbol('\\Im ', '&image;', 'imaginary');

LatexCmds['∂'] =
  LatexCmds.part =
  LatexCmds.partial =
    bindVanillaSymbol('\\partial ', '&part;', 'partial');

LatexCmds['£'] = LatexCmds.pounds = bindVanillaSymbol('\\pounds ', '&pound;');

LatexCmds['ℵ'] =
  LatexCmds.alef =
  LatexCmds.alefsym =
  LatexCmds.aleph =
  LatexCmds.alephsym =
    bindVanillaSymbol('\\aleph ', '&alefsym;', 'alef sym');

LatexCmds['∃'] =
  LatexCmds.xist = //LOL
  LatexCmds.xists =
  LatexCmds.exist =
  LatexCmds.exists =
    bindVanillaSymbol('\\exists ', '&exist;', 'there exists at least 1');
// forall is in basicSymbols.

LatexCmds['∄'] =
  LatexCmds.nexists =
  LatexCmds.nexist =
    bindVanillaSymbol('\\nexists ', '&#8708;', 'there is no');

LatexCmds['∧'] =
  LatexCmds.and =
  LatexCmds.land =
  LatexCmds.wedge =
    bindBinaryOperator('\\wedge ', '&and;', 'and');

LatexCmds['∨'] =
  LatexCmds.or =
  LatexCmds.lor =
  LatexCmds.vee =
    bindBinaryOperator('\\vee ', '&or;', 'or');

LatexCmds['∅'] =
  LatexCmds.o =
  LatexCmds.O =
  LatexCmds.empty =
  LatexCmds.emptyset =
  LatexCmds.oslash =
  LatexCmds.Oslash =
  LatexCmds.nothing =
  LatexCmds.varnothing =
    bindBinaryOperator('\\varnothing ', '&empty;', 'nothing');

LatexCmds['∪'] =
  LatexCmds.cup =
  LatexCmds.union =
    bindBinaryOperator('\\cup ', '&cup;', 'union');

LatexCmds['∩'] =
  LatexCmds.cap =
  LatexCmds.intersect =
  LatexCmds.intersection =
    bindBinaryOperator('\\cap ', '&cap;', 'intersection');

// FIXME: the correct LaTeX would be ^\circ but we can't parse that
LatexCmds['°'] =
  LatexCmds.deg =
  LatexCmds.degree =
    bindVanillaSymbol('\\degree ', '&deg;', 'degrees');

LatexCmds['∠'] =
  LatexCmds.ang =
  LatexCmds.angle =
    bindVanillaSymbol('\\angle ', '&ang;', 'angle');
LatexCmds['∡'] = LatexCmds.measuredangle = bindVanillaSymbol(
  '\\measuredangle ',
  '&#8737;',
  'measured angle'
);
