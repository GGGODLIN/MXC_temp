import { useEffect, useReducer } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import classNames from 'classnames';
import { etfIndexSupportedResolutions, etfIndexApiIntervalMap } from '@/utils/kline';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import { getETFIndexKline, getETFKline } from '@/services/api';
import { lightVariables, darkVariables } from '@/layouts/theme.js';
import { useSize } from '@umijs/hooks';
import { init } from 'klinecharts';
import { Popover } from 'antd-mobile';

import styles from './OriginalKline.less';

const Item = Popover.Item;

const lang = getLocale();
let chart = null;
let timer = null;

const transInterval = i => {
  let _interval = '';
  switch (i) {
    case '1D':
      _interval = '1440';
      break;
    case '1W':
      _interval = '10080';
      break;
    case '1M':
      _interval = '302400';
      break;
    default:
      _interval = i;
  }

  return _interval;
};

const initialState = {
  interval: 1,
  barNum: 200,
  tabKey: '',
  visible: false
};

function reducer(state, payload) {
  return { ...state, ...payload };
}

const OriginalKline = ({ theme, dispatch, etfCurrency, etfItem }) => {
  const [state, setState] = useReducer(reducer, initialState);
  const [box, simpleKline] = useSize();
  const { interval, barNum, tabKey, visible } = state;

  useEffect(() => {
    chart = init(simpleKline.current);
    chart.setOffsetRightSpace(1);
    chart.setLeftMinVisibleBarCount(1);
    chart.setPrecision(4, 4);
    chart.setCandleStickChartType('real_time');

    chart.loadMore(timestamp => {
      if (moment(timestamp).isValid()) {
        const nextTime = moment(timestamp)
          .subtract(state.barNum * transInterval(state.interval), 'm')
          .format('X');

        getBar(nextTime, (timestamp - transInterval(state.interval) * 60000) / 1000, true);
      } else {
        chart.applyMoreData([], false);
      }
    });

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    setState({ tabKey: etfItem.symbol });
  }, [etfItem]);

  useEffect(() => {
    setOption();
  }, [theme]);

  useEffect(() => {
    if (chart) {
      chart.resize();
    }
  }, [box.width, box.height]);

  useEffect(() => {
    window.clearInterval(timer);

    const now = moment().format('X');
    const start = moment()
      .subtract(barNum * transInterval(interval), 'm')
      .format('X');

    getBar(start, now, false);

    timer = window.setInterval(() => {
      const now = moment().format('X');
      const start = moment()
        .subtract(barNum * transInterval(interval), 'm')
        .format('X');

      getBar(start, now, false);
    }, transInterval(interval) * 60000);
  }, [etfCurrency, tabKey, interval]);

  const getBar = (fromTime, toTime, isLoadMore) => {
    const curs = etfCurrency.split('_');
    const API = tabKey === 'INDEX' ? getETFIndexKline : getETFKline;
    if (!curs[0]) return false;

    return API({
      currency: curs[0],
      start: fromTime,
      end: toTime,
      type: etfIndexApiIntervalMap[interval]
    }).then(res => {
      if (!isLoadMore) {
        chart.clearData();
      }
      let { data, code } = res;

      if (code === 200) {
        let bars = [];
        for (let i = 0; i < data.length; ++i) {
          const p = Number(data[i].value);
          const barValue = {
            timestamp: data[i].time * 1000,
            close: p,
            open: p,
            high: p,
            low: p,
            volume: 0
          };
          bars.push(barValue);
        }

        if (isLoadMore) {
          chart.applyMoreData(bars);
        } else {
          chart.applyNewData(bars);
        }
      }
    });
  };

  const setOption = () => {
    const _option = { ...chart.getStyleOptions() };

    const gridColor = theme === 'dark' ? darkVariables['--divider-color'] : lightVariables['--divider-color'];
    const textColor = theme === 'dark' ? darkVariables['--main-text-2'] : lightVariables['--main-text-2'];
    const axisColor = theme === 'dark' ? darkVariables['--divider-color'] : lightVariables['--divider-color'];

    _option.grid.horizontal.color = gridColor;
    _option.grid.vertical.color = gridColor;
    _option.yAxis.axisLine.color = axisColor;
    _option.xAxis.axisLine.color = axisColor;
    _option.yAxis.tickText.color = textColor;
    _option.xAxis.tickText.color = textColor;
    _option.separator.color = axisColor;
    _option.technicalIndicator.line.colors = ['#c70440', '#ffba00', '#00baf2', '#ff00f0', '#50A300'];
    _option.floatLayer.prompt.candleStick.labels = lang.startsWith('zh') ? ['时间', '收'] : ['T', 'C'];
    _option.floatLayer.prompt.candleStick.text.color = textColor;
    _option.floatLayer.prompt.technicalIndicator.point.display = false;
    _option.realTime.timeLine.color = '#1890FF';
    _option.realTime.timeLine.size = 1;
    _option.realTime.timeLine.areaFillColor = 'rgba(24, 144, 255, 0.05)';
    _option.realTime.averageLine.display = false;

    chart.setStyleOptions(_option);
  };

  const setResolution = interval => {
    setState({
      interval
    });
  };

  const switchVisible = () => {
    setState({ visible: !visible });
  };

  const selectHandle = opt => {
    setState({
      visible: false,
      tabKey: opt.props.value
    });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.klineActions}>
            {Object.keys(etfIndexSupportedResolutions).map(item => {
              const el = etfIndexSupportedResolutions[item];

              return (
                <div
                  className={classNames(styles.klineActionsInterval, el == interval && styles.activeInterval)}
                  key={item}
                  onClick={e => setResolution(el)}
                >
                  <span>{item}</span>
                </div>
              );
            })}
          </div>
        </div>
        <Popover
          visible={visible}
          overlayClassName={styles.popover}
          onSelect={selectHandle}
          onVisibleChange={switchVisible}
          overlay={[
            <Item value={etfItem.symbol} style={{ color: tabKey === etfItem.symbol && 'var(--up-color)' }}>
              {lang.startsWith('zh') ? etfItem.name : etfItem.nameEn}
            </Item>,
            <Item value={'INDEX'} style={{ color: tabKey === 'INDEX' && 'var(--up-color)' }}>
              {formatMessage({ id: 'etfIndex.target.index' })}
            </Item>
          ]}
        >
          <div className={styles.symbol}>
            <span>
              {tabKey === etfItem.symbol
                ? lang.startsWith('zh')
                  ? etfItem.name
                  : etfItem.nameEn
                : formatMessage({ id: 'etfIndex.target.index' })}
            </span>
            <i className="iconfont icondrop"></i>
          </div>
        </Popover>
      </div>
      <div className={styles.TVChartContainer} ref={simpleKline}></div>
    </div>
  );
};

export default connect(({ trading, setting, margin, etfIndex }) => ({
  theme: setting.theme,
  showKlineOrDepth: trading.showKlineOrDepth,
  tCurrentPair: trading.currentPair,
  mCurrentPair: margin.currentPair,
  inFullscreen: false,
  ...etfIndex
}))(OriginalKline);
