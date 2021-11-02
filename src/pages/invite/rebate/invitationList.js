import React, { useState, useEffect, useReducer } from 'react';
import { connect } from 'dva';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import styles from './invitationList.less';
import { getRebateTopn } from '@/services/api';
import router from 'umi/router';

const recordList = (data, ivitationIcon) => {
  return data.map((item, index) => {
    return (
      <div className={styles.invitationList} key={item.member}>
        <div>
          {ivitationIcon[index].icon}
          <span>{item.member}</span>
        </div>
        <div>{formatMessage({ id: 'invite.posters.number' }, { count: item.total_invite })}</div>
        <div>
          {item.amount} {item.currency}
        </div>
      </div>
    );
  });
};

function Rebate() {
  const [ivitationInfo, setivitationInfo] = useState([]);

  const [ivitationIcon, setivitationIcon] = useState([
    {
      icon: <i className={classNames([styles.iconone, 'iconfont iconzixuan-unselected'])}></i>
    },
    {
      icon: <i className={classNames([styles.icontwo, 'iconfont iconzixuan-unselected'])}></i>
    },
    {
      icon: <i className={classNames([styles.iconthree, 'iconfont iconzixuan-unselected'])}></i>
    }
  ]);
  useEffect(() => {
    let params = {
      limit: 3
    };
    const userRecord = async () => {
      const res = await getRebateTopn(params);
      console.log(res);
      if (res.code === 0) {
        setivitationInfo(res.data);
      }
    };
    userRecord();
  }, []);

  return (
    <div className={styles.listContetnt}>
      <h3 className={styles.listHeader}>
        <span className={styles.listHeaderIcon} />
        <span className={styles.listHeaderText}>{formatMessage({ id: 'invite.rebate.rule.t' })}</span>
      </h3>

      <div className={styles.rulesContent}>
        <p>{formatMessage({ id: 'mc_invite_rule_1' })}</p>
        <p>{formatMessage({ id: 'mc_invite_rule_2' })} </p>
        <p>{formatMessage({ id: 'mc_invite_rule_2_1' })} </p>
        <p>{formatMessage({ id: 'mc_invite_rule_2_2' })} </p>
        <p>{formatMessage({ id: 'mc_invite_rule_2_3' })} </p>
        <p>{formatMessage({ id: 'mc_invite_rule_2_4' })} </p>
        <p>{formatMessage({ id: 'mc_invite_rule_3' })}</p>
        <p>{formatMessage({ id: 'mc_invite_rule_3_1' })}</p>
        <p>{formatMessage({ id: 'mc_invite_rule_3_2' })}</p>
        <p>{formatMessage({ id: 'mc_invite_rule_3_3' })}</p>
        <p>{formatMessage({ id: 'mc_invite_rule_2_4' })}</p>
        <p>{formatMessage({ id: 'mc_invite_rule_4' })}</p>
        <p>{formatMessage({ id: 'mc_invite_rule_5' })}</p>
        <p>{formatMessage({ id: 'mc_invite_rule_6' })}</p>
        <p>{formatMessage({ id: 'mc_invite_rule_7' })}</p>
        <p>{formatMessage({ id: 'mc_invite_rule_8' })}</p>
        <p>{formatMessage({ id: 'mc_invite_rule_9' })}</p>
        <p>{formatMessage({ id: 'mc_invite_rule_10' })}</p>
        <p>{formatMessage({ id: 'mc_invite_rule_11' })}</p>
      </div>
    </div>
  );
}

export default connect(({ auth }) => ({
  user: auth.user
}))(Rebate);
