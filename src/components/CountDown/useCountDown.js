import { useEffect, useReducer } from 'react';

function reducer(state, payload) {
  return { ...state, ...payload };
}
const useCountDown = (deadline, timediff = 0) => {
  let timer;
  const [state, setState] = useReducer(reducer, {
    d: '00',
    h: '00',
    m: '00',
    s: '00'
  });
  useEffect(() => {
    timer = setInterval(() => {
      updateTime();
    }, 500);
    return () => {
      clearInterval(timer);
    };
  }, [deadline]);

  const addZero = digit => {
    return digit < 10 ? `0${digit}` : `${digit}`;
  };

  const updateTime = () => {
    const time = new Date().getTime() + timediff;
    const day = 24 * 60 * 60 * 1000;
    const hour = 60 * 60 * 1000;
    const minute = 60 * 1000;
    const second = 1000;

    let diff = deadline - time;
    let days = `0`;
    let hours = `0`;
    let minutes = `0`;
    let seconds = `0`;
    if (diff >= 0) {
      days = Math.floor(diff / day);
      hours = Math.floor((diff % day) / hour);
      minutes = Math.floor((diff % hour) / minute);
      seconds = Math.floor((diff % minute) / second);
    } else if (diff < 0 && diff > -2000) {
      clearInterval(timer);
    }

    setState({
      d: addZero(days),
      h: addZero(hours),
      m: addZero(minutes),
      s: addZero(seconds)
    });
  };

  return [state];
};

export default useCountDown;
