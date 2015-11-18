import React, { Component, PropTypes, Children } from 'react';
import { findDOMNode } from 'react-dom';
import update from 'react-addons-update';
import algoliasearch from 'algoliasearch';
import { first, last, findWhere } from 'lodash';
import ScrollTopBottomNotifier from 'components/scroll-top-bottom-notifier';
import canUseDom from 'can-use-dom';

const velocity = canUseDom ? require('velocity-animate') : undefined;

const client = algoliasearch('MI4MSOKC78', '20dc1cdfee4ce4a4573f2a648ea97d79');

class AlgoliaPager extends Component {
  static propTypes = {
    index: PropTypes.string,
    query: PropTypes.string,
    page: PropTypes.number,
    children: PropTypes.func,
    perPage: PropTypes.number,
    params: PropTypes.object,
    onPrevious: PropTypes.func,
    onNext: PropTypes.func,
    scrollOnUpdate: PropTypes.bool
  }

  constructor(props) {
    super(props);

    this.state = {
      pages: [],

      page: this.props.page || 0,
      query: this.props.query || '',
      params: {},

      loading: false
    };
  }

  componentDidMount() {
    if (!this.state.pages.length) {
      this.query(this.state).then((page) => {
        this.setState({
          pages: [page]
        });
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.doQueriesMatch(prevProps)) {
      if (this.props.page !== prevProps.page && this.props.scrollOnUpdate) {
        velocity(findDOMNode(this.refs[this.props.page]), 'scroll', {
          container: findDOMNode(this.refs.scroll),
          duration: 200,
          delay: 0
        });
      }
    } else {
      // velocity(findDOMNode(this.refs[first(this.state.pages).number]), 'scroll', {
      //   container: findDOMNode(this.refs.scroll),
      //   duration: 200,
      //   delay: 0
      // });
      // console.log('scroll to top');
    }
  }

  componentWillReceiveProps(newProps) {
    if (!this.doQueriesMatch(newProps) || (this.doQueriesMatch(newProps) && !this.containsPage(newProps.page))) {
      this.setState(update(newProps, { loading: { $set: true }, pages: { $set: [] } }));
      this.query(newProps).then((page) => {
        findDOMNode(this.refs.scroll).scrollTop = 0;
        this.setState(update(this.state, {
          page: { $set: newProps.page || 0 },
          query: { $set: newProps.query },
          loading: { $set: false },
          pages: { $set: [page] }
        }));
      });
    }
  }

  doQueriesMatch(props) {
    return this.state.query === props.query;
  }

  containsPage(page) {
    return findWhere(this.state.pages, { number: page });
  }

  query(state) {
    return new Promise((resolve, reject) => {
      client.initIndex(this.props.index).search(state.query, {
        hitsPerPage: this.props.perPage,
        page: state.page
      }, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            hasNext: res.page + 1 < res.nbPages,
            query: state.query,
            number: res.page,
            results: res.hits
          });
        }
      });
    });
  }

  handlePrevious() {
    const curerntPage = first(this.state.pages);
    if (!this.state.loading && curerntPage.number > 0) {
      this.setState(update(this.state, {
        loading: { $set: true }
      }));

      this.query(update(this.state, { page: { $set: curerntPage.number - 1 } })).then((page) => {
        this.setState(update(this.state, {
          page: { $set: last(this.state.pages).number },
          loading: { $set: false },
          pages: { $unshift: [page] }
        }));

        this.props.onPrevious(page);
      });
    }
  }

  handleNext() {
    const curerntPage = last(this.state.pages);
    if (!this.state.loading && curerntPage.hasNext) {
      this.setState(update(this.state, {
        loading: { $set: true }
      }));
      this.query(update(this.state, { page: { $set: curerntPage.number + 1 } })).then((page) => {
        this.setState(update(this.state, {
          page: { $set: curerntPage.number + 1 },
          loading: { $set: false },
          pages: { $push: [page] }
        }));

        this.props.onNext(page);
      });
    }
  }

  render() {
    return (
      <div style={ { height: '100%', width: '100%' } }>
        <ScrollTopBottomNotifier ref='scroll' onTop={ this.handlePrevious.bind(this) } onBottom={ this.handleNext.bind(this) } offset={ 700 }>
          { Children.map(this.props.children(this.state.pages), (page) => {
            return <div ref={ page.props.number }>{ page }</div>;
          }) }
        </ScrollTopBottomNotifier>
      </div>
    );
  }

}

export default AlgoliaPager;
