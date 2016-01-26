import React, { PropTypes } from 'react';
import Autocomplete from 'components/autocomplete';
import algoliasearch from 'algoliasearch';
import striptags from 'striptags';
import uniq from 'lodash/array/uniq';
import flatten from 'lodash/array/flatten';
import map from 'lodash/collection/map';
import each from 'lodash/collection/each';
import filter from 'lodash/collection/filter';
import debounce from 'lodash/function/debounce';
import reduce from 'lodash/collection/reduce';
import pick from 'lodash/object/pick';
import indexOf from 'lodash/array/indexOf';
import isArray from 'lodash/lang/isArray';

import colors from 'data/colors.json';

const client = algoliasearch('MI4MSOKC78', '20dc1cdfee4ce4a4573f2a648ea97d79');

export default React.createClass({
  contextTypes: {
    flux: PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      index: this.props.index ? this.props.index : 'images',
      query: '',
      color: '8',
      suggestions: []
    };
  },

  componentDidMount() {
    this.debounceQuery = debounce(this.query, 200);
  },

  handleInputKeyDown(e) {
    if (e.target.selectionStart === 0 && this.state.color && e.keyCode === 8) {
      this.setState({ color: false, suggestions: [] });
    }
  },

  handleInputKeyUp(e) {
    if (e.keyCode === 13) {
      this.submit();
    }
  },

  handleQueryChange(e) {
    this.setState({ query: e.value, suggestions: [] });
    if (e.type === 'keyup') {
      this.debounceQuery(e.value);
    }
  },

  query(query) {
    const params = {};

    if (this.state.color) {
      params.numericFilters = 'colors.group=' + this.state.color;
    }

    client.initIndex(this.state.index).search(query, Object.assign(params, {
      hitsPerPage: 50
    }), (err, res) => {
      if (err) {
        console.error(err);
      } else {
        switch (this.state.index) {
        case 'images':
        default:
          const attributes = [ 'tags3', 'location', 'tags2', 'etagsA' ];
          const sorted = reduce(res.hits, (tags, hit) => {
            const highlights = pick(hit._highlightResult, attributes);

            each(attributes, (attribute) => {
              if (isArray(highlights[attribute])) {
                const matched = map(filter(highlights[attribute], (tag) => tag.matchLevel !== 'none'), (tag) => tag.value);
                if (matched.length) {
                  tags[indexOf(attributes, attribute)].push(matched);
                }
              }
            });

            return tags;
          }, [ [], [], [], [] ]);

          this.setState({ suggestions: uniq(flatten(map(sorted, (tags) => map(flatten(tags), (tag) => striptags(tag))))) });
          break;
        }
      }
    });
  },

  submit() {
    console.log('submit', '/search/' + this.state.index + '/' + this.state.query + (this.state.color ? '?color=' + this.state.color : ''));
  },

  render() {
    const color = this.state.color ? colors[this.state.color] : false;
    const style = color ? { width: 'calc(100% - 25px)', marginLeft: 25 } : {};
    return (
      <div id='search-autocomplete'>
        { color ? <div className='color' style={ { background: 'rgb(' + color.red + ', ' + color.green + ', ' + color.blue + ')' } } /> : <div /> }
        <Autocomplete appendSuggestionTo='search-autocomplete' onKeyDown={ this.handleInputKeyDown } onKeyUp={ this.handleInputKeyUp } onChange={ this.handleQueryChange } value={ this.state.query } suggestions={ this.state.suggestions } style={ style } />
      </div>
    );
  }
});
