import { useReducer, useEffect } from 'react';
import Link from 'umi/link';
import { connect } from 'dva';
import classNames from 'classnames';
import { numberToString, assetValuation } from '@/utils';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import { getNewAssetOverview } from '@/services/api';
import Account from './Account';
import styles from './index.less';

const lang = getLocale();

const initialState = {
  eyes: true,
  balances: {}
};

function reducer(state, payload) {
  return { ...state, ...payload };
}

const Overview = ({ cnyPrices }) => {
  const [state, setState] = useReducer(reducer, initialState);
  const { eyes, balances } = state;

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    const res = await getNewAssetOverview();
    const { code, data } = res;

    if (code === 200 && data) {
      setState({
        balances: data
      });
    }
  };

  const eyesClass = classNames('iconfont', {
    iconkejian: eyes,
    iconbukejian: !eyes
  });

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.total}>
          <div>
            <p>{formatMessage({ id: 'assets.total.balances' })}(BTC)</p>
            <label>{eyes ? assetValuation(cnyPrices, balances.total, 'BTC') : '*****'}</label>

            {lang.startsWith('zh') ? (
              <p>≈ {eyes ? `${assetValuation(cnyPrices, balances.total, 'CNY')} CNY` : '*****'}</p>
            ) : (
              <p>≈ {eyes ? `${numberToString(balances.total)} USD` : '*****'}</p>
            )}
          </div>
          <i className={eyesClass} onClick={() => setState({ eyes: !eyes })}></i>
        </div>
        <div className={styles.operate}>
          {/* <Link to="/uassets/search?type=recharge" className={styles.item}>
            <i className="iconfont iconchongzhi"></i>
            <p>{formatMessage({ id: 'assets.balances.recharge' })}</p>
          </Link>
          <Link to="/uassets/search?type=withdraw" className={styles.item}>
            <i className="iconfont icontixian"></i>
            <p>{formatMessage({ id: 'assets.balances.cash' })}</p>
          </Link> */}
          <Link to="/uassets/record" className={styles.item}>
            <i className="iconfont iconjilu"></i>
            <p>{formatMessage({ id: 'assets.record.link' })}</p>
          </Link>
          <Link to="/otc/quickTrading" className={styles.item}>
            <i className="iconfont iconCC"></i>
            <p>{formatMessage({ id: 'home.title.fiat' })}</p>
          </Link>
        </div>
      </div>
      <Account eyes={eyes} balances={balances} />
    </div>
  );
};

export default connect(({ trading }) => ({
  cnyPrices: trading.cnyPrices
}))(Overview);
