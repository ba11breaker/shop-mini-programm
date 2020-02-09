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
    scrolltop: 0
  },
  onLoad: function (e) {
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
    let categoryName = '';
    categories = app.globalData.themes[6].body;
    for(var i = 0; i < categories.length; i++){
      if(i == 0){
        categoryName = categories[i].title;
      }
    }
    this.setData({
      categories: categories,
      categorySelected:{
        title: categoryName
      }
    });
  },

  onCategoryClick: function(e) {
    var that  = this;
    console.log(e);
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
    }
  }
})
