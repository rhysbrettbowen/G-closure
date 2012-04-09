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
  if(input.constructor == G)
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
 * takes a string like 'tagName[ .className]', '.className' or '#elementId'
 * mod is the element to search from
 *
 * @param {string} input selector string.
 * @param {Element|Node=} opt_mod element or node to look under.
 * @return {goog.array.ArrayLike} nodelist of found elements.
 */
G.elsBySelector = function(input, opt_mod) {
  opt_mod = opt_mod || document;
  if (opt_mod.querySelectorAll)
    return opt_mod.querySelectorAll(input);
  if (input.charAt(0) == '.') {
    return (goog.dom.getElementsByClass(input.substring(1),
        /** @type {Element} */(opt_mod)) || []);
  }
  if (input.charAt(0) == '#') {
    return [goog.dom.getElement(input)];
  }
  return goog.dom.getElementsByTagNameAndClass(input.replace(/\s.*/, ''),
      input.replace(/.*\./, '') || null, /** @type {Element} */(opt_mod));
};

G.matches = function(element, selector) {
  if(!goog.isDef(selector))
    return true;
  if(goog.isFunction(selector)) {
    return selector(element);
  }
  var matchesSelector = element['webkitMatchesSelector'] ||
      element['mozMatchesSelector'] ||
      element['oMatchesSelector'] ||
      element['matchesSelector'];
  if (matchesSelector)
    return matchesSelector.call(element, selector);
  var parent = element.parentNode;
  var els = G.elsBySelector(selector, parent);
  return goog.array.contains(els, element);
};

// Utility functions

/**
 * Extends an object with another object.
 * This operates 'in-place'; it does not create a new Object.
 *
 * @param {Object} obj  The object to modify.
 * @param {...Object} var_args The objects from which values will be copied.
 * @return {Object}
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


G.data = function(element, key, value) {
  return G(element).data(key, value);
};

G.each = function(collection, callback) {
  return G(collection).each(callback);
};

G.grep = function(array, fn, opt_invert) {
  var func = fn;
  if (opt_invert)
    func = function(el, ind) {
      return !fn(el, ind);
    };
  return goog.array.filter(array, func);
};

G.inArray = function (value, array, opt_index) {
  return goog.array.indexOf(array, value, opt_index);
};

G.map = function(array, callback) {
  if(goog.isArrayLike(array)) {
    return goog.array.map(array, callback);
  } else {
    return goog.object.map(array, callback);
  }
};

G.merge = goog.array.concat;

G.parseJSON = goog.json.parse;

G.proxy = goog.bind;

G.trim = goog.string.trim;

G.unique = goog.array.removeDuplicates;

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
 * @param {Function|string} fn to filter - return true to keep element.
 * @param {Object=} opt_handler to bind 'this' to.
 * @return {G} the G object.
 */
G.prototype.grep = function(fn, opt_handler) {
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
      fn, opt_handler));
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
  for(var i = 0; i < length; i++) {
    this[i + alength] = array[i];
  }
  this.length = length+alength;
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


G.prototype.children = function(selector) {
  var arr = [];
  this.each(function(el) {
    goog.array.concat(arr, goog.dom.getChildren(el));
  });
  G.unique(arr);
  if(selector)
    return G(arr).grep(function(el) {
      return G.matches(el, selector);
    });
  return G(arr);
};


G.prototype.detach = function() {
  return this.each(function(el) {
    goog.dom.removeNode(el);
  });
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


G.prototype.appendTo = function(input) {
  var append = G(input);
  this.each(function(el) {goog.dom.append(/** @type {!Node} */(append[0]),
      el);});
  return this;
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


