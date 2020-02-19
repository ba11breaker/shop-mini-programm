module.exports = {
  async login() {
    let code = '';
    wx.login({
      success: function(loginRes) {
        console.log(loginRes)
        wx.request({
          url: `https://api.weixin.qq.com/sns/jscode2session?appid=wx5074537799b00f19&secret=cc475138e024ce5af0496fc01d16fa6b&js_code=${loginRes}&grant_type=authorization_code`,
          method: 'get'
        });
      }
    });
  }
}