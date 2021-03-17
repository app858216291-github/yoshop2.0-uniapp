<template>
  <view v-if="!isLoading" class="container">

    <view class="header">
      <!-- 订单状态 -->
      <view class="order-status">
        <view class="status-icon">
          <!-- 进行中的订单 -->
          <block v-if="order.order_status == OrderStatusEnum.NORMAL.value">
            <!-- 待支付 -->
            <block v-if="order.pay_status == PayStatusEnum.PENDING.value">
              <image class="image" src="/static/order/status/wait_pay.png" mode="aspectFit"></image>
            </block>
            <!-- 待发货 -->
            <block v-else-if="order.delivery_status == DeliveryStatusEnum.NOT_DELIVERED.value">
              <image class="image" src="/static/order/status/wait_deliver.png" mode="aspectFit"></image>
            </block>
            <!-- 待收货 -->
            <block v-else-if="order.receipt_status == ReceiptStatusEnum.NOT_RECEIVED.value">
              <image class="image" src="/static/order/status/wait_receipt.png" mode="aspectFit"></image>
            </block>
          </block>
          <!-- 已完成 -->
          <block v-if="order.order_status == OrderStatusEnum.COMPLETED.value">
            <image class="image" src="/static/order/status/received.png" mode="aspectFit"></image>
          </block>
          <!-- 已取消/待取消 -->
          <block v-if="order.order_status == OrderStatusEnum.CANCELLED.value || order.order_status == OrderStatusEnum.APPLY_CANCEL.value">
            <image class="image" src="/static/order/status/close.png" mode="aspectFit"></image>
          </block>
        </view>
        <view class="status-text">
          <text>{{ order.state_text }}</text>
        </view>
      </view>
      <!-- 下一步操作 -->
      <view class="next-action" v-if="order.order_status == OrderStatusEnum.NORMAL.value">
        <view v-if="order.pay_status == PayStatusEnum.PENDING.value" class="action-btn" @click="onPay()">去支付</view>
        <view v-if="order.delivery_status == DeliveryStatusEnum.DELIVERED.value && order.receipt_status == ReceiptStatusEnum.NOT_RECEIVED.value"
          class="action-btn" @click="onReceipt()">确认收货</view>
      </view>
    </view>

    <!-- 快递配送：配送地址 -->
    <view class="delivery-address i-card">
      <view class="link-man">
        <text class="name">{{ order.address.name }}</text>
        <text class="phone">{{ order.address.phone }}</text>
      </view>
      <view class="address">
        <text class="region" v-for="(region, idx) in order.address.region" :key="idx">{{ region }}</text>
        <text class="detail">{{ order.address.detail }}</text>
      </view>
    </view>

    <!-- 物流信息 -->
    <view v-if="order.delivery_type == DeliveryTypeEnum.EXPRESS.value && order.delivery_status == DeliveryStatusEnum.DELIVERED.value"
      class="express i-card" @click="handleTargetExpress()">
      <view class="main">
        <view class="info-item">
          <view class="item-lable">物流公司</view>
          <view class="item-content">
            <text>{{ order.express.express_name }}</text>
          </view>
        </view>
        <view class="info-item">
          <view class="item-lable">物流单号</view>
          <view class="item-content">
            <text>{{ order.express_no }}</text>
            <view class="act-copy" @click.stop="handleCopy(order.express_no)">
              <text>复制</text>
            </view>
          </view>
        </view>
      </view>
      <view class="right-arrow">
        <text class="iconfont icon-xiangyoujiantou"></text>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="goods-list i-card">
      <view class="goods-item" v-for="(goods, idx) in order.goods" :key="idx">
        <view class="goods-main" @click="handleTargetGoods(goods.goods_id)">
          <!-- 商品图片 -->
          <view class="goods-image">
            <image class="image" :src="goods.goods_image" mode="widthFix"></image>
          </view>
          <!-- 商品信息 -->
          <view class="goods-content">
            <view class="goods-title twolist-hidden"><text>{{ goods.goods_name }}</text></view>
            <view class="goods-props clearfix">
              <view class="goods-props-item" v-for="(props, idx) in goods.goods_props" :key="idx">
                <text>{{ props.value.name }}</text>
              </view>
            </view>
          </view>
          <!-- 交易信息 -->
          <view class="goods-trade">
            <view class="goods-price">
              <text class="unit">￥</text>
              <text class="value">{{ goods.goods_price }}</text>
            </view>
            <view class="goods-num">
              <text>×{{ goods.total_num }}</text>
            </view>
          </view>
        </view>
        <!-- 商品售后 -->
        <view class="goods-refund">
          <text v-if="goods.refund" class="stata-text">已申请售后</text>
          <view v-else-if="order.isAllowRefund" class="action-btn" @click.stop="handleApplyRefund(goods.order_goods_id)">申请售后</view>
        </view>
      </view>
    </view>

    <!-- 订单信息 -->
    <view class="order-info i-card">
      <view class="info-item">
        <view class="item-lable">订单编号</view>
        <view class="item-content">
          <text>{{ order.order_no }}</text>
          <view class="act-copy" @click="handleCopy(order.order_no)">
            <text>复制</text>
          </view>
        </view>
      </view>
      <view class="info-item">
        <view class="item-lable">下单时间</view>
        <view class="item-content">
          <text>{{ order.create_time }}</text>
        </view>
      </view>
      <view class="info-item">
        <view class="item-lable">买家留言</view>
        <view class="item-content">
          <text>{{ order.buyer_remark ? buyer_remark : '--' }}</text>
        </view>
      </view>
    </view>

    <!-- 结算信息 -->
    <view class="trade-info i-card">
      <view class="info-item">
        <view class="item-lable">订单金额</view>
        <view class="item-content">
          <text>￥{{ order.total_price }}</text>
        </view>
      </view>
      <view v-if="order.coupon_money > 0" class="info-item">
        <view class="item-lable">优惠券抵扣</view>
        <view class="item-content">
          <text>-￥{{ order.coupon_money }}</text>
        </view>
      </view>
      <view v-if="order.points_money > 0" class="info-item">
        <view class="item-lable">{{ setting.points_name }}抵扣</view>
        <view class="item-content">
          <text>-￥{{ order.points_money }}</text>
        </view>
      </view>
      <view class="info-item">
        <view class="item-lable">运费</view>
        <view class="item-content">
          <text>+￥{{ order.express_price }}</text>
        </view>
      </view>
      <view v-if="order.update_price.value != '0.00'" class="info-item">
        <view class="item-lable">后台改价</view>
        <view class="item-content">
          <text>{{ order.update_price.symbol }}</text>
          <text>￥{{ order.update_price.value }}</text>
        </view>
      </view>
      <view class="divider"></view>
      <view class="trade-total">
        <text class="lable">实付款</text>
        <view class="goods-price">
          <text class="unit">￥</text>
          <text class="value">{{ order.pay_price }}</text>
        </view>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view v-if="order.order_status == OrderStatusEnum.NORMAL.value" class="footer-fixed">
      <view class="btn-wrapper">
        <block v-if="order.delivery_status == DeliveryStatusEnum.NOT_DELIVERED.value">
          <view class="btn-item" @click="onCancel()">取消订单</view>
        </block>
        <block v-if="order.pay_status == PayStatusEnum.PENDING.value">
          <view class="btn-item active" @click="onPay()">去支付</view>
        </block>
        <block v-if="order.delivery_status == DeliveryStatusEnum.DELIVERED.value && order.receipt_status == ReceiptStatusEnum.NOT_RECEIVED.value">
          <view class="btn-item active" @click="onReceipt()">确认收货</view>
        </block>
      </view>
    </view>

    <!-- 支付方式弹窗 -->
    <u-popup v-model="showPayPopup" mode="bottom" border-radius="26" :closeable="true">
      <view class="pay-popup">
        <view class="title">请选择支付方式</view>
        <view class="pop-content">
          <!-- 微信支付 -->
          <!-- #ifdef MP-WEIXIN -->
          <view class="pay-item dis-flex flex-x-between" @click="onSelectPayType(PayTypeEnum.WECHAT.value)">
            <view class="item-left dis-flex flex-y-center">
              <view class="item-left_icon wechat">
                <text class="iconfont icon-weixinzhifu"></text>
              </view>
              <view class="item-left_text">
                <text>{{ PayTypeEnum.WECHAT.name }}</text>
              </view>
            </view>
          </view>
          <!-- #endif -->
          <!-- 余额支付 -->
          <view class="pay-item dis-flex flex-x-between" @click="onSelectPayType(PayTypeEnum.BALANCE.value)">
            <view class="item-left dis-flex flex-y-center">
              <view class="item-left_icon balance">
                <text class="iconfont icon-qiandai"></text>
              </view>
              <view class="item-left_text">
                <text>{{ PayTypeEnum.BALANCE.name }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </u-popup>

  </view>
</template>

<script>
  import {
    DeliveryStatusEnum,
    DeliveryTypeEnum,
    OrderStatusEnum,
    PayStatusEnum,
    PayTypeEnum,
    ReceiptStatusEnum
  } from '@/common/enum/order'
  import * as OrderApi from '@/api/order'
  import { wxPayment } from '@/utils/app'

  export default {
    data() {
      return {
        // 枚举类
        DeliveryStatusEnum,
        DeliveryTypeEnum,
        OrderStatusEnum,
        PayStatusEnum,
        PayTypeEnum,
        ReceiptStatusEnum,
        // 当前订单ID
        orderId: null,
        // 加载中
        isLoading: true,
        // 当前订单详情
        order: {},
        // 当前设置
        setting: {},
        // 支付方式弹窗
        showPayPopup: false
      }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad({ orderId }) {
      // 当前订单ID
      this.orderId = orderId

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
      // 获取当前订单信息
      this.getOrderDetail()
    },

    methods: {

      // 获取当前订单信息
      getOrderDetail() {
        const app = this
        app.isLoading = true
        OrderApi.detail(app.orderId)
          .then(result => {
            app.order = result.data.order
            app.setting = result.data.setting
            app.isLoading = false
          })
      },

      // 复制指定内容
      handleCopy(value) {
        const app = this
        uni.setClipboardData({
          data: value,
          success() {
            app.$toast('复制成功')
          }
        })
      },

      // 跳转到物流跟踪页面
      handleTargetExpress() {
        this.$navTo('pages/order/express/index', { orderId: this.orderId })
      },

      // 跳转到商品详情页面
      handleTargetGoods(goodsId) {
        this.$navTo('pages/goods/detail', { goodsId })
      },

      // 跳转到申请售后页面
      handleApplyRefund(orderGoodsId) {
        this.$navTo('pages/refund/apply', { orderGoodsId })
      },

      // 取消订单
      onCancel() {
        const app = this
        uni.showModal({
          title: '友情提示',
          content: '确认要取消该订单吗？',
          success(o) {
            if (o.confirm) {
              OrderApi.cancel(app.orderId)
                .then(result => {
                  // 显示成功信息
                  app.$success(result.message)
                  // 刷新当前订单数据
                  app.getOrderDetail()
                })
            }
          }
        });
      },

      // 确认收货
      onReceipt() {
        const app = this
        uni.showModal({
          title: '友情提示',
          content: '确认收到商品了吗？',
          success(o) {
            if (o.confirm) {
              OrderApi.receipt(app.orderId)
                .then(result => {
                  // 显示成功信息
                  app.$success(result.message)
                  // 刷新当前订单数据
                  app.getOrderDetail()
                })
            }
          }
        });
      },

      // 点击去支付
      onPay() {
        // 显示支付方式弹窗
        this.showPayPopup = true
      },

      // 选择支付方式
      onSelectPayType(payType) {
        const app = this
        // 隐藏支付方式弹窗
        this.showPayPopup = false
        // 发起支付请求
        OrderApi.pay(app.orderId, payType)
          .then(result => app.onSubmitCallback(result))
          .catch(err => err)
      },

      // 订单提交成功后回调
      onSubmitCallback(result) {
        const app = this
        // 发起微信支付
        if (result.data.pay_type == PayTypeEnum.WECHAT.value) {
          wxPayment(result.data.payment)
            .then(() => {
              app.$success('支付成功')
              setTimeout(() => {
                app.getOrderDetail()
              }, 1500)
            })
            .catch(err => {
              app.$error('订单未支付')
            })
            .finally(() => {
              app.disabled = false
            })
        }
        // 余额支付
        if (result.data.pay_type == PayTypeEnum.BALANCE.value) {
          app.$success('支付成功')
          app.disabled = false
          setTimeout(() => {
            // 刷新当前订单数据
            app.getOrderDetail()
          }, 1500)
        }
      },

    },

  }
</script>

<style>
  page {
    background: #f4f4f4;
  }
</style>
<style lang="scss" scoped>
  .container {
    padding-bottom: 140rpx;
  }

  // 页面顶部
  .header {
    display: flex;
    justify-content: space-between;
    background-color: #e8c269;
    height: 280rpx;
    padding: 56rpx 30rpx 0 30rpx;

    .order-status {
      display: flex;
      align-items: center;
      height: 128rpx;

      .status-icon {
        width: 128rpx;
        height: 128rpx;

        .image {
          display: block;
          width: 100%;
          height: 100%;
        }
      }

      .status-text {
        padding-left: 20rpx;
        color: #fff;
        font-size: 38rpx;
        font-weight: bold;
      }
    }

    .next-action {
      display: flex;
      align-items: center;
      height: 128rpx;

      .action-btn {
        min-width: 152rpx;
        height: 56rpx;
        padding: 0 30rpx;
        line-height: 56rpx;
        background-color: #fff;
        text-align: center;
        border-radius: 28rpx;
        border-color: rgb(102, 102, 102);
        cursor: pointer;
        user-select: none;
        color: #c7a157;
      }
    }
  }

  // 通栏卡片
  .i-card {
    background: #fff;
    padding: 24rpx 24rpx;
    width: 94%;
    box-shadow: 0 1rpx 5rpx 0px rgba(0, 0, 0, 0.05);
    margin: 0 auto 20rpx auto;
    border-radius: 20rpx;
  }

  // 收货地址
  .delivery-address {
    margin-top: -50rpx;

    .link-man {
      line-height: 46rpx;
      color: #333;

      .name {
        margin-right: 10rpx;
      }
    }

    .address {
      margin-top: 12rpx;
      color: #999;
      font-size: 24rpx;

      .detail {
        margin-left: 6rpx;
      }
    }

  }

  // 物流公司
  .express {
    display: flex;
    align-items: center;

    .main {
      flex: 1;
    }

    .info-item {
      display: flex;
      margin-bottom: 24rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .item-lable {
        display: flex;
        align-items: center;
        font-size: 24rpx;
        color: #999;
        margin-right: 30rpx;
      }

      .item-content {
        flex: 1;
        display: flex;
        align-items: center;
        font-size: 26rpx;
        color: #333;

        .act-copy {
          margin-left: 20rpx;
          padding: 2rpx 20rpx;
          font-size: 22rpx;
          color: #666;
          border: 1rpx solid #c1c1c1;
          border-radius: 16rpx;
        }
      }
    }


    // 右侧箭头
    .right-arrow {
      margin-left: 16rpx;
      // color: #777;
      font-size: 26rpx;
    }

  }

  // 商品列表
  .goods-list {

    // 商品项
    .goods-item {
      margin-bottom: 40rpx;

      &:last-child {
        margin-bottom: 0;
      }

      // 商品信息
      .goods-main {
        display: flex;
      }

      // 商品图片
      .goods-image {
        width: 180rpx;
        height: 180rpx;

        .image {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 8rpx;
        }
      }

      // 商品内容
      .goods-content {
        flex: 1;
        padding-left: 16rpx;
        padding-top: 16rpx;

        .goods-title {
          font-size: 26rpx;
          max-height: 76rpx;
        }

        .goods-props {
          margin-top: 14rpx;
          height: 40rpx;
          color: #ababab;
          font-size: 24rpx;
          overflow: hidden;

          .goods-props-item {
            display: inline-block;
            margin-right: 14rpx;
            padding: 4rpx 16rpx;
            border-radius: 12rpx;
            background-color: #F5F5F5;
            width: auto;
          }
        }


      }

      // 交易信息
      .goods-trade {
        padding-top: 16rpx;
        width: 150rpx;
        text-align: right;
        color: $uni-text-color-grey;
        font-size: 26rpx;

        .goods-price {
          vertical-align: bottom;
          margin-bottom: 16rpx;

          .unit {
            margin-right: -2rpx;
            font-size: 24rpx;
          }
        }
      }

      // 商品售后
      .goods-refund {
        display: flex;
        justify-content: flex-end;

        .stata-text {
          font-size: 24rpx;
          color: #999;
        }

        .action-btn {
          border-radius: 28rpx;
          padding: 8rpx 26rpx;
          font-size: 24rpx;
          color: #383838;
          border: 1rpx solid #a8a8a8;
        }

      }

    }

  }

  // 订单信息
  .order-info {

    .info-item {
      display: flex;
      margin-bottom: 24rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .item-lable {
        display: flex;
        align-items: center;
        font-size: 24rpx;
        color: #999;
        margin-right: 30rpx;
      }

      .item-content {
        flex: 1;
        display: flex;
        align-items: center;
        font-size: 26rpx;
        color: #333;

        .act-copy {
          margin-left: 20rpx;
          padding: 2rpx 20rpx;
          font-size: 22rpx;
          color: #666;
          border: 1rpx solid #c1c1c1;
          border-radius: 16rpx;
        }
      }
    }

  }

  // 交易信息
  .trade-info {

    .info-item {
      display: flex;
      margin-bottom: 24rpx;

      .item-lable {
        font-size: 24rpx;
        color: #999;
        margin-right: 24rpx;
      }

      .item-content {
        flex: 1;
        font-size: 26rpx;
        color: #333;
        text-align: right;
      }
    }

    .divider {
      height: 1rpx;
      background: #f1f1f1;
      margin-bottom: 24rpx;
    }

    .trade-total {
      display: flex;
      justify-content: flex-end;

      .goods-price {
        margin-left: 12rpx;
        vertical-align: bottom;
        color: $uni-text-color-active;

        .unit {
          margin-right: -2rpx;
          font-size: 24rpx;
        }

      }
    }

  }


  /* 底部操作栏 */

  .footer-fixed {
    position: fixed;
    bottom: var(--window-bottom);
    left: 0;
    right: 0;
    height: 96rpx;
    z-index: 11;
    box-shadow: 0 -4rpx 40rpx 0 rgba(97, 97, 97, 0.1);
    background: #fff;

    .btn-wrapper {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 0 30rpx;
    }

    .btn-item {
      min-width: 164rpx;
      border-radius: 28rpx;
      padding: 10rpx 24rpx;
      font-size: 28rpx;
      color: #383838;
      text-align: center;
      border: 1rpx solid #a8a8a8;
      margin-left: 24rpx;

      &.active {
        color: #fff;
        border: none;
        background: linear-gradient(to right, #f9211c, #ff6335);
      }
    }


  }

  // 弹出层-支付方式
  .pay-popup {
    padding: 24rpx;

    .title {
      font-size: 30rpx;
      margin-bottom: 50rpx;
      font-weight: bold;
      text-align: center;
    }

    .pop-content {
      min-height: 260rpx;
      padding: 0 10rpx;

      .pay-item {
        padding: 20rpx 35rpx;
        font-size: 28rpx;
        border-bottom: 1rpx solid #f1f1f1;

        &:last-child {
          border-bottom: none;
        }

        .item-left_icon {
          margin-right: 20rpx;
          font-size: 32rpx;

          &.wechat {
            color: #00c800;
          }

          &.balance {
            color: #ff9700;
          }
        }
      }
    }
  }

  //
</style>
