import isUndefined from 'lodash/lang/isUndefined';
import each from 'lodash/collection/each';
import delay from 'lodash/function/delay';

export function track(data) {
  const props = [ 's_265_account', 'prop54', 'pfxID', 'channel', 'linkInternalFilters', 'mmxgo', 'pageName', 'prop1', 'prop3', 'prop2', 'eVar11', 'eVar17', 'authOverride', 'prop6custom', 'prop9', 'prop16', 'prop17', 'prop18', 'prop19', 'prop20', 'prop22', 'prop58', 'prop6custom' ];

  if (process.env.BROWSER) {
    if (isUndefined(window.bN) || isUndefined(window.s_265) || isUndefined(window.s_265.t)) return delay(track, 100, data);

    each(props, (prop) => {
      if (!isUndefined(window.s_265[prop])) delete window.s_265[prop];
    });

    Object.assign(window.s_265, { prop54: 'vault', pfxID: 'smp', channel: 'us.smpvault', linkInternalFilters: `javascript:,stylemepretty.com`, mmxgo: true, s_265_account: 'aolsmp,aolsvc' });
    Object.assign(window.s_265, data);

    window.s_265.t();

    // debug('app:track')(pick(window.s_265, props.concat(Object.keys(data))));

    if (window.bN) window.bN.view();
  }
}
