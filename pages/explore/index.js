// pages/explore/index.js
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    sections: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "发现"
    });
    this.setSections();
    console.log(this.sections);
  },

  onShow: function () {
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

  setSections(){
    const that = this;
    let sections = [];
    for (var i = 0; i < app.globalData.blogtypes.length; i++) {
      sections.push({
        id: app.globalData.blogtypes[i].id,
        img_url: `${app.globalData.imagesApiAWSUrl}/${app.globalData.blogtypes[i].img_url}`,
        name: app.globalData.blogtypes[i].tag_name
      });
    }
    that.setData({
      sections: sections
    });
    console.log(this.sections);
  }
})