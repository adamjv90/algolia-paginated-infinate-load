import React from 'react';
import { Route } from 'react-router';
import { generateRoute } from 'utils/localized-routes';

export default (
  <Route component={ require('./components/app') }>
    { generateRoute({
      paths: ['/', '/:query'],
      component: require('./components/search')
    }) }
    <Route path='*' component={ require('./pages/not-found') } />
  </Route>
);
