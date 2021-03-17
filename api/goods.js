import request from '@/utils/request'

// api地址
const api = {
  list: 'goods/list',
  detail: 'goods/detail'
}

// 商品列表
export const list = param => {
  return request.get(api.list, param)
}

// 商品详情
export const detail = goodsId => {
  return request.get(api.detail, { goodsId })
}
