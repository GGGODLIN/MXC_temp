export const passwordReg = {
  base: /^[^\u4E00-\u9FA5\s]+$/, // 非中文
  length: /^[^\u4E00-\u9FA5\s]{10,128}$/, // 密码10-128位
  strong: /(?=.*[a-z])(?=.*\d)[a-z\d]/, // 密码强度，至少一位数字和一位小写英文字符
  strong2: /[A-Z]|[^A-Za-z\d]/ // 密码强度，至少一位大写字母或者特殊字符，非字母和数字就算特殊字符
};

export const emailReg = /^[\\.a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/; // 邮箱地址

export const mobileReg = /^\d{4,18}$/; // 手机号码4-18位数字

export const codeCaptchaReg = /^\d{6}$/; // 手机验证码、邮箱验证码、谷歌验证码，6位数字

// ip白名单地址验证
export const ipWhiteListReg = /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)(,((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)){0,3},?$|^.{0}$/;

export const positiveIntegerReg = /^[1-9]+\d*$/; // 自然数0、1、2、3、...

export const phishingCodeReg = /^[\u4E00-\u9FA5A-Za-z0-9_]{1,6}$/;

export const passwordLevelReg = {
  // low: /^(.{0,7}|[^0-9]*|[^A-Z]*|[^a-z]*|[a-zA-Z0-9]*)$/,
  middle: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
  high: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&_\-~])[A-Za-z\d$@$!%*#?&_\-~]{8,}$/
};
