//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),

    pageTitle: "",
    banners: [],
    homeBrands: [],
    
    categories: [],
    categorySelected:{
      title: ''
    },
    scrolltop: 0,
    categoryGoods: [],

    currentRate: 4.723454,

    skin: {},
    icons: {}
  },
  onLoad: async function (e) {
    wx.showShareMenu({
      withShareTicket: true
    })
    let pageTitle = app.globalData.entity.site_name;
    wx.setNavigationBarTitle({
      title: pageTitle
    });
    this.setBanners();
    this.setHomeBrands();
    this.setCategories();
    this.setSkin();
    this.setIcons();

    // 获取分类的商品数据
    let categoryGoods = [];
    let categories = this.data.categories;
    for(var i = 0; i < categories.length; i++) {
      var search_key = categories[i].search_key;
      search_key = encodeURIComponent(search_key);
      var goodsInfo = await app.http({
        method: 'get',
        url: `${app.globalData.apiBaseUrl}/public/shop/search?keywords=${search_key}`,
        header: {
          from: `https://easyqshop.com/${app.globalData.domain}`,
          authorization: `Bearer ${app.globalData.token}`,
          'x-api-key': app.globalData.master_code
        }
      });
      goodsInfo = goodsInfo.data.detail;
      let goods = [];
      for(var j = 0; j < goodsInfo.length; j++) {
        goods.push(this.parseGood(goodsInfo[j]));
      }
      if(goods.length > 16){
        goods = goods.slice(0, 16);
      }
      if(goods.length % 2 != 0){
        goods = goods.slice(0, goods.length-1);
      }
      categoryGoods.push({
        title: categories[i].title,
        recommends: goods
      });
    }
    this.setData({
      categoryGoods: categoryGoods
    });
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

  // Get the banners info
  setBanners() {
    const that = this;
    let bannersInfo = [];
    //let bannersInfo = app.globalData.themes[2].body;
    for (var i = 0; i < app.globalData.themes.length; i++) {
      if (app.globalData.themes[i].type == 'homeSliders'){
        bannersInfo = app.globalData.themes[i].body;
        break;
      }
    }
    for(var i = 0; i < bannersInfo.length; i++){
      bannersInfo[i].imageUrl = `${app.globalData.imagesApiBaseUrl}/${bannersInfo[i].imageUrl}`;
    }
    that.setData({
      banners: bannersInfo
    });
  },
  // Get the recommend brands info in index
  setHomeBrands() {
    const that = this;
    //let brandsInfo = app.globalData.themes[3].body;
    let brandsInfo = [];
    for (var i = 0; i < app.globalData.themes.length; i++) {
      if (app.globalData.themes[i].type == 'homeBrands') {
        brandsInfo = app.globalData.themes[i].body;
        break;
      }
    }
    //console.log(brandsInfo);
    for(var i = 0; i < brandsInfo.length; i++){
      brandsInfo[i].imageUrl = `${app.globalData.imagesApiBaseUrl}/${brandsInfo[i].imageUrl}`;
    }
    that.setData({
      homeBrands: brandsInfo
    });
  },

  setCategories(){
    const that = this;
    let categories = [];
    //categories = app.globalData.themes[6].body;
    for (var i = 0; i < app.globalData.themes.length; i++) {
      if (app.globalData.themes[i].type == 'homeRecommands') {
        categories = app.globalData.themes[i].body;
        break;
      }
    }
    let categoryName = categories[0].title;
    this.setData({
      categories: categories,
      categorySelected:{
        title: categoryName
      }
    });
  },

  // 获取themes中的skin
  setSkin() {
    const that = this;
    let skin = {};
    for(var i = 0; i < app.globalData.themes.length; i++) {
      if(app.globalData.themes[i].type == 'skins'){
        skin = app.globalData.themes[i].body;
        break;
      }
    }
    this.setData({
      skin: skin
    });
  },

  // 设置icon的url
  setIcons() {
    const that = this;
    let icons = {
      all: `https://qpanda-themes.s3-ap-southeast-2.amazonaws.com/${that.data.skin.value}/icon-all.svg`,
      special: `https://qpanda-themes.s3-ap-southeast-2.amazonaws.com/${that.data.skin.value}/icon-special.svg`,
      logistics: `https://qpanda-themes.s3-ap-southeast-2.amazonaws.com/${that.data.skin.value}/icon-logistics.svg`,
      id: `https://qpanda-themes.s3-ap-southeast-2.amazonaws.com/${that.data.skin.value}/icon-id-upload.svg`
    }
    this.setData({
      icons: icons
    });
  },

  onCategoryClick: function(e) {
    var that  = this;
    var id = e.target.dataset.id;
    if(id == that.data.categorySelected.title){
      that.setData({
        scrolltop: 0
      });
    } else {
      var categoryName = '';
      for(var i = 0; i < that.data.categories.length; i++){
        let item = that.data.categories[i];
        if (item.title == id){
          categoryName = item.title;
          break;
        }
      }
      that.setData({
        categorySelected: {
          title: categoryName
        },
        scrolltop: 0
      });
      console.log(this.data.categorySelected);
    }
  },

  // 转换商品信息
  parseGood(good) {
    let currentRate = this.data.currentRate;

    let id = good.id;
    let name = good.name;
    let images = JSON.parse(good.images);
    let imageURL = encodeURIComponent(images[0].url);
    let price = [Math.round(good.price * 100) / 100, Math.round(good.price * currentRate * 100) / 100];
    let goodInfo = {
      id: id,
      images: `${app.globalData.imagesApiAWSUrl}/${imageURL}`,
      price: price,
      name: name,
    }
    return goodInfo;
  },

  goGoodDetail: function (e) {
    let goodID = e.currentTarget.dataset.id;
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
