import { formatMessage } from 'umi-plugin-locale';
import { cutFloatDecimal, timeToString } from '@/utils';
import styles from './index.less';
import router from 'umi/router';

const CommonRecord = ({ item, type }) => {
  const toBack = () => {
    if (item.remainAmount !== '0') {
      router.push(`/margin/back?symbol=${item.accountName}&recordNo=${item.recordNo}`);
    }
  };

  return type === 'loan' ? (
    <div className={styles.OrderItem} onClick={toBack}>
      <div className={styles.head}>
        <h3>
          {formatMessage({ id: 'margin.title.toLoan' })} {item.marginCrncy}
        </h3>
        <span className={item.remainAmount !== '0' ? styles.uncomplite : styles.complite}>
          {item.remainAmount !== '0'
            ? formatMessage({ id: 'margin.title.loan.state1' })
            : formatMessage({ id: 'margin.title.loan.state2' })}
        </span>
      </div>
      <div className={styles.body}>
        <div>
          <span>{formatMessage({ id: 'act.invite_datatime' })}</span>
          <b>{timeToString(item.createTime * 1)}</b>
        </div>
        <div>
          <span>
            {formatMessage({ id: 'margin.title.loan_number' })}({item.currency})
          </span>
          <b>{`${item.borrowAmount}`}</b>
        </div>
        <div>
          <span>
            {formatMessage({ id: 'margin.title.remain_intrst' })}({item.currency})
          </span>
          <b>{`${Number(cutFloatDecimal(item.remainInterest, 8))}`}</b>
        </div>
      </div>
      <div className={styles.body}>
        <div>
          <span>{formatMessage({ id: 'margin.title.orderId' })}</span>
          <b>{item.recordNo}</b>
        </div>
        <div>
          <span>
            {formatMessage({ id: 'margin.title.remain_num' })}({item.currency})
          </span>
          <b>{`${Number(cutFloatDecimal(item.remainAmount, 8))}`}</b>
        </div>
      </div>
    </div>
  ) : (
    <div className={styles.OrderItem}>
      <div className={styles.head}>
        <h3>
          {formatMessage({ id: 'margin.title.toBack' })} {item.currency}
        </h3>
      </div>
      <div className={styles.body}>
        <div>
          <span>{formatMessage({ id: 'act.invite_datatime' })}</span>
          <b>{timeToString(item.createTime * 1)}</b>
        </div>
        <div>
          <span>
            {formatMessage({ id: 'margin.title.loan_number' })}({item.currency})
          </span>
          <b>{`${item.borrowAmount}`}</b>
        </div>
        <div>
          <span>
            {formatMessage({ id: 'margin.title.record.has_pay' })}({item.currency})
          </span>
          <b>{`${item.repayAmount}`}</b>
        </div>
      </div>
      <div className={styles.body}>
        <div>
          <span>{formatMessage({ id: 'margin.title.orderId' })}</span>
          <b>{item.borrowRecordNo}</b>
        </div>
        <div>
          <span>
            {formatMessage({ id: 'margin.title.repay_intrst' })}({item.currency})
          </span>
          <b>{`${item.repayInterest}`}</b>
        </div>
      </div>
    </div>
  );
};

export default CommonRecord;
