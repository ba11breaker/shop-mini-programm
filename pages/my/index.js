// pages/my/index.js
const app = getApp();
const helpers = require("./../../utils/index");
const _cart = require("./../../utils/cart");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    colors: {},
    isLoggedIn: false,
    userInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 显示购物车红点
    _cart.updateBadge();
    this.setData({
      colors: JSON.parse(app.globalData.colors),
      isLoggedIn: helpers.auth.isLoggedIn()
    });
    if(this.data.isLoggedIn){
      this.getUserInfo();
    }
  },

  onClickLog: function(e) {
    helpers.auth.getLogin();
  },

  async getUserInfo(){
    this.setData({
      userInfo: await helpers.storage.get('user')
    })
  },

  // 退出登录状态
  async quitLog(e){
    try{
      await helpers.auth.logOut();
      this.setData({
        userInfo: {},
        isLoggedIn: helpers.auth.isLoggedIn()
      });
    }catch(err){
      console.error(err);
    }
  }
})