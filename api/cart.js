import request from '@/utils/request'

// api地址
const api = {
  list: 'cart/list',
  total: 'cart/total',
  add: 'cart/add',
  update: 'cart/update',
  clear: 'cart/clear'
}

// 购物车列表
export const list = () => {
  return request.get(api.list, {}, { load: false })
}

// 购物车商品总数量
export const total = () => {
  return request.get(api.total, {}, { load: false })
}

// 加入购物车
export const add = (goodsId, goodsSkuId, goodsNum) => {
  return request.post(api.add, { goodsId, goodsSkuId, goodsNum })
}

// 更新购物车商品数量
export const update = (goodsId, goodsSkuId, goodsNum) => {
  return request.post(api.update, { goodsId, goodsSkuId, goodsNum }, { isPrompt: false })
}

// 删除购物车中指定记录
export const clear = (cartIds = []) => {
  return request.post(api.clear, { cartIds })
}
