// pages/tools/address.js
const app = getApp();
const helpers = require("./../..//utils/index");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    colors: {},
    infos: [],
    selIndex: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },


  onShow: function(optinos) {
    this.getInfos();
    this.setData({
      colors: JSON.parse(app.globalData.colors)
    });
  },

  async chooseAdd(e){
    const clickID = e.target.dataset.id;
    if(clickID != this.data.selIndex){
      try{
        console.log(this.data.infos[clickID].id);
        await helpers.address.setDefault(this.data.infos[clickID].id);
        this.setData({
          selIndex: clickID
        });
      }catch(err){
        console.error(err);
      }
    }
  },

  async editAddress(e){
    const address = e.target.dataset.id;
    try{
      await helpers.storage.set(address, 'address_edit');
      wx.navigateTo({
        url: '/pages/tools/edit-address?type=edit',
      })
    }catch(err){
      console.error(err);
    }
  },

  async getInfos(){
    try{
      const userInfo = await helpers.storage.get('user');
      const { address, selIndex } = await helpers.address.httpAddress();
      this.setData({
        infos: address,
        selIndex: selIndex
      })
    }catch(err){
      console.error(err);
    }
  }
})