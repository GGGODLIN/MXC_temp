import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { connect } from 'dva';
import Kline from './Kline';
import styles from './common.less';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import { Picker, WingBlank } from 'antd-mobile';
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
      setCurrentProduct(nextProduct);
    }
  }, [productList]);

  const pickerChangeHandle = useCallback(
    values => {
      const value = values[0];
      const nextProduct = productList.find(product => product.symbol === value);
      setCurrentProduct(nextProduct);
    },
    [productList]
  );

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

  return (
    <div className={styles.content}>
      <WingBlank>
        <h3 className={styles.title}>{formatMessage({ id: 'swap.informationPage.index.indexPrice' })}</h3>

        <div className={styles['marginBottom24']}>
          <Picker
            data={pickerData}
            cols={1}
            value={currentProduct ? [currentProduct.symbol] : []}
            onChange={pickerChangeHandle}
            okText={formatMessage({ id: 'common.sure' })}
            dismissText={formatMessage({ id: 'common.cancel' })}
          >
            <div className={styles.select}>
              {currentProduct ? currentProduct.symbol : '--'}
              <i className={'iconfont icondropdown'}></i>
            </div>
          </Picker>
        </div>

        <div>{currentProduct && productList && <Kline lineType="index" currentProduct={currentProduct} />}</div>

        <div className={styles.explain}>
          <p>{formatMessage({ id: 'swap.informationPage.indexPrice.message1' })}</p>
          <p>{formatMessage({ id: 'swap.informationPage.indexPrice.message2' })}</p>
          <p>{formatMessage({ id: 'swap.informationPage.indexPrice.message3' })}</p>
          <p>{formatMessage({ id: 'swap.informationPage.indexPrice.message4' })}</p>
        </div>
      </WingBlank>
    </div>
  );
}

export default connect(({ information }) => ({
  productList: information.productList
}))(Container);
