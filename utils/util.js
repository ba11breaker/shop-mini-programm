const app =getApp();
module.exports = {
  parseGood(good) {

    let id = good.id;
    let name = good.name;
    let images = JSON.parse(good.images || '[]');
    let imageURL = encodeURI(images[0].url);
    let price = [Math.round(good.price * 100) / 100, Math.round(good.price * app.globalData.currentRate * 100) / 100];
    let brand = good.stock_brand;
    let recommendGood = {
      id: id,
      images: `${app.globalData.imagesApiAWSUrl}/${imageURL}`,
      price: price,
      name: name,
      selected: true,
      isShow: true,
      brand: brand
    }
    return recommendGood;
  }
}