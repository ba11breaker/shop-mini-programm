module.exports = {
  async set(data, key) {
    return new Promise((res, rej) => {
      wx.setStorage({
        data,
        key,
        success: function(result) {
          res(result);
        },
        fail: function(error) {
          rej(error);
        }
      });
    })
  },

  async get(key) {
    return new Promise((res, rej) => {
      wx.getStorage({
        key,
        success: function(data) {
          res(data['data']);
        },
        fail: function(error) {
          rej(error);
        }
      })
    });
  },

  async remove(key) {
    return new Promise((res, rej) => {
      wx.removeStorage({
        key,
        success: function(result) {
          res(result);
        },
        fail: function(error) {
          rej(error);
        }
      })
    })
  }
}