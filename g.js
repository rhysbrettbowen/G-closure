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
 * @param {string} input
 * @param {Element|Node=} mod
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

/**
 */
G.prototype = {
    // Array Functions
    each: function(fn, handler) {
        goog.array.forEach(this, fn, handler);
        return this;
    },
    filter: function(fn, handler) {
        return G(goog.array.filter(this, fn, handler));
    },
    map: function(fn, handler) {
        return G(goog.array.map(this, fn, handler));
    },
    get: function(ind) {
        if(ind < 0)
            ind = this.length + ind;
        return this[ind || 0];
    },
    first: function(){
        return this.get(0);
    },
    last: function(){
        return this.get(-1);
    },
    size: function() {
        return this.length;
    },
    add: function(arr) {
        return G(goog.array.concat(this, arr));
    },
    // DOM functions
    find: function(selector) {
        var ret = [];
        this.each(function(el) {
            goog.array.forEach(G.elsBySelector(selector, el),
                function(ele) {
                    goog.array.insert(ret, ele);
                }
            );
        });
        return G(ret);
    },
    next: function() {
        return this.map(function(el) {return el.nextSibling;});
    },
    prev: function() {
        return this.map(function(el) {return el.previousSibling;});
    },
    html: function(input) {
        if(!input)
            return this.get().innerHTML
        if(goog.isFunction(input))
            this.each(input);
        if(input.nodeType)
            this.each(function(el) {goog.dom.append(/** @type {!Node} */(el), input.cloneNode)});
        else
            this.each(function(el) {el.innerHTML = input});
        return this;
    },
    text: function(input) {
        if(!input)
            return goog.dom.getTextContent(this.get());
        if(goog.isFunction(input))
            this.each(input);
        else
            this.each(function(el) {goog.dom.setTextContent(el, input)});
        return this;
    },
    // Events
    click: function(fn, handler, eventObject) {
        this.each(function(el) {
            if(eventObject)
                eventObject.listen(el, goog.events.EventType.CLICK, fn, false, (handler || el));
            else
                goog.events.listen(el, goog.events.EventType.CLICK, fn, false, (handler || el));
        });
        return this;
    }
}

