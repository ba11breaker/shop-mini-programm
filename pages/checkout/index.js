// pages/checkout/index.js
const app = getApp()
const helpers = require("./../..//utils/index");
const util = require("./../..//utils/util")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    customerInfo: [],
    checkoutList: [],
    colors: {},
    userInfo: {},

    isLoggedIn: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
  
  },

  onShow: function() {
    this.setCheckoutList();
    this.setData({
      customerInfo: app.globalData.customerInfo,
      colors: JSON.parse(app.globalData.colors),
      isLoggedIn: helpers.auth.isLoggedIn(),
    });
  },

  onClickLogin: function(e) {
    helpers.auth.getLogin();
  },

  onClickGo: function(e){
    if(!this.data.isLoggedIn)
      helpers.auth.getLogin();
  },

  onClickAddress: function(e) {
    wx.navigateTo({
      url: '/pages/tools/address',
    })
  },

  // 获取和设置checkoutList
  async setCheckoutList(){
    let checkoutList = [];
    try{
      const cart = await helpers.storage.get('cart');
      for(var i = 0; i < cart.length; i++) {
        const goodInfo = await this.httpGood(cart[i][0]);
        checkoutList.push({
          good: util.parseGood(goodInfo.data.detail[0]),
          qty: cart[i][1]
        })
      }
      helpers.storage.set(checkoutList, 'checkoutList');
      this.setData({
        checkoutList: checkoutList
      })
    } catch(err) {
      console.error(err);
    }
  },

  // 访问商品最新数据
  httpGood(goodID){
    const vm = this;
    return new Promise((res, rej) => {
      try{
        wx.request({
          method: 'get',
          url: `${app.globalData.apiBaseUrl}/public/shop/stockLinkage/${goodID}`,
          header: {
            from: `https://easyqshop.com/${app.globalData.domain}/order`,
            authorization: `Bearer ${app.globalData.token}`,
            'x-api-key': app.globalData.master_code
          },
          success({ data, statusCode }) {
            if (statusCode != 200) {
              rej({ data, statusCode })
            }
            res({ data, statusCode })
          },
          fail(err) {
            rej(err);
          }
        });
      } catch(err) {
        console.error(err);
      }
    })
  }
})