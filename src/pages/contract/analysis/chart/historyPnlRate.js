import { useEffect, useRef } from 'react';
import echarts from 'echarts/lib/echarts';
import { connect } from 'dva';
import moment from 'moment';
import { formatMessage } from 'umi-plugin-locale';
import { cutFloatDecimal, plusPrefix } from '@/utils';
import { lightVariables, darkVariables } from '@/layouts/theme';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/title';
import 'echarts/lib/component/tooltip';
const themeMap = {
  light: lightVariables,
  dark: darkVariables
};
const HistoryPnl = ({ data, theme, time, showData }) => {
  const chartRef = useRef(null);
  const themeVariables = themeMap[theme];
  console.log(time);
  useEffect(() => {
    if (chartRef.current && data) {
      const chart = echarts.init(chartRef.current);
      const option = getOption();
      chart.setOption(option);
    }
  }, [theme, data, chartRef, showData]);

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
          }</div> <div>${formatMessage({ id: 'mc_contract_analysis_total_pnl_rate' })}: <span  style="color: ${
            param[0].value > 0 ? upColor : downColor
          }">${showData ? `${plusPrefix(param[0].value)}%` : '****'}</span></div></div>`;
        }
      },
      grid: {
        left: '20',
        right: '40',
        top: '20',
        bottom: '0',
        containLabel: true
      },
      dataZoom: [
        {
          id: 'dataZoomX',
          type: 'slider',
          start: 0,
          end: 30
        }
      ],
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: time.map(item => moment(item).format('YYYY/MM/DD')),
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
      },
      yAxis: [
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
          type: 'line',
          smooth: true,
          yAxisIndex: 0,
          sampling: 'average',
          symbol: 'none',
          itemStyle: {
            color: '#2EBC84'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(46, 188, 132, 0.1)'
              },
              {
                offset: 1,
                color: 'rgba(46, 188, 132, 0)'
              }
            ])
          },
          data: data.map(item => (item * 100).toFixed(4))
        }
      ]
    };
  };
  return <div ref={chartRef} style={{ height: 180 }}></div>;
};
export default connect(({ setting }) => ({
  theme: setting.theme
}))(HistoryPnl);
