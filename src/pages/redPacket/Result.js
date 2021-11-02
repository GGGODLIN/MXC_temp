import React, { useCallback, useEffect, useState } from 'react';
import styles from './Result.less';
import { Button } from 'antd-mobile';
import { getRedPacketRecord } from '@/services/api';
import router from 'umi/router';
import { timeToString } from '@/utils';
import { formatMessage } from 'umi-plugin-locale';
import classNames from 'classnames';

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function Container({ redPacketInfo, receiveResult, redPacketId }) {
  const [dataList, setDataList] = useState(null);

  useEffect(() => {
    getRedPacketRecord(redPacketId).then(result => {
      if (result && result.code === 0) {
        setDataList(result.data);
      }
    });
  }, []);

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>{formatMessage({ id: 'redPacket.result.title' })}</h3>
      <div className={styles.content}>
        <section className={styles.result}>
          <p className={styles.sender}>
            {formatMessage({ id: 'redPacket.result.sender' }, { account: redPacketInfo.account })}{' '}
            {redPacketInfo.type === 1 && <span>{formatMessage({ id: 'redPacket.result.random' })}</span>}
          </p>
          <p className={styles.cost}>
            {receiveResult.quantity}
            <span>{receiveResult.currency}</span>
          </p>
          {/*<p className={styles.cny}>≈￥12345</p>*/}
        </section>

        <section className={styles.other}>
          <p className={styles.num}>
            {formatMessage({ id: 'redPacket.result.num' }, { num: dataList ? dataList.length : 0, total: redPacketInfo.totalCount })}
          </p>
          <div className={styles.list}>
            {dataList &&
              dataList.map((item, index) => {
                return (
                  <div className={styles.item} key={index}>
                    <div className={styles.left}>
                      <div className={classNames(styles[`avatar${getRandomInt(9)}`], styles.avatar)}></div>
                      <div>
                        <p className={styles.user}>{item.account}</p>
                        <p className={styles.time}>{timeToString(item.receiveTime)}</p>
                      </div>
                    </div>

                    <div className={styles.right}>
                      <p className={styles.cost}>
                        {item.quantity} {item.currency}
                      </p>
                      {/*<p className={styles.cny}>≈￥298.7</p>*/}
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      </div>

      <section className={styles.download}>
        <Button type="primary" onClick={() => router.push('/mobileApp/download')}>
          {formatMessage({ id: 'download.title.page_title' })}
        </Button>
      </section>
    </div>
  );
}

export default Container;
