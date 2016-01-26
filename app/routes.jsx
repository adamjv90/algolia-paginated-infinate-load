import React from 'react';
import { Route } from 'react-router';

import { generateRoute } from 'utils/localized-routes';
// import { isConnected } from 'utils/routes-hooks';

// export default function (flux) { /* eslint react/display-name: 0 */
export default function () { /* eslint react/display-name: 0 */
  return (
    <Route component={ require('./components/app') }>
      { generateRoute({
        paths: [ '/', '/vault' ],
        component: require('./components/vault')
      }) }
      { generateRoute({
        paths: [ '/search/images', '/search/images/:query' ],
        component: require('./components/search')
      }) }
      { generateRoute({
        paths: [ '/image/:objectID' ],
        component: require('./components/image')
      }) }
      <Route path='*' component={ require('./pages/not-found') } />
    </Route>
  );
}
