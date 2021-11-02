import { Button } from 'antd-mobile';
import { formatMessage } from 'umi/locale';
import cn from 'classnames';
import router from 'umi/router';
import styles from './Ticket.less';

export default function Container({ info }) {
  const isShow = info.draws && info.draws.length > 0;
  const draws = info.draws;
  const wonDraws = draws ? draws.filter(item => item.won === 1) : [];

  const formatDraw = num => {
    const zeroNum = 6;

    if (num) {
      const _num = num.length >= zeroNum ? 0 : zeroNum - num.length;

      return new Array(_num)
        .fill(0)
        .concat(num)
        .join('');
    } else {
      return '';
    }
  };

  return isShow ? (
    <>
      <div className={styles.draw}>
        <div className={styles.head}>
          <span>{formatMessage({ id: 'mc_launchpads_detail_all_ticket' }, { number: draws.length })}</span>
        </div>
        <div className={styles.ticket}>
          {draws.map(item => (
            <span key={item.drawNum}>{formatDraw(item.drawNum)}</span>
          ))}
        </div>
      </div>
      {wonDraws.length > 0 && (
        <div className={cn(styles.draw, styles.win)}>
          <div className={styles.head}>
            <span>{formatMessage({ id: 'mc_launchpads_detail_my_ticket' }, { number: wonDraws.length })}</span>
          </div>
          <div className={styles.ticket}>
            {wonDraws.map(item => (
              <span key={item.drawNum}>{formatDraw(item.drawNum)}</span>
            ))}
          </div>
        </div>
      )}
      <div className={styles.btn} style={{ marginTop: 20 }}>
        <Button type="primary" onClick={e => router.push(`/launchpad/record/`)}>
          {formatMessage({ id: 'labs.title.my_record' })}
        </Button>
      </div>
    </>
  ) : (
    <></>
  );
}
