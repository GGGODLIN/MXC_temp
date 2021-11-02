import React from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-locale';

class LottoRules extends React.Component {
  render() {
    return <div>{formatMessage({ id: 'labs.title.lotto.rule' })}</div>;
  }
}

export default connect(({ auth }) => ({
  user: auth.user
}))(LottoRules);
