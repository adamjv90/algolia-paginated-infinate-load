import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';

if (process.env.BROWSER) require('styles/modal.css');

export default React.createClass({
  displayName: 'Modal',


  propTypes: {
    children: PropTypes.node,
    // isOpen: React.PropTypes.bool,
    returnTo: React.PropTypes.string,
    width: React.PropTypes.number,
    height: React.PropTypes.number
  },

  render() {
    console.log(this.props);
    const dimensions = this.calculateSize();
    const klass = classNames(
      'app--modal',
      'show'
    );
    return (
      <div className={ klass }>
        <Link component='div' className='overlay' to={ this.props.returnTo } />
        <div className='container'>
          <div className='wrap'>
            <div className='parent' ref='modal'>
              <div className='modal' style={ { height: dimensions.height, width: dimensions.width } }>
                { this.props.children }
              </div> : <div />}
              <Link component='div' className='close' to={ this.props.returnTo }>Close</Link>
            </div>
          </div>
        </div>
      </div>
    );
  },

  calculateSize() {
    if (this.props.width && this.props.height) {
      return {
        width: this.props.width,
        height: this.props.height
      };
    }
    if (process.env.BROWSER !== true) {
      return {
        width: 0,
        height: 0
      };
    }
    const sidebarWidth = 330;
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const minModalHeight = 410;
    const minModalWidth = 300;
    let modalWidth = 1400;
    let modalHeight = 900;
    while (modalWidth > windowWidth - sidebarWidth - 40) modalWidth -= 100;
    while (modalHeight > windowHeight - 40) modalHeight -= 100;
    if (modalHeight < minModalHeight) modalHeight = minModalHeight;
    if (modalWidth < minModalWidth) modalWidth = minModalWidth;
    return {
      width: modalWidth,
      height: modalHeight
    };
  }
});
