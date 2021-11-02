import { useState, useEffect } from 'react';
import { getNewAsset } from '@/services/api';
import router from 'umi/router';
import IndexedList from '@/components/IndexedList';

const groupCoin = data => {
  const hash = {};

  for (const item of data) {
    const reg = /[A-Z]{1}/;
    const firstLetter = item.currency[0];
    const temp = { id: item.currency, name: item.currency, ...item };

    if (reg.test(firstLetter)) {
      if (hash[firstLetter]) {
        hash[firstLetter].push(temp);
      } else {
        hash[firstLetter] = [temp];
      }
    }
  }

  //按字母排序
  const sortIndexs = Object.keys(hash).sort();
  const sortObj = {};

  for (const item of sortIndexs) {
    sortObj[item] = hash[item];
  }

  return [sortObj, sortIndexs];
};

const Search = ({ location }) => {
  const [list, setList] = useState([]);
  const { type } = location.query;
  const filterList = list;
  const [data, sortIndexs] = groupCoin(filterList);

  useEffect(() => {
    const fetch = async () => {
      const res = await getNewAsset('spot');
      const { code, data } = res;
      if (code === 200) {
        const _list = data.assets;
        setList(_list);
      }
    };
    fetch();
  }, []);

  const onCancel = e => {
    if (type === 'address') {
      router.push('/ucenter/setting');
    } else {
      router.push('/uassets/overview');
    }
  };

  const toTrade = currency => {
    if (type === 'recharge') {
      router.push(`/uassets/deposit?currency=${currency}`);
    } else if (type === 'withdraw') {
      router.push(`/uassets/withdraw?currency=${currency}`);
    } else {
      router.push(`/uassets/withdraw-address?currency=${currency}`);
    }
  };

  return (
    <IndexedList
      type={type}
      categoryData={data}
      sortIndexs={sortIndexs}
      originData={filterList}
      onClickRowHandle={toTrade}
      onClickCancel={onCancel}
    />
  );
};

export default Search;
