const numberMap = {
  1: '一',
  2: '二',
  3: '三',
  4: '四',
  5: '五',
  6: '六',
  7: '七',
  8: '八',
  9: '九',
  10: '十'
};

// 暂时只支持小于100期
function numberToChinese(number) {
  if (!number) {
    return '';
  }

  if (number <= 10) {
    return numberMap[number] || '';
  }

  let numberString = number.toString();
  let numberArray = numberString.split('');

  if (numberArray.length === 2) {
    return number < 20
      ? numberMap[10] + (numberMap[numberArray[1]] || '')
      : numberMap[numberArray[0]] + numberMap[10] + (numberMap[numberArray[1]] || '');
  }
}

export default numberToChinese;
