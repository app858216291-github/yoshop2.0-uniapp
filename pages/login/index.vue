<template>
  <div>
    <MpWeixin v-if="isShowUserInfo" @success="onGetUserInfoSuccess" />
    <Main v-else :isParty="isExistUserInfo" :partyData="partyData" />
  </div>
</template>

<script>
  import Main from './components/main'
  import MpWeixin from './components/mp-weixin'

  export default {
    components: {
      Main,
      MpWeixin
    },

    data() {
      return {
        // 是否显示获取用户信息组件
        isShowUserInfo: false,
        // 是否已获取到了用户信息
        isExistUserInfo: false,
        // 第三方用户信息数据
        partyData: {}
      }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      const app = this
      // 只有微信小程序才显示获取用户信息按钮
      app.isShowUserInfo = app.$platform === 'MP-WEIXIN'
    },

    methods: {

      // 获取到用户信息的回调函数
      onGetUserInfoSuccess(partyData) {
        this.isShowUserInfo = false
        this.isExistUserInfo = true
        this.partyData = partyData
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
