const common = require("./common/index");
const env = require("../environment");

let _user = {};

module.exports = {
  async checkLogin() {
    try {
      const user = await common.storage.get("user");
      const tokens = await common.storage.get("tokens");

      // TODO 验证用户密钥
      if (user.id) _user = user;

    } catch (error) {
      console.error("无法验证登陆：", error);
    }
  },

  async login({ phone, password }) {
    common.toast.showLoading();
    try {
      const payload = {
        phone,
        password
      };
      const { detail } = await common.http.send("post", "/auth/login", { payload }, env.AUTH_URL);
      const tokens = {
        token: detail.token,
        refreshToken: detail.refreshToken
      }
      await common.storage.set(detail, "user");
      await common.storage.set(tokens, "tokens");
      common.http.setToken(tokens);
      common.toast.showToast("登陆成功");
      _user = detail;
    } catch (error) {
      if (error.statusCode === 409)
        common.toast.showToast("账号密码错误", "none");
      else
        common.toast.showToast("系统错误，请退出重试", "none");
      throw error;
    }
  },

  getLogin() {
    wx.navigateTo({
      url: '/pages/login/index',
    })
  },

  isLoggedIn() {
    return _user.id ? true : false;
  },

  getUser() {
    return JSON.parse(JSON.stringify(_user));
  },

  async wechatLogin(js_code) {
    common.toast.showLoading();
    try {
      const { detail } = await common.http.send("post", "/wx/mini", { js_code }, env.AUTH_URL);
      const tokens = detail.tokens;
      await common.storage.set(detail.user, "user");
      await common.storage.set(detail.tokens, "tokens");
      common.http.setToken(tokens);
      common.toast.showToast("登陆成功");
      _user = detail.user;
      return detail;
    } catch (error) {
      if (error.statusCode === 409)
        common.toast.showToast("账号密码错误", "none");
      else
        common.toast.showToast("系统错误，请退出重试", "none");
      console.error(error);
      throw error;
    }
    common.toast.hideToast();
  },

  async wechatSign(payload) {
    try {
      const {detail} = await common.http.send("put", '/wx/mini', payload, env.AUTH_URL);
      const {tokens, user} = detail;
      await common.storage.set(user, "user");
      await common.storage.set(tokens, "tokens");

      common.http.setToken(tokens);
      common.toast.showToast("登陆成功");
      _user = detail.user;
    } catch( err ) {
      if (error.statusCode === 409)
        common.toast.showToast("账号密码错误", "none");
      else
        common.toast.showToast("系统错误，请退出重试", "none");
      throw err;
    }
  },

  async logOut(){
    try{
      await common.storage.remove("user");
      await common.storage.remove("tokens");
      _user = {};
      common.toast.showToast("已登出", "none");
    }catch(err){
      common.toast.showToast("登出失败", "none");
      throw err;
    }
  },

  async renewToken(old_tokens) {
    try {
      const { detail: tokens } = await common.http.send('post', '/auth/refreshToken', old_tokens, env.AUTH_URL);
      await common.storage.set(tokens, 'tokens');
      return tokens;
    } catch (err) {
      console.error(err);
    }
  },
}
