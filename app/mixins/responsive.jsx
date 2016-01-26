import canUseDom from 'can-use-dom';
import json2mq from 'json2mq';
const enquire = canUseDom && require('enquire.js');

const mobileQuery = json2mq({ screen: true, minWidth: 1139 });
const tabletQuery = json2mq({ screen: true, minWidth: 640, maxWidth: 1138 });
const desktopQuery = json2mq({ screen: true, maxWidth: 639 });

module.exports = {
  componentWillMount() {
    if (canUseDom) {
      enquire.register(mobileQuery, () => this.setState({ isMobile: false, isTablet: false, isDesktop: true, device: 'desktop' }));
      enquire.register(tabletQuery, () => this.setState({ isMobile: false, isTablet: true, isDesktop: false, device: 'tablet' }));
      enquire.register(desktopQuery, () => this.setState({ isMobile: true, isTablet: false, isDesktop: false, device: 'mobile' }));
    }
  },

  componentWillUnmount() {
    if (canUseDom) {
      enquire.unregister(mobileQuery);
      enquire.unregister(tabletQuery);
      enquire.unregister(desktopQuery);
    }
  }
};
