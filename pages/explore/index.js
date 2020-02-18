// pages/explore/index.js
const app = getApp();
const util = require('../../utils/util');
const _cart = require('../../utils/cart');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    sections: [],
    medias: [],

    typeSelected: 'article', // 'article', moment

    articles: [],
    moments: [],
    stock: new Map()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    wx.setNavigationBarTitle({
      title: "发现好物"
    });
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 10 * 1000
    });
    // 设置精选栏目和媒体中心
    this.setSections();

    this.setData({
      stock: app.globalData.stock
    })
  },

  onShow: async function () {
    // 获取文章和朋友圈
    const that = this;
    const articlePac = await app.http({
      method: 'get',
      url: `${app.globalData.apiBaseUrl}/public/shop/found/blogs?searchBy=title&count=20&desc=DESC&orderBy=updated_at&pageNo=0`,
      header: {
        from: `https://easyqshop.com/${app.globalData.domain}/explore`,
        authorization: `Bearer ${app.globalData.token}`,
        'x-api-key': app.globalData.master_code
      }
    });
    const momentPac = await app.http({
      method: 'get',
      url: `${app.globalData.apiBaseUrl}/public/shop/found/moments?searchBy=title&count=20&desc=DESC&orderBy=updated_at&pageNo=0`,
      header: {
        from: `https://easyqshop.com/${app.globalData.domain}/explore`,
        authorization: `Bearer ${app.globalData.token}`,
        'x-api-key': app.globalData.master_code
      }
    });
    let articles = [];
    let moments = [];
    let articlesInfo = articlePac.data.detail;
    let momentsInfo = momentPac.data.detail;
    // 获取articles信息
    for (var i = 0; i < articlesInfo.length; i++) {
      let date = that.parseDate(articlesInfo[i].updated_at);
      let title = articlesInfo[i].title;
      title = title.slice(0, 52);
      articles.push({
        id: articlesInfo[i].id,
        title: title,
        subtitle: articlesInfo[i].sub_title,
        img: `${app.globalData.imagesApiAWSUrl}/${articlesInfo[i].front_image_key}`,
        date: date
      });
    }
    // 获取moments信息
    let stock = this.data.stock;
    let stockMap = new Map();
    for (var i = 0; i < stock.length; i++) {
      stockMap.set(parseInt(stock[i].stock_id), stock[i]);
    }
    for(var i = 0; i < momentsInfo.length; i++){
      moments.push(this.parseMoment(momentsInfo[i], stockMap));
    }
    that.setData({
      articles: articles,
      moments: moments
    });
    wx.hideToast();

    // 显示购物车红点
    _cart.updateBadge();
  },

  setSections(){
    const that = this;
    let sections = [];
    let medias = [];
    for (var i = 0; i < app.globalData.blogtypes.length; i++) {
      if(app.globalData.blogtypes[i].category=='精选栏目') {
        sections.push({
          id: app.globalData.blogtypes[i].id,
          img_url: `${app.globalData.imagesApiAWSUrl}/${app.globalData.blogtypes[i].img_url}`,
          name: app.globalData.blogtypes[i].name
        });
      } else if (app.globalData.blogtypes[i].category == '媒体中心') {
        medias.push({
          id: app.globalData.blogtypes[i].id,
          img_url: `${app.globalData.imagesApiAWSUrl}/${app.globalData.blogtypes[i].img_url}`,
          name: app.globalData.blogtypes[i].name
        });
      }
    }
    that.setData({
      sections: sections,
      medias: medias
    });
  },

  onClickArticle: function(e) {
    this.setData({
      typeSelected: 'article'
    });
  },

  onClickMoment: function(e) {
    this.setData({
      typeSelected: 'moment'
    });
  },

  parseDate(str) {
    let ant = str.split('T');
    let day = ant[0].split('-');
    let time = ant[1].split(':');
    switch(day[1]) {
      case '01': day[1] = 'Jan'; break;
      case '02': day[1] = 'Feb'; break;
      case '03': day[1] = 'Mar'; break;
      case '04': day[1] = 'Apr'; break;
      case '05': day[1] = 'May'; break;
      case '06': day[1] = 'Jun'; break;
      case '07': day[1] = 'Jul'; break;
      case '08': day[1] = 'Aug'; break;
      case '09': day[1] = 'Sept'; break;
      case '10': day[1] = 'Oct'; break;
      case '11': day[1] = 'Nov'; break;
      case '12': day[1] = 'Dec'; break;
    }
    switch(time[0]) {
      case '00': time[0] = '22'; break;
      case '01': time[0] = '23'; break;
      case '02': time[0] = '00'; break;
      case '03': time[0] = '01'; break;
      case '04': time[0] = '02'; break;
      case '05': time[0] = '03'; break;
      case '06': time[0] = '04'; break;
      case '07': time[0] = '05'; break;
      case '08': time[0] = '06'; break;
      case '09': time[0] = '07'; break;
      case '10': time[0] = '08'; break;
      case '11': time[0] = '09'; break;
      case '12': time[0] = '10'; break;
      case '13': time[0] = '11'; break;
      case '14': time[0] = '12'; break;
      case '15': time[0] = '13'; break;
      case '16': time[0] = '14'; break;
      case '17': time[0] = '15'; break;
      case '18': time[0] = '16'; break;
      case '19': time[0] = '17'; break;
      case '20': time[0] = '18'; break;
      case '21': time[0] = '19'; break;
      case '22': time[0] = '20'; break;
      case '23': time[0] = '21'; break;
    }
    return `${day[2]} ${day[1]} ${day[0]} ${time[0]}:${time[1]}`;
  },

  // 转换moment信息
  parseMoment(momentInfo, stockMap){
    let id = momentInfo.id;
    let stock_id = momentInfo.stock_id;
    let date = this.parseDate(momentInfo.updated_at);
    let images = JSON.parse(momentInfo.images);
    for(var i = 0; i < images.length; i++){
      images[i] = `${app.globalData.imagesApiAWSUrl}/${images[i].url}`
    }
    let user_name = momentInfo.user_name;
    let user_photo = `${app.globalData.imagesApiAWSUrl}/${momentInfo.user_photo}`;
    let content = momentInfo.content;
    content = this.parseContent(content);
    let stock_good = null;
    if(momentInfo.stock_id){
      let good = stockMap.get(momentInfo.stock_id);
      stock_good = util.parseGood(good);
    }
    return{
      id: id,
      stock_id: stock_id,
      date: date,
      iamges: images,
      user_name: user_name,
      user_photo: user_photo,
      content: content,
      stock_good: stock_good
    }
  },

  parseContent(string) {
    let content = string.split('</p>');
    for(var i = 0; i < content.length; i++){
      content[i] = content[i].replace('<p>', '');
      content[i] = content[i].replace('&nbsp;', ' ');
      content[i] = content[i].replace('&ldquo;', '“');
      content[i] = content[i].replace('&rdquo;', '”');
      content[i] = content[i].replace('&lsquo;', '‘');
      content[i] = content[i].replace('&rsquo;', '’');
    }
    content = content.slice(0, content.length - 1);
    return content;
  }
})