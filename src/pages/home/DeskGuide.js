import { useEffect } from 'react';
import { Modal } from 'antd-mobile';
import { connect } from 'dva';
import { getLocale } from 'umi-plugin-locale';
import { formatMessage } from 'umi-plugin-locale';
const lang = getLocale();

const DeskGuide = ({ dispatch }) => {
  useEffect(() => {
    const time = localStorage.getItem('mxc_home_desk_guide');
    let guide = false;
    if (!time) {
      guide = true;
    } else {
      const timeDiff = new Date().getTime() - time;
      guide = timeDiff > 86400000;
    }
    if (guide) {
      showModal();
    } else {
      setHomeModal();
    }
  }, []);
  const setHomeModal = () => {
    dispatch({
      type: 'global/saveHomeModalList',
      payload: [1, 0]
    });
  };
  const showModal = () => {
    localStorage.setItem('mxc_home_desk_guide', new Date().getTime());
    Modal.alert(
      formatMessage({ id: 'ucenter.phishing.warning' }),
      <div>
        <p>{formatMessage({ id: 'mc_home_desk_guide_tip' })}</p>
      </div>,
      [
        { text: formatMessage({ id: 'common.cancel' }), onPress: setHomeModal },
        {
          text: formatMessage({ id: 'mc_home_desk_guide_view_tutorial' }),
          onPress: () => {
            setHomeModal();
            window.open(
              lang.startsWith('zh')
                ? 'https://support.mexc.com/hc/zh-cn/articles/4408299057561'
                : 'https://support.mexc.com/hc/en-001/articles/4408299057561'
            );
          }
        }
      ]
    );
  };

  return <></>;
};

export default connect(({ global }) => ({
  homeModalList: global.homeModalList
}))(DeskGuide);
