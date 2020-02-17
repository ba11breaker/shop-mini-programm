// pages/goods-details/index.js
const WxParse = require('../../wxParse/wxParse.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodID: '',
    goodInfo: {},
    selectedPrice: 0,

    images: [],

    colors: [],

    showSelected: 'introduct', //'introduct', 'prarmter', 'aftersale'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    const that = this;
    let goodID = options.goodID;
    let colors = JSON.parse(app.globalData.colors);
    this.setData({
      goodID: goodID,
      colors: colors
    });
    wx.setNavigationBarTitle({
      title: '商品详情',
    })
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 5 * 1000
    });
    const goodPac = await app.http({
      method: 'get',
      url: `${app.globalData.apiBaseUrl}/public/shop/stockLinkage/${goodID}`,
      header: {
        from: `https://easyqshop.com/${app.globalData.domain}/product-detail/${goodID}`,
        authorization: `Bearer ${app.globalData.token}`,
        'x-api-key': app.globalData.master_code
      }
    });
    let goodInfo = goodPac.data.detail[0];
    this.setData({
      goodInfo: goodInfo
    });
    this.getImages();
    this.getPrice();
    WxParse.wxParse('article', 'html', goodInfo.content, that, 5);

    wx.hideToast();
  },

  getImages() {
    const that = this;
    let images = JSON.parse(that.data.goodInfo.images);
    let imagesURL = [];
    for (var i = 0; i < images.length; i++) {
      imagesURL.push(`${app.globalData.imagesApiAWSUrl}/${images[i].url}`);
    }
    that.setData({
      images: imagesURL
    });
  },

  getPrice(){
    const that = this;
    let price = that.data.goodInfo.price;
    price = Math.round(price * 100) / 100;
    that.setData({
      selectedPrice: price
    });
  },

  onClickIntro: function(e) {
    this.setData({
      showSelected: 'introduct'
    });
  },

  onClickPara: function(e) {
    this.setData({
      showSelected: 'parameter'
    });
  },

  onClickAfter: function(e) {
    this.setData({
      showSelected: 'aftersale'
    });
  },

  onClickReturnCat: function(e){
    wx.switchTab({
      url: '/pages/categories/categories',
    })
  },

  addCart: function(e) {
    const that = this;
    let cart = app.globalData.cart;
    let goodID = parseInt(that.data.goodID)
    if(!cart.has(goodID)) {
      cart.set(goodID, 1);
    } else {
      let preCount = cart.get(goodID);
      preCount++;
      cart.set(goodID, preCount);
    }
    app.globalData.cart = cart;
    console.log(app.globalData.cart);
    wx.showToast({
      title: '添加成功',
      icon: 'success',
      duration: 700
    });
  }
})