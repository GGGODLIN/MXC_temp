import React from 'react';
import TopBar from '@/components/TopBar';
import { formatMessage } from 'umi-plugin-locale';

function Container({ children }) {
  return (
    <>
      <TopBar>{formatMessage({ id: 'swap.header.intro' })}</TopBar>
      {children}
    </>
  );
}

export default Container;
