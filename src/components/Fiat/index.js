import React, { Component } from 'react';
import { connect } from 'dva';
import { fiatPrice } from '@/utils';

@connect(({ trading }) => ({
  selectedFiat: trading.selectedFiat,
  cnyPrices: trading.cnyPrices
}))
class Fiat extends Component {
  render() {
    const { value, market, dec = 2, selectedFiat, style, className } = this.props;
    let marketFiatPrice = this.props.cnyPrices[market];
    if (selectedFiat === 'USD') {
      marketFiatPrice = marketFiatPrice / this.props.cnyPrices['USDT'];
    }
    const v = value * marketFiatPrice;
    const fiat = fiatPrice(v, dec, selectedFiat);

    return (
      <span style={style} className={className}>
        {fiat}
      </span>
    );
  }
}

export default Fiat;
