export const createElement = (tag, options = {}, child = []) => {
  const element = document.createElement(tag);
  
  Object.entries(options).forEach(([key, value]) => {
    element[key] = value;
  })

  if (Array.isArray(child)) {
    child.forEach(c => {
      if (c instanceof Node) {
        element.appendChild(c);
      } else if (typeof c === 'string') {
        element.appendChild(document.createTextNode(c));
      }
    });
  }

  if (typeof child === "object" && child instanceof Node) {
    element.appendChild(child);
  }
  return element;
}

let me = createElement("div", { className: "container" });

console.log(me);