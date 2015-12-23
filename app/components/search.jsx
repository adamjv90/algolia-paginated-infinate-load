import React, { PropTypes } from 'react';
import update from 'react-addons-update';
import pluck from 'lodash/collection/pluck';
import filter from 'lodash/collection/filter';
// import { findDOMNode } from 'react-dom';
// import { first, isUndefined } from 'lodash';
import { History } from 'react-router';
import ImageLoader from 'react-imageloader';
// import Ad from 'components/ad';
import EqualLengthColumns from 'components/equal-length-column';
import AlgoliaPager from 'components/algolia-pager';
import ListView from 'components/list-view';
import LinkedStateMixin from 'react-addons-linked-state-mixin';

const domain = 'http://o.aolcdn.com/smp/is';

function resize(src, width, height) {
  if (!src) return src;
  const extRx = /\.(gif|jpg|jpeg|tiff|png)$/i;
  const ext = typeof src === 'string' ? src.match(extRx) : '';
  const _src = typeof src === 'string' ? src.replace(domain, '').replace(/\$![0-9]*?x?[0-9]*?\.[^$]+$/, Array.isArray(ext) && ext.length ? ext[0] : '') : '';
  return ext !== null ? domain + _src.replace(extRx, '') + '$!' + (width ? width : '') + 'x' + (height ? height : '') + ext[0] : false;
}

export default React.createClass({
  mixins: [ History, LinkedStateMixin ],

  contextTypes: {
    flux: PropTypes.object.isRequired
  },

  propTypes: {
    params: PropTypes.object,
    location: PropTypes.object
  },

  getInitialState() {
    return {
      search: this.props.params.query || '',
      availableWidth: 320
    };
  },

  componentDidMount() {
    window.addEventListener('resize', this.setAvailableWidth);
    this.setAvailableWidth();
  },

  componentWillUnmount() {
    window.removeEventListener('resize', this.setAvailableWidth);
  },

  componentDidUpdate(prevProps) {
    // console throws error if setstate happens here but it seems like the best way to update search term on pop of history
    this.updateSearch(prevProps);
  },

  updateSearch(prevProps) {
    if (this.props.params.query !== prevProps.params.query) {
      this.setState({ search: this.props.params.query });
    }
  },

  setAvailableWidth() {
    this.setState({ availableWidth: window.innerWidth });
  },

  handleSearch(e) {
    e.preventDefault();
    this.history.pushState(null, '/' + this.state.search);
  },

  // handleNext(page) {
  //   this.history.replaceState(null, '/' + page.query + '?page=' + page.number);
  // },
  //
  // handlePrevious(page) {
  //   this.history.replaceState(null, '/' + page.query + '?page=' + page.number);
  // },

  reachedListViewTop() {
    this.refs.pager.reachedTop();
  },

  reachedListViewBottom() {
    this.refs.pager.reachedBottom();
  },

  handlePageInView(page) {
    this.history.replaceState(null, '/' + page.query + '?page=' + page.number);
  },

  handleListViewChange(rows) {
    const page = this.props.location.query.page ? parseInt(this.props.location.query.page, 10) : 0;
    // need to figure out how to call this only when there are rows to display, at one point i was recieving an error about rows[0] beign undefined
    // pass in child properties as row elements, thats where number is coming from
    if (rows[0] && rows[0].number && page !== rows[0].number) {
      this.history.replaceState(null, '/' + (this.props.params.query || '') + '?page=' + rows[0].number);
    }
  },

  render() {
    // console.log('Search', 'render', this.state.search);
    const columnMargin = 10;
    const columnWidth = 300;
    const columnCount = Math.floor(this.state.availableWidth / columnWidth);
    const conatinerWidth = (columnWidth * columnCount) + ((columnCount - 1) * columnMargin);

    const pageHeadingHeight = 42;

    return (
      <div style={ { display: 'flex', flexDirection: 'column', height: '100%', width: '100%' } }>
        <div style={ { background: '#999', width: '100%', margin: '0 auto', overflow: 'hidden' } }>
          <form onSubmit={ this.handleSearch } autoComplete='off'>
            <input ref='search' autoComplete='off' placeholder='Search' style={ { textAlign: 'center', fontFamily: 'Open Sans', fontSize: 20, padding: '10px 0', oultine: 'none!important', width: '100%', margin: 0, border: 0 } } valueLink={ this.linkState('search') } />
          </form>
        </div>
        <div style={ { flex: 1, position: 'relative' } }>
          <div style={ { position: 'absolute', height: '100%', width: '100%' } }>
            <AlgoliaPager ref='pager' index='images' query={ this.props.params.query || '' } perPage={ 50 } page={ this.props.location.query.page ? parseInt(this.props.location.query.page, 10) : 0 } onNext={ this.handleNext } onPrevious={ this.handlePrevious } scrollOnUpdate={ this.props.location.action === 'POP' }>
              { (pages) => {
                // const firstPage = first(pages);
                return (
                  <ListView ref='scroll' onTop={ this.reachedListViewTop } onBottom={ this.reachedListViewBottom } onChange={ this.handleListViewChange }>
                    { pages.map((page) => {
                      const cells = update(filter(page.results, 'height').map((image) => {
                        const width = columnWidth;
                        const height = width / image.width * image.height;
                        if (height) {
                          return (
                            <ImageLoader
                              key={ image.objectID }
                              src={ resize(image.src, width) }
                              width={ width }
                              height={ height }
                              style={ { width: width, height: height } }
                              wrapper={ React.DOM.div }
                            />
                          );
                        } else {
                          return false;
                        }
                      }), {
                        // $unshift: [<Ad mn='93476277' width={ 300 } height={ 250 } key='ad' />]
                      });

                      // using a static method of the EqualLengthColumns component we can assign calculate columns and height of container so we can dynamically calculate rows in view before they exist in dom
                      const columns = EqualLengthColumns.prototype.constructor.statics.toColumns(cells, columnCount, columnMargin);

                      return (
                        <div style={ { width: conatinerWidth, margin: '0 auto', height: Math.ceil(Math.max.apply(Math, pluck(columns, 'height'))) + pageHeadingHeight } } number={ page.number } ref={ page.number } key={ page.number }>
                          <div style={ { backgroundColor: '#F89688', borderRadius: 2, color: '#ffffff', fontFamily: 'Open Sans', padding: 5, marginBottom: 10 } }>Page { page.number + 1 } { this.props.params.query ? 'for ' + this.props.params.query : '' }</div>
                          <EqualLengthColumns columns={ columns } margin={ columnMargin } />
                        </div>
                      );
                    }) }
                  </ListView>
                );
              } }
            </AlgoliaPager>
          </div>
        </div>
      </div>
    );
  }
});
