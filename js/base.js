export default class Base {
  static displayNoneClass = 'display:none';


  /*
    Adds a display:none rule class to an element.
   */
  static hide (element) {
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
    Text parser to remove any html tags from code.
    Additionally code symbol are parsed into <code> tags.
    Example:
      -[<h1>]-    =>  <code>&lt;h1&gt;</code>
      --[<h1>]--  =>  <code class="block">&lt;h1&gt;</code>
   */
  static parseText(string) {
    return string
      .replaceAll('<', '&lt;').replaceAll('>', '&gt;')
      .replaceAll('--[', '<code class="block">').replaceAll(']--', '</code>')
      .replaceAll('-[', '<code>').replaceAll(']-', '</code>');
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


  static addClass(element, classNames) {
    typeof classNames === 'object' ? element.classList.add(...classNames) : element.classList.add(classNames);
  }


  static addClassToId(id, classNames) {
    this.addClass(document.getElementById(id), classNames);
  }


  static removeClass(element, classNames) {
    typeof classNames === 'object' ? element.classList.remove(...classNames) : element.classList.remove(classNames);
  }


  static removeClassFromId(id, className) {
    this.removeClass(document.getElementById(id), className);
  }
}
