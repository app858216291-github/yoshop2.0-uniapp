<template>
  <mescroll-body ref="mescrollRef" :sticky="true" @init="mescrollInit" :down="{ use: false }" :up="upOption"
    @up="upCallback">

    <!-- 分类列表tab -->
    <view class="tabs-wrapper">
      <scroll-view class="scroll-view" scroll-x>
        <view class="tab-item" :class="{ active: curId ==  0 }" @click="onSwitchTab(0)">
          <view class="value"><text>全部</text></view>
        </view>
        <!-- 分类列表 -->
        <view class="tab-item" :class="{ active: curId ==  item.category_id }" @click="onSwitchTab(item.category_id)"
          v-for="(item, index) in categoryList" :key="index">
          <view class="value"><text>{{ item.name }}</text></view>
        </view>
      </scroll-view>
    </view>

    <!-- 文章列表 -->
    <view class="article-list">
      <view class="article-item" :class="[`show-type__${item.show_type}`]" v-for="(item, index) in articleList.data"
        :key="index" @click="onTargetDetail(item.article_id)">
        <!-- 小图模式 -->
        <block v-if="item.show_type == 10">
          <view class="article-item__left flex-box">
            <view class="article-item__title twolist-hidden">
              <text>{{ item.title }}</text>
            </view>
            <view class="article-item__footer m-top10">
              <text class="article-views f-24 col-8">{{ item.show_views }}次浏览</text>
            </view>
          </view>
          <view class="article-item__image">
            <image class="image" mode="widthFix" :src="item.image_url"></image>
          </view>
        </block>
        <!-- 大图模式 -->
        <block v-if="item.show_type == 20">
          <view class="article-item__title twolist-hidden">
            <text>{{ item.title }}</text>
          </view>
          <view class="article-item__image m-top20">
            <image class="image" mode="widthFix" :src="item.image_url"></image>
          </view>
          <view class="article-item__footer m-top10">
            <text class="article-views f-24 col-8">{{ item.show_views }}次浏览</text>
          </view>
        </block>
      </view>
    </view>
  </mescroll-body>
</template>

<script>
  import MescrollBody from '@/components/mescroll-uni/mescroll-body.vue'
  import MescrollMixin from '@/components/mescroll-uni/mescroll-mixins'
  import * as ArticleApi from '@/api/article'
  import * as CategoryApi from '@/api/article/category'
  import { getEmptyPaginateObj, getMoreListData } from '@/utils/app'

  const pageSize = 15

  export default {
    components: {
      MescrollBody
    },
    mixins: [MescrollMixin],
    data() {
      return {
        // 分类列表
        categoryList: [],
        // 文章列表
        articleList: getEmptyPaginateObj(),
        // 当前选中的分类id (0则代表首页)
        curId: 0,
        // 上拉加载配置
        upOption: {
          // 首次自动执行
          auto: true,
          // 每页数据的数量; 默认10
          page: { size: pageSize },
          // 数量要大于3条才显示无更多数据
          noMoreSize: 3,
        }
      }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      const app = this
      if (options.categoryId) {
        app.curId = options.categoryId
      }
      // 获取文章分类数据
      app.getCategoryList()
    },

    methods: {

      /**
       * 上拉加载的回调 (页面初始化时也会执行一次)
       * 其中page.num:当前页 从1开始, page.size:每页数据条数,默认10
       * @param {Object} page
       */
      upCallback(page) {
        const app = this
        // 设置列表数据
        app.getArticleList(page.num)
          .then(list => {
            const curPageLen = list.data.length
            const totalSize = list.data.total
            app.mescroll.endBySize(curPageLen, totalSize)
          })
          .catch(() => app.mescroll.endErr())
      },

      // 获取文章分类数据
      getCategoryList() {
        const app = this
        CategoryApi.list()
          .then(result => {
            app.categoryList = result.data.list
          })
      },

      /**
       * 获取文章列表
       * @param {Number} pageNo 页码
       */
      getArticleList(pageNo = 1) {
        const app = this
        return new Promise((resolve, reject) => {
          ArticleApi.list({ categoryId: app.curId, page: pageNo }, { load: false })
            .then(result => {
              // 合并新数据
              const newList = result.data.list
              app.articleList.data = getMoreListData(newList, app.articleList, pageNo)
              resolve(newList)
            })
            .catch(result => reject())
        })
      },

      // 切换选择的分类
      onSwitchTab(categoryId = 0) {
        const app = this
        // 切换当前的分类ID
        app.curId = categoryId
        // 刷新列表数据
        app.articleList = getEmptyPaginateObj()
        app.mescroll.resetUpScroll()
      },

      // 跳转文章详情页
      onTargetDetail(articleId) {
        this.$navTo('pages/article/detail', { articleId })
      }

    },

    /**
     * 分享当前页面
     */
    onShareAppMessage() {
      return {
        title: '文章首页',
        path: "/pages/article/index?" + this.$getShareUrlParams()
      }
    },

    /**
     * 分享到朋友圈
     * 本接口为 Beta 版本，暂只在 Android 平台支持，详见分享到朋友圈 (Beta)
     * https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/share-timeline.html
     */
    onShareTimeline() {
      return {
        title: '文章首页',
        path: "/pages/article/index?" + this.$getShareUrlParams()
      }
    }

  }
</script>

<style lang="scss" scoped>
  /* 顶部选项卡 */

  .container {
    min-height: 100vh;
  }

  .tabs-wrapper {
    position: sticky;
    top: var(--window-top);

    display: flex;
    width: 100%;
    height: 88rpx;
    color: #333;
    font-size: 28rpx;
    background: #fff;
    border-bottom: 1rpx solid #e4e4e4;
    z-index: 100;
    overflow: hidden;
    white-space: nowrap;

  }

  .tab-item {
    display: inline-block;
    padding: 0 15rpx;
    text-align: center;
    min-width: 20%;
    height: 87rpx;
    line-height: 88rpx;
    box-sizing: border-box;

    .value {
      height: 100%;
    }

    &.active .value {
      color: #fd4a5f;
      border-bottom: 4rpx solid #fd4a5f;
    }

  }

  /* 文章列表 */

  .article-list {
    padding-top: 20rpx;
    line-height: 1;
    background: #f7f7f7;
  }


  .article-item {
    margin-bottom: 20rpx;
    padding: 30rpx;
    background: #fff;

    &:last-child {
      margin-bottom: 0;
    }

    .article-item__title {
      max-height: 80rpx;
      font-size: 30rpx;
      color: #333;
    }

    .article-item__image .image {
      display: block;
    }
  }

  /* 小图模式 */
  .show-type__10 {
    display: flex;

    .article-item__left {
      padding-right: 20rpx;
    }

    .article-item__title {
      // min-height: 72rpx;
    }

    .article-item__image .image {
      width: 240rpx;
    }
  }

  /* 大图模式 */
  .show-type__20 .article-item__image .image {
    width: 100%;
  }
</style>
