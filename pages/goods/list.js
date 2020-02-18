// pages/goods/list.js
const app = getApp();
const util = require('../../utils/util.js')
const _cart = require('../../utils/cart.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    brand: "",
    goods: [],
    scrolltop : 0,

    colors: [],
    sortedBy: "default", //"default", "price", "time"
    sortedByPrice: false,
    sortedByTime: false,

    currentRate: 4.723454
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    this.setData(options.brand)
    let brand = options.brand;
    let colors = JSON.parse(app.globalData.colors);
    this.setData({
      brand: brand,
      colors: colors
    });
    wx.setNavigationBarTitle({
      title: brand
    });
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 5 * 1000
    });
    brand = encodeURIComponent(brand);
    const goodsInfo = await app.http({
      method: 'get',
      url: `${app.globalData.apiBaseUrl}/public/shop/brands/${brand}`,
      header: {
        from: `https://easyqshop.com/${app.globalData.domain}/list?brand=${brand}`,
        authorization: `Bearer ${app.globalData.token}`,
        'x-api-key': app.globalData.master_code
      }
    });
    // let rateInfo = await app.getCurrentRate();  //获取汇率信息
    // let currentRate = parseFloat(rateInfo.data.detail.rate);

    let goodInfo = goodsInfo.data.detail;
    let goods = [];
    for(var i = 0; i < goodInfo.length; i++){
      goods.push(util.parseGood(goodInfo[i]));
    }
    this.setData({
      goods: goods,
      // currentRate: currentRate
    });
    wx.hideToast();
  },

  onClickDefault: function(e){
    this.setData({
      sortedBy: "default",
      sortedByTime: false,
      sortedByPrice: false
    });
    this.sortGoods();
  },

  onClickPrice: function(e){
    this.setData({
      sortedBy: "price",
      sortedByPrice: !e.currentTarget.dataset.id,
      sortedByTime: false
    });
    this.sortGoods();
  },

  onClickTime: function(e){
    this.setData({
      sortedBy: "time",
      sortedByPrice: false,
      sortedByTime: !e.currentTarget.dataset.id
    });
    this.sortGoods();
  },

  sortGoods(){
    const that = this;
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 5 * 1000
    });
    let goods = that.data.goods;
    if(that.data.sortedBy === "default") {
      goods.sort(function(a, b){
        return a.id - b.id;
      });
    }else if(that.data.sortedBy === "price") {
      if(that.data.sortedByPrice){
        goods.sort(function (a, b) {
          return a.price[0] - b.price[0];
        });
      } else {
        goods.sort(function (a, b) {
          return b.price[0] - a.price[0];
        });
      }
    }else if(that.data.sortedBy === "time"){
      if(that.data.sortedByTime) {
        goods.sort(function (a, b) {
          return b.id - a.id;
        });
      } else {
        goods.sort(function (a, b) {
          return a.id - b.id;
        });
      }
    }
    that.setData({
      goods: goods
    });
    wx.hideToast();
  },

  onClickGood: function(e) {
    let goodID = e.target.dataset.id;
    wx.navigateTo({
      url: `/pages/goods-details/index?goodID=${goodID}`
    })
  },

  addCart: function (e) {
    let id = e.target.dataset.id;
    _cart.add(id);
    console.log(app.globalData.cart);
  }
})