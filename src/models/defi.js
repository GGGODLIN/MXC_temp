export default {
  namespace: 'defi',

  state: {
    defiCurrency: [
      'KNC',
      'ZRX',
      'KAVA',
      'NEST',
      'COMP',
      'LINK',
      'YFI',
      'PAMP',
      'PNK',
      'BAL',
      'BNT',
      'CEL',
      'DMG',
      'IDEX',
      'LEND',
      'MKR',
      'DAI',
      'DF',
      'OKS',
      'REN',
      'UMA',
      'OMG',
      'ALEPH',
      'AVA',
      'AWC',
      'BZRX',
      'CAMO',
      'CRO',
      'DEC',
      'DEXT',
      'IDX',
      'MLN',
      'REL',
      'RSR',
      'RUNE',
      'SGT',
      'SNX',
      'STONK',
      'PLT',
      'MTRG',
      'FOR',
      'CVP',
      'SUSHI',
      'YFV',
      'YAMV2',
      'BOR'
    ],
    polkaCurrency: ['DOT', 'KSM', 'EDG', 'PCX', 'RING', 'LINK', 'ANKR', 'CELR', 'OCEAN', 'ANKR', 'KTON', 'KLP', 'PHA'],
    polkaEtfCurrency: ['DOT3L', 'DOT3S', 'LINK3L', 'LINK3S', 'LINK3BULL', 'LINK3BEAR'],
    storageCurrency: ['STORJ', 'BLZ', 'GNX', 'LAMB', 'AR', 'MASS', 'BHD', 'BTT', 'FIL'],
    nftCurrency: ['PAINT', 'MANA', 'SAND', 'RARI', 'CWS', 'GHST', 'DEGO', 'ATTN', 'COCOS', 'FLOW'],
    grayCurrency: ['BTC', 'ETH', 'ETC', 'LTC', 'BCH', 'XRP', 'ZEC', 'ZEN', 'XLM'],
    rebaseCurrency: ['AMPL', 'BASE', 'YAMV3', 'BAC'],
    LayerEtfCurrency: [
      'SNX3L',
      'SNX3S',
      'OMG3L',
      'OMG3S',
      'OMG3L',
      'LRC3L',
      'LRC3S',
      'NEAR3L',
      'NEAR3S',
      'MATIC3L',
      'MATIC3S',
      'SKL3L',
      'SKL3S',
      'SOL3L',
      'SOL3S'
    ],
    LayerCurrency: ['SNX', 'SOL', 'OMG', 'LRC', 'NEAR', 'MATIC', 'LOOM', 'SKL'],
    bscCurrency: [
      'BURGER',
      'BLK',
      'XVS',
      'SFP',
      'SPARTA',
      'CAKE',
      'LONG',
      'HELMET',
      'JULD',
      'JULB',
      'HARD',
      'TAXI',
      'TWT1',
      'BAKE',
      'BNB',
      'AUCTION',
      'VENUS',
      'ALICE',
      'ALPACA',
      'BP',
      'BUNNY',
      'BLINK'
    ],
    hecoCurrency: ['BAGS', 'LHB', 'CIR', 'BAG', 'WHT', 'HPT', 'RICE', 'LAVA', 'MDX', 'CAN', 'FILDA'],
    webEtfCurrency: [
      'DOT5L',
      'FIL3L',
      'BAT3L',
      'GRT3L',
      'LIT3L',
      'BAND3L',
      'DOT3L',
      'DOT2L',
      'FIL3S',
      'BAT3S',
      'GRT3S',
      'LIT3S',
      'BAND3S',
      'DOT3S',
      'DOT2S'
    ],
    webCurrency: ['DOT', 'FIL', 'GRT', 'BAT', 'ANKR', 'CKB', 'OCEAN', 'CELR', 'LIT', 'PHA', 'MASK', 'RING'],
    metaverseZoneCurrency: ['AXS', 'MANA', 'ALICE', 'SAND', 'GHST'],
    metaverseZoneEtfCurrency: ['AXS', 'MANA', 'ALICE', 'SAND', 'TLM', 'SLP', 'GHST', 'ILV', 'OVR'],
    solanaZoneCurrency: ['SOL', 'RAY', 'SRM', 'ATLAS', 'POLIS'],
    solanaZoneEtfCurrency: [
      'SOL',
      'RAY',
      'SRM',
      'O3',
      'SLIM',
      'STEP',
      'OXY',
      'MAPS',
      'KIN',
      'ALEPH',
      'RAMP',
      'SBR',
      'SUNNY',
      'ATLAS',
      'POLIS',
      'LIKE',
      'CRP',
      'CYS'
    ],
    coinbaseZoneCurrency: ['LUNA', 'FTT', 'NEAR', 'GRT', 'UMA'],
    coinbaseZoneEtfCurrency: [
      'LUNA',
      'FTT',
      'NEAR',
      'AR',
      'MINA',
      'RSR',
      'DODO',
      'AUCTION',
      'RAD',
      'CQT',
      'INST',
      'RARI',
      'CTK',
      'NAOS',
      'PUSH',
      'COFI',
      'UNI',
      'GRT',
      'FLOW',
      'SNX',
      'UMA',
      'FEI',
      'GRT',
      'FLOW',
      'SNX',
      'UMA',
      'FEI',
      'KEEP',
      'RLY',
      'LDO',
      'CQT',
      'POND'
    ]
  },
  effects: {},

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    }
  }
};