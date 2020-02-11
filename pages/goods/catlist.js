// pages/goods/catlist.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cat: [],
    brands: {},
    brandsActive: [],
    goods: [],

    colors: [],
    sortedBy: "default", //"default", "price", "time"
    sortedByPrice: false,
    sortedByTime: false,

    currentRate: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    wx.setNavigationBarTitle({
      title: options.cat
    });
    let cat = options.cat.split(",");
    let colors = JSON.parse(app.globalData.colors);
    this.setData({
      cat: cat,
      colors: colors
    });
    console.log(cat);
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 5 * 1000
    });
    var key = encodeURIComponent(cat[1]);
    var _key = encodeURIComponent(cat[0]);
    const goodsInfo = await app.http({
      method: 'get',
      url: `${app.globalData.apiBaseUrl}/public/shop/search?cat=${key}`,
      header: {
        from: `https://easyqshop.com/${app.globalData.domain}/list?cat=${_key},${key}`,
        authorization: `Bearer ${app.globalData.token}`,
        'x-api-key': app.globalData.master_code
      }
    });

    let rateInfo = await app.getCurrentRate();  //获取汇率信息
    let currentRate = parseFloat(rateInfo.data.detail.rate);

    let goodInfo = goodsInfo.data.detail;
    let goods = [];
    let brands = new Map();
    let brandsActive = [];
    for (var i = 0; i < goodInfo.length; i++) {
      let images = JSON.parse(goodInfo[i].images);
      let imageURL = encodeURIComponent(images[0].url);
      goods.push({
        id: goodInfo[i].id,
        images: `${app.globalData.imagesApiAWSUrl}/${imageURL}`,
        price: [Math.round(goodInfo[i].price * 100) / 100, Math.round(goodInfo[i].price * currentRate * 100) / 100],
        name: goodInfo[i].name,
        brand: goodInfo[i].stock_brand,
        isShow: true
      })
      brands.set(goodInfo[i].stock_brand, true); 
    }
    brands = [...brands];
    for (var i = 0; i < brands.length; i++) {
      brandsActive.push(false);
    }
    this.setData({
      goods: goods,
      currentRate: currentRate,
      brands: brands,
      brandsActive: brandsActive
    });
    wx.hideToast();
  },

  onClickDefault: function (e) {
    this.setData({
      sortedBy: "default",
      sortedByTime: false,
      sortedByPrice: false
    });
    this.sortGoods();
  },

  onClickPrice: function (e) {
    this.setData({
      sortedBy: "price",
      sortedByPrice: !e.currentTarget.dataset.id,
      sortedByTime: false
    });
    this.sortGoods();
  },

  onClickTime: function (e) {
    this.setData({
      sortedBy: "time",
      sortedByPrice: false,
      sortedByTime: !e.currentTarget.dataset.id
    });
    this.sortGoods();
  },

  sortGoods() {
    const that = this;
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 5 * 1000
    });
    let goods = that.data.goods;
    if (that.data.sortedBy === "default") {
      goods.sort(function (a, b) {
        return a.id - b.id;
      });
    } else if (that.data.sortedBy === "price") {
      if (that.data.sortedByPrice) {
        goods.sort(function (a, b) {
          return a.price[0] - b.price[0];
        });
      } else {
        goods.sort(function (a, b) {
          return b.price[0] - a.price[0];
        });
      }
    } else if (that.data.sortedBy === "time") {
      if (that.data.sortedByTime) {
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

  onClickBrand: function(e){
    const that = this;
    let brandClick = e.target.dataset.id;
    let brands = that.data.brands;
    let brandsActive = that.data.brandsActive;
    let goods = that.data.goods;
    let flag = false;
    for (var i = 0; i < brands.length; i++) {
      if (brands[i][0] === brandClick) {
        brandsActive[i] = !brandsActive[i];
      }
      if (brandsActive[i]) {
        flag = true;
      }
    }
    for (var i = 0; i < brands.length; i++) {
      if(flag){
        brands[i][1] = brandsActive[i];
      }else{
        brands[i][1] = true;
      }
    }
    let brandsMap = new Map(brands);
    for (var i = 0; i < goods.length; i++) {
      goods[i].isShow = brandsMap.get(goods[i].brand);
    }
    that.setData({
      brands: brands,
      brandsActive: brandsActive,
      goods: goods
    });
  },

  onClickGood: function (e) {
    let goodID = e.target.dataset.id;
    wx.navigateTo({
      url: `/pages/goods-details/index?goodID=${goodID}`
    })
  },

  addCart: function (e) {
    const that = this;
    let cart = app.globalData.cart;
    let id = e.target.dataset.id;
    if (!cart.has(id)) {
      cart.set(id, 1);
    } else {
      let preCount = cart.get(id);
      preCount++;
      cart.set(id, preCount);
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