let _tokens = {};
let _master_code = "";

module.exports = {
  setToken(tokens) {
    if (tokens.token && tokens.refreshToken)
      _tokens = tokens;
  },

  setMasterCode(mc) {
    _master_code = mc;
  },

  async renewToken() {

  },

  send(method, url, payload, baseUrl, noToken = false) {
    return new Promise((res, rej) => {
      const header = {};
      if (_master_code)
        header['x-api-key'] = _master_code;
      if (!noToken && _tokens.token) {
        header = {
          authorization: `Bearer ${_tokens.token}`
        }
      }

      wx.request({
        method,
        url: baseUrl + url,
        data: payload,
        header,
        success({ data, statusCode }) {
          if (statusCode != 200) {
            rej({ data, statusCode })
          }
          res(data);
        },
        fail(err) {
          rej(err);
        }
      })
    });
  }
}