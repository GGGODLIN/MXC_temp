import { Carousel } from 'antd-mobile';
import { getLocale } from 'umi-plugin-locale';
import Link from 'umi/link';
import { connect } from 'dva';
import { useEffect, useState } from 'react';
import styles from './index.less';
import { getSubSite } from '@/utils';
import activity_en_l from '@/assets/img/home/activity_en_l.png';
import activity_en_d from '@/assets/img/home/activity_en_d.png';
import activity_cn_l from '@/assets/img/home/activity_cn_l.png';
import activity_cn_d from '@/assets/img/home/activity_cn_d.png';
const lang = getLocale();
const langMap = {
  'zh-CN': 'cn',
  'zh-TW': 'cn',
  'en-US': 'en',
  'ko-KR': 'kr',
  'ja-JP': 'jp',
  'vi-VN': 'vi',
  'id-ID': 'ind'
};
// import invite_cn from '@/assets/img/home/invite_cn.png';
// import invite_en from '@/assets/img/home/invite_en.png';
// import labs_cn from '@/assets/img/home/labs_cn.png';
// import labs_en from '@/assets/img/home/labs_en.png';
// import pool_cn from '@/assets/img/home/pool_cn.png';
// import pool_en from '@/assets/img/home/pool_en.png';
// import big_cn from '@/assets/img/home/big_cn.png';
// import big_en from '@/assets/img/home/big_en.png';
// import push_en from '@/assets/img/home/push_en.png';
// import push_cn from '@/assets/img/home/push_cn.png';

// const enter = [
//   // {
//   //   path: '/invite/rebate',
//   //   cn: invite_cn,
//   //   en: invite_en
//   // },
//   // {
//   //   path: '/labs/list',
//   //   cn: labs_cn,
//   //   en: labs_en
//   // },
//   {
//     path: '/pos/list',
//     cn: pool_cn,
//     en: pool_en
//   },
//   {
//     path: '/otc/push',
//     cn: push_cn,
//     en: push_en
//   },
//   {
//     path: '/info/vip',
//     cn: big_cn,
//     en: big_en
//   }
// ];
const enter = {
  url: '/otc/quickTrading',
  iconL: langMap[lang] === 'cn' ? activity_cn_l : activity_en_l,
  iconD: langMap[lang] === 'cn' ? activity_cn_d : activity_en_d
};

const EnterBanner = ({ activity, theme }) => {
  console.log(langMap[lang], enter);
  const [enterObj, setEnterObj] = useState({});
  useEffect(() => {
    // if (JSON.stringify(activity) !== '{}') {
    //   activity.iconL = `${getSubSite('main')}/api/file/download/${activity.iconL}`;
    //   activity.iconD = `${getSubSite('main')}/api/file/download/${activity.iconD}`;
    // }
    let _enter = {
      ...enter
      // ...activity
    };
    setEnterObj(_enter);
  }, [activity]);
  return (
    <div className={styles.enterBanner} style={{ height: '68px' }}>
      {/* <Carousel
        autoplay={true}
        infinite
        dotStyle={{
          borderRadius: '0',
          width: '15px',
          height: '2px',
          background: '#888'
        }}
        dotActiveStyle={{
          borderRadius: '0',
          width: '20px',
          height: '2px',
          background: '#ccc'
        }}
      >
        {enter.map(item => (
          <Link to={item.path} key={item.path} style={{ display: 'inline-block', width: '100%', height: '68px' }}>
            <img src={item[lang]} alt="" style={{ width: '100%', verticalAlign: 'top' }} />
          </Link>
        ))}
      </Carousel> */}
      <Link to={enterObj.url} style={{ width: '100%', height: '68px', display: 'flex', alignItems: 'center' }}>
        <img
          src={theme === 'light' ? enterObj.iconL : enterObj.iconD}
          alt=""
          style={{ width: '100%', height: '100%', verticalAlign: 'top' }}
        />
      </Link>
    </div>
  );
};

export default connect(({ global, setting }) => ({
  activity: global.activity,
  theme: setting.theme
}))(EnterBanner);
