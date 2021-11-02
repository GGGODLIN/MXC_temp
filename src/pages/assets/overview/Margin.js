import { useReducer, useEffect } from 'react';
import { connect } from 'dva';
import { getLocale } from 'umi-plugin-locale';
import { newMarginCoinList, newmarginAssetsBalance } from '@/services/api';
import { formatMessage } from 'umi-plugin-locale';
import { assetValuation } from '@/utils';
import MarginAssets from './MarginAssets';
import CoinHandle from './CoinHandle';
import MarginCoinList from './MarginCoinList';
import RegisterModal from '@/pages/margin/spot/RegisterModal';

const lang = getLocale();

const initialState = {
  list: []
};

function reducer(state, payload) {
  return { ...state, ...payload };
}

const marginAcountTemp = {
  accountName: '',
  stopOutPrice: '0',
  stopLine: '1.1',
  withdrawLine: '1.5',
  riskRate: '0',
  btcAmount: '0',
  usdtAmount: '0',
  cynAmount: '0',
  currencyAsset: {
    name: '',
    total: '0',
    available: '0',
    frozen: '0',
    borrow: '0',
    interest: '0'
  },
  marketAsset: {
    name: '',
    total: '0',
    available: '0',
    frozen: '0',
    borrow: '0',
    interest: '0'
  },
  isShowOpenAccount: false
};

const Margin = ({ eyes, isOpenMarginV2, marginChecking, user, dispatch, checked, keyword, setFilterState }) => {
  const [state, setState] = useReducer(reducer, initialState);
  const { list, isShowOpenAccount } = state;

  useEffect(() => {
    fetch();
    dispatch({ type: 'auth/checkMarginAccountState' });
  }, []);

  const fetch = async e => {
    const listRes = await newMarginCoinList();
    const balanceRes = await newmarginAssetsBalance({ accountType: 'STEP' });
    const listData = listRes.data;
    const balanceData = balanceRes.data;

    const _data = listData.map(item => {
      const symbol = item.symbol.replace('_', '/');
      return (
        balanceData.find(i => i.accountName === symbol) || {
          ...marginAcountTemp,
          accountName: item.symbol,
          notOpen: true
        }
      );
    });

    setState({ list: _data });
  };

  const openRegist = () => {
    setState({ isShowOpenAccount: !isShowOpenAccount });
  };

  const registerCallback = e => {
    dispatch({
      type: 'assets/getMarginAssetList'
    });
  };

  const renderList = list.filter(
    item => (checked ? item.usdtTotal > 1 : true) && (keyword ? item.accountName.toLowerCase().includes(keyword.toLowerCase()) : true)
  );

  const coinListProps = {
    list: renderList,
    eyes,
    type: 'margin'
  };

  const handleProps = {
    setFilterState,
    checked
  };

  return (
    <>
      {marginChecking && (
        <>
          {isOpenMarginV2 ? (
            <>
              <CoinHandle {...handleProps} />
              <MarginCoinList {...coinListProps} />
            </>
          ) : (
            <div style={{ fontSize: 14, padding: 20 }}>
              {formatMessage({ id: 'assets.margin.notOpen' })}，
              <a style={{ color: 'var(--up-color)' }} onClick={openRegist}>
                {formatMessage({ id: 'margin.title.open_account' })}
              </a>
            </div>
          )}
        </>
      )}
      {user.id && !isOpenMarginV2 && marginChecking && <RegisterModal isRegist={isShowOpenAccount} submitCallback={registerCallback} />}
    </>
  );
};

export default connect(({ trading, auth, margin }) => ({
  user: auth.user,
  cnyPrices: trading.cnyPrices,
  isRegist: margin.isRegist,
  isOpenMarginV2: auth.isOpenMarginV2,
  marginChecking: auth.marginChecking
}))(Margin);
