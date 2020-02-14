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
    categorysSelected:{
      title: ''
    },
    scrolltop: 0,
    categoryGoods: [],
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

    // 获取分类的商品数据
    let categoryGoods = [];
    let categories = this.data.categories;
    for(var i = 0; i < categories.length; i++) {
      
    }
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
    let bannersInfo = app.globalData.themes[2].body;
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
    let brandsInfo = app.globalData.themes[3].body;
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
    categories = app.globalData.themes[6].body;
    let categoryName = categories[0].title;
    this.setData({
      categories: categories,
      categorySelected:{
        title: categoryName
      }
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
  }
})
