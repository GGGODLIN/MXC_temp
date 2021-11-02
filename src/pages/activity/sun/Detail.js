import React, { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import { Button, InputItem, Checkbox, Toast } from 'antd-mobile';
import cn from 'classnames';
import Link from 'umi/link';
import ThemeOnly from '@/components/ThemeOnly';
import { getLocale, formatMessage } from 'umi/locale';
import { getSubSite, getPercent, timeToString } from '@/utils';
import { sunshineDetail, getAssetBalance, sunshineVote } from '@/services/api';
import TipModal from './tipModal';
import styles from './Detail.less';
import { createForm } from 'rc-form';
const lang = getLocale();
const MAIN_SITE_API_PATH = NODE_ENV === 'production' ? `${getSubSite('main')}/api` : API_PATH;

function Container({ match, form }) {
  const [detail, setDetail] = useState({});
  const [balances, setBalances] = useState(0);
  const [btnAvailable, setBtnAvailable] = useState(false);
  const { getFieldProps, setFieldsValue } = form;

  useEffect(() => {
    sunDetailFn();
    const timer = setInterval(sunDetailFn, 20000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  // 加载活动详情
  const sunDetailFn = () => {
    sunshineDetail(match.params.id).then(result => {
      if (result.code === 0) {
        setDetail(result.data);
        getBalanceHandle(result.data.currency);
      }
    });
  };
  // 获取资产
  const getBalanceHandle = currency => {
    getAssetBalance({ currency }).then(result => {
      if (result && result.code === 0) {
        setBalances(result.balances[currency]?.available || 0);
      }
    });
  };

  const numerChange = e => {
    const value = e;
    const maxValue = 1000000;

    if (/^(0|[1-9][0-9]*)(\.[0-9]{0,8})?$/.test(value.toString()) || value === '') {
      setFieldsValue({ lockNum: value < maxValue ? value : maxValue });
    }
  };

  const handelOk = () => {
    form.validateFields(async (error, value) => {
      if (!value.lockNum) return Toast.info(formatMessage({ id: 'mc_sun_input_limit' }));
      if (value.lockNum && Number(value.lockNum) < detail.limitMin) {
        return Toast.info(formatMessage({ id: 'mc_sun_min_tip' }, { number: detail.limitMin, coin: detail.currency }));
      }
      const params = { poolId: match.params.id, amount: value.lockNum };
      sunshineVote(params).then(res => {
        if (res && res.code === 0) {
          Toast.info(formatMessage({ id: 'mc_slot_assessment_do_success' }));
          form.resetFields();
          getBalanceHandle(detail.currency);
        }
      });
    });
  };

  const iconImg = icon => {
    const image = icon ? `${MAIN_SITE_API_PATH}/file/download/${icon}` : '/images/placeholder-img.png';
    return image;
  };
  return (
    <>
      <ThemeOnly theme="light">
        <div className={styles.detailContainer}>
          <TopBar>{formatMessage({ id: 'mc_sun_head_banner_title' })}</TopBar>
          <div className={styles.bgBlack}>
            <h5 className={styles.titleIn}>{formatMessage({ id: 'common.title.project_detail' })}</h5>
          </div>
          <div className={styles.position}>
            <div className={styles.sunDetail}>
              <div className={cn(styles.itemHeader, styles.fontBlack)}>
                <div className={styles.itemHeaderLeft}>
                  {detail.profitCurrencyIcon && (
                    <img
                      src={`${MAIN_SITE_API_PATH}/file/download/${detail.profitCurrencyIcon}`}
                      alt="icon"
                      className={styles.currencyIcon}
                    />
                  )}
                  <div>
                    <span className={styles.totalSize}>{detail.profitCurrency}</span>
                    <p className={styles.normalSize}>{detail.profitCurrencyFullName}</p>
                  </div>
                </div>
                <div className={styles.itemHeaderRight}>
                  <span className={styles.totalSize}>{detail.totalSupply}</span>
                  <p className={cn(styles.normalSize, styles.rightAlign)}>
                    {formatMessage({ id: 'mc_sun_list_total' }, { coin: detail.profitCurrency })}
                  </p>
                </div>
              </div>
              <div className={cn(styles.itemInfo, styles.fontBlack)}>
                <div className={styles.flexBetween}>
                  <span className={styles.descLabel}>{formatMessage({ id: 'mc_sun_list_number_total' })}</span>
                  <span>{detail.currentVoteQuantity}</span>
                </div>
                <div className={styles.flexBetween}>
                  <div>
                    <span className={styles.descLabel}>{formatMessage({ id: 'mc_sun_list_target' })}</span>
                    <TipModal text={formatMessage({ id: 'mc_sun_list_target_tip' })} />
                  </div>
                  <span>{getPercent(detail.targetVote, false) || '--'}</span>
                </div>
                <div className={styles.flexBetween}>
                  <div>
                    <span className={styles.descLabel}>{formatMessage({ id: 'mc_sun_list_current' })}</span>
                    <TipModal text={formatMessage({ id: 'mc_sun_list_current_tip' })} />
                  </div>
                  <span className={styles.currentNum}>{getPercent(detail.currentVote, false) || '--'}</span>
                </div>
              </div>
              <div className={cn(styles.descLabel, styles.timeShow)}>
                <span>{formatMessage({ id: 'mc_sun_time_start' })}</span>
                <p>
                  {timeToString(detail.startTime, 'YYYY-MM-DD HH:mm')} - {timeToString(detail.endTime, 'YYYY-MM-DD HH:mm')}
                </p>
              </div>
              {/* 表单 */}
              <div>
                <div className={styles.detailBalances}>
                  <p>{formatMessage({ id: 'mc_sun_list_voteNumber' })}</p>
                  <span>
                    {formatMessage({ id: 'mc_sun_list_total_use' })}
                    {balances || '--'} {detail.currency}
                  </span>
                </div>
                <InputItem
                  className="am-search-input"
                  type="digit"
                  extra={
                    <span className={styles.all} onClick={() => setFieldsValue({ lockNum: balances })}>
                      {formatMessage({ id: 'fin.common.all' })}
                    </span>
                  }
                  {...getFieldProps('lockNum')}
                  placeholder={formatMessage({ id: 'mc_sun_list_input_min' }, { number: detail.limitMin, coin: detail.currency })}
                  onChange={e => numerChange(e)}
                  clear
                />
                <div className={styles.agreeText}>
                  <Checkbox
                    className={styles.fontMin}
                    data-seed="logId"
                    checked={btnAvailable}
                    onChange={() => setBtnAvailable(!btnAvailable)}
                  >
                    {formatMessage({ id: 'labs.title.bought_ask' })}{' '}
                    <Link className={styles.link} to={'/info/risk'}>{`<<${formatMessage({ id: 'info.title.risk.title' })}>>`}</Link>
                  </Checkbox>
                </div>
                <Button disabled={!btnAvailable} onClick={() => handelOk()} type="primary">
                  {formatMessage({ id: 'mc_sun_list_join' })}
                </Button>
                <div className={styles.bottomTip}>
                  <i className={'iconfont iconinfo-circle1'}></i>
                  {formatMessage({ id: 'mc_sun_list_input_know' })}
                </div>
              </div>
            </div>
            <div className={styles.imgDetail}>
              <img
                src={iconImg(lang === 'zh-CN' || lang === 'zh-TW' ? detail.h5ProjectIntroduction : detail.h5ProjectIntroductionEn)}
                alt="项目介绍"
              />
            </div>
          </div>
        </div>
      </ThemeOnly>
    </>
  );
}

export default createForm()(Container);
