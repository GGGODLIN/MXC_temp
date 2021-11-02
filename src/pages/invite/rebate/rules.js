import React from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import styles from './rules.less';

function Rebate() {
  return (
    <div className={styles.listContetnt}>
      <TopBar> {formatMessage({ id: 'invite.rebate.rule.t' })} </TopBar>
      <div className={styles.rulesContent}>
        <span>{formatMessage({ id: 'invite.title.rebate.invited_rule_1' })}</span> <br /> <br />
        <span>
          <span> {formatMessage({ id: 'invite.title.rebate.invited_rule_2' })} </span>
          <br />
          <span> {formatMessage({ id: 'invite.title.rebate.invited_rule_2.1' })} </span>
          <br />
          <span> {formatMessage({ id: 'invite.title.rebate.invited_rule_2.2' })} </span>
          <br />
          <span> {formatMessage({ id: 'invite.title.rebate.invited_rule_2.3' })} </span>
          <br />
          <span>{formatMessage({ id: 'invite.title.rebate.invited_rule_2.4' })} </span>
          <br />
          <br />
          <span>{formatMessage({ id: 'invite.title.rebate.invited_rule_2.5' })} </span>
          <br />
          <span>{formatMessage({ id: 'invite.title.rebate.invited_rule_2.6' })} </span>
          <br />
          <span>{formatMessage({ id: 'invite.title.rebate.invited_rule_2.7' })} </span>
          <br />
          <span>{formatMessage({ id: 'invite.title.rebate.invited_rule_2.8' })} </span>
          <br />
          <span>{formatMessage({ id: 'invite.title.rebate.invited_rule_2.9' })} </span>
          <br />
        </span>
        <br />
        <span>{formatMessage({ id: 'invite.title.rebate.invited_rule_3' })}</span>
        <br /> <br />
        <span>{formatMessage({ id: 'invite.title.rebate.invited_rule_4' })}</span>
        <br /> <br />
        <span>{formatMessage({ id: 'invite.title.rebate.invited_rule_5' })}</span>
        <br />
        <br />
        <span> {formatMessage({ id: 'invite.title.rebate.invited_rule_6' })} </span>
        <br />
        <br />
        <span>{formatMessage({ id: 'invite.title.rebate.invited_rule_7' })} </span>
        <br />
        <br />
        <span>{formatMessage({ id: 'invite.title.rebate.invited_rule_8' })} </span>
        <br />
        <br />
        <span>{formatMessage({ id: 'invite.title.rebate.invited_rule_9' })}</span>
        <br />
        <br />
        <span>{formatMessage({ id: 'invite.title.rebate.invited_rule_10' })}</span>
        <br />
      </div>
    </div>
  );
}

export default connect(({ auth }) => ({
  user: auth.user
}))(Rebate);
