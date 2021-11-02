class WebSocketClass {
  /**
   * protol
   * {
   *  checkinterval:  心跳间隔
   *  serverTimeout:  服务器超时时间
   * }
   */
  constructor(url, protol) {
    this.instance = null;
    this.url = url;
    this.protol = protol;
    this.channelMap = {};
    this.subscribeMap = {};
    this.timeout = protol.checkinterval || 3000; // 心跳间隔时间
    this.serverTimeout = protol.checkinterval || 5000; // 服务器超时时间
    this.timeoutObj = null;
    this.serverTimeoutObj = null;
    this.lockReconnect = false;
    this.wsStatus = '';
    this.connect();
  }
  static getInstance() {
    if (!this.instance) {
      this.instance = new WebSocketClass();
    }
    return this.instance;
  }

  connect() {
    this.ws = new WebSocket(this.url);
    this.init();
  }

  init() {
    this.ws.onopen = e => {
      this.status = 'open';
      this.wsStatus = 'ok';
      console.log(`连接成功`, e);
      if (this.protol.heartCheck) {
        this.heartCheck();
      }
    };
    this.ws.onclose = () => {
      console.log('连接关闭');
      this.wsStatus = 'error';
      if (this.status !== 'close') {
        this.reconnect();
      }
    };
    this.ws.onerror = () => {
      console.log('连接关闭');
      this.wsStatus = 'error';
      if (this.status !== 'close') {
        this.reconnect();
      }
    };

    this.ws.onmessage = e => {
      try {
        const _data = JSON.parse(e.data);
        if (this.channelMap[_data.channel]) {
          const _callback = this.channelMap[_data.channel].callback;
          const _allBack = this.channelMap[_data.channel].allBack;
          if (_callback && typeof _callback === 'function') {
            _callback(_allBack ? _data : _data.data);
          }
        }
      } catch (error) {}
      if (this.protol.heartCheck) {
        this.heartCheck();
      }
    };
  }

  reconnect() {
    if (this.lockReconnect) {
      return;
    }
    this.lockReconnect = true;
    const that = this;
    this.reconnectTimer && clearTimeout(this.reconnectTimer);
    this.resubTimer && clearTimeout(this.resubTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect();
      this.lockReconnect = false;
      this.resubTimer = setTimeout(() => {
        if (that.ws.readyState === 1) {
          for (const key in that.subscribeMap) {
            if (that.subscribeMap.hasOwnProperty(key)) {
              const msg = that.subscribeMap[key];
              that.ws.send(msg);
            }
          }
        }
      }, 2000);
    }, 4000);
  }

  heartCheck() {
    const that = this;
    this.timeoutObj && clearTimeout(this.timeoutObj);
    this.serverTimeoutObj && clearTimeout(this.serverTimeoutObj);
    this.timeoutObj = setTimeout(() => {
      that.ws.send('ping'); // 心跳帧
      // 服务器超时关闭连接
      that.serverTimeoutObj = setTimeout(() => {
        that.ws.close();
      }, that.serverTimeout);
    }, this.timeout);
  }

  closeHandle(e = 'err') {
    // 因为webSocket并不稳定，规定只能手动关闭(调closeMyself方法)，否则就重连
    if (this.status !== 'close') {
      console.log(`断开，重连websocket`, e);
      if (this.pingInterval !== undefined && this.pongInterval !== undefined) {
        // 清除定时器
        this.close();
      }
      this.connect(); // 重连
    } else {
      console.log(`websocket手动关闭,或者正在连接`);
    }
  }

  on(channel, callback, allBack = false) {
    this.channelMap[channel] = { channel, callback, allBack };
  }

  sendMessage(msg) {
    if (this.ws.readyState === 1) {
      if (/sub|get/.test(msg.op)) {
        this.subscribeMap[msg.op] = JSON.stringify(msg);
      }
      this.ws.send(JSON.stringify(msg));
    }
  }

  close() {
    clearInterval(this.pingInterval);
    clearInterval(this.pongInterval);
    this.status = 'close';
    this.pingPong = 'ping';
    this.ws.close();
    console.warn('已断开连接');
    console.log('close');
  }
}

export default WebSocketClass;
