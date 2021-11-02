import { useReducer, useEffect } from 'react';
import { connect } from 'dva';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import { getNewAsset } from '@/services/api';
import { assetValuation } from '@/utils';
import Assets from './Assets';
import CoinHandle from './CoinHandle';
import ContractCoinList from './ContractCoinList';

const lang = getLocale();

const initialState = {
  list: [],
  allList: []
};

function reducer(state, payload) {
  return { ...state, ...payload };
}

const Contract = ({ eyes, balances, cnyPrices, checked, keyword, setFilterState }) => {
  const [state, setState] = useReducer(reducer, initialState);
  const { list } = state;

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async e => {
    const res = await getNewAsset('contract');
    const { code, data } = res;

    if (code === 200 && data) {
      setState({ list: data.assets });
    }
  };

  const assetsProps = {
    eyes,
    type: 'contract',
    label: formatMessage({ id: 'assets.total.balances' }),
    balance: balances.contract,
    assess: lang.startsWith('zh') ? `${assetValuation(cnyPrices, balances.contract, 'CNY')} CNY` : `${balances.contract} USD`
  };

  const renderList = list.filter(
    item =>
      (checked ? item.usdtTotal > 1 : true) &&
      (keyword ? (item.currencyDisplayName || item.currency).toLowerCase().includes(keyword.toLowerCase()) : true)
  );

  const coinListProps = {
    list: renderList,
    eyes,
    type: 'contract'
  };

  const handleProps = {
    setFilterState,
    checked
  };

  return (
    <>
      <Assets {...assetsProps} />
      <CoinHandle {...handleProps} />
      <ContractCoinList {...coinListProps} />
    </>
  );
};

export default connect(({ trading }) => ({
  cnyPrices: trading.cnyPrices
}))(Contract);
