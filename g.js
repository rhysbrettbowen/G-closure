/*
 * Version 0.1
 */

goog.provide('G');

goog.require('goog.dom');
goog.require('goog.array');
goog.require('goog.events');


/**
 * @param {string|Element|Node|Array|goog.array.ArrayLike} input
 * @param {string|Element|Node=} mod
 * @return {goog.array.ArrayLike}
 */
G = function(input, mod) {
    if(goog.isString(mod)) {
        mod = G.elsBySelector(/** @type {string} */(mod))[0];
    }
    if(input.nodeType)
        input = G([input]);
    else if(goog.isString(input)) {
        if(input.charAt(0) == '<') {
            input = [goog.dom.htmlToDocumentFragment(input)];
        } else {
            input = G.elsBySelector(input, mod);
        }
        if(!input) {
            input = []
        }
    }
    else if(!input) {
        input = []
    }
    if(goog.isArrayLike(input)) {
        input = goog.array.clone(input);
        input.__proto__ = function(input){return goog.object.clone([].__proto__)};
        goog.object.extend(input.__proto__, G.prototype);
    }
    /** @type {goog.array.ArrayLike} */
    var ret = input;
    return ret;
};

/**
 * takes a string like 'tagName[ .className]', '.className' or '#elementId'
 * mod is the element to search from
 *
 * @param {string} input
 * @param {Element|Node=} mod 
 * @return {Array.<Element|Node>}
 */
G.elsBySelector = function(input, mod) {
    if(input.charAt(0) == '.') {
        return goog.dom.getElementsByClass(input.substring(1), /** @type {Element} */(mod)) || [];
    }
    if(input.charAt(0) == '#') {
        return [goog.dom.getElement(input)];
    }
    return goog.dom.getElementsByTagNameAndClass(input.replace(/\s.*/,''), input.replace(/.*\./,'')||null, /** @type {Element} */(mod));
};


// Array Functions
/**
 * @param {Function} fn
 * @param {Object} handler
 * @return {goog.array.ArrayLike}
 */
G.prototype.each = function(fn, handler) {
        goog.array.forEach(this, fn, handler);
        return this;
};
/**
 * @param {Function} fn
 * @param {Object} handler
 * @return {goog.array.ArrayLike}
 */
G.prototype.filter = function(fn, handler) {
    return G(goog.array.filter(this, fn, handler));
};
/**
 * @param {Function} fn
 * @param {Object} handler
 * @return {goog.array.ArrayLike}
 */
G.prototype.map = function(fn, handler) {
    return G(goog.array.map(this, fn, handler));
};
/**
 * @param {number} in
 * @return {?Object}
 */
G.prototype.get = function(ind) {
    if(ind < 0)
        ind = this.length + ind;
    return this[ind || 0];
};
/**
 * @return {?Object}
 */
G.prototype.first = function(){
    return this.get(0);
};
/**
 * @return {?Object}
 */
G.prototype.last = function(){
    return this.get(-1);
};
/**
 * @return {number}
 */
G.prototype.size = function() {
    return this.length;
};
/**
 * @param {goog.array.ArrayLike} arr
 * @return {goog.array.ArrayLike}
 */
G.prototype.add = function(arr) {
    return G(goog.array.concat(this, arr));
};
// DOM functions
/**
 * @param {string} selector
 * @return {goog.array.ArrayLike}
 */
G.prototype.find = function(selector) {
    var ret = [];
    this.each(function(el) {
        goog.array.forEach(G.elsBySelector(selector, el),
            function(ele) {
                goog.array.insert(ret, ele);
            }
        );
    });
    return G(ret);
};
/**
 * @param {boolean} bool
 * @return {goog.array.ArrayLike}
 */
G.prototype.visible = function(bool) {
    return this.each(function(el) {goog.style.showElement(el, bool)});
};
/**
 * @return {goog.array.ArrayLike}
 */
G.prototype.show = function() {
    return this.visible(true);
};
/**
 * @return {goog.array.ArrayLike}
 */
G.prototype.hide = function(bool) {
    return this.visible(false);
};
/**
 * @param {string|Object.<string, string>} key
 * @param {string=} val
 * @return {goog.array.ArrayLike}
 */
G.prototype.attr = function(key, val) {
     if(goog.isString(key) && goog.isDef(val)) {
         var temp = {};
         goog.object.set(temp, key, val);
         key = temp;
     }
     if(goog.isObject(key)) {
         this.each(function(el) {
             this.setProperties(key);
         })
         return this;
     }
     return this.map(function(el) {return el.getAttribute(key);});
};
/**
 * @param {string=} key
 * @param {string=} val
 * @return {goog.array.ArrayLike}
 */
G.prototype.data = function(key, val) {
    return this.attr('data-'+(key||'id'));
};
/**
 * @param {string=} val
 * @return {goog.array.ArrayLike}
 */
G.prototype.val = function(val) {
    if(goog.isDef(val))
        return this.each(function(el) {el.value = val;});
    return this.map(function(el) {return el.value;});
};
/**
 * @return {goog.array.ArrayLike}
 */
G.prototype.empty = function(){
    this.each(goog.dom.removeChildren);
};
/**
 * @return {goog.array.ArrayLike}
 */
G.prototype.next = function() {
    return this.map(function(el) {return el.nextSibling;});
};
/**
 * @return {goog.array.ArrayLike}
 */
G.prototype.prev = function() {
    return this.map(function(el) {return el.previousSibling;});
};
/**
 * @param {string=} class
 * @return {goog.array.ArrayLike}
 */
G.prototype.addClass = function(className) {
    return this.each(function(el) {goog.dom.classes.add(className);});
};
/**
 * @param {string=} class
 * @return {goog.array.ArrayLike}
 */
G.prototype.removeClass = function(className) {
    return this.each(function(el) {goog.dom.classes.remove(className);});
};
/**
 * @param {string=} class
 * @return {goog.array.ArrayLike}
 */
G.prototype.hasClass = function(className) {
    return this.filter(function(el) {
        goog.dom.classes.has(el, className);});
};
/**
 * @param {Element|Node|Function|string=} input
 * @return {goog.array.ArrayLike}
 */
G.prototype.html = function(input) {
    if(!input)
        return this.get().innerHTML
    if(goog.isFunction(input))
        this.each(input);
    if(input.nodeType)
        this.each(function(el) {goog.dom.append(/** @type {!Node} */(el), input.cloneNode)});
    else
        this.each(function(el) {el.innerHTML = input});
    return this;
};
/**
 * @param {Element|Node|Function|string=} input
 * @return {goog.array.ArrayLike}
 */
G.prototype.text = function(input) {
    if(!input)
        return goog.dom.getTextContent(this.get());
    if(goog.isFunction(input))
        this.each(input);
    else
        this.each(function(el) {goog.dom.setTextContent(el, input)});
    return this;
};
// Events
/**
 * @param {string} eventType
 * @param {Function} fn
 * @param {Object=} handler
 * @param {goog.events=} eventObject 
 * @return {goog.array.ArrayLike}
 */
G.prototype.on = function(eventType, fn, handler, eventObject) {
    return this.each(function(el) {
        if(eventObject)
            eventObject.listen(el, eventType, fn, false, (handler || el));
        else
            goog.events.listen(el, eventType, fn, false, (handler || el));
    });
};
/**
 * @param {string} eventType
 * @param {Function} fn
 * @param {Object=} handler
 * @param {goog.events=} eventObject 
 * @return {goog.array.ArrayLike}
 */
G.prototype.off = function(eventType, fn, handler, eventObject) {
    return this.each(function(el) {
        if(eventObject)
            eventObject.unlisten(el, eventType, fn, false, (handler || el));
        else
            goog.events.unlisten(el, eventType, fn, false, (handler || el));
    });
}; 
/**
 * @param {Function} fn
 * @param {Object=} handler
 * @param {goog.events=} eventObject 
 * @return {goog.array.ArrayLike}
 */
G.prototype.click = function(fn, handler, eventObject) {
    return this.on(goog.events.EventType.CLICK);
};


