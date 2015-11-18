import React, { Component, PropTypes } from 'react';

if (process.env.BROWSER) require('styles/app.css');

class App extends Component {

  static propTypes = { children: PropTypes.element }
  static contextTypes = { flux: PropTypes.object.isRequired }

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

  handleLocaleChange = (i18n) => this.setState({ i18n })
  handleTitleChange = ({ title }) => document.title = title

  render() {
    const { children } = this.props;

    return (
      <div style={ { height: '100%' } }>
        { children }
      </div>
    );
  }

}

export default App;
