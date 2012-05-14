# G-closure #

A way for jquery developers to use the closure library in a familiar way

Thanks to JQuery and Zepto for ideas and the Google guys for the great set of closure tools

You can initialize a new G object by:

```javascript
G(selector)
```

the selector can either be an array, an element or a string. The string should be in one of the below forms and selects an array of elements:
- "#elementId"
- ".className"
- "tagName[ .className]"

the className is optional in the last selector. You can also pass through an element as a second argument to the G object with the above selectors to use as a root node to search from.

If you are using a browser that supports querySelectorAll then G will use that and any valid selector for that browser can be passed.

You can also add in some css filters by putting :filter at the end of the string. Here are the filters that are supported

- visible
- hidden
- selected
- checked
- first
- last
- even
- odd

## Utilities ##

### GG.elsBySelector(selector, context): Array ###

will return an array of elements matching the selector underneath the optional context element

### GG.matches(element, selector): boolean ###

returns whether an element matches a selector string or function that returns a boolean

### GG.extend(object, ...objects): object ###

extends the first object with the objects given and return that object

### GG.wait(function, millisecond, opt_handler): id ###

wait milliseconds before running the function with the optional handler,
return id for use with GG.clearWait

### GG.clearWait(id) ###

clear the function to be run

### GG.contains(container, child): boolean ###

whether the container element holds the child element in it's tree

### GG.data(Element, key): string ###

the data that was saved on the element

### GG.data(Element, key, value): G ###

sets the data for an element and returns the element in a G object

### GG.each(collection, callback): G ###

runs the callback function taking the element and the index on each element in the collection, returning the collection in a G object

### GG.grep(array, filter, opt_invert): array ###

filters an array based on the filter function. You can optionally invert the results

### GG.inArray(value, array, opt_index): number ###

returns the index of a value in the array optionally searching from an index

### GG.map(array, callback): array ###

returns an array where the values are transformed by a function that takes in the element and the index and returns the new value

### GG.param(object): string ###

changes an object in to a parameter string where arrays are broken out:
a = [1,2] -> a=1&a=2
and objects are recursively given square brackets
a = {a:1, b:2} -> a[a]=1&a[b]=2

### GG.merge(array, array): array ###

merge two arrays together

### GG.parseJSON(string): object ###

convert a json string to an object

### GG.proxy(function, this): function ###

binds 'this' to the given object for a function

### GG.trim(string): string ###

trims whitespace from a string

### GG.unique(array): array ###

removes duplicates from an array

### GG.noop() ###

a blank function

## array functions ##

### .sort(function): G ###

function takes two elements and returns -1,0,1 - same as native Array sort

### .reverse(): G ###

same as native Array reverse

### .each(function, opt_handler): G ###

accepts a function to run on each element in the array. The function takes three arguments. The value, the index and the array. You can pass in an optional handler to be the "this" in the array. returns the G object

### .filter(function, opt_handler): G ###

the function can take three arguments, the value, the index and the array and should return true or false. An optional handler can be passed in to act as this. a new G object containing only the values returning true will be returned.

You can also pass in ":odd",":even",":first" or ":last" to get those elements

### .not(function, opt_handler) ###

returns the inverse of filter

### .map(function, opt_handler): G ###

the function can take three arguments, the value, the index and the array and should return a value that will replace the existing value. An optional handler can be passed in to act as this. a new G object containing only the values returning true will be returned

### .get(index): object ###

will return whatever object is at the index in G. Negative values count from the end of G backwards

### .first(): object ###

returns the first object in G

### .last(): object ###

returns the last element

### .toArray(): Array ###

returns the elements as an array

### .eq(index): G ###

return G object with just the element at index

### .size(): number ###

returns the length of G

### .add(array): G ###

adds an array on to the end of G

### .remove(element): G ###

removes an element from G

### .contains(obj): Boolean ###

tests if the array contains an object

## DOM functions ##

these will only work on G objects containing elements

### .css(name, value): G ###

sets a style on all elements

### .css(object): G ###

sets a hash map of style keys and values on each element

### .css(name): string ###

gets the computed style on the first element for name

### .top(): Number ###

returns the top offset of the first element

### .top(input): G ###

sets the element.style.top attribute

### .left(): Number ###

returns the left offset of the first element

### .left(input): G ###

sets the element.style.left attribute

### .width(): Number ###

returns the width of the first element

### .width(input): G ###

sets the element.style.width attribute

### .height(): Number ###

returns the height offset of the first element

### .height(input): G ###

sets the element.style.height attribute

### .index(selector): number ###

returns the index of the first element that matches a selector

### .find(selector): G ###

return a G with all the elements matching the selector under the current elements in G

### .visible(boolean): G ###

pass true or false to set the visibility of all elements

### .show(): G ###

makes the elements visible

### .hide(): G ###

hides the elements

### .attr(string): G ###

return a G array holding the values of the attribute for the element

### .attr(object) | .attr(string, string): G ###

sets the attribute pair, or pairs in an object to the elements

### .data(string): G ###

return a G array holding the values of the "data-string" attribute for the element

### .data(string, string): G ###

sets the data pair of the elements

### .removeNode(): G ###

removes the nodes from the document

### .replace(element): G ###

replaces the first element in G with the element and returns a new G with the new node only

### .val(): G ###

returns a G array of the value of form elements

### .val(string): G ###

sets the value of form elements

### .empty(): G ###

remove all child nodes under the elements

### .next(): G ###

return the next sibling of the node

### .prev(): G ###

return the previous sibling of the node

### .children(selector): G ###

returns a G with the children of the elements optionally filtering on a selector

### .detach(selector): G ###

removes elements that match the selector fromt he document

### .addClass(string): G ###

adds class to all elements

### .removeClass(string): G ###

removes a class from all elements

### .toggleClass(string, on/off): G ###

toggles the className, optionally pass a boolean for whether it should be toggled on or off

### .hasClass(string): G ###

return a G array of the elements that have the given class

### .has(selector): G ###

returns a G which is filtered based on the selector

### .append(input): G ###

appends the input to all elements, can be a function, string or Node/NodeList

### .appendTo(input): G ###

appends all the elements to the element which matches the input which can be a G, element, selector or function returning and element

### .clone(deep): G ###

returns a G with cloned nodes, can pass whether to do a deep copy

### .html(): G ###

return the innerHTML of the elements

### .html(string): G ###

sets the innerHTML of the elements

### .text(): G ###

gets the textContent of the elements

### .text(string): G ###

sets the textContent of the elements

## Event functions ##

these are usually used for element arrays, but can also be applied to EventTargets

### G.on(): uid ###

same as goog.events.listen

### G.off(uids): boolean ###

pass an array of listener ids to turn them off, passes back if it was
succesfule

### .on(eventType[, selector][, data], fn(event)[, this][, eventObject]):Array ###

takes in the event type (i.e. goog.events.CLICK or "click"), an optional selector (must be a string) to test against the target, optional data to get on event.data (must be an Object), the handling function which takes in the Event, an optional handler to be used as "this" and an optional eventObject (use this with goog.ui.Component and pass in this.getHandler()). returns a list of uids that can be passed to G.off

### bind ###

alias for on

### .off(eventType, function, handler, eventObject): boolean ###

removes an event registered with on, passes back it it was succesful

### unbind ###

alias for off

### .click(function, handler, eventObject): uids ###

the same as bind but the eventType is set to click for you

### other events you can call ###

- .focus()
- .blur()
- .mouseup()
- .mousedown()
- .mouseover()
- .mouseout()

## change log ##

## v0.6 ###

- small enhancements in code
- on now mimics JQuery's latest (see signature above) and code comments
- can use - for first selector character instead of .
- util functions moved to GG
- can use $ or $$ instead of G or GG (not safe, overwrites $ and $$)
- blur and focus are called using capture phase & IE uses focusin and focus out (see [quirksmode](http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html))

### v0.5 ###

- more utility functions
- behaves more like jquery
- more docs
- some css filters work

### v0.4 ###

- fixes throughout
- passed compilation
- passes strict linting

### v0.3 ###

- fixed compile warnings
- removed __proto__
- tested and working in IE8
- reverse, sort from array
- toArray to get back simple array
- filter can accept strings

### v0.2 ###

- height, width, top, left
- contains
- append
- addClass, removeClass
- change bind to on and off
- use querySelectorAll when available

### v0.1 ###

start versioning
