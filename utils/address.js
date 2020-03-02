const common = require("./common/index");
const env = require("../environment");
const auth = require("auth");

let _address = []

module.exports = {
  async setAddress(address, defaultAddress){
    try{
      const userInfo = await common.storage.get('user');
      await common.storage.set(address, `address_${userInfo.id}`);
      if(defaultAddress){
        for(var i = 0; i < address.length; i++) {
          if (address[i].id == defaultAddress.id) {
            await common.storage.set(i, `address_selected_${userInfo.id}`);
            return { address: address, selIndex: i}
          }
        }
      }else{
        await common.storage.set(address.length - 1, `address_selected_${userInfo.id}`);
      }
      _address = address;
      return { address: address, selIndex: address.length - 1}
    }catch(err){
      console.error(err);
    }
  },

  hasAddress() {
    return _address.length>0 ? true : false;
  },

  async httpAddress(){
    common.toast.showLoading();
    try{
      const old_tokens = await common.storage.get('tokens');
      common.http.setToken(old_tokens);
      const tokens = await auth.renewToken(old_tokens);
      common.http.setToken(tokens);
      var { detail } = await common.http.get("get", "/user/shop/addresses", env.BACKEND_URL);
      const address = detail;
      var { detail } = await common.http.get("get", "/user/shop/addresses/get-default", env.BACKEND_URL);
      const defaultAdress = detail;
      return await this.setAddress(address, defaultAdress);
    }catch(err){
      console.error(err);
    }
    common.toast.hideToast();
  },

  async postAddress(address){
    common.toast.showLoading();
    try{
      
    }catch(err){
      console.error(err);
    }
    common.toast.hideToast();
  },

  async setDefault(id){
    common.toast.showLoading();
    try{
      const userInfo = await common.storage.get('user');
      await common.http.send("patch", `/user/shop/addresses/set-default/${id}`, {}, env.BACKEND_URL);
      await common.storage.set(id, `address_selected_${userInfo.id}`);
    } catch (err){
      console.error(err);
    }
    common.toast.hideToast();
  }
}