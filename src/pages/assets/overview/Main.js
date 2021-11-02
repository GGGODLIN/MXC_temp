import { useReducer, useEffect } from 'react';
import { connect } from 'dva';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import { getNewAsset } from '@/services/api';
import Assets from './Assets';
import CoinHandle from './CoinHandle';
import CoinList from './CoinList';
import { assetValuation } from '@/utils';

const lang = getLocale();

const initialState = {
  list: []
};

function reducer(state, payload) {
  return { ...state, ...payload };
}

const Main = ({ eyes, balances, cnyPrices, checked, keyword, setFilterState }) => {
  const [state, setState] = useReducer(reducer, initialState);
  const { list } = state;

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    const res = await getNewAsset('spot');
    const { code, data } = res;

    if (code === 200) {
      setState({ list: data.assets });
    }
  };

  const assetsProps = {
    eyes,
    type: 'otc',
    label: formatMessage({ id: 'assets.balances.coin' }),
    balance: balances.spot,
    assess: lang.startsWith('zh') ? `${assetValuation(cnyPrices, balances.spot, 'CNY')} CNY` : `${balances.spot} USD`
  };

  const renderList = list.filter(
    item =>
      (checked ? item.usdtTotal > 1 || (item.marketType === 'UNLINE' && item.total > 0) : true) &&
      (keyword ? (item.currencyDisplayName || item.currency).toLowerCase().includes(keyword.toLowerCase()) : true)
  );

  const coinListProps = {
    list: renderList,
    eyes,
    type: 'main'
  };

  const handleProps = {
    setFilterState,
    checked
  };

  return (
    <>
      <Assets {...assetsProps} />
      <CoinHandle {...handleProps} />
      <CoinList {...coinListProps} />
    </>
  );
};

export default connect(({ trading }) => ({
  cnyPrices: trading.cnyPrices
}))(Main);
