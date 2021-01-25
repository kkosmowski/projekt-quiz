/*
  Base class consists of helper methods such as creating DOM elements, toggling visibility of an element
  or parsing the text. Group of utils that do not belong in neither Quiz nor Render classes.
 */
export default class Base {
  static displayNoneClass = 'display:none';


  /*
    Adds a display:none rule class to an element.
   */
  static hide(element) {
    element.classList.add(this.displayNoneClass);
  }


  /*
    Removes a display:none rule class to an element.
    Note: It will only show an element that was hidden with hide method.
   */
  static show(element) {
    element.classList.remove(this.displayNoneClass);
  }


  /*
    Text parser method, parses the html tags such as '<img>' into '&lt;img&gt;'.
    This causes user to see '<img>' in the text, instead of an image.
    Additionally code symbol are parsed into <code> tags.
    Example:
       -[<h1>]-   =>  <code>&lt;h1&gt;</code>
      --[<h1>]--  =>  <code class="block">&lt;h1&gt;</code>

    Additionally parses '--' into n-dash and '---' into m-dash.

    Input: string to be parsed, and options.
    Options is an object, that can consist of:
     * skipTags - parsing of Html and code tags is not executed,
     * skipDashes - parsing of '--' and '---' into n- and m-dashes is not executed.
    Examples of valid options:
      { skipDashes: true }
      { skipTags: true }
      { skipDashes: true, skipTags: true } <- also allowed, but will result in no text parsing.
   */
  static parseText(string, options) {
    //TODO: refactor into own method that makes only one loop across the string, instead of <as many as replaceAll calls>
    const replaceTags = (string) => string
      .replaceAll('<', '&lt;').replaceAll('>', '&gt;')
      .replaceAll('--[', '<code class="block">').replaceAll(']--', '</code>')
      .replaceAll('-[', '<code>').replaceAll(']-', '</code>');

    const replaceDashes = (string) => string.replaceAll('---', '&mdash;').replaceAll('--', '&ndash;');

    if (!options) {
      return replaceDashes(replaceTags(string));
    } else {
      if (options.skipTags) {
        return replaceDashes(string);
      } else if (options.skipDashes) {
        return replaceTags(string);
      }
      return string;
    }
  }


  /*
    Creates element with specified tag, appended to specified parent.
    Adds given classes. Allows an inner content:
    - either with contentAsHtml false (textContent)
    - or with contentAsHtml true (innerHTML)
    Additionally returns the element.
   */
  static createElement(tag, parent, classes, content = null, contentAsHtml = false) {
    const element = document.createElement(tag);
    if (content) {
      if (contentAsHtml) element.innerHTML = content;
      else element.textContent = content;
    }
    if (classes) this.addClass(element, classes);
    parent.append(element);
    return element;
  }


  /*
    Adds specified class (if single) or classes (if an array) to a specified element.
  */
  static addClass(element, classNames) {
    if (element) typeof classNames === 'object' ? element.classList.add(...classNames) : element.classList.add(classNames);
  }


  /*
    Adds specified class (if single) or classes (if an array) to element of specified id.
  */
  static addClassToId(id, classNames) {
    this.addClass(document.getElementById(id), classNames);
  }

  /*
    Removes specified class (if single) or classes (if an array) from a specified element.
   */
  static removeClass(element, classNames) {
    typeof classNames === 'object' ? element.classList.remove(...classNames) : element.classList.remove(classNames);
  }


  /*
    Removes specified class (if single) or classes (if an array) from an element of specified id.
   */
  static removeClassFromId(id, className) {
    this.removeClass(document.getElementById(id), className);
  }


  /*
    Returns a text with swap text ('[_]') being replaced with specified interpolations.
    Note: The order of interpolations matters.
    Example:
      translation: 'This bicycle costs [_], but I bought it for [_].'
      interpolations: '100$', '80$'
      output: 'This bicycle costs 100$, but I bought it for 80$.'
    Another example:
      translation: 'You answered correctly [_] out of [_] answers, this is [_]%.'
      interpolations: 3, 4, 75
      output: 'You answered correctly 3 out of 4 answers, this is 75%.'
   */
  static interpolate(translation, ...interpolations) {
    const swapText = '[_]';
    interpolations.forEach(interpolation => {
      translation = translation.replace(swapText, interpolation);
    });

    return translation;
  }
}
