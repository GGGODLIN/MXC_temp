import WebSocket from '@/utils/socket';
import { getSubSite } from '@/utils';

const URL = `${getSubSite('wbs')}${MXC_DEPLOY === 'prod' ? '/raw' : ''}/ws`;

let socket = new WebSocket(URL, {
  heartCheck: true,
  checkinterval: 5000,
  serverTimeout: 10000
});

export const newMarginSocketListen = dispatch => {
  socket.on('push.margin.personal.order', data => {
    dispatch({
      type: 'setPushOrders',
      payload: data
    });
  });

  socket.on('push.margin.personal.trigger.order.v2', data => {
    dispatch({
      type: 'setPushTriggerOrders',
      payload: data
    });
  });

  socket.on(
    'push.margin.personal.safety',
    data => {
      dispatch({
        type: 'setMarginAccount',
        payload: data
      });
    },
    true
  );
};

export const sendMessage = msg => socket.sendMessage(msg);

export default socket;
