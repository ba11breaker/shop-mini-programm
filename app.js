//app.js
const _stroage = require('./utils/common/storage.js');

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
    currentRate: 0,

    colors: [],

    blogtypes: [],
    stock: [],

    cart: new Map(),
    checkoutList: [], 
    customerInfo : [],


    userInfo: {},
    token: '',
    refreshToken: '',
    apiBaseUrl: 'https://api.v1.qpanda.com.au',
    imagesApiBaseUrl: 'https://images.dev.v1.qpanda.com.au',
    imagesApiAWSUrl: 'https://qpanda-admin-images-dev.s3-ap-southeast-2.amazonaws.com',

  },
  onLaunch: function () {
    const that = this;
    // 检查登陆状态
    const userInfo = wx.getStorageSync('userInfo');
    if(userInfo){
      this.verifyToken(userInfo)
    }
    this.initCart();
  },
  async initCart(){
    
  },
  goInitPage: function(){
    setTimeout(function(){
      wx.redirectTo({
        url:"/pages/init/index"
      })
    }, 500)
  },
  verifyToken(userInfo) {
    wx.request({
      url: `${this.globalData.apiBaseUrl}/auth/refreshToken`,
      method: 'post',
      data: {
        token: userInfo.token,
        refreshToken: userInfo.refreshToken
      },
      success: ({ data: { detail } }) => {
        userInfo.token = detail.token;
        userInfo.refreshToken = detail.refreshToken;
        this.globalData.userInfo = userInfo;
        this.globalData.token = detail.token;
        this.globalData.refreshToken = detail.refreshToken;
        wx.setStorageSync('userInfo', userInfo);
        this.tokenVerified();
      },
      fail: (err) => {
        console.error(err);
        wx.removeStorage({
          key: 'userInfo'
        })
      }
    })
  },
  tokenVerified(){
    wx.reLaunch({
      url: '/pages/index/index',
    })
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