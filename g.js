/*
 * Version 0.5
 */

//     (c) 2012 Rhys Brett-Bowen, Catch.com
//     G-object may be freely distributed under the MIT license.
//     For all details and documentation:
//     https://github.com/rhysbrettbowen/G-closure

goog.provide('G');

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
  if (input.constructor == G)
    return /** @type {G} */(input);
  if (goog.isString(opt_mod)) {
    opt_mod = G.elsBySelector(/** @type {string} */(opt_mod))[0];
  }
  if (input.nodeType)
    input = [input];
  else if (goog.isString(input)) {
    if (input.charAt(0) == '<') {
      input = [goog.dom.htmlToDocumentFragment(input)];
    } else {
      input = G.elsBySelector(input, opt_mod);
    }
    if (!input) {
      input = [];
    }
  }
  else if (!input) {
    input = [];
  }
  if (!goog.isArrayLike(input)) {
    input = [input];
  }
  return /** @type {G} */(new G.init(/** @type {{length: number}} */(input)));
};


/** @type {number} */
G.prototype.length = 0;



/**
 * @constructor
 * @extends {G}
 * @param {goog.array.ArrayLike} input array to turn in to G.
 * @return {G} the new G object.
 */
G.init = function(input) {
  for (var i = 0; i < input.length; i++)
    this[i] = input[i];
  this.length = input.length;
  return this;
};
G.init.prototype = G.prototype;


/**
 * The constructor should be G
 */
G.prototype.constructor = G;


/**
 * css filters and their corresponding filter functions
 */
G.cssFilters = {
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
G.elsBySelector = function(input, opt_mod) {
  var ret;
  opt_mod = opt_mod || document;
  if (opt_mod.querySelectorAll) {
    ret = opt_mod.querySelectorAll(input.indexOf(':') >= 0 ?
        input.replace(/\:.*/, '') :
        input);
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
  if (input.indexOf(':') >= 0) {
    return G.grep(ret, G.cssFilters[input.substring(input.indexOf(':') + 1)]);
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
G.matches = function(element, opt_selector) {
  if (!goog.isDef(opt_selector))
    return true;
  if (goog.isFunction(opt_selector)) {
    return opt_selector(element);
  }
  var matchesSelector = element['webkitMatchesSelector'] ||
      element['mozMatchesSelector'] ||
      element['oMatchesSelector'] ||
      element['matchesSelector'];
  if (matchesSelector)
    return matchesSelector.call(element, opt_selector);
  var parent = element.parentNode;
  var els = G.elsBySelector(/** @type {string} */(opt_selector), parent);
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
G.extend = function(obj, var_args) {
  goog.object.extend(obj, var_args);
  return obj;
};


/**
 * Whether a node contains another node.
 * @param {Node} parent The node that should contain the other node.
 * @param {Node} descendant The node to test presence of.
 * @return {boolean} Whether the parent node contains the descendent node.
 */
G.contains = goog.dom.contains;


/**
 * returns the data set on the element
 *
 * @param {Element} element to check for data.
 * @param {string=} opt_key for the data.
 * @param {string=} opt_value the value to set for the key.
 * @return {G|string} the element wrapped in a G.
 */
G.data = function(element, opt_key, opt_value) {
  return G(element).data(opt_key, opt_value);
};


/**
 * runs a function on each element in the collection
 *
 * @param {goog.array.ArrayLike|G|string} collection to run on.
 * @param {Function} callback function to run.
 * @return {G} collection as a G object.
 */
G.each = function(collection, callback) {
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
G.grep = function(array, fn, opt_invert) {
  var func = fn;
  if (opt_invert)
    func = function(el, ind) {
      return !fn(el, ind);
    };
  return goog.array.filter(array, func);
};


/**
 * returns the index of the value in the array
 *
 * @param {Object} value to find.
 * @param {goog.array.ArrayLike} array to look in.
 * @param {number=} opt_index  to look from.
 * @return {number} the index of the value.
 */
G.inArray = function(value, array, opt_index) {
  return goog.array.indexOf(array, value, opt_index);
};


/**
 * maps each element in the array or object to the output of a function
 *
 * @param {Array|Object} array to map.
 * @param {Function} callback the function that maps a given element to the
 * returned value.
 * @return {Array|Object} the mapped array/object.
 */
G.map = function(array, callback) {
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
G.param = function(obj) {
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
  while (goog.object.some(myObj, check)) {}
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
G.merge = goog.array.concat;


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
G.parseJSON = goog.json.parse;


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
G.proxy = goog.bind;


/**
 * Trims white spaces to the left and right of a string.
 * @param {string} str The string to trim.
 * @return {string} A trimmed copy of {@code str}.
 */
G.trim = goog.string.trim;


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
G.unique = goog.array.removeDuplicates;


/**
 * Null function used for default values of callbacks, etc.
 * @return {void} Nothing.
 */
G.noop = goog.nullFunction;


// Array Functions
/**
 * @param {Function} fn function to apply.
 * @param {Object=} opt_handler to bind 'this' to.
 * @return {G} the G object.
 */
G.prototype.each = function(fn, opt_handler) {
  goog.array.forEach(/** @type {goog.array.ArrayLike} */(this),
      function(el) {
        goog.bind(fn, opt_handler || el)(el);
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
 * @param {Function|string} fn to  - return true to keep element.
 * @param {Object=} opt_handler to bind 'this' to.
 * @param {boolean=} opt_not whther to inverse the results.
 * @return {G} the G object.
 */
G.prototype.filter = function(fn, opt_handler, opt_not) {
  if (goog.isString(fn)) {
    var select = fn;
    var length = this.size();
    fn = function(val, ind) {
      if (select == ':odd')
        return ind % 2 === 1;
      if (select == ':even')
        return ind % 2 === 0;
      if (select == ':first')
        return ind === 0;
      if (select == ':last')
        return ind === this.length - 1;
    };
    opt_handler = this;
  }
  return G(goog.array.filter(/** @type {goog.array.ArrayLike} */(this),
      function(el, ind) {
        return opt_not ?
            !/** @type {Function} */(fn)(el, ind) :
            /** @type {Function} */(fn)(el, ind);
      }, opt_handler));
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
  if (goog.isString(style) && !goog.isDef(opt_val))
    return goog.style.getComputedStyle(this[0], style);
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
    return G.matches(el, /** @type {Function|string} */(opt_selector));
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
    this.each(function(el) {el.style.height = opt_input;});
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
    goog.array.forEach(G.elsBySelector(selector, el) || [],
        function(ele) {
          goog.array.insert(ret, ele);
        }
    );
  });
  return G(ret);
};


/**
 * @param {boolean=} opt_bool to change elements visible status.
 * @return {G|boolean} if no boolean then whether the first item is visible.
 */
G.prototype.visible = function(opt_bool) {
  if (!goog.isDef(opt_bool))
    return goog.style.isElementShown(this[0]);
  return this.each(function(el) {goog.style.showElement(el, opt_bool);});
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
 * @param {Element|Node} node to replace first node with.
 * @return {G} the G object with first node replaces.
 */
G.prototype.replace = function(node) {
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
  G.unique(arr);
  if (goog.isDef(opt_selector))
    return G(arr).filter(function(el) {
      return G.matches(el, opt_selector);
    });
  return G(arr);
};


/**
 * removes the node from the document
 *
 * @param {Function|string=} opt_selector to filter by.
 * @return {G} the object.
 */
G.prototype.detach = function(opt_selector) {
  this.filter(function(el) {
    return G.matches(el, opt_selector);
  }).each(function(el) {
    goog.dom.removeNode(el);
  });
  return this;
};


/**
 * @param {string} className to add to all elements.
 * @return {G} the G object.
 */
G.prototype.addClass = function(className) {
  return this.each(function(el) {goog.dom.classes.add(el, className);});
};


/**
 * @param {string} className to remove from all elements.
 * @return {G} the G object.
 */
G.prototype.removeClass = function(className) {
  return this.each(function(el) {goog.dom.classes.remove(el, className);});
};


/**
 * @param {string} className the class to toggle.
 * @param {boolean=} opt_on if defined the toggles on or off.
 * @return {G} the G object.
 */
G.prototype.toggleClass = function(className, opt_on) {
  return this.each(function(el) {
    if (goog.isDef(opt_on)) {
      goog.dom.classes.enable(el, className, opt_on);
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
      return goog.dom.contains(/** @type {Node} */(opt_selector), el);
    });
  }
  return this.filter(function(el) {
    return G.matches(el, /** @type {string} */(opt_selector));
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
 * @param {...goog.dom.Appendable} input (s) things to append.
 * @return {G} the G object.
 */
G.prototype.append = function(input) {
  this.each(function(el) {goog.dom.append(/** @type {!Node} */(el), input);});
  return this;
};


/**
 * @param {G|string|Element|Node} input to append to.
 * @return {G} the G object.
 */
G.prototype.appendTo = function(input) {
  var append = G(input);
  this.each(function(el) {goog.dom.append(/** @type {!Node} */(append[0]),
        el);});
  return this;
};


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
 * @param {goog.dom.Appendable|Function|string=} opt_input either a node that
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
          opt_input.cloneNode);});
  } else
    this.each(function(el) {el.innerHTML = opt_input;});
  return this;
};


/**
 * @param {Element|Node|Function|string=} opt_input element to copy text of or
 * text to change to or function that is passed the element and returns the
 * text.
 * @return {G|string} the text if no argument is given otherwise G.
 */
G.prototype.text = function(opt_input) {
  if (!goog.isDef(opt_input))
    return goog.dom.getRawTextContent(/** @type {Node} */(this.get(0)));
  if (goog.isFunction(opt_input))
    this.each(opt_input);
  else
    this.each(function(el) {goog.dom.setTextContent(el,
        /** @type {string} */(opt_input));});
  return this;
};


// Events
/**
 * @param {string} eventType the event name.
 * @param {Function} fn function to apply.
 * @param {Object=} opt_handler to bind 'this' to.
 * @param {goog.events.EventHandler=} opt_eventObject the event handler to use
 * defaults to goog.events.
 * @return {G} the G object.
 */
G.prototype.on = function(eventType, fn, opt_handler, opt_eventObject) {
  return this.each(function(el) {
    (opt_eventObject || goog.events).listen(el, eventType, fn, false,
        (opt_handler || el));
  });
};


/**
 * @param {string} eventType the event name.
 * @param {Function} fn function to apply.
 * @param {Object=} opt_handler to bind 'this' to.
 * @param {goog.events.EventHandler=} opt_eventObject the event handler to use
 * defaults to goog.events.
 * @return {G} the G object.
 */
G.prototype.bind = G.prototype.on;


/**
 * @param {string} eventType the event name.
 * @param {Function} fn function to remove.
 * @param {Object=} opt_handler 'this' was bound to.
 * @param {goog.events.EventHandler=} opt_eventObject the event handler to use
 * defaults to goog.events.
 * @return {G} the G object.
 */
G.prototype.off = function(eventType, fn, opt_handler, opt_eventObject) {
  return this.each(function(el) {
    (opt_eventObject || goog.events).unlisten(el, eventType, fn, false,
        (opt_handler || el));
  });
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
 * @param {Function} fn function to apply.
 * @param {Object=} opt_handler to bind 'this' to.
 * @param {goog.events.EventHandler=} opt_eventObject the event handler to use
 * defaults to goog.events.
 * @return {G} the G object.
 */
G.prototype.click = function(fn, opt_handler, opt_eventObject) {
  if (!fn) {
    return this.each(function(el) {
      el.dispatchEvent(goog.events.EventType.CLICK);
    });
  }
  return this.on(goog.events.EventType.CLICK, fn, opt_handler,
      opt_eventObject);
};


/**
 * @param {Function} fn function to apply.
 * @param {Object=} opt_handler to bind 'this' to.
 * @param {goog.events.EventHandler=} opt_eventObject the event handler to use
 * defaults to goog.events.
 * @return {G} the G object.
 */
G.prototype.change = function(fn, opt_handler, opt_eventObject) {
  if (!fn) {
    return this.each(function(el) {
      el.dispatchEvent(goog.events.EventType.CHANGE);
    });
  }
  return this.on(goog.events.EventType.CHANGE, fn, opt_handler,
      opt_eventObject);
};


/**
 * @param {Function} fn function to apply.
 * @param {Object=} opt_handler to bind 'this' to.
 * @param {goog.events.EventHandler=} opt_eventObject the event handler to use
 * defaults to goog.events.
 * @return {G} the G object.
 */
G.prototype.focus = function(fn, opt_handler, opt_eventObject) {
  return this.on(goog.events.EventType.FOCUS, fn, opt_handler,
      opt_eventObject);
};


/**
 * @param {Function} fn function to apply.
 * @param {Object=} opt_handler to bind 'this' to.
 * @param {goog.events.EventHandler=} opt_eventObject the event handler to use
 * defaults to goog.events.
 * @return {G} the G object.
 */
G.prototype.blur = function(fn, opt_handler, opt_eventObject) {
  return this.on(goog.events.EventType.BLUR, fn, opt_handler,
      opt_eventObject);
};


/**
 * @param {Function} fn function to apply.
 * @param {Object=} opt_handler to bind 'this' to.
 * @param {goog.events.EventHandler=} opt_eventObject the event handler to use
 * defaults to goog.events.
 * @return {G} the G object.
 */
G.prototype.mouseup = function(fn, opt_handler, opt_eventObject) {
  return this.on(goog.events.EventType.MOUSEUP, fn, opt_handler,
      opt_eventObject);
};


/**
 * @param {Function} fn function to apply.
 * @param {Object=} opt_handler to bind 'this' to.
 * @param {goog.events.EventHandler=} opt_eventObject the event handler to use
 * defaults to goog.events.
 * @return {G} the G object.
 */
G.prototype.mousedown = function(fn, opt_handler, opt_eventObject) {
  return this.on(goog.events.EventType.MOUSEDOWN, fn, opt_handler,
      opt_eventObject);
};


/**
 * @param {Function} fn function to apply.
 * @param {Object=} opt_handler to bind 'this' to.
 * @param {goog.events.EventHandler=} opt_eventObject the event handler to use
 * defaults to goog.events.
 * @return {G} the G object.
 */
G.prototype.mouseover = function(fn, opt_handler, opt_eventObject) {
  return this.on(goog.events.EventType.MOUSEOVER, fn, opt_handler,
      opt_eventObject);
};


/**
 * @param {Function} fn function to apply.
 * @param {Object=} opt_handler to bind 'this' to.
 * @param {goog.events.EventHandler=} opt_eventObject the event handler to use
 * defaults to goog.events.
 * @return {G} the G object.
 */
G.prototype.mouseout = function(fn, opt_handler, opt_eventObject) {
  return this.on(goog.events.EventType.MOUSEOUT, fn, opt_handler,
      opt_eventObject);
};


