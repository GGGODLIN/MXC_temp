import React from 'react';
import { connect } from 'dva';

class PushPush extends React.Component {
  render() {
    return <div>push</div>;
  }
}

export default connect(({ auth }) => ({
  user: auth.user
}))(PushPush);
