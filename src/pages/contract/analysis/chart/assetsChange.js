import { useEffect, useRef } from 'react';
import echarts from 'echarts/lib/echarts';
import { connect } from 'dva';
import moment from 'moment';
import { formatMessage } from 'umi-plugin-locale';
import { lightVariables, darkVariables } from '@/layouts/theme';
import { cutFloatDecimal } from '@/utils';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/title';
import 'echarts/lib/component/tooltip';
const themeMap = {
  light: lightVariables,
  dark: darkVariables
};
const AssetsChange = ({ data, theme, time, decimal, showData }) => {
  const chartRef = useRef(null);
  const themeVariables = themeMap[theme];
  console.log(theme);
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
          }</div> <div>${formatMessage({ id: 'swap.record.cp.interestsUser' })}: <span  style="color: ${
            param[0].value > 0 ? upColor : downColor
          }">${showData ? cutFloatDecimal(param[0].value, decimal) : '****'}</span></div></div>`;
        }
      },
      grid: {
        left: '20',
        right: '40',
        top: '20',
        bottom: '0',
        containLabel: true
      },
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
          itemStyle: {
            color: '#2EBC84'
          },
          symbol: 'none',
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
          data: data
        }
      ]
    };
  };
  return <div ref={chartRef} style={{ height: 180 }}></div>;
};
export default connect(({ setting }) => ({
  theme: setting.theme
}))(AssetsChange);
