import React, { useEffect, useState } from 'react';
import Cover from './Cover';
import Receive from './Receive';
import Result from './Result';
import { getRedPacketInfo } from '@/services/api';
import { Tabs, Modal } from 'antd-mobile';
import { formatMessage } from 'umi-plugin-locale';
import { connect } from 'dva';
import cn from 'classnames';

import styles from './index.less';

function Container({ dispatch, location }) {
  // 获取红包信息
  const [redPacketInfo, setRedPacketInfo] = useState(null);
  const [redPacketId, setRedPacketId] = useState(null);
  useEffect(() => {
    const { id } = location.query;

    if (id) {
      getRedPacketInfo(id).then(result => {
        if (result && result.code === 0) {
          setRedPacketInfo({ ...result.data, duration: result.duration });
        }
      });

      setRedPacketId(id);
    }

    dispatch({
      type: 'global/getCountryList'
    });
  }, []);

  useEffect(() => {
    if (redPacketInfo) {
      if (redPacketInfo.expired) {
        Modal.alert(formatMessage({ id: 'ucenter.api.info.reminder' }), formatMessage({ id: 'redPacket.qrcode.expired' }), [
          {
            text: formatMessage({ id: 'mc_launchpads_modal_know' }),
            onPress: () => {},
            style: { fontSize: 16, color: '#DF384E', fontWeight: 'bold' }
          }
        ]);
      } else {
        if (!redPacketInfo.hasRemainQuantity) {
          Modal.alert(formatMessage({ id: 'ucenter.api.info.reminder' }), formatMessage({ id: 'redPacket.qrcode.none' }), [
            {
              text: formatMessage({ id: 'mc_launchpads_modal_know' }),
              onPress: () => {},
              style: { fontSize: 16, color: '#DF384E', fontWeight: 'bold' }
            }
          ]);
        }
      }
    }
  }, [redPacketInfo]);

  const [page, setPage] = useState(0);
  const [receiveResult, setReceiveResult] = useState(null);

  return (
    <div className={cn(styles.wrapper, 'theme-light')}>
      {/*{redPacketInfo && (*/}
      <Tabs
        tabs={[{ title: 'cover' }, { title: 'receive' }, { title: 'result' }]}
        renderTabBar={false}
        swipeable={false}
        useOnPan={false}
        page={page}
        prerenderingSiblingsNumber={0}
      >
        <Cover setPage={setPage} redPacketInfo={redPacketInfo} redPacketId={redPacketId} />
        <Receive setPage={setPage} redPacketInfo={redPacketInfo} redPacketId={redPacketId} setReceiveResult={setReceiveResult} />
        <Result setPage={setPage} redPacketInfo={redPacketInfo} receiveResult={receiveResult} redPacketId={redPacketId} />
      </Tabs>
      {/*)}*/}
    </div>
  );
}

export default connect(({ setting, auth, otc }) => ({}))(Container);
