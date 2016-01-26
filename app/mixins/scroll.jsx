import isFunction from 'lodash/lang/isFunction';

export default function (elementId) {
  return {
    componentDidMount: function() {
      const el = document.getElementById(elementId);
      el.addEventListener('scroll', this.handleScrollChange);
      window.addEventListener('resize', this.handleScrollChange);
    },

    componentWillUnmount: function() {
      const el = document.getElementById(elementId);
      el.removeEventListener('scroll', this.handleScrollChange);
      window.removeEventListener('resize', this.handleScrollChange);
    },

    handleScrollChange: function() {
      const el = document.getElementById(elementId);

      if (isFunction(this.handleScroll)) {
        this.handleScroll({
          top: el.scrollTop
        });
      }
      else {
        this.setState({
          scroll: {
            top: el.scrollTop
          }
        });
      }
    },

    scrollTo: function(y) {
      const el = document.getElementById(elementId);
      el.scrollTop = y;
    }
  };
};
