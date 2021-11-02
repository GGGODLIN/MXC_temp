import React, { useState, useEffect, useReducer, useRef } from 'react';
import { fetch } from 'dva';
import { connect } from 'dva';
import { router } from 'umi';
import classNames from 'classnames';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import { InputItem, WingBlank, Flex, ImagePicker, Toast, Button, Modal, List, DatePicker } from 'antd-mobile';
import { createForm } from 'rc-form';
import CountrySelect from '@/components/CountrySelect';
import TopBar from '@/components/TopBar';
import { saveIdentityAuth, saveIdentityAuthChina } from '@/services/api';
import { getCookie } from '@/utils';
import { getUcenterPath } from '@/utils/sites';

import uploadExample from '@/assets/img/ucenter/id-auth/upload-example.png';
import styles from './index.less';
import moment from 'moment';

const language = getLocale();

function uploadReducer(state, action) {
  if (action.operationType === 'add') {
    return {
      ...state,
      [action.type]: {
        fileList: action.files
      }
    };
  } else {
    return {
      ...state,
      [action.type]: {
        fileList: []
      }
    };
  }
}

function IdAuth({ dispatch, kycInfo, form: { getFieldProps, getFieldError, validateFields, setFieldsValue, resetFields } }) {
  useEffect(() => {
    if (!kycInfo) {
      dispatch({ type: 'auth/getUcenterIndexInfo' });
    }
    validateFields();
  }, []);

  const [countrySelectOpen, setCountrySelectOpen] = useState(false);
  // const [currentCountry, setCurrentCountry] = useState({ cn: '中国', code: 'CN', en: 'China', mobileCode: '86' });
  const [currentCountry, setCurrentCountry] = useState();
  const afterCloseHandle = country => {
    if (country.code) {
      setCurrentCountry(country);
    }

    setCountrySelectOpen(false);
  };

  const [uploadData, uploadDispatch] = useReducer(uploadReducer, {
    cardHome: {
      fileList: []
    }
  });

  const uploadHandle = async (files, operationType, type) => {
    if (files[0]) {
      const size = files[0].file.size,
        isGt5m = size / 1024 / 1024 >= 5;

      if (isGt5m) {
        Toast.fail(formatMessage({ id: 'ucenter.kyc.upload.size' }));
        return;
      }

      const fd = new FormData();
      fd.append('file', files[0].file);

      Toast.loading(formatMessage({ id: 'ucenter.kyc.uploading' }), 30);

      const uc_api = await getUcenterPath();
      const headers = {
        'Ucenter-Token': getCookie('u_id') || '',
        'Ucenter-Via': 'H5'
      };

      fetch(`${uc_api}/kyc_junior/upload_identity_file`, { credentials: 'include', method: 'POST', body: fd, headers })
        .then(response => {
          Toast.hide();
          if (response.status >= 200 && response.status < 300) {
            return response;
          }

          const error = new Error();
          error.name = response.status;
          error.response = response;
          throw error;
        })
        .then(response => {
          // 204 do not return data by default
          // using .json will report an error.
          if (response.status === 204) {
            return response.text();
          }
          return response.json();
        })
        .then(json => {
          const { code, data } = json;
          if (code === 0) {
            // Toast.fail(formatMessage({ id: 'ucenter.kyc.success' }));
            uploadDispatch({ files, operationType, type });
            setFieldsValue({ [type]: data.fileId });
          } else {
            Toast.fail(json.msg);
          }
        })
        .catch(e => {
          return {};
        });
    } else {
      uploadDispatch({ files, operationType, type });
      resetFields([type]);
      validateFields();
    }
  };

  const [submitLoading, setSubmitLoading] = useState(false);
  const checkHandle = () => {
    if (!currentCountry) {
      Toast.fail(formatMessage({ id: 'mc_id_auth_country_placeholder' }), 2);
      return;
    }

    validateFields((err, values) => {
      if (err) {
        if (getFieldError('name')) {
          Toast.fail(formatMessage({ id: 'ucenter.kyc.name.require' }), 2);
          return;
        }

        if (getFieldError('IDNumber')) {
          Toast.fail(getFieldError('IDNumber')[0], 2);
          return;
        }

        if (getFieldError('surname')) {
          Toast.fail(formatMessage({ id: 'mc_id_auth_surname_placeholder' }), 2);
          return;
        }

        if (getFieldError('firstname')) {
          Toast.fail(formatMessage({ id: 'mc_id_auth_firstname_placeholder' }), 2);
          return;
        }

        if (getFieldError('cardNumber')) {
          Toast.fail(formatMessage({ id: 'ucenter.kyc.card_number.require' }), 2);
          return;
        }

        if (getFieldError('birth')) {
          Toast.fail(formatMessage({ id: 'mc_id_auth_birth_placeholder' }), 2);
          return;
        }

        if (getFieldError('cardHome')) {
          Toast.fail(formatMessage({ id: 'mc_id_auth_card_img_placeholder' }), 2);
          return;
        }
      } else {
        setRiskConfirmVisible(true);
      }
    });
  };

  const submitHandle = () => {
    validateFields(async (err, values) => {
      if (!err) {
        let result;
        setSubmitLoading(true);

        if (currentCountry?.code === 'CN' || currentCountry?.code === 'OTHER') {
          const params = {
            authName: values.name,
            cardNo: values.IDNumber
          };
          result = await saveIdentityAuthChina(params);
        } else {
          const params = {
            countryCode: currentCountry?.code,
            cardType: currentCardType.id,
            cardNo: values.cardNumber,
            cardHome: values.cardHome,
            authSurname: values.surname,
            authName: values.firstname,
            birthday: moment(values.birth).format('YYYY/MM/DD')
          };

          result = await saveIdentityAuth(params);
        }

        if (result && result.code === 0) {
          dispatch({ type: 'auth/getUcenterIndexInfo' });
          Toast.success(formatMessage({ id: 'ucenter.kyc.success' }), 2, () => {
            setSubmitLoading(false);
            setRiskConfirmVisible(false);
            router.replace('/ucenter/id-auth-result');
          });
        } else {
          setSubmitLoading(false);
        }
      }
    });
  };

  const [showCardTypeModal, setShowCardTypeModal] = useState(false);
  const [currentCardType, setCurrentCardType] = useState({ id: 2, name: formatMessage({ id: 'ucenter.kyc.card_type.passport' }) });
  const closeCardTypeModal = cardType => {
    if (cardType) {
      setCurrentCardType(cardType);
    }

    setShowCardTypeModal(false);
  };

  const [riskConfirmVisible, setRiskConfirmVisible] = useState(false);
  const [countDown, setCountDown] = useState(10);
  const timer = useRef();
  useEffect(() => {
    if (riskConfirmVisible) {
      let countdownTime = 10;
      timer.current = setInterval(() => {
        countdownTime--;
        if (countdownTime === 0) {
          clearInterval(timer.current);
          timer.current = null;
        }
        setCountDown(countdownTime);
      }, 1000);
    } else {
      clearInterval(timer.current);
    }

    return () => {
      clearInterval(timer.current);
      setCountDown(10);
    };
  }, [riskConfirmVisible]);

  const closeRiskConfirmModal = () => {
    setRiskConfirmVisible(false);
  };

  return (
    <>
      <TopBar>{formatMessage({ id: 'ucenter.index.features.kyc' })}</TopBar>

      <WingBlank className={styles.wrapper}>
        <section className={styles.item}>
          <div onClick={() => setCountrySelectOpen(true)}>
            <InputItem
              editable={false}
              placeholder={formatMessage({ id: 'ucenter.kyc.country' })}
              value={language.startsWith('zh') ? currentCountry?.cn : currentCountry?.en}
              extra={<i className={classNames('iconfont', 'icondrop')}></i>}
            />
          </div>
        </section>

        {currentCountry && currentCountry.code !== 'CN' && currentCountry.code !== 'OTHER' && (
          <>
            <section className={styles.item}>
              <InputItem
                {...getFieldProps('surname', {
                  rules: [{ required: true, message: formatMessage({ id: 'mc_id_auth_surname_placeholder' }) }]
                })}
                placeholder={formatMessage({ id: 'mc_id_auth_surname_placeholder' })}
              />
            </section>

            <section className={styles.item}>
              <InputItem
                {...getFieldProps('firstname', {
                  rules: [{ required: true, message: formatMessage({ id: 'mc_id_auth_firstname_placeholder' }) }]
                })}
                placeholder={formatMessage({ id: 'mc_id_auth_firstname_placeholder' })}
              />
            </section>

            <section className={styles.item}>
              <div>
                <InputItem
                  onClick={() => setShowCardTypeModal(true)}
                  editable={false}
                  placeholder={formatMessage({ id: 'ucenter.kyc.card_type.require' })}
                  value={currentCardType.name}
                  extra={<i className={classNames('iconfont', 'icondrop')}></i>}
                />
              </div>
            </section>

            <section className={styles.item}>
              <InputItem
                {...getFieldProps('cardNumber', {
                  rules: [{ required: true, message: formatMessage({ id: 'ucenter.kyc.card_number.require' }) }]
                })}
                placeholder={formatMessage({ id: 'ucenter.kyc.card_number.require' })}
              />
            </section>

            <section className={styles.item}>
              <DatePicker
                {...getFieldProps('birth', {
                  rules: [{ required: true, message: formatMessage({ id: 'mc_id_auth_birth_placeholder' }) }]
                })}
                mode="date"
                okText={formatMessage({ id: 'common.sure' })}
                dismissText={formatMessage({ id: 'common.cancel' })}
                minDate={new Date(1900, 1, 1, 0, 0, 0)}
                maxDate={
                  new Date(
                    moment()
                      .startOf('day')
                      .valueOf()
                  )
                }
              >
                <List.Item arrow="horizontal">{formatMessage({ id: 'mc_id_auth_birth' })}</List.Item>
              </DatePicker>
            </section>

            <section className={styles.item}>
              <InputItem
                capture="camera"
                className={styles['upload-input']}
                {...getFieldProps('cardHome', {
                  rules: [{ required: true, message: formatMessage({ id: 'mc_id_auth_card_img_placeholder' }) }]
                })}
              />

              <div className={styles['upload-item']} justify="between">
                <p className={styles['upload-tip']}>
                  <span className="iconfont iconadd"></span>
                  {formatMessage({ id: 'mc_id_auth_card_img' })}
                </p>
                <ImagePicker
                  files={uploadData.cardHome.fileList}
                  length={1}
                  selectable={!uploadData.cardHome.fileList.length}
                  onChange={(files, operationType) => uploadHandle(files, operationType, 'cardHome')}
                />
              </div>
              <div className={styles.uploadLimit}>
                <p>·{formatMessage({ id: 'mc_id_auth_card_img_tip1' })}</p>
                <p>·{formatMessage({ id: 'mc_id_auth_card_img_tip2' })}</p>
                <p>·{formatMessage({ id: 'mc_id_auth_card_img_tip3' })}</p>
              </div>
            </section>

            <section className={styles.item}>
              <p className={styles.exampleTitle}>{formatMessage({ id: 'mc_id_auth_card_example' })}</p>
              <img className={styles.exampleImg} src={uploadExample} alt="example" />
            </section>
          </>
        )}

        {currentCountry && (currentCountry.code === 'CN' || currentCountry.code === 'OTHER') && (
          <>
            <section className={styles.item}>
              <InputItem
                {...getFieldProps('name', {
                  rules: [{ required: true, message: formatMessage({ id: 'ucenter.kyc.name.require' }) }]
                })}
                placeholder={formatMessage({ id: 'ucenter.kyc.name.require' })}
              />
            </section>

            <section className={styles.item}>
              <InputItem
                {...getFieldProps('IDNumber', {
                  validateFirst: true,
                  rules: [
                    { required: true, whitespace: true, message: formatMessage({ id: 'mc_id_auth_id_card_number_placeholder' }) },
                    { pattern: /^.{15}$|^.{18}$/g, message: formatMessage({ id: 'mc_id_auth_id_card_number_error' }) }
                  ]
                })}
                placeholder={formatMessage({ id: 'mc_id_auth_id_card_number_placeholder' })}
              />
            </section>
          </>
        )}

        <section className={styles.item}>
          <Button type="primary" onClick={() => checkHandle()}>
            {formatMessage({ id: 'ucenter.kyc.submit' })}
          </Button>
        </section>
      </WingBlank>

      {/*国家选择*/}
      <CountrySelect businessType="KYC" open={countrySelectOpen} afterCloseHandle={afterCloseHandle} />

      {/*证件类型选择*/}
      <Modal
        className={styles.cardTypeModal}
        popup
        animationType="slide-up"
        visible={showCardTypeModal}
        onClose={() => closeCardTypeModal()}
      >
        <List renderHeader={() => formatMessage({ id: 'ucenter.kyc.card_type' })}>
          <List.Item onClick={() => closeCardTypeModal({ id: 0, name: formatMessage({ id: 'ucenter.kyc.card_type.driving' }) })}>
            {formatMessage({ id: 'ucenter.kyc.card_type.driving' })}
          </List.Item>
          <List.Item onClick={() => closeCardTypeModal({ id: 1, name: formatMessage({ id: 'ucenter.kyc.card_type.id_card' }) })}>
            {formatMessage({ id: 'ucenter.kyc.card_type.id_card' })}
          </List.Item>
          <List.Item onClick={() => closeCardTypeModal({ id: 2, name: formatMessage({ id: 'ucenter.kyc.card_type.passport' }) })}>
            {formatMessage({ id: 'ucenter.kyc.card_type.passport' })}
          </List.Item>
        </List>
      </Modal>

      <Modal popup animationType="slide-up" visible={riskConfirmVisible} onClose={closeRiskConfirmModal}>
        <div className={styles.riskConfirmWrapper}>
          <div className={styles.riskConfirmHeader}>
            <h5 className={styles.riskConfirmTitle}>{formatMessage({ id: 'mc_id_auth_risk_confirm' })}</h5>
            <span className={styles.riskConfirmClose} onClick={closeRiskConfirmModal}>
              {formatMessage({ id: 'mc_safety_close' })}
            </span>
          </div>
          <div className={styles.riskConfirmContent}>
            <p className={styles.riskConfirm}>{formatMessage({ id: 'mc_id_auth_risk_confirm_text' })}</p>
            <Button disabled={countDown > 0} loading={submitLoading} type="primary" onClick={submitHandle}>{`${formatMessage({
              id: 'mc_id_auth_risk_confirm_button'
            })}${countDown ? `(${countDown}s)` : ''}`}</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default connect(({ auth, setting }) => ({
  user: auth.user,
  theme: setting.theme,
  kycInfo: auth.kycInfo,
  loginMember: auth.loginMember
}))(createForm()(IdAuth));
