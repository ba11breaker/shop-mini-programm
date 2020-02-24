module.exports = {
  async set(data, key) {
    let domain = "";
    if (key !== "domain")
      domain = await this.getDomain();

    return new Promise((res, rej) => {
      wx.setStorage({
        data,
        key: domain + key,
        success: function(result) {
          res(result);
        },
        fail: function(error) {
          rej(error);
        }
      });
    })
  },

  async getDomain() {
    return new Promise((res, rej) => {
      wx.getStorage({
        key: 'domain',
        success: function(data) {
          res(data['data']);
        },
        fail: function(error) {
          rej(error);
        }
      })
    });
  },

  async get(key) {
    let domain = "";
    if (key !== "domain")
      domain = await this.getDomain();
    return new Promise((res, rej) => {
      wx.getStorage({
        key: domain + key,
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
    let domain = "";
    if(key !== "domain")
      domain = await this.getDomain();
  
    return new Promise((res, rej) => {
      wx.removeStorage({
        key: domain + key,
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