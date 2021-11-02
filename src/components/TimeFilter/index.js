import { useState } from 'react';
import { Modal, DatePicker, Button } from 'antd-mobile';
import styles from './index.less';
import moment from 'moment';
import { formatMessage } from 'umi-plugin-locale';
import cn from 'classnames';
const TimeFilter = ({ handel, color }) => {
  const [DataVisibleStart, setDataVisibleStart] = useState(false);
  const [DataVisibleEnd, setDataVisibleEnd] = useState(false);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [showFilter, setShowFilter] = useState(false);

  const search = param => {
    handel(param);
    setShowFilter(false);
  };
  return (
    <div>
      <i
        className="iconfont iconic_date"
        style={{ color: color }}
        onClick={() => {
          setShowFilter(true);
        }}
      ></i>
      <Modal
        className="am-modal-popup-slide-left"
        transitionName="am-slide-left"
        popup
        visible={showFilter}
        onClose={() => setShowFilter(false)}
      >
        <div className={styles.datePicker}>
          <div>
            <div className={styles.dateItem} onClick={() => setDataVisibleStart(true)}>
              {start ? moment(start).format('YYYY-MM-DD') : formatMessage({ id: 'fin.common.start_time' })}{' '}
              <i className={'iconfont iconic_vector_gradienttabstrip_asset_normal'}></i>
            </div>
            <DatePicker
              mode="date"
              visible={DataVisibleStart}
              onDismiss={() => {
                setStart(null);
                setDataVisibleStart(false);
              }}
              onOk={date => {
                setStart(date.getTime());
                setDataVisibleStart(false);
              }}
            ></DatePicker>
            <div className={styles.dateItem} onClick={() => setDataVisibleEnd(true)}>
              {end ? moment(end).format('YYYY-MM-DD') : formatMessage({ id: 'fin.common.end_time' })}{' '}
              <i className={'iconfont iconic_vector_gradienttabstrip_asset_normal'}></i>
            </div>
            <DatePicker
              mode="date"
              visible={DataVisibleEnd}
              onOk={date => {
                setEnd(date.getTime());
                setDataVisibleEnd(false);
              }}
              onDismiss={() => {
                setEnd(null);
                setDataVisibleEnd(false);
              }}
            ></DatePicker>
          </div>
          <div className={styles.btns}>
            <Button
              type="ghost"
              inline
              onClick={() => {
                search([null, null]);
                setStart(null);
                setEnd(null);
              }}
            >
              {formatMessage({ id: 'otcfiat.Its.reset' })}
            </Button>
            <Button
              type="primary"
              inline
              onClick={() => {
                search([start, end]);
              }}
            >
              {formatMessage({ id: 'fin.common.query' })}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TimeFilter;
