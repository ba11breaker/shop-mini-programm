module.exports = {
  boxes: [],
  boxSpecs: [],

  // 自动分箱3.0
  //1. 分类
  splitCat(products, types) {

    //分类开始
    let cats = [];

    for(let type of types) {
      let prods = [];
      if (type.name==='自定义') prods = products.filter(p => !p.delivery_type);
      else prods = products.filter(p => p.delivery_type == type.id);


      if(prods.length) {
        cats.push({type, products:prods.map(prod => {
          const p = cloneDeep(prod)
          p.qty = p.quantity;
          return p;
        })});
      }
    }
    //分类完成

    //开始分装
    this.boxes = [];
    for(let cat of cats) {
      this.pack(cat);
    }

    this.optimize();
    this.calc();
    //结束分装
    return this.boxes;
  },

  //2. 分装
  pack(cat) {
    const type = cat.type;
    const products = JSON.parse(JSON.stringify(cat.products));
    let box = [];
    let space = type.mix_with_same_type;
    let amountLeft = 0;
    let mix_with_self = type.mix_with_self

    for(let prod of products) {
      amountLeft = prod.qty;
      let mass = prod.height*prod.width*prod.length

      if(!mass) mass = prod.mass;

      //4. 如果箱子空间已用完，换新
      if(space === 0) {
        space = type.mix_with_same_type; //8 同商品最大数量
      }
      //1. 只要还有剩余商品
      while(amountLeft>0) {
        //3. 如果箱子空间已用完，换新
        if(space === 0) {
          space = type.mix_with_same_type;
          box = [];
        }
        //2. 如果数量大于剩余空间相等
        if(amountLeft > space) {
          box.push({product:prod, type:type, qty: space, mass: space*mass, weight:prod.weight*space, value:Number(prod.price)*space});

          //计算箱子重量体积价值
          let weight = 0, mas = 0, value = 0, qty = 0;
          for(let prod of box) {
            weight += prod.weight;
            mas += prod.mass;
            value += prod.value;
            qty += prod.qty
          }

          this.boxes.push({products:box, type:type, weight: weight, mass:mas, value: value, qty:qty, spaceLeft:mix_with_self-qty});

          box = [];
          amountLeft -= space;
          space = 0;
        }
        //2. 如果数量小于剩余空间
        else if(amountLeft < space) {
          box.push({product:prod, type:type, qty: amountLeft, mass: amountLeft*mass, weight:prod.weight*amountLeft, value:Number(prod.price)*amountLeft});
          space -= amountLeft;
          amountLeft = 0;
        }
        //2. 如果数量和剩余空间相等
        else {
          box.push({product:prod, type:type, qty: space, mass: space*mass, weight:prod.weight*space, value:Number(prod.price)*space});

          //计算箱子重量体积价值
          let weight = 0, mas = 0, value = 0, qty = 0;
          for(let prod of box) {
            weight += prod.weight;
            mas += prod.mass;
            value += prod.value;
            qty += prod.qty
          }

          this.boxes.push({products:box, type:type, weight: weight, mass:mas, value: value, qty:qty, spaceLeft:mix_with_self-qty});

          box = [];

          amountLeft = 0;
          space = 0;
        }
      }

      //如果箱子有货而且是最后一箱
      if(box.length>0 && products.length === products.indexOf(prod)+1 ) {
        //计算箱子重量体积价值
        let weight = 0, mas = 0, value = 0, qty = 0;
        for(let prod of box) {
          weight += prod.weight;
          mas += prod.mass;
          value += prod.value;
          qty += prod.qty
        }

        this.boxes.push({products:box, type:type, weight: weight, mass:mas, value: value, qty:qty, spaceLeft:mix_with_self-qty});
      }

    }
  },

  /**
   *
   *
   * @memberof OrdersService
   */
  optimize() {
    //开始压缩精简箱子
    let i = 0;
    while(i < this.boxes.length) {
      let box = this.boxes[i];

      if (box.type.fee_type === 'qty') {i++; continue ;}

      // 如果超过最低计费重量，就跳过 被 优化
      // if(box.weight <= this.min_weight) continue;

      //优化
      const type = box.type;
      const mix_with_self = type.mix_with_self;
      const mix_with_other_types = type.mix_with_other_types;
      const mix_with_same_type = type.mix_with_same_type;
      //抽出每个产品
      let x = 0;
      while(x < box.products.length) {
        let item = box.products[x];
        let spliced = false;
        //尝试放入每个箱子
        for (let bo of this.boxes) {
          //如果箱子不合格，跳过
          if((bo.type!=type && !bo.type.can_mix_with_type.includes(type.name)) || bo==box || bo.spaceLeft===0) continue ;

          //如果箱子合格, 目标箱子有位子，而且产品数量没有超标
          let available = this.calcDuplicate(bo, item.qty, item.product.name, mix_with_other_types, mix_with_same_type, type);
          if(bo.spaceLeft >= item.qty && available) {
            const singleWeight = item.weight/item.qty;

            //修改目标箱子参数
            bo.spaceLeft -= item.qty;
            bo.qty += item.qty;
            bo.mass += item.mass;
            bo.weight += item.weight;
            bo.value += item.value;

            //修改本箱子参数
            box.spaceLeft += item.qty;
            box.qty -= item.qty;
            box.mass -= item.mass;
            box.weight -= item.weight;
            box.value -= item.value;

            //移动货物
            bo.products.push({product:item.product, type:type, qty: item.qty, mass: item.mass, weight: item.weight, value: item.value});
            box.products.splice(x, 1);
            spliced = true;
            break ;
          }
        }
        //如果没有移动，进一位
        if(!spliced) x++;
      }
      if(box.products.length === 0) this.boxes.splice(this.boxes.indexOf(box), 1);
      else i++;
    }
    //结束压缩精简箱子
  },

  //4. 计算重量数据
  calc() {
    //计算箱子体积,运费
    for(let box of this.boxes) {
      let selectedBoxSpec; //保存尺寸类型

      //识别装箱尺寸类型
      for(let boxspec of this.boxSpecs) {
        if((boxspec.length*boxspec.height*boxspec.width) >= box.mass) {
          box['box_type'] = boxspec.id;
          selectedBoxSpec = boxspec;
          break ;
        }
      }

      if (!selectedBoxSpec) {
        selectedBoxSpec = {weight: 0};
      }
      // 开始计算运费
      let fee_type = box.type.fee_type; //计费方式
      box.weight = box.weight+selectedBoxSpec.weight; //包裹重量+箱子本身重量，换算成kg

      if(fee_type === 'weight') { //如果按照重量计费
        box['feeWeight'] = box.weight>=box.type.min_weight?box.weight:box.type.min_weight;
        box['price'] = box['feeWeight']*Number(box.type.single_fee);
      } else { //如果按照数量计费
        if(box.type.discounts.length === 0) box['price'] = box.qty * box.type.single_fee;
        else { //如果有折扣
          box.type.discounts.sort(function(a, b) {return Number(b.amount)-Number(a.amount)});
          let price = 0, qty = Number(box.qty.toString()), i = 0;
          while (i < box.type.discounts.length) {
            if (qty >= Number(box.type.discounts[i]['amount'])) {
              price += Number(box.type.discounts[i]['price']);
              qty -= Number(box.type.discounts[i]['amount']);
            } else i++;
          }
          if (qty > 0) {price += (qty * box.type.single_fee)};
          box['price'] = price;
        }
      }
      //结束计算运费
    }
  },

  calcFarLocation(boxes, address) {

  },

  // 测试商品是否重复,决定可有有多少个商品移动过去
  calcDuplicate(box, qty, name, mix_with_other_types, mix_with_same_type, type) {
    let sameType = 0, difType=0, sameProd=0, hasDif = false;
    for (let prod of box.products) {

      //测试箱子商品数量
      if(prod.type != type) {
        hasDif = true;
        //如果异类已经超过最大异类混装数量，直接false
        if (prod.type.mix_with_other_types < prod.qty || type.mix_with_other_types < qty) return false;
        difType += prod.qty;
      } else if (prod.product.name === name) {
        sameProd += prod.qty;
        //如果相同产品已经超过最大数量，直接false
        if (prod.qty+qty >= prod.type.mix_with_same_type) return false;
        sameType += prod.qty;
      } else if (prod.type == type ) {
        sameType += prod.qty;
      }
    }

    //如果有异类产品，异类混装最大 - 同类产品数量，否则同类混装最大-同类产品数量
    if (hasDif) return mix_with_other_types - sameType;
    else return mix_with_same_type - sameProd;
  }
}