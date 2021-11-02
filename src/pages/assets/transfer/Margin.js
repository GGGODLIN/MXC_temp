import { useEffect } from 'react';
import { connect } from 'dva';
import { Toast } from 'antd-mobile';
import { formatMessage } from 'umi-plugin-locale';
import { cutFloatDecimal } from '@/utils';
import { newMarginCoinList, getAssetBalance, newmarginAvlTransfer, newmarginAssetsBalance } from '@/services/api';

import Form from './Form';

const Margin = ({ setState, transferItem, transferData, defaultCurrency, amount, coinIcons, transferType }) => {
  useEffect(() => {
    initData();
  }, [coinIcons]);

  const initData = async e => {
    const res = await newMarginCoinList();
    const transferData = [];
    let transferItem = {};

    if (res.code === 200) {
      res.data.forEach((item, index) => {
        const symbol = item.symbol.replace('_', '/');
        const [currency, market] = item.symbol.split('_');

        transferData.push({
          currency: symbol,
          symbol,
          id: index + 1,
          icon: null,
          pair: {
            from: {
              key: 'MAIN',
              name: formatMessage({ id: 'assets.exchange_account' }),
              currency: market,
              value: 0,
              balancesLabelNode: '',
              asset: {}
            },
            to: {
              key: 'MARGIN_V2',
              name: formatMessage({ id: 'margin.title.account' }),
              currency: market,
              value: 0,
              balancesLabelNode: '',
              asset: {}
            }
          }
        });
      });

      if (defaultCurrency) {
        transferItem = transferData.find(item => item.currency === defaultCurrency) || transferData[0];
      } else {
        const _usdt = transferData.find(item => item.currency === 'USDT');
        transferItem = _usdt || transferData[0];
      }

      setState({
        transferData
      });

      getWithdrawPrice(transferItem);
    }
  };

  const marginBalancesNode = e => {
    return (
      <>
        <span>{formatMessage({ id: 'assets.transfer.balances.title' })}</span>
        <i className="iconfont iconguanyux" onClick={showTips} style={{ fontSize: 14, marginLeft: 5, verticalAlign: 'middle' }}></i>
      </>
    );
  };

  const showTips = e => {
    Toast.info(formatMessage({ id: 'assets.transfer.balances.desc' }));
  };

  const fixNum = (num, pair, currency) => {
    const unit = 8;
    return Number(cutFloatDecimal(num || 0, Math.min(unit, 8)));
  };

  const getWithdrawPrice = async (item, type) => {
    const balanceRes = await newmarginAssetsBalance({ accountType: 'STEP' });
    const hasAccount = balanceRes.data.length > 0 ? balanceRes.data.some(i => i.accountName === item.symbol) : true;
    const marginNumRes = hasAccount ? await newmarginAvlTransfer({ symbol: item.symbol.replace('/', '_') }) : {};
    const assetNumRes = await getAssetBalance({ currency: item.symbol.replace('/', ',') });

    const { pair, symbol, id } = item;
    const { from, to } = pair;
    const _from = pair.from;
    const tempObj = { id, symbol, currency: symbol, pair: { from: { ...from }, to: { ...to } } };
    const [currency, market] = item.symbol.split('/');

    //保持交换对
    tempObj.pair.from.name = transferItem.symbol ? transferItem.pair.from.name : _from.name;
    tempObj.pair.from.key = transferItem.symbol ? transferItem.pair.from.key : _from.key;

    tempObj.pair.to.name = transferItem.symbol ? transferItem.pair.to.name : to.name;
    tempObj.pair.to.key = transferItem.symbol ? transferItem.pair.to.key : to.key;

    // 保存杠杆可划转
    if (marginNumRes.code === 200) {
      const balances = marginNumRes.data;
      const _currency = balances.find(i => i.currency === currency);
      const _market = balances.find(i => i.currency === market);
      const currentCoin = item.pair.from.currency;
      const currentAsset = balances.find(i => i.currency === currentCoin);

      if (tempObj.pair.from.key === 'MARGIN_V2') {
        tempObj.pair.from.value = fixNum(currentAsset.avlAmount, symbol, currentCoin);

        tempObj.pair.from.asset = {
          [currency]: fixNum(_currency.avlAmount, symbol, currency),
          [market]: fixNum(_market.avlAmount, symbol, market)
        };

        tempObj.pair.from.balancesLabelNode = marginBalancesNode();
      } else {
        tempObj.pair.to.value = fixNum(currentAsset.avlAmount, symbol, currentCoin);

        tempObj.pair.to.asset = {
          [currency]: fixNum(_currency.avlAmount, symbol, currency),
          [market]: fixNum(_market.avlAmount, symbol, market)
        };

        tempObj.pair.to.balancesLabelNode = marginBalancesNode();
      }
    }
    // 保存币币可划转
    if (assetNumRes.code === 0) {
      const balances = assetNumRes.balances;
      const _currency = fixNum(balances[currency] ? balances[currency].available : 0, symbol, currency);
      const _market = fixNum(balances[market] ? balances[market].available : 0, symbol, market);
      const currentCoin = item.pair.from.currency;
      const currentAsset = fixNum(balances[currentCoin] ? balances[currentCoin].available : 0, symbol, currentCoin);

      if (tempObj.pair.from.key === 'MAIN') {
        tempObj.pair.from.value = currentAsset;

        tempObj.pair.from.asset = {
          [currency]: _currency,
          [market]: _market
        };

        tempObj.pair.from.balancesLabelNode = formatMessage({ id: 'common.balance' });
      } else {
        tempObj.pair.to.value = currentAsset;

        tempObj.pair.to.asset = {
          [currency]: _currency,
          [market]: _market
        };

        tempObj.pair.to.balancesLabelNode = formatMessage({ id: 'common.balance' });
      }
    }

    setState({
      transferItem: tempObj
    });

    if (type === 'submit') {
      Toast.success(formatMessage({ id: 'assets.transfer.success' }));
    }
  };

  const onCoinChange = keys => {
    const transferItem = transferData.find(item => item.currency === keys[0]);

    getWithdrawPrice(transferItem);
  };

  return (
    <Form
      amount={amount}
      setState={setState}
      submitCallback={getWithdrawPrice}
      transferItem={transferItem}
      transferData={transferData}
      onCoinChange={onCoinChange}
      transferType={transferType}
    />
  );
};

export default connect(({ assets }) => ({ coinIcons: assets.coinIcons }))(Margin);
