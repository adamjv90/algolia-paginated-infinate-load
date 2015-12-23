import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import update from 'react-addons-update';
import algoliasearch from 'algoliasearch';
import { first, last, findWhere } from 'lodash';
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
      let promises = [this.query(this.state)];
      if (this.state.page > 0) {
        promises = update(promises, {
          $unshift: [this.query(update(this.state, { page: { $set: this.state.page - 1 } }))]
        });
      }

      Promise.all(promises).then((pages) => {
        this.setState({
          pages: pages
        });
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.doQueriesMatch(this.props, prevProps)) {
      // if browser hitsory change
      if (this.props.page !== prevProps.page && this.props.scrollOnUpdate) {
        velocity(findDOMNode(this.refs[this.props.page]), 'scroll', {
          container: findDOMNode(this.refs.scroll),
          duration: 0,
          delay: 0
        });
      } else {
        // scroll to next page when navigating to previose
        if (prevState.page > this.state.page) {
          velocity(findDOMNode(this.refs[this.state.page + 1]), 'scroll', {
            container: findDOMNode(this.refs.scroll),
            duration: 0,
            delay: 0
          });
        } else {
          // scroll to current page when loading in a page greater then 0 because we preload previous page
          if (!prevState.pages.length && this.state.page > 0 && this.state.pages.length) {
            velocity(findDOMNode(this.refs[this.state.page]), 'scroll', {
              container: findDOMNode(this.refs.scroll),
              duration: 0,
              delay: 0
            });
          }
        }
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
    if (!this.doQueriesMatch(this.props, newProps) || (this.doQueriesMatch(this.props, newProps) && !this.containsPage(newProps.page) && this.state.pages.length)) {
      this.setState(update(newProps, { loading: { $set: true }, pages: { $set: [] } }));

      let promises = [this.query(newProps)];

      if (!this.doQueriesMatch(this.props, newProps) && newProps.page > 0) {
        promises = update(promises, {
          $unshift: [this.query(update(newProps, { page: { $set: newProps.page - 1 } }))]
        });
      }

      Promise.all(promises).then((pages) => {
        findDOMNode(this.refs.scroll).scrollTop = 0;
        this.setState(update(this.state, {
          page: { $set: newProps.page || 0 },
          query: { $set: newProps.query },
          loading: { $set: false },
          pages: { $set: pages }
        }));
      });
    }
  }

  doQueriesMatch(props, newProps) {
    return props.query === newProps.query;
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

  reachedTop() {
    const curerntPage = first(this.state.pages);
    if (!this.state.loading && curerntPage.number > 0) {
      this.setState(update(this.state, {
        loading: { $set: true }
      }));

      const promises = [this.query(update(this.state, { page: { $set: curerntPage.number - 1 } }))];
      // if (curerntPage.number - 2 >= 0) {
      //   promises = update(promises, {
      //     $push: [this.query(update(this.state, { page: { $set: curerntPage.number - 2 } }))]
      //   });
      // }

      Promise.all(promises).then((pages) => {
        this.setState(update(this.state, {
          page: { $set: curerntPage.number - 1 },
          loading: { $set: false },
          pages: { $unshift: pages }
        }));
      });
    }
  }

  reachedBottom() {
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
      });
    }
  }

  render() {
    // console.log('AlgoliaPager', 'render', this.state.pages, this.props.children(this.state.pages));
    return (
      <div style={ { height: '100%', width: '100%' } }>
        { this.props.children(this.state.pages) }
      </div>
    );
  }

}

export default AlgoliaPager;
