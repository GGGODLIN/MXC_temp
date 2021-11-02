import { useEffect, useReducer, useRef } from 'react';
import moment from 'moment';

function reducer(state, payload) {
  return { ...state, ...payload };
}
export const useCountDown = (deadline, timeoutCallback) => {
  const timer = useRef();
  const [state, setState] = useReducer(reducer, {
    d: '00',
    h: '00',
    m: '00',
    s: '00',
    allHours: '00'
  });

  useEffect(() => {
    timer.current = setInterval(() => {
      updateTime();
    }, 500);

    return () => {
      clearInterval(timer.current);
    };
  }, [deadline]);

  const addZero = digit => {
    return digit < 10 ? `0${digit}` : `${digit}`;
  };

  const updateTime = () => {
    const time = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const hour = 60 * 60 * 1000;
    const minute = 60 * 1000;
    const second = 1000;

    let diff = moment(deadline).format('x') - time;
    let days = `0`;
    let hours = `0`;
    let minutes = `0`;
    let seconds = `0`;
    let allHours = 0;

    if (diff >= 0) {
      days = Math.floor(diff / day);
      hours = Math.floor((diff % day) / hour);
      minutes = Math.floor((diff % hour) / minute);
      seconds = Math.floor((diff % minute) / second);
      allHours = Math.floor(diff / hour);
    } else {
      clearInterval(timer.current);
      timeoutCallback && timeoutCallback();
    }

    setState({
      d: addZero(days),
      h: addZero(hours),
      m: addZero(minutes),
      s: addZero(seconds),
      allHours: addZero(allHours)
    });
  };

  return state;
};
