import React, { useState, createContext, useContext, useReducer, useEffect } from 'react';
import { connect } from 'dva';
import cs from 'classnames';
import styles from './index.less';
import { Button, Spin, Icon } from 'antd';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import withRouter from 'umi/withRouter';
import huanxin from '@/utils/huanxin';
import { getZendeskInfo } from '@/services/api';
const locale = getLocale();
const lang = locale.startsWith('zh') ? 'zh' : 'en';

function loadScript(url, callback, id) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.id = id;
  if (script.readyState) {
    script.onreadystatechange = function() {
      if (script.readyState == 'loaden' || script.readyState == 'complete') {
        script.onreadystatechange = null;

        callback();
      }
    };
  } else {
    script.onload = function() {
      callback();
    };
  }
  script.src = url;
  document.getElementsByTagName('head')[0].appendChild(script);
}

function OnlineService(props) {
  const { client, lang, type } = props.location.query;
  const { location, user, loginMember } = props;
  const [jwtToken, setToken] = useState();
  useEffect(() => {
    if (!window.zE) {
      loadScript(
        'https://static.zdassets.com/ekr/snippet.js?key=f138a565-447d-4785-981f-d58c41fa395b',
        function() {
          window.zE('webWidget', 'hide');
          let langSearch = locale.startsWith('zh')
            ? '如何安装iOS超级签名版MEXC Pro App,OTC交易Web端教程'
            : 'How to Install MEXC Super Signature Version APP on IOS Devices';
          window.zE('webWidget', 'helpCenter:setSuggestions', {
            search: langSearch
          });
          window.zESettings = {
            webWidget: {
              launcher: {
                chatLabel: {
                  '*': 'Chat now'
                }
              }
            }
          };
          window.zE('webWidget', 'setLocale', locale);
          window.zESettings = {
            webWidget: {
              offset: { horizontal: '-10px', vertical: '-10px' },
              contactOptions: {
                enabled: true
              },
              chat: {
                concierge: {
                  title: {
                    '*': formatMessage({ id: 'chat.support.title' })
                  }
                },
                menuOptions: {
                  emailTranscript: false
                }
              }
            }
          };
          try {
            window.zE('webWidget:on', 'close', function() {
              console.log('The widget has been closed!');
              window.zE('webWidget', 'hide');
            });
            window.zE('webWidget', 'setLocale', locale);
          } catch (e) {}
        },
        'ze-snippet'
      );
    }
    if (window.zE) {
      window.zE('webWidget', 'hide');
    }
  }, []);

  useEffect(() => {
    if (user.id) {
      zendeskRegister();
    }
    if (window.zE && loginMember) {
      window.zE('webWidget', 'helpCenter:reauthenticate');
      window.zE('webWidget', 'identify', {
        name: loginMember?.digitalId,
        email: user.account
      });
    }
  }, [user, window.zE, loginMember]);
  const zendeskRegister = async () => {
    const res = await getZendeskInfo();
    if (res.code === 0) {
      setToken(res.data.token);
      window.zESettings = {
        webWidget: {
          authenticate: {
            chat: {
              jwtFn: function(callback) {
                callback(res.data.token);
              }
            }
          }
        }
      };
    }
  };
  useEffect(() => {
    if (client === 'app' && type == 2 && window.zE) {
      enCustomerService();
    }
    if (client === 'app' && type == 1 && window.zE) {
      enCustomerService();
    }
  }, [client, lang, window.zE, window.easemobim, type]);

  const enCustomerService = () => {
    if (window.zE) {
      window.zE('webWidget', 'show');
      setTimeout(window.zE('webWidget', 'open'), 50);
      if (user.id) {
        window.zE('webWidget', 'updateSettings', {
          webWidget: {
            chat: {
              reauthenticate: true
            }
          }
        });
        window.zESettings = {
          webWidget: {
            cookies: true,
            authenticate: {
              chat: {
                jwtFn: function(callback) {
                  callback(jwtToken);
                }
              }
            }
          }
        };
      }
      try {
        window.zE('webWidget:on', 'close', function() {
          console.log('The widget has been closed!');
          window.zE('webWidget', 'hide');
        });
        window.zE('webWidget', 'setLocale', locale);
      } catch (e) {}
    }
  };

  const openServer = () => {
    enCustomerService();
  };
  const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

  return (
    <>
      {!client && (
        <Button
          type="primary"
          inline
          style={{ background: '#00D38B' }}
          className={cs(styles.btnChat, 'am-button-circle')}
          onClick={() => openServer()}
        >
          <i className="iconfont iconkefu" style={{ marginRight: 4 }}></i>
          <span>{formatMessage({ id: 'home.title.mxc_touch_customer' })}</span>
        </Button>
      )}
      {client && (
        <div className={styles.spinContent}>
          <Spin indicator={antIcon} />
          <p
            className={styles.prompnt}
            dangerouslySetInnerHTML={{
              __html: formatMessage({ id: 'mc_customer_service_prompt' })
            }}
          ></p>
        </div>
      )}
    </>
  );
}
export default withRouter(
  connect(({ auth }) => ({
    user: auth.user,
    loginMember: auth.loginMember
  }))(OnlineService)
);
