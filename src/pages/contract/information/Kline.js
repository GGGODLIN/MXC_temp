// k线
import React, { useState, useEffect, useReducer } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import { apiIntervalMap, supportedResolutions } from '@/utils/kline';
import styles from './Kline.less';
import { getIndexBar, getFpBar } from '@/services/contractapi';
import { useSize } from '@umijs/hooks';
import cs from 'classnames';
import logo from '@/assets/img/logo-main.png';
import { Modal } from 'antd-mobile';

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

const initialState = {
  interval: window.localStorage.getItem('mxc.kline.interval') || '15',
  barNum: 300,
  bars: []
};

function reducer(state, payload) {
  return { ...state, ...payload };
}

const Kline = ({ currentProduct, lineType, theme }) => {
  const [state, setState] = useReducer(reducer, initialState);
  const [box, simpleKline] = useSize();

  useEffect(() => {
    chart = window.klinecharts.init(simpleKline.current);
    chart.setSubIndicatorType('NO');
    chart.setMaxRange(980);
    chart.setMinRange(24);
    chart.setIndicatorParams('VOL', []);
    return () => {
      chart.clearData();
    };
  }, []);

  useEffect(() => {
    setOption();
  }, [theme]);

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

  useEffect(() => {
    if (chart) {
      chart.setDefaultRange(Math.floor((90 * box.width) / 600) || 70);
      chart.resize();
    }
  }, [box.width, box.height]);

  useEffect(() => {
    const now = moment().format('x');
    const start = moment()
      .subtract(state.barNum * transInterval(state.interval), 'm')
      .format('x');

    getBar(start, now, false);

    chart.loadMore(timestamp => {
      const nextTime = moment(timestamp)
        .subtract(state.barNum * transInterval(state.interval), 'm')
        .format('x');
      getBar(nextTime, timestamp - transInterval(state.interval) * 60000, true);
    });
    chart.setNumberScale(currentProduct.priceScale, currentProduct.volScale); // TODO
    chart.calcChartDimensions();
  }, [currentProduct, state.interval]);

  const getBar = (fromTime, toTime, isLoadMore) => {
    const symbol = currentProduct.symbol;
    const params = {
      symbol: symbol,
      interval: apiIntervalMap[state.interval],
      start: fromTime,
      end: toTime
    };

    if (lineType === 'index') {
      getIndexBar(params).then(res => {
        disposeData(res);
      });
    }

    if (lineType === 'fair') {
      getFpBar(params).then(res => {
        disposeData(res);
      });
    }

    function disposeData(res) {
      if (!isLoadMore) {
        chart.clearData();
      }
      let data = res.data;
      if (!res.success || !data) {
        // throw new Error('');
        console.error('fetch bar error');
        data = { s: 'no_data' };
      }
      let bars = [];
      if (data.s !== 'no_data') {
        for (let i = 0; i < data.time.length; i++) {
          const p = Number(data.close[i]);
          const barValue = {
            timestamp: data.time[i] * 1000,
            close: p,
            open: p,
            high: p,
            low: p,
            turnover: p * Number(data.amount[i])
          };
          if (data.open) {
            barValue.open = Number(data.open[i]);
          }
          if (data.high) {
            barValue.high = Number(data.high[i]);
          }
          if (data.low) {
            barValue.low = Number(data.low[i]);
          }
          if (data.vol) {
            barValue.volume = Number(data.vol[i]);
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
    }
  };

  const setResolution = interval => {
    setState({ interval });
    window.localStorage.setItem('mxc.kline.interval', interval);
  };
  const isInDefault = defaultRanges.find(r => r.value === state.interval);
  let moreString = formatMessage({ id: 'common.more' });
  if (!isInDefault) {
    Object.entries(supportedResolutions).forEach(([v, k]) => {
      if (k === state.interval) {
        moreString = v;
      }
    });
  }
  const [intervalModalVisible, setIntervalModalVisible] = useState(false);
  const [viewport, setViewport] = useState('portrait');
  const width = document.documentElement.clientWidth;
  const height = document.documentElement.clientHeight;
  const themeColor = theme === 'dark' ? '#3e3f4d' : '#ffffff';
  const wrapperStyles =
    viewport === 'portrait'
      ? {
          position: 'relative'
        }
      : {
          position: 'fixed',
          zIndex: 4,
          top: 0,
          left: 0,
          width: height,
          height: width,
          transform: `rotate(90deg)`,
          transformOrigin: `${width / 2}px center`,
          backgroundColor: themeColor
        };
  const timerangeHeight = 28;

  return (
    <div className={styles.wrapper}>
      <div className={styles.klineAction}>
        <div className={styles.klineActionRange}>
          {defaultRanges.map(r => (
            <div
              key={r.value}
              className={cs(styles.klineActionsInterval, state.interval === r.value && styles.activeInterval)}
              onClick={() => setResolution(r.value)}
            >
              <span>{r.label}</span>
            </div>
          ))}
          <div
            className={cs(styles.klineActionsInterval, styles.withTriangle, !isInDefault && styles.activeInterval)}
            onClick={() => setIntervalModalVisible(true)}
          >
            <span>{moreString}</span>
            <span className={styles.triangle}></span>
          </div>
        </div>
        <div onClick={() => setViewport('landscape')}>
          <i className="iconfont iconhangqing-zhankai f-12"></i>
        </div>
      </div>
      <div className={styles.kline}>
        <div style={wrapperStyles}>
          {viewport === 'landscape' && (
            <div style={{ height: timerangeHeight }} className={styles.landscapeTop}>
              <div>
                <span>{currentProduct.symbol}</span>
              </div>
              <div className={styles.klineActionRange}>
                {Object.keys(supportedResolutions).map((k, i) => (
                  <div
                    className={cs(
                      styles.klineActionsInterval,
                      state.interval === supportedResolutions[k] && styles.activeInterval,
                      viewport === 'landscape' && styles.smallGap
                    )}
                    key={k}
                    onClick={() => {
                      setResolution(supportedResolutions[k]);
                    }}
                  >
                    {k}
                  </div>
                ))}
                <div onClick={() => setViewport('portrait')}>
                  <i className="iconfont iconhangqing-zhankai f-12"></i>
                </div>
              </div>
            </div>
          )}

          <div style={viewport === 'landscape' ? { width: height, height: width - timerangeHeight } : {}}>
            <div className={styles.TVChartContainer} ref={simpleKline}></div>
          </div>
          <img alt="mxc" className={styles.watermark} src={logo} />
        </div>
      </div>

      <Modal popup animationType="slide-up" visible={intervalModalVisible} onClose={() => setIntervalModalVisible(false)}>
        <div className={styles.singleSelect}>
          {Object.keys(supportedResolutions).map((k, i) => (
            <div
              className={cs(styles.singleSelectOption, state.interval === supportedResolutions[k] && styles.activeOption)}
              key={k}
              onClick={() => {
                setResolution(supportedResolutions[k]);
                setIntervalModalVisible(false);
              }}
            >
              {k}
            </div>
          ))}
          <div className={cs(styles.singleSelectOption, styles.singleSelectCancel)} onClick={() => setIntervalModalVisible(false)}>
            {formatMessage({ id: 'common.cancel' })}
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default connect(({ setting }) => ({
  theme: setting.theme
}))(Kline);
