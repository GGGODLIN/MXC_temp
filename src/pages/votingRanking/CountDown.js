import React, { Component } from 'react';
import classNames from 'classnames';
import { getLocale, formatMessage } from 'umi/locale';
import styles from './CountDown.less';

const language = getLocale();

function padNumber(number) {
  let str = (number || '').toString();

  if (str.length < 2) {
    str = '00'.slice(str.length) + str;
  }

  return str;
}

class CountDown extends Component {
  constructor(props) {
    super(props);

    this.state = {
      countdown: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      }
    };
  }

  componentDidMount() {
    this.setCountdown();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.currentPhase.isVoting !== this.props.currentPhase.isVoting ||
      prevProps.currentPhase.isOver !== this.props.currentPhase.isOver ||
      prevProps.currentPhase.isOnSchedual !== this.props.currentPhase.isOnSchedual
    ) {
      this.setCountdown();
    }
  }

  componentWillUnmount() {
    this.clearCountdown();
  }

  clearCountdown = () => {
    if (this.countdownHandler) {
      clearInterval(this.countdownHandler);
      this.countdownHandler = null;
    }

    this.setState({
      countdown: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      }
    });
  };

  setCountdown = () => {
    this.clearCountdown();
    const { currentPhase, serverClientTimeDiff } = this.props;

    let nowTime = serverClientTimeDiff + Date.now();
    let day = 24 * 60 * 60 * 1000;
    let hour = 60 * 60 * 1000;
    let minute = 60 * 1000;
    let second = 1000;
    let diff = 0;
    let { startTime, endTime } = currentPhase;

    if (nowTime < startTime) {
      diff = startTime - nowTime;
    } else if (nowTime > endTime) {
      diff = 0;
    } else {
      diff = endTime - nowTime;
    }

    if (diff === 0) {
      return;
    }

    this.countdownHandler = setInterval(() => {
      let days = Math.floor(diff / day);
      let hours = Math.floor((diff % day) / hour);
      let minutes = Math.floor((diff % hour) / minute);
      let seconds = Math.floor((diff % minute) / second);

      this.setState({
        countdown: {
          days: days,
          hours: hours,
          minutes: minutes,
          seconds: seconds
        }
      });

      if (diff <= 0) {
        this.props.handleTimeOut();
        this.clearCountdown();
      } else {
        diff -= 1000;
      }
    }, 1000);
  };

  render() {
    const { countdown } = this.state;
    const { currentPhase } = this.props;
    let countDownText = '--';
    if (currentPhase.isOnSchedual) {
      countDownText = formatMessage({ id: 'votingRecharge.countdown.start' });
    }

    if (currentPhase.isVoting) {
      countDownText = formatMessage({ id: 'votingRecharge.countdown.ing' });
    }

    if (currentPhase.isOver) {
      countDownText = formatMessage({ id: 'votingRecharge.countdown.end' });
    }

    return (
      <div
        className={classNames(styles.countdown, {
          [styles.isOver]: currentPhase.isOver,
          [styles.isVoting]: currentPhase.isVoting
        })}
      >
        <p className={styles.text}>{countDownText}</p>
        <div className={styles.times}>
          <div className={styles.item}>
            <span className={styles.num}>{padNumber(countdown.days)}</span>
            <span className={styles.unit}>{formatMessage({ id: 'common.day' })}</span>
          </div>

          <div className={styles.item}>
            <span className={styles.num}>{padNumber(countdown.hours)}</span>
            <span className={styles.unit}>{formatMessage({ id: 'common.hour' })}</span>
          </div>

          <div className={styles.item}>
            <span className={styles.num}>{padNumber(countdown.minutes)}</span>
            <span className={styles.unit}>{formatMessage({ id: 'common.min' })}</span>
          </div>

          <div className={styles.item}>
            <span className={styles.num}>{padNumber(countdown.seconds)}</span>
            <span className={styles.unit}>{formatMessage({ id: 'common.sen' })}</span>
          </div>
        </div>
      </div>
    );
  }
}

export default CountDown;
