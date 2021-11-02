import React, { useState } from 'react';
import { connect } from 'dva';
import classNames from 'classnames';
import TopBar from '@/components/TopBar';
import { formatMessage } from 'umi-plugin-locale';
import Otc from './Otc';
import Contract from './Contract';
import Margin from './Margin';
import styles from './index.less';

const recordMaps = {
  otc: <Otc />,
  contract: <Contract />,
  margin: <Margin />
};

const Record = ({ dispatch, location }) => {
  const [type, setType] = useState(location.query.type || 'otc');

  return (
    <>
      <TopBar>
        <div className={styles.title}>
          <span className={classNames({ [styles.active]: type === 'otc' })} onClick={() => setType('otc')}>
            {formatMessage({ id: 'mc_assets_otc_transfer' })}
          </span>
          <span className={classNames({ [styles.active]: type === 'contract' })} onClick={() => setType('contract')}>
            {formatMessage({ id: 'mc_assets_contract_transfer' })}
          </span>
          <span className={classNames({ [styles.active]: type === 'margin' })} onClick={() => setType('margin')}>
            {formatMessage({ id: 'mc_assets_margin_transfer' })}
          </span>
        </div>
      </TopBar>
      {recordMaps[type]}
    </>
  );
};

export default connect(({ auth }) => ({
  user: auth.user
}))(Record);
