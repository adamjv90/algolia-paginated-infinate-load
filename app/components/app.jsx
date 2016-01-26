import React, { PropTypes, Children, cloneElement } from 'react';
import classNames from 'classnames';
import Modal from 'components/modal';
import ResponsiveMixin from 'mixins/responsive';

if (process.env.BROWSER) require('styles/app.css');

export default React.createClass({
  mixins: [ ResponsiveMixin ],

  propTypes: {
    children: PropTypes.element,
    location: PropTypes.object
  },

  contextTypes: {
    flux: PropTypes.object.isRequired
  },

  getInitialState() {
    return { i18n: this.context.flux.getStore('locale').getState() };
  },

  componentDidMount() {
    const { flux } = this.context;
    flux.getStore('helmet').listen(this.handleTitleChange);
  },

  componentWillUnmount() {
    const { flux } = this.context;
    flux.getStore('helmet').unlisten(this.handleTitleChange);
  },

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
  },

  handleLocaleChange(i18n) {
    this.setState({ i18n });
  },

  handleTitleChange({ titleBase, title }) {
    document.title = titleBase + title;
  },

  cloneWithDimensions(children) {
    return Children.map(children, (child) => {
      return cloneElement(child, this.state);
    });
  },

  render() {
    const { location } = this.props;
    const isModal = (
      location.state &&
      location.state.modal &&
      this.previousChildren
    );
    return (
      <div style={ { height: '100%' } } className={ classNames({ tablet: this.state.isTablet, mobile: this.state.isMobile }) }>
        { isModal ?
          this.cloneWithDimensions(this.previousChildren) :
          this.cloneWithDimensions(this.props.children)
        }
        { isModal && (
          <Modal returnTo={ location.state.returnTo } location={ location }>
            { this.cloneWithDimensions(this.props.children) }
          </Modal>
        ) }
      </div>
    );
  }

});
