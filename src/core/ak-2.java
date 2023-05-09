package com.good.neighbor;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import model.notice.NoticeDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.apache.ibatis.session.SqlSession;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import javax.servlet.http.HttpServletRequest;
import java.util.*;
import util.PageTest;


@RequestMapping ("/notice")
@Controller
public class NoticeController {
  @Autowired
  private SqlSession sqlSession;

  @RequestMapping ("/insertForm.do") // ---------------------------------------------------------------------------------------------->
  public String insertForm() {
    return ".main.notice.insertForm";
  }

  // ---------------------------------------------------------------------------------------------->
  @RequestMapping (value = "/insertPro.do", method = RequestMethod.POST)
  public String insertPro (NoticeDTO noticeDTO, HttpServletRequest request) {
      String fixed = request.getParameter("fixed");

      if (fixed == null) {
    sqlSession.insert("noticeDAO.insertNotice", noticeDTO);
    System.out.println("fixed(null):" + fixed);
      }
      else {
        sqlSession.insert("noticeDAO.fixNotice", noticeDTO);
        System.out.println("fixed:" + fixed);
      }
    return "redirect:/notice/list.do";
  }

  // ---------------------------------------------------------------------------------------------->
  @RequestMapping ("list.do")
  public String noticeList (@ModelAttribute ("noticeDTO") NoticeDTO noticeDTO, Model model, HttpServletRequest request, @RequestParam (value = "pageNum", required = false) String pageNum) {
    String keyword = "";
    String keyfield = "";
    if (request.getParameter("keyword") != null) {
         keyword = request.getParameter("keyword");
         keyfield = request.getParameter("keyfield");
        }
        else {
          keyword = "";
          keyfield = "";
        }

    if (pageNum == null) {
      pageNum = "1";
    }

    //int cnt = sqlSession.selectOne("noticeDAO.countNotice");//
      int cnt = 0;
      int curPage = Integer.parseInt(pageNum);
      Map<String, Object> map = new HashMap<String, Object>();
        Map<String, Object> map2 = new HashMap<String, Object>();
      Map<String, Object> map3 = new HashMap<String, Object>();
      if (keyword == null || keyword.length()<1 || keyword == "") {
       cnt = sqlSession.selectOne("noticeDAO.countNotice");
      }
      else {
        map3.put("columnParam", keyfield);
          map3.put("keyword", keyword);
        cnt = sqlSession.selectOne("noticeDAO.searchCount", map3);
      }
    util.PageTest pt = new util.PageTest(cnt, curPage);
    int startpos = pt.getStartRow() - 1;

        List<NoticeDTO> list = null;

        if (keyword == null || keyword.length()<1 || keyword == "") {
          map.put("start", new Integer(startpos));
          map.put("count", new Integer(pt.getPageSize()));

          list = sqlSession.selectList("noticeDAO.selectNotice", map);
        }
        else if (keyword != null || keyword.length()>1) {
          map2.put("columnParam", keyfield);
          map2.put("keyword", keyword);
          map2.put("start", new Integer(startpos));
          map2.put("count", new Integer(pt.getPageSize()));

          list = sqlSession.selectList("noticeDAO.searchNotice", map2);
        }

    if (pt.getEndPage()>pt.getPageCnt()) {
      pt.setEndPage(pt.getPageCnt());
    }
    int number = cnt - (curPage - 1) 3392 pt.getPageSize();

    List<NoticeDTO>fixlist = sqlSession.selectList("noticeDAO.selectFix");


    model.addAttribute("number", number);
    model.addAttribute("pageNum", pageNum);
    model.addAttribute("keyfield", keyfield);
    model.addAttribute("keyword", keyword);
    model.addAttribute("pt", pt);
    model.addAttribute("cnt", cnt);
    model.addAttribute("list", list);
    model.addAttribute("fixlist", fixlist);

    return ".main.notice.list";
  }
  /*
  // ---------------------------------------------------------------------------------------------->
  @RequestMapping ("search.do")
  public String searchPro (HttpServletRequest request, NoticeDTO noticeDTO, @RequestParam (value = "pageNum", required = false) String pageNum, Model model) {
    if (pageNum == null) {
      pageNum = "1";
    }
    String keyword = request.getParameter("keyword");
      String keyfield = request.getParameter("keyfield");
    System.out.println(keyword);
    System.out.println(keyfield);

      int cnt = sqlSession.selectOne("noticeDAO.searchCount");
    System.out.println(cnt);
    int curPage = Integer.parseInt(pageNum);

    util.PageTest pt = new PageTest(cnt, curPage);

    int startpos = pt.getStartRow() - 1;


    Map<String, Object> map = new HashMap<String, Object>();
    map.put("start", new Integer(startpos));
    map.put("count", new Integer(pt.getPageSize()));
    map.put("keyword", keyword);
    map.put("columnParam", keyfield);

    List<NoticeDTO> list = sqlSession.selectList("noticeDAO.searchNotice", map);

    if (pt.getEndPage()>pt.getPageCnt()) {
        pt.setEndPage(pt.getPageCnt());
      }

    int number = cnt - (curPage - 1) 4955 pt.getPageSize();

    model.addAttribute("number", number);
      model.addAttribute("pageNum", pageNum);
      model.addAttribute("pt", pt);
      model.addAttribute("cnt", cnt);
      model.addAttribute("list", list);

      return ".main.notice.search";
  }*/

  // ---------------------------------------------------------------------------------------------->
  @RequestMapping ("content.do")
  public String content (HttpServletRequest request, Model model) {
    String pageNum = request.getParameter("pageNum");
    int num = Integer.parseInt(request.getParameter("notice_number"));
    sqlSession.update("noticeDAO.readCnt", num);

    NoticeDTO dto = sqlSession.selectOne("noticeDAO.oneNotice", num);
    model.addAttribute("dto", dto);
    model.addAttribute("pageNum", pageNum);

    return ".main.notice.content";
  }

  // ---------------------------------------------------------------------------------------------->
  @RequestMapping ("editForm.do")
  public String editForm(HttpServletRequest request, Model model) {
    String pageNum = request.getParameter("pageNum");
    int num = Integer.parseInt(request.getParameter("notice_number"));

    NoticeDTO dto = sqlSession.selectOne("noticeDAO.oneNotice", num);
    model.addAttribute("pageNum", pageNum);
    model.addAttribute("dto", dto);

    return ".main.notice.editForm";

  }
  // ---------------------------------------------------------------------------------------------->
  @RequestMapping (value = "editPro.do", method = RequestMethod.POST)
  public String editPro (NoticeDTO noticeDTO, HttpServletRequest request, Model model) {
    String pageNum = request.getParameter("pageNum");
    String fixed = request.getParameter("fixed");
    if (fixed == null) {
    sqlSession.update("noticeDAO.editNotice", noticeDTO);
    }
    else {
      sqlSession.update("noticeDAO.updateFix", noticeDTO);
    }

    model.addAttribute("pageNum", pageNum);
    return "redirect:/notice/list.do";
  }

  // ---------------------------------------------------------------------------------------------->
  @RequestMapping ("deletePro.do")
  public String deletePro (HttpServletRequest request, Model model)  {
    String pageNum = request.getParameter("pageNum");
    int num = Integer.parseInt(request.getParameter("notice_number"));
    sqlSession.delete("noticeDAO.deleteNotice", num);
    model.addAttribute("pageNum", pageNum);

    return "redirect:/notice/list.do";
  }
}
