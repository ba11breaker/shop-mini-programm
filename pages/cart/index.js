// pages/cart/index.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    recommends: [],
    recommendsBox: [],

    cart: [],
    stock: [],
    cartGoods: [],

    currentRate: 0,

    colors: [],

    mode: 'normal', // 'normal', 'admin'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    wx.setNavigationBarTitle({
      title: '购物车'
    });
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 10 * 1000
    });
    let rateInfo = await app.getCurrentRate();
    let currentRate = parseFloat(rateInfo.data.detail.rate);
    let colors = JSON.parse(app.globalData.colors);
    this.setData({
      stock: app.globalData.stock,
      currentRate: currentRate,
      colors: colors
    });


    // 获取推荐的商品
    let cart = app.globalData.cart;
    cart = [...cart];
    this.setData({
      cart: cart
    })
    let ids = [];
    for (var i = 0; i < this.data.cart.length; i++) {
      ids.push(this.data.cart[i][0]);
    }
    let recommends = [];
    if (this.data.cart.length > 0) {
      const recommendsPac = await app.http({
        method: 'post',
        url: `${app.globalData.apiBaseUrl}/public/shop/search/recommend`,
        data: {
          payload: {
            ids: ids
          }
        },
        header: {
          from: `https://easyqshop.com/${app.globalData.domain}/cart`,
          authorization: `Bearer ${app.globalData.token}`,
          'x-api-key': app.globalData.master_code
        }
      });
      let recommendsInfo = recommendsPac.data.detail;
      for (var i = 0; i < recommendsInfo.length; i++) {
        recommends.push(this.parseGood(recommendsInfo[i]));
      }
    } else {
      for (var i = 0; i < this.data.stock.length; i++) {
        recommends.push(this.parseGood(this.data.stock[i]));
      }
    }
    if (recommends.length > 90) {
      recommends = recommends.slice(0, 90);
    }
    if (recommends.length % 2 != 0) {
      recommends = recommends.slice(0, recommends.length-1);
    }
    this.setData({
      recommends: recommends
    });

    // 提取购物车信息
    this.getCartGoods();

    wx.hideToast();
  },
 
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    let cart = app.globalData.cart;
    cart = [...cart];
    this.setData({
      cart: cart,
      mode: 'normal'
    })
    let ids = [];
    for(var i = 0; i < this.data.cart.length; i++) {
      ids.push(this.data.cart[i][0]);
    }
    console.log(ids);

    // 提取购物车信息
    this.getCartGoods();

    // 获取推荐的商品
    let recommends = [];
    if(this.data.cart.length > 0) {
      const recommendsPac = await app.http({
        method: 'post',
        url: `${app.globalData.apiBaseUrl}/public/shop/search/recommend`,
        data: {
          payload: {
            ids: ids
          }
        },
        header: {
          from: `https://easyqshop.com/${app.globalData.domain}/cart`,
          authorization: `Bearer ${app.globalData.token}`,
          'x-api-key': app.globalData.master_code
        }
      });
      let recommendsInfo = recommendsPac.data.detail;
      for(var i = 0; i < recommendsInfo.length; i++){
        recommends.push(this.parseGood(recommendsInfo[i]));
      }
    }else {
      for(var i = 0; i < this.data.stock.length; i++){
        recommends.push(this.parseGood(this.data.stock[i]));
      }
    }
    if(recommends.length > 90) {
      recommends = recommends.slice(0, 90);
    }
    if(recommends.length % 2 != 0) {
      recommends = recommends.slice(0, recommends.length-1);
    }
    this.setData({
      recommends: recommends
    });

    // 显示购物车红点
    if (app.globalData.cart.size > 0) {
      wx.showTabBarRedDot({
        index: 3,
      })
      wx.setTabBarBadge({
        index: 3,
        text: app.globalData.cart.size.toString()
      })
    } else {
      wx.hideTabBarRedDot({
        index: 3,
      })
    }
  },

  parseGood(good) {
    let currentRate = this.data.currentRate;

    let id = good.id;
    let name = good.name;
    let images = JSON.parse(good.images);
    let imageURL = encodeURIComponent(images[0].url);
    let price = [Math.round(good.price * 100) / 100, Math.round(good.price * currentRate * 100) / 100];
    let recommendGood = {
      id: id,
      images: `${app.globalData.imagesApiAWSUrl}/${imageURL}`,
      price: price,
      name: name,
      selected: true
    }
    return recommendGood;
  },

  getCartGoods() {
    let cartGoods = [];
    let stockMap = new Map();
    for(var i = 0; i < this.data.stock.length; i++){
      stockMap.set(this.data.stock[i].id, this.data.stock[i]);
    }
    for(var i = 0; i < this.data.cart.length; i++){
      if(stockMap.has(this.data.cart[i][0])) {
        cartGoods.push(this.parseGood(stockMap.get(this.data.cart[i][0])));
      }
    }
    this.setData({
      cartGoods: cartGoods
    });
  },

  onClickAdmin: function(e) {
    if(this.data.mode == 'admin') {
      this.setData({
        mode: 'normal'
      })
    }else if(this.data.mode == 'normal'){
      this.setData({
        mode: 'admin'
      })
    }
  },

  // 选中商品
  selectGood: function(e) {
    let id = e.target.dataset.id;
    let cartGoods = this.data.cartGoods;
    for(var i = 0; i < cartGoods.length; i++) {
      if(cartGoods[i].id == id) {
        cartGoods[i].selected = true;
        break;
      }
    }
    this.setData({
      cartGoods: cartGoods
    });
  },

  // 释放商品
  releaseGood: function(e) {
    let id = e.target.dataset.id;
    let cartGoods = this.data.cartGoods;
    for (var i = 0; i < cartGoods.length; i++) {
      if (cartGoods[i].id == id) {
        cartGoods[i].selected = false;
        break;
      }
    }
    this.setData({
      cartGoods: cartGoods
    });
  },

  // 从购物车中删除商品
  deleteGood: function(e) {
    let id = e.target.dataset.id;
    let cartGoods = this.data.cartGoods;
    let cart = this.data.cart;
    let index = -1;
    for (var i = 0; i < cartGoods.length; i++) {
      if (cartGoods[i].id == id) {
        index = i;
        break;
      }
    }
    cartGoods.splice(index, 1);
    cart.splice(index, 1);
    this.setData({
      cartGoods: cartGoods,
      cart: cart
    });
    cart = new Map(cart);
    app.globalData.cart = cart;
    if(app.globalData.cart.size == 0) {
      this.setData({
        mode: 'normal'
      });
    }

    // 显示购物车红点
    if (app.globalData.cart.size > 0) {
      wx.showTabBarRedDot({
        index: 3,
      })
      wx.setTabBarBadge({
        index: 3,
        text: app.globalData.cart.size.toString()
      })
    } else {
      wx.hideTabBarRedDot({
        index: 3,
      })
    }
  },

  inputAmount: function(e) {
    let id = parseInt(e.target.dataset.id);
    let value = parseInt(e.detail.value);
    let cart = this.data.cart;
    cart[id][1] = value;
    this.setData({
      cart: cart
    });
    let cartMap = new Map(cart);
    app.globalData.cart = cartMap;
  },

  addOne: function(e) {
    let id = e.currentTarget.dataset.id;
    let cart = this.data.cart;
    cart[id][1]++;
    this.setData({
      cart: cart
    });
    let cartMap = new Map(cart);
    app.globalData.cart = cartMap;
  },
   minusOne: function(e) {
     let id = e.currentTarget.dataset.id;
     let cart = this.data.cart;
     if (cart[id][1] > 1) {
       cart[id][1]--;
     }
     this.setData({
       cart: cart
     });
     let cartMap = new Map(cart);
     app.globalData.cart = cartMap;
   }
})