import { useEffect, useReducer } from 'react';
import { connect } from 'dva';
import { Radio } from 'antd';
import { supportedResolutions, apiIntervalMap } from '@/utils/kline';
import cn from 'classnames';
import moment from 'moment';
// import * as klinecharts from 'D:/work/original-kline/klinechart/index.js';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import { getKlineHistory } from '@/services/api';
import socket, { mainSocketSend } from '@/services/main-socket';
import { useSize } from '@umijs/hooks';

import styles from './OriginalKline.less';

let chart = null;
const lang = getLocale();

const defaultRanges = [
  { label: '5min', value: '5' },
  { label: '15min', value: '15' },
  { label: '1hour', value: '60' },
  { label: '8hour', value: '480' },
  { label: '1day', value: '1D' }
];

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

socket.on('push.kline', res => {
  try {
    if (!window.location.pathname.startsWith('/trade') && !window.location.pathname.startsWith('/margin')) {
      console.error('trade page off');
      return;
    }
    const { data } = res;
    if (!data) {
      throw new Error('');
    }
    let bar = {
      timestamp: data.t * 1000,
      open: data.o,
      high: data.h,
      low: data.l,
      close: data.c,
      volume: Number(data.q),
      turnover: data.c * Number(data.q)
    };
    const _dataList = chart.getDataList();
    const _pos = bar.timestamp > _dataList[_dataList.length - 1].timestamp ? _dataList.length : _dataList.length - 1;
    chart.addData(bar, _pos);
  } catch (err) {
    console.error('trade kline push error');
  }
});

const initialState = {
  interval: window.localStorage.getItem('mxc.kline.interval') || '15',
  barNum: 300,
  bars: []
};

function reducer(state, payload) {
  return { ...state, ...payload };
}

const OriginalKline = ({ theme, showKlineOrDepth, dispatch, currentPair, interval = '1500' }) => {
  const [state, setState] = useReducer(reducer, initialState);
  // const simpleKline = useRef(null);
  const [box, simpleKline] = useSize();
  useEffect(() => {
    const symbol = `${currentPair.currency}_${currentPair.market}`;
    chart = window.klinecharts.init(simpleKline.current);
    chart.setSubIndicatorType('NO');
    chart.setMaxRange(980);
    chart.setMinRange(24);
    chart.setIndicatorParams('VOL', []);
    return () => {
      socket.emit('unsub.kline', {
        symbol: symbol,
        interval: apiIntervalMap[interval]
      });
      chart.clearData();
    };
  }, []);

  useEffect(() => {
    setOption();
  }, [theme]);

  useEffect(() => {
    if (chart) {
      chart.setDefaultRange(Math.floor((90 * box.width) / 600) || 70);
      chart.resize();
    }
  }, [box.width, box.height]);

  useEffect(() => {
    const symbol = `${currentPair.currency}_${currentPair.market}`;
    if (window.location.hash.slice(1) === symbol) {
      const now = moment().format('x');
      const start = moment()
        .subtract(state.barNum * transInterval(interval), 'm')
        .format('x');

      getBar(start, now, false);
      mainSocketSend({
        channel: 'sub.kline',
        message: {
          symbol: symbol,
          interval: apiIntervalMap[interval]
        }
      });
      chart.loadMore(timestamp => {
        const nextTime = moment(timestamp)
          .subtract(state.barNum * transInterval(interval), 'm')
          .format('x');
        getBar(nextTime, timestamp - transInterval(interval) * 60000, true);
      });
      chart.setNumberScale(currentPair.priceScale, currentPair.quantityScale, currentPair.h);
      chart.calcChartDimensions();
    }
  }, [currentPair.currency, currentPair.market, interval]);

  const getBar = (fromTime, toTime, isLoadMore) => {
    const symbol = `${currentPair.currency}_${currentPair.market}`;
    const params = {
      symbol: symbol,
      interval: apiIntervalMap[interval],
      start: fromTime,
      end: toTime
    };

    getKlineHistory(params).then(res => {
      if (!isLoadMore) {
        chart.clearData();
      }
      let data = res.data;
      if (!data || (data.s !== 'ok' && data.s !== 'no_data')) {
        // throw new Error('');
        console.error('fetch bar error');
        data = { s: 'no_data' };
      }
      let bars = [];
      if (data.s !== 'no_data') {
        for (let i = 0; i < data.t.length; ++i) {
          const p = Number(data.c[i]);
          const barValue = {
            timestamp: data.t[i] * 1000,
            close: p,
            open: p,
            high: p,
            low: p,
            turnover: p * Number(data.q[i])
          };
          if (data.o) {
            barValue.open = Number(data.o[i]);
          }
          if (data.h) {
            barValue.high = Number(data.h[i]);
          }
          if (data.l) {
            barValue.low = Number(data.l[i]);
          }
          if (data.q) {
            barValue.volume = Number(data.q[i]);
          }
          bars.push(barValue);
        }
        if (isLoadMore) {
          chart.addData(bars, 0);
        } else {
          chart.addData(bars);
        }
      } else {
        // 第三个参数表示无更多数据
        chart.addData(bars, 0, true);
      }
    });
  };

  const setOption = () => {
    const gridColor = theme === 'dark' ? '#33424d' : '#F2F6FA';
    const mainGreen = '#41b37d';
    const mainRed = '#DF4E4E';
    const textColor = theme === 'dark' ? '#7f868f' : '#a2a8af';
    const HighestLowestPrice = theme === 'dark' ? '#e6ebef' : '#666666';
    const axisColor = theme === 'dark' ? '#45515b' : '#c2c8cf';
    const options = {
      grid: true,
      candle: {
        increasingColor: mainGreen,
        decreasingColor: mainRed
      },
      lastPriceMark: {
        increasingColor: mainGreen,
        decreasingColor: mainRed,
        line: {
          display: true
        }
      },
      highestPriceMark: {
        color: HighestLowestPrice
      },
      lowestPriceMark: {
        color: HighestLowestPrice
      },
      indicator: {
        increasingColor: 'rgba(65,179,125,0.6)',
        decreasingColor: 'rgba(223,78,78,0.6)',
        lineColors: ['#c70440', '#ffba00', '#00baf2', '#ff00f0', '#50A300']
      },
      xAxis: {
        line: {
          color: axisColor
        },
        tick: {
          text: {
            color: textColor
          },
          line: {
            color: textColor
          }
        },
        separatorLine: {
          display: true,
          size: 1,
          color: gridColor,
          style: 'solid'
        }
      },
      yAxis: {
        position: 'right',
        line: {
          color: axisColor
        },
        tick: {
          text: {
            position: 'inside',
            color: textColor
          },
          line: {
            color: textColor
          }
        },
        separatorLine: {
          display: true,
          size: 1,
          color: gridColor,
          style: 'solid'
        }
      },
      tooltip: {
        cross: {
          display: true,
          lineCircle: false,
          line: {
            style: 'dash',
            color: '#767988'
          }
        },
        data: {
          displayRule: 'follow_cross',
          base: {
            showType: 'float',
            labels: lang.startsWith('zh') ? ['时间', '开', '收', '高', '低', '成交量'] : ['T', 'O', 'C', 'H', 'L', 'A'],
            values: null,
            text: {
              size: 12,
              color: '#898989',
              marginLeft: 8,
              marginTop: 6,
              marginRight: 8,
              marginBottom: 0
            },
            floatRect: {
              paddingLeft: 0,
              paddingRight: 0,
              paddingTop: 0,
              paddingBottom: 6,
              left: 8,
              top: 8,
              right: 8,
              borderRadius: 4,
              borderSize: 1,
              borderColor: '#444444',
              fillColor: '#202020'
            }
          },
          indicator: {
            text: {
              size: 12,
              color: '#898989',
              marginTop: 6,
              marginRight: 8,
              marginBottom: 0,
              marginLeft: 8,
              valueFormatter: null
            }
          }
        }
      }
    };
    chart.setStyle(options);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.TVChartContainer} ref={simpleKline}></div>
    </div>
  );
};

export default connect(({ trading, setting }) => ({
  theme: setting.theme,
  showKlineOrDepth: trading.showKlineOrDepth,
  currentPair: trading.currentPair,
  inFullscreen: false
}))(OriginalKline);
