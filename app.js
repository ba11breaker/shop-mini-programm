//app.js
const _stroage = require('./utils/common/storage.js');
const { auth, storage } = require('./utils/index');
const env = require("./environment");

App({
  globalData: {
    isConnected: true,
    launchOption: undefined,

    domain: '',
    master_code: '',
    themes: [],
    entity: {},
    delivery_types: {},
    box_types: {},
    count: 0,
    brands: [],
    currentRate: 4.7345352345,

    colors: [],

    blogtypes: [],
    stock: [],

    cart: new Map(),
    checkoutList: [], 
    customerInfo : [],

    userInfo: {},
    token: '',
    refreshToken: '',
    apiBaseUrl: env.BACKEND_URL,
    imagesApiBaseUrl: env.USER_IMAGES_URL,
    imagesApiAWSUrl: env.RESOURCES_IMAGES_URL,
    appid: env.APP_ID

  },
  onLaunch: async function (options) {
    if (options.query.domain) await storage.set(options.query.domain, 'domain');
    auth.checkLogin();
  },
  goInitPage: function(){
    setTimeout(function(){
      wx.redirectTo({
        url:"/pages/init/index"
      })
    }, 500)
  },
  /*
  ** 访问master_code等后端数据
  */
  http(options) {
    const vm = this;
    return new Promise((res, rej) => {
      wx.request({
        ...options,
        /*header: {
          authorization: `Bearer ${vm.globalData.token}`
        },*/
        success({ data, statusCode }) {
          if (statusCode !== 200) {
            wx.showToast({
              title: '商城码错误',
              icon: 'none'
            })
            rej({ data, statusCode })
          }
          res({ data, statusCode });
        },
        fail(err) {
          wx.showToast({
            title: '传输失败',
            icon: 'none'
          })
          rej(err);
        }
      })
    });
  },
  /*
  ** 访问themes
  */
  httpThemes(options){
    const vm = this;
    return new Promise((res, rej) => {
      wx.request({
        ...options,
        /*header: {
          authorization: `Bearer ${vm.globalData.token}`
        },*/
        success({ data, statusCode }) {
          if (statusCode !== 200) {
            rej({ data, statusCode })
          }
          vm.themes = { data, statusCode }.data.detail;
          console.log(vm.themes);
          res({ data, statusCode });
        },
        fail(err) {
          rej(err);
        }
      })
    });
  },

  uoloadFile(options) {
    const vm = this;
    return new Promise((res, rej) => {
      wx.uploadFile({
        ...options,
        header: {
          authorization: `Bearer ${vm.globalData.token}`
        },
        success({ data, statusCode }) {
          if (statusCode !== 200) {
            wx.showToast({
              title: '传输失败',
              icon: 'none'
            })
            rej({ data, statusCode })
          }
          res({ data, statusCode })
        },
        fail(err) {
          wx.showToast({
            title: '传输失败',
            icon: 'none'
          })
          rej(err);
        }
      })
    })
  },
  //获取即时汇率
  getCurrentRate(){
    return new Promise((res, rej) => {
      wx.request({
        method: 'get',
        url: 'https://superpay.v1.qpanda.com.au/superpay/current-rate',
        success({ data, statusCode }) {
          if (statusCode !== 200) {
            rej({ data, statusCode })
          }
          res({ data, statusCode });
        },
        fail(err) {
          rej(err);
        }
      });
    });
  },
})