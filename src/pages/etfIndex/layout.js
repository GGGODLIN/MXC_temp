import React, { useEffect } from 'react';
import withRouter from 'umi/withRouter';
import { connect } from 'dva';

const Layout = ({ children, dispatch, location, etfCurrency, symbols }) => {
  const { hash } = location;
  const hashCurrency = hash ? hash.split('#')[1] : '';
  const etfItem = symbols.length ? symbols.find(el => el.symbol === hashCurrency) || symbols[0] : {};

  useEffect(() => {
    if (etfItem.symbol) {
      window.location.hash = etfItem.symbol;

      dispatch({
        type: 'etfIndex/save',
        payload: {
          etfItem,
          etfCurrency: etfItem.symbol
        }
      });
    }
  }, [etfItem]);

  return <>{children}</>;
};

export default withRouter(
  connect(({ etfIndex, auth }) => ({
    ...etfIndex,
    user: auth.user
  }))(Layout)
);
