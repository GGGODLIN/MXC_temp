import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import styles from './Marquee.less';
import { connect } from 'dva';
import { numberToString } from '@/utils';
import { getRedPacketRecord } from '@/services/api';
import { formatMessage } from 'umi-plugin-locale';

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function Container({ serverClientTimeDiff, redPacketId }) {
  const [dataList, setDataList] = useState(null);

  useEffect(() => {
    getRedPacketRecord(redPacketId).then(result => {
      if (result && result.code === 0) {
        setDataList(result.data);
      }
    });
  }, []);

  const getTime = useCallback(time => {
    const now = serverClientTimeDiff + Date.now();
    const diff = now - time;

    if (diff > 0) {
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) {
        return formatMessage({ id: 'redPacket.marquee.days' }, { days });
      }

      if (hours > 0) {
        return formatMessage({ id: 'redPacket.marquee.hours' }, { hours });
      }

      if (minutes > 0) {
        return formatMessage({ id: 'redPacket.marquee.minutes' }, { minutes });
      }

      return formatMessage({ id: 'redPacket.marquee.now' });
    }
  }, []);

  const slowWrapperRef = useRef({});
  const defaultWrapperRef = useRef({});
  const fastWrapperRef = useRef({});

  useEffect(() => {
    if (!dataList) {
      return;
    }

    // 监听tab切换时clear计时器，防止弹幕堆积
    let documentHidden = false;
    function visibilityChangeHandle() {
      documentHidden = document.hidden;
    }
    document.addEventListener('visibilitychange', visibilityChangeHandle);

    let otherData = [...dataList];

    if (otherData.length && slowWrapperRef.current && defaultWrapperRef.current && fastWrapperRef.current) {
      function animationEndHandle(e, data) {
        e.target.parentNode.removeChild(e.target);
        otherData.push(data);
      }

      function createTag(wrapperRef, time) {
        setTimeout(() => {
          createTag(wrapperRef, time);
        }, time);

        if (documentHidden) {
          return;
        }

        const index = getRandomInt(otherData.length);
        const result = otherData.splice(index, 1);
        if (result.length) {
          const data = result[0];
          const tag = document.createElement('span');
          tag.setAttribute('class', styles.tag);
          tag.addEventListener('animationend', e => animationEndHandle(e, data));
          const time = getTime(data.receiveTime);
          const account = data.account;
          const quantity = numberToString(data.quantity);
          const currency = data.currency || '';
          tag.innerHTML = formatMessage(
            { id: 'redPacket.marquee.tag' },
            {
              account,
              time,
              quantity,
              currency
            }
          );
          wrapperRef.current.appendChild(tag);

          // if (otherData.length === 0) {
          //   otherData = [...dataList];
          // }
        }
      }

      createTag(slowWrapperRef, 10000);
      createTag(defaultWrapperRef, 9000);
      createTag(fastWrapperRef, 8000);
    }

    return () => {
      document.removeEventListener('visibilitychange', visibilityChangeHandle);
    };
  }, [dataList, slowWrapperRef, defaultWrapperRef, fastWrapperRef]);

  return (
    <div className={styles.wrapper}>
      <div className={classNames(styles.item, styles.fast)} ref={fastWrapperRef} />
      <div className={classNames(styles.item, styles.slow)} ref={slowWrapperRef} />
      <div className={classNames(styles.item, styles.default)} ref={defaultWrapperRef} />
    </div>
  );
}

export default connect(({ global }) => ({ serverClientTimeDiff: global.serverClientTimeDiff }))(Container);
