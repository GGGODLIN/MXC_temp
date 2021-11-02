import React from 'react';
import echarts from 'echarts/lib/echarts';
import themes from './theme';
import { cutFloatDecimal } from '@/utils';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import { formatMessage } from 'umi-plugin-locale';

class DepthChart extends React.Component {
  constructor(props) {
    super(props);
    this.echartsInstance = null;
  }

  componentDidMount() {
    this.echartsInstance = echarts.init(this.echartsElement);
    this.echartsInstance.setOption(this.initOption());
    window.addEventListener('resize', () => this.resizeCharts(), false);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', () => this.resizeCharts());
  }

  componentDidUpdate() {
    this.echartsInstance.setOption(this.initOption());
  }

  resizeCharts() {
    this.echartsInstance.resize();
  }

  nFormatter(num, digits = 2) {
    const si = [
      { value: 1, symbol: '' },
      { value: 1e3, symbol: 'K' },
      { value: 1e6, symbol: 'M' },
      { value: 1e9, symbol: 'G' },
      { value: 1e12, symbol: 'T' },
      { value: 1e15, symbol: 'P' },
      { value: 1e18, symbol: 'E' }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let i;
    for (i = si.length - 1; i > 0; i--) {
      if (num >= si[i].value) {
        break;
      }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, '$1') + si[i].symbol;
  }

  initOption() {
    let colors = {};
    let { theme, bids, asks, range, priceScale, quantityScale, currency, market, xTicks } = this.props;
    const themeType = Object.prototype.toString.call(theme);
    //theme如果是字符串使用默认主题
    if (themeType === '[object String]') {
      colors = themes[theme] ? themes[theme] : themes['light'];
    } else if (themeType === '[object Object]') {
      //如果是对象合并props的值
      for (let i in theme) {
        colors[i] = Object.assign(themes[i], theme[i]);
      }
      colors = themes['light'];
    } else {
      colors = themes['light'];
    }

    return {
      // animation: true,
      animation: false,
      backgroundColor: colors.backgroundColor,
      grid: {
        left: 20,
        right: 55,
        top: 20,
        bottom: 35
      },
      tooltip: {
        trigger: 'axis',
        confine: true,
        showContent: true,
        padding: [10, 10, 0, 10],
        borderRadius: 4,
        backgroundColor: colors.tooltipBackgroundColor,
        formatter: params => {
          const { data } = params[0];
          return `
            <p>${formatMessage({ id: 'trade.list.price' })}:${cutFloatDecimal(data[0], priceScale)} ${market}</p>
            <p>${formatMessage({ id: 'depths.list.sum_quantity' })}:${cutFloatDecimal(data[1], quantityScale)} ${currency}</p>
          `;
        },
        textStyle: {
          fontSize: 12,
          color: colors.tooltipColor
        }
      },
      xAxis: {
        type: 'value',
        min: range.min,
        max: range.max,
        splitNumber: xTicks || 8,
        splitLine: {
          show: false
        },
        axisLabel: {
          color: colors.xAxisAxisLabelColor,
          formatter: function(value) {
            return cutFloatDecimal(value, priceScale);
          }
        },
        axisLine: {
          lineStyle: {
            color: colors.xAxisAxisLineLineStyleColor
          }
        },
        axisPointer: {
          lineStyle: {
            color: 'auto',
            type: 'dashed',
            width: 2
          }
          // snap: true
        }
      },
      yAxis: {
        type: 'value',
        position: 'right',
        splitNumber: 6,
        splitLine: {
          show: false
        },
        axisLabel: {
          color: colors.yAxisAxisLabelColor,
          formatter: num => this.nFormatter(num)
        },
        axisLine: {
          lineStyle: {
            color: colors.yAxisAxisLineLineStyleColor
          }
        }
      },
      series: [
        {
          data: bids,
          type: 'line',
          symbol: 'circle',
          showSymbol: false,
          symbolSize: 12,
          itemStyle: {
            color: colors.bidsSeriesItemStyleColor,
            borderColor: colors.bidsSeriesItemStyleBorderColor,
            borderWidth: 12
          },
          lineStyle: {
            color: colors.bidsSeriesLineStyleColor
          },
          areaStyle: {
            color: colors.bidsSeriesAreaStyleColor
          }
        },
        {
          data: asks,
          type: 'line',
          symbol: 'circle',
          showSymbol: false,
          symbolSize: 12,
          itemStyle: {
            color: colors.asksSeriesItemStyleColor,
            borderColor: colors.asksSeriesItemStyleBorderColor,
            borderWidth: 12
          },
          lineStyle: {
            color: colors.asksSeriesLineStyleColor
          },
          areaStyle: {
            color: colors.asksSeriesAreaStyleColor
          }
        }
      ]
    };
  }

  render() {
    const { width, height } = this.props;
    return (
      <div
        ref={e => {
          this.echartsElement = e;
        }}
        style={{ width: width || '100%', height: height || '100%' }}
      ></div>
    );
  }
}

export default DepthChart;
