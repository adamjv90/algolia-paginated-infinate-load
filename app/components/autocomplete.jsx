import React, { PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import partial from 'lodash/function/partial';
import isEqual from 'lodash/lang/isEqual';
import each from 'lodash/collection/each';
import canUseDom from 'can-use-dom';

const horsey = canUseDom ? require('horsey') : undefined;

if (process.env.BROWSER) require('styles/autocomplete.css');

export default React.createClass({
  displayName: 'Autocomplete',

  propTypes: {
    value: PropTypes.string,
    style: PropTypes.object,
    name: PropTypes.string,
    onChange: PropTypes.func,
    suggestions: PropTypes.array,
    disabled: PropTypes.bool,
    onKeyUp: PropTypes.func,
    onKeyDown: PropTypes.func
  },

  getDefaultProps() {
    return {
      value: '',
      onChange: () => {},
      onKeyDown: () => {},
      onKeyUp: () => {},
      style: {},
      disabled: false,

      // array of string or object, or function returning array
      suggestions: [],
      filterSuggestions: null,
      limitSuggestions: 3 / 0,
      getSuggestionText(suggestion) {
        return typeof suggestion === 'string' ? suggestion : suggestion.text;
      },
      getSuggestionValue(suggestion) {
        return typeof suggestion === 'string' ? suggestion : suggestion.value;
      },
      setSuggestion(el, value) {
        el.value = value;
      },
      anchorSuggestion: false,
      autoHideOnClick: true,
      autoHideOnBlur: true,
      autoShowOnUpDown: true,
      renderSuggestion(li, suggestion) {
        const props = this.props;
        li.innerText = li.textContent = props.getSuggestionText(suggestion);
      },
      appendSuggestionTo: process.env.BROWSER ? document.body : null,
      form: false
    };
  },

  getInitialState() {
    return this.props;
  },

  // shouldComponentUpdate() {
  //   return false;
  // },

  componentWillReceiveProps(props) {
    const input = findDOMNode(this.refs.input);
    const isFocused = input === document.activeElement;

    if (props.value !== this.state.value) {
      this.setState({ value: props.value });
    }

    if (!isEqual(props.suggestions, this.props.suggestions)) {
      this.horsey.clear();
      each(props.suggestions, this.horsey.add);
      if (isFocused) {
        this.horsey.show();
      }
    }
  },

  componentDidMount() {
    this.init();
  },

  componentWillUnmount() {
    this.destroy();
  },

  init() {
    const input = findDOMNode(this.refs.input);
    const state = this.state;

    this.horsey = horsey(input, {
      suggestions: state.suggestions,
      filter: state.filterSuggestions,
      limit: state.limitSuggestions,
      getText: state.getSuggestionText,
      getValue: state.getSuggestionValue,
      set: partial(state.setSuggestion, input),
      anchor: state.anchorSuggestion,
      autoHideOnClick: state.autoHideOnClick,
      autoHideOnBlur: state.autoHideOnBlur,
      autoShowOnUpDown: state.autoShowOnUpDown,
      render: state.renderSuggestion.bind(this),
      appendTo: typeof state.appendSuggestionTo === 'string' ? document.getElementById(state.appendSuggestionTo) : state.appendSuggestionTo,
      form: state.form
    });

    input.addEventListener('horsey-selected', this.handleSelect);
  },

  destroy() {
    // const input = this.refs.input.getDOMNode();

    this.horsey.destroy();

    // input.removeEventListener('horsey-selected', this.props.onChange);
  },

  handleSelect() {
    const input = findDOMNode(this.refs.input);
    this.props.onChange({ type: 'select', value: input.value });
  },

  handleChange(value) {
    this.props.onChange({ type: 'keyup', value });
  },

  render() {
    return (
      <div style={ Object.assign(this.props.style, { display: 'inline-block' }) }>
        <input ref='input' name={ this.props.name } valueLink={ {
          value: this.state.value,
          requestChange: this.handleChange
        } } onKeyDown={ this.props.onKeyDown } onKeyUp={ this.props.onKeyUp } disabled={ this.props.disabled } />
      </div>
    );
  }

});
