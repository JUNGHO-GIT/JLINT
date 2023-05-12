          package shopdb;
          //占쏙옙占싹억옙占싸듸옙
          //jdk/jre/lib/ext/cos.jar
          //WebContent/WEB-INF/lib/cos.jar ==>tomcat/lib/cos.jar 占쏙옙 占싫곤옙占쏙옙
          //DAO占쏙옙占쏙옙絿占쏙옙占쏙옙占
          import java.io.File;
          import java.sql.*;
          import java.util.*;

          import javax.sql.*;//DataSource
          import javax.naming.*;//lookupf

          import com.oreilly.servlet.*;//cos.jar
          import com.oreilly.servlet.multipart.*;//cos.jar

          import board.BoardDTO;

          import javax.servlet.http.*;//HttpServletRequest request

            public class ProductDAO {
              //占싱깍옙占쏙옙 占쏙옙체 占쏙옙占
            private ProductDAO(){}

            private static ProductDAO instance=new ProductDAO();

            public static ProductDAO getInstance(){
              return instance;
            }
            //==============
            //커占쌔쇽옙 풀 占쏙옙占
            //==============

            private Connection getCon() throws Exception{
              Context ct=new InitialContext();
              DataSource ds=(DataSource)ct.lookup("java:comp/env/jdbc/mysql");
              return ds.getConnection();
            }

            Connection con=null;
            Statement stmt=null;
            PreparedStatement pstmt=null;
            ResultSet rs=null;
            String sql="";
            //=====================
            //占쏙옙품 占쏙옙占  占쏙옙占쏙옙트
            //=====================
            public List getGoodList(){
              List<ProductDTO> list=new ArrayList<ProductDTO>();
              try{
                con=getCon();
                sql="select * from shop_info";
                stmt=con.createStatement();
                rs=stmt.executeQuery(sql);

                while(rs.next()){
                  //rs占쏙옙占쏙옙占쏙옙 dto占쏙옙 占쏙옙占   dto占쏙옙 list占쏙옙 占쌍는댐옙. 占쌓몌옙占쏙옙 list占쏙옙 占쏙옙占쏙옙占싼댐옙

                  ProductDTO dto=new ProductDTO();

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
                }//while-end
              }catch(Exception ex){
                System.out.println("goodList 占쏙옙占쏙옙"+ex);
              }finally{
                try{
                  if(rs!=null){rs.close();}
                  if(stmt!=null){stmt.close();}
                  if(con!=null){con.close();}
                }catch(Exception ex2){}
              }//finally-end
              return list;
            }//GoodList-end
            }//class-end