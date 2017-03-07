const {NEWLINE, HYPHEN} = require('./constants');

const TRIM_PATTERN = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
const SLUG_ALLOWED_PATTERN = /[^\w\s\-\.\_~]/g;
const SLUG_REPLACE_PATTERN = /[-\s]+/g;

function trim(str) {
  return str.replace(TRIM_PATTERN, '');
}

function slug(str) {
  return str.toLowerCase()
  .replace(SLUG_ALLOWED_PATTERN, '')
  .replace(SLUG_REPLACE_PATTERN, HYPHEN);
}

function slice(arrayLike) {
  return Array.prototype.slice.call(arrayLike);
}

function flatten(lists) {
  return lists.reduce((acc, list) => {
    return acc.concat(list);
  }, []);
}

function literalList(str, {skipTrim, allowEmpty} = {}) {
  return str.split(NEWLINE)
  .map(x => skipTrim? x : x.trim())
  .filter(x => allowEmpty ? x : x.length).join();
}

function isText(node) {
  return node && node.nodeType === Node.TEXT_NODE;
}

function isElement(node) {
  return node && node.nodeType === Node.ELEMENT_NODE;
}

function isDocument(node) {
  return node && node.nodeType === Node.DOCUMENT_NODE;
}

function select(selector, root) {
  root = isElement(root) ? root : document;

  return root.querySelector(selector);
}

function selectAll(selector, roots) {
  roots = Array.isArray(roots) ? roots : [roots];
  roots = isElement(roots[0]) ? roots : [document];

  return roots.reduce((acc, root) => {
    if ('querySelectorAll' in root) {
      const results = root.querySelectorAll(selector);

      return acc.concat([...results]);
    }

    return acc;
  }, []);
}

function detach(node = {}) {
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }

  return node;
}

function detachAll(nodes) {
  return nodes.map(detach);
}

function append(parent, node) {
  parent.appendChild(child);
}

function prepend(parent, node) {
  parent.insertBefore(node, parent.firstChild);
}

function before(sibling, node) {
  sibling.parentElement.insertBefore(node, sibling);
}

function after(sibling, node) {
  sibling.parentElement.insertBefore(node, sibling.nextSibling);
}

function _replaceWith(el) {
  before(this.startNode, el);

  return detachAll(this.betweenNodes.concat([this.startNode, this.endNode]));
}

function getSections(names) {
  if (typeof names === 'string') {
    names = [names];
  }

  const sections = [];

  names.forEach(name => {
    const endName = `end${name}`;

    selectAll(`a[name^="${name}"]`).forEach(startNode => {
      let nextNode = startNode;
    	let isMoreContent = true;
    	const betweenNodes = [];
      const suffix = startNode.getAttribute('name').slice(name.length);

    	while(isMoreContent && (nextNode = nextNode.nextSibling) !== null) {
    		if (isElement(nextNode) && (nextNode.getAttribute('name') || '').indexOf(endName) === 0) {
    			isMoreContent = false;
    		} else {
    			betweenNodes.push(nextNode);
    		}
    	}

      const section = {
        name,
        suffix,
    		startNode,
        betweenNodes,
        endNode: nextNode
    	};

      section.replaceWith = _replaceWith.bind(section);
    	sections.push(section);
    });
  });

  return sections;
}
/*
const dateFromISO = (() => {
  const dISO = Date.parse('2001-09-09T01:46:40.000Z');
  const isoRegex = /^(\d{4}\-\d\d\-\d\d([tT][\d:\.]*)?)([zZ]|([+\-])(\d\d):(\d\d))?$/;

  if (dISO ===) {
    return x => new Date(Date.parse(x));
  } else {
    return x => {
      const p = isoRegex.exec(x) || [];
      let day;
      let timezone;

      if (p[1]) {
        day = p[1].split(/\D/).map(y => parseInt(y, 10) || 0);
        day[1] -= 1;
        day = new Date(Date.UTC.apply(Date, day));

        if (!day.getDate()) {
          return NaN;
        }

        if (p[5]) {
          timezone = parseInt(p[5], 10)*60;

          if (p[6]) {
            timezone += parseInt(p[6], 10);
          }

          if (p[4]== "+") {
            timezone *= -1;
          }

          if (timezone) {
            day.setUTCMinutes(day.getUTCMinutes() + timezone);
          }
        }

        return day;
      }

      return NaN;
    }
  }
})();
*/
module.exports = {
  trim,
  slug,
  slice,
  flatten,
  literalList,
  isText,
  isElement,
  isDocument,
  select,
  selectAll,
  detach,
  detachAll,
  append,
  prepend,
  before,
  after,
  getSections
};
