import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';

class ScrollTopBottomNotifier extends Component {
  static propTypes = {
    children: PropTypes.node,
    onBottom: PropTypes.func,
    onTop: PropTypes.func,
    offset: PropTypes.number
  }

  constructor(props) {
    super(props);

    this.state = {
      availableHeight: 0
    };
  }

  setAvailableHeight() {
    this.setState({
      availableHeight: findDOMNode(this).clientHeight // offsetHeight
    });
  }

  componentDidUpdate() {
    if (findDOMNode(this).clientHeight !== this.state.availableHeight) {
      this.setAvailableHeight();
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.setAvailableHeight);
    this.setAvailableHeight();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setAvailableHeight);
  }

  handleScroll(e) {
    if (e.target.scrollTop + this.state.availableHeight + this.props.offset >= e.target.scrollHeight) {
      this.props.onBottom();
    } else {
      if (e.target.scrollTop <= 0) {
        this.props.onTop();
      }
    }
  }

  render() {
    return (
      <div style={ { height: '100%', width: '100%', overflow: 'hidden', overflowY: 'auto' } } onScroll={ this.handleScroll.bind(this) }>
        { this.props.children }
      </div>
    );
  }

}

export default ScrollTopBottomNotifier;
