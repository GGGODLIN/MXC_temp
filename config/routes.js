export default [
  {
    path: '/maintain',
    component: '../components/Maintains'
  },
  {
    path: '/redPacket',
    routes: [
      {
        path: '/redPacket/index',
        title: '红包',
        component: './redPacket/index'
      }
    ]
  },
  {
    path: '/',
    component: '../layouts',
    routes: [
      // 兼容web路由
      { path: '/trade/easy', redirect: '/trade/spot' },
      { path: '/trade/pro', redirect: '/trade/spot' },
      { path: '/ucenter/google-auth', redirect: '/ucenter/google-auth-bind' },
      { path: '/ucenter/bind-phone', redirect: '/ucenter/phone-bind' },
      { path: '/uassets/balances', redirect: '/uassets/overview' },
      { path: '/orders/open', redirect: '/ucenter/order' },
      { path: '/orders/historic', redirect: '/ucenter/order' },
      { path: '/orders/record', redirect: '/ucenter/order' },
      { path: '/orders/trigger', redirect: '/ucenter/order' },
      { path: '/invite/rebateLog', redirect: '/invite/rebate-record' },
      { path: '/auth/signup-h5', redirect: '/auth/signup' },
      { path: '/mobileApp', redirect: '/mobileApp/download' },
      { path: '/home', redirect: '/' },
      {
        path: '/',
        name: '首页',
        exact: true,
        component: './home'
      },
      {
        path: '/mobileApp',
        routes: [
          {
            path: '/mobileApp/download',
            name: 'download page',
            component: './app-download/download'
          },
          {
            path: '/mobileApp/ios-download',
            name: 'download page',
            component: './app-download/iosDownload'
          },
          {
            path: '/mobileApp/testflight',
            name: 'download page',
            component: './app-download/TestFlight'
          },
          {
            path: '/mobileApp/appStore',
            name: 'download page',
            component: './app-download/appStore',
            topBar: true
          },
          {
            path: '/mobileApp/appStore/accounts',
            name: 'download page',
            component: './app-download/appStore/accounts',
            topBar: true
          },
          {
            path: '/mobileApp/appStore/register',
            name: 'download page',
            component: './app-download/appStore/register',
            topBar: true
          }
        ]
      },
      {
        path: '/event',
        routes: [
          {
            path: '/event/activity',
            name: '抹茶快讯 最新活动',
            component: './event/activity',
            topBar: true
          },
          {
            path: '/event/activity-detail',
            name: '详情 iframe',
            component: './event/activity-detail'
          },
          {
            path: '/event/customer-service',
            name: '在线客服 iframe',
            component: './event/customer-service',
            topBar: true
          },
          {
            path: '/event/chatroom',
            authorized: 'auth',
            Routes: ['src/pages/Authorized.js'],
            name: '聊天室 iframe',
            component: './event/chatroom',
            topBar: true
          }
        ]
      },
      {
        path: '/market',
        routes: [
          {
            path: '/market/main',
            name: '交易行情',
            component: './market/main',
            topBar: true
          },
          {
            path: '/market/search',
            name: '行情搜索',
            component: './market/search'
          }
        ]
      },
      {
        path: '/trade',
        component: './trade/layout',
        routes: [
          {
            path: '/trade/spot',
            name: '币币交易',
            component: './trade/spot'
          },
          {
            path: '/trade/spot-kline',
            name: 'k线',
            component: './trade/spot-kline',
            topBar: true
          },
          {
            path: '/trade/spot-orders',
            authorized: 'auth',
            Routes: ['src/pages/Authorized.js'],
            name: '我的委托',
            component: './trade/spot-orders',
            topBar: true
          }
        ]
      },
      {
        path: '/margin',
        component: './margin/layout',
        routes: [
          {
            path: '/margin/spot',
            name: '杠杆交易',
            component: './margin/spot'
          },
          {
            path: '/margin/spot-kline',
            name: 'k线',
            component: './margin/spot-kline',
            topBar: true
          },
          {
            path: '/margin/spot-orders',
            authorized: 'auth',
            Routes: ['src/pages/Authorized.js'],
            name: '我的委托',
            component: './margin/spot-orders',
            topBar: true
          },
          {
            path: '/margin/loan',
            authorized: 'auth',
            Routes: ['src/pages/Authorized.js'],
            name: '借币',
            component: './margin/loan',
            topBar: true
          },
          {
            path: '/margin/back',
            authorized: 'auth',
            Routes: ['src/pages/Authorized.js'],
            name: '还币',
            component: './margin/back',
            topBar: true
          },
          {
            path: '/margin/borrow-orders',
            authorized: 'auth',
            Routes: ['src/pages/Authorized.js'],
            name: '借贷记录',
            component: './margin/borrow-orders',
            topBar: true
          }
        ]
      },
      {
        path: '/otc',
        authorized: 'auth',
        Routes: ['src/pages/Authorized.js'],
        routes: [
          {
            path: '/otc/creditCard',
            name: '信用卡交易',
            component: './otc/creditCard',
            Routes: ['src/pages/Authorized.js'],
            topBar: true
          },
          {
            path: '/otc/creditCardOrder',
            name: '信用卡订单',
            Routes: ['src/pages/Authorized.js'],
            component: './otc/creditCard/creditCardOrder',
            topBar: true
          },
          {
            path: '/otc/quickTrading',

            name: '快捷交易',
            component: './otc/quickTrading',
            topBar: true
          },
          {
            path: '/otc/entrustOrder',
            name: '委托挂单',
            component: './otc/quickTrading/entrustOrder',
            topBar: true
          },
          {
            path: '/otc/paymentMethods',
            name: '支付方式',
            Routes: ['src/pages/Authorized.js'],
            authorized: 'auth',
            component: './otc/paymentMethods',
            topBar: true
          },
          {
            path: '/otc/addAilPayment',
            name: '添加支付宝',
            component: './otc/paymentMethods/paymentConfig',
            topBar: true
          },
          {
            path: '/otc/addBankPayment',
            name: '添加银行卡',
            component: './otc/paymentMethods/addBankPayment',
            topBar: true
          },
          {
            path: '/otc/paymentConfig',
            name: '添加银行卡',
            component: './otc/paymentMethods/paymentConfig',
            topBar: true
          },
          {
            path: '/otc/appeal',
            name: '订单申诉',
            component: './otc/appeal',
            topBar: true,
            theme: 'light'
          },

          {
            path: '/otc/appeal/record',
            name: '订单申诉记录',
            component: './otc/appeal/record',
            topBar: true,
            theme: 'light'
          },
          {
            path: '/otc/placeTheOrder/:id',
            name: '下单订单详情',
            component: './otc/placeTheOrder',
            topBar: true
          },
          {
            path: '/otc/fiatorderRecord',
            name: '订单记录',
            component: './otc/fiat-orderRecord',
            topBar: true
          },
          {
            path: '/otc/orderCancel',
            name: '订单取消',
            component: './otc/placeTheOrder/orderCancel',
            topBar: true
          },
          {
            path: '/otc/merchants',
            name: '商家信息',
            component: './otc/merchants',
            topBar: true
          },
          {
            path: '/otc/chat',
            name: '商家交流',
            component: './otc/placeTheOrder/chat',
            topBar: true
          },
          {
            path: '/otc/fiat',
            name: '法币交易',
            component: './otc/fiat'
          },
          {
            path: '/otc/fiat-orders',
            name: '订单记录',
            authorized: 'auth',
            Routes: ['src/pages/Authorized.js'],
            component: './otc/fiat-orders/orderList',
            topBar: true
          },
          {
            path: '/otc/fiat-order-unhandle',
            name: '待支付',
            component: './otc/fiat-order-unhandle',
            authorized: 'auth',
            Routes: ['src/pages/Authorized.js'],
            topBar: true
          },
          {
            path: '/otc/fiat-order-handling',
            name: '处理中',
            component: './otc/fiat-order-handling',
            authorized: 'auth',
            Routes: ['src/pages/Authorized.js'],
            topBar: true
          },
          {
            path: '/otc/fiat-order-complete',
            name: '处理完成(完成、撤销、超时)',
            component: './otc/fiat-order-complete',
            authorized: 'auth',
            Routes: ['src/pages/Authorized.js'],
            topBar: true
          },
          {
            path: '/otc/timeout',
            name: '处理中',
            component: './otc/fiat-order-handling/timeout',
            authorized: 'auth',
            Routes: ['src/pages/Authorized.js'],
            topBar: true
          },
          {
            path: '/otc/push',
            name: 'PUSH交易',
            component: './otc/push',
            topBar: true
          },
          {
            path: '/otc/push-bid',
            name: 'PUSH下单',
            component: './otc/push-bid',
            topBar: true
          },
          {
            path: '/otc/push-push',
            name: 'PUSH',
            component: './otc/push-push',
            topBar: true
          },
          {
            path: '/otc/push-record',
            name: 'PUSH成交',
            component: './otc/push-record',
            authorized: 'auth',
            Routes: ['src/pages/Authorized.js'],
            topBar: true
          },
          {
            path: '/otc/svgtimeout',
            name: '倒计时',
            component: './otc/fiat-orders/svgTime',
            authorized: 'auth',
            Routes: ['src/pages/Authorized.js'],
            topBar: true
          }
        ]
      },
      {
        path: '/auth/signup',
        name: '注册',
        component: './auth/register'
      },
      {
        path: '/auth/signup-password',
        name: '注册设置密码',
        component: './auth/register-password',
        topBar: true
      },
      {
        path: '/auth',
        authorized: 'no-auth',
        Routes: ['src/pages/Authorized.js'],
        routes: [
          {
            path: '/auth/signin',
            name: '登录',
            component: './auth/signin'
          },
          {
            path: '/auth/signin-2nd',
            name: '登录二次验证',
            component: './auth/signin-2nd',
            topBar: true
          },
          // {
          //   path: '/auth/signup',
          //   name: '注册',
          //   component: './auth/register'
          // },
          // {
          //   path: '/auth/signup-password',
          //   name: '注册设置密码',
          //   component: './auth/register-password',
          //   topBar: true
          // },
          {
            path: '/auth/forget-password',
            name: '忘记密码',
            component: './auth/forget-password',
            topBar: true
          },
          {
            path: '/auth/forget-password-2nd',
            name: '验证码',
            component: './auth/forget-password-2nd',
            topBar: true
          },
          {
            path: '/auth/forget-password-reset',
            name: '设置密码',
            component: './auth/forget-password-reset',
            topBar: true
          },
          {
            path: '/auth/reset-password',
            name: '重置密码',
            component: './auth/reset-password',
            topBar: true
          }
        ]
      },
      {
        path: '/uassets',
        authorized: 'auth',
        Routes: ['src/pages/Authorized.js'],
        component: './assets/layout',
        routes: [
          {
            path: '/uassets/overview',
            name: '资产首页',
            component: './assets/overview'
          },
          {
            path: '/uassets/detail',
            name: '币种资产信息',
            component: './assets/detail',
            topBar: true
          },
          {
            path: '/uassets/search',
            name: '币种搜索',
            component: './assets/search',
            topBar: false
          },
          {
            path: '/uassets/deposit',
            name: '充值',
            component: './assets/deposit',
            topBar: true
          },
          {
            path: '/uassets/withdraw',
            name: '提现',
            component: './assets/withdraw',
            topBar: true
          },
          {
            path: '/uassets/withdraw-address',
            name: '提现地址管理',
            component: './assets/withdraw-address',
            topBar: true
          },
          {
            path: '/uassets/withdraw-address-new',
            name: '添加提现地址',
            component: './assets/withdraw-address-new',
            topBar: true
          },
          {
            path: '/uassets/record',
            name: '充提记录',
            component: './assets/record',
            topBar: true
          },
          {
            path: '/uassets/record-detail',
            name: '充提详情',
            component: './assets/record-detail',
            topBar: true
          },
          {
            path: '/uassets/transfer',
            name: '资金划转',
            component: './assets/transfer',
            topBar: true
          },
          {
            path: '/uassets/transfer-record',
            name: '资金划转记录',
            component: './assets/transfer-record',
            topBar: true
          },
          {
            path: '/uassets/margin-detail',
            name: '杠杆资产详情',
            component: './assets/margin-detail',
            topBar: true
          }
        ]
      },
      {
        path: '/ucenter',
        routes: [
          {
            path: '/ucenter/profile',
            name: '我的',
            component: './ucenter/profile',
            topBar: true
          },
          {
            path: '/ucenter/setting',
            name: '设置',
            // Routes: ['src/pages/Authorized.js'],
            component: './ucenter/setting',
            topBar: true
          },
          {
            path: '/ucenter/setting-language',
            name: '语言设置',
            component: './ucenter/setting-language',
            topBar: true
          },
          {
            path: '/ucenter/banks',
            name: '支付方式管理',
            Routes: ['src/pages/Authorized.js'],
            authorized: 'auth',
            component: './ucenter/banks',
            topBar: true
          },
          {
            path: '/ucenter/bank-add',
            name: '添加支付方式',
            Routes: ['src/pages/Authorized.js'],
            authorized: 'auth',
            component: './ucenter/bank-add',
            topBar: true
          },
          {
            path: '/ucenter/change-password',
            name: '修改密码',
            Routes: ['src/pages/Authorized.js'],
            authorized: 'auth',
            component: './ucenter/change-password',
            topBar: true
          },
          {
            path: '/ucenter/security',
            name: '安全设置',
            Routes: ['src/pages/Authorized.js'],
            authorized: 'auth',
            component: './ucenter/security',
            topBar: true
          },
          {
            path: '/ucenter/id-auth',
            name: '初级实名认证',
            Routes: ['src/pages/Authorized.js'],
            authorized: 'auth',
            component: './ucenter/id-auth',
            topBar: true
          },
          {
            path: '/ucenter/id-auth-result',
            name: '身份认证状态',
            Routes: ['src/pages/Authorized.js'],
            authorized: 'auth',
            component: './ucenter/id-auth-result',
            topBar: true
          },
          {
            path: '/ucenter/phone-bind',
            name: '绑定手机',
            Routes: ['src/pages/Authorized.js'],
            authorized: 'auth',
            component: './ucenter/phone-bind',
            topBar: true
          },
          {
            path: '/ucenter/email-bind',
            name: '绑定邮箱',
            Routes: ['src/pages/Authorized.js'],
            authorized: 'auth',
            component: './ucenter/email-bind',
            topBar: true
          },
          {
            path: '/ucenter/google-auth-bind',
            name: '绑定谷歌验证',
            Routes: ['src/pages/Authorized.js'],
            authorized: 'auth',
            component: './ucenter/google-auth-bind',
            topBar: true
          },
          {
            path: '/ucenter/google-auth-unbind',
            name: '解绑谷歌验证',
            Routes: ['src/pages/Authorized.js'],
            authorized: 'auth',
            component: './ucenter/google-auth-unbind',
            topBar: true
          },
          {
            path: '/ucenter/openapi',
            name: 'API管理',
            Routes: ['src/pages/Authorized.js'],
            authorized: 'auth',
            component: './ucenter/api',
            topBar: true
          },
          {
            path: '/ucenter/openapi-detail/:id',
            name: 'API详情',
            Routes: ['src/pages/Authorized.js'],
            authorized: 'auth',
            component: './ucenter/api-detail',
            topBar: true
          },
          {
            path: '/ucenter/openapi-new',
            name: '新建API',
            Routes: ['src/pages/Authorized.js'],
            authorized: 'auth',
            component: './ucenter/api-new',
            topBar: true
          },
          {
            path: '/ucenter/phishing',
            name: '防钓鱼码说明',
            Routes: ['src/pages/Authorized.js'],
            authorized: 'auth',
            component: './ucenter/phishing',
            topBar: true
          },
          {
            path: '/ucenter/phishing-set',
            name: '防钓鱼码设置',
            Routes: ['src/pages/Authorized.js'],
            authorized: 'auth',
            component: './ucenter/phishing-set',
            topBar: true
          },
          {
            path: '/ucenter/frozen',
            name: '自助冻结',
            Routes: ['src/pages/Authorized.js'],
            authorized: 'auth',
            component: './ucenter/frozen',
            topBar: true
          },
          {
            path: '/ucenter/order',
            name: '我的订单',
            Routes: ['src/pages/Authorized.js'],
            authorized: 'auth',
            component: './trade/spot-orders/index',
            topBar: true
          },
          {
            path: '/ucenter/discount',
            name: '费率设置',
            Routes: ['src/pages/Authorized.js'],
            authorized: 'auth',
            component: './ucenter/discount',
            topBar: true
          },
          {
            path: '/ucenter/institution-auth/desc',
            name: '机构认证',
            Routes: ['src/pages/Authorized.js'],
            authorized: 'auth',
            component: './ucenter/institution-auth/desc',
            topBar: true
          }
        ]
      },
      {
        path: '/invite',
        authorized: 'auth',
        Routes: ['src/pages/Authorized.js'],
        routes: [
          {
            path: '/invite/rebate',
            name: '邀请返佣',
            component: './invite/rebate',
            topBar: true
          },
          {
            path: '/invite/rebate-record',
            name: '推广记录',
            component: './invite/rebate-record',
            topBar: true
          },
          {
            path: '/invite/rules',
            name: '奖励规则',
            component: './invite/rebate/rules',
            topBar: true
          }
        ]
      },
      {
        path: '/halving',
        routes: [
          {
            path: '/halving/list',
            name: 'SpaceM',
            component: './labs/list',
            topBar: true
          },
          {
            path: '/halving/list/spacem',
            name: 'SpaceM',
            component: './labs/list',
            topBar: true
          },
          {
            path: '/halving/list/mday',
            name: 'Mday',
            component: './labs/list',
            topBar: true
          },
          {
            path: '/halving/detail/:id/index',
            name: '项目详情',
            component: './labs/detail',
            topBar: true
          },
          {
            path: '/halving/detail/:id/action',
            name: '下单',
            component: './labs/action',
            topBar: true
          },
          {
            path: '/halving/detail/:id/lotto-rules',
            name: '抽取规则',
            component: './labs/lotto-rules',
            topBar: true
          },
          {
            path: '/halving/detail/:id/lotto-result',
            name: '中签名单',
            component: './labs/lotto-result',
            topBar: true
          },
          {
            path: '/halving/record',
            name: '订单记录',
            authorized: 'auth',
            Routes: ['src/pages/Authorized.js'],
            component: './labs/record',
            topBar: true
          }
        ]
      },
      {
        path: '/launchpad',
        routes: [
          {
            path: '/launchpad/main',
            name: 'Launchpad',
            component: './launchpad',
            topBar: true,
            theme: 'light'
          },
          {
            path: '/launchpad/detail/:id',
            name: 'Launchpad',
            component: './launchpad/detail',
            topBar: true,
            theme: 'light'
          },
          {
            path: '/launchpad/record',
            name: '订单记录',
            authorized: 'auth',
            Routes: ['src/pages/Authorized.js'],
            component: './launchpad/record',
            topBar: true
          }
        ]
      },
      {
        path: '/pos',
        routes: [
          {
            path: '/pos/defi',
            name: 'POSDefi',
            component: './pos/defi',
            Routes: ['src/pages/Authorized.js']
          },
          {
            path: '/pos/list',
            name: 'POS',
            component: './pos/list'
          },
          {
            path: '/pos/detail/:id',
            name: '项目详情',
            component: './pos/detail',
            authorized: 'auth',
            topBar: true,
            Routes: ['src/pages/Authorized.js']
          },
          {
            path: '/pos/record',
            name: '锁仓记录',
            authorized: 'auth',
            Routes: ['src/pages/Authorized.js'],
            component: './pos/record',
            topBar: true
          },
          {
            path: '/pos/record-detail/:id',
            name: '收益明细',
            authorized: 'auth',
            Routes: ['src/pages/Authorized.js'],
            component: './pos/record-detail',
            topBar: true
          },
          {
            path: '/pos/record-hold-detail/:id',
            name: '收益明细',
            authorized: 'auth',
            Routes: ['src/pages/Authorized.js'],
            component: './pos/record-detail',
            topBar: true
          }
        ]
      },
      {
        path: '/mx-defi',
        routes: [
          {
            path: '/mx-defi/list',
            name: 'MX DeFi',
            component: './mx-defi/list',
            topBar: true,
            theme: 'light'
          },
          {
            path: '/mx-defi/detail/:id',
            name: '项目详情',
            component: './mx-defi/detail',
            authorized: 'auth',
            Routes: ['src/pages/Authorized.js'],
            topBar: true
          },
          {
            path: '/mx-defi/mxdetail/:id',
            name: '项目详情',
            component: './mx-defi/defiDetail',
            authorized: 'auth',
            Routes: ['src/pages/Authorized.js'],
            topBar: true,
            theme: 'light'
          },
          {
            path: '/mx-defi/record',
            name: '锁仓记录',
            authorized: 'auth',
            Routes: ['src/pages/Authorized.js'],
            component: './mx-defi/record',
            topBar: true
          },
          {
            path: '/mx-defi/record-detail/:id',
            name: '收益明细',
            authorized: 'auth',
            Routes: ['src/pages/Authorized.js'],
            component: './mx-defi/record-detail',
            topBar: true
          }
        ]
      },
      {
        path: '/info',
        routes: [
          {
            path: '/info/about-us',
            name: '关于我们',
            component: './info/about-us',
            topBar: true
          },
          {
            path: '/info/about-us/detail',
            name: '平台简介',
            component: './info/about-us/detail',
            topBar: true
          },
          {
            path: '/info/vip',
            name: '大客户',
            component: './info/vip',
            topBar: true
          },
          {
            path: '/info/fee',
            name: '费率',
            component: './info/fee',
            topBar: true
          },
          {
            path: '/info/risk',
            name: '项目风险告知书',
            component: './info/risk',
            topBar: true
          },
          {
            path: '/info/terms',
            name: '用户协议和隐私政策',
            component: './info/terms',
            topBar: true
          },
          {
            path: '/info/margin-step',
            name: '逐级平仓',
            component: './info/margin-step',
            topBar: true
          }
        ]
      },
      {
        path: '/voting',
        routes: [
          {
            path: '/voting/index',
            name: '投票续期',
            component: './votingNew/index',
            topBar: true
          },
          {
            path: '/voting/vote/:id',
            name: '投票',
            authorized: 'auth',
            Routes: ['src/pages/Authorized.js'],
            component: './votingNew/vote'
          },
          {
            path: '/voting/invite/:id',
            name: '拉票',
            component: './votingNew/invite'
          },
          {
            path: '/voting/my',
            name: '我的投票',
            authorized: 'auth',
            Routes: ['src/pages/Authorized.js'],
            component: './votingNew/my'
          },
          {
            path: '/voting/govern',
            name: '投票治理',
            component: './votingGovern/index',
            topBar: true
          },
          {
            path: '/voting/recharge',
            name: '充值PK投票',
            component: './votingRecharge/index',
            topBar: true
          },
          {
            path: '/voting/ranking',
            name: '充值排名赛',
            component: './votingRanking/index',
            topBar: true,
            theme: 'light'
          }
        ]
      },
      {
        path: '/contract',
        routes: [
          {
            path: '/contract/information',
            component: './contract/information/layout',
            routes: [
              {
                path: '/contract/information/menu',
                component: './contract/information/menu',
                topBar: true
              },
              {
                path: '/contract/information/contract_detail',
                component: './contract/information/contractDetail',
                topBar: true
              },
              {
                path: '/contract/information/index_price',
                component: './contract/information/indexPrice',
                topBar: true
              },
              {
                path: '/contract/information/fair_price',
                component: './contract/information/fairPrice',
                topBar: true
              },
              {
                path: '/contract/information/funding_list',
                component: './contract/information/fundingList',
                topBar: true
              },
              {
                path: '/contract/information/insure_list',
                component: './contract/information/insureList',
                topBar: true
              }
            ]
          },
          {
            path: '/contract/rank',
            component: './contract/rank/index',
            topBar: true
          },
          {
            path: '/contract/analysis',
            component: './contract/analysis/index',
            topBar: true
          }
        ]
      },
      {
        path: '/etfIndex',
        component: './etfIndex/layout',
        routes: [
          {
            path: '/etfIndex/spot',
            title: '指数交易',
            component: './etfIndex/spot',
            topBar: true
          },
          {
            path: '/etfIndex/trading',
            title: '申购赎回',
            component: './etfIndex/trading',
            topBar: true
          },
          {
            path: '/etfIndex/order',
            title: '订单记录',
            component: './etfIndex/order',
            authorized: 'auth',
            Routes: ['src/pages/Authorized.js'],
            topBar: true
          },
          {
            path: '/etfIndex/pairs',
            title: '指数成分',
            component: './etfIndex/pairs',
            topBar: true
          }
        ]
      },
      {
        path: '/ecology',
        routes: [
          {
            path: '/ecology/SolanaZone',
            name: 'SOL专区',
            component: './defi/SolanaZone/index',
            topBar: true
          },
          {
            path: '/ecology/MetaverseZone',
            name: '元宇宙专区',
            component: './defi/MetaverseZone/index',
            topBar: true
          },
          {
            path: '/ecology/CoinbaseZone',
            name: 'Coinbase专区',
            component: './defi/CoinbaseZone/index',
            topBar: true
          },
          {
            path: '/ecology/defi',
            name: 'DEFI专区',
            component: './defi/defi/index',
            topBar: true
          },
          {
            path: '/ecology/polka',
            name: '波卡专区',
            component: './defi/polka/index',
            topBar: true
          },
          {
            path: '/ecology/web3',
            name: 'web3.0',
            component: './defi/web3/index',
            topBar: true
          },
          {
            path: '/ecology/storage',
            name: '储存专区',
            component: './defi/storage/index',
            topBar: true
          },
          {
            path: '/ecology/nft',
            name: 'NFT专区',
            component: './defi/nft/index',
            topBar: true
          },
          {
            path: '/ecology/Rebase',
            name: 'Rebase专区',
            component: './defi/Rebase/index',
            topBar: true
          },
          {
            path: '/ecology/Layer2',
            name: 'Layer2专区',
            component: './defi/Layer2/index',
            topBar: true
          },
          {
            path: '/ecology/BSC',
            name: 'BSC专区',
            component: './defi/BSC/index',
            topBar: true,
            theme: 'dark'
          },
          {
            path: '/ecology/HECO',
            name: 'HECO专区',
            component: './defi/HECO/index',
            topBar: true,
            theme: 'dark'
          }
        ]
      },
      {
        path: '/grayPosition',
        component: './grayPosition',
        topBar: true
      },
      {
        path: '/activity',
        routes: [
          {
            path: '/activity/fork-conversion',
            name: 'BCH分叉',
            component: './activity/forkConversion/index',
            topBar: true,
            theme: 'light'
          },
          {
            path: '/activity/fork-conversion/record',
            name: 'BCH分叉币兑换明细',
            authorized: 'auth',
            Routes: ['src/pages/Authorized.js'],
            component: './activity/forkConversion/record',
            topBar: true,
            theme: 'light'
          },
          {
            path: '/activity/eth-staking',
            name: 'ETH质押',
            component: './activity/staking/index',
            topBar: true,
            theme: 'light'
          },
          {
            path: '/activity/eth-staking/record',
            name: 'ETH质押明细',
            authorized: 'auth',
            Routes: ['src/pages/Authorized.js'],
            component: './activity/staking/record',
            topBar: true,
            theme: 'light'
          },
          {
            path: '/activity/ksm-slot',
            name: 'KSM平行链插槽竞拍',
            component: './activity/ksmSlot/index',
            topBar: true,
            theme: 'light'
          },
          {
            path: '/activity/ksm-slot/record',
            name: '我的投票记录',
            authorized: 'auth',
            Routes: ['src/pages/Authorized.js'],
            component: './activity/ksmSlot/record',
            topBar: true,
            theme: 'light'
          },
          // 阳光普照
          {
            path: '/activity/sun',
            name: '阳光普照',
            component: './activity/sun/index',
            topBar: true,
            theme: 'light'
            // authorized: 'auth',
            // Routes: ['src/pages/Authorized.js']
          },
          {
            path: '/activity/sun/record',
            name: '阳光普照投票记录',
            // authorized: 'auth',
            // Routes: ['src/pages/Authorized.js'],
            component: './activity/sun/record',
            topBar: true,
            theme: 'light'
          },
          {
            path: '/activity/sun/detail/:id',
            name: '阳光普照详情',
            // authorized: 'auth',
            // Routes: ['src/pages/Authorized.js'],
            component: './activity/sun/Detail',
            topBar: true,
            theme: 'light'
          }
        ]
      },
      {
        path: '/etfRank',
        component: './etfRank',
        authorized: 'auth',
        name: 'ETF排行榜',
        Routes: ['src/pages/Authorized.js'],
        topBar: true
      },
      // todo pos
      // todo 合约
      {
        path: '/test',
        component: './test',
        topBar: true
      },
      {
        component: '404'
      }
    ]
  }
];
