import React, { Component } from 'react';
// import { connect } from 'dva';
import styles from './CountDown.less';

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
    if (prevProps.currentPhase !== this.props.currentPhase) {
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
    let { start, end } = currentPhase.phase;

    if (nowTime < start) {
      diff = start - nowTime;
    } else if (nowTime > end) {
      diff = 0;
    } else {
      diff = end - nowTime;
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

      if (diff < 1000) {
        this.props.handleTimeOut();
        this.clearCountdown();
      } else {
        diff -= 1000;
      }
    }, 1000);
  };

  render() {
    let { countdown } = this.state;

    return (
      <div className={styles.countdown}>
        <h4>Countdown</h4>
        <div className={styles.times}>
          <div>
            {padNumber(countdown.days)}
            <span>DAYS</span>
          </div>
          <div>
            {padNumber(countdown.hours)}
            <span>HOURS</span>
          </div>
          <div>
            {padNumber(countdown.minutes)}
            <span>MINUTES</span>
          </div>
          <div>
            {padNumber(countdown.seconds)}
            <span>SECONDS</span>
          </div>
        </div>
      </div>
    );
  }
}

export default CountDown;
