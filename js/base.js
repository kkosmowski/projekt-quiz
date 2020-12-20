export default class Base {
  static hide (element) {
    element.classList.add('display:none');
  }

  static show(element) {
    element.classList.remove('display:none');
  }

  static parseText(string) {
    return string
      .replaceAll('<', '&lt;').replaceAll('>', '&gt;')
      .replaceAll('--[', '<code class="block">').replaceAll(']--', '</code>')
      .replaceAll('-[', '<code>').replaceAll(']-', '</code>');
  }

  static createElement(tag, parent, classList, content = null, contentAsHtml = false) {
    const element = document.createElement(tag);
    if (content) {
      if (contentAsHtml) element.innerHTML = content;
      else element.textContent = content;
    }
    if (classList.length) element.classList.add(...classList);
    parent.append(element);
    return element;
  }

  static addClassToId(id, classNames) {
    this.addClass(document.getElementById(id), classNames);
  }

  static addClass(element, classNames) {
    element.classList.add(classNames);
  }

  static removeClassFromId(id, className) {
    this.removeClass(document.getElementById(id), className);
  }

  static removeClass(element, className) {
    element.classList.remove(className);
  }
}
