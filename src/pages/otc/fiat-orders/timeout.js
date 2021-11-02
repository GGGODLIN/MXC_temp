import React, { Component } from 'react';
import { formatMessage } from 'umi-plugin-locale';

export default class countDown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      day: 0,
      hour: 0,
      minute: 0,
      second: 0,
      endTime: this.props.endTime
    };
  }
  componentDidMount() {
    if (this.props.endTime) {
      // let endTime = this.props.endTime.replace(/-/g, "/");
      let endTime = this.props.endTime;
      this.countFun(endTime);
    }
  }
  componentWillUpdate(nextProps) {
    if (nextProps.endTime !== this.state.endTime) {
      this.setState({
        endTime: nextProps.endTime
      });
      clearInterval(this.timer);
      this.countFun(nextProps.endTime);
    }
  }
  //组件卸载取消倒计时
  componentWillUnmount() {
    clearInterval(this.timer);
  }

  countFun = time => {
    let sys_second = this.props.endTime;
    this.timer = setInterval(() => {
      if (sys_second > 1000) {
        sys_second -= 1000;
        let day = Math.floor(sys_second / 1000 / 3600 / 24);
        let hour = Math.floor((sys_second / 1000 / 3600) % 24);
        let minute = Math.floor((sys_second / 1000 / 60) % 60);
        let second = Math.floor((sys_second / 1000) % 60);
        this.setState({
          day: day,
          hour: hour < 10 ? '0' + hour : hour,
          minute: minute < 10 ? '0' + minute : minute,
          second: second < 10 ? '0' + second : second
        });
      } else {
        clearInterval(this.timer);
        //倒计时结束时触发父组件的方法
        //倒计时结束时，触发父组件的方法
        if (this.props.timeOver) {
          this.props.timeOver();
        }
        //this.props.timeEnd();
      }
    }, 1000);
  };
  render() {
    return (
      <span>
        {' '}
        {this.props.type == 'day' ? (
          <span>
            {this.state.day}
            {formatMessage({ id: 'common.day' })}
            {this.state.hour}:
          </span>
        ) : (
          ''
        )}
        {this.props.type == 'hour' ? <span>{this.state.hour}:</span> : ''}
        {this.state.minute}:{this.state.second}
      </span>
    );
  }
}
