import React from 'react';
import { formatMessage } from 'umi-plugin-locale';
import Link from 'umi/link';
import styles from './menu.less';
import { List } from 'antd-mobile';

const { Item } = List;

function Container() {
  return (
    <>
      <List className={styles.menu}>
        <Item>
          <Link to="/contract/information/contract_detail">{formatMessage({ id: 'swap.typeTitle.contractDetailTitle' })}</Link>
        </Item>
        <Item>
          <Link to="/contract/information/index_price">{formatMessage({ id: 'swap.informationPage.index.indexPrice' })}</Link>
        </Item>
        <Item>
          <Link to="/contract/information/fair_price">{formatMessage({ id: 'swap.common.table.tagPrice' })}</Link>
        </Item>
        <Item>
          <Link to="/contract/information/funding_list">{formatMessage({ id: 'swap.informationPage.index.fundsHistory' })}</Link>
        </Item>
        <Item>
          <Link to="/contract/information/insure_list">{formatMessage({ id: 'swap.informationPage.fundAccount' })}</Link>
        </Item>
        <Item>
          <a target="_blank" rel="noopener noreferrer" href={`${HC_PATH}/hc/zh-cn/sections/360003202471`}>
            {formatMessage({ id: 'swap.header.swapStudent' })}
          </a>
        </Item>
      </List>
    </>
  );
}

export default Container;
