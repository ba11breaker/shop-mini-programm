// pages/cart/index.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    recomends: [],
    recomendsBox: [],

    cart: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '购物车'
    });
  },
 
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    let cart = app.globalData.cart;
    cart = [...cart];
    this.setData({
      cart: cart
    })
    let ids = [];
    for(var i = 0; i < this.data.cart.length; i++) {
      ids.push(this.data.cart[i][0]);
    }
    console.log(ids);
    // 获取推荐的商品
    const recommendsPac = await app.http({
      method: 'post',
      url: `${app.globalData.apiBaseUrl}/public/shop/search/recommend`,
      data:{
        payload: {
          ids: ids
        }
      },
      header:{
        from: `https://easyqshop.com/${app.globalData.domain}/cart`,
        authorization: `Bearer ${app.globalData.token}`,
        'x-api-key': app.globalData.master_code
      }
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
})