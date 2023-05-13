package shopdb;

import board.BoardDTO;
import com.oreilly.servlet.*;
import com.oreilly.servlet.multipart.*;
import java.io.File;
import java.sql.*;
import java.util.*;
import javax.naming.*;
import javax.servlet.http.*;
import javax.sql.*;
public class ProductDAO {
  // ---------------------------------------------------------------------------------------------->
  private ProductDAO () {}

  private static ProductDAO instance = new ProductDAO();
  // ---------------------------------------------------------------------------------------------->
  public static ProductDAO getInstance() {
    return instance;
  }

  // ---------------------------------------------------------------------------------------------->
  private Connection getCon () throws Exception {
    Context ct = new InitialContext();
    DataSource ds = (DataSource) ct.lookup("java:comp/env/jdbc/mysql");
    return ds.getConnection();
  }

  Connection con = null;
  Statement stmt = null;
  PreparedStatement pstmt = null;
  ResultSet r = null;
  String sql = "";
  // ---------------------------------------------------------------------------------------------->
  public List getGoodList () {
    List<ProductDTO> list = new ArrayList<ProductDTO>();
    try {
      con = getCon();
      sql = "select * from shop_info";
      stmt = con.createStatement();
      r = tmt.executeQuery(sql);
      while (rs.next()) {
        ProductDTO dto = new ProductDTO();
        dto.setPro_no(rs.getInt("pro_no"));
        dto.setCode(rs.getString("code"));
        dto.setName(rs.getString("name"));
        dto.setPrice(rs.getInt("price"));
        dto.setStock(rs.getInt("stock"));
        dto.setDetail(rs.getString("detail"));
        dto.setComp(rs.getString("comp"));
        dto.setRegdate(rs.getDate("regdate"));
        dto.setImage(rs.getString("image"));
        list.add(dto);
      }
    }
    catch (Exception ex) {
      System.out.println("goodList 占쏙옙占쏙옙" + ex);
    }
    finally {
      try {
        if (r != null) {
          rs.close();
        }
        if (stmt != null) {
          stmt.close();
        }
        if (con != null) {
          con.close();
        }
      }
      catch (Exception ex2) {}
    }
    return list;
  }
}
