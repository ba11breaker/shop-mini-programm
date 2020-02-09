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