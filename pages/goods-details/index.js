// pages/goods-details/index.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodID: '',
    goodInfo: {},

    images: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let goodID = options.goodID;
    this.setData({
      goodID: goodID
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
  }
})