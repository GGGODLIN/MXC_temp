import styles from './index.less';

const PricePercent = props => {
  const { value, className, ...rest } = props;
  const _value = Number(value);
  const cls = _value > 0 ? styles.pos : _value < 0 ? styles.neg : '';
  const text = `${_value > 0 ? '+' : ''}${(_value * 100).toFixed(2)}%`;
  return (
    <span className={cls} {...rest}>
      {text}
    </span>
  );
};

export default PricePercent;
