import { r as registerInstance, c as createEvent, h, H as Host } from './index-28e0f8fb.js';
import { a as state } from './store-799370e3.js';

const win = window;
const require = win.require;
let isInitialized;
function initializeMonacoWorker(libPath) {
  if (isInitialized)
    return win.monaco;
  const origin = document.location.origin;
  const baseUrl = libPath.startsWith('http') ? libPath : `${origin}/${libPath}`;
  require.config({ paths: { 'vs': `${baseUrl}/vs` } });
  win.MonacoEnvironment = { getWorkerUrl: () => proxy };
  let proxy = URL.createObjectURL(new Blob([`
	self.MonacoEnvironment = {
		baseUrl: '${baseUrl}'
	};
	importScripts('${baseUrl}/vs/base/worker/workerMain.js');
`], { type: 'text/javascript' }));
  return new Promise(resolve => {
    require(["vs/editor/editor.main"], () => {
      isInitialized = true;
      resolve(win.monaco);
    });
  });
}

const elsaMonacoCss = ".elsa-monaco-editor-host{display:block;min-height:6em;position:relative}.elsa-monaco-editor-container{height:100%;left:0;margin:0;max-height:100%!important;padding:0;position:absolute;top:0;width:100%}";

let ElsaMonaco = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.valueChanged = createEvent(this, "valueChanged", 7);
    this.editorHeight = '5em';
    this.singleLineMode = false;
  }
  languageChangeHandler(newValue) {
    if (!this.editor)
      return;
    const model = this.editor.getModel();
    this.monaco.editor.setModelLanguage(model, this.language);
  }
  async setValue(value) {
    if (!this.editor)
      return;
    const model = this.editor.getModel();
    model.setValue(value || '');
  }
  async addJavaScriptLib(libSource, libUri) {
    const monaco = this.monaco;
    monaco.languages.typescript.javascriptDefaults.setExtraLibs([{
        content: "<reference lib=\"es5\" />",
        filePath: "lib.d.ts"
      }, {
        content: libSource,
        filePath: libUri
      }]);
    const oldModel = monaco.editor.getModel(libUri);
    if (oldModel)
      oldModel.dispose();
    monaco.editor.createModel(libSource, 'typescript', monaco.Uri.parse(libUri));
  }
  async componentWillLoad() {
    var _a;
    const monacoLibPath = (_a = this.monacoLibPath) !== null && _a !== void 0 ? _a : state.monacoLibPath;
    this.monaco = await initializeMonacoWorker(monacoLibPath);
    this.registerLiquid();
  }
  componentDidLoad() {
    const monaco = this.monaco;
    const language = this.language;
    // Validation settings.
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });
    // Compiler options.
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      lib: [],
      allowNonTsExtensions: true
    });
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    const defaultOptions = {
      value: this.value,
      language: language,
      fontFamily: "Roboto Mono, monospace",
      renderLineHighlight: 'none',
      minimap: {
        enabled: false
      },
      automaticLayout: true,
      lineNumbers: "on",
      theme: "vs",
      roundedSelection: true,
      scrollBeyondLastLine: false,
      readOnly: false,
      overviewRulerLanes: 0,
      overviewRulerBorder: false,
      lineDecorationsWidth: 0,
      hideCursorInOverviewRuler: true,
      glyphMargin: false
    };
    let options = defaultOptions;
    if (this.singleLineMode) {
      options = Object.assign(Object.assign({}, defaultOptions), {
        wordWrap: 'off',
        lineNumbers: 'off',
        lineNumbersMinChars: 0,
        folding: false,
        scrollBeyondLastColumn: 0,
        scrollbar: { horizontal: 'hidden', vertical: 'hidden' },
        find: { addExtraSpaceOnTop: false, autoFindInSelection: 'never', seedSearchStringFromSelection: false },
      });
    }
    this.editor = monaco.editor.create(this.container, options);
    this.editor.onDidChangeModelContent(e => {
      const value = this.editor.getValue();
      const markers = monaco.editor.getModelMarkers({ owner: language });
      this.valueChanged.emit({ value: value, markers: markers });
    });
    if (this.singleLineMode) {
      this.editor.onKeyDown(e => {
        if (e.keyCode == monaco.KeyCode.Enter) {
          // We only prevent enter when the suggest model is not active
          if (this.editor.getContribution('editor.contrib.suggestController').model.state == 0) {
            e.preventDefault();
          }
        }
      });
      this.editor.onDidPaste(e => {
        if (e.range.endLineNumber > 1) {
          let newContent = "";
          const model = this.editor.getModel();
          let lineCount = model.getLineCount();
          for (let i = 0; i < lineCount; i++) {
            newContent += model.getLineContent(i + 1);
          }
          model.setValue(newContent);
        }
      });
    }
  }
  disconnectedCallback() {
    const editor = this.editor;
    if (!!editor)
      editor.dispose();
  }
  registerLiquid() {
    const monaco = window.monaco;
    monaco.languages.register({ id: 'liquid' });
    monaco.languages.registerCompletionItemProvider('liquid', {
      provideCompletionItems: () => {
        const autocompleteProviderItems = [];
        const keywords = ['assign', 'capture', 'endcapture', 'increment', 'decrement',
          'if', 'else', 'elsif', 'endif', 'for', 'endfor', 'break',
          'continue', 'limit', 'offset', 'range', 'reversed', 'cols',
          'case', 'endcase', 'when', 'block', 'endblock', 'true', 'false',
          'in', 'unless', 'endunless', 'cycle', 'tablerow', 'endtablerow',
          'contains', 'startswith', 'endswith', 'comment', 'endcomment',
          'raw', 'endraw', 'editable', 'endentitylist', 'endentityview', 'endinclude',
          'endmarker', 'entitylist', 'entityview', 'forloop', 'image', 'include',
          'marker', 'outputcache', 'plugin', 'style', 'text', 'widget',
          'abs', 'append', 'at_least', 'at_most', 'capitalize', 'ceil', 'compact',
          'concat', 'date', 'default', 'divided_by', 'downcase', 'escape',
          'escape_once', 'first', 'floor', 'join', 'last', 'lstrip', 'map',
          'minus', 'modulo', 'newline_to_br', 'plus', 'prepend', 'remove',
          'remove_first', 'replace', 'replace_first', 'reverse', 'round',
          'rstrip', 'size', 'slice', 'sort', 'sort_natural', 'split', 'strip',
          'strip_html', 'strip_newlines', 'times', 'truncate', 'truncatewords',
          'uniq', 'upcase', 'url_decode', 'url_encode'];
        for (let i = 0; i < keywords.length; i++) {
          autocompleteProviderItems.push({ 'label': keywords[i], kind: monaco.languages.CompletionItemKind.Keyword });
        }
        return { suggestions: autocompleteProviderItems };
      }
    });
  }
  render() {
    const padding = this.padding || 'elsa-pt-1.5 elsa-pl-1';
    return (h(Host, { class: "elsa-monaco-editor-host elsa-border focus:elsa-ring-blue-500 focus:elsa-border-blue-500 elsa-block elsa-w-full elsa-min-w-0 elsa-rounded-md sm:elsa-text-sm elsa-border-gray-300 elsa-p-4", style: { 'min-height': this.editorHeight } }, h("div", { ref: el => this.container = el, class: `elsa-monaco-editor-container ${padding}` })));
  }
  static get watchers() { return {
    "language": ["languageChangeHandler"]
  }; }
};
ElsaMonaco.style = elsaMonacoCss;

export { ElsaMonaco as elsa_monaco };
