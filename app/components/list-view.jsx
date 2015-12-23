import React, { Component, PropTypes } from 'react';
import canUseDom from 'can-use-dom';
import update from 'react-addons-update';
// import first from 'lodash/array/first';
// import last from 'lodash/array/last';
import { findDOMNode } from 'react-dom';

class ScrollTopBottomNotifier extends Component {
  static propTypes = {
    children: PropTypes.node,
    onBottom: PropTypes.func,
    onTop: PropTypes.func,
    onChange: PropTypes.func
  }

  constructor(props) {
    super(props);

    this.state = {
      before: 0,
      after: 0,
      rows: props.children
    };
  }

  // componentWillReceiveProps(nextProps) {
  //   this.setRowsInView(nextProps.children);
  // }

  getScrollPos() {
    const node = findDOMNode(this);
    if (node) {
      return node.scrollTop;
    }
    return 0;
  }

  getViewportHeight() {
    const node = findDOMNode(this);
    if (node) {
      return node.clientHeight;
    }
    return 0;
  }

  setRowsInView(children) {
    if (canUseDom) {
      const scrollY = this.getScrollPos();
      const viewportHeight = this.getViewportHeight();
      let calculatedHeight = 0;
      let rowsToRender = [];

      for (let i = 0, len = children.length; i < len; i++) {
        const child = children[i];
        const childHeight = child.props.style.height;

        // if top of row is above bottom of viewport and bottom of row is bellow top of viewport
        if (calculatedHeight < scrollY + viewportHeight && calculatedHeight + childHeight > scrollY) {
          rowsToRender = update(rowsToRender, {
            $push: [child.props]
          });
        }

        calculatedHeight = calculatedHeight + childHeight;
      }


      // if (first(rowsToRender) > 0) {
      //   rowsToRender = update(rowsToRender, {
      //     $unshift: [first(rowsToRender) - 1]
      //   });
      // }
      //
      // if (last(rowsToRender) < children.length - 1) {
      //   rowsToRender = update(rowsToRender, {
      //     $push: [last(rowsToRender) + 1]
      //   });
      // }
      this.props.onChange(rowsToRender);
      this.setState({ rows: rowsToRender });
    } else {
      this.setState({ rows: children });
    }
  }

  // setAvailableHeight() {
  //   this.setState({
  //     availableHeight: findDOMNode(this).clientHeight // offsetHeight
  //   });
  // }
  //
  // componentDidUpdate() {
  //   const node = findDOMNode(this);
  //   if (node && node.clientHeight !== this.state.availableHeight) {
  //     this.setAvailableHeight();
  //   }
  //
  //   console.log(this.state.availableHeight, this.state.scrollTop);
  // }
  //

  handleWindowResize() {
    this.setRowsInView(this.props.children);
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleWindowResize.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize.bind(this));
  }

  handleScroll(e) {
    // 500 is threshold in px from bottom before onBottom is called, decided to hard code this to make things more simple
    if (e.target.scrollTop + this.getViewportHeight() + 500 >= e.target.scrollHeight) {
      this.props.onBottom();
    } else {
      if (e.target.scrollTop <= 0) {
        this.props.onTop();
      }
    }

    this.setRowsInView(this.props.children);
  }

  reduceRowHeights(rows) {
    let totalHeight = 0;
    for (let i = 0, len = rows.length; i < len; i++) {
      totalHeight = totalHeight + rows[i].props.style.height;
    }
    return totalHeight;
  }

  // beforeHeight() {
  //   const firstRow = first(this.state.rows) + 1;
  //   if (firstRow > 0) {
  //     const rowsBefore = this.props.children.slice(0, firstRow);
  //     return this.reduceRowHeights(rowsBefore);
  //   } else {
  //     return 0;
  //   }
  // }

  render() {
    return (
      <div style={ { height: '100%', width: '100%', overflow: 'hidden', overflowY: 'auto' } } onScroll={ this.handleScroll.bind(this) }>
        { this.props.children }
      </div>
    );
  }

}

export default ScrollTopBottomNotifier;
