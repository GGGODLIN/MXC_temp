import { useEffect } from 'react';
import { formatMessage } from 'umi-plugin-locale';
import { numberToString } from '@/utils';
import { getAssetSysBalance } from '@/services/api';
import { Toast } from 'antd-mobile';

import Form from './Form';

const Otc = ({ setState, transferItem, transferData, amount, defaultCurrency }) => {
  useEffect(() => {
    initData();
  }, []);

  const initData = async e => {
    const { balances, code } = await getAssetSysBalance({ sys: 'OTC' });
    const transferData = [];
    let transferItem = {};

    if (code === 0 && balances.length) {
      balances.forEach((item, index) => {
        transferData.push({
          currency: item.currency,
          id: index + 1,
          icon: item.icon,
          pair: {
            from: {
              key: 'MAIN',
              name: formatMessage({ id: 'assets.exchange_account' }),
              value: numberToString(item.balances.MAIN ? item.balances.MAIN.available : 0),
              currency: item.currency,
              balancesLabelNode: formatMessage({ id: 'common.balance' })
            },
            to: {
              key: 'OTC',
              name: formatMessage({ id: 'assets.fiat_account' }),
              value: numberToString(item.balances.OTC ? item.balances.OTC.available : 0),
              currency: item.currency,
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
    const { balances, code } = await getAssetSysBalance({ sys: 'OTC' });
    const item = balances.find(item => item.currency === transferItem.currency);

    if (code === 0) {
      if (transferItem.pair.from.key === 'OTC') {
        transferItem.pair.from.value = numberToString(item.balances.OTC ? item.balances.OTC.available : 0);
        transferItem.pair.to.value = numberToString(item.balances.MAIN ? item.balances.MAIN.available : 0);
      } else {
        transferItem.pair.from.value = numberToString(item.balances.MAIN ? item.balances.MAIN.available : 0);
        transferItem.pair.to.value = numberToString(item.balances.OTC ? item.balances.OTC.available : 0);
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

export default Otc;
