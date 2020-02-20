// pages/login/index.js
const helpers = require("./../../utils/index");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: "04",
    password: "",
    hideWxSign: true,
    hideWxSignPhone: true,
    signInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (helpers.auth.isLoggedIn())
      wx.navigateBack();
  },

  updatePhone(e){
    this.setData({
      phone: e.detail.value
    })
  },

  updatePassword(e) {
    this.setData({
      password: e.detail.value
    })
  },
  async login() {
    try{
      await helpers.auth.login( this.data );
      wx.navigateBack();
    } catch (error) {
      console.error(error);
    }
  },
  wechatLogin() {
    const that = this;
    wx.login({
      async success({ code, errMsg }) {
        if (errMsg !== 'login:ok')
          return helpers.toast.showToast("微信授权失败,请检查设置。", "none");

        const wechatMsg = await helpers.auth.wechatLogin(code);
        if (wechatMsg.data.detail == "User Not Found.") {
          that.setData({
            hideWxSign: false
          });
        }
      },
      fail() {
        return helpers.toast.showToast("微信授权失败,请检查设置。", "none");
      }
    })
  },

  notSign(){
    wx.navigateBack();
  },

  getSign(){
    const that = this;
    wx.getUserInfo({
      success: (res) => {
        console.log(res);
        that.setData({
          signInfo: JSON.parse(res.rawData),
          hideWxSign: true,
          hideWxSignPhone: false,
        })
      },
      fail: (err) => {
        console.error(err);
      }
    })
  },

  getPhone(){
    const that = this;
    // 开始提交userInfo到后端
    try{
      wx.login({
        async success({ code, errMsg }) {
          if (errMsg !== 'login:ok')
            return helpers.toast.showToast("微信授权失败,请检查设置。", "none");

          const wechatMsg = await helpers.auth.wechatSign({
            phone: that.data.phone,
            name: that.data.signInfo.nickName,
            avarta: that.data.signInfo.avatarUrl,
            js_code: code
          });
        },
        fail() {
          return helpers.toast.showToast("微信授权失败,请检查设置。", "none");
        }
      })
    } catch(err) {
      console.error(err)
    }
  }
})