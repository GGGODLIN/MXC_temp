export const supportedResolutions = {
  '1min': '1',
  '5min': '5',
  '15min': '15',
  '30min': '30',
  '1hour': '60',
  '4hour': '240',
  '8hour': '480',
  '1day': '1D',
  '1week': '1W',
  '1month': '1M'
};

export const apiIntervalMap = {
  '1': 'Min1',
  '5': 'Min5',
  '15': 'Min15',
  '30': 'Min30',
  '60': 'Min60',
  '240': 'Hour4',
  '480': 'Hour8',
  D: 'Day1',
  '1D': 'Day1',
  W: 'Week1',
  '1W': 'Week1',
  M: 'Month1',
  '1M': 'Month1'
};

export const etfIndexSupportedResolutions = {
  '1min': '1',
  '1hour': '60',
  '4hour': '240',
  '1day': '1D'
};

export const etfIndexApiIntervalMap = {
  '1': 'MINUTES',
  '60': 'HOURS',
  '240': 'FOURHOURS',
  '1D': 'DAYS'
};
