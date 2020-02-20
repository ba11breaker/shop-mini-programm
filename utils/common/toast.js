module.exports = {
  showLoading(title = "读取中...") {
    wx.showToast({
      title,
      icon: "loading"
    })
  },

  hideToast() {
    wx.hideToast({
      complete: (res) => { },
    })
  },

  showToast(
    title, icon, duration = 2000
  ) {
    wx.showToast({
      title,
      icon,
      duration
    })
  }
}
