/**
 *
 */
package com.victor.service.impl;

import com.victor.mapper.AlipayOrderInfoMapper;
import com.victor.pojo.AlipayOrderEntity;
import com.victor.service.CreateAndPayService;
import com.victor.util.LogUtil;
import com.victor.util.RequestUtil;
import org.springframework.stereotype.Service;
import szwx855.base.exception.DBException;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;

/**
 * @author linjian 支付宝回调服务类
 */
@Service("createAndPayService")
public class CreateAndPayServiceImpl implements CreateAndPayService {

    @Resource
    private AlipayOrderInfoMapper alipayOrderInfoMapper;

    /**
     * http://127.0.0.1:7001/CreateAndPayNotify.uig?trade_no=
     * 2014082921001004810019708244
     * &trade_status=TRADE_SUCCESS&out_trade_no=20140113170651382
     * &seller_email=zhaishenghuo.hr@aliyun.com&total_fee=0.01
     */
    public String notifyService(Map<String, String> requestMap) throws Exception {
        // TODO Auto-generated method stub
        LogUtil.debug("【支付宝回调】开始：dt=" + requestMap);
        Thread.sleep(1000);

        // ----------------------------根据支付宝流水号更新表中支付状态开始-----------------------

        AlipayOrderEntity entity = new AlipayOrderEntity();
        String out_trade_no = requestMap.get("out_trade_no");
        entity.setOut_trade_no(out_trade_no);
        List<AlipayOrderEntity> alipayOrderEntities = alipayOrderInfoMapper.queryAlipayOrderInfo(entity);
        if (alipayOrderEntities == null
                || (alipayOrderEntities.size() == 0 || alipayOrderEntities.size() >= 2)) {
            throw new DBException("查询移动支付表信息报错，支付宝流水条数不应大于1条");
        }
        entity = alipayOrderEntities.get(0);
        entity.setTrade_no(requestMap.get("trade_no"));
        entity.setTrade_status(requestMap.get("trade_status"));
        String notify_action_type = requestMap.get("notify_action_type");
        if ("refundFPAction".equalsIgnoreCase(notify_action_type)
                || "reverseAction".equalsIgnoreCase(notify_action_type)) {
            entity.setRefund_fee(requestMap.get("refund_fee"));
        }

        int updateResult = alipayOrderInfoMapper.updateAlipayOrderInfo(entity);

        // 更新不成功。结束事务，并返回给支付宝fail
        if (updateResult != 1) {
            LogUtil.debug("【支付宝回调】更新报错：updateResult=" + updateResult);
            throw new DBException("【支付宝回调】更新报错。");
        }

        // ----------------------------更新支付宝流水号更新表中支付状态结束-----------------------

        // ----------------------------根据支付宝订单号获取第三方回调地址及是否加款等信息开始------------------------
        // -----------------------------调用一卡通充值开始---------------------------
        String response = "success";
        if (entity.getNotify_url() != null
                && !"".equals(entity.getNotify_url())) {
            //验证学校以卡通充值是否已经到账，防止无效退款
            response = RequestUtil.post(entity.getNotify_url(), RequestUtil.orderSendBefore(requestMap).toString());

        } else {
            LogUtil.debug("更新报错：updateResult=" + updateResult);
            response = "success";
        }
        LogUtil.debug("【支付宝回调】回调结束，respons：-----" + response);
        return response;
    }

}
