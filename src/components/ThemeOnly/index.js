import React, { Component } from 'react';

class ThemeOnly extends Component {
  render() {
    return <div className={`theme-${this.props.theme}`}>{this.props.children}</div>;
  }
}

export default ThemeOnly;
