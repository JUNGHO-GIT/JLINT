package com.good.neighbor;

import java.io.Console;
import java.util.*;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import model.member.MemberDTO;
import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

@RequestMapping ("/member")
@Controller
public class MemberController {

  @Autowired
  private SqlSession sqlSession;
  @RequestMapping ("/insertForm") // ---------------------------------------------------------------------------------------------->
  public String insertForm() {
    return ".main.member.insertForm";
  }

  // ---------------------------------------------------------------------------------------------->
  @RequestMapping ("/agree_TemsofUse.do")
  public String popup1 (HttpSession session) {
    return "/popup/agree_TemsofUse";
  }

  // ---------------------------------------------------------------------------------------------->
  @RequestMapping ("/agree_Privacy_popup.do")
  public String popup2(HttpSession session) {
    return "/popup/agree_Privacy_popup";
  }

  // ---------------------------------------------------------------------------------------------->
  @RequestMapping (value = "idCheck.do", method = RequestMethod.POST)
  public String idCheck (HttpServletRequest request, Model model) {
    int check = -1;
    String member_id = request.getParameter("member_id");
    MemberDTO memberDTO = sqlSession.selectOne("member.selectOne", member_id);
    if (memberDTO == null) {
      check = 1;
    }

    model.addAttribute("check", check);
    return "/member/idCheck";
  }

  // ---------------------------------------------------------------------------------------------->
  @RequestMapping (value = "insertPro.do", method = RequestMethod.POST)
  public String insertPro (@ModelAttribute ("memberDTO") MemberDTO memberDTO, HttpServletRequest request) {
    sqlSession.insert("member.insertMember", memberDTO);
    return ".main.layout";
  }

  // ---------------------------------------------------------------------------------------------->
  @RequestMapping ("/loginForm.do")
  public String loginForm (@CookieValue (value = "rememberMemberId", required = false) String checkbox, Model model) {
    return ".main.member.loginForm";
  }

  // ---------------------------------------------------------------------------------------------->
  @RequestMapping (value = "loginPro.do", method = RequestMethod.POST)
  public String loginPro (HttpServletRequest request, Model model, HttpServletResponse response) {
    String member_id = request.getParameter("member_id");
    String member_pw = request.getParameter("member_pw");
    String checkbox = request.getParameter("rememberId");
    HashMap<String, String> map = new HashMap<String, String>();
    map.put("member_id", member_id);
    map.put("member_pw", member_pw);
    MemberDTO dto = sqlSession.selectOne("member.selectLogin", map);
    Cookie cookie = new Cookie("member_id", member_id);
    System.out.println("checkbox");
    if (checkbox != null) {
      response.addCookie(cookie);
    }
    else {
      cookie.setMaxAge(0);
      response.addCookie(cookie);
    }

    if (dto == null) {
      System.out.println("존재하지 않는 계정입니다.");
      return ".main.member.loginForm";
    }
    model.addAttribute("dto", dto);
    return ".main.member.loginSuccess";
  }

  // ---------------------------------------------------------------------------------------------->
  @RequestMapping ("/logOut.do")
  public String logOut () {
    return ".main.member.logOut";
  }

  // ---------------------------------------------------------------------------------------------->
  @RequestMapping (value = "updateMember.do", method = RequestMethod.POST)
  public String updateMember(HttpServletRequest request, Model model) {
    String member_id = request.getParameter("member_id");
    MemberDTO dto = sqlSession.selectOne("member.selectOne", member_id);
    model.addAttribute("dto", dto);
    return ".main.member.updateMember";
  }

  // ---------------------------------------------------------------------------------------------->
  @RequestMapping (value = "updatePro.do", method = RequestMethod.POST)
  public String updatePro (@ModelAttribute ("memberDTO") MemberDTO memberDTO, Model model, HttpServletRequest request) {
    sqlSession.update("member.updateMember", memberDTO);
    return ".main.member.updateSuccess";
  }

  // ---------------------------------------------------------------------------------------------->
  @RequestMapping (value = "deleteForm.do", method = RequestMethod.POST)
  public String deleteForm (Model model, HttpServletRequest request) {
    String member_id = request.getParameter("member_id");
    model.addAttribute("member_id", member_id);
    return ".main.member.deleteForm";
  }

  // ---------------------------------------------------------------------------------------------->
  @RequestMapping (value = "deletePro.do", method = RequestMethod.POST)
  public String deletePro(HttpServletRequest request) {
    String member_id = request.getParameter("member_id");
    String member_pw = request.getParameter("member_pw");
    System.out.println("member_id :" + member_id);
    System.out.println("member_pw :" + member_pw);
    Map<String, String> map = new HashMap<String, String>();
    map.put("member_id", member_id);
    map.put("member_pw", member_pw);
    sqlSession.delete("member.deleteMember", map);
    return ".main.member.logOut";
  }

  // ---------------------------------------------------------------------------------------------->
  @RequestMapping ("/search_main")
  public String search_main () {
    return ".main.member.search_main";
  }

  // ---------------------------------------------------------------------------------------------->
  @RequestMapping ("/search_id")
  public String search_id() {
    return ".main.member.search_id";
  }

  // ---------------------------------------------------------------------------------------------->
  @RequestMapping (value = "search_id_pro", method = RequestMethod.POST)
  public String searchIdPro (HttpServletRequest request, Model model) {
    String search_tel_name = request.getParameter("search_tel_name");
    String search_tel_number = request.getParameter("search_tel_number");
    System.out.println("member_name : " + search_tel_name);
    System.out.println("member_tel : " + search_tel_number);
    HashMap<String, String> map = new HashMap<String, String>();
    map.put("member_name", search_tel_name);
    map.put("member_tel", search_tel_number);
    MemberDTO dto = sqlSession.selectOne("member.searchId", map);
    model.addAttribute("dto", dto);
    return ".main.member.search_result_id";
  }

  // ---------------------------------------------------------------------------------------------->
  @RequestMapping ("/search_pwd")
  public String search_pwdForm() {
    return ".main.member.search_pwd";
  }

  // ---------------------------------------------------------------------------------------------->
  @RequestMapping (value = "search_pwd.do", method = RequestMethod.POST)
  public String search_pwdPro (HttpServletRequest request, Model model) {
    String writeID_search_pw = request.getParameter("writeID_search_pw");
    MemberDTO dto = sqlSession.selectOne("member.selectOne", writeID_search_pw);
    model.addAttribute("dto", dto);
    return ".main.member.search_pwd_next";
  }

  // ---------------------------------------------------------------------------------------------->
  @RequestMapping ("/search_pwd_next")
  public String search_pwd_nextForm(HttpServletRequest request, Model model) {
    String search_tel_name = request.getParameter("search_tel_name");
    String search_tel_number = request.getParameter("search_tel_number");
    String search_tel_id = request.getParameter("search_tel_id");
    HashMap<String, String> map = new HashMap<String, String>();
    map.put("member_id", search_tel_id);
    map.put("member_name", search_tel_name);
    map.put("member_tel", search_tel_number);
    MemberDTO dto = sqlSession.selectOne("member.searchPw", map);
    model.addAttribute("dto", dto);
    return ".main.member.search_result_pwd";
  }
}
