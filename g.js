//     (c) 2012 Rhys Brett-Bowen, Catch.com
//     G-object may be freely distributed under the MIT license.
//     For all details and documentation:
//     https://github.com/rhysbrettbowen/G-closure

goog.provide('$');
goog.provide('$$');
goog.provide('G');
goog.provide('GG');

goog.require('goog.Timer');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.json');
goog.require('goog.style');



/**
 * @param {*} input to create the G with.
 * @param {string|Element|Node=} opt_mod elemnt to look under.
 * @constructor
 * @return {G} the G object.
 */
G = function(input, opt_mod) {
  if (!goog.isDefAndNotNull(input))
    input = [];

  // already a G so return
  if (input.constructor == G)
    return /** @type {G} */(new G.init(input.toArray()));

  // if the mod is a string it's a selector
  if (goog.isString(opt_mod)) {
    opt_mod = GG.elsBySelector(/** @type {string} */(opt_mod))[0];
  }

  if (input.constructor == document.createDocumentFragment().constructor &&
      input.childNodes.length)
    input = goog.array.clone(input.childNodes);

  // if it's an element then wrap it
  if (input.nodeType)
    input = [input];

  // a string is a selector
  else if (goog.isString(input)) {
    if (goog.string.trimLeft(input).charAt(0) == '<') {
      input = goog.dom.htmlToDocumentFragment(input);
      if (input.constructor == document.createDocumentFragment().constructor &&
          input.childNodes.length)
        input = goog.array.clone(input.childNodes);
      else
        input = [input];
    } else {
      input = GG.elsBySelector(input, opt_mod);
    }
    if (!input) {
      input = [];
    }
  }

  // no input is an empty G object
  else if (!input) {
    input = [];
  }

  // if it's not an array then make it one
  if (typeof input === 'object' && 'setInterval' in input) {
    input = [input];
  }
  else if (!goog.isArrayLike(input)) {
    input = [input];
  }

  // G is actually G.init instantiated with an array
  return /** @type {G} */(new G.init(
      /** @type {{length: number}} */(input)));
};

// remove this line if you don't want to use $
$ = G;

GG = {};
// remove this line if you don't want to use $$
$$ = GG;


/** @type {number} */
G.prototype.length = 0;



/**
 * @constructor
 * @extends {G}
 * @param {goog.array.ArrayLike} input array to turn in to G.
 * @return {G} the new G object.
 */
G.init = function(input) {
  // copy all elements in to the object and return itself as G
  for (var i = 0; i < input.length; i++)
    this[i] = input[i];
  this.length = input.length;
  return this;
};
GG.fn = G.init.prototype = G.prototype;


/**
 * The constructor should be G
 */
G.prototype.constructor = G;


GG.selectorEngine_ = null;


GG.matchesEngine_ = null;


/**
 * change the default selector engine.
 * 
 * @param {Function} engine should take two arguments, the string selector and
 * optionally an element to look under and return an array of elements
 */
GG.setSelectorEngine = function(engine) {
  GG.selectorEngine_ = engine;
};


/**
 * change the default selector engine.
 * 
 * @param {Function} engine should take two arguments, the element and the
 * selector string and return a boolean for a match.
 */
GG.setMatchesEngine = function(engine) {
  GG.selectorEngine_ = engine;
};


/**
 * css filters and their corresponding filter functions
 */
GG.cssFilters = {
  /**
   * @param {Element|Node} el to check.
   * @return {boolean} whether element matches the filter.
   */
  'visible': function(el) {return /** @type {boolean} */(G(el).visible());},
  /**
   * @param {Element|Node} el to check.
   * @return {boolean} whether element matches the filter.
   */
  'hidden': function(el) {return !/** @type {boolean} */(G(el).visible());},
  /**
   * @param {Element|Node} el to check.
   * @return {boolean} whether element matches the filter.
   */
  'selected': function(el) {return el.selected;},
  /**
   * @param {Element|Node} el to check.
   * @return {boolean} whether element matches the filter.
   */
  'checked': function(el) {return el.checked;},
  /**
   * @param {Element|Node} el to check.
   * @return {boolean} whether element matches the filter.
   */
  'first': function(el) {return el == el.parentNode.firstChild;},
  /**
   * @param {Element|Node} el to check.
   * @return {boolean} whether element matches the filter.
   */
  'last': function(el) {return el == el.parentNode.lastChild;},
  /**
   * @param {Element|Node} el to check.
   * @return {boolean} whether element matches the filter.
   */
  'even': function(el) {
    return (G(el.parentNode).children().index(el) % 2) === 0;
  },
  /**
   * @param {Element|Node} el to check.
   * @return {boolean} whether element matches the filter.
   */
  'odd': function(el) {
    return (G(el.parentNode).children().index(el) % 2) === 1;
  }
};


/**
 * takes a string like 'tagName[ .className]', '.className' or '#elementId'
 * mod is the element to search from
 *
 * @param {string} input selector string.
 * @param {Element|Node=} opt_mod element or node to look under.
 * @return {goog.array.ArrayLike} nodelist of found elements.
 */
GG.elsBySelector = function(input, opt_mod) {
  if (input.charAt(0) == '-')
    input = '.' + input.substring(1);

  if(GG.selectorEngine_)
    return GG.selectorEngine_(input, opt_mod);
  var ret;
  opt_mod = opt_mod || document;
  // use native querySelectorAll if available
  if (opt_mod.querySelectorAll) {
    ret = opt_mod.querySelectorAll(input.indexOf(':') >= 0 ?
        input.replace(/\:.*/, '') :
        input);

  // if not then parse string and use closure library functions
  } else if (input.charAt(0) == '.') {
    ret = (goog.dom.getElementsByClass(input.substring(1)
        .replace(/[\:\s].*/, ''),
        /** @type {Element} */(opt_mod)) || []);
  } else if (input.charAt(0) == '#') {
    ret = [goog.dom.getElement(input)];
  } else {
    ret = goog.dom.getElementsByTagNameAndClass(input.replace(/\s.*/, ''),
        input.replace(/.*\./, '').replace(/[\:\s].*/, '') || null,
        /** @type {Element} */(opt_mod));
  }

  // filter the results with css filters
  if (input.indexOf(':') >= 0) {
    return GG.grep(ret, GG.cssFilters[input.substring(input.indexOf(':') + 1)]);
  }
  return ret;
};


/**
 * takes an element and a function or selector string and returns true if the
 * element matches the selector. Tries to use native functions where it can.
 * Will only work with no native function if the element has a parent
 *
 * @param {Element|Node} element to test.
 * @param {Function|string=} opt_selector function that takes element and
 * returns boolean or a selector string.
 * @return {boolean} if the element matches the selector.
 */
GG.matches = function(element, opt_selector) {
  if (opt_selector && opt_selector.charAt(0) == '-')
    opt_selector = '.' + opt_selector.substring(1);

  if (GG.matchesEngine_)
    return GG.matchesEngine_(element, opt_selector);

  // handle where opt selector is function or not defined
  if (!goog.isDef(opt_selector))
    return true;
  if (goog.isFunction(opt_selector)) {
    return opt_selector(element);
  }

  // use native MatechesSelector where available
  var matchesSelector = element['webkitMatchesSelector'] ||
      element['mozMatchesSelector'] ||
      element['oMatchesSelector'] ||
      element['matchesSelector'];
  if (matchesSelector) {
    return matchesSelector.call(element, opt_selector);
  }

  // else see if element is in it's parent if calling the selector on it
  var parent = element.parentNode;
  var els = GG.elsBySelector(/** @type {string} */(opt_selector), parent);
  return goog.array.contains(els, element);
};

// Utility functions


/**
 * Extends an object with another object.
 * This operates 'in-place'; it does not create a new Object.
 *
 * @param {Object} obj  The object to modify.
 * @param {...Object} var_args The objects from which values will be copied.
 * @return {Object} that was extended.
 */
GG.extend = function(obj, var_args) {
  goog.object.extend(obj, var_args);
  return obj;
};


/**
 * Whether a node contains another node.
 * @param {Node} parent The node that should contain the other node.
 * @param {Node} descendant The node to test presence of.
 * @return {boolean} Whether the parent node contains the descendent node.
 */
GG.contains = goog.dom.contains;


/**
 * returns the data set on the element
 *
 * @param {Element} element to check for data.
 * @param {string=} opt_key for the data.
 * @param {string=} opt_value the value to set for the key.
 * @return {G|string} the element wrapped in a G.
 */
GG.data = function(element, opt_key, opt_value) {
  return G(element).data(opt_key, opt_value);
};


/**
 * runs a function on each element in the collection
 *
 * @param {goog.array.ArrayLike|G|string} collection to run on.
 * @param {Function} callback function to run.
 * @return {G} collection as a G object.
 */
GG.each = function(collection, callback) {
  return G(collection).each(callback);
};


/**
 * filters an array based on a function
 *
 * @param {goog.array.ArrayLike} array to filter.
 * @param {Function} fn can take 2 arguments. The element and the index.
 * @param {boolean=} opt_invert whether to have the opposite returned.
 * @return {Array} the filtered array.
 */
GG.grep = function(array, fn, opt_invert) {
  var func = fn;
  if (opt_invert)
    func = function(el, ind) {
      return !fn(el, ind);
    };
  return goog.array.filter(array, func);
};


/**
 * Calls the given function once, after the optional pause.
 *
 * The function is always called asynchronously, even if the delay is 0. This
 * is a common trick to schedule a function to run after a batch of browser
 * event processing.
 *
 * @param {Function} listener Function or object that has a handleEvent method.
 * @param {number=} opt_delay Milliseconds to wait; default is 0.
 * @param {Object=} opt_handler Object in whose scope to call the listener.
 * @return {number} A handle to the timer ID.
 */
 GG.wait = goog.Timer.callOnce;


/**
 * Clears a timeout initiated by callOnce
 *
 * @param {?number} timerId a timer ID.
 */
 GG.clearWait = goog.Timer.clear;


/**
 * returns the index of the value in the array
 *
 * @param {Object} value to find.
 * @param {goog.array.ArrayLike} array to look in.
 * @param {number=} opt_index  to look from.
 * @return {number} the index of the value.
 */
GG.inArray = function(value, array, opt_index) {
  return goog.array.indexOf(array, value, opt_index);
};


/**
 * flattens arrays together - useful to get array from Gs
 */
GG.flatten = function (var_args) {
  var result = [];
  for (var i = 0; i < arguments.length; i++) {
    var element = arguments[i];
    if (goog.isArrayLike(element)) {
      result.push.apply(result, GG.flatten.apply(null, element));
    } else {
      result.push(element);
    }
  }
  return result;
};

/**
 * maps each element in the array or object to the output of a function
 *
 * @param {Array|Object} array to map.
 * @param {Function} callback the function that maps a given element to the
 * returned value.
 * @return {Array|Object} the mapped array/object.
 */
GG.map = function(array, callback) {
  if (goog.isArrayLike(array)) {
    return goog.array.map(/** @type {goog.array.ArrayLike} */(array),
        callback);
  } else {
    return goog.object.map(array, callback);
  }
};


/**
 * works a bit different from jquery. Arrays are given back without square
 * brackets and objects are put in with square brackets. It's an unsafe
 * recursion so don't use back references - only meant for a data object
 *
 * myObject = {
 *   a = {
 *     one: 1,
 *     two: 2,
 *     three: 3
 *   },
 *   b: [1,2,3]
 * };
 *
 * G.param(myObject) // b=1&b=2&b=3&a%5Bone%5D=1&a%5Btwo%5D=2&a%5Bthree%5D=3
 *
 * @param {Object} obj to change in to a parameter string.
 * @return {string} the query string.
 */
GG.param = function(obj) {
  var myObj = goog.object.clone(obj);
  var check = function(val, key) {
    if (!goog.isArray(val) && goog.isObject(val)) {
      goog.object.forEach(val, function(val2, key2) {
        myObj[key + '[' + key2 + ']'] = val2;
      });
      delete myObj[key];
      return true;
    }
    return false;
  };
  var flag = false;
  while (flag) {
    flag = goog.object.some(myObj, check);
  }
  return goog.Uri.QueryData.createFromMap(myObj).toString();
};


/**
 * Returns a new array that is the result of joining the arguments.  If arrays
 * are passed then their items are added, however, if non-arrays are passed they
 * will be added to the return array as is.
 *
 * Note that ArrayLike objects will be added as is, rather than having their
 * items added.
 *
 * goog.array.concat([1, 2], [3, 4]) -> [1, 2, 3, 4]
 * goog.array.concat(0, [1, 2]) -> [0, 1, 2]
 * goog.array.concat([1, 2], null) -> [1, 2, null]
 *
 * There is bug in all current versions of IE (6, 7 and 8) where arrays created
 * in an iframe become corrupted soon (not immediately) after the iframe is
 * destroyed. This is common if loading data via goog.net.IframeIo, for example.
 * This corruption only affects the concat method which will start throwing
 * Catastrophic Errors (#-2147418113).
 *
 * See http://endoflow.com/scratch/corrupted-arrays.html for a test case.
 *
 * Internally goog.array should use this, so that all methods will continue to
 * work on these broken array objects.
 *
 * @param {...*} var_args Items to concatenate.  Arrays will have each item
 *     added, while primitives and objects will be added as is.
 * @return {!Array} The new resultant array.
 */
GG.merge = goog.array.concat;


/**
 * Parses a JSON string and returns the result. This throws an exception if
 * the string is an invalid JSON string.
 *
 * Note that this is very slow on large strings. If you trust the source of
 * the string then you should use unsafeParse instead.
 *
 * @param {*} s The JSON string to parse.
 * @return {Object} The object generated from the JSON string.
 */
GG.parseJSON = goog.json.parse;


/**
 * Partially applies this function to a particular 'this object' and zero or
 * more arguments. The result is a new function with some arguments of the first
 * function pre-filled and the value of |this| 'pre-specified'.<br><br>
 *
 * Remaining arguments specified at call-time are appended to the pre-
 * specified ones.<br><br>
 *
 * Also see: {@link #partial}.<br><br>
 *
 * Usage:
 * <pre>var barMethBound = bind(myFunction, myObj, 'arg1', 'arg2');
 * barMethBound('arg3', 'arg4');</pre>
 *
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which |this| should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to the function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @suppress {deprecated} See above.
 */
GG.proxy = goog.bind;


/**
 * Trims white spaces to the left and right of a string.
 * @param {string} str The string to trim.
 * @return {string} A trimmed copy of {@code str}.
 */
GG.trim = goog.string.trim;


/**
 * Removes all duplicates from an array (retaining only the first
 * occurrence of each array element).  This function modifies the
 * array in place and doesn't change the order of the non-duplicate items.
 *
 * For objects, duplicates are identified as having the same unique ID as
 * defined by {@link goog.getUid}.
 *
 * Runtime: N,
 * Worstcase space: 2N (no dupes)
 *
 * @param {goog.array.ArrayLike} arr The array from which to remove duplicates.
 * @param {Array=} opt_rv An optional array in which to return the results,
 *     instead of performing the removal inplace.  If specified, the original
 *     array will remain unchanged.
 */
GG.unique = goog.array.removeDuplicates;


/**
 * Null function used for default values of callbacks, etc.
 * @return {void} Nothing.
 */
GG.noop = goog.nullFunction;


// Array Functions
/**
 * @param {Function} fn function to apply.
 * @param {Object=} opt_handler to bind 'this' to.
 * @return {G} the G object.
 */
G.prototype.each = function(fn, opt_handler) {
  goog.array.forEach(/** @type {goog.array.ArrayLike} */(this),
      function(el, index) {
        goog.bind(fn, opt_handler || el)(el, index);
      });
  return this;
};


/**
 * @param {Function=} opt_fn comparator should take in two elements and
 * return -1, 0 or 1.
 * @param {Object=} opt_handler to bind 'this' to
 * add on sort from array prototype.
 * @return {G} the sorted G object.
 */
G.prototype.sort = function(opt_fn, opt_handler) {
  goog.array.ARRAY_PROTOTYPE_.sort.call(this,
      goog.bind(opt_fn || goog.array.defaultCompare, opt_handler || this));
  return this;
};


/**
 * @return {G} the sorted G object.
 */
G.prototype.reverse = function() {
  goog.array.ARRAY_PROTOTYPE_.reverse.call(this);
  return this;
};


/**
 * @param {Function|string} fn function return true to keep element.
 * @param {Object=} opt_handler to bind 'this' to.
 * @param {boolean=} opt_not whther to inverse the results.
 * @return {G} the G object.
 */
G.prototype.filter = function(fn, opt_handler, opt_not) {

  // handles some css filter strings
  if (goog.isString(fn)) {
    var select = fn;
    var length = this.size();
    fn = {
      ':odd': function(val, ind) {
        return ind % 2 === 1;
      },
      ':even': function(val, ind) {
        return ind % 2 === 0;
      },
      ':first': function(val, ind) {
        return ind === 0;
      },
      ':last': function(val, ind) {
        return ind === this.length - 1;
      }
    }[select];
    opt_handler = this;
  }

  // filters based on handler and whether opt_not is used
  return G(goog.array.filter(/** @type {goog.array.ArrayLike} */(this),
      function(el, ind) {
        return Boolean(opt_not) != Boolean(goog.bind(
            /** @type {Function} */(fn), opt_handler || this)(el, ind));
      }));
};


/**
 * @param {Function|string} fn to  - return true to keep element.
 * @param {Object=} opt_handler to bind 'this' to.
 * @return {G} the G object.
 */
G.prototype.not = function(fn, opt_handler) {
  return this.filter(fn, opt_handler, true);
};


/**
 * @param {Function} fn function to apply.
 * @param {Object=} opt_handler to bind 'this' to.
 * @return {G} the G object.
 */
G.prototype.map = function(fn, opt_handler) {
  return G(goog.array.map(/** @type {goog.array.ArrayLike} */(this),
      fn, opt_handler));
};


/**
 * @param {*} obj to test the array for.
 * @return {boolean} true if it is in G.
 */
G.prototype.contains = function(obj) {
  return goog.array.contains(/** @type {goog.array.ArrayLike} */(this), obj);
};


/**
 * @param {number|Function} ind index ro get item from, can be negative to
 * look from the back or a function that should take an element and return
 * true if it is the correct element to return.
 * @param {Object=} opt_handler to bind 'this' to.
 * @return {*} the element.
 */
G.prototype.get = function(ind, opt_handler) {
  if (goog.isFunction(ind))
    return goog.array.find(/** @type {goog.array.ArrayLike} */(this),
        ind, opt_handler);
  if (ind < 0)
    ind = this.length + ind;
  return this[ind || 0];
};


/**
 * @return {*} the first element.
 */
G.prototype.first = function() {
  return this.get(0);
};


/**
 * @return {*} the last element.
 */
G.prototype.last = function() {
  return this.get(-1);
};


/**
 * @return {Array} a plain array.
 */
G.prototype.toArray = function() {
  var arr = [];
  this.each(function(val) {arr.push(val);});
  return arr;
};


/**
 * @param {number} index slice the array to one element at index.
 * @return {G} the G object.
 */
G.prototype.eq = function(index) {
  return G(this.get(index));
};


/**
 * @return {number} the length of G.
 */
G.prototype.size = function() {
  return this.length;
};


/**
 * @param {*} arr element to add to the array.
 * @return {G} the G object.
 */
G.prototype.add = function(arr) {
  var array = G(arr);
  var length = array.length;
  var alength = this.length;
  for (var i = 0; i < length; i++) {
    this[i + alength] = array[i];
  }
  this.length = length + alength;
  return this;
};


/**
 * @param {*} arr element to remove from the array.
 * @return {G} the G object.
 */
G.prototype.remove = function(arr) {
  if (goog.isArrayLike(arr))
    return G(arr).each(function(el) {this.remove(el);}, this);
  var array = this.toArray();
  goog.array.remove(array, arr);
  return G(array);
};


// DOM functions
/**
 * @param {Object|string} style name of style to get or set.
 * @param {string=} opt_val value of css style.
 * @return {G|string} computed style if no val given.
 */
G.prototype.css = function(style, opt_val) {
  if (goog.isString(style) && !goog.isDef(opt_val)) {
    if (goog.userAgent.IE)
      return this[0].currentStyle &&
          this[0].currentStyle[goog.string.toCamelCase(style)];
    return goog.style.getComputedStyle(this[0], style);
  }
  this.each(function(el) {
    goog.style.setStyle(el, style, opt_val);
  });
  return this;
};


/**
 * @param {string=} opt_input number of pixels or css string.
 * @return {G|number} number of pixels if no input.
 */
G.prototype.top = function(opt_input) {
  if (goog.isDef(opt_input)) {
    if (goog.isNumber(opt_input))
      opt_input += 'px';
    this.each(function(el) {el.style.top = opt_input;});
    return this;
  }
  return goog.style.getBounds(/** @type {Element} */(this.get(0))).top;
};


/**
 * the coords of the first element to the page.
 *
 * @return {goog.math.Rect} the top, left, width and height
 */
G.prototype.position = function() {
  return goog.style.getBounds(this[0]);
};


/**
 * the offset from the offset parent or a passed in element
 *
 * @param {G|Element=} opt_input the element to get the offset from.
 * @return {{top: number, left: number}} coordinates top & left
 */
G.prototype.offset = function(opt_input) {
  var ans;
  if (!opt_input)
    ans = goog.style.getPosition(this[0]);
  else
    ans = goog.style.getRelativePosition(this[0], G(opt_input)[0]);
  return {
    top: ans.y,
    left: ans.x
  };
};


/**
 * @param {number|string=} opt_input number of pixels or css string.
 * @return {G|number} number of pixels if no input.
 */
G.prototype.left = function(opt_input) {
  if (goog.isDef(opt_input)) {
    if (goog.isNumber(opt_input))
      opt_input += 'px';
    this.each(function(el) {el.style.left = opt_input;});
    return this;
  }
  return goog.style.getBounds(/** @type {Element} */(this.get(0))).left;
};


/**
 * @param {number|string=} opt_input number of pixels or css string.
 * @return {G|number} width in pixels if no input.
 */
G.prototype.width = function(opt_input) {
  if (goog.isDef(opt_input)) {
    if (goog.isNumber(opt_input))
      opt_input += 'px';
    this.each(function(el) {el.style.width = opt_input;});
    return this;
  }
  return goog.style.getBounds(/** @type {Element} */(this.get(0))).width;
};


/**
 * @param {Element|Node|string|Function=} opt_selector to test against.
 * @return {number} the index in the array.
 */
G.prototype.index = function(opt_selector) {
  return goog.array.findIndex(this.toArray(), function(el) {
    if (opt_selector.nodeType)
      return el == opt_selector;
    return GG.matches(el, /** @type {Function|string} */(opt_selector));
  });
};


/**
 * @param {number|string=} opt_input number of pixels or css string.
 * @return {G|number} height in pixels if no input.
 */
G.prototype.height = function(opt_input) {
  if (goog.isDef(opt_input)) {
    if (goog.isNumber(opt_input))
      opt_input += 'px';
    this.each(function(el) {
      el.style.height = opt_input;
    });
    return this;
  }
  return goog.style.getBounds(/** @type {Element} */(this.get(0))).height;
};


/**
 * @param {string} selector string to find elements under each element in G.
 * @return {G} the G object with new found elements.
 */
G.prototype.find = function(selector) {
  var ret = [];
  this.each(function(el) {
    goog.array.forEach(GG.elsBySelector(selector, el) || [],
        function(ele) {
          goog.array.insert(ret, ele);
        }
    );
  });
  return G(ret);
};


/**
 * @param {Function|boolean=} opt_bool to change elements visible status.
 * @return {G|boolean} if no boolean then whether the first item is visible.
 */
G.prototype.visible = function(opt_bool) {
  if (!goog.isDef(opt_bool))
    return goog.style.isElementShown(this[0]);
  if(goog.isBoolean(opt_bool)) {
    var bool = opt_bool;
    opt_bool = function() {return bool;};
  }
  var show = /** @type {Function} */(opt_bool);
  return this.each(function(el) {goog.style.showElement(el, show(el));});
};


/**
 * @return {G} the G object.
 */
G.prototype.show = function() {
  return /** @type {G} */(this.visible(true));
};


/**
 * @return {G} the G object.
 */
G.prototype.hide = function() {
  return /** @type {G} */(this.visible(false));
};


/**
 * @param {string|Object.<string, string>} key or object of keys and values.
 * @param {string=} opt_val string to set value if key is string.
 * @return {G|string} the G object or string if no val given.
 */
G.prototype.attr = function(key, opt_val) {
  if (goog.isString(key) && !goog.isDef(opt_val)) {
    return this[0].getAttribute(key);
  }
  if (goog.isString(key)) {
    var temp = {};
    goog.object.set(temp, key, opt_val);
    key = temp;
  }
  if (goog.isObject(key)) {
    this.each(function(el) {
      goog.dom.setProperties(el, /** @type {Object} */(key));
    });
  }
  return this;
};


/**
 * @param {string=} opt_key to associate data with.
 * @param {string=} opt_val value of the key.
 * @return {G|string} the value if not opt_val given.
 */
G.prototype.data = function(opt_key, opt_val) {
  return this.attr('data-' + (opt_key || 'id'), opt_val);
};


/**
 * @return {G} the G object with all nodes removed from DOM.
 */
G.prototype.removeNode = function() {
  return this.each(function(el) {
    goog.dom.removeNode(el);
  });
};


/**
 * @param {Element|Node|G} node to replace first node with.
 * @return {G} the G object with first node replaces.
 */
G.prototype.replace = function(node) {
  if(goog.isArrayLike(node))
    node = node[0];
  goog.dom.replaceNode(node, this[0]);
  return G(node);
};


/**
 * @param {string=} opt_val the value to set.
 * @return {G|string} string that is the value if no val defined otherwise G.
 */
G.prototype.val = function(opt_val) {
  if (goog.isDef(opt_val))
    return this.each(function(el) {el.value = opt_val;});
  return this[0].value;
};


/**
 * @return {G} the G object with all children under elements removed.
 */
G.prototype.empty = function() {
  return this.each(goog.dom.removeChildren);
};


/**
 * @return {G} the G object of next siblings.
 */
G.prototype.next = function() {
  return this.map(function(el) {return el.nextSibling;});
};


/**
 * @return {G} the G object of previous siblings.
 */
G.prototype.prev = function() {
  return this.map(function(el) {return el.previousSibling;});
};


/**
 * returns all the children optionally filtered by a selector
 *
 * @param {Function|string=} opt_selector selector string or function to
 * to filter on.
 * @return {G} the children.
 */
G.prototype.children = function(opt_selector) {
  var arr = [];
  this.each(function(el) {
    arr = goog.array.concat(arr, [].slice.call(goog.dom.getChildren(el)));
  });
  GG.unique(arr);
  if (goog.isDef(opt_selector))
    return G(arr).filter(function(el) {
      return GG.matches(el, opt_selector);
    });
  return G(arr);
};


/**
 * returns the unique parent nodes
 * 
 * @return {G} the parents
 */
G.prototype.parent = function() {
  var arr = this.map(function(el) {return el.parentNode}).toArray();
  GG.unique(arr);
  return G(GG.grep(arr, function(el) {return el;}));
};


/**
 * removes the node from the document
 *
 * @param {Function|string=} opt_selector to filter by.
 * @return {G} the object.
 */
G.prototype.detach = function(opt_selector) {
  this.filter(function(el) {
    return GG.matches(el, opt_selector);
  }).each(function(el) {
    goog.dom.removeNode(el);
  });
  return this;
};


/**
 * @param {Function|string} className to add to all elements.
 * @return {G} the G object.
 */
G.prototype.addClass = function(className) {
  if (goog.isString(className)) {
    var str = className;
    className = function() {return str;};
  }
  var fn = /** @type {Function} */(className);
  return this.each(function(el) {goog.dom.classes.add(el, fn(el));});
};


/**
 * @param {Function|string} className to remove from all elements.
 * @return {G} the G object.
 */
G.prototype.removeClass = function(className) {
  if (goog.isString(className)) {
    var str = className;
    className = function() {return str;};
  }
  var fn = /** @type {Function} */(className);
  return this.each(function(el) {goog.dom.classes.remove(el, fn(el));});
};


/**
 * @param {string} className the class to toggle.
 * @param {Function|boolean=} opt_on if defined the toggles on or off.
 * @return {G} the G object.
 */
G.prototype.toggleClass = function(className, opt_on) {
  if (goog.isDef(opt_on) && !goog.isFunction(opt_on)) {
    var on = opt_on;
    opt_on = function(el) {return on;};
  }
  var enable = /** @type {Function} */(opt_on);
  return this.each(function(el) {
    if (goog.isDef(opt_on)) {
      goog.dom.classes.enable(el, className, enable(el));
    } else {
      goog.dom.classes.toggle(el, className);
    }
  });
};


/**
 * @param {Function|string|Element|Node=} opt_selector to test.
 * @return {G} the reduced set.
 */
G.prototype.has = function(opt_selector) {
  if (!opt_selector)
    return this;
  if (opt_selector.nodeType) {
    return this.filter(function(el) {
      return goog.dom.contains(el,/** @type {Node} */(opt_selector));
    });
  }
  return this.filter(function(el) {
    return GG.matches(el, /** @type {string} */(opt_selector));
  });
};


/**
 * @param {string} className to test for.
 * @return {boolean} true if class is on first element.
 */
G.prototype.hasClass = function(className) {
  return goog.dom.classes.has(this[0], className);
};


/**
 * @param {...goog.dom.Appendable} var_args (s) things to append.
 * @return {G} the G object.
 */
G.prototype.append = function(var_args) {
  var args = G(arguments);
  this.each(function(el) {
    if(!args.size())
      return this;
    if(this.size() > 1)
      args = args.clone(true);
    var doc = document.createDocumentFragment();
    goog.dom.append.apply(this, GG.merge([doc], args.toArray()));
    goog.dom.append(el, doc);
  }, this);
  return this;
};


/**
 * @param {G|string|Element|Node} input to append to.
 * @return {G} the G object.
 */
G.prototype.appendTo = function(input) {
  var append = G(input);
  var doc = document.createDocumentFragment();
  this.each(function(el) {
    goog.dom.append(/** @type {!Node} */(doc), el);
  });
  goog.dom.append(/** @type {!Node} */(append[0]), doc);
  return this;
};


/**
 * @param {G|string|Element|Node} input to put after the element.
 * @return {G} the G object.
 */
G.prototype.after = function(input) {
  if(!this.size())
    return this;
  input = G(input);
  var doc = document.createDocumentFragment();
  input.each(function(el) {
    goog.dom.append(/** @type {!Node} */(doc), el);
  });
  if(this.size() == 1) {
    goog.dom.insertSiblingAfter(doc, this[0]);
  } else {
    this.each(function(el) {
      goog.dom.insertSiblingAfter(doc.cloneNode(true), el);
    });
  }
  return this;
}


/**
 * @param {G|string|Element|Node} input to put all elements after.
 * @return {G} the G object.
 */
G.prototype.insertAfter = function(input) {
  G(input).after(this);
  return this;
}


/**
 * @param {G|string|Element|Node} input to put before the element.
 * @return {G} the G object.
 */
G.prototype.before = function(input) {
  if(!this.size())
    return this;
  input = G(input);
  var doc = document.createDocumentFragment();
  input.each(function(el) {
    goog.dom.append(/** @type {!Node} */(doc), el);
  });
  if(this.size() == 1) {
    goog.dom.insertSiblingBefore(doc, this[0]);
  } else {
    this.each(function(el) {
      goog.dom.insertSiblingBefore(doc.cloneNode(true), el);
    });
  }
  return this;
}


/**
 * @param {G|string|Element|Node} input to put all elements before.
 * @return {G} the G object.
 */
G.prototype.insertBefore = function(input) {
  G(input).before(this);
  return this;
}


/**
 * @param {boolean=} opt_deep for deep clone.
 * @return {G} the G object of cloned nodes.
 */
G.prototype.clone = function(opt_deep) {
  return this.map(function(el) {
    return el.cloneNode(opt_deep);
  });
};


/**
 * @param {G|goog.dom.Appendable|Function|string=} opt_input either a node that
 * will be appended, a function that returns appendable nodes or text to set
 * innerHTML.
 * @return {G|string} innerHTML if no arguments, G otherwise.
 */
G.prototype.html = function(opt_input) {
  if (!opt_input)
    return this.get(0).innerHTML;
  if (goog.isFunction(opt_input))
    this.each(function(el) {goog.dom.append(/** @type {!Node} */(el),
          /** @type {Function} */(opt_input)(el));});
  if (opt_input.nodeType) {
    this.empty();
    this.each(function(el) {goog.dom.append(/** @type {!Node} */(el),
          opt_input.cloneNode(true));});
  } else if (goog.isString(opt_input)) {
    this.each(function(el) {el.innerHTML = opt_input;});
  } else {
    var html = $(opt_input).outerHTML();
    this.each(function(el) {el.innerHTML = html;});
  }
  return this;
};


/**
 * gives the outerHTML for a node or list of nodes.
 * @return {string} the outerHTML.
 */
G.prototype.outerHTML = function() {
  var outerHTML = function(node) {
    return node.outerHTML || (
        function(n){
          var div = document.createElement('div'), h;
          div.appendChild(n.cloneNode(true));
          h = div.innerHTML;
          div = null;
          return h;
        })(node);
  }
  return this.map(outerHTML).toArray().join('');
}


/**
 * @param {Function|string=} opt_input element to copy text of or
 * text to change to or function that is passed the element and returns the
 * text.
 * @return {G|string} the text if no argument is given otherwise G.
 */
G.prototype.text = function(opt_input) {
  if (!goog.isDef(opt_input))
    return goog.dom.getRawTextContent(/** @type {Node} */(this.get(0)));
  if (!goog.isFunction(opt_input)) {
    var str = opt_input;
    opt_input = function() {return str;};
  }
  var fn = /** @type {Function} */(opt_input);
  return this.each(function(el) {goog.dom.setTextContent(el, fn(el));});
};


// Events


/**
 * change to match jquery. Optional selector and data. Selector must be
 * a string and data must be an object. should be in the form:
 *
 * .on(eventType[, selector][, data], fn(event)[, this][, eventObject])
 *
 *
 * @param {string} eventType the event name.
 * @param {string|Object|Function} selector to match to element.
 * @param {Function|Object=} opt_data data to in event.data.
 * @param {Function|Object|goog.events.EventHandler=} opt_fn function to
 * apply.
 * @param {Object|goog.events.EventHandler|boolean=} opt_handler to bind 'this'
 * to will default to the element.
 * @param {goog.events.EventHandler|boolean=} opt_eventObject the event handler
 * to use defaults to goog.events, for goog.ui.component can pass in
 * this.getHandler().
 * @param {boolean=} opt_capture should listen in the capture phase.
 * @return {G} uids you can pass to G.off.
 */
G.prototype.on = function(eventType, selector, opt_data, opt_fn,
    opt_handler, opt_eventObject, opt_capture) {

  // fix how the data is passed in
  if (goog.isFunction(selector)) {
    opt_capture = /** @type {boolean} */(opt_handler);
    opt_eventObject = /** @type {goog.events.EventHandler} */(opt_fn);
    opt_handler = opt_data;
    opt_fn = selector;
    selector = null;
    opt_data = undefined;
  } else if (goog.isFunction(opt_data)) {
    opt_capture = /** @type {boolean} */(opt_eventObject);
    opt_handler = opt_fn;
    opt_fn = opt_data;
    opt_data = undefined;
    if (goog.isObject(selector)) {
      opt_data = /** @type {Object} */(selector);
      selector = null;
    }
  }

  var listener = function(e) {
    if (!e.data) {
      e.data = opt_data;
    }
    if (goog.isString(selector) &&
        (!e.target.nodeType || !GG.matches(e.target, selector))) {
      return;
    }
    goog.bind(/** @type {Function} */(opt_fn), this)(e);
  };
  listener.fn = opt_fn;
  // put data on e and check against selector whether to run
  return this.map(function(el) {
    if (opt_eventObject) {
      var ret = opt_eventObject.listen(el, eventType, listener,
          !!opt_capture, (opt_handler || el));
      return ret.keys_[ret.keys_.length - 1];
    }
    return goog.events.listen(el, eventType, listener,
        !!opt_capture, (opt_handler || el));
  });
};


/**
 * @param {string} eventType the event name.
 * @param {Function} fn function to apply.
 * @param {Object=} opt_handler to bind 'this' to.
 * @param {goog.events.EventHandler=} opt_eventObject the event handler to use
 * defaults to goog.events.
 * @param {boolean=} opt_capture should listen in the capture phase.
 * @return {G} uids you can pass to G.off.
 */
G.prototype.bind = G.prototype.on;


/**
 * @param {string=} opt_eventType the event name.
 * @param {Function=} opt_fn function to remove.
 * @param {Object=} opt_handler 'this' was bound to.
 * @param {goog.events.EventHandler=} opt_eventObject the event handler to use
 * defaults to goog.events.
 * @return {G} the G object.
 */
G.prototype.off = function(opt_eventType, opt_fn, opt_handler, opt_eventObject) {
  if (!goog.isDef(opt_eventType)) {
    GG.off(this);
    return this;
  }
  return this.each(function(el) {
    var listenerArray = goog.events.getListeners(
        el, opt_eventType || '', false);
    if (!listenerArray) {
      return;
    }
    for (var i = 0; i < listenerArray.length; i++) {
      if (listenerArray[i].listener.fn == opt_fn &&
          listenerArray[i].capture === false &&
          listenerArray[i].handler == (opt_handler || el)) {
        return (opt_eventObject || goog.events)
            .unlistenByKey(listenerArray[i].key);
      }
    }
  });
};


/**
 * same as goog.events.listen
 */
GG.on = goog.events.listen;


/**
 * you can use this with the values from .on() to turn off events
 *
 * @param {G|Array|number} keys of listers to turn off.
 * @return {boolean} whether any listeners were turned off.
 */
GG.off = function(keys) {
  var removed = false;
  G(GG.flatten(keys)).each(function(key) {
    removed = goog.events.unlistenByKey(key) || removed;
  });
  return removed;
};


/**
 * @param {string} eventType the event name.
 * @param {Function} fn function to remove.
 * @param {Object=} opt_handler 'this' was bound to.
 * @param {goog.events.EventHandler=} opt_eventObject the event handler to use
 * defaults to goog.events.
 * @return {G} the G object.
 */
G.prototype.unbind = G.prototype.off;


/**
 * @param {Function=} opt_fn function to apply.
 * @param {Object=} opt_handler to bind 'this' to.
 * @param {goog.events.EventHandler=} opt_eventObject the event handler to use
 * defaults to goog.events.
 * @return {G} uids you can pass to G.off.
 */
G.prototype.click = function(opt_fn, opt_handler, opt_eventObject) {
  if (!opt_fn) {
    this.trigger(goog.events.EventType.CLICK);
    return this;
  }
  return this.on(goog.events.EventType.CLICK, opt_fn, opt_handler,
      opt_eventObject);
};


/**
 * @param {Function=} opt_fn function to apply.
 * @param {Object=} opt_handler to bind 'this' to.
 * @param {goog.events.EventHandler=} opt_eventObject the event handler to use
 * defaults to goog.events.
 * @return {G} uids you can pass to G.off.
 */
G.prototype.change = function(opt_fn, opt_handler, opt_eventObject) {
  if (!opt_fn) {
    this.trigger(goog.events.EventType.CHANGE);
    return this;
  }
  return this.on(goog.events.EventType.CHANGE, opt_fn, opt_handler,
      opt_eventObject);
};


/**
 * @param {Function=} opt_fn function to apply.
 * @param {Object=} opt_handler to bind 'this' to.
 * @param {goog.events.EventHandler=} opt_eventObject the event handler to
 * use defaults to goog.events.
 * @return {G} uids you can pass to G.off.
 */
G.prototype.focus = function(opt_fn, opt_handler, opt_eventObject) {
  if(!opt_fn) {
    this[0].focus();
    return this;
  }
  return goog.userAgent.IE ?
      this.on(goog.events.EventType.FOCUSIN, opt_fn, opt_handler,
          opt_eventObject) :
      this.on(goog.events.EventType.FOCUS, opt_fn, opt_handler,
          opt_eventObject, true);
};


/**
 * @param {Function=} opt_fn function to apply.
 * @param {Object=} opt_handler to bind 'this' to.
 * @param {goog.events.EventHandler=} opt_eventObject the event handler to use
 * defaults to goog.events.
 * @return {G} uids you can pass to G.off.
 */
G.prototype.blur = function(opt_fn, opt_handler, opt_eventObject) {
  if(!opt_fn) {
    this[0].blur();
    return this;
  }
  return goog.userAgent.IE ?
      this.on(goog.events.EventType.FOCUSOUT, opt_fn, opt_handler,
          opt_eventObject) :
      this.on(goog.events.EventType.BLUR, opt_fn, opt_handler,
          opt_eventObject, true);
};


/**
 * @param {Function} opt_fn function to apply.
 * @param {Object=} opt_handler to bind 'this' to.
 * @param {goog.events.EventHandler=} opt_eventObject the event handler to use
 * defaults to goog.events.
 * @return {G} uids you can pass to G.off.
 */
G.prototype.mouseup = function(opt_fn, opt_handler, opt_eventObject) {
  if (!opt_fn) {
    this.trigger(goog.events.EventType.MOUSEUP);
    return this;
  }
  return this.on(goog.events.EventType.MOUSEUP, opt_fn, opt_handler,
      opt_eventObject);
};


/**
 * @param {Function} opt_fn function to apply.
 * @param {Object=} opt_handler to bind 'this' to.
 * @param {goog.events.EventHandler=} opt_eventObject the event handler to use
 * defaults to goog.events.
 * @return {G} uids you can pass to G.off.
 */
G.prototype.mousedown = function(opt_fn, opt_handler, opt_eventObject) {
  if (!opt_fn) {
    this.trigger(goog.events.EventType.MOUSEDOWN);
    return this;
  }
  return this.on(goog.events.EventType.MOUSEDOWN, opt_fn, opt_handler,
      opt_eventObject);
};


/**
 * @param {Function} opt_fn function to apply.
 * @param {Object=} opt_handler to bind 'this' to.
 * @param {goog.events.EventHandler=} opt_eventObject the event handler to use
 * defaults to goog.events.
 * @return {G} uids you can pass to G.off.
 */
G.prototype.mouseover = function(opt_fn, opt_handler, opt_eventObject) {
  if (!opt_fn) {
    this.trigger(goog.events.EventType.MOUSEOVER);
    return this;
  }
  return this.on(goog.events.EventType.MOUSEOVER, opt_fn, opt_handler,
      opt_eventObject);
};


/**
 * @param {Function} opt_fn function to apply.
 * @param {Object=} opt_handler to bind 'this' to.
 * @param {goog.events.EventHandler=} opt_eventObject the event handler to use
 * defaults to goog.events.
 * @return {G} uids you can pass to G.off.
 */
G.prototype.mouseout = function(opt_fn, opt_handler, opt_eventObject) {
  if (!opt_fn) {
    this.trigger(goog.events.EventType.MOUSEOUT);
    return this;
  }
  return this.on(goog.events.EventType.MOUSEOUT, opt_fn, opt_handler,
      opt_eventObject);
};


/**
 * @param {string} type of event to fire
 * @param {Object=} opt_event the event object (you must init)
 */
G.prototype.trigger = function(type, opt_event) {
  this.each(function(el) {
    if(!opt_event) {
      opt_event = document.createEvent('UIEvents');
      opt_event.initUIEvent(type, true, true, window, 1);
    }
    el.dispatchEvent(opt_event);
  })
}

