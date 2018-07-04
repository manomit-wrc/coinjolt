'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
  //   return queryInterface.bulkInsert('currencies', [{
  //     currency_id: 'BTC',
  //     alt_name: 'btc',
  //     display_name: 'Bitcoin'
  //   },
  //   {
  //     currency_id: 'ETH',
  //     alt_name: 'eth',
  //     display_name: 'Ethereum'
  //   },
  //   {
  //     currency_id: 'LTC',
  //     alt_name: 'ltc',
  //     display_name: 'Litecoin'
  //   },
  //   {
  //     currency_id: 'XRP',
  //     alt_name: 'xrp',
  //     display_name: 'Ripple'
  //   },
  //   {
  //     currency_id: 'BCH',
  //     alt_name: 'bch',
  //     display_name: 'Bitcoin Cash'
  //   },
  //   {
  //     currency_id: 'ADA',
  //     alt_name: 'ada',
  //     display_name: 'Cardano'
  //   },
  //   {
  //     currency_id: 'NEO',
  //     alt_name: 'neo',
  //     display_name: 'NEO'
  //   },
  //   {
  //     currency_id: 'XLM',
  //     alt_name: 'xlm',
  //     display_name: 'Stellar'
  //   },
  //   {
  //     currency_id: 'EOS',
  //     alt_name: 'eos',
  //     display_name: 'EOS'
  //   },
  //   {
  //     currency_id: 'IOT',
  //     alt_name: 'iota',
  //     display_name: 'IOTA'
  //   },
  //   {
  //     currency_id: 'DASH',
  //     alt_name: 'dash',
  //     display_name: 'Dash'
  //   },
  //   {
  //     currency_id: 'XMR',
  //     alt_name: 'xmr',
  //     display_name: 'Monero'
  //   },
  //   {
  //     currency_id: 'XEM',
  //     alt_name: 'xem',
  //     display_name: 'NEM'
  //   },
  //   {
  //     currency_id: 'LSK',
  //     alt_name: 'lsk',
  //     display_name: 'Lisk'
  //   },
  //   {
  //     currency_id: 'TRX',
  //     alt_name: 'trx',
  //     display_name: 'Tron'
  //   },
  //   {
  //     currency_id: 'VEN',
  //     alt_name: 'ven',
  //     display_name: 'VeChain'
  //   },
  //   {
  //     currency_id: 'QTUM',
  //     alt_name: 'qtum',
  //     display_name: 'Qtum'
  //   },
  //   {
  //     currency_id: 'USDT',
  //     alt_name: 'usdt',
  //     display_name: 'Tether'
  //   },
  //   {
  //     currency_id: 'ICX',
  //     alt_name: 'icx',
  //     display_name: 'ICON'
  //   },
  //   {
  //     currency_id: 'OMG',
  //     alt_name: 'omg',
  //     display_name: 'OmiseGO'
  //   },
  //   {
  //     currency_id: 'ZEC',
  //     alt_name: 'zec',
  //     display_name: 'Zcash'
  //   },
  //   {
  //     currency_id: 'XVG',
  //     alt_name: 'xvg',
  //     display_name: 'Verge'
  //   },
  //   {
  //     currency_id: 'STEEM',
  //     alt_name: 'steem',
  //     display_name: 'Steem'
  //   },
  //   {
  //     currency_id: 'PPT',
  //     alt_name: 'ppt',
  //     display_name: 'Populous'
  //   },
  //   {
  //     currency_id: 'SC',
  //     alt_name: 'sc',
  //     display_name: 'Siacoin'
  //   },
  //   {
  //     currency_id: 'STRAT',
  //     alt_name: 'strat',
  //     display_name: 'Stratis'
  //   },
  //   {
  //     currency_id: 'RHOC',
  //     alt_name: 'rhoc',
  //     display_name: 'RChain'
  //   },
  //   {
  //     currency_id: 'WAVES',
  //     alt_name: 'waves',
  //     display_name: 'Waves'
  //   },
  //   {
  //     currency_id: 'SNT',
  //     alt_name: 'snt',
  //     display_name: 'Status'
  //   },
  //   {
  //     currency_id: 'DOGE',
  //     alt_name: 'doge',
  //     display_name: 'Dogecoin'
  //   },
  //   {
  //     currency_id: 'BTS',
  //     alt_name: 'bts',
  //     display_name: 'BitShares'
  //   },
  //   {
  //     currency_id: 'MKR',
  //     alt_name: 'mkr',
  //     display_name: 'Maker'
  //   },
  //   {
  //     currency_id: 'ZCL',
  //     alt_name: 'zcl',
  //     display_name: 'ZClassic'
  //   },
  //   {
  //     currency_id: 'AE',
  //     alt_name: 'ae',
  //     display_name: 'Aeternity'
  //   },
  //   {
  //     currency_id: 'DGD',
  //     alt_name: 'dgd',
  //     display_name: 'DigixDAO'
  //   },
  //   {
  //     currency_id: 'ZRX',
  //     alt_name: 'zrx',
  //     display_name: '0x'
  //   },
  //   {
  //     currency_id: 'REP',
  //     alt_name: 'rep',
  //     display_name: 'Augur'
  //   },
  //   {
  //     currency_id: 'DCR',
  //     alt_name: 'dcr',
  //     display_name: 'Decred'
  //   },
  //   {
  //     currency_id: 'VERI',
  //     alt_name: 'veri',
  //     display_name: 'Veritaseum'
  //   },
  //   {
  //     currency_id: 'HSR',
  //     alt_name: 'hsr',
  //     display_name: 'Hshare'
  //   },
  //   {
  //     currency_id: 'ETN',
  //     alt_name: 'etn',
  //     display_name: 'Electroneum'
  //   },
  //   {
  //     currency_id: 'KMD',
  //     alt_name: 'kmd',
  //     display_name: 'Komodo'
  //   },
  //   {
  //     currency_id: 'ARDR',
  //     alt_name: 'ardr',
  //     display_name: 'Ardor'
  //   },
  //   {
  //     currency_id: 'ARK',
  //     alt_name: 'ark',
  //     display_name: 'Ark'
  //   },
  //   {
  //     currency_id: 'GAS',
  //     alt_name: 'gas',
  //     display_name: 'Gas'
  //   }
  // ], {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
  }
};
