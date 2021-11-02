import { useState, useEffect } from 'react';
import { Flex, DatePicker, WingBlank, WhiteSpace } from 'antd-mobile';
import styles from './index.less';
import moment from 'moment';
import { formatMessage } from 'umi-plugin-locale';

const RangeTimeSelect = ({ handle, defaultTime = [null, null] }) => {
  const [DataVisibleStart, setDataVisibleStart] = useState(false);
  const [DataVisibleEnd, setDataVisibleEnd] = useState(false);
  const [start, setStart] = useState(defaultTime[0]);
  const [end, setEnd] = useState(defaultTime[1]);

  useEffect(() => {
    handle([start, end]);
  }, [start, end]);

  return (
    <div className={styles.RangeTimeSelect}>
      <WhiteSpace />
      <WingBlank>
        <Flex justify="between" align="center">
          <span>{formatMessage({ id: 'act.invite_datatime' })}:</span>
          <Flex.Item>
            <Flex className={styles.text} justify="end">
              <span onClick={() => setDataVisibleStart(true)}>{start && moment(start).format('YYYY-MM-DD')}</span>
              <b>-</b>
              <span onClick={() => setDataVisibleEnd(true)}>{end && moment(end).format('YYYY-MM-DD')}</span>
            </Flex>
          </Flex.Item>
        </Flex>
      </WingBlank>
      <DatePicker
        mode="date"
        visible={DataVisibleEnd}
        value={new Date(defaultTime[1])}
        onOk={date => {
          setEnd(date.getTime());
          setDataVisibleEnd(false);
        }}
        onDismiss={() => {
          setDataVisibleEnd(false);
        }}
      ></DatePicker>
      <DatePicker
        mode="date"
        visible={DataVisibleStart}
        value={new Date(defaultTime[0])}
        onDismiss={() => {
          setDataVisibleStart(false);
        }}
        onOk={date => {
          setStart(date.getTime());
          setDataVisibleStart(false);
        }}
      ></DatePicker>
    </div>
  );
};

export default RangeTimeSelect;
