import React, { Component } from 'react';
import { Icon } from 'antd-mobile';
import cn from 'classnames';

import styles from './index.less';

class SortCaret extends Component {
  handleClick = () => {
    const { sortKey, sort, onChange, defaultSort } = this.props;
    let newSort;
    if (sortKey !== sort.key) {
      newSort = {
        key: sortKey,
        asc: 1
      };
    } else {
      if (sort.asc === 0) {
        newSort = {
          key: sort.key,
          asc: 1
        };
      } else if (sort.asc === 1) {
        newSort = {
          key: sort.key,
          asc: -1
        };
      } else {
        newSort = {
          ...defaultSort
        };
      }
    }
    onChange && onChange(newSort);
  };
  render() {
    const { sortKey, sort, className, style, label } = this.props;
    return (
      <span className={className} style={style} onClick={() => this.handleClick()}>
        {label && <span>{label}</span>}
        <span className={cn(styles.sort)}>
          <Icon className={cn(styles.caret, sortKey === sort.key && sort.asc === 1 && styles.active)} type="caret-up" />
          <Icon className={cn(styles.caret, sortKey === sort.key && sort.asc === -1 && styles.active)} type="caret-down" />
        </span>
      </span>
    );
  }
}

export default SortCaret;
