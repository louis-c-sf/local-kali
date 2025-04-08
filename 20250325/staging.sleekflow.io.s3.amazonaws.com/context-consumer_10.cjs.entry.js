'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-915b0bc2.js');
const i18nLoader = require('./i18n-loader-00eaf44a.js');
const index$1 = require('./index-169661bf.js');
const eventBus = require('./event-bus-8066af27.js');
require('./domain-b01b4a53.js');
const axiosMiddleware_esm = require('./axios-middleware.esm-f337c7ad.js');
require('./collection-724169f5.js');
const utils = require('./utils-5d19a660.js');
require('./index-1eae61b2.js');
require('./cronstrue-62722667.js');
const intlMessage = require('./intl-message-8802ac57.js');
const dashboard = require('./dashboard-04b50b47.js');
const activityIconProvider = require('./activity-icon-provider-d8c65e4d.js');
const confirmDialogService = require('./confirm-dialog-service-454fc4c2.js');
const toastNotificationService = require('./toast-notification-service-2c53ecab.js');
const elsaClient = require('./elsa-client-e99f1b35.js');
const featuresDataManager = require('./features-data-manager-45d2a0c1.js');
const pluginManager = require('./plugin-manager-e1bee0ed.js');
const propertyDisplayManager = require('./property-display-manager-84377064.js');
const activeRouter = require('./active-router-381b3b9a.js');
require('./_commonjsHelpers-a5111d61.js');
require('./index-635081da.js');
require('./state-tunnel-786a62ce.js');
require('./index-a2f6d9eb.js');

/**
 * TS adaption of https://github.com/pillarjs/path-to-regexp/blob/master/index.js
 */
/**
 * Default configs.
 */
const DEFAULT_DELIMITER = '/';
const DEFAULT_DELIMITERS = './';
/**
 * The main path matching regexp utility.
 */
const PATH_REGEXP = new RegExp([
    // Match escaped characters that would otherwise appear in future matches.
    // This allows the user to escape special characters that won't transform.
    '(\\\\.)',
    // Match Express-style parameters and un-named parameters with a prefix
    // and optional suffixes. Matches appear as:
    //
    // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?"]
    // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined]
    '(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?'
].join('|'), 'g');
/**
 * Parse a string for the raw tokens.
 */
const parse = (str, options) => {
    var tokens = [];
    var key = 0;
    var index = 0;
    var path = '';
    var defaultDelimiter = (options && options.delimiter) || DEFAULT_DELIMITER;
    var delimiters = (options && options.delimiters) || DEFAULT_DELIMITERS;
    var pathEscaped = false;
    var res;
    while ((res = PATH_REGEXP.exec(str)) !== null) {
        var m = res[0];
        var escaped = res[1];
        var offset = res.index;
        path += str.slice(index, offset);
        index = offset + m.length;
        // Ignore already escaped sequences.
        if (escaped) {
            path += escaped[1];
            pathEscaped = true;
            continue;
        }
        var prev = '';
        var next = str[index];
        var name = res[2];
        var capture = res[3];
        var group = res[4];
        var modifier = res[5];
        if (!pathEscaped && path.length) {
            var k = path.length - 1;
            if (delimiters.indexOf(path[k]) > -1) {
                prev = path[k];
                path = path.slice(0, k);
            }
        }
        // Push the current path onto the tokens.
        if (path) {
            tokens.push(path);
            path = '';
            pathEscaped = false;
        }
        var partial = prev !== '' && next !== undefined && next !== prev;
        var repeat = modifier === '+' || modifier === '*';
        var optional = modifier === '?' || modifier === '*';
        var delimiter = prev || defaultDelimiter;
        var pattern = capture || group;
        tokens.push({
            name: name || key++,
            prefix: prev,
            delimiter: delimiter,
            optional: optional,
            repeat: repeat,
            partial: partial,
            pattern: pattern ? escapeGroup(pattern) : '[^' + escapeString(delimiter) + ']+?'
        });
    }
    // Push any remaining characters.
    if (path || index < str.length) {
        tokens.push(path + str.substr(index));
    }
    return tokens;
};
/**
 * Escape a regular expression string.
 */
const escapeString = (str) => {
    return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
};
/**
 * Escape the capturing group by escaping special characters and meaning.
 */
const escapeGroup = (group) => {
    return group.replace(/([=!:$/()])/g, '\\$1');
};
/**
 * Get the flags for a regexp from the options.
 */
const flags = (options) => {
    return options && options.sensitive ? '' : 'i';
};
/**
 * Pull out keys from a regexp.
 */
const regexpToRegexp = (path, keys) => {
    if (!keys)
        return path;
    // Use a negative lookahead to match only capturing groups.
    var groups = path.source.match(/\((?!\?)/g);
    if (groups) {
        for (var i = 0; i < groups.length; i++) {
            keys.push({
                name: i,
                prefix: null,
                delimiter: null,
                optional: false,
                repeat: false,
                partial: false,
                pattern: null
            });
        }
    }
    return path;
};
/**
 * Transform an array into a regexp.
 */
const arrayToRegexp = (path, keys, options) => {
    var parts = [];
    for (var i = 0; i < path.length; i++) {
        parts.push(pathToRegexp(path[i], keys, options).source);
    }
    return new RegExp('(?:' + parts.join('|') + ')', flags(options));
};
/**
 * Create a path regexp from string input.
 */
const stringToRegexp = (path, keys, options) => {
    return tokensToRegExp(parse(path, options), keys, options);
};
/**
 * Expose a function for taking tokens and returning a RegExp.
 */
const tokensToRegExp = (tokens, keys, options) => {
    options = options || {};
    var strict = options.strict;
    var end = options.end !== false;
    var delimiter = escapeString(options.delimiter || DEFAULT_DELIMITER);
    var delimiters = options.delimiters || DEFAULT_DELIMITERS;
    var endsWith = [].concat(options.endsWith || []).map(escapeString).concat('$').join('|');
    var route = '';
    var isEndDelimited = false;
    // Iterate over the tokens and create our regexp string.
    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        if (typeof token === 'string') {
            route += escapeString(token);
            isEndDelimited = i === tokens.length - 1 && delimiters.indexOf(token[token.length - 1]) > -1;
        }
        else {
            var prefix = escapeString(token.prefix || '');
            var capture = token.repeat
                ? '(?:' + token.pattern + ')(?:' + prefix + '(?:' + token.pattern + '))*'
                : token.pattern;
            if (keys)
                keys.push(token);
            if (token.optional) {
                if (token.partial) {
                    route += prefix + '(' + capture + ')?';
                }
                else {
                    route += '(?:' + prefix + '(' + capture + '))?';
                }
            }
            else {
                route += prefix + '(' + capture + ')';
            }
        }
    }
    if (end) {
        if (!strict)
            route += '(?:' + delimiter + ')?';
        route += endsWith === '$' ? '$' : '(?=' + endsWith + ')';
    }
    else {
        if (!strict)
            route += '(?:' + delimiter + '(?=' + endsWith + '))?';
        if (!isEndDelimited)
            route += '(?=' + delimiter + '|' + endsWith + ')';
    }
    return new RegExp('^' + route, flags(options));
};
/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 */
const pathToRegexp = (path, keys, options) => {
    if (path instanceof RegExp) {
        return regexpToRegexp(path, keys);
    }
    if (Array.isArray(path)) {
        return arrayToRegexp(path, keys, options);
    }
    return stringToRegexp(path, keys, options);
};

const hasBasename = (path, prefix) => {
    return (new RegExp('^' + prefix + '(\\/|\\?|#|$)', 'i')).test(path);
};
const stripBasename = (path, prefix) => {
    return hasBasename(path, prefix) ? path.substr(prefix.length) : path;
};
const stripTrailingSlash = (path) => {
    return path.charAt(path.length - 1) === '/' ? path.slice(0, -1) : path;
};
const addLeadingSlash = (path) => {
    return path.charAt(0) === '/' ? path : '/' + path;
};
const stripLeadingSlash = (path) => {
    return path.charAt(0) === '/' ? path.substr(1) : path;
};
const parsePath = (path) => {
    let pathname = path || '/';
    let search = '';
    let hash = '';
    const hashIndex = pathname.indexOf('#');
    if (hashIndex !== -1) {
        hash = pathname.substr(hashIndex);
        pathname = pathname.substr(0, hashIndex);
    }
    const searchIndex = pathname.indexOf('?');
    if (searchIndex !== -1) {
        search = pathname.substr(searchIndex);
        pathname = pathname.substr(0, searchIndex);
    }
    return {
        pathname,
        search: search === '?' ? '' : search,
        hash: hash === '#' ? '' : hash,
        query: {},
        key: ''
    };
};
const createPath = (location) => {
    const { pathname, search, hash } = location;
    let path = pathname || '/';
    if (search && search !== '?') {
        path += (search.charAt(0) === '?' ? search : `?${search}`);
    }
    if (hash && hash !== '#') {
        path += (hash.charAt(0) === '#' ? hash : `#${hash}`);
    }
    return path;
};
const parseQueryString = (query) => {
    if (!query) {
        return {};
    }
    return (/^[?#]/.test(query) ? query.slice(1) : query)
        .split('&')
        .reduce((params, param) => {
        let [key, value] = param.split('=');
        params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
        return params;
    }, {});
};

const isAbsolute = (pathname) => {
    return pathname.charAt(0) === '/';
};
const createKey = (keyLength) => {
    return Math.random().toString(36).substr(2, keyLength);
};
// About 1.5x faster than the two-arg version of Array#splice()
const spliceOne = (list, index) => {
    for (let i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) {
        list[i] = list[k];
    }
    list.pop();
};
// This implementation is based heavily on node's url.parse
const resolvePathname = (to, from = '') => {
    let fromParts = from && from.split('/') || [];
    let hasTrailingSlash;
    let up = 0;
    const toParts = to && to.split('/') || [];
    const isToAbs = to && isAbsolute(to);
    const isFromAbs = from && isAbsolute(from);
    const mustEndAbs = isToAbs || isFromAbs;
    if (to && isAbsolute(to)) {
        // to is absolute
        fromParts = toParts;
    }
    else if (toParts.length) {
        // to is relative, drop the filename
        fromParts.pop();
        fromParts = fromParts.concat(toParts);
    }
    if (!fromParts.length) {
        return '/';
    }
    if (fromParts.length) {
        const last = fromParts[fromParts.length - 1];
        hasTrailingSlash = (last === '.' || last === '..' || last === '');
    }
    else {
        hasTrailingSlash = false;
    }
    for (let i = fromParts.length; i >= 0; i--) {
        const part = fromParts[i];
        if (part === '.') {
            spliceOne(fromParts, i);
        }
        else if (part === '..') {
            spliceOne(fromParts, i);
            up++;
        }
        else if (up) {
            spliceOne(fromParts, i);
            up--;
        }
    }
    if (!mustEndAbs) {
        for (; up--; up) {
            fromParts.unshift('..');
        }
    }
    if (mustEndAbs && fromParts[0] !== '' && (!fromParts[0] || !isAbsolute(fromParts[0]))) {
        fromParts.unshift('');
    }
    let result = fromParts.join('/');
    if (hasTrailingSlash && result.substr(-1) !== '/') {
        result += '/';
    }
    return result;
};
const valueEqual = (a, b) => {
    if (a === b) {
        return true;
    }
    if (a == null || b == null) {
        return false;
    }
    if (Array.isArray(a)) {
        return Array.isArray(b) && a.length === b.length && a.every((item, index) => {
            return valueEqual(item, b[index]);
        });
    }
    const aType = typeof a;
    const bType = typeof b;
    if (aType !== bType) {
        return false;
    }
    if (aType === 'object') {
        const aValue = a.valueOf();
        const bValue = b.valueOf();
        if (aValue !== a || bValue !== b) {
            return valueEqual(aValue, bValue);
        }
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        if (aKeys.length !== bKeys.length) {
            return false;
        }
        return aKeys.every((key) => {
            return valueEqual(a[key], b[key]);
        });
    }
    return false;
};
const locationsAreEqual = (a, b) => {
    return a.pathname === b.pathname &&
        a.search === b.search &&
        a.hash === b.hash &&
        a.key === b.key &&
        valueEqual(a.state, b.state);
};
const createLocation = (path, state, key, currentLocation) => {
    let location;
    if (typeof path === 'string') {
        // Two-arg form: push(path, state)
        location = parsePath(path);
        if (state !== undefined) {
            location.state = state;
        }
    }
    else {
        // One-arg form: push(location)
        location = Object.assign({ pathname: '' }, path);
        if (location.search && location.search.charAt(0) !== '?') {
            location.search = '?' + location.search;
        }
        if (location.hash && location.hash.charAt(0) !== '#') {
            location.hash = '#' + location.hash;
        }
        if (state !== undefined && location.state === undefined) {
            location.state = state;
        }
    }
    try {
        location.pathname = decodeURI(location.pathname);
    }
    catch (e) {
        if (e instanceof URIError) {
            throw new URIError('Pathname "' + location.pathname + '" could not be decoded. ' +
                'This is likely caused by an invalid percent-encoding.');
        }
        else {
            throw e;
        }
    }
    location.key = key;
    if (currentLocation) {
        // Resolve incomplete/relative pathname relative to current location.
        if (!location.pathname) {
            location.pathname = currentLocation.pathname;
        }
        else if (location.pathname.charAt(0) !== '/') {
            location.pathname = resolvePathname(location.pathname, currentLocation.pathname);
        }
    }
    else {
        // When there is no prior location and pathname is empty, set it to /
        if (!location.pathname) {
            location.pathname = '/';
        }
    }
    location.query = parseQueryString(location.search || '');
    return location;
};

let cacheCount = 0;
const patternCache = {};
const cacheLimit = 10000;
// Memoized function for creating the path match regex
const compilePath = (pattern, options) => {
    const cacheKey = `${options.end}${options.strict}`;
    const cache = patternCache[cacheKey] || (patternCache[cacheKey] = {});
    const cachePattern = JSON.stringify(pattern);
    if (cache[cachePattern]) {
        return cache[cachePattern];
    }
    const keys = [];
    const re = pathToRegexp(pattern, keys, options);
    const compiledPattern = { re, keys };
    if (cacheCount < cacheLimit) {
        cache[cachePattern] = compiledPattern;
        cacheCount += 1;
    }
    return compiledPattern;
};
/**
 * Public API for matching a URL pathname to a path pattern.
 */
const matchPath = (pathname, options = {}) => {
    if (typeof options === 'string') {
        options = { path: options };
    }
    const { path = '/', exact = false, strict = false } = options;
    const { re, keys } = compilePath(path, { end: exact, strict });
    const match = re.exec(pathname);
    if (!match) {
        return null;
    }
    const [url, ...values] = match;
    const isExact = pathname === url;
    if (exact && !isExact) {
        return null;
    }
    return {
        path,
        url: path === '/' && url === '' ? '/' : url,
        isExact,
        params: keys.reduce((memo, key, index) => {
            memo[key.name] = values[index];
            return memo;
        }, {})
    };
};
const matchesAreEqual = (a, b) => {
    if (a == null && b == null) {
        return true;
    }
    if (b == null) {
        return false;
    }
    return a && b &&
        a.path === b.path &&
        a.url === b.url &&
        valueEqual(a.params, b.params);
};

let ContextConsumer = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
    this.context = {};
    this.renderer = () => null;
  }
  connectedCallback() {
    if (this.subscribe != null) {
      this.unsubscribe = this.subscribe(this.el, 'context');
    }
  }
  disconnectedCallback() {
    if (this.unsubscribe != null) {
      this.unsubscribe();
    }
  }
  render() {
    return this.renderer(Object.assign({}, this.context));
  }
  get el() { return index.getElement(this); }
};

const resources$1 = {
  'en': {
    'default': {
      'Yes': 'Yes',
      'No': 'No'
    }
  },
  'zh-CN': {
    'default': {
      'Yes': '是',
      'No': '否'
    }
  },
  'nl-NL': {
    'default': {
      'Yes': 'Ja',
      'No': 'Nee',
    }
  }
};

let ElsaConfirmDialog = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
  }
  async show(caption, message) {
    this.caption = caption;
    this.message = message;
    await this.dialog.show(true);
    return new Promise((fulfill, reject) => {
      this.fulfill = fulfill;
      this.reject = reject;
    });
  }
  async hide() {
    await this.dialog.hide(true);
  }
  async componentWillLoad() {
    this.i18next = await i18nLoader.loadTranslations(this.culture, resources$1);
  }
  async onDismissClick() {
    this.fulfill(false);
    await this.hide();
  }
  async onAcceptClick() {
    this.fulfill(true);
    this.fulfill = null;
    this.reject = null;
    await this.hide();
  }
  render() {
    const t = x => this.i18next.t(x);
    return (index.h(index.Host, null, index.h("elsa-modal-dialog", { ref: el => this.dialog = el }, index.h("div", { slot: "content", class: "elsa-py-8 elsa-px-4" }, index.h("div", { class: "hidden sm:elsa-block elsa-absolute elsa-top-0 elsa-right-0 elsa-pt-4 elsa-pr-4" }, index.h("button", { type: "button", onClick: () => this.onDismissClick(), class: "elsa-bg-white elsa-rounded-md elsa-text-gray-400 hover:elsa-text-gray-500 focus:elsa-outline-none focus:elsa-ring-2 focus:elsa-ring-offset-2 focus:elsa-ring-blue-500" }, index.h("span", { class: "elsa-sr-only" }, "Close"), index.h("svg", { class: "elsa-h-6 elsa-w-6", "x-description": "Heroicon name: outline/x", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "aria-hidden": "true" }, index.h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", d: "M6 18L18 6M6 6l12 12" })))), index.h("div", { class: "sm:elsa-flex sm:elsa-items-start" }, index.h("div", { class: "elsa-mx-auto elsa-flex-shrink-0 elsa-flex elsa-items-center elsa-justify-center elsa-h-12 elsa-w-12 elsa-rounded-full elsa-bg-red-100 sm:elsa-mx-0 sm:elsa-h-10 sm:elsa-w-10" }, index.h("svg", { class: "elsa-h-6 elsa-w-6 elsa-text-red-600", "x-description": "Heroicon name: outline/exclamation", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "aria-hidden": "true" }, index.h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }))), index.h("div", { class: "elsa-mt-3 elsa-text-center sm:elsa-mt-0 sm:elsa-ml-4 sm:elsa-text-left" }, index.h("h3", { class: "elsa-text-lg elsa-leading-6 elsa-font-medium elsa-text-gray-900", id: "modal-title" }, this.caption), index.h("div", { class: "elsa-mt-2" }, index.h("p", { class: "elsa-text-sm elsa-text-gray-500" }, this.message))))), index.h("div", { slot: "buttons" }, index.h("div", { class: "elsa-bg-gray-50 elsa-px-4 elsa-py-3 sm:elsa-px-6 sm:elsa-flex sm:elsa-flex-row-reverse" }, index.h("button", { type: "button", onClick: () => this.onAcceptClick(), class: "elsa-w-full elsa-inline-flex elsa-justify-center elsa-rounded-md elsa-border elsa-border-transparent elsa-shadow-sm elsa-px-4 elsa-py-2 elsa-bg-red-600 elsa-text-base elsa-font-medium elsa-text-white hover:elsa-bg-red-700 focus:elsa-outline-none focus:elsa-ring-2 focus:elsa-ring-offset-2 focus:elsa-ring-red-500 sm:elsa-ml-3 sm:elsa-w-auto sm:elsa-text-sm" }, t('Yes')), index.h("button", { type: "button", onClick: () => this.onDismissClick(), class: "elsa-mt-3 elsa-w-full elsa-inline-flex elsa-justify-center elsa-rounded-md elsa-border elsa-border-gray-300 elsa-shadow-sm elsa-px-4 elsa-py-2 elsa-bg-white elsa-text-base elsa-font-medium elsa-text-gray-700 hover:elsa-text-gray-500 focus:elsa-outline-none focus:elsa-ring-2 focus:elsa-ring-offset-2 focus:ring-indigo-500 sm:elsa-mt-0 sm:elsa-w-auto sm:elsa-text-sm" }, t('No')))))));
  }
};

let ElsaModalDialog = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
    this.shown = index.createEvent(this, "shown", 7);
    this.hidden = index.createEvent(this, "hidden", 7);
    this.handleDefaultClose = async () => {
      await this.hide();
    };
  }
  render() {
    return this.renderModal();
  }
  async show(animate = true) {
    this.showInternal(animate);
  }
  async hide(animate = true) {
    await eventBus.eventBus.emit(axiosMiddleware_esm.EventTypes.HideModalDialog);
    this.hideInternal(animate);
  }
  showInternal(animate) {
    this.isVisible = true;
    if (!animate) {
      this.overlay.style.opacity = "1";
      this.modal.style.opacity = "1";
    }
    index$1.enter(this.overlay);
    index$1.enter(this.modal).then(this.shown.emit);
  }
  hideInternal(animate) {
    if (!animate) {
      this.isVisible = false;
    }
    index$1.leave(this.overlay);
    index$1.leave(this.modal).then(() => {
      this.isVisible = false;
      this.hidden.emit();
    });
  }
  async handleKeyDown(e) {
    if (this.isVisible && e.key === 'Escape') {
      await this.hide(true);
    }
  }
  renderModal() {
    return (index.h(index.Host, { class: { 'hidden': !this.isVisible, 'elsa-block': true } }, index.h("div", { class: "elsa-fixed elsa-z-10 elsa-inset-0 elsa-overflow-y-auto" }, index.h("div", { class: "elsa-flex elsa-items-end elsa-justify-center elsa-min-h-screen elsa-pt-4 elsa-px-4 elsa-pb-20 elsa-text-center sm:elsa-block sm:elsa-p-0" }, index.h("div", { ref: el => this.overlay = el, onClick: () => this.hide(true), "data-transition-enter": "elsa-ease-out elsa-duration-300", "data-transition-enter-start": "elsa-opacity-0", "data-transition-enter-end": "elsa-opacity-0", "data-transition-leave": "elsa-ease-in elsa-duration-200", "data-transition-leave-start": "elsa-opacity-0", "data-transition-leave-end": "elsa-opacity-0", class: "hidden elsa-fixed elsa-inset-0 elsa-transition-opacity", "aria-hidden": "true" }, index.h("div", { class: "elsa-absolute elsa-inset-0 elsa-bg-gray-500 elsa-opacity-75" })), index.h("span", { class: "hidden sm:elsa-inline-block sm:elsa-align-middle sm:elsa-h-screen", "aria-hidden": "true" }), index.h("div", { ref: el => this.modal = el, "data-transition-enter": "elsa-ease-out elsa-duration-300", "data-transition-enter-start": "elsa-opacity-0 elsa-translate-y-4 sm:elsa-translate-y-0 sm:elsa-scale-95", "data-transition-enter-end": "elsa-opacity-0 elsa-translate-y-0 sm:elsa-scale-100", "data-transition-leave": "elsa-ease-in elsa-duration-200", "data-transition-leave-start": "elsa-opacity-0 elsa-translate-y-0 sm:elsa-scale-100", "data-transition-leave-end": "elsa-opacity-0 elsa-translate-y-4 sm:elsa-translate-y-0 sm:elsa-scale-95", class: "hidden elsa-inline-block sm:elsa-align-top elsa-bg-white elsa-rounded-lg elsa-text-left elsa-overflow-visible elsa-shadow-xl elsa-transform elsa-transition-all sm:elsa-my-8 sm:elsa-align-top sm:elsa-max-w-4xl sm:elsa-w-full", role: "dialog", "aria-modal": "true", "aria-labelledby": "modal-headline" }, index.h("div", { class: "modal-content" }, index.h("slot", { name: "content" })), index.h("slot", { name: "buttons" }, index.h("div", { class: "elsa-bg-gray-50 elsa-px-4 elsa-py-3 sm:elsa-px-6 sm:elsa-flex sm:elsa-flex-row-reverse" }, index.h("button", { type: "button", onClick: this.handleDefaultClose, class: "elsa-mt-3 elsa-w-full elsa-inline-flex elsa-justify-center elsa-rounded-md elsa-border elsa-border-gray-300 elsa-shadow-sm elsa-px-4 elsa-py-2 elsa-bg-white elsa-text-base elsa-font-medium elsa-text-gray-700 hover:elsa-bg-gray-50 focus:elsa-outline-none focus:elsa-ring-2 focus:elsa-ring-offset-2 focus:elsa-ring-blue-500 sm:elsa-mt-0 sm:elsa-ml-3 sm:elsa-w-auto sm:elsa-text-sm" }, "Close"))))))));
  }
};

const resources = {
  'en': {
    default: {
      'WorkflowDefinitions': 'Workflow Definitions',
      'WorkflowInstances': 'Workflow Instances',
      'WorkflowRegistry': 'Workflow Registry',
      'WebhookDefinitions': 'Webhook Definitions',
    }
  },
  'zh-CN': {
    default: {
      'WorkflowDefinitions': '工作流定义',
      'WorkflowInstances': '工作流实例',
      'WorkflowRegistry': '工作流程注册表',
      'WebhookDefinitions': 'Webhook定义',
    }
  },
  'nl-NL': {
    default: {
      'WorkflowDefinitions': 'Workflow Definities',
      'WorkflowInstances': 'Workflows',
      'WorkflowRegistry': 'Workflow Register',
      'WebhookDefinitions': 'Webhook Definities',
    }
  }
};

let ElsaStudioDashboard = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
    this.basePath = '';
    this.dashboardMenu = {
      data: {
        menuItems: [
          ['workflow-definitions', 'Workflow Definitions'],
          ['workflow-instances', 'Workflow Instances'],
          ['workflow-registry', 'Workflow Registry'],
        ],
        routes: [
          ['', 'elsa-studio-home', true],
          ['workflow-registry', 'elsa-studio-workflow-registry', true],
          ['workflow-registry/:id', 'elsa-studio-workflow-blueprint-view'],
          ['workflow-definitions', 'elsa-studio-workflow-definitions-list', true],
          ['workflow-definitions/:id', 'elsa-studio-workflow-definitions-edit'],
          ['workflow-instances', 'elsa-studio-workflow-instances-list', true],
          ['workflow-instances/:id', 'elsa-studio-workflow-instances-view'],
        ]
      }
    };
  }
  async componentWillLoad() {
    this.i18next = await i18nLoader.loadTranslations(this.culture, resources);
    await eventBus.eventBus.emit(axiosMiddleware_esm.EventTypes.Dashboard.Appearing, this, this.dashboardMenu);
  }
  render() {
    const logoPath = index.getAssetPath('./assets/logo.png');
    const basePath = this.basePath || '';
    const IntlMessage = intlMessage.GetIntlMessage(this.i18next);
    let menuItems = this.dashboardMenu.data != null ? this.dashboardMenu.data.menuItems : [];
    let routes = this.dashboardMenu.data != null ? this.dashboardMenu.data.routes : [];
    const renderFeatureMenuItem = (item, basePath) => {
      return (index.h("stencil-route-link", { url: `${basePath}/${item[0]}`, anchorClass: "elsa-text-gray-300 hover:elsa-bg-gray-700 hover:elsa-text-white elsa-px-3 elsa-py-2 elsa-rounded-md elsa-text-sm elsa-font-medium", activeClass: "elsa-text-white elsa-bg-gray-900" }, index.h(IntlMessage, { label: `${item[1]}` })));
    };
    const renderFeatureRoute = (item, basePath) => {
      return (index.h("stencil-route", { url: `${basePath}/${item[0]}`, component: `${item[1]}`, exact: item[2] }));
    };
    return (index.h("div", { class: "elsa-h-screen elsa-bg-gray-100" }, index.h("nav", { class: "elsa-bg-gray-800" }, index.h("div", { class: "elsa-px-4 sm:elsa-px-6 lg:elsa-px-8" }, index.h("div", { class: "elsa-flex elsa-items-center elsa-justify-between elsa-h-16" }, index.h("div", { class: "elsa-flex elsa-items-center" }, index.h("div", { class: "elsa-flex-shrink-0" }, index.h("stencil-route-link", { url: `${basePath}/` }, index.h("img", { class: "elsa-h-8 elsa-w-8", src: logoPath, alt: "Workflow" }))), index.h("div", { class: "hidden md:elsa-block" }, index.h("div", { class: "elsa-ml-10 elsa-flex elsa-items-baseline elsa-space-x-4" }, menuItems.map(item => renderFeatureMenuItem(item, basePath)))))))), index.h("main", null, index.h("stencil-router", null, index.h("stencil-route-switch", { scrollTopOffset: 0 }, routes.map(item => renderFeatureRoute(item, basePath)))))));
  }
  static get assetsDirs() { return ["assets"]; }
};
dashboard.Tunnel.injectProps(ElsaStudioDashboard, ['culture', 'basePath']);

let ElsaStudioRoot = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
    this.initializing = index.createEvent(this, "initializing", 7);
    this.initialized = index.createEvent(this, "initialized", 7);
    this.basePath = '';
    this.onShowConfirmDialog = (e) => e.promise = this.confirmDialog.show(e.caption, e.message);
    this.onHideConfirmDialog = async () => await this.confirmDialog.hide();
    this.onShowToastNotification = async (e) => await this.toastNotificationElement.show(e);
    this.onHideToastNotification = async () => await this.toastNotificationElement.hide();
  }
  async addPlugins(pluginTypes) {
    pluginManager.pluginManager.registerPlugins(pluginTypes);
  }
  async addPlugin(pluginType) {
    pluginManager.pluginManager.registerPlugin(pluginType);
  }
  workflowChangedHandler(event) {
    eventBus.eventBus.emit(axiosMiddleware_esm.EventTypes.WorkflowModelChanged, this, event.detail);
  }
  connectedCallback() {
    eventBus.eventBus.on(axiosMiddleware_esm.EventTypes.ShowConfirmDialog, this.onShowConfirmDialog);
    eventBus.eventBus.on(axiosMiddleware_esm.EventTypes.HideConfirmDialog, this.onHideConfirmDialog);
    eventBus.eventBus.on(axiosMiddleware_esm.EventTypes.ShowToastNotification, this.onShowToastNotification);
    eventBus.eventBus.on(axiosMiddleware_esm.EventTypes.HideToastNotification, this.onHideToastNotification);
  }
  disconnectedCallback() {
    eventBus.eventBus.detach(axiosMiddleware_esm.EventTypes.ShowConfirmDialog, this.onShowConfirmDialog);
    eventBus.eventBus.detach(axiosMiddleware_esm.EventTypes.HideConfirmDialog, this.onHideConfirmDialog);
    eventBus.eventBus.detach(axiosMiddleware_esm.EventTypes.ShowToastNotification, this.onShowToastNotification);
    eventBus.eventBus.detach(axiosMiddleware_esm.EventTypes.HideToastNotification, this.onHideToastNotification);
  }
  async componentWillLoad() {
    const elsaClientFactory = () => elsaClient.createElsaClient(this.serverUrl);
    const httpClientFactory = () => elsaClient.createHttpClient(this.serverUrl);
    if (this.config) {
      await fetch(`${document.location.origin}/${this.config}`)
        .then(response => {
        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }
        return response.json();
      })
        .then(data => {
        this.featuresConfig = data;
      }).catch((error) => {
        console.error(error);
      });
    }
    const elsaStudio = this.elsaStudio = {
      serverUrl: this.serverUrl,
      basePath: this.basePath,
      features: this.featuresConfig,
      serverFeatures: [],
      eventBus: eventBus.eventBus,
      pluginManager: pluginManager.pluginManager,
      propertyDisplayManager: propertyDisplayManager.propertyDisplayManager,
      activityIconProvider: activityIconProvider.activityIconProvider,
      confirmDialogService: confirmDialogService.confirmDialogService,
      toastNotificationService: toastNotificationService.toastNotificationService,
      elsaClientFactory,
      httpClientFactory,
      getOrCreateProperty: utils.getOrCreateProperty,
      htmlToElement: utils.htmlToElement
    };
    this.initializing.emit(elsaStudio);
    await eventBus.eventBus.emit(axiosMiddleware_esm.EventTypes.Root.Initializing);
    pluginManager.pluginManager.initialize(elsaStudio);
    propertyDisplayManager.propertyDisplayManager.initialize(elsaStudio);
    featuresDataManager.featuresDataManager.initialize(elsaStudio);
    const elsaClient$1 = await elsaClientFactory();
    elsaStudio.serverFeatures = await elsaClient$1.featuresApi.list();
  }
  async componentDidLoad() {
    this.initialized.emit(this.elsaStudio);
    await eventBus.eventBus.emit(axiosMiddleware_esm.EventTypes.Root.Initialized);
  }
  render() {
    const culture = this.culture;
    const tunnelState = {
      serverUrl: this.serverUrl,
      basePath: this.basePath,
      serverFeatures: this.elsaStudio.serverFeatures,
      culture,
      monacoLibPath: this.monacoLibPath
    };
    return (index.h(dashboard.Tunnel.Provider, { state: tunnelState }, index.h("slot", null), index.h("elsa-confirm-dialog", { ref: el => this.confirmDialog = el, culture: this.culture }), index.h("elsa-toast-notification", { ref: el => this.toastNotificationElement = el })));
  }
};

let ElsaToastNotification = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
    this.isVisible = false;
  }
  async show(options) {
    this.isVisible = true;
    index$1.enter(this.toast);
    if (options.autoCloseIn)
      setTimeout(async () => await this.hide(), options.autoCloseIn);
    this.title = options.title;
    this.message = options.message;
  }
  async hide() {
    index$1.leave(this.toast).then(() => this.isVisible = false);
  }
  render() {
    return this.renderToast();
  }
  renderToast() {
    return (index.h(index.Host, { class: { 'hidden': !this.isVisible, 'elsa-block': true } }, index.h("div", { class: "elsa-fixed elsa-inset-0 elsa-z-20 elsa-flex elsa-items-end elsa-justify-center elsa-px-4 elsa-py-6 elsa-pointer-events-none sm:elsa-p-6 sm:elsa-items-start sm:elsa-justify-end" }, index.h("div", { ref: el => this.toast = el, "data-transition-enter": "elsa-transform elsa-ease-out elsa-duration-300 elsa-transition", "data-transition-enter-start": "elsa-translate-y-2 elsa-opacity-0 sm:elsa-translate-y-0 sm:elsa-translate-x-2", "data-transition-enter-end": "elsa-translate-y-0 elsa-opacity-100 sm:elsa-translate-x-0", "data-transition-leave": "elsa-transition elsa-ease-in elsa-duration-100", "data-transition-leave-start": "elsa-opacity-0", "data-transition-leave-end": "elsa-opacity-0", class: "elsa-max-w-sm elsa-w-full elsa-bg-white elsa-shadow-lg elsa-rounded-lg elsa-pointer-events-auto elsa-ring-1 elsa-ring-black elsa-ring-opacity-5 elsa-overflow-hidden" }, index.h("div", { class: "elsa-p-4" }, index.h("div", { class: "elsa-flex elsa-items-start" }, index.h("div", { class: "elsa-flex-shrink-0" }, index.h("svg", { class: "elsa-h-6 elsa-w-6 elsa-text-green-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "aria-hidden": "true" }, index.h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }))), index.h("div", { class: "elsa-ml-3 elsa-w-0 elsa-flex-1 elsa-pt-0.5" }, this.renderTitle(), index.h("p", { class: "elsa-mt-1 elsa-text-sm elsa-text-gray-500" }, this.message)), index.h("div", { class: "elsa-ml-4 elsa-flex-shrink-0 elsa-flex" }, index.h("button", { class: "elsa-bg-white elsa-rounded-md elsa-inline-flex elsa-text-gray-400 hover:elsa-text-gray-500 focus:elsa-outline-none focus:elsa-ring-2 focus:elsa-ring-offset-2 focus:elsa-ring-blue-500" }, index.h("span", { class: "elsa-sr-only" }, "Close"), index.h("svg", { class: "elsa-h-5 elsa-w-5", "x-description": "Heroicon name: solid/x", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", "aria-hidden": "true" }, index.h("path", { "fill-rule": "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", "clip-rule": "evenodd" }))))))))));
  }
  renderTitle() {
    if (!this.title || this.title.length == 0)
      return undefined;
    return (index.h("p", { class: "elsa-text-sm elsa-font-medium elsa-text-gray-900" }, this.title));
  }
};

const routeCss = "";

let Route = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
    this.group = null;
    this.match = null;
    this.componentProps = {};
    this.exact = false;
    this.scrollOnNextRender = false;
    this.previousMatch = null;
  }
  // Identify if the current route is a match.
  computeMatch(newLocation) {
    const isGrouped = this.group != null || (this.el.parentElement != null && this.el.parentElement.tagName.toLowerCase() === 'stencil-route-switch');
    if (!newLocation || isGrouped) {
      return;
    }
    this.previousMatch = this.match;
    return this.match = matchPath(newLocation.pathname, {
      path: this.url,
      exact: this.exact,
      strict: true
    });
  }
  async loadCompleted() {
    let routeViewOptions = {};
    if (this.history && this.history.location.hash) {
      routeViewOptions = {
        scrollToId: this.history.location.hash.substr(1)
      };
    }
    else if (this.scrollTopOffset) {
      routeViewOptions = {
        scrollTopOffset: this.scrollTopOffset
      };
    }
    // After all children have completed then tell switch
    // the provided callback will get executed after this route is in view
    if (typeof this.componentUpdated === 'function') {
      this.componentUpdated(routeViewOptions);
      // If this is an independent route and it matches then routes have updated.
      // If the only change to location is a hash change then do not scroll.
    }
    else if (this.match && !matchesAreEqual(this.match, this.previousMatch) && this.routeViewsUpdated) {
      this.routeViewsUpdated(routeViewOptions);
    }
  }
  async componentDidUpdate() {
    await this.loadCompleted();
  }
  async componentDidLoad() {
    await this.loadCompleted();
  }
  render() {
    // If there is no activeRouter then do not render
    // Check if this route is in the matching URL (for example, a parent route)
    if (!this.match || !this.history) {
      return null;
    }
    // component props defined in route
    // the history api
    // current match data including params
    const childProps = Object.assign({}, this.componentProps, { history: this.history, match: this.match });
    // If there is a routerRender defined then use
    // that and pass the component and component props with it.
    if (this.routeRender) {
      return this.routeRender(Object.assign({}, childProps, { component: this.component }));
    }
    if (this.component) {
      const ChildComponent = this.component;
      return (index.h(ChildComponent, Object.assign({}, childProps)));
    }
  }
  get el() { return index.getElement(this); }
  static get watchers() { return {
    "location": ["computeMatch"]
  }; }
};
activeRouter.ActiveRouter.injectProps(Route, [
  'location',
  'history',
  'historyType',
  'routeViewsUpdated'
]);
Route.style = routeCss;

const getConfirmation = (win, message, callback) => (callback(win.confirm(message)));
const isModifiedEvent = (ev) => (ev.metaKey || ev.altKey || ev.ctrlKey || ev.shiftKey);
/**
 * Returns true if the HTML5 history API is supported. Taken from Modernizr.
 *
 * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
 * changed to avoid false negatives for Windows Phones: https://github.com/reactjs/react-router/issues/586
 */
const supportsHistory = (win) => {
    const ua = win.navigator.userAgent;
    if ((ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) &&
        ua.indexOf('Mobile Safari') !== -1 &&
        ua.indexOf('Chrome') === -1 &&
        ua.indexOf('Windows Phone') === -1) {
        return false;
    }
    return win.history && 'pushState' in win.history;
};
/**
 * Returns true if browser fires popstate on hash change.
 * IE10 and IE11 do not.
 */
const supportsPopStateOnHashChange = (nav) => (nav.userAgent.indexOf('Trident') === -1);
/**
 * Returns false if using go(n) with hash history causes a full page reload.
 */
const supportsGoWithoutReloadUsingHash = (nav) => (nav.userAgent.indexOf('Firefox') === -1);
const isExtraneousPopstateEvent = (nav, event) => (event.state === undefined &&
    nav.userAgent.indexOf('CriOS') === -1);
const storageAvailable = (win, type) => {
    const storage = win[type];
    const x = '__storage_test__';
    try {
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch (e) {
        return e instanceof DOMException && (
        // everything except Firefox
        e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
};

const getUrl = (url, root) => {
  // Don't allow double slashes
  if (url.charAt(0) == '/' && root.charAt(root.length - 1) == '/') {
    return root.slice(0, root.length - 1) + url;
  }
  return root + url;
};
let RouteLink = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
    this.unsubscribe = () => { return; };
    this.activeClass = 'link-active';
    this.exact = false;
    this.strict = true;
    /**
      *  Custom tag to use instead of an anchor
      */
    this.custom = 'a';
    this.match = null;
  }
  componentWillLoad() {
    this.computeMatch();
  }
  // Identify if the current route is a match.
  computeMatch() {
    if (this.location) {
      this.match = matchPath(this.location.pathname, {
        path: this.urlMatch || this.url,
        exact: this.exact,
        strict: this.strict
      });
    }
  }
  handleClick(e) {
    if (isModifiedEvent(e) || !this.history || !this.url || !this.root) {
      return;
    }
    e.preventDefault();
    return this.history.push(getUrl(this.url, this.root));
  }
  // Get the URL for this route link without the root from the router
  render() {
    let anchorAttributes = {
      class: {
        [this.activeClass]: this.match !== null,
      },
      onClick: this.handleClick.bind(this)
    };
    if (this.anchorClass) {
      anchorAttributes.class[this.anchorClass] = true;
    }
    if (this.custom === 'a') {
      anchorAttributes = Object.assign({}, anchorAttributes, { href: this.url, title: this.anchorTitle, role: this.anchorRole, tabindex: this.anchorTabIndex, 'aria-haspopup': this.ariaHaspopup, id: this.anchorId, 'aria-posinset': this.ariaPosinset, 'aria-setsize': this.ariaSetsize, 'aria-label': this.ariaLabel });
    }
    return (index.h(this.custom, Object.assign({}, anchorAttributes), index.h("slot", null)));
  }
  get el() { return index.getElement(this); }
  static get watchers() { return {
    "location": ["computeMatch"]
  }; }
};
activeRouter.ActiveRouter.injectProps(RouteLink, [
  'history',
  'location',
  'root'
]);

const getUniqueId = () => {
  return ((Math.random() * 10e16).toString().match(/.{4}/g) || []).join('-');
};
const getMatch = (pathname, url, exact) => {
  return matchPath(pathname, {
    path: url,
    exact: exact,
    strict: true
  });
};
const isHTMLStencilRouteElement = (elm) => {
  return elm.tagName === 'STENCIL-ROUTE';
};
let RouteSwitch = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
    this.group = getUniqueId();
    this.subscribers = [];
    this.queue = index.getContext(this, "queue");
  }
  componentWillLoad() {
    if (this.location != null) {
      this.regenerateSubscribers(this.location);
    }
  }
  async regenerateSubscribers(newLocation) {
    if (newLocation == null) {
      return;
    }
    let newActiveIndex = -1;
    this.subscribers = Array.prototype.slice.call(this.el.children)
      .filter(isHTMLStencilRouteElement)
      .map((childElement, index) => {
      const match = getMatch(newLocation.pathname, childElement.url, childElement.exact);
      if (match && newActiveIndex === -1) {
        newActiveIndex = index;
      }
      return {
        el: childElement,
        match: match
      };
    });
    if (newActiveIndex === -1) {
      return;
    }
    // Check if this actually changes which child is active
    // then just pass the new match down if the active route isn't changing.
    if (this.activeIndex === newActiveIndex) {
      this.subscribers[newActiveIndex].el.match = this.subscribers[newActiveIndex].match;
      return;
    }
    this.activeIndex = newActiveIndex;
    // Set all props on the new active route then wait until it says that it
    // is completed
    const activeChild = this.subscribers[this.activeIndex];
    if (this.scrollTopOffset) {
      activeChild.el.scrollTopOffset = this.scrollTopOffset;
    }
    activeChild.el.group = this.group;
    activeChild.el.match = activeChild.match;
    activeChild.el.componentUpdated = (routeViewUpdatedOptions) => {
      // After the new active route has completed then update visibility of routes
      this.queue.write(() => {
        this.subscribers.forEach((child, index) => {
          child.el.componentUpdated = undefined;
          if (index === this.activeIndex) {
            return child.el.style.display = '';
          }
          if (this.scrollTopOffset) {
            child.el.scrollTopOffset = this.scrollTopOffset;
          }
          child.el.group = this.group;
          child.el.match = null;
          child.el.style.display = 'none';
        });
      });
      if (this.routeViewsUpdated) {
        this.routeViewsUpdated(Object.assign({ scrollTopOffset: this.scrollTopOffset }, routeViewUpdatedOptions));
      }
    };
  }
  render() {
    return (index.h("slot", null));
  }
  get el() { return index.getElement(this); }
  static get watchers() { return {
    "location": ["regenerateSubscribers"]
  }; }
};
activeRouter.ActiveRouter.injectProps(RouteSwitch, [
  'location',
  'routeViewsUpdated'
]);

const warning = (value, ...args) => {
    if (!value) {
        console.warn(...args);
    }
};

// Adapted from the https://github.com/ReactTraining/history and converted to TypeScript
const createTransitionManager = () => {
    let prompt;
    let listeners = [];
    const setPrompt = (nextPrompt) => {
        warning(prompt == null, 'A history supports only one prompt at a time');
        prompt = nextPrompt;
        return () => {
            if (prompt === nextPrompt) {
                prompt = null;
            }
        };
    };
    const confirmTransitionTo = (location, action, getUserConfirmation, callback) => {
        // TODO: If another transition starts while we're still confirming
        // the previous one, we may end up in a weird state. Figure out the
        // best way to handle this.
        if (prompt != null) {
            const result = typeof prompt === 'function' ? prompt(location, action) : prompt;
            if (typeof result === 'string') {
                if (typeof getUserConfirmation === 'function') {
                    getUserConfirmation(result, callback);
                }
                else {
                    warning(false, 'A history needs a getUserConfirmation function in order to use a prompt message');
                    callback(true);
                }
            }
            else {
                // Return false from a transition hook to cancel the transition.
                callback(result !== false);
            }
        }
        else {
            callback(true);
        }
    };
    const appendListener = (fn) => {
        let isActive = true;
        const listener = (...args) => {
            if (isActive) {
                fn(...args);
            }
        };
        listeners.push(listener);
        return () => {
            isActive = false;
            listeners = listeners.filter(item => item !== listener);
        };
    };
    const notifyListeners = (...args) => {
        listeners.forEach(listener => listener(...args));
    };
    return {
        setPrompt,
        confirmTransitionTo,
        appendListener,
        notifyListeners
    };
};

const createScrollHistory = (win, applicationScrollKey = 'scrollPositions') => {
    let scrollPositions = new Map();
    const set = (key, value) => {
        scrollPositions.set(key, value);
        if (storageAvailable(win, 'sessionStorage')) {
            const arrayData = [];
            scrollPositions.forEach((value, key) => {
                arrayData.push([key, value]);
            });
            win.sessionStorage.setItem('scrollPositions', JSON.stringify(arrayData));
        }
    };
    const get = (key) => {
        return scrollPositions.get(key);
    };
    const has = (key) => {
        return scrollPositions.has(key);
    };
    const capture = (key) => {
        set(key, [win.scrollX, win.scrollY]);
    };
    if (storageAvailable(win, 'sessionStorage')) {
        const scrollData = win.sessionStorage.getItem(applicationScrollKey);
        scrollPositions = scrollData ?
            new Map(JSON.parse(scrollData)) :
            scrollPositions;
    }
    if ('scrollRestoration' in win.history) {
        history.scrollRestoration = 'manual';
    }
    return {
        set,
        get,
        has,
        capture
    };
};

// Adapted from the https://github.com/ReactTraining/history and converted to TypeScript
const PopStateEvent = 'popstate';
const HashChangeEvent$1 = 'hashchange';
/**
 * Creates a history object that uses the HTML5 history API including
 * pushState, replaceState, and the popstate event.
 */
const createBrowserHistory = (win, props = {}) => {
    let forceNextPop = false;
    const globalHistory = win.history;
    const globalLocation = win.location;
    const globalNavigator = win.navigator;
    const canUseHistory = supportsHistory(win);
    const needsHashChangeListener = !supportsPopStateOnHashChange(globalNavigator);
    const scrollHistory = createScrollHistory(win);
    const forceRefresh = (props.forceRefresh != null) ? props.forceRefresh : false;
    const getUserConfirmation = (props.getUserConfirmation != null) ? props.getUserConfirmation : getConfirmation;
    const keyLength = (props.keyLength != null) ? props.keyLength : 6;
    const basename = props.basename ? stripTrailingSlash(addLeadingSlash(props.basename)) : '';
    const getHistoryState = () => {
        try {
            return win.history.state || {};
        }
        catch (e) {
            // IE 11 sometimes throws when accessing window.history.state
            // See https://github.com/ReactTraining/history/pull/289
            return {};
        }
    };
    const getDOMLocation = (historyState) => {
        historyState = historyState || {};
        const { key, state } = historyState;
        const { pathname, search, hash } = globalLocation;
        let path = pathname + search + hash;
        warning((!basename || hasBasename(path, basename)), 'You are attempting to use a basename on a page whose URL path does not begin ' +
            'with the basename. Expected path "' + path + '" to begin with "' + basename + '".');
        if (basename) {
            path = stripBasename(path, basename);
        }
        return createLocation(path, state, key || createKey(keyLength));
    };
    const transitionManager = createTransitionManager();
    const setState = (nextState) => {
        // Capture location for the view before changing history.
        scrollHistory.capture(history.location.key);
        Object.assign(history, nextState);
        // Set scroll position based on its previous storage value
        history.location.scrollPosition = scrollHistory.get(history.location.key);
        history.length = globalHistory.length;
        transitionManager.notifyListeners(history.location, history.action);
    };
    const handlePopState = (event) => {
        // Ignore extraneous popstate events in WebKit.
        if (!isExtraneousPopstateEvent(globalNavigator, event)) {
            handlePop(getDOMLocation(event.state));
        }
    };
    const handleHashChange = () => {
        handlePop(getDOMLocation(getHistoryState()));
    };
    const handlePop = (location) => {
        if (forceNextPop) {
            forceNextPop = false;
            setState();
        }
        else {
            const action = 'POP';
            transitionManager.confirmTransitionTo(location, action, getUserConfirmation, (ok) => {
                if (ok) {
                    setState({ action, location });
                }
                else {
                    revertPop(location);
                }
            });
        }
    };
    const revertPop = (fromLocation) => {
        const toLocation = history.location;
        // TODO: We could probably make this more reliable by
        // keeping a list of keys we've seen in sessionStorage.
        // Instead, we just default to 0 for keys we don't know.
        let toIndex = allKeys.indexOf(toLocation.key);
        let fromIndex = allKeys.indexOf(fromLocation.key);
        if (toIndex === -1) {
            toIndex = 0;
        }
        if (fromIndex === -1) {
            fromIndex = 0;
        }
        const delta = toIndex - fromIndex;
        if (delta) {
            forceNextPop = true;
            go(delta);
        }
    };
    const initialLocation = getDOMLocation(getHistoryState());
    let allKeys = [initialLocation.key];
    let listenerCount = 0;
    let isBlocked = false;
    // Public interface
    const createHref = (location) => {
        return basename + createPath(location);
    };
    const push = (path, state) => {
        warning(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' +
            'argument is a location-like object that already has state; it is ignored');
        const action = 'PUSH';
        const location = createLocation(path, state, createKey(keyLength), history.location);
        transitionManager.confirmTransitionTo(location, action, getUserConfirmation, (ok) => {
            if (!ok) {
                return;
            }
            const href = createHref(location);
            const { key, state } = location;
            if (canUseHistory) {
                globalHistory.pushState({ key, state }, '', href);
                if (forceRefresh) {
                    globalLocation.href = href;
                }
                else {
                    const prevIndex = allKeys.indexOf(history.location.key);
                    const nextKeys = allKeys.slice(0, prevIndex === -1 ? 0 : prevIndex + 1);
                    nextKeys.push(location.key);
                    allKeys = nextKeys;
                    setState({ action, location });
                }
            }
            else {
                warning(state === undefined, 'Browser history cannot push state in browsers that do not support HTML5 history');
                globalLocation.href = href;
            }
        });
    };
    const replace = (path, state) => {
        warning(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' +
            'argument is a location-like object that already has state; it is ignored');
        const action = 'REPLACE';
        const location = createLocation(path, state, createKey(keyLength), history.location);
        transitionManager.confirmTransitionTo(location, action, getUserConfirmation, (ok) => {
            if (!ok) {
                return;
            }
            const href = createHref(location);
            const { key, state } = location;
            if (canUseHistory) {
                globalHistory.replaceState({ key, state }, '', href);
                if (forceRefresh) {
                    globalLocation.replace(href);
                }
                else {
                    const prevIndex = allKeys.indexOf(history.location.key);
                    if (prevIndex !== -1) {
                        allKeys[prevIndex] = location.key;
                    }
                    setState({ action, location });
                }
            }
            else {
                warning(state === undefined, 'Browser history cannot replace state in browsers that do not support HTML5 history');
                globalLocation.replace(href);
            }
        });
    };
    const go = (n) => {
        globalHistory.go(n);
    };
    const goBack = () => go(-1);
    const goForward = () => go(1);
    const checkDOMListeners = (delta) => {
        listenerCount += delta;
        if (listenerCount === 1) {
            win.addEventListener(PopStateEvent, handlePopState);
            if (needsHashChangeListener) {
                win.addEventListener(HashChangeEvent$1, handleHashChange);
            }
        }
        else if (listenerCount === 0) {
            win.removeEventListener(PopStateEvent, handlePopState);
            if (needsHashChangeListener) {
                win.removeEventListener(HashChangeEvent$1, handleHashChange);
            }
        }
    };
    const block = (prompt = '') => {
        const unblock = transitionManager.setPrompt(prompt);
        if (!isBlocked) {
            checkDOMListeners(1);
            isBlocked = true;
        }
        return () => {
            if (isBlocked) {
                isBlocked = false;
                checkDOMListeners(-1);
            }
            return unblock();
        };
    };
    const listen = (listener) => {
        const unlisten = transitionManager.appendListener(listener);
        checkDOMListeners(1);
        return () => {
            checkDOMListeners(-1);
            unlisten();
        };
    };
    const history = {
        length: globalHistory.length,
        action: 'POP',
        location: initialLocation,
        createHref,
        push,
        replace,
        go,
        goBack,
        goForward,
        block,
        listen,
        win: win
    };
    return history;
};

// Adapted from the https://github.com/ReactTraining/history and converted to TypeScript
const HashChangeEvent = 'hashchange';
const HashPathCoders = {
    hashbang: {
        encodePath: (path) => path.charAt(0) === '!' ? path : '!/' + stripLeadingSlash(path),
        decodePath: (path) => path.charAt(0) === '!' ? path.substr(1) : path
    },
    noslash: {
        encodePath: stripLeadingSlash,
        decodePath: addLeadingSlash
    },
    slash: {
        encodePath: addLeadingSlash,
        decodePath: addLeadingSlash
    }
};
const createHashHistory = (win, props = {}) => {
    let forceNextPop = false;
    let ignorePath = null;
    let listenerCount = 0;
    let isBlocked = false;
    const globalLocation = win.location;
    const globalHistory = win.history;
    const canGoWithoutReload = supportsGoWithoutReloadUsingHash(win.navigator);
    const keyLength = (props.keyLength != null) ? props.keyLength : 6;
    const { getUserConfirmation = getConfirmation, hashType = 'slash' } = props;
    const basename = props.basename ? stripTrailingSlash(addLeadingSlash(props.basename)) : '';
    const { encodePath, decodePath } = HashPathCoders[hashType];
    const getHashPath = () => {
        // We can't use window.location.hash here because it's not
        // consistent across browsers - Firefox will pre-decode it!
        const href = globalLocation.href;
        const hashIndex = href.indexOf('#');
        return hashIndex === -1 ? '' : href.substring(hashIndex + 1);
    };
    const pushHashPath = (path) => (globalLocation.hash = path);
    const replaceHashPath = (path) => {
        const hashIndex = globalLocation.href.indexOf('#');
        globalLocation.replace(globalLocation.href.slice(0, hashIndex >= 0 ? hashIndex : 0) + '#' + path);
    };
    const getDOMLocation = () => {
        let path = decodePath(getHashPath());
        warning((!basename || hasBasename(path, basename)), 'You are attempting to use a basename on a page whose URL path does not begin ' +
            'with the basename. Expected path "' + path + '" to begin with "' + basename + '".');
        if (basename) {
            path = stripBasename(path, basename);
        }
        return createLocation(path, undefined, createKey(keyLength));
    };
    const transitionManager = createTransitionManager();
    const setState = (nextState) => {
        Object.assign(history, nextState);
        history.length = globalHistory.length;
        transitionManager.notifyListeners(history.location, history.action);
    };
    const handleHashChange = () => {
        const path = getHashPath();
        const encodedPath = encodePath(path);
        if (path !== encodedPath) {
            // Ensure we always have a properly-encoded hash.
            replaceHashPath(encodedPath);
        }
        else {
            const location = getDOMLocation();
            const prevLocation = history.location;
            if (!forceNextPop && locationsAreEqual(prevLocation, location)) {
                return; // A hashchange doesn't always == location change.
            }
            if (ignorePath === createPath(location)) {
                return; // Ignore this change; we already setState in push/replace.
            }
            ignorePath = null;
            handlePop(location);
        }
    };
    const handlePop = (location) => {
        if (forceNextPop) {
            forceNextPop = false;
            setState();
        }
        else {
            const action = 'POP';
            transitionManager.confirmTransitionTo(location, action, getUserConfirmation, (ok) => {
                if (ok) {
                    setState({ action, location });
                }
                else {
                    revertPop(location);
                }
            });
        }
    };
    const revertPop = (fromLocation) => {
        const toLocation = history.location;
        // TODO: We could probably make this more reliable by
        // keeping a list of paths we've seen in sessionStorage.
        // Instead, we just default to 0 for paths we don't know.
        let toIndex = allPaths.lastIndexOf(createPath(toLocation));
        let fromIndex = allPaths.lastIndexOf(createPath(fromLocation));
        if (toIndex === -1) {
            toIndex = 0;
        }
        if (fromIndex === -1) {
            fromIndex = 0;
        }
        const delta = toIndex - fromIndex;
        if (delta) {
            forceNextPop = true;
            go(delta);
        }
    };
    // Ensure the hash is encoded properly before doing anything else.
    const path = getHashPath();
    const encodedPath = encodePath(path);
    if (path !== encodedPath) {
        replaceHashPath(encodedPath);
    }
    const initialLocation = getDOMLocation();
    let allPaths = [createPath(initialLocation)];
    // Public interface
    const createHref = (location) => ('#' + encodePath(basename + createPath(location)));
    const push = (path, state) => {
        warning(state === undefined, 'Hash history cannot push state; it is ignored');
        const action = 'PUSH';
        const location = createLocation(path, undefined, createKey(keyLength), history.location);
        transitionManager.confirmTransitionTo(location, action, getUserConfirmation, (ok) => {
            if (!ok) {
                return;
            }
            const path = createPath(location);
            const encodedPath = encodePath(basename + path);
            const hashChanged = getHashPath() !== encodedPath;
            if (hashChanged) {
                // We cannot tell if a hashchange was caused by a PUSH, so we'd
                // rather setState here and ignore the hashchange. The caveat here
                // is that other hash histories in the page will consider it a POP.
                ignorePath = path;
                pushHashPath(encodedPath);
                const prevIndex = allPaths.lastIndexOf(createPath(history.location));
                const nextPaths = allPaths.slice(0, prevIndex === -1 ? 0 : prevIndex + 1);
                nextPaths.push(path);
                allPaths = nextPaths;
                setState({ action, location });
            }
            else {
                warning(false, 'Hash history cannot PUSH the same path; a new entry will not be added to the history stack');
                setState();
            }
        });
    };
    const replace = (path, state) => {
        warning(state === undefined, 'Hash history cannot replace state; it is ignored');
        const action = 'REPLACE';
        const location = createLocation(path, undefined, createKey(keyLength), history.location);
        transitionManager.confirmTransitionTo(location, action, getUserConfirmation, (ok) => {
            if (!ok) {
                return;
            }
            const path = createPath(location);
            const encodedPath = encodePath(basename + path);
            const hashChanged = getHashPath() !== encodedPath;
            if (hashChanged) {
                // We cannot tell if a hashchange was caused by a REPLACE, so we'd
                // rather setState here and ignore the hashchange. The caveat here
                // is that other hash histories in the page will consider it a POP.
                ignorePath = path;
                replaceHashPath(encodedPath);
            }
            const prevIndex = allPaths.indexOf(createPath(history.location));
            if (prevIndex !== -1) {
                allPaths[prevIndex] = path;
            }
            setState({ action, location });
        });
    };
    const go = (n) => {
        warning(canGoWithoutReload, 'Hash history go(n) causes a full page reload in this browser');
        globalHistory.go(n);
    };
    const goBack = () => go(-1);
    const goForward = () => go(1);
    const checkDOMListeners = (win, delta) => {
        listenerCount += delta;
        if (listenerCount === 1) {
            win.addEventListener(HashChangeEvent, handleHashChange);
        }
        else if (listenerCount === 0) {
            win.removeEventListener(HashChangeEvent, handleHashChange);
        }
    };
    const block = (prompt = '') => {
        const unblock = transitionManager.setPrompt(prompt);
        if (!isBlocked) {
            checkDOMListeners(win, 1);
            isBlocked = true;
        }
        return () => {
            if (isBlocked) {
                isBlocked = false;
                checkDOMListeners(win, -1);
            }
            return unblock();
        };
    };
    const listen = (listener) => {
        const unlisten = transitionManager.appendListener(listener);
        checkDOMListeners(win, 1);
        return () => {
            checkDOMListeners(win, -1);
            unlisten();
        };
    };
    const history = {
        length: globalHistory.length,
        action: 'POP',
        location: initialLocation,
        createHref,
        push,
        replace,
        go,
        goBack,
        goForward,
        block,
        listen,
        win: win
    };
    return history;
};

const getLocation = (location, root) => {
  // Remove the root URL if found at beginning of string
  const pathname = location.pathname.indexOf(root) == 0 ?
    '/' + location.pathname.slice(root.length) :
    location.pathname;
  return Object.assign({}, location, { pathname });
};
const HISTORIES = {
  'browser': createBrowserHistory,
  'hash': createHashHistory
};
let Router = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
    this.root = '/';
    this.historyType = 'browser';
    // A suffix to append to the page title whenever
    // it's updated through RouteTitle
    this.titleSuffix = '';
    this.routeViewsUpdated = (options = {}) => {
      if (this.history && options.scrollToId && this.historyType === 'browser') {
        const elm = this.history.win.document.getElementById(options.scrollToId);
        if (elm) {
          return elm.scrollIntoView();
        }
      }
      this.scrollTo(options.scrollTopOffset || this.scrollTopOffset);
    };
    this.isServer = index.getContext(this, "isServer");
    this.queue = index.getContext(this, "queue");
  }
  componentWillLoad() {
    this.history = HISTORIES[this.historyType](this.el.ownerDocument.defaultView);
    this.history.listen((location) => {
      location = getLocation(location, this.root);
      this.location = location;
    });
    this.location = getLocation(this.history.location, this.root);
  }
  scrollTo(scrollToLocation) {
    const history = this.history;
    if (scrollToLocation == null || this.isServer || !history) {
      return;
    }
    if (history.action === 'POP' && Array.isArray(history.location.scrollPosition)) {
      return this.queue.write(() => {
        if (history && history.location && Array.isArray(history.location.scrollPosition)) {
          history.win.scrollTo(history.location.scrollPosition[0], history.location.scrollPosition[1]);
        }
      });
    }
    // okay, the frame has passed. Go ahead and render now
    return this.queue.write(() => {
      history.win.scrollTo(0, scrollToLocation);
    });
  }
  render() {
    if (!this.location || !this.history) {
      return;
    }
    const state = {
      historyType: this.historyType,
      location: this.location,
      titleSuffix: this.titleSuffix,
      root: this.root,
      history: this.history,
      routeViewsUpdated: this.routeViewsUpdated
    };
    return (index.h(activeRouter.ActiveRouter.Provider, { state: state }, index.h("slot", null)));
  }
  get el() { return index.getElement(this); }
};

exports.context_consumer = ContextConsumer;
exports.elsa_confirm_dialog = ElsaConfirmDialog;
exports.elsa_modal_dialog = ElsaModalDialog;
exports.elsa_studio_dashboard = ElsaStudioDashboard;
exports.elsa_studio_root = ElsaStudioRoot;
exports.elsa_toast_notification = ElsaToastNotification;
exports.stencil_route = Route;
exports.stencil_route_link = RouteLink;
exports.stencil_route_switch = RouteSwitch;
exports.stencil_router = Router;
