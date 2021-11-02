import React from 'react';
import { connect } from 'dva';
import { getLocale, setLocale, formatMessage } from 'umi-plugin-locale';
import { List, Radio, WhiteSpace } from 'antd-mobile';
import langMap from '@/utils/lang';
import TopBar from '@/components/TopBar';

const language = getLocale();

function SettingLanguage() {
  const changeLang = locale => {
    if (locale !== language) {
      setLocale(locale);
    }
  };

  return (
    <div>
      <TopBar>{formatMessage({ id: 'ucenter.index.features.language' })}</TopBar>
      <WhiteSpace />
      <List renderHeader={() => formatMessage({ id: 'ucenter.index.features.language.select' })}>
        {Object.entries(langMap).map(([prop, value]) => (
          <Radio.RadioItem key={prop} checked={prop === language} onChange={() => changeLang(prop)}>
            {value.label}
          </Radio.RadioItem>
        ))}
      </List>
      <WhiteSpace />
    </div>
  );
}

export default connect(({ auth }) => ({
  user: auth.user
}))(SettingLanguage);
