import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import Helmet from 'react-helmet';

import Ad from 'components/ad';
import Header from 'components/vault-header';
import Search from 'components/search-input';

import { track } from 'utils/omniture';

if (process.env.BROWSER) require('styles/vault.css');

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

export default React.createClass({
  contextTypes: {
    flux: PropTypes.object.isRequired
  },

  propTypes: {
    isMobile: PropTypes.bool,
    isTablet: PropTypes.bool,
    device: PropTypes.string
  },

  componentDidMount() {
    track({
      pageName: 'home',
      prop1: 'search',
      prop2: 'main'
    });
  },

  shouldComponentUpdate(newProps) {
    return this.props.device !== newProps.device;
  },

  render() {
    const columnMargin = this.props.isMobile ? 10 : 15;
    const credits = {
      Decor: 'Peaches & Mint',
      Flowers: 'Jose Villa Photography',
      'Food & Drink': 'White Loft Studio',
      'Wedding Cakes': 'Connie Dai Photography',
      Stationery: 'Rylee Hitchner',
      'Wedding Dresses': 'Jose Villa Photography',
      'Bride & Groom': 'KT Merry Photography',
      Hairstyles: 'When He Found Her',
      Bridesmaids: 'Marissa Lambert',
      Shoes: 'KT Merry Photography',
      Beauty: 'KT Merry Photography',
      Favors: 'Beth Helmstetter',
      Parties: 'Joel Serrato',
      Recipies: 'White Loft Studio',
      'Home Tours': 'Tracey Ayton',
      Entertaining: 'White Loft Studio',
      Walls: 'Brittany Ambridge for Domino'
      // Decor: 'Ruth Eileen'
    };

    const renderTerm = (term, i) => {
      return (
        <Link
          key={ term }
          to={ `/search/images/${term}` }
          className={ 'term ' + slugify(term) }
          style={ { margin: columnMargin, marginLeft: i % 3 || this.props.isMobile ? columnMargin : 0 } }>
          { credits[term] ? <div className='ellipsis photocred'>{ 'By ' + credits[term] }</div> : '' }
          <div><span dangerouslySetInnerHTML={ { __html: term } }></span></div>
        </Link>
      );
    };

    return (
      <div className='app--vault'>
        <Helmet
          title='The Vault: Curated & Refined Wedding Inspiration'
          titleTemplate='%s - Style Me Pretty'
          meta={ [
            { name: 'description', content: 'Explore millions of stunning wedding images to help inspire and plan your perfect day.' }
          ] } />
        <Ad className='ad' mn='93476275' width='LB' height='LB' />
        <Header />
        <div className='page'>
          <Search />
          <div className='intro'>
            Explore millions of stunning wedding images to help inspire and plan your perfect day.
          </div>
          <div className='home-terms-render' style={ { width: this.props.isMobile || this.props.isTablet ? '100%' : 1140 + (columnMargin * 2) * 3, marginLeft: this.props.isMobile ? 0 : -1 * columnMargin } }>
            { [ 'Decor', 'Flowers', 'Food & Drink', 'Wedding Cakes', 'Stationery', 'Wedding Dresses', 'Bride & Groom', 'Favors', 'Hairstyles' ].map(renderTerm) }
            <div className='clearfix' />
          </div>
          <div className='intro'>
            A field guide to inspired living and celebrating of all of life&rsquo;s moments before and after the ring!
          </div>
          <div className='clearfix' />
            <div className='home-terms-render' style={ { width: this.props.isMobile || this.props.isTablet ? '100%' : 1140 + (columnMargin * 2) * 3, marginLeft: this.props.isMobile ? 0 : -1 * columnMargin } }>
              { [ 'Parties', 'Recipes', 'Kids Parties', 'Sofas', 'Walls', 'Home Tours', 'DIY', 'Entertaining', 'Home Decor' ].map(renderTerm) }
              <div className='clearfix' />
            </div>
        </div>
      </div>
    );
  }
});
