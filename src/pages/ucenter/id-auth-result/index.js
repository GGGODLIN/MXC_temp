import React, { useCallback, useEffect, useMemo } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import { Button, Toast } from 'antd-mobile';

import styles from './index.less';

const idCardTypeMap = {
  0: formatMessage({ id: 'ucenter.kyc.card_type.driving' }),
  1: formatMessage({ id: 'ucenter.kyc.card_type.id_card' }),
  2: formatMessage({ id: 'ucenter.kyc.card_type.passport' }),
  3: 'VISA',
  4: formatMessage({ id: 'ucenter.frozen.reason.other' })
};
const language = getLocale();

function IdAuthResult({ loginMember, kycInfo, authStatus, vipLevel, kycInfo: { level2, level3 }, dispatch, countryList }) {
  useEffect(() => {
    if (!loginMember) {
      dispatch({ type: 'auth/getUcenterIndexInfo' });
    }
  }, []);

  const btnClick = () => {
    router.push('/ucenter/id-auth');
  };

  const kycAdvanced = useCallback(() => {
    Toast.info(formatMessage({ id: 'ucenter.kyc.result.success.advanced' }));
  }, []);

  const { juniorResult, seniorResult } = useMemo(() => {
    let juniorResult = {};
    let seniorResult = {};

    if (kycInfo && countryList) {
      const { junior, senior } = kycInfo;
      const { juniorIng, juniorSuccess, juniorReject, seniorIng, seniorSuccess, seniorReject } = authStatus;

      if (junior && (juniorIng || juniorSuccess || juniorReject)) {
        const currentCountry =
          countryList.find(country => country.code.toLocaleLowerCase() === junior.countryCode.toLocaleLowerCase()) || {};

        juniorResult = {
          ...junior,
          country: language.startsWith('zh-') ? currentCountry.cn || '--' : currentCountry.en || '--'
        };
      }

      if (senior && (seniorIng || seniorSuccess || seniorReject)) {
        const currentCountry =
          countryList.find(country => country.code.toLocaleLowerCase() === senior.countryCode.toLocaleLowerCase()) || {};

        seniorResult = {
          ...senior,
          country: language.startsWith('zh-') ? currentCountry.cn || '--' : currentCountry.en || '--'
        };
      }

      return {
        juniorResult,
        seniorResult
      };
    }

    return {
      juniorResult,
      seniorResult
    };
  }, [kycInfo, countryList]);

  return (
    <>
      <TopBar>{formatMessage({ id: 'ucenter.kyc.result.title' })}</TopBar>
      {loginMember && (
        <div className={styles.wrapper}>
          <section className={styles.item}>
            <div className={styles.header}>
              <h4 className={styles.title}>{formatMessage({ id: 'ucenter.index.level.high' })}</h4>
              {(authStatus?.seniorUnverified || authStatus?.seniorReject) && (
                <Button disabled={authStatus?.juniorIng} className={styles.button} type="ghost" inline size="small" onClick={kycAdvanced}>
                  {formatMessage({ id: 'mc_id_auth_unverified' })}
                </Button>
              )}

              {authStatus?.seniorIng && <p className={styles.successTag}>{formatMessage({ id: 'ucenter.index.features.kyc_ing' })}</p>}

              {authStatus?.seniorSuccess && (
                <p className={styles.successTag}>
                  <span className="iconfont iconconfirm" />
                  {formatMessage({ id: 'ucenter.index.verified' })}
                </p>
              )}
            </div>
            {authStatus?.seniorReject && (
              <p className={styles.rejectReason}>
                <span className="iconfont iconclose-circle" />
                {formatMessage({ id: 'ucenter.index.features.kyc_reject' })}
                {seniorResult.note && `（${seniorResult.note}）`}
              </p>
            )}

            {authStatus && !authStatus?.seniorSuccess && (
              <p className={styles.desc}>{formatMessage({ id: 'mc_id_auth_withdraw_limit' }, { withdrawLimit: vipLevel || level3 })}</p>
            )}
          </section>

          {!authStatus?.seniorSuccess && (
            <section className={styles.item}>
              <div className={styles.header}>
                <h4 className={styles.title}>{formatMessage({ id: 'ucenter.index.level.low' })}</h4>
                {(authStatus?.juniorUnverified || authStatus?.juniorReject) && (
                  <Button disabled={authStatus?.seniorIng} className={styles.button} type="ghost" inline size="small" onClick={btnClick}>
                    {formatMessage({ id: 'mc_id_auth_unverified' })}
                  </Button>
                )}

                {authStatus?.juniorIng && <p className={styles.successTag}>{formatMessage({ id: 'ucenter.index.features.kyc_ing' })}</p>}

                {authStatus?.juniorSuccess && (
                  <p className={styles.successTag}>
                    <span className="iconfont iconconfirm" />
                    {formatMessage({ id: 'ucenter.index.verified' })}
                  </p>
                )}
              </div>
              {authStatus?.juniorReject && (
                <p className={styles.rejectReason}>
                  <span className="iconfont iconclose-circle" />
                  {formatMessage({ id: 'ucenter.index.features.kyc_reject' })}
                  {juniorResult.note && `（${juniorResult.note}）`}
                </p>
              )}

              {authStatus && !authStatus?.juniorSuccess && (
                <p className={styles.desc}>{formatMessage({ id: 'mc_id_auth_withdraw_limit' }, { withdrawLimit: vipLevel || level2 })}</p>
              )}

              {authStatus?.juniorSuccess && (
                <div className={styles.successInfo}>
                  <p>{formatMessage({ id: 'ucenter.kyc.result.success.text2' })}</p>
                  <p>
                    {formatMessage({ id: 'ucenter.kyc.country' })}：{juniorResult.country || '--'}
                  </p>
                  <p>
                    {formatMessage({ id: 'ucenter.kyc.name' })}：{juniorResult.authName || '--'}
                  </p>
                  <p>
                    {formatMessage({ id: 'ucenter.kyc.card_type' })}：{idCardTypeMap[juniorResult.cardType] || '--'}
                  </p>
                  <p>
                    {formatMessage({ id: 'ucenter.kyc.result.success.text4' })}：{juniorResult.cardNo || '--'}
                  </p>
                  <p>
                    {formatMessage({ id: 'ucenter.index.level.24h' })}：{vipLevel || level2 || '--'} BTC
                  </p>
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </>
  );
}

export default connect(({ global, auth }) => ({
  user: auth.user,
  kycInfo: auth.kycInfo,
  authStatus: auth.authStatus,
  loginMember: auth.loginMember, // 用户信息
  vipLevel: auth.vipLevel,
  countryList: global.countryList
}))(IdAuthResult);
