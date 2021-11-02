import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import classNames from 'classnames';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import { SearchBar, List, Modal } from 'antd-mobile';
import { getCountryList } from '@/services/api';

import styles from './index.less';

const { Item } = List;
const language = getLocale();

function CountrySelect({ open, afterCloseHandle, businessType }) {
  const [usuallyCountries, setUsuallyCountries] = useState([]);
  const [otherCountries, setOtherCountries] = useState([]);

  useEffect(e => {
    getCountryList(businessType ? { businessType } : null).then(result => {
      if (result?.code === 0) {
        const countryList = result.data;
        const defaultCountry = result?._extend?.defaultCountry;
        let usuallyCountries = [],
          otherCountries = [];

        // 将other放到最后一位
        const normalCountryList = countryList.filter(country => country.code !== 'OTHER');
        const otherCountry = countryList.filter(country => country.code === 'OTHER');

        [...normalCountryList, ...otherCountry].forEach(country => {
          if (country.usually) {
            usuallyCountries.push(country);
          } else {
            otherCountries.push(country);
          }
        });

        const defaultCountryObject = countryList.find(item => item.code.toLocaleUpperCase() === defaultCountry?.toLocaleUpperCase());

        setUsuallyCountries(usuallyCountries);
        setOtherCountries(otherCountries);
        setUsuallyRender(usuallyCountries);
        setOtherRender(otherCountries);
        if (defaultCountryObject) {
          onClose(defaultCountryObject);
        }
      }
    });
  }, []);

  const [searchValue, setSearchValue] = useState('');
  const [usuallyRender, setUsuallyRender] = useState([]);
  const [otherRender, setOtherRender] = useState([]);
  const searchSubmit = (value, type) => {
    if (type === 'cancel') {
      setSearchValue('');
    } else {
      setSearchValue(value);
    }

    let filterValue = type === 'cancel' ? '' : value;

    // 根据输入内容筛选
    const filterUsuallyCountries = filterValue
      ? usuallyCountries.filter(({ code, cn, en, mobileCode }) => {
          return (
            code.toLowerCase().includes(filterValue.toLowerCase()) ||
            en.toLowerCase().includes(filterValue.toLowerCase()) ||
            cn.includes(filterValue) ||
            mobileCode.includes(filterValue)
          );
        })
      : usuallyCountries;

    const filterOtherCountries = filterValue
      ? otherCountries.filter(({ code, cn, en, mobileCode }) => {
          return (
            code.toLowerCase().includes(filterValue.toLowerCase()) ||
            en.toLowerCase().includes(filterValue.toLowerCase()) ||
            cn.includes(filterValue) ||
            mobileCode.includes(filterValue)
          );
        })
      : otherCountries;

    setUsuallyRender(filterUsuallyCountries);
    setOtherRender(filterOtherCountries);
  };

  const content = () => {
    return (
      <div className={styles['sidebar-content']}>
        <div className={styles.header}>
          <h3>{formatMessage({ id: 'country.select.title' })}</h3>
          <SearchBar
            placeholder={formatMessage({ id: 'common.search' })}
            value={searchValue}
            onSubmit={searchSubmit}
            onCancel={value => searchSubmit(value, 'cancel')}
            onClear={searchSubmit}
            onChange={searchSubmit}
            cancelText={formatMessage({ id: 'common.cancel' })}
          />
        </div>

        <div className={styles.countries}>
          <List renderHeader={() => formatMessage({ id: 'country.select.usually' })}>
            {usuallyRender.map((country, index) => (
              <Item key={index} onClick={() => onClose(country)}>
                <span
                  className={classNames(styles['country-select-flag'], styles[`country-select-flag-${country.code.toLowerCase()}`])}
                ></span>
                {country.mobileCode && <span className={styles.code}>+{country.mobileCode}</span>}
                <span className={styles.name}>{language.startsWith('zh') ? country.cn : country.en}</span>
              </Item>
            ))}
          </List>
          <List renderHeader={() => formatMessage({ id: 'country.select.other' })}>
            {otherRender.map((country, index) => (
              <Item key={index} onClick={() => onClose(country)}>
                <span
                  className={classNames(styles['country-select-flag'], styles[`country-select-flag-${country.code.toLowerCase()}`])}
                ></span>
                {country.mobileCode && <span className={styles.code}>+{country.mobileCode}</span>}
                <span className={styles.name}>{language.startsWith('zh') ? country.cn : country.en}</span>
              </Item>
            ))}
          </List>
        </div>
      </div>
    );
  };

  const onClose = (country = {}) => {
    if (typeof afterCloseHandle === 'function') {
      afterCloseHandle(country);
    }
  };

  return (
    <Modal className="am-modal-popup-slide-left" transitionName="am-slide-left" popup visible={open} onClose={() => onClose()}>
      {content()}
    </Modal>
  );
}

export default connect(({ auth, global }) => ({
  user: auth.user
}))(CountrySelect);
