/*
 * Version 0.2
 */

//     (c) 2012 Rhys Brett-Bowen, Catch.com
//     goog.mvc may be freely distributed under the MIT license.
//     For all details and documentation:
//     https://github.com/rhysbrettbowen/goog.mvc

goog.provide('G');

goog.require('goog.dom');
goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.style');


/**
 * @param {*} input
 * @param {string|Element|Node=} mod
 * @constructor
 * @return {G}
 */
G = function(input, mod) {
    if(goog.isString(mod)) {
        mod = G.elsBySelector(/** @type {string} */(mod))[0];
    }
    if(input.nodeType)
        input = [input];
    else if(goog.isString(input)) {
        if(input.charAt(0) == '<') {
            input = [goog.dom.htmlToDocumentFragment(input)];
        } else {
            input = G.elsBySelector(input, mod);
        }
        if(!input) {
            input = [];
        }
    }
    else if(!input) {
        input = [];
    }
    if(!goog.isArrayLike(input)) {
        input = [input];
    }    
    return /** @type {G} */(new G.init(input));
};

G.prototype.length = 0;
/** 
 * @constructor
 * @extends {G}
 */
G.init = function(input) {
    for(var i = 0; i < input.length; i++)
        this[i] = input[i];
    this.length = input.length;
    return this;
};
G.init.prototype = G.prototype;

G.prototype.constructor = G;
G.prototype.sort = [].constructor.prototype['sort'];
G.prototype.reverse = [].constructor.prototype['reverse'];

/**
 * takes a string like 'tagName[ .className]', '.className' or '#elementId'
 * mod is the element to search from
 *
 * @param {string} input
 * @param {Element|Node=} mod 
 * @return {goog.array.ArrayLike}
 */
G.elsBySelector = function(input, mod) {
    mod = mod || document;
    if(mod.querySelectorAll)
        return mod.querySelectorAll(input);
    if(input.charAt(0) == '.') {
        return (goog.dom.getElementsByClass(input.substring(1), /** @type {Element} */(mod)) || []);
    }
    if(input.charAt(0) == '#') {
        return [goog.dom.getElement(input)];
    }
    return goog.dom.getElementsByTagNameAndClass(input.replace(/\s.*/,''), input.replace(/.*\./,'')||null, /** @type {Element} */(mod));
};

// Array Functions
/**
 * @param {Function} fn
 * @param {Object=} handler
 * @return {G}
 */
G.prototype.each = function(fn, handler) {
        goog.array.forEach(/** @type {goog.array.ArrayLike} */(this), fn, handler);
        return this;
};
/**
 * @param {Function|string} fn
 * @param {Object=} handler
 * @return {G}
 */
G.prototype.filter = function(fn, handler) {
    if(goog.isString(fn)){
        var select = fn;
        var length = this.size();
        fn = function(val, ind) {
            if(select == ":odd")
                return ind%2===1;
            if(select == ":even")
                return ind%2===0;
            if(select == ":first")
                return ind===0;
            if(select == ":last")
                return ind===this.length-1;
        };
        handler = this;
    }
    return G(goog.array.filter(/** @type {goog.array.ArrayLike} */(this), fn, handler));
};
/**
 * @param {Function} fn
 * @param {Object=} handler
 * @return {G}
 */
G.prototype.map = function(fn, handler) {
    return G(goog.array.map(/** @type {goog.array.ArrayLike} */(this), fn, handler));
};
/**
 * @param {*} obj
 * @return {boolean}
 */
G.prototype.contains = function(obj) {
    return goog.array.contains(/** @type {goog.array.ArrayLike} */(this), obj);
};
/**
 * @param {number} ind
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
 * @return {Array}
 */
G.prototype.toArray = function(){
    var arr = [];
    this.each(function(val) {arr.push(val);});
    return arr;
};
/**
 * @param {number} index
 * @return {G}
 */
G.prototype.eq = function(index){
    return G(this.get(index));
};
/**
 * @return {number}
 */
G.prototype.size = function() {
    return this.length;
};
/**
 * @param {goog.array.ArrayLike} arr
 * @return {G}
 */
G.prototype.add = function(arr) {
    return G(goog.array.concat(/** @type {goog.array.ArrayLike} */(this), arr));
};
// DOM functions
/**
 * @param {Object|string} style
 * @param {string=} val
 * @return {G|string}
 */
G.prototype.css = function(style, val) {
     if(goog.isString(style) && !val)
        return goog.style.getComputedStyle(this[0], style);
     this.each(function(el) {
         goog.style.setStyle(el, style, val);
     });
     return this;
};
/**
 * @param {string=} input
 * @return {G|number}
 */
G.prototype.top = function(input) {
    if(input){
        if(goog.isNumber(input))
            input = input+"px";
        this.each(function(el) {el.style.top = input;});
        return this;
    }
    return goog.style.getBounds(/** @type {Element} */(this.get(0))).top;
};
/**
 * @param {string=} input
 * @return {G|number}
 */
G.prototype.left = function(input) {
    if(input){
         if(goog.isNumber(input))
                input = input+"px";
        this.each(function(el) {el.style.left = input;});
        return this;
    }
    return goog.style.getBounds(/** @type {Element} */(this.get(0))).left;
};
/**
 * @param {string=} input
 * @return {G|number}
 */
G.prototype.width = function(input) {
    if(input){
         if(goog.isNumber(input))
                input = input+"px";
        this.each(function(el) {el.style.width = input;});
        return this;
    }
    return goog.style.getBounds(/** @type {Element} */(this.get(0))).width;
};
/**
 * @param {string=} input
 * @return {G|number}
 */
G.prototype.height = function(input) {
    if(input){
         if(goog.isNumber(input))
                input = input+"px";
        this.each(function(el) {el.style.height = input;});
        return this;
    }
    return goog.style.getBounds(/** @type {Element} */(this.get(0))).height;
};
/**
 * @param {string} selector
 * @return {G}
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
 * @param {boolean=} bool
 * @return {G|boolean}
 */
G.prototype.visible = function(bool) {
    if(!goog.isDef(bool))
        return goog.style.isElementShown(this[0]);
    return this.each(function(el) {goog.style.showElement(el, bool);});
};
/**
 * @return {G}
 */
G.prototype.show = function() {
    return /** @type {G} */(this.visible(true));
};
/**
 * @return {G}
 */
G.prototype.hide = function(bool) {
    return /** @type {G} */(this.visible(false));
};
/**
 * @param {string|Object.<string, string>} key
 * @param {string=} val
 * @return {G}
 */
G.prototype.attr = function(key, val) {
     if(goog.isString(key) && goog.isDef(val)) {
         var temp = {};
         goog.object.set(temp, key, val);
         key = temp;
     }
     if(goog.isObject(key)) {
         this.each(function(el) {
             goog.dom.setProperties(el, /** @type {Object} */(key));
         });
         return this;
     }
     return this.map(function(el) {return el.getAttribute(key);});
};
/**
 * @param {string=} key
 * @param {string=} val
 * @return {G}
 */
G.prototype.data = function(key, val) {
    return this.attr('data-'+(key||'id'));
};
/**
 * @return {G}
 */
G.prototype.remove = function() {
    return this.each(function(el) {
        goog.dom.removeNode(el);
    });
};
/**
 * @param {Element|Node} node
 * @return {G}
 */
G.prototype.replace = function(node) {
    goog.dom.replaceNode(node, this[0]);
    return G(node);
};
/**
 * @param {string=} val
 * @return {G|string}
 */
G.prototype.val = function(val) {
    if(goog.isDef(val))
        return this.each(function(el) {el.value = val;});
    return this[0].value;
};
/**
 * @return {G}
 */
G.prototype.empty = function(){
    return this.each(goog.dom.removeChildren);
};
/**
 * @return {G}
 */
G.prototype.next = function() {
    return this.map(function(el) {return el.nextSibling;});
};
/**
 * @return {G}
 */
G.prototype.prev = function() {
    return this.map(function(el) {return el.previousSibling;});
};
/**
 * @param {string=} className
 * @return {G}
 */
G.prototype.addClass = function(className) {
    return this.each(function(el) {goog.dom.classes.add(el, className);});
};
/**
 * @param {string=} className
 * @return {G}
 */
G.prototype.removeClass = function(className) {
    return this.each(function(el) {goog.dom.classes.remove(el, className);});
};
/**
 * @param {string} className
 * @param {boolean=} opt_on
 * @return {G}
 */
G.prototype.toggleClass = function(className, opt_on) {
    return this.each(function(el) {
        if(goog.isDef(opt_on)) {
            goog.dom.classes.enable(el, className, opt_on);
        } else {
            goog.dom.classes.toggle(el, className);
        }
    });
};
/**
 * @param {string} className
 * @return {boolean}
 */
G.prototype.hasClass = function(className) {
    return goog.dom.classes.has(this[0], className);
};
/**
 * @param {...goog.dom.Appendable} input
 * @return {G}
 */
G.prototype.append = function(input) {
    this.each(function(el) {goog.dom.append(/** @type {!Node} */(el), input);});
    return this;
};
/**
 * @param {goog.dom.Appendable|Function=} input
 * @return {G|string}
 */
G.prototype.html = function(input) {
    if(!input)
        return this.get(0).innerHTML;
    if(goog.isFunction(input))
        this.each(function(el) {goog.dom.append(/** @type {!Node} */(el), /** @type {Function} */(input)(el));});
    if(input.nodeType) {
        this.empty();
        this.each(function(el) {goog.dom.append(/** @type {!Node} */(el), input.cloneNode);});
    } else
        this.each(function(el) {el.innerHTML = input;});
    return this;
};
/**
 * @param {Element|Node|Function|string=} input
 * @return {G|string}
 */
G.prototype.text = function(input) {
    if(!goog.isDef(input))
        return goog.dom.getRawTextContent(/** @type {Node} */(this.get(0)));
    if(goog.isFunction(input))
        this.each(input);
    else
        this.each(function(el) {goog.dom.setTextContent(el, /** @type {string} */(input));});
    return this;
};
// Events
/**
 * @param {string} eventType
 * @param {Function} fn
 * @param {Object=} handler
 * @param {goog.events.EventHandler=} eventObject 
 * @return {G}
 */
G.prototype.on = function(eventType, fn, handler, eventObject) {
    return this.each(function(el) {
        (eventObject || goog.events).listen(el, eventType, fn, false, (handler || el));
    });
};
/**
 * @param {string} eventType
 * @param {Function} fn
 * @param {Object=} handler
 * @param {goog.events.EventHandler=} eventObject 
 * @return {G}
 */
G.prototype.off = function(eventType, fn, handler, eventObject) {
    return this.each(function(el) {
        (eventObject || goog.events).unlisten(el, eventType, fn, false, (handler || el));
    });
}; 
/**
 * @param {Function=} fn
 * @param {Object=} handler
 * @param {goog.events.EventHandler=} eventObject 
 * @return {G}
 */
G.prototype.click = function(fn, handler, eventObject) {
    if(!fn) {
        return this.each(function(el) {
            el.dispatchEvent(goog.events.EventType.CLICK);
        });
    }
    return this.on(goog.events.EventType.CLICK, fn, handler, eventObject);
};
/**
 * @param {Function} fn
 * @param {Object=} handler
 * @param {goog.events.EventHandler=} eventObject 
 * @return {G}
 */
G.prototype.focus = function(fn, handler, eventObject) {
    return this.on(goog.events.EventType.FOCUS, fn, handler, eventObject);
};
/**
 * @param {Function} fn
 * @param {Object=} handler
 * @param {goog.events.EventHandler=} eventObject 
 * @return {G}
 */
G.prototype.blur = function(fn, handler, eventObject) {
    return this.on(goog.events.EventType.BLUR, fn, handler, eventObject);
};
/**
 * @param {Function} fn
 * @param {Object=} handler
 * @param {goog.events.EventHandler=} eventObject 
 * @return {G}
 */
G.prototype.mouseup = function(fn, handler, eventObject) {
    return this.on(goog.events.EventType.MOUSEUP, fn, handler, eventObject);
};
/**
 * @param {Function} fn
 * @param {Object=} handler
 * @param {goog.events.EventHandler=} eventObject 
 * @return {G}
 */
G.prototype.mousedown = function(fn, handler, eventObject) {
    return this.on(goog.events.EventType.MOUSEDOWN, fn, handler, eventObject);
};


