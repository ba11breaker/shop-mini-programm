// pages/tools/edit-address.js\
const app = getApp();
const helpers = require("./../..//utils/index");
const cities = require("../../city.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address: {},
    colors: {},
    states: [],
    selectState: {
      isShow: false,
      states: []
    },
    selectCity: {
      isShow: false,
      cities: []
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad:async function (options) {
    const { type } = options;
    try{
      if (type == "edit") {
        const address = await helpers.storage.get("address_edit");
        this.setData({
          address: address
        });
      } else if (type == "add") {

      }
    }catch(err) {
      console.error(err);
    }
    let states = [];
    for(var i = 0; i < cities.STATES.length; i++){
      states.push(cities.STATES[i].state);
    }
    this.setData({
      colors: JSON.parse(app.globalData.colors),
      states: cities.STATES,
      selectState: {
        isShow: false,
        states: states
      },
    });
  },

  updateName(e){
    let address = this.data.address;
    address.name = e.detail.value;
    this.setData({
      address: address
    })
  },

  updatePhone(e){
    let address = this.data.address;
    address.phone = e.detail.value;
    this.setData({
      address: address
    })
  },

  updateStreet(e){
    let address = this.data.address;
    address.street= e.detail.value;
    this.setData({
      address: address
    })
  },

  chooseState(){
    let selectState = this.data.selectState;
    selectState.isShow = !selectState.isShow; 
    this.setData({
      selectState: selectState
    });
  },

  clickState(e){
    const state = e.target.dataset.id;
    const states = this.data.states;
    let city = '';
    for(var i = 0; i < states.length; i++){
      if(states[i].state == state){
        city = states[i].cities[0];
        break;
      }
    }
    let address = this.data.address;
    let selectState = this.data.selectState;
    selectState.isShow  = false;
    address.state = state;
    address.city = city;
    this.setData({
      address: address,
      selectState: selectState
    })
  },

  chooseCity(){
    let selectCity = this.data.selectCity;
    const address = this.data.address;
    for(var i = 0; i < this.data.states.length; i++){
      if(address.state == this.data.states[i].state){
        selectCity.cities = this.data.states[i].cities;
      }
    }
    selectCity.isShow = !selectCity.isShow;
    this.setData({
      selectCity: selectCity,
    })
  },

  clickCity(e){
    const city = e.target.dataset.id;
    let address = this.data.address;
    let selectCity = this.data.selectCity;
    address.city = city;
    selectCity.isShow = false;
    this.setData({
      address: address,
      selectCity: selectCity
    })
  },

  async preserveInfo(e){
    try{
      const address = this.data.address;
      await helpers.address.postAddress(address);
      wx.navigateBack();
    }catch(err){
      console.error(err);
    }
  },

  async preserveDefault(e){
    try{
      const address = this.data.address;
      await helpers.address.postAddress(address);
      await helpers.address.setDefault(address.id);
      wx.navigateBack();
    }catch(err){
      console.error(err);
    }
  },

  async deleteInfo(e){
    try{
      const address = this.data.address;
      await helpers.address.deleteAddress(address);
      wx.navigateBack();
    }catch(err){
      console.error(err);
    }
  }
})