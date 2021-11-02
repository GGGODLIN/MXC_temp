import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import classNames from 'classnames';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import { createForm } from 'rc-form';
import GoogleAuthToggle from '../google-auth-toggle';

function GoogleAuthUnbind() {
  return (
    <div>
      <GoogleAuthToggle type="unbind" />
    </div>
  );
}

export default connect(({ auth }) => ({
  user: auth.user
}))(createForm()(GoogleAuthUnbind));
