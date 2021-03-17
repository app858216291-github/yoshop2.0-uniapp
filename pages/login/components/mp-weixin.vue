<template>
  <view v-show="code" class="container">
    <view class="wechatapp">
      <view class="header">
        <open-data class="avatar" type="userAvatarUrl"></open-data>
      </view>
    </view>
    <view class="auth-title">申请获取以下权限</view>
    <view class="auth-subtitle">获得你的公开信息（昵称、头像等）</view>
    <view class="login-btn">
      <button class="button btn-normal" open-type="getUserInfo" lang="zh_CN" @getuserinfo="getUserInfo">授权登录</button>
    </view>
    <view class="no-login-btn">
      <button class="button btn-normal" @click="handleCancel">暂不登录</button>
    </view>
  </view>
</template>

<script>
  export default {

    data() {
      return {
        // 微信小程序登录凭证 (code)
        code: ''
      }
    },

    created() {
      // 获取code
      this.getCode()
    },

    methods: {

      // 获取code
      // https://developers.weixin.qq.com/miniprogram/dev/api/open-api/login/wx.login.html
      getCode() {
        uni.login({
          provider: 'weixin',
          success: res => {
            this.code = res.code
            console.log(res)
          }
        })
      },

      /**
       * 授权登录
       */
      getUserInfo(e) {
        const app = this
        if (e.detail.errMsg === 'getUserInfo:ok') {
          app.$emit('success', {
            oauth: 'MP-WEIXIN', // 第三方登录类型: MP-WEIXIN
            code: app.code, // 微信登录的code, 用于换取openid
            userInfo: JSON.parse(e.detail.rawData) // 微信用户信息
          })
        }
      },

      /**
       * 暂不登录
       */
      handleCancel() {
        // 跳转回原页面
        this.onNavigateBack()
      },

      /**
       * 授权成功 跳转回原页面
       */
      onNavigateBack(delta = 1) {
        uni.navigateBack({
          delta: Number(delta)
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .container {
    padding: 0 60rpx;
    font-size: 32rpx;
    background: #fff;
    min-height: 100vh;
  }

  .wechatapp {
    padding: 80rpx 0 48rpx;
    border-bottom: 1rpx solid #e3e3e3;
    margin-bottom: 72rpx;
    text-align: center;

    .header {
      width: 190rpx;
      height: 190rpx;
      border: 4rpx solid #fff;
      margin: 0 auto 0;
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 2rpx 0 10rpx rgba(50, 50, 50, 0.3);
    }
  }

  .auth-title {
    color: #585858;
    font-size: 34rpx;
    margin-bottom: 40rpx;
  }

  .auth-subtitle {
    color: #888;
    margin-bottom: 88rpx;
    font-size: 28rpx;
  }

  .login-btn {
    padding: 0 20rpx;

    .button {
      height: 88rpx;
      line-height: 88rpx;
      background: #04be01;
      color: #fff;
      font-size: 30rpx;
      border-radius: 999rpx;
      text-align: center;
    }
  }


  .no-login-btn {
    margin-top: 20rpx;
    padding: 0 20rpx;

    .button {
      height: 88rpx;
      line-height: 88rpx;
      background: #dfdfdf;
      color: #fff;
      font-size: 30rpx;
      border-radius: 999rpx;
      text-align: center;
    }
  }
</style>
