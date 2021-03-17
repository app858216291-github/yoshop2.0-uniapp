import request from '@/utils/request'

// api地址
const api = {
  login: 'passport/login',
  captcha: 'passport/captcha',
  sendSmsCaptcha: 'passport/sendSmsCaptcha'
}

// 图形验证码
export function captcha() {
  return request.get(api.captcha, {}, { load: false })
}

// 用户登录
export function login(data) {
  return request.post(api.login, data)
}

// 发送短信验证码
export function sendSmsCaptcha(data) {
  return request.post(api.sendSmsCaptcha, data, { load: false })
}
