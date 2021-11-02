import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { gotoPreviousPage, getCookie } from '@/utils';
import { formatMessage, getLocale } from 'umi-plugin-locale';
const language = getLocale();
const AuthComponent = ({ children, user, route, location, ...props }) => {
  const uid = user.id;
  const cookieUid = getCookie('u_id');
  const authorized = route.authorized;

  const authedNotNeedAuth = (uid || cookieUid) && authorized === 'no-auth';
  const needAuth = !uid && !cookieUid && authorized === 'auth';

  useEffect(() => {
    if (authedNotNeedAuth) {
      if (location.query.redirect) {
        gotoPreviousPage({ location, ...props });
      } else {
        router.replace('/');
      }
    }
    if (needAuth) {
      const { pathname, search } = location;
      const redirect = encodeURIComponent(pathname + (search || ''));
      router.push(`/auth/signin?redirect=${redirect}&lang=${language}`);
    }
  }, [authedNotNeedAuth, needAuth]);

  return <>{authedNotNeedAuth || needAuth ? null : children}</>;
};

export default connect(({ auth, global }) => ({
  user: auth.user,
  initialHistoryLength: global.initialHistoryLength
}))(AuthComponent);
