import { useEffect, useRef } from 'react';
import echarts from 'echarts/lib/echarts';
import { connect } from 'dva';
import moment from 'moment';
import { formatMessage } from 'umi-plugin-locale';
import { plusPrefix, cutFloatDecimal } from '@/utils';
import { lightVariables, darkVariables } from '@/layouts/theme';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/bar';
import 'echarts/lib/component/title';
import 'echarts/lib/component/tooltip';
const themeMap = {
  light: lightVariables,
  dark: darkVariables
};
const dayPnl = ({ data, rate, theme, time, decimal, showData }) => {
  const chartRef = useRef(null);
  const themeVariables = themeMap[theme];
  useEffect(() => {
    if (chartRef.current && data) {
      const chart = echarts.init(chartRef.current);
      const option = getOption();
      chart.setOption(option);
    }
  }, [theme, data, chartRef, rate, showData]);

  const getOption = () => {
    const lineColor = themeVariables['--background-color-1'];
    const textColor = themeVariables['--main-text-2'];
    const toolTipBg = themeVariables['--background-color-4'];
    const toolTipTitleBg = themeVariables['--background-color-3'];
    const toolTipColor = themeVariables['--main-text-1'];
    const upColor = themeVariables['--up-color'];
    const downColor = themeVariables['--down-color'];
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          snap: true
        },
        backgroundColor: toolTipBg,
        formatter: function(param) {
          return `<div style="color: ${toolTipColor}; font-size: 12px;"><div style="background: ${toolTipTitleBg};padding-left: 4px;">${
            param[0].name
          }</div> <div>${formatMessage({ id: 'mc_contract_analysis_current_pnl' })}: <span  style="color: ${
            param[0].value > 0 ? upColor : downColor
          }">${showData ? plusPrefix(cutFloatDecimal(param[0].value, decimal)) : '****'}</span></div><div > ${formatMessage({
            id: 'mc_contract_analysis_current_pnl_rate'
          })}: <span style="color: ${param[1].value > 0 ? upColor : downColor}">${
            showData ? `${plusPrefix(param[1].value)}%` : '****'
          }</span></div></div>`;
        }
      },
      grid: {
        left: '0',
        right: '0',
        top: '20',
        bottom: '0',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: time.map(item => moment(item).format('YYYY/MM/DD')),
          axisPointer: {
            type: 'shadow'
          },
          axisLabel: {
            textStyle: {
              color: textColor
            }
          },
          axisLine: {
            lineStyle: {
              color: textColor
            }
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          axisLabel: {
            textStyle: {
              color: textColor
            }
          },
          axisLine: {
            lineStyle: {
              color: textColor
            }
          },
          splitLine: { show: false }
        },
        {
          type: 'value',
          axisLabel: {
            textStyle: {
              color: textColor
            },
            formatter: function(param) {
              return `${param} %`;
            }
          },
          axisLine: {
            lineStyle: {
              color: textColor
            }
          },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          type: 'bar',
          barWidth: 14,
          data: data.map(item => {
            return {
              value: item,
              itemStyle: {
                color: item > 0 ? '#2EBC84' : '#E96878'
              }
            };
          })
        },
        {
          type: 'line',
          yAxisIndex: 1,
          symbol: 'none',
          sampling: 'average',
          data: rate.map(item => item.toFixed(4)),
          itemStyle: {
            color: '#1890FF'
          }
        }
      ]
    };
  };
  return <div ref={chartRef} style={{ height: 180 }}></div>;
};
export default connect(({ setting }) => ({
  theme: setting.theme
}))(dayPnl);
