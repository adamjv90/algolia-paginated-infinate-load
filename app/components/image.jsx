import React, { PropTypes } from 'react';
import { History } from 'react-router';

export default React.createClass({
  mixins: [ History ],

  propTypes: {
    location: PropTypes.object,
    params: PropTypes.object
  },

  navigateTo() {
    this.history.replaceState(this.props.location.state, '/image/' + (parseInt(this.props.params.objectID, 10) + 1));
  },

  render() {
    return (
      <div>
        Image ID: { this.props.params.objectID }
        <div onClick={ this.navigateTo }>Next</div>
      </div>
    );
  }
});
