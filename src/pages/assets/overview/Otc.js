import { useReducer, useEffect } from 'react';
import { connect } from 'dva';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import { assetValuation } from '@/utils';
import { getNewAsset } from '@/services/api';
import Assets from './Assets';
import CoinHandle from './CoinHandle';
import CoinList from './CoinList';

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
    const res = await getNewAsset('otc');
    const { code, data } = res;

    if (code === 200) {
      setState({ list: data.assets });
    }
  };

  const assetsProps = {
    eyes,
    type: 'otc',
    label: formatMessage({ id: 'assets.balances.otc' }),
    balance: balances.otc,
    assess: lang.startsWith('zh') ? `${assetValuation(cnyPrices, balances.otc, 'CNY')} CNY` : `${balances.otc} USD`
  };

  const renderList = list.filter(
    item =>
      (checked ? item.usdtTotal > 1 : true) &&
      (keyword ? (item.currencyDisplayName || item.currency).toLowerCase().includes(keyword.toLowerCase()) : true)
  );

  const coinListProps = {
    list: renderList,
    eyes,
    type: 'otc'
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
