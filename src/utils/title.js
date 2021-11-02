import { formatMessage } from 'umi-plugin-locale';

const title = `${formatMessage({ id: 'common.site_title' })} - ${formatMessage({ id: 'home.title.mxc_slogen' })}`;

export default (routeName, dynamic) => {
  if (dynamic) {
    return `${dynamic} - ${title}`;
  }
  if (routeName) {
    const pageName = formatMessage({ id: routeName });
    return `${pageName} - ${title}`;
  }
  return `${title}`;
};
