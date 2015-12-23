import React, { Component, PropTypes } from 'react';
import Modal from 'components/modal';

if (process.env.BROWSER) require('styles/app.css');

class App extends Component {

  static propTypes = {
    children: PropTypes.element,
    location: PropTypes.object
  }

  static contextTypes = {
    flux: PropTypes.object.isRequired
  }

  static childContextTypes = {
    messages: PropTypes.object.isRequired,
    locales: PropTypes.array.isRequired
  }

  state = { i18n: this.context
      .flux.getStore('locale').getState() }

  getChildContext() {
    const { i18n: { messages, locales } } = this.state;
    return { messages, locales };
  }

  componentDidMount() {
    const { flux } = this.context;

    flux.getStore('locale').listen(this.handleLocaleChange);
    flux.getStore('title').listen(this.handleTitleChange);
  }

  componentWillUnmount() {
    const { flux } = this.context;

    flux.getStore('locale').unlisten(this.handleLocaleChange);
    flux.getStore('title').unlisten(this.handleTitleChange);
  }

  componentWillReceiveProps() {
    const { location } = this.props;
    const isModal = (
      location.state &&
      location.state.modal &&
      this.previousChildren
    );
    if (!isModal) {
      this.previousChildren = this.props.children;
    }
  }

  handleLocaleChange = (i18n) => this.setState({ i18n })
  handleTitleChange = ({ title }) => document.title = title

  render() {
    const { location } = this.props;
    const isModal = (
      location.state &&
      location.state.modal &&
      this.previousChildren
    );
    return (
      <div style={ { height: '100%' } }>
        { isModal ?
          this.previousChildren :
          this.props.children
        }
        { isModal && (
          <Modal returnTo={ location.state.returnTo } location={ location }>
            { this.props.children }
          </Modal>
        ) }
      </div>
    );
  }

}

export default App;
