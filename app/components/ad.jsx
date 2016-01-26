import React, { PropTypes } from 'react';
import { delay, isUndefined, uniqueId } from 'lodash';
// import debug from 'debug';
import { EventEmitter } from 'events';

const Ad = (() => {
  let globalEventAttached = false;
  let emitter;

  if (process.env.BROWSER) {
    emitter = new EventEmitter();
  }

  function adLoaded(name, w, h) {
    emitter.emit('adLoad', name, w, h);
  }

  function waitForHtmlAdWH(cb) {
    if (isUndefined(window.htmlAdWH)) {
      return delay(waitForHtmlAdWH, 50, cb);
    }

    cb();
  }

  function waitTillLoad() {
    return new Promise((resolve) => {
      waitForHtmlAdWH(() => {
        if (!globalEventAttached) {
          window.adsDevilAd.resized = adLoaded;
          globalEventAttached = true;
        }

        resolve();
      });
    });
  }

  function load(mn, width, height, id) {
    return new Promise((resolve) => {
      // debug('app:ad')('loading ad', mn, width, height, document.getElementById(id));

      const scanForAdLoaded = function (_name, _width, _height) {
        if (_name === id) {
          resolve({ width: _width, height: _height });
        }
      };

      const existing = document.getElementById(id);
      if (existing) {
        existing.innerHTML = '';
      }

      emitter.on('adLoad', scanForAdLoaded);
      window.htmlAdWH(mn, width, height, 'ajax', id);
      emitter.removeListener('adLoad', adLoaded);
    });
  }

  return {
    waitTillLoad,
    load
  };
})();

export default React.createClass({
  displayName: 'Ad',

  propTypes: {
    mn: React.PropTypes.string.isRequired,
    width: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    height: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    handleResize: React.PropTypes.func
  },

  getDefaultProps() {
    return {
      handleResize() {}
    };
  },

  getInitialState() {
    return {
      id: uniqueId() + '-' + this.props.mn
    };
  },

  // shouldComponentUpdate() {
  //   return false;
  // },

  componentDidMount() {
    // console.log(Ad);
    Ad.waitTillLoad().then(() => {
      Ad
        .load(this.props.mn, this.props.width, this.props.height, 'ad-' + this.state.id);
      // .then(this.handleResize);
    });

    // HistoryLocation.addChangeListener(this.handleHistoryChange);
  },

  componentDidUpdate() {
    console.log('did update');
    Ad.waitTillLoad().then(() => {
      Ad
        .load(this.props.mn, this.props.width, this.props.height, 'ad-' + this.state.id);
      // .then(this.handleResize);
    });
  },

  componentWillUnmount() {
    // HistoryLocation.removeChangeListener(this.handleHistoryChange);
  },

  // handleResize(res) {
  //   $(this.getDOMNode()).css('height', res.height + 'px');
  //   this.props.handleResize(res);
  // },

  // handleHistoryChange() {
  //   if (this.isMounted()) {
  //     const element = this.getDOMNode();
  //     const style = element.currentStyle ? element.currentStyle.display : getComputedStyle(element, null);
  //     if (style.display !== 'none' && style.visibility !== 'hidden') {
  //       Ad.waitTillLoad().then(() => {
  //         Ad
  //           .load(this.props.mn, this.props.width, this.props.height, 'ad-' + this.state.id)
  //           .then(this.handleResize);
  //       });
  //     }
  //   }
  // },

  render() {
    return <div className='ad' id={ 'ad-' + this.state.id } />;
  }
});
