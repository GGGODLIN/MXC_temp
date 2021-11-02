import styles from './Suspend.module.scss';

export default function Container({ spotChainsItem, type }) {
  const tips = type === 'deposit' ? spotChainsItem.disableDepositReason : spotChainsItem.disableWithdrawReason;

  return (
    <div className={styles.wrapper}>
      <p dangerouslySetInnerHTML={{ __html: tips ? tips.replace(/\n/g, '<br />') : '' }} />
    </div>
  );
}
