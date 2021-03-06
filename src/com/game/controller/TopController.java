package com.game.controller;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Iterator;
import java.util.List;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import com.game.pojo.Members;
import com.game.pojo.Orders;
import com.game.service.TopService;
import com.game.util.common.gameConstants;

/**
 * top部分
 *
 */

@Controller
public class TopController {
	/**
	 * 未结明细
	 * @return
	 */
	@Autowired
	@Qualifier("topService")
	private TopService topService;
	
	@RequestMapping(value = "/alone")
	public String alone( Model model,HttpSession session, String startime, String endtime){
		System.out.println("成功进来了");
		System.out.println(startime+"+"+endtime);
		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
		Calendar calcur = Calendar.getInstance();
		String currendate = format.format(calcur.getTime());
        Members	menbers=(Members) session.getAttribute(gameConstants.MEMBER_SESSION);
        Integer id = menbers.getMid();
		List<Orders> selectorders = topService.selectorders(id, startime, endtime);
		model.addAttribute("selectorders", selectorders);
		model.addAttribute("currentdate", currendate);
		return "alone";
	}
	/**
	 * 今日已结
	 * @return
	 */
	
	@RequestMapping(value = "/day")
	public String day(Model model,HttpSession session){
		int sum=0;
		 Members	menbers=(Members) session.getAttribute(gameConstants.MEMBER_SESSION);
	        Integer id = menbers.getMid();
		List<Orders> selectNowDateOrder = topService.selectNowDateOrder(id);
		Iterator<Orders> iterator = selectNowDateOrder.iterator();
		while (iterator.hasNext()) {
			Orders Orders =  iterator.next();
			BigDecimal hitamount = Orders.getHitamount();
			
		}
		model.addAttribute("selectNowDateOrder", selectNowDateOrder);
		return "day";
	}

	/**
	 * 报表查询
	 * @return
	 */
/*	
	@RequestMapping(value = "/alone")
	public String alone(){
		return "alone";
	}*/
	/**
	 * 开奖结果
	 * @return
	 */
	@RequestMapping(value = "/result")
	public String result(){
		return "result";
	}
	/**
	 * 个人资讯
	 * @return
	 */
	@RequestMapping(value = "/information")
	public String information(){
		return "information";
	}
	/**
	 * 修改密码
	 * @return
	 */
	@RequestMapping(value = "/change")
	public String change(){
		return "change";
	}
	/**
	 * 游戏规则
	 * @return
	 */
/*	
	@RequestMapping(value = "/alone")
	public String alone(){
		return "alone";
	}*/
	/**
	 * 更换皮肤
	 * @return
	 */
/*	
	@RequestMapping(value = "/alone")
	public String jsks(){
		return "alone";
	}*/
	/**
	 * 未结算金额
	 * @return
	 */
	@RequestMapping(value = "/nobalance")
	public String nobalance(HttpSession session){
		int sum=0;
		Members members	=	(Members) session.getAttribute(gameConstants.MEMBER_SESSION); 
		 //Orders orders= new Orders();
		String a[]= topService.getNobalance(members.getMid());
		for (int i = 0; i < a.length; i++) {
			System.out.println(a[i]+"  ");
		}
		return null;
	}
}
