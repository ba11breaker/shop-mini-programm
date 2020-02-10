// pages/categories/categories.js
//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    categories: [],
    categorySelected: {
      name: '',
      id: 0
    },
    currentBrands: [],
    currentBrandsBox: [],
    onLoadStatus: true,
    scrolltop: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "分类"
    });
    this.setCategories();
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

  /**
   * Sets the data of categories
   */
  setCategories() {
    const that = this;
    let categories = [];
    let categoryName = '';
    let categoryId = 0;
    let brands = app.globalData.brands.detail;
    categories.push({
      name: '品牌专区',
      id: 0,
      brands: []
    });
    let info = app.globalData.themes[4].body;
    for(var i = 0; i < info.length; i++) {
      categories.push({
        name: info[i].name,
        id: i + 1,
        brands: info[i].sub
      });
    }
    this.setData({
      categories: categories,
      categorySelected: {
        name: '品牌专区',
        id: 0
      }
    });
    this.setBrandsList();
  },

  setBrandsList() {
    wx.showLoading({
      title: '加载中',
    })
    const that = this;
    let brandsInfo = app.globalData.brands;
    let currentBrands = new Array();
    if(that.data.categorySelected.id === 0){
      for (var i = 0; i < brandsInfo.length; i++) {
        currentBrands.push({
          id: i,
          pic: `${app.globalData.imagesApiAWSUrl}/${brandsInfo[i].img}`,
          name: brandsInfo[i].name
        });
      }
    }else{
      brandsInfo = app.globalData.themes[4].body[that.data.categorySelected.id - 1].sub;
      for (var i = 0; i < brandsInfo.length; i++) {
        currentBrands.push({
          id: i,
          pic: `${brandsInfo[i].img}`,
          name: brandsInfo[i].name
        });
      }
    }
    that.setData({
      currentBrands: currentBrands
    });

    let currentBrandsBox = new Array();
    if(that.data.categorySelected.id === 0){
      let temp = new Array();
      let count = 0;
      for (var i = 0; i < currentBrands.length; i++){
        temp[count++] = currentBrands[i];
        if(count === 2){
          currentBrandsBox.push({
            box: [temp[0], temp[1]]
          });
          count = 0;
        }
      }
    }else if(that.data.categorySelected.id > 0){
      let temp = new Array();
      let count = 0;
      for (var i = 0; i < currentBrands.length; i++){
        temp[count++] = currentBrands[i];
        if(count === 3){
          currentBrandsBox.push({
            box: [temp[0], temp[1], temp[2]]
          });
          count = 0;
        }
      }
    }
    that.setData({
      currentBrandsBox: currentBrandsBox
    });
    wx.hideLoading();
  },

  onCategoryClick: function(e) {
    const that = this;
    var id = e.target.dataset.id;
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 5 * 1000
    });
    if(id === that.data.categorySelected.id){
      that.setData({
        scrolltop: 0
      })
    } else {
      var categoryName = '';
      for (var i = 0; i < that.data.categories.length; i++) {
        let item = that.data.categories[i];
        if (item.id == id) {
          categoryName = item.name;
          break;
        }
      }
    }
    that.setData({
      categorySelected:{
        name: categoryName,
        id: id
      },
      scrolltop: 0
    });
    that.setBrandsList();
    wx.hideToast();
  },

  tapBrandFirst: function(e) {
    console.log(e);
    let brand = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/goods/list?brand=${brand}`
    })
  },

  tapBrandSecond: function(e) {
    console.log(e);
    let catInfo = `${this.data.categorySelected.name},${e.currentTarget.dataset.id}`;
    wx.navigateTo({
      url: `/pages/goods/catlist?cat=${catInfo}`
    })
  }
})