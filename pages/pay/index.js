// pages/pay/index.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    colors: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      colors: JSON.parse(app.globalData.colors),
    })
  },
})