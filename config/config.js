// https://umijs.org/config/
import slash from 'slash2';
import routes from './routes';
import theme from './am-theme';
import pxToViewPort from 'postcss-px-to-viewport';
import { commit, version } from '../_version.json';

const { NODE_ENV, DEPLOY, TEST_DOMAIN } = process.env;

const plugins = [
  // ref: https://umijs.org/plugin/umi-plugin-react.html
  [
    'umi-plugin-react',
    {
      antd: true, // 默认将会使用antd/lib/locale-provider
      dva: true,
      dynamicImport: { webpackChunkName: true },
      dll: true,
      locale: {
        enable: true,
        default: 'en-US',
        baseNavigator: true
        // antd: true
      },
      chunks: NODE_ENV === 'production' ? ['framework', 'antd', 'charts', 'common', 'locales', 'vendors', 'umi'] : ['vendors', 'umi'],
      // pwa: {
      //   manifestOptions: {
      //     srcPath: 'src/manifest.json'
      //   },
      //   workboxPluginMode: 'InjectManifest',
      //   workboxOptions: {
      //     importWorkboxFrom: 'local'
      //   }
      // },
      fastClick: false,
      hd: false
    }
  ]
];

const uglifyJSOptions =
  DEPLOY === 'prod'
    ? {
        uglifyOptions: {
          // remove console.* except console.error and .warn
          compress: {
            drop_console: true,
            pure_funcs: ['console.error', 'console.warn']
          },
          output: {
            beautify: false,
            comments: false
          }
        }
      }
    : {};

const publicPath = '/';

const basicDefinitions = {
  NODE_ENV,
  MXC_DEPLOY: DEPLOY || 'test',
  PUBLIC_PATH: publicPath,
  HC_PATH: 'https://support.mexc.com',
  VERSION: `${version || ''}__${commit || ''}`
};

const devDomain = TEST_DOMAIN || '.mxctest.com';

const definitions =
  NODE_ENV === 'production'
    ? Object.assign({}, basicDefinitions, {
        API_PATH: '/api'
      })
    : Object.assign({}, basicDefinitions, {
        MXC_ORIGIN: `https://www${devDomain}`,
        SOCKETIO_ORIGIN: `wss://wbs${devDomain}`,
        OTC_ORIGIN: `https://otc${devDomain}`,
        CONTRACT_ORIGIN: `https://swap5${devDomain}`,
        CHAT_ORIGIN: `https://chat${devDomain}`,
        API_PATH: `https://www${devDomain}/api`,
        OTC_API: `https://otc${devDomain}/api`
      });

export default {
  publicPath,
  plugins,
  define: definitions,
  routes,
  // Theme for antd  https://ant.design/docs/react/customize-theme-cn
  theme,
  externals: {
    tradingView: 'window.TradingView'
  },
  extraPostCSSPlugins: [
    pxToViewPort({
      viewportWidth: 375,
      unitPrecision: 5,
      viewportUnit: 'vw',
      selectorBlackList: ['country-select-flag'],
      minPixelValue: 1,
      mediaQuery: false
    })
  ],
  ignoreMomentLocale: true,
  lessLoaderOptions: {
    javascriptEnabled: true
  },
  disableRedirectHoist: true,
  cssLoaderOptions: {
    modules: true,
    getLocalIdent: (context, localIdentName, localName) => {
      if (context.resourcePath.includes('node_modules') || context.resourcePath.includes('global.less')) {
        return localName;
      }
      const match = context.resourcePath.match(/src(.*)/);
      if (match && match[1]) {
        const lessPath = match[1].replace('.less', '');
        const arr = slash(lessPath)
          .split('/')
          .filter(a => a)
          .map(a => a.toLowerCase());
        return `${arr.join('-')}-${localName}`;
      }
      return localName;
    }
  },
  manifest: {
    basePath: '/'
  },
  // targets: {
  //   ie: 11
  // },
  treeShaking: true,
  hash: true,
  uglifyJSOptions,

  chainWebpack(config, { webpack }) {
    if (NODE_ENV === 'production') {
      config.merge({
        optimization: {
          minimize: true,
          splitChunks: {
            chunks: 'all',
            minSize: 30000,
            minChunks: 1,
            maxAsyncRequests: 100,
            maxInitialRequests: 100,
            automaticNameDelimiter: '.',
            cacheGroups: {
              framework: {
                name: 'framework',
                test: /[\\/]node_modules[\\/](react|redux|dva|umi)/,
                priority: 40
              },
              antd: {
                name: 'antd',
                test: /[\\/]node_modules[\\/](@ant-design|antd)/,
                priority: 30
              },
              charts: {
                name: 'charts',
                test: /[\\/]node_modules[\\/](echarts|zrender)/,
                priority: 20
              },
              common: {
                name: 'common',
                test: /[\\/]node_modules[\\/]/,
                priority: 5
              },
              locales: {
                name: 'locales',
                test: /src[\\/]locales[\\/]/,
                priority: 3
              }
            }
          }
        }
      });
    }
  }
};
