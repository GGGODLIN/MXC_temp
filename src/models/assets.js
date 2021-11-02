import { getAssetsOverview, getAssetBalance } from '@/services/api';
import { cutFloatDecimal } from '@/utils';

const mainAssets = ['MX', 'BTC', 'USDT', 'ETH', 'EOS'];

export default {
  namespace: 'assets',

  state: {
    allList: [], //全量币种资产列表
    list: [], //展示的币种资产列表
    USDTETH: {},
    USDTTRX: {},
    BTCLOOP: {},
    balances: {
      //资产
      revenue: 0,
      millionUSDT: 0,
      mxBalances: 0,
      btcValue: 0,
      cnyValue: 0,
      usdValue: 0,
      discount: {},
      otc: {
        btcValue: 0,
        cnyValue: 0,
        usdValue: 0
      },
      contract: {
        btcValue: 0,
        cnyValue: 0,
        usdValue: 0
      },
      main: {
        btcValue: 0,
        cnyValue: 0,
        usdValue: 0
      }
    },
    currentPairBalance: {},
    withdrawFormValues: {},
    coinIcons: {}
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    },
    saveAssetBalance(state, { payload }) {
      return {
        ...state,
        currentPairBalance: payload || {}
      };
    }
  },

  effects: {
    *getOverview(_, { call, put, select }) {
      const response = yield call(getAssetsOverview);
      const { code, assetInfo, revenue, millionUSDT, discount } = response;
      const { assetList, btcValue, cnyValue, usdValue, otc = null, contract = null } = assetInfo;
      const coinIcons = {};
      const otcValue = otc || {
        btcValue: 0,
        cnyValue: 0,
        usdValue: 0
      };
      const contractValue = contract || {
        btcValue: 0,
        cnyValue: 0,
        usdValue: 0
      };
      const balances = {
        discount,
        revenue,
        millionUSDT,
        mxBalances: 0,
        btcValue: cutFloatDecimal(btcValue + otcValue.btcValue + contractValue.btcValue, 8),
        cnyValue: cutFloatDecimal(cnyValue + otcValue.cnyValue + contractValue.cnyValue, 2),
        usdValue: cutFloatDecimal(usdValue + otcValue.usdValue + contractValue.usdValue, 2),
        otc: otcValue,
        contract: contractValue,
        main: {
          btcValue,
          cnyValue,
          usdValue
        }
      };
      if (code === 0) {
        assetList.map(item => {
          item.vcoinNameEn = item.vcoinNameEn.toUpperCase();

          //添加主币标识
          item.isMain = mainAssets.includes(item.vcoinNameEn) ? 1 : 0;

          //交易对
          item.markets = item.marketName
            ? item.marketName.split(',').map(el => ({
                vcoinNameEn: item.vcoinNameEn,
                market: el
              }))
            : null;
          //mx
          if (item.vcoinNameEn === 'MX') {
            balances.mxBalances = item.balanceAmount;
          }

          //保持币种图标
          coinIcons[item.vcoinNameEn] = item.icon;

          item.recharge = false;
          item.cash = false;

          return item;
        });

        //主币排序
        assetList.sort((a, b) => {
          return b.isMain - a.isMain;
        });

        const USDTETH = assetList.find(item => item.vcoinNameEn === 'USDT-ETH');
        const USDTTRX = assetList.find(item => item.vcoinNameEn === 'USDT-TRX');
        const BTCLOOP = assetList.find(item => item.vcoinNameEn === 'BTC-LOOP');
        const list = assetList.filter(item => {
          return item.vcoinNameEn !== 'USDT-ETH' && item.vcoinNameEn !== 'USDT-TRX' && item.vcoinNameEn !== 'BTC-LOOP';
        });

        yield put({
          type: 'save',
          payload: {
            list,
            USDTETH,
            USDTTRX,
            BTCLOOP,
            balances,
            coinIcons,
            allList: list
          }
        });
      }
    },
    *getAssetBalance({ payload }, { call, put, select }) {
      const response = yield call(getAssetBalance, payload);
      const { code, msg, ...rest } = response;
      yield put({
        type: 'saveAssetBalance',
        payload: rest
      });
    }
  }
};
