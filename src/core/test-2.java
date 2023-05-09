package com.good.neighbor;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.apache.ibatis.session.SqlSession;
import javax.servlet.http.HttpServletRequest;
import org.springframework.web.servlet.ModelAndView;
import model.board.BoardDTO;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import util.PageTest;

@RequestMapping ("/board")
@Controller
public class BoardController {

    @Autowired
    private SqlSession sqlSession;

    @RequestMapping ("/writeForm.do") // -------------------------------------------------------------------------------------------->
    public String writeForm(Model model, HttpServletRequest request) {

      String board_num = request.getParameter("board_num");
      String board_ref = request.getParameter("board_ref");
      String board_re_step = request.getParameter("board_r");
      String board_re_level = request.getParameter("board_re_level");
      String pageNum = request.getParameter("pageNum");

      if (board_num == null) {
        board_num = "0";
        board_ref = "1";
        board_re_step = "0";
        board_re_level = "0";
      }
      else {

      }

      model.addAttribute("pageNum", pageNum);
      model.addAttribute("board_num", board_num);
      model.addAttribute("board_ref", board_ref);
      model.addAttribute("board_re_step", board_re_step);
      model.addAttribute("board_re_level", board_re_level);


      return ".main.board.writeForm";

    }



    // -------------------------------------------------------------------------------------------->
    @RequestMapping (value = "writePro.do", method = RequestMethod.POST)
    public String writePro (@ModelAttribute ("boardDTO") BoardDTO boardDTO, HttpServletRequest request) {

      int maxNum = 0;

      if (sqlSession.selectOne("board.numMax") != null) {
        maxNum = sqlSession.selectOne("board.numMax");
      }

      if (maxNum != 0) {
        maxNum = maxNum + 1;
      }
      else {
        maxNum = 1;
      }


      String ip = request.getRemoteAddr();
      boardDTO.setBoard_ip(ip);

      if (boardDTO.getBoard_num() != 0) {


        sqlSession.update("board.reStep", boardDTO);
        boardDTO.setBoard_re_step(boardDTO.getBoard_re_step() + 1);
        boardDTO.setBoard_re_level(boardDTO.getBoard_re_level() + 1);

        System.out.println("re_level = " + boardDTO.getBoard_re_level());
      }
      else {
        boardDTO.setBoard_ref(new Integer(maxNum));
        boardDTO.setBoard_re_step(new Integer(0));
        boardDTO.setBoard_re_level(new Integer(0));

      }
      sqlSession.insert("board.insertDAO", boardDTO);
      return "redirect:/board/list.do";

    }

       // ----------------------------------------------------------------------------------------->
       @RequestMapping ("list.do")
       public String listBoard (@ModelAttribute ("boardDTO") BoardDTO boardDTO, Model model, HttpServletRequest request, @RequestParam (value = "pageNum", required = false) String pageNum) {
         String keyWord = "";
         String keyField = "";
         if (request.getParameter("keyWord") != null) {
             keyWord = request.getParameter("keyWord");
             keyField = request.getParameter("keyField");
            }
            else {
              keyWord = "";
              keyField = "";
            }

          if (pageNum == null) {
             pageNum = "1";
          }


            int cnt = 0;
            int curPage = Integer.parseInt(pageNum);
            Map<String, Object> map = new HashMap<String, Object>();
             Map<String, Object> map2 = new HashMap<String, Object>();
            Map<String, Object> map3 = new HashMap<String, Object>();
            if (keyWord == null || keyWord.length()<1 || keyWord == "") {
             cnt = sqlSession.selectOne("board.selectCount");
            }
            else {
              map3.put("columnParam", keyField);
               map3.put("keyWord", keyWord);
              cnt = sqlSession.selectOne("board.searchCount", map3);
            }
          util.PageTest pt = new util.PageTest(cnt, curPage);
          int startpos = pt.getStartRow() - 1;

            List<BoardDTO> list = null;

            if (keyWord == null || keyWord.length()<1 || keyWord == "") {
              map.put("start", new Integer(startpos));
              map.put("count", new Integer(pt.getPageSize()));

              list = sqlSession.selectList("board.selectListBoard", map);

            }
            else if (keyWord != null || keyWord.length()>1) {
              map2.put("columnParam", keyField);
              map2.put("keyWord", keyWord);
              map2.put("start", new Integer(startpos));
              map2.put("count", new Integer(pt.getPageSize()));

              list = sqlSession.selectList("board.selectSeachBoard", map2);
            }

          if (pt.getEndPage()>pt.getPageCnt()) {
             pt.setEndPage(pt.getPageCnt());
          }
          int number = cnt - (curPage - 1) * pt.getPageSize();



          model.addAttribute("number", number);
          model.addAttribute("pageNum", pageNum);
          model.addAttribute("keyField", keyField);
          model.addAttribute("keyWord", keyWord);
          model.addAttribute("pt", pt);
 asdfas + asdfasdfad + asdfsadf -  -  -  - xcvxcv || Asdfasdf
          model.addAttribute("cnt", cnt);
          model.addAttribute("list", list);

          return ".main.board.list";
       }





    // -------------------------------------------------------------------------------------------->
    @RequestMapping ("content.do")
    public String contentDo (Model model, HttpServletRequest request) {

      String pageNum = request.getParameter("pageNum");

      int num1 = Integer.parseInt(request.getParameter("board_num"));
      sqlSession.update("board.readCount", num1);

      BoardDTO dto = sqlSession.selectOne("board.selectOneBoard", num1);

      model.addAttribute("pageNum", pageNum);
      model.addAttribute("dto", dto);


      return ".main.board.content";
    }




    // -------------------------------------------------------------------------------------------->
    @RequestMapping ("updateForm.do")
    public ModelAndView updateForm(HttpServletRequest request) {

      String pageNum = request.getParameter("pageNum");
      int board_num = Integer.parseInt(request.getParameter("board_num"));
      BoardDTO dto = sqlSession.selectOne("board.selectOneBoard", board_num);

      ModelAndView mv = new ModelAndView();
      mv.addObject("board_num", board_num);
      mv.addObject("pageNum", pageNum);
      mv.addObject("dto", dto);


        mv.setViewName(".main.board.updateForm");
      return mv;
    }





    // -------------------------------------------------------------------------------------------->
    @RequestMapping (value = "updatePro.do", method = RequestMethod.POST)
    public ModelAndView updatePro (@ModelAttribute ("boardDTO") BoardDTO boardDTO, HttpServletRequest request) {

      String pageNum = request.getParameter("pageNum");
      sqlSession.update("board.updateBoard", boardDTO);

      ModelAndView mv = new ModelAndView();
      mv.addObject("pageNum", pageNum);
      mv.setViewName("redirect:/board/list.do");
      return mv;
    }




    // -------------------------------------------------------------------------------------------->
    @RequestMapping ("deletePro.do")
    public String deletePro (Model model, String board_num, String pageNum) {

      sqlSession.delete("board.deleteBoard", new Integer(board_num));
      model.addAttribute("pageNum", pageNum);

      return "redirect:/board/list.do";
    }


        // ---------------------------------------------------------------------------------------->
        @RequestMapping (value = "deletePro.do", method = RequestMethod.POST)
        public String deletePro (HttpServletRequest request) {

          String board_pw = request.getParameter("board_pw");


          Map<String, String> map = new HashMap<String, String>();

          map.put("board_pw", board_pw);

          sqlSession.delete("board.deleteMember", map);
          return "redirect:/board/list.do";
        }


}
