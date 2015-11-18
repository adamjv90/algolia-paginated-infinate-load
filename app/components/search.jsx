import React, { PropTypes } from 'react';
import { History } from 'react-router';
import ImageLoader from 'react-imageloader';
import EqualLengthColumns from 'components/equal-length-column';
import AlgoliaPager from 'components/algolia-pager';
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

  setAvailableWidth() {
    this.setState({ availableWidth: window.innerWidth });
  },

  handleSearch(e) {
    e.preventDefault();
    this.history.pushState(null, '/' + this.state.search);
  },

  handleNext(page) {
    this.history.pushState(null, '/' + page.query + '?page=' + page.number);
  },

  handlePrevious(page) {
    this.history.pushState(null, '/' + page.query + '?page=' + page.number);
  },

  render() {
    const columnMargin = 10;
    const columnWidth = 300;
    const columnCount = Math.floor(this.state.availableWidth / columnWidth);
    const conatinerWidth = (columnWidth * columnCount) + ((columnCount - 1) * columnMargin);

    return (
      <div style={ { display: 'flex', flexDirection: 'column', height: '100%', width: '100%' } }>
        <div style={ { background: '#999', width: '100%', margin: '0 auto', overflow: 'hidden' } }>
          <form onSubmit={ this.handleSearch }>
            <input style={ { textAlign: 'center', fontFamily: 'Open Sans', fontSize: 20, pading: 0, oultine: 'none!important', width: '100%', margin: 0, border: 0 } } valueLink={ this.linkState('search') } />
          </form>
        </div>
        <div style={ { flex: 1, position: 'relative' } }>
          <div style={ { position: 'absolute', height: '100%', width: '100%' } }>
            <AlgoliaPager index='images' query={ this.props.params.query || '' } perPage={ 50 } page={ this.props.location.query.page ? parseInt(this.props.location.query.page, 10) : 0 } onNext={ this.handleNext } onPrevious={ this.handlePrevious } scrollOnUpdate={ this.props.location.action === 'POP' }>
              { (pages) => {
                return pages.map((page) => {
                  return (
                    <div style={ { width: conatinerWidth, margin: '0 auto' } } number={ page.number }>
                      <div style={ { backgroundColor: '#F89688', borderRadius: 2, color: '#ffffff', fontFamily: 'Open Sans', padding: 5, marginBottom: 10 } }>Page { page.number + 1 } { this.props.params.query ? 'for ' + this.props.params.query : '' }</div>
                      <EqualLengthColumns columns={ columnCount } margin={ columnMargin }>
                        { page.results.map((image) => {
                          const width = columnWidth;
                          const height = width / image.width * image.height;
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
                        }) }
                      </EqualLengthColumns>
                    </div>
                  );
                });
              } }
            </AlgoliaPager>
          </div>
        </div>
      </div>
    );
  }
});
