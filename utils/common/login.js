const app = getApp();
module.exports = {
  login() {
    const that = this;
    wx.login({
      async success(res) {
        if (res.code) {
          const info = await that.requestID(res.code);
          app.globalData.loginInfo = info.data;
          wx.switchTab({
            url: '/pages/my/index',
          })
        } else {
          console.error('登录失败！' + res.errMsg);
        }
      }
    })
  },

  // 获取openid和session_key
  requestID(code) {
    return new Promise((res, rej) => {
      wx.request({
        url: `https://api.weixin.qq.com/sns/jscode2session?appid=${app.globalData.appid}&secret=${app.globalData.appsecret}&js_code=${code}&grant_type=authorization_code`,
        method: 'get',
        success: ({ data, statusCode }) => {
          if (statusCode !== 200) {
            wx.showToast({
              title: '登录失败',
              icon: 'none'
            })
            rej({ data, statusCode })
          }
          res({ data, statusCode })
        },
        fail(err) {
          wx.showToast({
            title: '登录失败',
            icon: 'none'
          })
          rej(err);
        }
      });
    })
  }
}
