// pages/checkout/comment.js
const app = getApp()
const helpers = require("./../..//utils/index");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    colors: {},
    comment: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    try{
      const comment = await helpers.storage.get("comment");
      this.setData({
        comment: comment
      })
    }catch(err){
      console.error(err);
    }
    this.setData({
      colors: JSON.parse(app.globalData.colors),
    });
  },

  textAreaBlur(e){
    const comment = e.detail.value;
    this.setData({
      comment: comment
    })
  },

  async submit(e){
    const comment = this.data.comment;
    try{
      await helpers.storage.set(comment, 'comment');
    }catch(err){
      console.error(err);
    }
    await wx.navigateBack();
  }
})