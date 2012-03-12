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

## array functions ##

### .each(function, opt_handler): G ###

accepts a function to run on each element in the array. The function takes three arguments. The value, the index and the array. You can pass in an optional handler to be the "this" in the array. returns the G object

### .filter(function, opt_handler): G ###

the function can take three arguments, the value, the index and the array and should return true or false. An optional handler can be passed in to act as this. a new G object containing only the values returning true will be returned

### .map(function, opt_handler): G ###

the function can take three arguments, the value, the index and the array and should return a value that will replace the existing value. An optional handler can be passed in to act as this. a new G object containing only the values returning true will be returned 

### .get(index): object ###

will return whatever object is at the index in G. Negative values count from the end of G backwards

### .first(): object ###

returns the first object in G

### .last(): object ###

returns the last element

### .size(): number ###

returns the length of G

### .add(array): G ###

adds an array on to the end of G 

### .contains(obj): Boolean ###

tests if the array contains an object

## DOM functions ##

these will only work on G objects containing elements

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

### .addClass(string): G ###

adds class to all elements

### .removeClass(string): G ###

removes a class from all elements

### .hasClass(string): G ###

return a G array of the elements that have the given class

### .append(input): G ###

appends the input to all elements, can be a function, string or Node/NodeList

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

### .on(eventType, function, handler, eventObject): G ###

takes in the event type (i.e. goog.events.CLICK or "click"), the handling function which takes in the Event, an optional handler to be used as "this" and an optional eventObject (use this with goog.ui.Component and pass in this.getHandler()).

### .off(eventType, function, handler, eventObject): G ###

removes an event registered with on

### .click(function, handler, eventObject): G ###

the same as bind but the eventType is set to click for you

## change log ##

### v0.2 ###

- height, width, top, left
- contains
- append
- addClass, removeClass
- change bind to on and off
- use querySelectorAll when available

### v0.1 ###

start versioning
