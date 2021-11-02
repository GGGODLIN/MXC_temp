import io from 'socket.io-client';
import { visisblityChange } from '@/utils/visibility';
import { getSubSite } from '@/utils';

// const URL = 'wss://www.mxc.com';
const URL = getSubSite('wbs');

let socket = io(URL, {
  transports: ['websocket'],
  upgrade: false,
  timeout: 60000,
  reconnectionDelay: 500
});

let subscribed = {};

// visisblityChange segment
let pageVisible = true;
let hideTime = Date.now();
let ticker = null;
const duration = 1000 * 60 * 10;

// visisblityChange({
//   onShow: () => {
//     // console.log('page show');
//     pageVisible = true;
//     if (!socket.connected) {
//       window.location.reload();
//     }
//   },
//   onHide: () => {
//     // console.log('page hide');
//     pageVisible = false;
//     hideTime = Date.now();
//   }
// });

// ticker = window.setInterval(() => {
//   if (!pageVisible && socket.connected) {
//     const diff = Date.now() - hideTime;
//     if (diff > duration) {
//       socket.close();
//     }
//   }
// }, 1000 * 1);

window.addEventListener('beforeunload', () => {
  if (socket) {
    socket.close();
    socket = null;
  }
  if (ticker) {
    window.clearInterval(ticker);
    ticker = null;
  }
});

export const mainSocketListenStatus = dispatch => {
  socket.on('connect', () => {
    console.warn(`ws connect`);
    dispatch({
      type: 'setConnectState',
      payload: 'ok'
    });
  });

  socket.on('reconnect', attempt => {
    console.warn(`ws try ${attempt} times then connect`);
    dispatch({
      type: 'setConnectState',
      payload: 'ok'
    });
    Object.keys(subscribed).forEach(channel => {
      socket.emit(channel, subscribed[channel]);
    });
  });

  socket.on('disconnect', err => {
    console.warn('ws disconnected: ', err);
    if (err === 'io server disconnect') {
      socket.connect();
    }
    dispatch({
      type: 'setConnectState',
      payload: 'error'
    });
  });

  socket.on('error', err => {
    console.warn('ws error: ', err);
    dispatch({
      type: 'setConnectState',
      payload: 'error'
    });
  });

  socket.on('connect_error', err => {
    console.warn('ws connect_error: ', err);
    dispatch({
      type: 'setConnectState',
      payload: 'error'
    });
  });

  socket.on('connect_timeout', err => {
    console.warn('ws connect_timeout: ', err);
    dispatch({
      type: 'setConnectState',
      payload: 'error'
    });
  });

  socket.on('reconnect_failed', () => {
    console.warn('ws reconnect_failed');
    dispatch({
      type: 'setConnectState',
      payload: 'error'
    });
  });

  socket.on('pong', ms => {
    // console.log('ws pong: ', ms);
    dispatch({
      type: 'setDelayTime',
      payload: ms
    });
  });
};

export const mainSocketListenTrading = dispatch => {
  socket.on('rs.symbols', data => {
    // console.log('rs.symbols', data);
    dispatch({
      type: 'setMarkets',
      payload: data
    });
  });

  socket.on('push.overview', data => {
    // console.log('push.overview', data);
    dispatch({
      type: 'setMarketsPush',
      payload: data
    });
  });

  socket.on('push.cny', data => {
    // console.log('push.cny', data);
    dispatch({
      type: 'setCnyPrices',
      payload: data
    });
  });

  socket.on('rs.symbol', data => {
    // console.log('rs.symbol', data);
    dispatch({
      type: 'setCurrentPairValue',
      payload: data
    });
  });

  socket.on('rs.deal', data => {
    // console.log('rs.deal', data);
    dispatch({
      type: 'setFullTrades',
      payload: data
    });
  });

  socket.on('rs.depth', data => {
    // console.log('rs.depth', data);
    dispatch({
      type: 'setFullDepth',
      payload: data
    });
  });

  socket.on('push.symbol', data => {
    // console.log('push.symbol', data);
    dispatch({
      type: 'setPushPairValue',
      payload: data
    });
  });

  socket.on('rs.orders', data => {
    // console.log('rs.orders', data);
    dispatch({
      type: 'setOrders',
      payload: data
    });
  });

  socket.on('push.personal.order', data => {
    // console.log('push.personal.order', data);
    dispatch({
      type: 'setPushOrders',
      payload: data
    });
  });

  socket.on('rs.trigger.orders', data => {
    // console.log('rs.trigger.orders', data);
    dispatch({
      type: 'setTriggerOrders',
      payload: data
    });
  });

  socket.on('push.personal.trigger.order', data => {
    // console.log('push.personal.trigger.order', data);
    dispatch({
      type: 'setPushTriggerOrders',
      payload: data
    });
  });
};

export const mainSocketListenMargin = dispatch => {
  socket.on('push.margin.personal.safety', data => {
    // console.log('push.personal.margin.safety', data);
    dispatch({
      type: 'setSafety',
      payload: data
    });
  });

  socket.on('push.margin.personal.order', data => {
    // console.log('push.personal.order', data);
    dispatch({
      type: 'setPushOrders',
      payload: data
    });
  });
};

export const mainSocketSend = ({ channel, message, shouldCache = true }) => {
  if (shouldCache) {
    subscribed[channel] = message;
  }
  if (socket) {
    socket.emit(channel, message);
  }
};

export default socket;
