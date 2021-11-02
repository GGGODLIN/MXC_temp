import { useEffect } from 'react';
import { formatMessage } from 'umi-plugin-locale';
import { numberToString } from '@/utils';
import { getAssetSysBalance } from '@/services/api';
import { Toast } from 'antd-mobile';

import Form from './Form';

const Contract = ({ setState, transferItem, transferData, defaultCurrency, amount }) => {
  useEffect(() => {
    initData();
  }, []);

  const initData = async e => {
    const { balances, code } = await getAssetSysBalance({ sys: 'SWAP' });
    const transferData = [];
    let transferItem = {};

    if (code === 0) {
      balances.forEach((item, index) => {
        transferData.push({
          currency: item.currency,
          id: index + 1,
          icon: item.icon,
          pair: {
            from: {
              key: 'MAIN',
              name: formatMessage({ id: 'assets.exchange_account' }),
              currency: item.currency,
              value: numberToString(item.balances.MAIN ? item.balances.MAIN.available : 0),
              balancesLabelNode: formatMessage({ id: 'common.balance' })
            },
            to: {
              key: 'SWAP',
              name: formatMessage({ id: 'assets.swap_account' }),
              currency: item.currency,
              value: numberToString(item.balances.SWAP ? item.balances.SWAP.available : 0),
              balancesLabelNode: formatMessage({ id: 'common.balance' })
            }
          }
        });
      });

      if (defaultCurrency) {
        transferItem = transferData.find(item => item.currency === defaultCurrency) || transferData[0];
      } else {
        transferItem = transferData[0];
      }

      setState({
        transferData,
        transferItem
      });
    }
  };

  const onCoinChange = keys => {
    const item = transferData.find(item => item.currency === keys[0]);
    const { pair, id, currency } = item;
    const { from, to } = pair;
    const tempObj = { id, currency, pair: { from: {}, to: {} } };

    //保持交换对
    if (transferItem.pair.from.key === 'MAIN') {
      tempObj.pair.from = from;
      tempObj.pair.to = to;
    } else {
      tempObj.pair.from = to;
      tempObj.pair.to = from;
    }

    setState({ transferItem: tempObj });
  };

  const savetransferItem = async e => {
    const { balances, code } = await getAssetSysBalance({ sys: 'SWAP' });
    const item = balances.find(item => item.currency === transferItem.currency);

    if (code === 0) {
      if (transferItem.pair.from.key === 'SWAP') {
        transferItem.pair.from.value = numberToString(item.balances.SWAP ? item.balances.SWAP.available : 0);
        transferItem.pair.to.value = numberToString(item.balances.MAIN ? item.balances.MAIN.available : 0);
      } else {
        transferItem.pair.from.value = numberToString(item.balances.MAIN ? item.balances.MAIN.available : 0);
        transferItem.pair.to.value = numberToString(item.balances.SWAP ? item.balances.SWAP.available : 0);
      }

      setState({
        transferItem
      });
      Toast.success(formatMessage({ id: 'assets.transfer.success' }));
    }
  };

  return (
    <Form
      amount={amount}
      setState={setState}
      submitCallback={savetransferItem}
      transferItem={transferItem}
      transferData={transferData}
      onCoinChange={onCoinChange}
    />
  );
};

export default Contract;
