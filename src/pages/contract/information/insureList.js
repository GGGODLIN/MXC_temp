import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { connect } from 'dva';
import styles from './common.less';
import { formatMessage, getLocale } from 'umi/locale';
import cs from 'classnames';
import { getRiskReserves, getFundingRate } from '@/services/contractapi';
import { timeToString } from '@/utils';
import Utils from '@/utils/swapUtil';
import { Picker, WingBlank, ListView, PullToRefresh } from 'antd-mobile';

const language = getLocale();
const dataSource = new ListView.DataSource({
  rowHasChanged: (row1, row2) => row1 !== row2
});
function reducer(state, action) {
  return {
    ...state,
    ...action.payload
  };
}

function Container({ dispatch, productList, location }) {
  const { symbol } = location.query;

  useEffect(() => {
    if (!productList) {
      dispatch({ type: 'information/getProductList' });
    }
  }, []);

  const [currentParams, dispatchCurrentParams] = useReducer(reducer, { page_num: 1, page_size: 10 });
  const [currentProduct, setCurrentProduct] = useState();
  useEffect(() => {
    if (productList) {
      const nextProduct = productList.find(product => product.symbol === symbol) || productList[0];
      setCurrentProduct(nextProduct);
      dispatchCurrentParams({ payload: { symbol: nextProduct.symbol } });
      getDataList({ ...currentParams, symbol: nextProduct.symbol });
    }
  }, [productList]);

  const [dataList, setDataList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const getDataList = useCallback(
    (params = currentParams, type) => {
      getRiskReserves(params).then(result => {
        if (result && result.code === 0) {
          if (type === 'refresh') {
            setTimeout(() => {
              setRefreshing(false);
            }, 500);
            setDataList([...result.data.resultList]);
          } else {
            setDataList([...dataList, ...result.data.resultList]);
          }

          if (result.data.currentPage === result.data.totalPage) {
            setLoaded(true);
          } else {
            dispatchCurrentParams({ payload: { page_num: params.page_num + 1 } });
            setLoaded(false);
          }
        }
      });
    },
    [currentParams]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatchCurrentParams({ payload: { page_num: 1 } });
    getDataList({ ...currentParams, page_num: 1 }, 'refresh');
  }, [currentParams]);

  const onEndReached = useCallback(() => {
    if (loaded) {
      return;
    }

    getDataList();
  }, [loaded, currentParams]);

  const pickerChangeHandle = useCallback(
    values => {
      const value = values[0];
      const nextProduct = productList.find(product => product.symbol === value);
      setCurrentProduct(nextProduct);
      dispatchCurrentParams({ payload: { page_num: 1, symbol: nextProduct.symbol } });
      getDataList({ ...currentParams, page_num: 1, symbol: nextProduct.symbol }, 'refresh');
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

  const CustomBody = useCallback(
    props => {
      return (
        <section className={styles['custom-body']}>
          <h3 className={styles.title}>{formatMessage({ id: 'swap.informationPage.fundAccount' })}</h3>

          <div className={cs(styles.explain, styles['marginBottom24'])}>
            <p>{formatMessage({ id: 'swap.informationPage.insureList.message1' })}</p>
            <p>{formatMessage({ id: 'swap.informationPage.insure.messageTwo' })}</p>
            <p>{formatMessage({ id: 'swap.informationPage.insureList.message3' })}</p>
          </div>

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
          {props.children}
        </section>
      );
    },
    [currentProduct]
  );

  const renderRow = item => {
    return (
      <section className={styles.item}>
        <div>
          <p className={styles.tip}>{formatMessage({ id: 'act.invite_datatime' })}</p>
          <p className={styles.value}>{timeToString(item.snapshotTime)}</p>
        </div>
        <div>
          <p className={styles.tip}>{formatMessage({ id: 'swap.informationPage.insure.balance' })}</p>
          <p className={styles.value}>
            {Utils.retainDecimals(item.available, { decimal: currentProduct ? currentProduct.amountScale : 4 })}
            {item.currency}
          </p>
        </div>
      </section>
    );
  };

  return (
    <div className={styles.content}>
      <WingBlank>
        <ListView
          className={cs(styles.list, styles['marginBottom24'])}
          dataSource={dataSource.cloneWithRows(dataList)}
          renderFooter={() => (
            <div className={styles.loading}>
              {!loaded ? formatMessage({ id: 'invite.posters.loading' }) : formatMessage({ id: 'invite.posters.endloading' })}
            </div>
          )}
          renderBodyComponent={() => <CustomBody />}
          renderRow={renderRow}
          onEndReached={onEndReached}
          onEndReachedThreshold={10}
          scrollRenderAheadDistance={500}
          pageSize={5}
          // useBodyScroll
          pullToRefresh={<PullToRefresh refreshing={refreshing} onRefresh={onRefresh} />}
          style={{ height: 'calc(100vh - 44px)' }}
        />
      </WingBlank>
    </div>
  );
}

export default connect(({ information }) => ({
  productList: information.productList
}))(Container);
