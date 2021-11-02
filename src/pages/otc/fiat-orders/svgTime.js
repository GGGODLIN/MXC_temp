import React, { useState, useEffect, useReducer } from 'react';
import { connect } from 'dva';
import styles from './svgTime.less';
import classNames from 'classnames';
function SvgTime(props) {
  const [degree, setdegree] = useState(0);
  const [degreetwo, setdegreetwo] = useState(0);
  const { orderDetail } = props;

  let i = 0;
  let j = 0;
  let count = 0;
  let data = orderDetail.remainingTime / 1000;
  let degreeNum = 360 / Number(data);

  let time = null;
  let timetwo = null;
  useEffect(() => {
    if (orderDetail.remainingTime != null) {
      time = setInterval(() => {
        start1(degreeNum);
      }, 1000);
    }
  }, []);
  const start1 = degreeNum => {
    i = i + degreeNum;
    count = count + 1;
    if (count >= 60) {
      count = 0;
      clearInterval(time);
      timetwo = setInterval(() => {
        start2(degreeNum);
      }, 1000);
    }
    setdegree(i);
  };
  const start2 = degreeNum => {
    j = j + degreeNum;
    count = count + 1;
    if (count >= 60) {
      count = 0;
      clearInterval(timetwo);
    }
    setdegreetwo(j);
  };
  return (
    <div>
      <div className={classNames([styles.hold, styles.hold1])}>
        <div style={{ transform: `rotate(${degree}deg)` }} className={classNames([styles.pie, styles.pie1])}></div>
      </div>
      <div className={classNames([styles.hold, styles.hold2])}>
        <div style={{ transform: `rotate(${degreetwo}deg)` }} className={classNames([styles.pie, styles.pie2])}></div>
      </div>
    </div>
  );
}

export default connect(({ auth }) => ({
  user: auth.user
}))(SvgTime);
