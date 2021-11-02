import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import { createForm } from 'rc-form';
import { bindAntiPhishing } from '@/services/api';
import { phishingCodeReg } from '@/utils/regExp';
import { InputItem, Flex, Toast, WingBlank, WhiteSpace, Button } from 'antd-mobile';

import styles from './index.less';
import commonStyles from '../common.less';
import phishingBg from '@/assets/img/ucenter/phishing_bg.png';

function PhishingSet({ phishingCode, dispatch, form: { validateFields, getFieldProps, isFieldTouched, getFieldError } }) {
  useEffect(() => {
    validateFields();

    if (!phishingCode) {
      dispatch({ type: 'auth/getPhishingCode' });
    }
  }, []);

  const [submitLoading, setSubmitLoading] = useState(false);
  const submitHandle = useCallback(() => {
    validateFields(async (err, values) => {
      if (!err) {
        setSubmitLoading(true);

        const phishingCode = values.phishingCode;

        let result = await bindAntiPhishing(phishingCode);

        if (result && result.code === 0) {
          Toast.success(formatMessage({ id: 'ucenter.phishing.success' }), 2, () => {
            setSubmitLoading(false);
            dispatch({ type: 'auth/getPhishingCode' });

            router.push('/ucenter/security');
          });
        } else {
          setSubmitLoading(false);
        }
      }
    });
  }, []);

  return (
    <>
      <TopBar>{phishingCode ? formatMessage({ id: 'ucenter.phishing.label1' }) : formatMessage({ id: 'ucenter.phishing.label2' })}</TopBar>
      {phishingCode && (
        <>
          <WhiteSpace size="xl" />
          <Flex justify="between" className={styles['phishing-wrapper']}>
            <div className={styles.phishing}>
              <p>{formatMessage({ id: 'ucenter.phishing.mine' })}</p>
              <h3>{phishingCode}</h3>
            </div>
            <div className={styles['phishing-bg']}>
              <img src={phishingBg} alt="phishingBg" />
            </div>
          </Flex>
        </>
      )}
      <WingBlank>
        <WhiteSpace size="xl" />
        <section className={styles.item}>
          <InputItem
            {...getFieldProps('phishingCode', {
              rules: [
                { required: true, message: formatMessage({ id: 'ucenter.phishing.error' }) },
                { pattern: phishingCodeReg, message: formatMessage({ id: 'ucenter.phishing.error' }) }
              ]
            })}
            placeholder={formatMessage({ id: 'ucenter.phishing.placeholder' })}
          />

          <p className={commonStyles.error}>
            {getFieldError('phishingCode') && isFieldTouched('phishingCode') ? getFieldError('phishingCode').join(',') : ''}
          </p>
        </section>
        <Button type="primary" disabled={getFieldError('phishingCode')} loading={submitLoading} onClick={submitHandle}>
          {formatMessage({ id: 'common.yes' })}
        </Button>
        <p className={styles.tip}>{formatMessage({ id: 'ucenter.phishing.help' })}</p>
      </WingBlank>
    </>
  );
}

export default connect(({ auth }) => ({
  user: auth.user,
  phishingCode: auth.phishingCode
}))(createForm()(PhishingSet));
