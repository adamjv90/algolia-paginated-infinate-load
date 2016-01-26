import React from 'react';
import classNames from 'classnames';
import each from 'lodash/collection/each';

const klass = 'element-toggle-target';
const klassOpen = 'element-toggle-target-visible';
function hasClass(ele, _klass) {
  return ele.className && !!ele.className.match(new RegExp('(\\s|^)' + _klass + '(\\s|$)'));
}

function addClass(ele, _klass) {
  if (!hasClass(ele, _klass)) ele.className += ' ' + _klass;
  return ele;
}

function removeClass(ele, _klass) {
  const reg = new RegExp('(\\s|^)' + _klass + '(\\s|$)');
  if (hasClass(ele, _klass)) {
    ele.className = ele.className.replace(reg, ' ');
  }
  return ele;
}

function domClick(e) {
  const open = document.getElementsByClassName(klassOpen);
  if (!hasClass(e.target.parentNode, klass) && !hasClass(e.target, klass) && klassOpen) {
    each(open, (dropdown) => {
      removeClass(dropdown, klassOpen);
    });
  }
}

if (process.env.BROWSER) {
  if (window.addEventListener) {
    document.addEventListener('click', domClick, false);
  } else {
    document.attachEvent('click', domClick);
  }
}

export default {
  toggleHandler(e) {
    const dropdowns = e.currentTarget.parentNode.getElementsByClassName(klass);

    if (dropdowns.length) {
      each(dropdowns, (dropdown) => {
        if (hasClass(dropdown, klassOpen)) {
          removeClass(dropdown, klassOpen);
        } else {
          addClass(dropdown, klassOpen);
        }
      });
    }
  },

  toggleClassName() {
    return klass;
  },

  renderToggle(html, className = '') {
    return (
      <div className={ classNames(klass, className) }>
        { html }
      </div>
    );
  }
};
