import React, { PureComponent } from 'react';
import { Icon } from 'antd-mobile';
import cn from 'classnames';
import styles from './index.less';

class UpDownValue extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      value: Number(props.value),
      direction: null
    };
  }

  static getDerivedStateFromProps(nextProps, preState) {
    const value = Number(nextProps.value);
    if (preState.value < value) {
      return {
        value,
        direction: 'up'
      };
    }
    if (preState.value > value) {
      return {
        value,
        direction: 'down'
      };
    }
    return {
      direction: null
    };
  }

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    const { value, direction } = this.state;
    const { format, className, showArrow, showBg, style, bgDuration, fontDuration, ...rest } = this.props;

    let renderNumber;
    let bgDurationStyle, fontDurationStyle;
    if (!format) {
      renderNumber = this.props.value;
    } else {
      renderNumber = format(value);
    }
    if (bgDuration) {
      bgDurationStyle = {
        animationDuration: bgDuration
      };
    }
    if (fontDuration) {
      fontDurationStyle = {
        animationDuration: fontDuration
      };
    }

    let bgCls = '';
    let iconCls = '';
    let fontCls = '';
    let icon = null;
    if (direction === 'up') {
      bgCls = showBg && styles.bgUp;
      iconCls = showArrow && styles.iconUp;
      fontCls = styles.fontUp;
      icon = <Icon type="arrow-up" style={fontDurationStyle} className={cn(styles.icon, iconCls)} />;
    } else if (direction === 'down') {
      bgCls = showBg && styles.bgDown;
      iconCls = showArrow && styles.iconDown;
      fontCls = styles.fontDown;
      icon = <Icon type="arrow-down" style={fontDurationStyle} className={cn(styles.icon, iconCls)} />;
    }

    return (
      <span style={style} className={cn(className, styles.wrapper)} {...rest}>
        <span style={bgDurationStyle} className={cn(styles.bg, bgCls)}>
          {showArrow && icon}
        </span>
        <span style={fontDurationStyle} className={cn(styles.content, fontCls)}>
          {renderNumber}
        </span>
      </span>
    );
  }
}

export default UpDownValue;
