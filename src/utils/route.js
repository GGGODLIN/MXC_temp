import iconHome from '@/assets/img/tabBar/home.png';
import iconHomeActive from '@/assets/img/tabBar/home_active.png';
import iconMarket from '@/assets/img/tabBar/market.png';
import iconMarketActive from '@/assets/img/tabBar/market_active.png';
import iconTrade from '@/assets/img/tabBar/trade.png';
import iconTradeActive from '@/assets/img/tabBar/trade_active.png';
import iconAssets from '@/assets/img/tabBar/assets.png';
import iconAssetsActive from '@/assets/img/tabBar/assets_active.png';
import iconUcenter from '@/assets/img/tabBar/ucenter.png';
import iconUcenterActive from '@/assets/img/tabBar/ucenter_active.png';
import pathToRegexp from 'path-to-regexp';
import { formatMessage } from 'umi-plugin-locale';

export const findRoute = (routes, pathname) => {
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    let matched = false;
    if (route.path) {
      matched = pathToRegexp(route.path).exec(pathname);
    }
    if (matched) {
      return route;
    } else if (route.routes) {
      const findChild = findRoute(route.routes, pathname);
      if (findChild) {
        return findChild;
      }
    }
  }
  return null;
};

export const tabBar = [
  {
    title: formatMessage({ id: 'header.index' }),
    icon: iconHome,
    iconActive: iconHomeActive,
    path: '/'
  },
  {
    title: formatMessage({ id: 'layout.title.tabbar.market' }),
    icon: iconMarket,
    iconActive: iconMarketActive,
    path: '/market/main'
  },
  {
    title: formatMessage({ id: 'layout.title.tabbar.trade' }),
    icon: iconTrade,
    iconActive: iconTradeActive,
    path: ['/trade/spot', '/margin/spot', '/otc/fiat']
  },
  {
    title: formatMessage({ id: 'header.asset' }),
    icon: iconAssets,
    iconActive: iconAssetsActive,
    path: '/uassets/overview'
  },
  {
    title: formatMessage({ id: 'layout.title.tabbar.my' }),
    icon: iconUcenter,
    iconActive: iconUcenterActive,
    path: '/ucenter/profile'
  }
];
