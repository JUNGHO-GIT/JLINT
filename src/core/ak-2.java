package com.good.neighbor;

import java.util.*;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import model.admin.AdminDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@RequestMapping("/admin")
@Controller
public class AdminController {

	@Autowired
	private SqlSession sqlSession;

	//--------------------------- - //회원가입
	@RequestMapping("/insertForm.do")
	public String insertForm() {
		return ".main.admin.insertForm";
	}

	@RequestMapping(value = "/insertPro", method = RequestMethod.POST)
	public String insertPro(HttpServletRequest request, Model model, AdminDTO adminDTO) {
		sqlSession.insert("admin.insertAdmin", adminDTO);

		return ".main.layout";
	}

	//----------------------------- - //아이디 중복 체크

	@RequestMapping(value = "idCheck.do", method = RequestMethod.POST)
	public String idCheck(HttpServletRequest request, Model model) {
		int check = -1;
		String admin_id = request.getParameter("admin_id");
		AdminDTO adminDTO = sqlSession.selectOne("admin.selectOne", admin_id);

		if (adminDTO == null) {
			check = 1;
		}

		model.addAttribute("check", check);
		return "/admin/idCheck";
	}

	//--------------------------- - //===========================================

	//로그인창

	@RequestMapping("/loginForm.do")
	public String loginForm() {
		return ".main.admin.loginForm";
	}

	@RequestMapping(value = "/loginPro", method = RequestMethod.POST)
	public String loginPro(HttpServletRequest request, Model model) {
		String admin_id = request.getParameter("admin_id");
		String admin_pw = request.getParameter("admin_pw");

		HashMap<String, String> map = new HashMap<String, String>();

		map.put("admin_id", admin_id);
		map.put("admin_pw", admin_pw);

		AdminDTO dto = sqlSession.selectOne("admin.selectLogin", map);

		model.addAttribute("dto", dto);

		return ".main.admin.loginSuccess";
	}

	//-------------------- - //로그아웃

	@RequestMapping("/logOut.do")
	public String logOut() {
		return ".main.admin.logOut";
	}
}
