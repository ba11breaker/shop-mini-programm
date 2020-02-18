// pages/init/index.js
const app = getApp();
const _storage = require('../../utils/common/storage');
const util = require('../../utils/util');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    domain: '',
    requiredDomain: false,
    historyShops: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    try{
      let domain = await _storage.get('domain');

      if (!domain) {
        return this.setData({
          requiredDomain: true
        });
      }else{
        this.setData({
          domain: domain
        })
      }
    } catch (error) {
      console.error(error);
      wx.showToast({
        title: '初始化失败',
        icon: 'none'
      })
    }
  },

  updateDomain({detail}){
    app.globalData.domain = detail.value;
    this.setData({
      domain: detail.value
    });
  },

  submitDomain(){
    this.init(this.data.domain);
  },
  
  async init(domain){
    try{
      if(!domain){
        return wx.showToast({
          title: '请输入商城码',
          icon: 'none',
          image: '/images/popup-close.png'
        });
      }

      wx.showToast({
        title: '请稍等...',
        icon:'loading',
        duration: 15 * 1000
      });

      app.globalData.domain = domain;
      await _storage.set(domain, 'domain');

      const masterCodeInfo  = await app.http({
        method: 'get',
        url: `${app.globalData.apiBaseUrl}/public/shop/domain/get-master-code`,
        header: {
          from: `https://easyqshop.com/${domain}`,
          authorization: `Bearer ${app.globalData.token}`
        }
      });
      app.globalData.master_code = masterCodeInfo.data.detail;
      //console.log(app.globalData.master_code);

      const themesInfo = await app.http({
        method: 'get',
        url: `${app.globalData.apiBaseUrl}/public/shop/themes`,
        header: {
          from: `https://easyqshop.com/${domain}`,
          authorization: `Bearer ${app.globalData.token}`,
          'x-api-key': app.globalData.master_code
        }
      });
      app.globalData.themes = themesInfo.data.detail;
      //console.log(app.globalData.themes);
      
      const entityInfo = await app.http({
        method: 'get',
        url: `${app.globalData.apiBaseUrl}/public/shop/domain/get-entity`,
        header: {
          from: `https://easyqshop.com/${domain}`,
          authorization: `Bearer ${app.globalData.token}`,
          'x-api-key': app.globalData.master_code
        }
      });
      app.globalData.entity = entityInfo.data.detail;
      //console.log(app.globalData.entity);

      const deliveryTypesInfo = await app.http({
        method: 'get',
        url: `${app.globalData.apiBaseUrl}/public/shop/deliveries/get-delivery-types`,
        header: {
          from: `https://easyqshop.com/${domain}`,
          authorization: `Bearer ${app.globalData.token}`,
          'x-api-key': app.globalData.master_code
        }
      });
      app.globalData.delivery_types = deliveryTypesInfo.data.detail;
      //console.log(app.globalData.delivery_types);

      const boxTypesInfo = await app.http({
        method: 'get',
        url: `${app.globalData.apiBaseUrl }/public/shop/deliveries/get-box-types`,
        header:{
          from: `https://easyqshop.com/${domain}`,
          authorization: `Bearer ${app.globalData.token}`,
          'x-api-key': app.globalData.master_code
        }
      });
      app.globalData.box_types = boxTypesInfo.data.detail;
      //console.log(app.globalData.box_types);

      const countInfo = await app.http({
        method: 'get',
        url: `${app.globalData.apiBaseUrl}/public/shop/stockLinkage/count`,
        header: {
          from: `https://easyqshop.com/${domain}`,
          authorization: `Bearer ${app.globalData.token}`,
          'x-api-key': app.globalData.master_code
        }
      });
      app.globalData.count = countInfo.data.detail;
      //console.log(app.globalData.count);

      const brandsInfo = await app.http({
        method: 'get',
        url: `${app.globalData.apiBaseUrl}/public/shop/brands`,
        header:{
          from: `https://easyqshop.com/${domain}`,
          authorization: `Bearer ${app.globalData.token}`,
          'x-api-key': app.globalData.master_code
        }
      });
      app.globalData.brands = brandsInfo.data.detail;
      //console.log(app.globalData.brands);

      const sectionsInfo = await app.http({
        method: 'get',
        url: `${app.globalData.apiBaseUrl}/public/shop/found/blog-types`,
        header: {
          from: `https://easyqshop.com/${domain}/explore`,
          authorization: `Bearer ${app.globalData.token}`,
          'x-api-key': app.globalData.master_code
        }
      });
      app.globalData.blogtypes = sectionsInfo.data.detail;

      // 获取库存信息
      const stockInfo = await app.http({
        method: 'get',
        url: `${app.globalData.apiBaseUrl}/public/shop/stockLinkage?count=22&pageNo=-1&desc=ASC&orderBy=name`,
        header: {
          from: `https://easyqshop.com/${domain}`,
          authorization: `Bearer ${app.globalData.token}`,
          'x-api-key': app.globalData.master_code
        }
      });
      app.globalData.stock = stockInfo.data.detail;

      // 获取当前汇率
      app.globalData.currentRate = 7.732341234;

      //获取购物车缓存
      try{
        let cart = await _storage.get(`cart_${app.globalData.domain}`);
        app.globalData.cart = new Map(cart);
      }catch(err){
        console.error(error);
      }
      

      this.getColors();

      wx.reLaunch({
        url: '/pages/index/index',
        complete(){
          wx.hideHomeButton();
        }
      });
    } catch (error) {
      console.error(error);
    }
  },

  getColors(){
    let colors = app.globalData.entity.color_theme;
    app.globalData.colors = colors;
  }
})