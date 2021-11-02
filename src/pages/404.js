import React from 'react';
import Link from 'umi/link';
import { formatMessage } from 'umi-plugin-locale';
import Exception from '@/components/Exception';

export default () => {
  return (
    <Exception
      type="404"
      linkElement={Link}
      desc={formatMessage({ id: 'common.404' })}
      backText={formatMessage({ id: 'invite.ucenter.back' })}
    />
  );
};
