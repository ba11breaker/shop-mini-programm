const _storage = require('./common/storage');
const app = getApp();

module.exports = {
  async add(productId) {
    try{
      productId = Number(productId);
      if(isNaN(productId)) throw "商品ID错误";

      const cart = app.globalData.cart;
      if(!cart.has(productId)) {
        cart.set(productId, 1);
      }else{
        let count = cart.get(productId);
        cart.set(productId, count+1);
      }
      app.globalData.cart = cart;
      // 储存到本地
      this.setStorage();
      // 显示添加成功
      wx.showToast({
        title: '添加成功',
        icon: 'success',
        duration: 700
      });
      // 显示购物车红点
      this.updateBadge();
    }catch(error) {
      console.error("加入购物车失败", error);
    }
  },

  async remove(productId) {
    try {
      productId = Number(productId);
      if (isNaN(productId)) throw "商品ID错误";
      app.globalData.cart.delete(productId)
      // 显示购物车红点
      this.updateBadge();
      // 储存到本地
      this.setStorage();
    } catch (error) {
      console.error("移除购物车失败:", error);
    }
  },

  updateBadge(cart = app.globalData.cart) {
    // 显示购物车红点
    if (cart.size > 0) {
      wx.showTabBarRedDot({
        index: 3,
      })
      wx.setTabBarBadge({
        index: 3,
        text: String(cart.size)
      })
    } else {
      wx.hideTabBarRedDot({
        index: 3,
      })
    }
  },

  async setStorage(){
    const cart = app.globalData.cart;
    await _storage.set([...cart], 'cart');
  }
}