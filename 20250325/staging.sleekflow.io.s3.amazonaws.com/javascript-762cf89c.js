'use strict';

const typescript = require('./typescript-bc54a1c9.js');
require('./elsa-activity-editor-modal.elsa-activity-picker-modal.elsa-control.elsa-designer-panel.elsa-version-history-panel.elsa-workflow-properties-panel.elsa-workflow-publish-button.elsa-workflow-settings-modal.elsa-workflow-test-panel-987f4d78.js');
require('./index-915b0bc2.js');
require('./event-bus-8066af27.js');
require('./domain-b01b4a53.js');
require('./axios-middleware.esm-f337c7ad.js');
require('./collection-724169f5.js');
require('./_commonjsHelpers-a5111d61.js');
require('./utils-5d19a660.js');
require('./index-1eae61b2.js');
require('./cronstrue-62722667.js');
require('./property-display-manager-84377064.js');
require('./store-a45cc47b.js');
require('./forms-64b39def.js');
require('./i18n-loader-00eaf44a.js');
require('./activity-icon-3f55f492.js');
require('./features-data-manager-45d2a0c1.js');
require('./models-7ab2800f.js');
require('./dashboard-04b50b47.js');
require('./state-tunnel-786a62ce.js');
require('./elsa-client-e99f1b35.js');
require('./index-a2f6d9eb.js');
require('./moment-62ee6873.js');
require('./index-169661bf.js');
require('./workflow-editor-a145e6dc.js');

/*!-----------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Version: 0.33.0(4b1abad427e58dbedc1215d99a0902ffc885fcd4)
 * Released under the MIT license
 * https://github.com/microsoft/monaco-editor/blob/main/LICENSE.txt
 *-----------------------------------------------------------------------------*/
var conf = typescript.conf;
var language = {
  defaultToken: "invalid",
  tokenPostfix: ".js",
  keywords: [
    "break",
    "case",
    "catch",
    "class",
    "continue",
    "const",
    "constructor",
    "debugger",
    "default",
    "delete",
    "do",
    "else",
    "export",
    "extends",
    "false",
    "finally",
    "for",
    "from",
    "function",
    "get",
    "if",
    "import",
    "in",
    "instanceof",
    "let",
    "new",
    "null",
    "return",
    "set",
    "super",
    "switch",
    "symbol",
    "this",
    "throw",
    "true",
    "try",
    "typeof",
    "undefined",
    "var",
    "void",
    "while",
    "with",
    "yield",
    "async",
    "await",
    "of"
  ],
  typeKeywords: [],
  operators: typescript.language.operators,
  symbols: typescript.language.symbols,
  escapes: typescript.language.escapes,
  digits: typescript.language.digits,
  octaldigits: typescript.language.octaldigits,
  binarydigits: typescript.language.binarydigits,
  hexdigits: typescript.language.hexdigits,
  regexpctl: typescript.language.regexpctl,
  regexpesc: typescript.language.regexpesc,
  tokenizer: typescript.language.tokenizer
};

exports.conf = conf;
exports.language = language;
