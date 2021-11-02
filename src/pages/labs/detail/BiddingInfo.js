import { connect } from 'dva';
import { Button, WhiteSpace } from 'antd-mobile';
import { gotoLogin } from '@/utils';
import Link from 'umi/link';
import { formatMessage } from 'umi-plugin-locale';
import router from 'umi/router';

import BiddingProgress from '../components/BiddingProgress';

import styles from './BiddingInfo.less';

const BiddingInfo = ({ info, state, user, getDetail, match }) => {
  const BiddingBtn = (info, state) => {
    const btnInfo = [
      { text: 'labs.title.unstart', disabled: true, type: 'primary' },
      { text: 'labs.title.bought_now', disabled: false, type: 'primary' },
      { text: 'labs.title.ended', disabled: true, type: 'warning' }
    ];

    let text = btnInfo[state].text;
    let disable = btnInfo[state].disabled;
    let type = btnInfo[state].type;

    // if (state === 1 && info.limitMax === 0 && info.applyQuantity === 0) {
    //   text = 'labs.title.buy_qualification';
    //   disable = true;
    //   type = 'warning';
    // }

    return (
      <Button
        type={type}
        disabled={disable}
        onClick={() => {
          router.push(`/halving/detail/${info.pid}/action`);
        }}
      >
        {formatMessage({ id: text })}
      </Button>
    );
  };

  const ProgressProps = {
    info,
    state,
    getDetail
  };
  return (
    <div>
      <BiddingProgress {...ProgressProps}></BiddingProgress>
      <WhiteSpace size="lg" />
      {!user.id && (
        <Button type="primary" onClick={() => gotoLogin()}>
          {formatMessage({ id: 'auth.to.signIn' })}
        </Button>
      )}
      {user.id && BiddingBtn(info, state)}

      <WhiteSpace />
      <p className={styles.link}>
        {user.id && (
          <Link to={'/halving/record'}>
            <i className={'iconfont iconjilu'}></i> {formatMessage({ id: 'labs.title.my_record' })}
          </Link>
        )}
      </p>
    </div>
  );
};

export default connect(({ auth }) => ({
  user: auth.user
}))(BiddingInfo);
