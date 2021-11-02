import React, { useCallback, useEffect } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { formatMessage } from 'umi-plugin-locale';
import { apiKeyHandle } from '@/services/api';
import { Flex, Toast, WingBlank, Button, Modal, SwipeAction } from 'antd-mobile';
import TopBar from '@/components/TopBar';
import Empty from '@/components/Empty';

import styles from './index.less';
import commonStyles from '../common.less';
import { CopyToClipboard } from 'react-copy-to-clipboard';

function renderStatus(status) {
  switch (status) {
    case 1:
      return formatMessage({ id: 'assets.recharge.status.normal' });
    case 2:
      return formatMessage({ id: 'assets.recharge.status.invalid' });
    default:
      return '--';
  }
}

function API({ apiKeyList, dispatch }) {
  useEffect(() => {
    if (!apiKeyList) {
      dispatch({ type: 'api/getApiKeyList' });
    }
  }, []);

  const onCopy = useCallback((text, result) => {
    if (result) {
      Toast.success(formatMessage({ id: 'common.copy_success' }), 2);
    }
  }, []);

  const goDetail = useCallback(id => {
    router.push(`/ucenter/openapi-detail/${id}`);
  }, []);

  const onDelete = useCallback(api => {
    Modal.alert(
      formatMessage({ id: 'ucenter.api.delete' }) + ' API',
      `${formatMessage({ id: 'ucenter.api.delete.tip.1' })} ${api.memo} ${formatMessage({ id: 'ucenter.api.delete.tip.2' })}`,
      [
        { text: formatMessage({ id: 'common.cancel' }) },
        { text: formatMessage({ id: 'common.sure' }), onPress: () => deleteHandle(api.id) }
      ]
    );
  }, []);

  const deleteHandle = useCallback(id => {
    apiKeyHandle(
      {
        apiKeyId: id
      },
      'delete'
    ).then(result => {
      if (result && result.code === 0) {
        Toast.success(formatMessage({ id: 'ucenter.api.delete.success' }));
        dispatch({ type: 'api/getApiKeyList' });
      }
    });
  });

  return (
    <>
      <TopBar>{formatMessage({ id: 'ucenter.api.title' })}</TopBar>
      <section className={styles.wrapper}>
        {apiKeyList &&
          !!apiKeyList.length &&
          apiKeyList.map(item => (
            <SwipeAction
              key={item.id}
              className={styles.item}
              // autoClose
              right={[
                {
                  text: (
                    <div>
                      {formatMessage({ id: 'fin.common.Banking_detail' })} <i className="iconfont iconjinru"></i>
                    </div>
                  ),
                  onPress: () => goDetail(item.id),
                  className: styles['handle-detail']
                },
                {
                  text: (
                    <CopyToClipboard text={item.accessKey} onCopy={onCopy}>
                      <i style={{ paddingLeft: '2.5vw' }} className="iconfont iconic_dublicate"></i>
                    </CopyToClipboard>
                  ),
                  className: styles['handle-copy']
                },
                {
                  text: <i style={{ paddingRight: '2.5vw' }} className="iconfont iconic_copy"></i>,
                  onPress: () => onDelete(item),
                  className: styles['handle-delete']
                }
              ]}
            >
              <div onClick={() => goDetail(item.id)} className={styles.content}>
                <Flex justify="between">
                  <div>
                    <p className={styles.key}>{formatMessage({ id: 'ucenter.api.memo' })}</p>
                    <p className={styles.value}>{item.memo}</p>
                  </div>
                  <div style={{ flex: '0 0 auto', margin: '0 1vw' }}>
                    <p className={styles.key}>{formatMessage({ id: 'ucenter.api.table.key' })}</p>
                    <p className={styles.value}>{item.accessKey}</p>
                  </div>
                  <div style={{ flex: '0 0 auto' }}>
                    <p className={styles.key}>{formatMessage({ id: 'assets.recharge.status' })}</p>
                    <p className={styles.value}>{renderStatus(item.state)}</p>
                  </div>
                </Flex>
              </div>
            </SwipeAction>
          ))}
        {apiKeyList && apiKeyList.length === 0 && <Empty />}
      </section>

      <section className={commonStyles['bottom-btn']}>
        <WingBlank>
          <Button
            type="primary"
            onClick={() => {
              router.push('/ucenter/openapi-new');
            }}
          >
            {formatMessage({ id: 'ucenter.api.submit' })}
          </Button>
        </WingBlank>
      </section>
    </>
  );
}

export default connect(({ auth, api }) => ({
  user: auth.user,
  apiKeyList: api.apiKeyList
}))(API);
