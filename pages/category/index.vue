<template>
  <view class="container">
    <!-- 搜索框 -->
    <search tips="搜索商品" @event="$navTo('pages/search/index')" />

    <!-- 分类样式：一级分类(大图) 10 -->
    <view class="cate-content" v-if="templet.style == 10 && list.length > 0">
      <view class="cate-wrapper cate_style__10">
        <scroll-view :scroll-y="true" :style="{ height: `${scrollHeight - 10}px` }">
          <view class="cate-item" v-for="(item, index) in list" :key="index" @click="onTargetGoodsList(item.category_id)">
            <image mode="widthFix" :src="item.image.preview_url"></image>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 分类样式：一级分类(小图) 11 -->
    <view class="cate-content" v-else-if="templet.style == 11 && list.length > 0">
      <view class="cate-wrapper cate_style__11">
        <scroll-view class="clear" :scroll-y="true" :style="{ height: `${scrollHeight - 10}px` }">
          <view class="cate-item" v-for="(item, index) in list" :key="index" @click="onTargetGoodsList(item.category_id)">
            <image v-if="item.image" mode="widthFix" :src="item.image.preview_url"></image>
            <text class="f-26">{{ item.name }}</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 分类样式：二级分类 20 -->
    <view class="cate-content dis-flex" v-else-if="templet.style == 20 && list.length > 0">

      <!-- 左侧 一级分类 -->
      <scroll-view class="cate-left f-28" :scroll-y="true" :style="{ height: `${scrollHeight}px` }">
        <text class="type-nav" :class="{ selected: curIndex == index }" v-for="(item, index) in list" :key="index"
          @click="handleSelectNav(index)">{{ item.name }}</text>
      </scroll-view>

      <!-- 右侧 二级分类 -->
      <scroll-view class="cate-right b-f" :scroll-top="scrollTop" :scroll-y="true" :style="{ height: `${scrollHeight}px` }">
        <view v-if="list[curIndex]">
          <view class="cate-right-cont">
            <view class="cate-two-box">
              <view class="cate-cont-box">
                <view class="flex-three" v-for="(item, idx) in list[curIndex].children" :key="idx" @click="onTargetGoodsList(item.category_id)">
                  <view class="cate-img">
                    <image v-if="item.image" :src="item.image.preview_url"></image>
                  </view>
                  <text>{{ item.name }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
    <empty v-if="!list.length" :isLoading="isLoading" />
  </view>
</template>

<script>
  import { setCartTabBadge } from '@/utils/app'
  import SettingKeyEnum from '@/common/enum/setting/Key'
  import SettingModel from '@/common/model/Setting'
  import * as CategoryApi from '@/api/category'
  import Search from '@/components/search'
  import Empty from '@/components/empty'

  const App = getApp()

  export default {
    components: {
      Search,
      Empty
    },
    data() {
      return {
        // 列表高度
        scrollHeight: 0,
        // 一级分类：指针
        curIndex: 0,
        // 内容区竖向滚动条位置
        scrollTop: 0,
        // 分类列表
        list: [],
        // 分类模板设置
        templet: {},
        // 正在加载中
        isLoading: true
      }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
      const app = this
      // 设置分类列表高度
      app.setListHeight()
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
      const app = this
      // 获取页面数据
      app.getPageData()
      // 更新购物车角标
      setCartTabBadge()
    },

    methods: {

      /**
       * 获取页面数据
       */
      getPageData() {
        const app = this
        app.isLoading = true
        Promise.all([
            // 获取分类模板设置
            SettingModel.data(),
            // 获取分类列表
            CategoryApi.list()
          ])
          .then(result => {
            // 初始化分类模板设置
            app.initTemplet(result[0])
            // 初始化分类列表数据
            app.initCategory(result[1])
          })
          .finally(() => app.isLoading = false)
      },

      /**
       * 初始化分类模板设置
       * @param {Object} result
       */
      initTemplet(setting) {
        this.templet = setting[SettingKeyEnum.PAGE_CATEGORY_TEMPLATE.value]
      },

      /**
       * 初始化分类列表数据
       * @param {Object} result
       */
      initCategory(result) {
        const app = this
        const data = result.data
        app.list = data.list
      },

      /**
       * 设置分类列表高度
       */
      setListHeight() {
        const app = this
        uni.getSystemInfo({
          success(res) {
            app.scrollHeight = res.windowHeight - 47
          }
        })
      },

      // 一级分类：选中分类
      handleSelectNav(index) {
        const app = this
        app.curIndex = index
        app.scrollTop = 0
      },

      // 跳转至商品列表页
      onTargetGoodsList(categoryId) {
        this.$navTo('pages/goods/list', { categoryId })
      }

    },

    /**
     * 设置分享内容
     */
    onShareAppMessage() {
      const app = this
      return {
        title: _this.templet.shareTitle,
        path: '/pages/category/index?' + app.$getShareUrlParams()
      }
    },

    /**
     * 分享到朋友圈
     * 本接口为 Beta 版本，暂只在 Android 平台支持，详见分享到朋友圈 (Beta)
     * https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/share-timeline.html
     */
    onShareTimeline() {
      const app = this
      return {
        title: _this.templet.shareTitle,
        path: '/pages/category/index?' + app.$getShareUrlParams()
      }
    }

  }
</script>

<style>
  page {
    background: #fff;
  }
</style>
<style lang="scss" scoped>
  .cate-content {
    background: #fff;
  }

  .cate-wrapper {
    padding: 0 20rpx 20rpx 20rpx;
    box-sizing: border-box;
  }

  /* 一级分类(大图) 10 */

  .cate_style__10 .cate-item {
    margin-bottom: 18rpx;
  }

  .cate_style__10 .cate-item:last-child {
    margin-bottom: 0;
  }

  .cate_style__10 .cate-item image {
    display: block;
    width: 100%;
    height: auto;
  }

  /* 一级分类(小图) 11 */

  .cate_style__11 .cate-item {
    float: left;
    padding: 25rpx;
    width: 33.3333%;
    text-align: center;
    box-sizing: border-box;
  }

  .cate_style__11 .cate-item image {
    /* height: 208.656rpx; */
    width: 100%;
    display: block;
  }

  .cate_style__11 .cate-item image {
    display: block;
    width: 100%;
    margin-bottom: 10rpx;
  }

  .cate_style__11 .cate-item text {
    display: block;
    color: #555;
  }

  /* 二级分类 20 */

  .cate-content {
    width: 100%;
  }

  .cate-left {
    flex-direction: column;
    display: flex;
    width: 200rpx;
    color: #444;
    height: 100%;
    background: #f8f8f8;
  }

  .cate-right {
    display: flex;
    flex-direction: column;
    width: 550rpx;
    height: 100%;
    overflow: hidden;
  }

  .cate-right-cont {
    width: 100%;
    display: flex;
    flex-flow: row wrap;
    align-content: flex-start;
    padding-top: 26rpx;
  }

  .type-nav {
    position: relative;
    height: 90rpx;
    line-height: 90rpx;
    text-align: center;
    z-index: 10;
    display: block;
    font-size: 26rpx;
  }

  .type-nav.selected {
    background: #fff;
    color: #fa2209;
    border-right: none;
    font-size: 28rpx;
  }

  .cate-cont-box {
    margin-bottom: 30rpx;
    padding-bottom: 10rpx;
    background: #fff;
    overflow: hidden;
  }

  .cate-cont-box .cate-img {
    padding: 13rpx 10rpx 4rpx 10rpx;
  }

  .cate-cont-box .cate-img image {
    width: 100%;
    height: 150rpx;
    border-radius: 10rpx;
  }

  .cate-cont-box text {
    text-align: center;
    display: block;
    font-size: 26rpx;
    padding-bottom: 14rpx;
    color: #444;
    padding: 0 15rpx 30rpx 15rpx;
  }

  .cate-two-box {
    width: 100%;
    padding: 0 10px;
  }
</style>
