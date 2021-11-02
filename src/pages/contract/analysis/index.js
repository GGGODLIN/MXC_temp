import { connect } from 'dva';
import TopBar from '@/components/TopBar';
import { Select, Radio, DatePicker, Picker } from 'antd-mobile';
import styles from './index.less';
import { useEffect, useState, useReducer } from 'react';
import { getAssetsAnalysis } from '@/services/contractapi';
import HistoryPnl from './chart/historyPnl';
import HistoryPnlRate from './chart/historyPnlRate';
import DayPnl from './chart/dayPnl';
import AssetsChange from './chart/assetsChange';
import moment from 'moment';
import { getPercent, timeToString, plusPrefix, cutFloatDecimal } from '@/utils';
import { useUpdateLayoutEffect } from '@umijs/hooks';
import { last } from 'lodash';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import cs from 'classnames';
const reducer = (state, action) => {
  return { ...state, ...action };
};
const initData = {
  type: '3',
  currency: '',
  startTime: '',
  endTime: ''
};
const AssetsAnalysis = ({ depositCurrencies, dispatch }) => {
  const [analysisData, setAnalysisData] = useState({});
  const [analysisLastData, setAnalysisLastData] = useState({});
  const [showChart, setShowChart] = useState('1');
  const [params, setParams] = useReducer(reducer, initData);
  const [decimal, setDecimal] = useState(2);
  const [showData, setShowData] = useState(true);
  let [depositCurrenciesList, setDepositCurrenciesList] = useState([]);
  useUpdateLayoutEffect(() => {
    getAnalysisDataFun();
  }, [params]);
  useUpdateLayoutEffect(() => {
    getAnalysisDataFun();
  }, [showChart]);
  useUpdateLayoutEffect(() => {
    if (params['currency']) {
      setDecimal(params['currency'] === 'USDT' ? 2 : 8);
    }
  }, [params['currency']]);
  const getAnalysisDataFun = () => {
    let param = {
      currency: params['currency'],
      startTime: params['startTime']
        ? moment(params['startTime'])
            .startOf('day')
            .valueOf()
        : undefined,
      endTime: params['endTime']
        ? moment(params['endTime'])
            .endOf('day')
            .valueOf()
        : undefined
    };
    getAssetsAnalysis(params['type'], { ...param }).then(res => {
      if (res.code === 0) {
        const data = res.data;
        setAnalysisData(data);
        setAnalysisLastData({
          accumulateProfitAndLoss: last(data.accumulateProfitAndLossList),
          accumulateProfitAndLossRate: last(data.accumulateProfitAndLossRateList),
          dailyProfitAndLoss: last(data.dailyProfitAndLossList),
          dailyProfitAndLossRate: last(data.dailyProfitAndLossRateList),
          time: last(data.time),
          asset: last(data.asset)
        });
      }
    });
  };
  useEffect(() => {
    if (depositCurrencies.length == 0) {
      console.log(depositCurrencies, 'test');
      dispatch({
        type: 'information/reduceDepositCurrencies'
      });
    }
  }, []);
  useEffect(() => {
    if (depositCurrencies.length > 0) {
      let _depositCurrenciesList = depositCurrencies.map((v, index) => {
        return {
          label: <div>{v}</div>,
          value: v
        };
      });
      console.log(_depositCurrenciesList);
      setDepositCurrenciesList(_depositCurrenciesList);
      setParams({
        currency: 'USDT'
        // currency: depositCurrencies[0]
      });
    }
  }, [depositCurrencies]);
  const changeType = value => {
    console.log(
      moment()
        .subtract(1, 'day')
        .valueOf()
    );
    if (value === '4') {
      setParams({
        type: value,
        startTime: moment()
          .subtract(2, 'day')
          .valueOf(),
        endTime: moment()
          .subtract(1, 'day')
          .valueOf()
      });
    } else {
      setParams({ type: value });
    }
  };
  const chartNum = () => {
    const showNum = {
      '1': analysisLastData['accumulateProfitAndLoss'],
      '2': analysisLastData['accumulateProfitAndLossRate'],
      '3': analysisLastData['asset']
    };
    return (
      <div className={styles.chartTitle}>
        {formatMessage({
          id:
            showChart === '1'
              ? 'mc_contract_analysis_total_pnl'
              : showChart === '2'
              ? 'mc_contract_analysis_total_pnl_rate'
              : 'mc_contract_analysis_asstes_change'
        })}
        <span className={showNum[showChart] > 0 ? styles.upColor : styles.downColor}>
          {showChart === '1'
            ? showData
              ? ` ${plusPrefix(cutFloatDecimal(showNum[showChart], decimal))}${params['currency']}`
              : '****'
            : ''}
          {showChart === '2' ? (showData ? ` ${getPercent(showNum[showChart], true)}` : '****') : ''}
          {showChart === '3' ? (showData ? ` ${cutFloatDecimal(showNum[showChart], decimal)}${params['currency']}` : '****') : ''}
        </span>
      </div>
    );
  };
  return (
    <div>
      <TopBar>{formatMessage({ id: 'mc_contract_analysis_title' })}</TopBar>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div className={styles.handle}>
            <div className={styles.left}>
              <span style={{ marginRight: 8 }}>{formatMessage({ id: 'swap.asset.wallet' })}</span>
              <Picker
                data={depositCurrenciesList}
                cols={1}
                value={[params['currency']]}
                onOk={val => {
                  console.log(val);
                  setParams({ currency: val[0] });
                }}
              >
                <span className={styles.selectWrapper}>
                  <span>{params['currency']}</span>
                  <span className={styles.caret}></span>
                </span>
              </Picker>
            </div>
            <div className={styles.right}>
              <i onClick={() => setShowData(!showData)} className={`iconfont ${showData ? 'iconeye' : 'iconeye-invisible'}`}></i>
            </div>
          </div>
          <div className={styles.time}>
            {formatMessage({ id: 'mc_contract_analysis_data_update' })}：
            {analysisLastData && timeToString(analysisLastData.time, 'YYYY-MM-DD')}
          </div>
        </div>
        <div className={styles.mainWrapper}>
          <div className={styles.tabs}>
            <span onClick={() => changeType('3')} className={params['type'] === '3' ? styles.active : ''}>
              {formatMessage({ id: 'fin.common.all' })}
            </span>
            <span onClick={() => changeType('1')} className={params['type'] === '1' ? styles.active : ''}>
              {formatMessage({ id: 'mc_contract_analysis_latest_7_day' })}
            </span>
            <span onClick={() => changeType('2')} className={params['type'] === '2' ? styles.active : ''}>
              {formatMessage({ id: 'mc_contract_analysis_latest_30_day' })}
            </span>
            <span onClick={() => changeType('4')} className={params['type'] === '4' ? styles.active : ''}>
              {formatMessage({ id: 'mc_contract_analysis_custom_time' })}
            </span>
          </div>
          {params['type'] === '4' && (
            <div className={styles.datePicker}>
              <DatePicker
                mode="date"
                minDate={
                  new Date(
                    moment()
                      .subtract(179, 'day')
                      .valueOf()
                  )
                }
                maxDate={
                  new Date(
                    moment()
                      .subtract(1, 'day')
                      .valueOf()
                  )
                }
                title={formatMessage({ id: 'fin.common.start_time' })}
                okText={formatMessage({ id: 'common.sure' })}
                dismissText={formatMessage({ id: 'common.cancel' })}
                value={new Date(params['startTime'])}
                onChange={date => {
                  console.log(date, date.getTime());
                  setParams({ startTime: date.getTime() });
                }}
              >
                <span className={styles.selectWrapper}>
                  <span>{moment(params['startTime']).format('YYYY-MM-DD')}</span>
                  <span className={styles.caret}></span>
                </span>
              </DatePicker>
              <DatePicker
                mode="date"
                minDate={
                  new Date(
                    moment()
                      .subtract(179, 'day')
                      .valueOf()
                  )
                }
                maxDate={
                  new Date(
                    moment()
                      .subtract(1, 'day')
                      .valueOf()
                  )
                }
                title={formatMessage({ id: 'fin.common.end_time' })}
                okText={formatMessage({ id: 'common.sure' })}
                dismissText={formatMessage({ id: 'common.cancel' })}
                value={new Date(params['endTime'])}
                onChange={date => {
                  setParams({ endTime: date.getTime() });
                }}
              >
                <span className={styles.selectWrapper}>
                  <span>{moment(params['endTime']).format('YYYY-MM-DD')}</span>
                  <span className={styles.caret}></span>
                </span>
              </DatePicker>
            </div>
          )}
          <div className={styles.sliderTab}>
            <span onClick={() => setShowChart('1')} className={showChart === '1' ? styles.active : ''}>
              {formatMessage({ id: 'mc_contract_analysis_total_pnl' })}
            </span>
            <span onClick={() => setShowChart('2')} className={showChart === '2' ? styles.active : ''}>
              {formatMessage({ id: 'mc_contract_analysis_total_pnl_rate' })}
            </span>
            <span onClick={() => setShowChart('3')} className={showChart === '3' ? styles.active : ''}>
              {formatMessage({ id: 'mc_contract_analysis_asstes_change' })}
            </span>
            <span style={{ left: `calc(${(showChart - 1) * 33}% + .8vw)` }} className={styles.slider}></span>
          </div>
          <div className={styles.chart}>
            {chartNum()}
            {showChart === '1' && (
              <HistoryPnl
                showData={showData}
                decimal={decimal}
                data={analysisData.accumulateProfitAndLossList ? analysisData.accumulateProfitAndLossList : []}
                time={analysisData.time ? analysisData.time : []}
              />
            )}
            {showChart === '2' && (
              <HistoryPnlRate
                showData={showData}
                data={analysisData.accumulateProfitAndLossRateList ? analysisData.accumulateProfitAndLossRateList : []}
                time={analysisData.time ? analysisData.time : []}
              />
            )}
            {showChart === '3' && (
              <AssetsChange
                showData={showData}
                decimal={decimal}
                data={analysisData.asset ? analysisData.asset : []}
                time={analysisData.time ? analysisData.time : []}
              />
            )}
          </div>
        </div>
        <div className={styles.dailyPnl}>
          <div className={styles.chartTitle}>
            <div className={styles.title}>{formatMessage({ id: 'mc_contract_analysis_every_pnl' })}</div>
            <div>
              <span>
                {formatMessage({ id: 'mc_contract_analysis_current_pnl' })}{' '}
                <span className={analysisLastData && analysisLastData.dailyProfitAndLoss < 0 ? styles.downColor : styles.upColor}>
                  {`${
                    showData
                      ? `${analysisData && plusPrefix(cutFloatDecimal(analysisLastData.dailyProfitAndLoss, decimal))}
                                    ${params['currency']}`
                      : '****'
                  }`}
                </span>{' '}
              </span>
              <span>
                {formatMessage({ id: 'mc_contract_analysis_current_pnl_rate' })}
                <span className={analysisLastData && analysisLastData.dailyProfitAndLossRate < 0 ? styles.downColor : styles.upColor}>
                  {`${showData ? analysisLastData && getPercent(analysisLastData.dailyProfitAndLossRate, true) : '****'}`}
                </span>
              </span>
            </div>
          </div>
          <DayPnl
            decimal={decimal}
            showData={showData}
            data={analysisData.dailyProfitAndLossList}
            rate={analysisData.dailyProfitAndLossRateList}
            time={analysisData.time}
          />
        </div>
      </div>
    </div>
  );
};
export default connect(({ information }) => ({ depositCurrencies: information.depositCurrencies }))(AssetsAnalysis);
