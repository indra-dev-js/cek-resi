import { createElement } from '../../util/dom.js';

export const createButton = (text, options = {}) => {
  const btn = createElement('button', {
    type: 'button',
    className: 'px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75',
    ...options,
  }, [text]);
  return btn;
} 
