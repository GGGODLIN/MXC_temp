import React, { useEffect, useState } from 'react';
// import ThemeOnly from '@/components/ThemeOnly';
import classNames from 'classnames';
import { formatMessage } from 'umi/locale';
import { putOrderAppeal, putOrderComplaintSelect, getAppealInfo, putAppealComment, getPlaceTheOrder } from '@/services/api';
import { connect } from 'dva';
import { createForm } from 'rc-form';
import { InputItem, ImagePicker, Button, Picker, TextareaItem, List, Flex, Toast } from 'antd-mobile';
import TopBar from '@/components/TopBar';
import CountrySelect from '@/components/CountrySelect';
import { getSubSite } from '@/utils';
import { mobileReg } from '@/utils/regExp';
import styles from './index.less';
import Record from './record';

//压缩方法
function dealImage(base64, w, callback) {
  var newImage = new Image();
  var quality = 0.6;
  newImage.src = base64.url;
  newImage.setAttribute('crossOrigin', 'Anonymous');
  var imgWidth, imgHeight;
  newImage.onload = function() {
    imgWidth = this.width;
    imgHeight = this.height;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    if (Math.max(imgWidth, imgHeight) > w) {
      if (imgWidth > imgHeight) {
        canvas.width = w;
        canvas.height = (w * imgHeight) / imgWidth;
      } else {
        canvas.height = w;
        canvas.width = (w * imgWidth) / imgHeight;
      }
    } else {
      canvas.width = imgWidth;
      canvas.height = imgHeight;
      quality = 0.6;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
    var base64 = canvas.toDataURL('image/jpeg', quality);
    callback(base64);
  };
}
const base64toFile = (dataurl, filename = 'file') => {
  let arr = dataurl.split(',');

  let mime = arr[0].match(/:(.*?);/)[1];

  let suffix = mime.split('/')[1];

  let bstr = atob(arr[1]);

  let n = bstr.length;

  let u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], `${filename}.${suffix}`, {
    type: mime
  });
};

function Container({ form, location, countryList, defaultCountry }) {
  const { getFieldError } = form;
  const [loading, setLoading] = useState(false);
  const [selectAppealList, setSelectAppealList] = useState([]);
  const [currentCountry, setCurrentCountry] = useState({ code: 'VN', en: 'Vietnam', cn: '越南', mobileCode: '84' });
  const [countrySelectOpen, setCountrySelectOpen] = useState(false);
  const { getFieldProps, validateFields } = form;
  const [files, setFiles] = useState([]);
  const [imgfileId, setImgfileId] = useState([]);
  const [complainId, setComplainId] = useState();
  const [filesIndex, setFilesIndex] = useState(0);
  const [recordVisible, setRecordVisible] = useState(false);
  const [orderState, setOrderState] = useState();

  const { id } = location.query;

  useEffect(() => {
    if (defaultCountry) {
      let defaultVal = countryList.filter(item => item.code === defaultCountry);
      setCurrentCountry(defaultVal[0]);
    }
  }, [defaultCountry, countryList]);

  useEffect(() => {
    complaintSelect();
  }, []);
  useEffect(() => {
    complaintSelect();
  }, []);
  useEffect(() => {
    if (id) {
      getAppeal(id);
    }
  }, [id, recordVisible]);
  useEffect(() => {
    if (id) {
      getOrderInfo();
    }
  }, [id]);
  const getOrderInfo = async () => {
    const res = await getPlaceTheOrder(id);
    if (res.code === 0) {
      setRecordVisible(res.data.complained);

      setOrderState(res.data.state);
    }
  };
  const getAppeal = async id => {
    let data = {
      orderDealId: id
    };
    const res = await getAppealInfo(data);
    if (res.code === 0) {
      setComplainId(res.data.opening ? res.data.opening.id : '');
    } else {
      Toast.info(formatMessage(res.msg), 3);
    }
  };

  const imgOnChange = (files, type, index) => {
    if (type === 'remove') {
      setFiles(files);
      let imgList = imgfileId.filter(obj => obj !== imgfileId[index]);
      setFilesIndex(filesIndex - 1);
      console.log(imgList);
      setImgfileId(imgList);
    } else {
      setFiles(files);
      let apirul = `${getSubSite('otc')}/api/common/upload_file`;
      let filedata = new FormData();
      dealImage(files[filesIndex], 500, useImg);
      function useImg(base64) {
        filedata.append('file', base64toFile(base64));
        let request = new Request(apirul, {
          method: 'POST',
          credentials: 'include',
          body: filedata
        });
        fetch(request).then(response => {
          response.json().then(async data => {
            if (data.code === 0) {
              setFilesIndex(filesIndex + 1);
              setImgfileId([...imgfileId, data.data]);
            } else {
              Toast.success(data.msg, 3);
            }
          });
        });
      }
    }
  };
  const complaintSelect = async () => {
    const res = await putOrderComplaintSelect();
    console.log(res);
    if (res.code === 0) {
      let dataList = [];
      res.data.forEach(element => {
        dataList.push({
          label: orderComplaint(element.name),
          value: element.name
        });
      });
      setSelectAppealList(dataList);
    } else {
      Toast.info(res.msg, 3);
    }
  };
  const orderComplaint = state => {
    let text = '';
    if (state === 'COMPLAIN_NO_RESPONSE') {
      text = formatMessage({ id: 'mc_otc_trading_complaint_one' });
    } else if (state === 'COMPLAIN_PAID_BUT_CANCEL_TIMEOUT') {
      text = formatMessage({ id: 'mc_otc_trading_complaint_two' });
    } else if (state === 'COMPLAIN_UNRECEIVED_PAYMENT') {
      text = formatMessage({ id: 'mc_otc_trading_complaint_four' });
    } else {
      text = formatMessage({ id: 'mc_otc_trading_complaint_three' });
    }
    return text;
  };
  const afterCloseHandle = country => {
    if (country.code) {
      setCurrentCountry(country);
    }

    setCountrySelectOpen(false);
  };

  const submitHandle = () => {
    validateFields(async (error, values) => {
      if (!error) {
        if (!complainId && !values.complainCategory) {
          Toast.info(formatMessage({ id: 'mc_otc_appeal_Toastreason' }), 3);
          return;
        }
        setLoading(true);
        let data = {
          annex: imgfileId.length === 0 ? undefined : JSON.stringify(imgfileId),
          complainCategory: values.complainCategory && values.complainCategory.length > 0 ? values.complainCategory : undefined,
          complainReason: values.complainReason,
          orderDealId: id,
          complainId: complainId ? complainId : undefined,
          phoneNum: `${values.phoneNum ? `+${currentCountry.mobileCode}${values.phoneNum}` : ''}`
        };
        if (complainId) {
          const res = await putAppealComment({ ...data, description: values.complainReason, complainReason: undefined });
          if (res.code === 0) {
            setRecordVisible(true);
            setFiles([]);
            setImgfileId([]);
            setFilesIndex(0);
            setLoading(false);
          } else {
            Toast.info(res.msg, 3);
            setLoading(false);
          }
        } else {
          const res = await putOrderAppeal(data);
          if (res.code === 0) {
            setRecordVisible(true);
            setFiles([]);
            setImgfileId([]);
            setFilesIndex(0);
            setLoading(false);
          } else {
            Toast.info(res.msg, 3);
            setLoading(false);
          }
        }
      }
    });
  };
  const complainReasonError = getFieldError('complainReason');
  return (
    <>
      <TopBar>{formatMessage({ id: 'otc.complaint.order' })}</TopBar>

      {recordVisible === true ? (
        <Record id={id} setRecordVisible={setRecordVisible} orderState={orderState} />
      ) : (
        <div className={styles.appealContent}>
          <div className={styles.headerPrompt}>
            <i className="iconfont    iconinfo-circle1" style={{ marginRight: 5 }}></i>
            {formatMessage({ id: 'mc_otc_appeal_prompt' })}
          </div>
          <div className={styles.appealFrom}>
            {!complainId && (
              <div className={styles.fromList}>
                <span className={styles.fromTitle}> {formatMessage({ id: 'mc_otc_appeal_reason' })}</span>

                <div className={styles.ListContent}>
                  <Picker
                    extra=" "
                    {...getFieldProps('complainCategory', {})}
                    data={selectAppealList}
                    cols={1}
                    okText={formatMessage({ id: 'common.sure' })}
                    dismissText={formatMessage({ id: 'common.cancel' })}
                  >
                    <List.Item arrow="horizontal"> {formatMessage({ id: 'mc_otc_appeal_reason_placeholder' })} </List.Item>
                  </Picker>
                </div>
              </div>
            )}

            <div className={styles.fromList}>
              <span className={styles.fromTitle}> {formatMessage({ id: 'mc_otc_appeal_bewrite' })} </span>
              <div className={styles.ListContent}>
                <TextareaItem
                  {...getFieldProps('complainReason', {
                    rules: [{ required: true, message: formatMessage({ id: 'otc.complaint.placeVal' }) }]
                  })}
                  placeholder={formatMessage({ id: 'otc.complaint.placeVal' })}
                  rows={5}
                  count={100}
                  style={{ fontSize: '14px' }}
                />
              </div>
            </div>
            <div className={styles.fromList}>
              <span className={styles.fromTitle}>
                {formatMessage({ id: 'mc_otc_appeal_prove' })}

                <p className={styles.titleTips}>{formatMessage({ id: 'mc_otc_appeal_prove_size' })}</p>
              </span>
              <div className={styles.ListContent}>
                <ImagePicker
                  files={files}
                  accept="image/*"
                  onChange={imgOnChange}
                  onImageClick={(index, fs) => console.log('点击查看', index, fs)}
                  selectable={files.length < 3}
                />
              </div>
            </div>
            <div className={styles.fromList}>
              <span className={styles.fromTitle}>{formatMessage({ id: 'container.The.phone' })}</span>
              <div className={styles.ListContent}>
                <InputItem
                  {...getFieldProps('phoneNum', {
                    rules: [
                      { required: false, message: formatMessage({ id: 'auth.validate.phone.require' }) },
                      { pattern: mobileReg, message: formatMessage({ id: 'common.validate.auth.mobile.error' }) }
                    ]
                  })}
                  type="tel"
                  placeholder={formatMessage({ id: 'mc_otc_appeal_phone_placeholder' })}
                >
                  <Flex onClick={() => setCountrySelectOpen(true)} className={styles.country}>
                    + {currentCountry.mobileCode}
                    <i className={classNames('iconfont', 'icondrop')}></i>
                  </Flex>
                  <CountrySelect open={countrySelectOpen} afterCloseHandle={afterCloseHandle} />
                </InputItem>
              </div>
            </div>
          </div>
          <div className={styles.formBtn}>
            <Button
              type="primary"
              loading={loading}
              onClick={submitHandle}
              disabled={(!complainId && imgfileId.length === 0) || complainReasonError || loading === true ? true : false}
            >
              {formatMessage({ id: 'common.submit' })}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function mapStateToProps({ trading, auth, global }) {
  return {
    markets: trading.markets,
    user: auth.user,
    defaultCountry: global.defaultCountry,
    countryList: global.countryList
  };
}

export default connect(mapStateToProps)(createForm()(Container));
