import { useState, useEffect } from 'react';
import { connect } from 'dva';
import styles from './ConvenientEntrance.less';
import { Carousel } from 'antd-mobile';
import { getSubSite } from '@/utils';

const ConvenientEntrance = ({ entranceList, theme }) => {
  const [entrance, setEntrance] = useState([]);
  const [entranceListObj, setEntranceListObj] = useState(null);
  useEffect(() => {
    let entrance = [];
    let entranceListObj = {};
    let _entranceList = JSON.parse(JSON.stringify(entranceList));
    let i = 1;
    const len = Math.ceil(_entranceList.length / 8);
    for (let i = 0; i < len; i++) {
      entrance.push(i + 1);
    }
    entrance.forEach(v => {
      entranceListObj[v] = [];
    });
    _entranceList.forEach((v, index) => {
      v.iconL = `${getSubSite('main')}/api/file/download/${v.iconL}`;
      v.iconD = `${getSubSite('main')}/api/file/download/${v.iconD}`;
      entranceListObj[i].push(v);
      if ((index + 1) % 8 === 0) {
        i += 1;
      }
    });
    setEntrance(entrance);
    setEntranceListObj(entranceListObj);
  }, [entranceList]);
  const EntranceItem = ({ item }) => {
    return entranceListObj[item].map((v, index) => (
      <a className={styles.item} href={v.url} key={index}>
        <img src={theme === 'light' ? v.iconL : v.iconD} alt="" />
        <span>{v.t}</span>
      </a>
    ));
  };
  return (
    <div className={styles.wrapper}>
      <Carousel
        autoplayInterval={3000}
        infinite={true}
        cellSpacing={20}
        dots={entrance.length > 1}
        frameOverflow={{ height: '128px' }}
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
        {entrance.map((item, index) => (
          <div className={styles.carouselWrapper} key={index}>
            <EntranceItem item={item} />
          </div>
        ))}
      </Carousel>
    </div>
  );
};
export default connect(({ global, setting }) => ({
  entranceList: global.entranceList,
  theme: setting.theme
}))(ConvenientEntrance);
