import React, { useEffect } from 'react';
import { connect } from 'dva';

const layout = ({ children, dispatch, location }) => {
  console.log('location', location);
  useEffect(() => {
    if (location.pathname !== '/uassets/overview') {
      dispatch({
        type: 'assets/getOverview'
      });
    }
  }, [location.pathname]);

  return <>{children}</>;
};
export default connect(() => ({}))(layout);
