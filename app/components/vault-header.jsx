import React from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';

if (process.env.BROWSER) require('styles/header.css');

function addEvent(obj, type, fn) {
  if (obj.attachEvent) {
    obj['e' + type + fn] = fn;
    obj[type + fn] = function () {
      obj['e' + type + fn](window.event);
    };
    obj.attachEvent('on' + type, obj[type + fn]);
  } else {
    obj.addEventListener(type, fn, false);
  }
}

function removeEvent(obj, type, fn) {
  if (obj.detachEvent) {
    obj.detachEvent('on' + type, obj[type + fn]);
    obj[type + fn] = null;
  } else {
    obj.removeEventListener(type, fn, false);
  }
}

export default React.createClass({
  contextTypes: {
    flux: React.PropTypes.object
  },

  getDefaultProps() {
    return {
      index: 'images'
    };
  },

  getInitialState() {
    return {
      livingVisible: false
    };
  },

  componentDidMount() {
    addEvent(document, 'click', this.documentClick);
  },

  componentWillUnmount() {
    removeEvent(document, 'click', this.documentClick);
  },

  documentClick(e) {
    if (e.target.parentNode && !e.target.parentNode.classList.contains('living-toggle')) {
      this.setState({ livingVisible: false });
    }
  },

  render() {
    return (
      <header className='app--header'>
        <div className='logo'>
          <Link to='vault' />
        </div>
        <ul className='menu'>
          { [ 'Decor', 'Flowers', 'Food & Drink', 'Wedding Cakes', 'Stationery', 'Wedding Dresses', 'Bride & Groom', 'Favors', 'Hairstyles' ].map((title) => {
            const klass = classNames(
              title.replace(/\s/g, '').replace(/&/g, '').toLowerCase(),
              'button',
              { 'nav-pad-adj': title === 'Wedding Dresses' }
            );
            return (
              <li className='container' key={ title }>
                <Link to={ `/search/images/${title}` } className={ klass }>{ title }</Link>
              </li>
            );
          }) }
          <li className='container' style={ { position: 'relative' } }>
            <div className='button living living-toggle' onClick={ () => this.setState({ livingVisible: !this.state.livingVisible }) }>Living <i className='fa fa-chevron-down'></i></div>
            { this.state.livingVisible ? <div style={ { position: 'absolute', right: -5, top: 33, zIndex: 100 } }>
              <div className='dropdown'>
                { [ 'Parties', 'Recipes', 'Kids Parties', 'Sofas', 'Walls', 'Home Tours', 'DIY', 'Entertaining', 'Home Decor' ].map((title) => {
                  return (
                    <Link key={ title } to={ `/search/images/${title}` }>{ title }</Link>
                  );
                }) }
                <div className='clearfix' />
              </div>
            </div> : <div /> }
          </li>
        </ul>
      </header>
    );
  }
});
