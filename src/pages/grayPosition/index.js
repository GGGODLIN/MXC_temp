import { useState, useEffect, useRef } from 'react';

import { connect } from 'dva';
import TopBar from '@/components/TopBar';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import apple from '@/assets/img/defi/defi.png';
import deficoin from '@/assets/img/defi/deficoin.png';
import styles from './index.less';
import { getPoolHistory, grayCoinList } from '@/services/api';
import { cutFloatDecimal, getSubSite, numbervalAccuracy, numberToString, gotoCrossPlatformUrl } from '@/utils';
import { Button } from 'antd-mobile';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/pie';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import router from 'umi/router';
import classNames from 'classnames';
let lang = getLocale();
let localStorageUtil = {
  set(key, val, expire) {
    let exp = expire ? Date.now() + expire * 1000 * 60 : -1;
    localStorage.setItem(key, JSON.stringify({ value: val, expire: exp }));
    console.log('set ' + key + ':' + JSON.stringify({ value: val, expire: new Date(exp).toLocaleString() }));
  },
  get(key) {
    let data = localStorage.getItem(key);
    if (!data) return null;

    let dataObj = JSON.parse(data);

    if (dataObj.expire == -1) return dataObj.value;

    if (Date.now() >= dataObj.expire) {
      localStorage.removeItem(key);
      return null;
    } else {
      return dataObj.value;
    }
  }
};
function transform(value) {
  let newValue = ['', '', ''];
  let fr = 1000;
  const ad = 1;
  let num = 3;
  const fm = 1;
  while (value / fr >= 1) {
    fr *= 10;
    num += 1;
  }
  if (num <= 4) {
    // 千
    newValue[1] = '千';
    newValue[0] = cutFloatDecimal(value / 1000, 2) + '';
  } else if (num <= 8) {
    // 万
    const text1 = parseInt(num - 4) / 3 > 1 ? '千万' : '万';
    const fm = '万' === text1 ? 10000 : 10000000;
    newValue[1] = text1;
    newValue[0] = cutFloatDecimal(value / fm, 2) + '';
  } else if (num <= 16) {
    // 亿
    let text1 = (num - 8) / 3 > 1 ? '千亿' : '亿';
    text1 = (num - 8) / 4 > 1 ? '万亿' : text1;
    text1 = (num - 8) / 7 > 1 ? '千万亿' : text1;
    let fm = 1;
    if ('亿' === text1) {
      fm = 100000000;
    } else if ('千亿' === text1) {
      fm = 100000000000;
    } else if ('万亿' === text1) {
      fm = 1000000000000;
    } else if ('千万亿' === text1) {
      fm = 1000000000000000;
    }
    newValue[1] = text1;
    newValue[0] = cutFloatDecimal(value / fm, 2) + '';
  }
  if (value < 1000) {
    newValue[1] = '';
    newValue[0] = value + '';
  }
  return newValue.join('');
}
function enTransform(value) {
  let newValue = ['', '', ''];
  let fr = 1000;
  const ad = 1;
  let num = 3;
  const fm = 1;
  while (value / fr >= 1) {
    fr *= 10;
    num += 1;
  }
  if (num <= 4) {
    // 千
    newValue[1] = 'K';
    newValue[0] = cutFloatDecimal(value / 1000, 2) + '';
  } else if (num <= 6) {
    const text1 = 'K';
    const fm = 1000;
    newValue[1] = text1;
    newValue[0] = cutFloatDecimal(value / fm, 2) + '';
  } else if (num > 6) {
    // 千万
    const text1 = 'M';
    const fm = 1000000;
    newValue[1] = text1;
    newValue[0] = cutFloatDecimal(value / fm, 2) + '';
  }
  if (value < 1000) {
    newValue[1] = '';
    newValue[0] = value + '';
  }
  return newValue.join('');
}

const Deif = ({ markets, user, dispatch, theme, netValues, coinList, defiCurrency }) => {
  const chartRef = useRef(null);
  const introduceRef = useRef(null);
  const [chartData, setChartData] = useState([]);
  const [iconDirection, setIconDirection] = useState(false);
  const [activeId, setActiveId] = useState();
  const [graylist, setGraylist] = useState([]);
  const [graydata, setGraydata] = useState([]);
  const [show, setShow] = useState(true);
  const [introduceType, setIntroduceType] = useState(false);
  useEffect(() => {
    dispatch({ type: 'etfIndex/getEtfNetValue', payload: 'MX08' });
    grayPosition();
  }, []);
  useEffect(() => {
    if (coinList) {
      indexTrading();
    }
  }, [coinList]);

  useEffect(() => {
    if (markets) {
      let same = graylist.map(item => {
        item.etf = [...markets.filter(m => m.currency.includes(item.coinsymbol))];
        if (markets.filter(m => m.currency == item.coinsymbol).length > 0) {
          item.icon = markets.filter(m => m.currency == item.coinsymbol)[0].icon;
        }
        return item;
      });
      setGraydata(same);
    }
  }, [markets, graylist]);
  useEffect(() => {
    if (chartData.length > 0) {
      const rateChart = echarts.init(chartRef.current);
      const option = getOption();
      rateChart.setOption(option);
    }
  }, [chartData, coinList, markets]);

  const grayPosition = async () => {
    const res = await grayCoinList();
    if (res.code === 200) {
      setGraylist(res?.data.list || []);
      var val = JSON.stringify(res?.data.list || []);
      localStorageUtil.set('gray', val, 1440);
    } else {
      // let list = localStorageUtil.get('gray')? localStorageUtil.get('gray'):[];
      // setGraylist(JSON.parse(list));
    }
  };

  const indexTradingColor = val => {
    const colorList = {
      1: '#1890FF',
      2: '#40A9FF',
      3: '#ADC6FF',
      5: '#FAAD14',
      4: '#52C41A',
      6: '#13C2C2',
      7: '#EB2F96',
      8: '#722ED1',
      9: '#2EBC84'
    };
    return colorList[val];
  };

  const indexTrading = () => {
    let indexData = [];
    coinList.forEach((item, index) => {
      indexData.push({
        value: cutFloatDecimal(item.etfRate * 100, 2),
        name: item.coin,
        itemStyle: {
          normal: {
            color: indexTradingColor(index + 1)
          }
        }
      });
    });
    setChartData(indexData);
  };

  const grayListFun = () => {
    return graydata.map(item => {
      return (
        <div className={styles.listContent} key={item.coinsymbol}>
          <div className={styles.list}>
            <div className={styles.headerContent}>
              <div>
                <i className={styles.icon} style={{ backgroundImage: `url(${getSubSite('main')}/api/file/download/${item.icon})` }}></i>
                <span>{item.coinsymbol}</span>
                <span className={styles.marketColor}>/{item.etf[0] ? item.etf[0].market : 'USDT'}</span>
              </div>
              <div
                onClick={() => {
                  setActiveId(item.coinsymbol);
                  setIconDirection(!iconDirection);
                }}
              >
                <span> {formatMessage({ id: 'home.gray.go' })}</span>
                <span>
                  <i className={classNames([`iconfont icondrop`, iconDirection && styles.upicon])}></i>
                </span>
              </div>
            </div>
            <div className={styles.listChoose} style={{ display: item.coinsymbol === activeId && iconDirection ? 'block' : 'none' }}>
              {item.etf.map(data => {
                return (
                  <div className={styles.chooseContent}>
                    <div className={styles.currencyContent}>
                      <span className={styles.coinColor}>{data.currency}</span>
                    </div>
                    <div>
                      <p className={styles.coinColor}>{numberToString(data.c)}</p>
                      <p style={{ color: data.rate >= 0 ? 'var(--up-color)' : 'var(--down-color)' }}>
                        {data.rate >= 0 && '+'}
                        {(data.rate * 100).toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <div
                        className={styles.btn}
                        onClick={() => {
                          gotoCrossPlatformUrl(
                            `polka?trade_pair=${data.currency}_${data.market}`,
                            `/trade/spot#${data.currency}_${data.market}`
                          );
                        }}
                      >
                        {formatMessage({ id: 'layout.title.tabbar.trade' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className={styles.listinfo}>
            <div className={styles.listOne}>
              <p className={styles.infotitle}>{formatMessage({ id: 'home.gray.infoNumber' })}</p>
              <p>
                {lang.startsWith('zh') ? transform(item.contractamount, 2) : enTransform(item.contractamount, 2)}

                {item.coinsymbol}
              </p>
              <p>{lang.startsWith('zh') ? transform(item.contractvalue, 2) : enTransform(item.contractvalue, 2)}</p>
            </div>
            <div>
              <p className={styles.infotitle}>{formatMessage({ id: 'home.gray.day' })}</p>
              <p
                style={{ color: item.change_24h >= 0 ? 'var(--up-color)' : 'var(--down-color)', paddingLeft: '0.5rem', fontWeight: '500' }}
              >
                {`${item.change_24h >= 0 ? '+' : ''}${item.change_24h}`}
              </p>
              <p
                style={{ color: item.change_week >= 0 ? 'var(--up-color)' : 'var(--down-color)', paddingLeft: '0.5rem', fontWeight: '500' }}
              >
                {`${item.change_week >= 0 ? '+' : ''}${item.change_week}`}
              </p>
            </div>
            <div>
              <p className={styles.infotitle}>{formatMessage({ id: 'home.gray.rate' })}</p>
              <p>{`${cutFloatDecimal(item.rate * 100, 2)}%`}</p>
              <p></p>
            </div>
          </div>
        </div>
      );
    });
  };

  const getOption = () => {
    return {
      series: [
        {
          name: '',
          type: 'pie',
          radius: [0, '100%'],
          silent: true,
          label: {
            normal: {
              formatter: '{d}%',
              position: 'inner',
              align: 'center',
              textStyle: {
                fontSize: 10
              }
            }
          },
          data: chartData
        }
      ]
    };
  };

  const indexTradingList = () => {
    return coinList.map((item, index) => {
      return (
        <div className={styles.ratioList} key={item.coin}>
          <span className={styles.ratioBg} style={{ background: indexTradingColor(index + 1) }}></span>
          <span className={styles.ratioCoin}>{item.coin}</span>
        </div>
      );
    });
  };
  const intersection = (nums1, nums2) => {
    let list = nums2;
    nums1.forEach(item1 => {
      nums2.forEach((item2, index) => {
        if (item1.currency === item2.coin) {
          list[index].icon = item1.icon;
        }
      });
    });

    return list;
  };
  const indexTradingChart = () => {
    let resData = intersection(markets, coinList);
    return resData.map((item, index) => {
      return (
        <div className={styles.listContet} key={item.coin}>
          <div>
            <i className={styles.icon} style={{ backgroundImage: `url(${getSubSite('main')}/api/file/download/${item.icon})` }}></i>
          </div>
          <div className={styles.listInfo}>
            <span className={styles.coinTitle}>{item.coin}</span>
            <p>{item.name ? item.name : ''}</p>
          </div>
        </div>
      );
    });
  };
  const isApp = window.localStorage.getItem('mxc.view.from') === 'app' ? 'app' : 'h5';
  return (
    <div className={styles.ecologyContent}>
      <TopBar>{formatMessage({ id: 'home.gray.title' })}</TopBar>
      <div className={styles.headerBg}>
        <div className={styles.title}> {formatMessage({ id: 'home.gray.title' })}</div>
      </div>
      <div className={styles.content}>
        <div className={styles.infoContent}>
          <div className={styles.introduction}>
            <div className={styles.info} className={classNames(introduceType === true ? styles.infoOpen : styles.info)} ref={introduceRef}>
              <p className={styles.graypromot}>{formatMessage({ id: 'home.gray.introduce' })}</p>
              <p
                className={classNames(show === true ? styles.introduceShow : styles.introduceHidden)}
                dangerouslySetInnerHTML={{
                  __html: formatMessage({ id: 'home.gray.contetn' })
                }}
              ></p>

              <div
                className={classNames(introduceType === true ? styles.closeBtn : styles.openBtn)}
                onClick={() => {
                  setIntroduceType(!introduceType);
                  setShow(!show);
                }}
              >
                {introduceType === true ? (
                  <div>
                    <span>
                      {' '}
                      {formatMessage({ id: 'ecology.function.PackUp' })}
                      <div className={styles.close}></div>
                    </span>
                  </div>
                ) : (
                  <div>
                    {/* <span className={styles.point}>...</span> */}
                    <span>
                      {formatMessage({ id: 'ecology.function.open' })}
                      <div className={styles.open}></div>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.grayContent}>
            <div className={styles.chartTitle}> {formatMessage({ id: 'home.gray.titleinfo' })}</div>
            {grayListFun()}
          </div>

          <div className={styles.chartContent}>
            <div className={styles.chartTitle}> {formatMessage({ id: 'etfIndex.header.title' })}</div>
            <div className={styles.coinContent}>{markets.length > 0 ? indexTradingChart() : ''}</div>
            <div className={styles.line}></div>

            <div className={styles.chartDataContent}>
              <div className={styles.chartBoxInfo}>
                <div>
                  <div className={styles.ratioTitle}> {formatMessage({ id: 'ecology.etf.ratio' })}</div>
                  <div className={styles.ratioContent}>{indexTradingList()}</div>
                </div>
              </div>
              <div className={styles.chartBox} ref={chartRef}></div>
            </div>

            <div>
              <Button
                type="primary"
                onClick={() => {
                  router.push('/etfIndex/spot#MX08_USDT');
                }}
              >
                {formatMessage({ id: 'etfIndex.header.title' })}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect(({ auth, trading, etfIndex, defi }) => ({
  user: auth.user,
  markets: trading.originMarkets,
  netValues: etfIndex.netValues,
  defiCurrency: defi.defiCurrency,
  coinList: etfIndex.coinList
}))(Deif);
