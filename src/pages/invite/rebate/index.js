import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import classNames from 'classnames';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import styles from './index.less';
import InvitationList from './invitationList';
import ShareImg from './shareImg';
import { getInviteRebateInfo } from '@/services/api';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Button, Modal, Toast, Flex } from 'antd-mobile';
import { add } from '@/utils';
import CustomerService from '@/pages/event/customer-service';
import QRCode from 'qrcode.react';

const lang = getLocale();
const isApp = window.localStorage.getItem('mxc.view.from') === 'app';

function Rebate({ dispatch, inviteCode }) {
  const [modal3Visible, setModal3Visible] = useState(false);
  const [inviteUrl, setInviteUrl] = useState();
  const [inviteInfo, setInviteInfo] = useState();
  const closeModal3 = () => setModal3Visible(false);
  useEffect(() => {
    const userRecord = async () => {
      const res = await getInviteRebateInfo();

      if (res.code === 0) {
        setInviteUrl(res.url);
        setInviteInfo(res);
      }
    };
    userRecord();

    if (!inviteCode) {
      dispatch({ type: 'auth/getUcenterIndexInfo' });
    }
  }, []);

  const [faceModalVisible, setFaceModalVisible] = useState(false);
  const qrUrl =
    NODE_ENV === 'production' && inviteUrl && /^(https?):\/\/.+$/.test(inviteUrl)
      ? inviteUrl
      : `${window.location.origin}/auth/signup?inviteCode=${inviteCode || ''}`;

  const sharePosterHandle = () => {
    if (inviteCode) {
      if (isApp) {
        window.location.href = 'mxcappscheme://invitationRebateSharePost';
      } else {
        setModal3Visible(true);
      }
    } else {
      Toast.fail(formatMessage({ id: 'mc_common_system_busy' }), 1);
    }
  };

  const onCopyHandle = (text, result) => {
    if (result && inviteCode) {
      Toast.success(formatMessage({ id: 'common.copy_success' }), 1);
    } else {
      Toast.fail(formatMessage({ id: 'mc_common_system_busy' }), 1);
    }
  };

  const faceInviteHandle = () => {
    if (inviteCode) {
      setFaceModalVisible(true);
    } else {
      Toast.fail(formatMessage({ id: 'mc_common_system_busy' }), 1);
    }
  };

  return (
    <div>
      <TopBar
        extra={
          <span onClick={() => router.push('/invite/rebate-record')} className="f-14 color-middle">
            {formatMessage({ id: 'invite.title.orderinfo' })}
          </span>
        }
      >
        {formatMessage({ id: 'invite.rebate.title' })}
        {/*<i className={classNames([styles.icontishi, 'iconfont icontishi'])} onClick={() => router.push('/invite/rules')}></i>*/}
      </TopBar>
      <div className={styles.rebateContent}>
        <div className={classNames(styles.rebateHeader, !lang.startsWith('zh-') && styles.en)}>
          <div className={styles.rebateHeaderItem}>
            <div>
              <span className={styles.rebateHeaderTitle}>{formatMessage({ id: 'invite.people.number' })}</span>
              <span className={styles.rebateHeaderValue}>{inviteInfo?.total ?? '--'}</span>
            </div>
            <div>
              <span className={styles.rebateHeaderTitle}>{formatMessage({ id: 'invite.title.margin' })}</span>
              <span className={styles.rebateHeaderValue}>{inviteInfo?.margin ?? '--'}</span>
            </div>
          </div>
          <div className={styles.rebateHeaderItem}>
            <div>
              <span className={styles.rebateHeaderTitle}>{formatMessage({ id: 'act.cumulative_rebate' })}</span>
              <span className={styles.rebateHeaderValue}>
                {inviteInfo?.contract ? add(add(inviteInfo.exchange, inviteInfo.margin), inviteInfo.contract) : '--'}
              </span>
            </div>
            <div>
              <span className={styles.rebateHeaderTitle}>{formatMessage({ id: 'invite.title.futures' })}</span>
              <span className={styles.rebateHeaderValue}>{inviteInfo?.contract ?? '--'}</span>
            </div>
          </div>
          <div className={styles.rebateHeaderItem}>
            <span className={styles.rebateHeaderTitle}>{formatMessage({ id: 'invite.title.spot' })}</span>
            <span className={styles.rebateHeaderValue}>{inviteInfo?.exchange ?? '--'}</span>
          </div>
        </div>
        <Flex className={styles.rebateHeaderTip} justify="between">
          <p>{formatMessage({ id: 'invite.header.tip' })}</p>
          {isApp && (
            <span className={styles.rebateHeaderRecord} onClick={() => router.push('/invite/rebate-record')}>
              <i className="iconfont iconfile-order" />
              {formatMessage({ id: 'invite.title.orderinfo' })}
            </span>
          )}
        </Flex>
        {lang !== 'zh-CN' && (
          <div className={styles.rebatebtn}>
            <Button className={styles.shareBtn} type="primary" onClick={sharePosterHandle}>
              {formatMessage({ id: 'invite.posters.share' })}
            </Button>
            <CopyToClipboard text={inviteCode ? qrUrl : undefined} onCopy={onCopyHandle}>
              <Button className={styles.postersBtn} type="primary">
                {formatMessage({ id: 'invite.posters.linke' })}
              </Button>
            </CopyToClipboard>
            <Button type="primary" className={styles.faceBtn} onClick={faceInviteHandle}>
              {formatMessage({ id: 'invite.header.face' })}
            </Button>
          </div>
        )}
      </div>
      <InvitationList />
      <Modal popup animationType="slide-up" visible={modal3Visible} onClose={closeModal3}>
        <div className={styles.modalContent}>
          <div className={styles.footmodal}>
            <div>{formatMessage({ id: 'invite.posters.meshare' })}</div>
            <div onClick={() => setModal3Visible(false)}>{formatMessage({ id: 'common.cancel' })}</div>
          </div>
          <ShareImg inviteCode={inviteCode} inviteUrl={inviteUrl} />
        </div>
      </Modal>

      <Modal
        maskClosable={false}
        className={styles.faceModal}
        transparent
        visible={faceModalVisible}
        onClose={() => setFaceModalVisible(false)}
      >
        <div className={styles.faceModalContent}>
          <h4 className={styles.faceModalTitle}>{formatMessage({ id: 'invite.header.face' })}</h4>
          <p className={styles.faceModalTitleTip}>{formatMessage({ id: 'invite.header.face.tip' })}</p>
          <QRCode value={qrUrl} size={155} className={styles.faceModalQrcode} />
        </div>
        <div className={styles.faceModalClose}>
          <span className={styles.faceModalCloseBtn} onClick={() => setFaceModalVisible(false)} />
        </div>
      </Modal>

      {/*<CustomerService />*/}
    </div>
  );
}

export default connect(({ auth }) => ({
  user: auth.user,
  inviteCode: auth.inviteCode
}))(Rebate);
