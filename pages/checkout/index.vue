<template>
  <view class="container p-bottom" v-if="order.goodsList.length">

    <!-- 快递配送：配送地址 -->
    <view v-if="curDelivery == DeliveryTypeEnum.EXPRESS.value" @click="onSelectAddress" class="flow-delivery">
      <view class="flow-delivery__detail dis-flex flex-y-center">
        <view class="detail-location dis-flex">
          <text class="iconfont icon-dingwei"></text>
        </view>
        <view class="detail-content flex-box">
          <block v-if="order.address">
            <view class="detail-content__title dis-flex">
              <text class="f-30">{{ order.address.name }}</text>
              <text class="detail-content__title-phone f-28">{{ order.address.phone }}</text>
            </view>
            <view class="address detail-content__describe">
              <text class="region" v-for="(region, idx) in order.address.region" :key="idx">{{ region }}</text>
              <text class="detail">{{ order.address.detail }}</text>
            </view>
          </block>
          <block v-else>
            <view class="detail-content__describe dis-flex">
              <text class="col-6">请选择配送地址</text>
            </view>
          </block>
        </view>
        <view class="detail-arrow dis-flex">
          <text class="iconfont icon-xiangyoujiantou"></text>
        </view>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="m-top20">
      <view class="checkout_list" v-for="(item, index) in order.goodsList" :key="index">
        <view class="flow-shopList dis-flex" data-index="index" @click="onTargetGoods(item.goods_id)">
          <!-- 商品图片 -->
          <view class="flow-list-left">
            <image mode="scaleToFill" :src="item.goods_image"></image>
          </view>
          <view class="flow-list-right flex-box">
            <!-- 商品名称 -->
            <text class="goods-name twolist-hidden">{{ item.goods_name }}</text>
            <!-- 商品规格 -->
            <view class="goods-props clearfix">
              <view class="goods-props-item" v-for="(props, idx) in item.skuInfo.goods_props" :key="idx">
                <text class="group-name">{{ props.group.name }}: </text>
                <text>{{ props.value.name }}；</text>
              </view>
            </view>
            <!-- 商品数量和单价 -->
            <view class="flow-list-cont dis-flex flex-x-between flex-y-center">
              <text class="small">×{{ item.total_num }}</text>
              <text class="flow-cont">￥{{ item.goods_price }}</text>
            </view>
          </view>
        </view>
      </view>
      <view class="flow-num-box b-f">
        <text>共{{ order.orderTotalNum }}件商品，合计：</text>
        <text class="flow-money col-m">￥{{ order.orderTotalPrice }}</text>
      </view>
    </view>

    <!-- 商品金额 -->
    <view class="flow-all-money b-f m-top20">
      <view class="flow-all-list dis-flex">
        <text class="flex-five">订单总金额：</text>
        <view class="flex-five t-r">
          <text class="col-m">￥{{ order.orderTotalPrice }}</text>
        </view>
      </view>
      <!-- 优惠券 -->
      <view class="flow-all-list dis-flex">
        <text class="flex-five">优惠券：</text>
        <view class="flex-five t-r">
          <view v-if="order.couponList.length > 0" @click="handleShowPopup()">
            <text class="col-m" v-if="order.couponId > 0">-￥{{ order.couponMoney }}</text>
            <text class="col-m" v-else>有{{ order.couponList.length }}张优惠券</text>
            <text class="right-arrow iconfont icon-xiangyoujiantou"></text>
          </view>
          <text v-else class="">无优惠券可用</text>
        </view>
      </view>
      <!-- 积分抵扣 -->
      <view v-if="order.isAllowPoints" class="points flow-all-list dis-flex flex-y-center">
        <view class="block-left flex-five" @click="handleShowPoints()">
          <text class="title">可用{{ order.setting.points_name }}抵扣：</text>
          <text class="iconfont icon-help"></text>
        </view>
        <view class="flex-five dis-flex flex-x-end flex-y-center">
          <text class="points-money col-m">-￥{{ order.pointsMoney }}</text>
          <u-switch v-model="isUsePoints" size="48" active-color="#07c160" @change="getOrderData()"></u-switch>
        </view>
      </view>
      <!-- 配送费用 -->
      <view v-if="curDelivery == DeliveryTypeEnum.EXPRESS.value" class="dis-flex flow-all-list">
        <text class="flex-five">配送费用：</text>
        <view class="flex-five t-r">
          <view v-if="order.address">
            <text class="col-m" v-if="order.isIntraRegion">+￥{{ order.expressPrice }}</text>
            <text v-else>不在配送范围</text>
          </view>
          <view v-else>
            <text class="col-7">请先选择配送地址</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 支付方式 -->
    <view class="pay-method flow-all-money b-f m-top20">
      <view class="flow-all-list dis-flex">
        <text class="flex-five">支付方式</text>
      </view>
      <!-- 微信支付 -->
      <!-- #ifdef MP-WEIXIN -->
      <view class="pay-item dis-flex flex-x-between" @click="handleSelectPayType(PayTypeEnum.WECHAT.value)">
        <view class="item-left dis-flex flex-y-center">
          <view class="item-left_icon wechat">
            <text class="iconfont icon-weixinzhifu"></text>
          </view>
          <view class="item-left_text">
            <text>{{ PayTypeEnum.WECHAT.name }}</text>
          </view>
        </view>
        <view class="item-right col-m" v-if="curPayType == PayTypeEnum.WECHAT.value">
          <text class="iconfont icon-duihao"></text>
        </view>
      </view>
      <!-- #endif -->
      <!-- 余额支付 -->
      <view class="pay-item dis-flex flex-x-between" @click="handleSelectPayType(PayTypeEnum.BALANCE.value)">
        <view class="item-left dis-flex flex-y-center">
          <view class="item-left_icon balance">
            <text class="iconfont icon-qiandai"></text>
          </view>
          <view class="item-left_text">
            <text>{{ PayTypeEnum.BALANCE.name }}</text>
          </view>
        </view>
        <view class="item-right col-m" v-if="curPayType == PayTypeEnum.BALANCE.value">
          <text class="iconfont icon-duihao"></text>
        </view>
      </view>
    </view>

    <!-- 买家留言 -->
    <view class="flow-all-money b-f m-top20">
      <view class="ipt-wrapper dis-flex flow-all-list">
        <input v-model="remark" placeholder="选填：买家留言（50字以内）"></input>
      </view>
    </view>

    <!-- 提交订单 -->
    <view class="flow-fixed-footer b-f m-top10">
      <view class="dis-flex chackout-box">
        <view class="chackout-left pl-12">实付款：
          <text class="col-m">￥{{ order.orderPayPrice }}</text>
        </view>
        <view class="chackout-right" @click="onSubmitOrder()">
          <view class="flow-btn f-32" :class="{ disabled }">提交订单</view>
        </view>
      </view>
    </view>

    <!-- 积分说明弹窗 -->
    <u-modal v-model="showPoints" :title="`${setting.points_name}说明`">
      <scroll-view class="points-content" :scroll-y="true">
        <text>{{ order.setting.points_describe }}</text>
      </scroll-view>
    </u-modal>

    <!-- 优惠券弹出框 -->
    <u-popup v-model="showPopup" mode="bottom">
      <view class="popup__coupon">
        <view class="coupon__title f-30">选择优惠券</view>
        <!-- 优惠券列表 -->
        <view class="coupon-list">
          <scroll-view :scroll-y="true" style="height: 565rpx;">
            <view class="coupon-item" v-for="(item, index) in order.couponList" :key="index">
              <view class="item-wrapper" :class="[item.is_apply ? 'color-' + CouponColors[index % CouponColors.length] : 'color-gray']"
                @click="handleSelectCoupon(index)">
                <view class="coupon-type">{{ CouponTypeEnum[item.coupon_type].name }}</view>
                <view class="tip dis-flex flex-dir-column flex-x-center">
                  <view v-if="item.coupon_type == CouponTypeEnum.FULL_DISCOUNT.value">
                    <text class="f-30">￥</text>
                    <text class="money">{{ item.reduce_price }}</text>
                  </view>
                  <text class="money" v-if="item.coupon_type == CouponTypeEnum.DISCOUNT.value">{{ item.discount }}折</text>
                  <text class="pay-line">满{{ item.min_price }}元可用</text>
                </view>
                <view class="split-line"></view>
                <view class="content dis-flex flex-dir-column flex-x-between">
                  <view class="title">{{ item.name }}</view>
                  <view class="bottom dis-flex flex-y-center">
                    <view class="time flex-box">
                      <text>有效期：{{ item.start_time }}~{{ item.end_time }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>
        <!-- 不使用优惠券 -->
        <view class="coupon__do_not dis-flex flex-y-center flex-x-center">
          <view class="control dis-flex flex-y-center flex-x-center" @click="handleNotUseCoupon()">
            <text class="f-26">不使用优惠券</text>
          </view>
        </view>
      </view>
    </u-popup>

  </view>

</template>

<script>
  import * as Verify from '@/utils/verify'
  import * as CheckoutApi from '@/api/checkout'
  import { CouponTypeEnum } from '@/common/enum/coupon'
  import DeliveryTypeEnum from '@/common/enum/order/DeliveryType'
  import PayTypeEnum from '@/common/enum/order/PayType'
  import { wxPayment } from '@/utils/app'

  const CouponColors = ['red', 'blue', 'violet', 'yellow']

  export default {
    data() {
      return {
        // 枚举类
        DeliveryTypeEnum,
        PayTypeEnum,
        CouponTypeEnum,
        // 当前页面参数
        options: {},
        // 优惠券颜色组
        CouponColors,
        // 系统设置
        setting: {},
        // 当前选中的配送方式
        curDelivery: null,
        // 当前选中的支付方式
        curPayType: PayTypeEnum.BALANCE.value,
        // 选择的优惠券
        selectCouponId: 0,
        // 是否使用积分抵扣
        isUsePoints: false,
        // 买家留言
        remark: '',
        // 禁用submit按钮
        disabled: false,
        // 是否显示积分说明
        showPoints: false,
        // 是否显示优惠券弹窗
        showPopup: false,
        // 按钮禁用
        disabled: false,
        // 订单信息 (从后端api中获取)
        order: {
          // 商品列表
          goodsList: [],
          // 优惠券列表
          couponList: [],
          // 是否存在收货地址
          existAddress: false,
          // 默认收货地址
          address: null,
          // 是否存在收货地址
          existAddress: false,
          // 当前用户收货城市是否存在配送规则中
          isIntraRegion: true,
          // 是否存在错误
          hasError: false,
          // 错误信息
          errorMsg: '',
        }
      }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      this.options = options
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
      // 获取当前订单信息
      this.getOrderData()
    },

    methods: {

      // 获取订单数据
      getOrderData() {
        const app = this
        // 请求的参数
        const params = {
          delivery: app.curDelivery || 0,
          couponId: app.selectCouponId || 0,
          isUsePoints: app.isUsePoints ? 1 : 0,
        }
        // 请求api
        CheckoutApi.order(app.options.mode, app.getRequestParam())
          .then(result => {
            app.initData(result.data)
          })
          .catch(err => err)
      },

      // 初始化数据
      initData({ order }) {
        const app = this
        app.order = order
        // 显示错误信息
        if (order.hasError) {
          app.$toast(order.errorMsg)
        }
        // 当前选择的配送方式
        app.curDelivery = order.delivery
        // 当前选择支付方式 (如果是微信小程序默认使用微信支付)
        if (app.$platform === 'MP-WEIXIN') {
          app.curPayType = PayTypeEnum.WECHAT.value
        }
      },

      // 获取api请求的参数
      getRequestParam() {
        const app = this
        const { options } = app
        // 结算模式的固定参数
        const modeParam = {}
        // 结算模式: 立即购买
        if (options.mode === 'buyNow') {
          modeParam.goodsId = options.goodsId
          modeParam.goodsNum = options.goodsNum
          modeParam.goodsSkuId = options.goodsSkuId
        }
        // 结算模式: 购物车
        if (options.mode === 'cart') {
          modeParam.cartIds = options.cartIds
        }
        // 订单结算参数(用户选择)
        const orderParam = {
          delivery: app.curDelivery || 0,
          couponId: app.selectCouponId || 0,
          isUsePoints: app.isUsePoints ? 1 : 0,
        }
        return { ...orderParam, ...modeParam }
      },

      // 显示积分说明
      handleShowPoints() {
        this.showPoints = true
      },

      // 显示优惠券弹窗
      handleShowPopup() {
        this.showPopup = true
      },

      // 选择优惠券
      handleSelectCoupon(index) {
        const app = this
        const { couponList } = app.order
        // 当前选择的优惠券
        const couponItem = couponList[index]
        // 判断是否在适用范围
        if (!couponItem.is_apply) {
          app.$toast(couponItem.not_apply_info)
          return
        }
        // 记录选中的优惠券id
        app.selectCouponId = couponItem.user_coupon_id
        // 重新获取订单信息
        app.getOrderData()
        // 隐藏优惠券弹层
        app.showPopup = false
      },

      // 不使用优惠券
      handleNotUseCoupon() {
        const app = this
        app.selectCouponId = 0
        // 重新获取订单信息
        app.getOrderData()
        // 隐藏优惠券弹层
        app.showPopup = false
      },

      // 选择支付方式
      handleSelectPayType(value) {
        this.curPayType = value
      },

      // 快递配送：选择收货地址
      onSelectAddress() {
        this.$navTo('pages/address/index', { from: 'checkout' })
      },

      // 跳转到商品详情页
      onTargetGoods(goodsId) {
        this.$navTo('pages/goods/detail', { goodsId })
      },

      // 订单提交
      onSubmitOrder() {
        const app = this
        if (app.disabled) {
          return false
        }
        // 表单验证
        if (!app.onVerifyFrom()) {
          return false
        }
        // 按钮禁用
        app.disabled = true
        // 请求api
        CheckoutApi.submit(app.options.mode, app.getFormData())
          .then(result => app.onSubmitCallback(result))
          .catch(err => {
            if (err.result) {
              const errData = err.result.data
              if (errData.is_created) {
                app.navToMyOrder()
                return false
              }
            }
            app.disabled = false
          })
      },

      // 订单提交成功后回调
      onSubmitCallback(result) {
        const app = this
        // 发起微信支付
        if (result.data.payType == PayTypeEnum.WECHAT.value) {
          wxPayment(result.data.payment)
            .then(() => app.$success('支付成功'))
            .catch(err => app.$error('订单未支付'))
            .finally(() => {
              app.disabled = false
              app.navToMyOrder()
            })
        }
        // 余额支付
        if (result.data.payType == PayTypeEnum.BALANCE.value) {
          app.$success('支付成功')
          app.disabled = false
          app.navToMyOrder()
        }
      },

      // 跳转到我的订单(等待1秒)
      navToMyOrder() {
        setTimeout(() => {
          this.$navTo('pages/order/index')
        }, 1000)
      },

      // 表单提交的数据
      getFormData() {
        const app = this
        const { options } = app
        // 表单数据
        const form = {
          delivery: app.curDelivery,
          payType: app.curPayType,
          couponId: app.selectCouponId || 0,
          isUsePoints: app.isUsePoints ? 1 : 0,
          remark: app.remark || '',
        }
        // 创建订单-立即购买
        if (options.mode === 'buyNow') {
          form.goodsId = options.goodsId
          form.goodsNum = options.goodsNum
          form.goodsSkuId = options.goodsSkuId
        }
        // 创建订单-购物车结算
        if (options.mode === 'cart') {
          form.cartIds = options.cartIds || null
        }
        return form
      },

      // 表单验证
      onVerifyFrom() {
        const app = this
        if (app.hasError) {
          app.$toast(app.errorMsg)
          return false
        }
        return true
      },

    }
  }
</script>

<style lang="scss" scoped>
  @import "./style.scss";
</style>
