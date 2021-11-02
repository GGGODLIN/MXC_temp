import { useState, useEffect, useRef } from 'react';
import echarts from 'echarts/lib/echarts';
import { getPoolHistory } from '@/services/api';
import moment from 'moment';
import { formatMessage } from 'umi-plugin-locale';
import Empty from '@/components/Empty';

import 'echarts/lib/chart/line';
import 'echarts/lib/component/title';
import 'echarts/lib/component/tooltip';

import styles from './RateChart.less';

const RateChart = ({ theme, info }) => {
  const chartRef = useRef(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    const getHistory = async () => {
      const history = await getPoolHistory(info.id);
      if (history.code === 0 && history.data) {
        setData(history.data.reverse());
      }
    };
    getHistory();
  }, []);

  useEffect(() => {
    const rateChart = echarts.init(chartRef.current);
    const option = getOption();
    rateChart.setOption(option);
  }, [theme, data]);

  const bgcolor = theme === 'dark' ? {} : { background: '#FAFAFA' };
  const getOption = () => {
    const lineColor = theme === 'dark' ? '#354755' : '#c2c8cf';
    const textColor = theme === 'dark' ? '#90A8BA' : '#999999';
    const titleColor = theme === 'dark' ? '#FFFFFF' : '#333333';
    return {
      visualMap: {
        show: false,
        type: 'continuous',
        seriesIndex: 1,
        dimension: 0,
        min: 0,
        max: 29
      },
      tooltip: {
        trigger: 'axis',
        formatter: function(param) {
          return `${param[0].name}<br /> ${param[0].marker} ${(param[0].data * 100).toFixed(2)}%`;
        }
      },
      title: {
        left: '5',
        top: '5',
        text: formatMessage({ id: 'pos.title.detail.hold_rate_title' }),
        textStyle: {
          color: titleColor,
          fontSize: 14
        }
      },
      grid: {
        left: '5',
        right: '5',
        top: '30',
        bottom: '20'
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.map(item => moment(item.profitTime).format('YYYY/MM/DD')),
        axisLine: {
          show: false
        },
        axisLabel: {
          color: textColor,
          formatter: function(value) {
            return value.split('/')[2];
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: textColor
          }
        },
        max: data.length - 1
      },
      yAxis: {
        type: 'value',
        show: false,
        axisLine: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: [lineColor]
          }
        },
        max: function(value) {
          return value.max * 1.3;
        }
      },
      series: [
        {
          type: 'line',
          smooth: true,
          showSymbol: false,
          sampling: 'average',
          itemStyle: {
            color: '#00D38B'
          },
          lineStyle: {
            color: {
              type: 'linear',
              colorStops: [
                {
                  offset: 0,
                  color: '#F7B500' // 0% 处的颜色
                },
                {
                  offset: 0.5,
                  color: '#B620E0' // 100% 处的颜色
                },
                {
                  offset: 1,
                  color: '#32C5FF' // 100% 处的颜色
                }
              ],
              global: false // 缺省为 false
            }
          },
          data: data.map(item => item.profitRate)
        }
      ]
    };
  };

  return (
    <div className={styles.box}>
      <div style={bgcolor} className={styles.chartBox} ref={chartRef}></div>
      {data.length === 0 && (
        <div className={styles.empty}>
          <Empty></Empty>
        </div>
      )}
    </div>
  );
};

export default RateChart;
