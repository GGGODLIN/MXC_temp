import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { WingBlank } from 'antd-mobile';
import { connect } from 'dva';
import styles from './common.less';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import cs from 'classnames';
import { getFundingRate, getTickers } from '@/services/contractapi';
import Utils from '@/utils/swapUtil';
import { Picker } from 'antd-mobile';
import { numberToString } from '@/utils';
const language = getLocale();

function Container({ dispatch, productList, location }) {
  const { symbol } = location.query;

  useEffect(() => {
    if (!productList) {
      dispatch({ type: 'information/getProductList' });
    }
  }, []);

  const [currentProduct, setCurrentProduct] = useState();
  useEffect(() => {
    if (productList) {
      const nextProduct = productList.find(product => product.symbol === symbol) || productList[0];
      nextProduct.isReverse = nextProduct.quoteCoin !== nextProduct.settleCoin;
      setCurrentProduct(nextProduct);
    }
  }, [productList]);

  const pickerChangeHandle = useCallback(
    values => {
      const value = values[0];
      const nextProduct = productList.find(product => product.symbol === value);
      if (nextProduct) {
        nextProduct.isReverse = nextProduct.quoteCoin !== nextProduct.settleCoin;
        setCurrentProduct(productList.find(product => product.symbol === value));
      }
    },
    [productList]
  );

  const [fundingDetail, setFundingDetail] = useState();
  const [ticker, setTicker] = useState();
  const [refreshMark, setRefreshMark] = useState(0);
  const [globalTimer, setGlobalTimer] = useState(null);
  useEffect(() => {
    let timer = null;

    if (currentProduct) {
      getData();

      timer = setInterval(() => {
        getData();
      }, 5000);

      setGlobalTimer(timer);

      function getData() {
        getFundingRate(currentProduct.symbol).then(result => {
          if (result && result.code === 0) {
            setFundingDetail(result.data || {});
          }
        });

        getTickers({ symbol: currentProduct.symbol }).then(result => {
          if (result && result.code === 0) {
            setTicker(result.data || {});
          }
        });
      }
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [currentProduct, refreshMark]);

  const pickerData = useMemo(() => {
    if (productList) {
      return productList.map(product => {
        return {
          label: language.startsWith('zh-') ? product.displayName : product.displayNameEn,
          value: product.symbol
        };
      });
    }

    return [];
  }, [productList]);

  // 打开picker是清楚定时器，关闭时开启定时器
  const onVisibleChange = useCallback(
    visible => {
      if (visible) {
        if (globalTimer) {
          clearInterval(globalTimer);
        }
      } else {
        setRefreshMark(refreshMark + 1);
      }
    },
    [globalTimer, refreshMark]
  );

  return (
    <>
      <div className={styles.content}>
        <WingBlank>
          <h3 className={styles.title}>{formatMessage({ id: 'swap.typeTitle.contractDetailTitle' })}</h3>
          <div className={styles['marginBottom24']}>
            <Picker
              data={pickerData}
              cols={1}
              value={currentProduct ? [currentProduct.symbol] : []}
              onChange={pickerChangeHandle}
              onVisibleChange={onVisibleChange}
              okText={formatMessage({ id: 'common.sure' })}
              dismissText={formatMessage({ id: 'common.cancel' })}
            >
              <div className={styles.select}>
                {currentProduct ? currentProduct.symbol : '--'}
                <i className={'iconfont icondropdown'}></i>
              </div>
            </Picker>
          </div>

          <div>
            {currentProduct && (
              <table className={cs(styles['contract-table'], styles['marginBottom24'])}>
                <tbody>
                  <tr>
                    <td>{formatMessage({ id: 'swap.common.contractName' })}</td>
                    <td>{language.startsWith('zh-') ? currentProduct.displayName : currentProduct.displayNameEn}</td>
                  </tr>
                  <tr>
                    <td>{formatMessage({ id: 'swap.type.title' })}</td>
                    <td>{formatMessage({ id: 'swap.type.value' })}</td>
                  </tr>
                  <tr>
                    <td>{formatMessage({ id: 'swap.coin.settle' })}</td>
                    <td>{currentProduct.settleCoin}</td>
                  </tr>
                  <tr>
                    <td>{formatMessage({ id: 'trade.list.price' })}</td>
                    <td>
                      {formatMessage(
                        { id: 'swap.informationPage.price.value' },
                        { base: currentProduct.symbol.split('_')[0], settle: currentProduct.symbol.split('_')[1] }
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>{formatMessage({ id: 'swap.informationPage.index.origin' })}</td>
                    <td>{currentProduct.indexOrigin.join(' ')}</td>
                  </tr>
                  <tr>
                    <td>{formatMessage({ id: 'swap.common.table.tagPrice' })}</td>
                    <td>{ticker && numberToString(ticker.fairPrice)}</td>
                  </tr>
                  <tr>
                    <td>{formatMessage({ id: 'swap.informationPage.contract.size' })}</td>
                    <td>{`${currentProduct.contractSize} ${
                      currentProduct.baseCoin === currentProduct.settleCoin ? currentProduct.quoteCoin : currentProduct.baseCoin
                    }`}</td>
                  </tr>
                  <tr>
                    <td>{formatMessage({ id: 'swap.informationPage.price.unit' })}</td>
                    <td>{numberToString(currentProduct.priceUnit)}</td>
                  </tr>
                  <tr>
                    <td>{formatMessage({ id: 'swap.informationPage.vol.unit' })}</td>
                    <td>{currentProduct.volUnit}</td>
                  </tr>
                  <tr>
                    <td>{formatMessage({ id: 'swap.typeTitle.imRate' })}</td>
                    <td>{Utils.retainDecimals(Utils.precision.times(currentProduct.initialMarginRate, 100), { decimal: 4 })}%</td>
                  </tr>
                  <tr>
                    <td>{formatMessage({ id: 'swap.limitChange.mmRate' })}</td>
                    <td>{Utils.retainDecimals(Utils.precision.times(currentProduct.maintenanceMarginRate, 100), { decimal: 4 })}%</td>
                  </tr>
                  <tr>
                    <td>{formatMessage({ id: 'swap.asset.riskLimit' })}</td>
                    <td>{formatMessage({ id: 'swap.informationPage.vol' }, { num: currentProduct.riskBaseVol })}</td>
                  </tr>
                  <tr>
                    <td>{formatMessage({ id: 'swap.informationPage.risk.incr.vol' })}</td>
                    <td>{formatMessage({ id: 'swap.informationPage.vol' }, { num: currentProduct.riskIncrVol })}</td>
                  </tr>
                  <tr>
                    <td>{formatMessage({ id: 'swap.informationPage.funding.rate.estimated' })}</td>
                    <td>{ticker && Utils.retainDecimals(Utils.precision.times(ticker.fundingRate, 100), { decimal: 4 })}%</td>
                  </tr>
                  <tr>
                    <td>{formatMessage({ id: 'swap.informationPage.fundingList.message4' })}</td>
                    <td>{formatMessage({ id: 'swap.informationPage.hours' }, { hours: fundingDetail && fundingDetail.collectCycle })}</td>
                  </tr>
                  <tr>
                    <td>{formatMessage({ id: 'swap.informationPage.isAdl' })}</td>
                    <td>{formatMessage({ id: 'swap.informationPage.isAdl.value' })}</td>
                  </tr>
                  <tr>
                    <td>{formatMessage({ id: 'swap.informationPage.settle' })}</td>
                    <td>{formatMessage({ id: 'swap.informationPage.settle.value' })}</td>
                  </tr>
                  <tr>
                    <td>{formatMessage({ id: 'swap.risk.cp.start' })}</td>
                    <td>
                      {currentProduct.isReverse
                        ? formatMessage({ id: 'swap.informationPage.risk.start.reverse.value' })
                        : formatMessage({ id: 'swap.informationPage.risk.start.value' })}
                    </td>
                  </tr>
                  <tr>
                    <td>{formatMessage({ id: 'swap.risk.cp.hold' })}</td>
                    <td>
                      {currentProduct.isReverse
                        ? formatMessage({ id: 'swap.informationPage.risk.hold.reverse.value' })
                        : formatMessage({ id: 'swap.informationPage.risk.hold.value' })}
                    </td>
                  </tr>
                  <tr>
                    <td>{formatMessage({ id: 'swap.informationPage.profit' })}</td>
                    <td>
                      {currentProduct.isReverse ? (
                        <>
                          {formatMessage({ id: 'swap.informationPage.profit.long.reverse' })}
                          <br />
                          {formatMessage({ id: 'swap.informationPage.profit.short.reverse' })}
                        </>
                      ) : (
                        <>
                          {formatMessage({ id: 'swap.informationPage.profit.long' })}
                          <br />
                          {formatMessage({ id: 'swap.informationPage.profit.short' })}
                        </>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>{formatMessage({ id: 'swap.common.table.realised' })}</td>
                    <td>
                      {currentProduct.isReverse ? (
                        <>
                          {formatMessage({ id: 'swap.informationPage.realised.long.reverse' })}
                          <br />
                          {formatMessage({ id: 'swap.informationPage.realised.short.reverse' })}
                        </>
                      ) : (
                        <>
                          {formatMessage({ id: 'swap.informationPage.realised.long' })}
                          <br />
                          {formatMessage({ id: 'swap.informationPage.realised.short' })}
                        </>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>{formatMessage({ id: 'swap.informationPage.maker' })}</td>
                    <td>{Utils.retainDecimals(Utils.precision.times(currentProduct.makerFeeRate, 100), { decimal: 4 })}%</td>
                  </tr>
                  <tr>
                    <td>{formatMessage({ id: 'swap.informationPage.taker' })}</td>
                    <td>{Utils.retainDecimals(Utils.precision.times(currentProduct.takerFeeRate, 100), { decimal: 4 })}%</td>
                  </tr>
                  <tr>
                    <td>{formatMessage({ id: 'swap.informationPage.liquidate' })}</td>
                    <td>{Utils.retainDecimals(Utils.precision.times(currentProduct.takerFeeRate, 100), { decimal: 4 })}%</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </WingBlank>
      </div>
    </>
  );
}

export default connect(({ information }) => ({
  productList: information.productList
}))(Container);
