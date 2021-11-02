import React, { useState } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import cs from 'classnames';
import {
  WingBlank,
  WhiteSpace,
  Button,
  Switch,
  Modal,
  Drawer,
  Card,
  List,
  Toast,
  Popover,
  InputItem,
  Icon,
  DatePicker,
  Picker,
  Radio,
  Tabs,
  SearchBar
  // Slider
} from 'antd-mobile';
import { getLocale, setLocale, formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import Empty from '@/components/Empty';
import langMap from '@/utils/lang';
import Slider from 'rc-slider';

const RcSlider = Slider.createSliderWithTooltip(Slider);

const lang = getLocale();

const Item = List.Item;

const Test = ({ theme, dispatch }) => {
  const [switchState, setSwitchState] = useState(false);
  const [modal2Visible, setModal2Visible] = useState(false);
  const closeModal2 = () => setModal2Visible(false);
  const [modal3Visible, setModal3Visible] = useState(false);
  const closeModal3 = () => setModal3Visible(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerOpenRight, setDrawerOpenRight] = useState(false);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [date, setDate] = useState(new Date());

  const [colorValue, setColorValue] = useState(['#00FF00']);

  const [sliderValue, setSliderValue] = useState(44);

  const colorStyle = {
    display: 'inline-block',
    verticalAlign: 'middle',
    width: '16px',
    height: '16px',
    marginRight: '10px'
  };
  const colors = [
    {
      label: (
        <div>
          <span style={{ ...colorStyle, backgroundColor: '#FF0000' }} />
          <span>红色</span>
        </div>
      ),
      value: '#FF0000',
      key: '1'
    },
    {
      label: (
        <div>
          <span style={{ ...colorStyle, backgroundColor: '#00FF00' }} />
          <span>绿色</span>
        </div>
      ),
      value: '#00FF00',
      key: '2'
    },
    {
      label: (
        <div>
          <span style={{ ...colorStyle, backgroundColor: '#0000FF' }} />
          <span>蓝色</span>
        </div>
      ),
      value: '#0000FF',
      key: '3'
    }
  ];

  const changeLang = locale => {
    if (locale !== lang) {
      setLocale(locale);
    }
  };

  const myTabs = [{ title: 'EOS', sub: 'EOS' }, { title: 'BTC', sub: 'BTC' }, { title: 'ETH', sub: 'ETH' }, { title: 'ETC', sub: 'ETC' }];

  return (
    <>
      <TopBar extra={<i className="iconfont iconic_vector_gradienttabstrip_transaction_normal" onClick={() => setDrawerOpen(true)}></i>}>
        Test components
      </TopBar>
      <WingBlank>
        <p>Switch</p>
        <Switch
          style={{ marginRight: 10 }}
          checked={theme === 'dark'}
          onChange={val => {
            dispatch({
              type: 'setting/changeSetting',
              payload: {
                theme: val ? 'dark' : 'light'
              }
            });
          }}
        />
        黑色主题
        <WhiteSpace />
        <Switch
          style={{ marginRight: 10 }}
          checked={switchState}
          onChange={val => {
            setSwitchState(val);
          }}
        />
        默认未选中
        <WhiteSpace />
        <p>单选(国际化示例)</p>
        <div>
          <span>{formatMessage({ id: 'header.financing' })}</span>
        </div>
        <WhiteSpace />
        <List renderHeader={() => '选择语言'}>
          {Object.entries(langMap).map(([prop, value]) => (
            <Radio.RadioItem key={prop} checked={prop === lang} onChange={() => changeLang(prop)}>
              {value.label}
            </Radio.RadioItem>
          ))}
        </List>
        <WhiteSpace />
        <p>InputItem</p>
        <InputItem className="am-input-small" placeholder="small input" clear></InputItem>
        <WhiteSpace />
        <InputItem placeholder="with clear toggle" clear></InputItem>
        <WhiteSpace />
        <InputItem placeholder="with label">with label</InputItem>
        <WhiteSpace />
        <InputItem placeholder="with right extra node" extra={<i className={cs('iconfont', 'iconkejian')}></i>}></InputItem>
        <WhiteSpace />
        <InputItem className="am-search-input" placeholder="search" clear>
          <i className={cs('iconfont', 'iconsousuo')}></i>
        </InputItem>
        <WhiteSpace />
        <SearchBar placeholder="placeholder" />
        <WhiteSpace />
        <p>Button</p>
        <Button type="primary">primary</Button>
        <WhiteSpace />
        <Button type="primary" disabled>
          primary disabled
        </Button>
        <WhiteSpace />
        <Button type="warning">warning</Button>
        <WhiteSpace />
        <Button type="warning" disabled>
          warning disabled
        </Button>
        <WhiteSpace />
        <Button type="primary" inline style={{ marginRight: '4px' }}>
          inline primary
        </Button>
        <Button type="warning" inline>
          inline warning
        </Button>
        <WhiteSpace />
        <Button type="ghost">ghost</Button>
        <WhiteSpace />
        <Button type="ghost" inline>
          inline ghost
        </Button>
        <WhiteSpace />
        <Button type="primary" size="small" inline style={{ marginRight: '4px' }}>
          inline primary small
        </Button>
        <Button type="warning" size="small" inline>
          inline warning small
        </Button>
        <WhiteSpace />
        <Button type="primary" inline className={'am-button-circle'} style={{ marginRight: '4px' }}>
          inline primary circle
        </Button>
        <Button type="warning" inline className={'am-button-circle'}>
          inline warning circle
        </Button>
        <WhiteSpace />
        <Button type="primary" inline size="small" className={'am-button-circle'} style={{ marginRight: '4px' }}>
          inline primary circle
        </Button>
        <Button type="warning" inline size="small" className={'am-button-circle'}>
          inline warning circle
        </Button>
        <WhiteSpace />
        <p>Modal</p>
        <Button
          type="warning"
          onClick={() =>
            Modal.alert('Delete', 'Are you sure???', [
              { text: 'Cancel', onPress: () => console.log('cancel') },
              { text: 'Ok', onPress: () => console.log('ok') }
            ])
          }
        >
          confirm modal
        </Button>
        <WhiteSpace />
        <Button type="primary" onClick={() => setModal2Visible(true)}>
          custom modal
        </Button>
        <Modal transparent visible={modal2Visible} onClose={closeModal2} title="Title" footer={[{ text: 'Ok', onPress: closeModal2 }]}>
          <div>
            scoll content...
            <br />
            scoll content...
            <br />
          </div>
        </Modal>
        <WhiteSpace />
        <Button type="primary" onClick={() => setModal3Visible(true)}>
          modal from bottom
        </Button>
        <Modal popup animationType="slide-up" visible={modal3Visible} onClose={closeModal3}>
          <div>
            scoll content...
            <br />
            scoll content...
            <br />
            scoll content...
            <br />
            scoll content...
            <br />
            scoll content...
            <br />
            scoll content...
            <br />
            scoll content...
            <br />
            scoll content...
            <br />
          </div>
        </Modal>
        <WhiteSpace />
        <Button type="primary" onClick={() => setDrawerOpen(true)}>
          modal slide left
        </Button>
        <Modal
          className="am-modal-popup-slide-left"
          transitionName="am-slide-left"
          popup
          visible={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <div>
            scoll content...
            <br />
            scoll content...
            <br />
            scoll content...
            <br />
            scoll content...
            <br />
            scoll content...
            <br />
            scoll content...
            <br />
            scoll content...
            <br />
            scoll content...
            <br />
          </div>
        </Modal>
        <WhiteSpace />
        <Button type="primary" onClick={() => setDrawerOpenRight(true)}>
          modal slide right
        </Button>
        <Modal
          className="am-modal-popup-slide-right"
          transitionName="am-slide-right"
          popup
          visible={drawerOpenRight}
          onClose={() => setDrawerOpenRight(false)}
        >
          <div>
            scoll content...
            <br />
            scoll content...
            <br />
            scoll content...
            <br />
            scoll content...
            <br />
            scoll content...
            <br />
            scoll content...
            <br />
            scoll content...
            <br />
            scoll content...
            <br />
          </div>
        </Modal>
        <WhiteSpace />
        <p>Card</p>
        <Card>
          <div>
            <Empty />
          </div>
        </Card>
        <WhiteSpace />
        <p>List</p>
        <List>
          <Item key={1}>Title</Item>
          <Item key={2} platform={'android'} arrow="horizontal" onClick={() => {}}>
            Title
          </Item>
          <Item key={3} extra="extra content" arrow="horizontal" onClick={() => {}}>
            Title
          </Item>
          <Item key={4} extra="10:30" align="top" thumb="https://zos.alipayobjects.com/rmsportal/dNuvNrtqUztHCwM.png" multipleLine>
            Title
          </Item>
        </List>
        <WhiteSpace />
        <p>Other</p>
        <Button type="primary" inline style={{ marginRight: '4px' }} onClick={() => Toast.info('This is a toast tips !!!')}>
          Toast
        </Button>
        <Popover
          visible={popoverVisible}
          overlay={[
            <Item key="4" value="scan">
              Scan
            </Item>,
            <Item key="5" value="special" style={{ whiteSpace: 'nowrap' }}>
              My Qrcode
            </Item>,
            <Item key="6" value="button ct">
              <span>Help</span>
            </Item>
          ]}
          placement={'top'}
        >
          <Button type="warning" inline style={{ marginRight: '4px' }} onClick={() => setPopoverVisible(!popoverVisible)}>
            Popover
          </Button>
        </Popover>
        <WhiteSpace />
        <DatePicker mode="date" title="Select Date" extra="Optional" value={date} onChange={date => setDate(date)}>
          <Item key="2" arrow="horizontal">
            Date
          </Item>
        </DatePicker>
        <WhiteSpace />
        <Picker data={colors} cols={1} value={colorValue} onChange={val => setColorValue(val)}>
          <Item key="2" arrow="horizontal">
            Single Select
          </Item>
        </Picker>
        <WhiteSpace />
        <p>Tabs</p>
        <Tabs tabs={myTabs} initialPage={'ETH'} tabBarBackgroundColor={'transparent'}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px' }}>Content of first tab</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px' }}>Content of second tab</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px' }}>Content of third tab</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px' }}>Content of fourth tab</div>
        </Tabs>
        <WhiteSpace />
        <p>Slider</p>
        <RcSlider
          value={sliderValue}
          marks={{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }}
          onChange={val => setSliderValue(val)}
        />
        <WhiteSpace />
        <Link to="/trade/spot">Trade</Link>
      </WingBlank>
    </>
  );
};

export default connect(({ setting, auth }) => ({
  theme: setting.theme,
  user: auth.user
}))(Test);
