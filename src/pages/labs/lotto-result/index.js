import React from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-locale';

class LottoResult extends React.Component {
  render() {
    return <div>{formatMessage({ id: 'labs.title.lotto.result' })}</div>;
  }
}

export default connect(({ auth }) => ({
  user: auth.user
}))(LottoResult);
