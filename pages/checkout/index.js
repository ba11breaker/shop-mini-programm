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
    comment: "",

    cost: [0, 0],
    amount: 0,

    isLoggedIn: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
  
  },

  onShow: function() {
    this.setUserInfo();
    this.setCheckoutList();
    this.setData({
      customerInfo: app.globalData.customerInfo,
      colors: JSON.parse(app.globalData.colors),
      isLoggedIn: helpers.auth.isLoggedIn(),
    });
    this.setComment();
  },

  onUnload: async function() {
    try{
      await helpers.storage.remove("comment");
    }catch(err){
      console.error(err);
    }
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

  // 设置默认地址信息
  async setUserInfo(){
    const userInfo = await helpers.address.getDefault();
    this.setData({
      userInfo: userInfo
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
      this.setCost();
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
  },

  setCost(){
    const goods = this.data.checkoutList;
    let amount = 0;
    let cost = [0, 0];
    goods.forEach(element => {
      amount += element.qty;
      cost[0] += element.good.price[0] * element.qty;
    });
    cost[0] = Math.round(cost[0] * 100) / 100;
    cost[1] = Math.round(cost[0] * app.globalData.currentRate * 100) / 100;
    this.setData({
      amount: amount,
      cost: cost
    })
  },

  async setComment(){
    try{
      const comment = await helpers.storage.get("comment");
      this.setData({
        comment: comment
      })
    }catch(err){
      console.error(err);
    }
  },

  clickComment(e){
    wx.navigateTo({
      url: '/pages/checkout/comment',
    })
  },

  submit(){
    wx.navigateTo({
      url: '/pages/pay/index',
    })
  }
})