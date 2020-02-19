// pages/checkout/index.js
const app = getApp()
const _login = require("../../utils/common/login.js") 

Page({

  /**
   * 页面的初始数据
   */
  data: {
    customerInfo: [],
    checkoutList: [],
    colors: {},
    userInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      customerInfo: app.globalData.customerInfo,
      checkoutList: app.globalData.checkoutList,
      colors: JSON.parse(app.globalData.colors)
    })
  },

  onClickLogin: function(e) {
    _login.login();
  }
})