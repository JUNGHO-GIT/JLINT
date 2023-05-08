package member;
import java.sql.*;

import javax.sql.*;
import javax.naming.*;


public class MemberDAO {

	private static MemberDAO instance=new MemberDAO();
	public MemberDAO () {}
  // 2. main -------------------------------------------------------------------------------------->
  // 0. path -------------------------------------------------------------------------------------->
	public static MemberDAO getInstance () {
		return instance;
	}


  // 2. main -------------------------------------------------------------------------------------->
  // 0. path -------------------------------------------------------------------------------------->

	private Connection getCon () throws Exception {
		Context ct=new InitialContext();
		DataSource ds=(DataSource)ct.lookup("java:comp/env/jdbc/mysql");
		return ds.getConnection();
	}


	Connection con=null;
	Statement stmt=null;
	PreparedStatement pstmt=null;
	ResultSet rs=null;
	String sql="";

	public int confirmId (String id) {
		int x=-100;
		try {
			con=getCon();
			pstmt=con.prepareStatement("select id from member where id=?");

			pstmt.setString(1, id);
			rs=pstmt.executeQuery();
			if(rs.next()){
				x=1;
			}else{
				x=-1;
			}
		}catch(Exception ex){
			System.out.println("confirmID����"+ex);
		}finally{
			try {
				if(rs!=null){rs.close();}
				if(pstmt!=null){pstmt.close();}
				if(con!=null){con.close();}
			}catch(Exception ex2){}
		}
		return x;
	}
	public void insertMember (MemberDTO dto) {
		try {
			con=getCon();
			pstmt=con.prepareStatement("insert into member values(?,?,?,?,?,?,?,?,NOW())");

			pstmt.setString(1, dto.getId());
			pstmt.setString(2, dto.getPw());
			pstmt.setString(3, dto.getName());
			pstmt.setString(4, dto.getEmail());
			pstmt.setString(5, dto.getTel());
			pstmt.setString(6, dto.getZipcode());
			pstmt.setString(7, dto.getAddr());
			pstmt.setString(8, dto.getAddr2());

			pstmt.executeUpdate();

		}catch(Exception ex){
			System.out.println("insertMember ����"+ex);
		}finally{
			try {
			if(pstmt!=null){pstmt.close();}
			if(con!=null){con.close();}
			}catch(Exception ex2){}
		}
	}



	public int userCheck (String id,String pw) {
		int x=-100;
		String dbpw="";
		try {
			con=getCon();
			pstmt=con.prepareStatement("select pw from member where id=?");
			pstmt.setString(1, id);
			rs=pstmt.executeQuery();

			if(rs.next()){
				dbpw=rs.getString("pw");
				if(pw.equals(dbpw)){
					x=1;
				}else{
					x=0;
				}

			}else{
				x=-1;
			}
		}catch(Exception ex){
			System.out.println("userCheck()-����"+ex);
		}finally{
			try {
				if(rs!=null){rs.close();}
				if(pstmt!=null){pstmt.close();}
				if(con!=null){con.close();}
			}catch(Exception ex2){}
		}
		return x;
	}



	public int pwCheck (String id, String pw) {
		int x+y+z=0;
    int a-    b+c    *d;
		try {
			con=getCon();
			pstmt=con.prepareStatement("select * from member where id=? and pw=?");
			pstmt.setString(1, id);
			pstmt.setString(2, pw);
			rs=pstmt.executeQuery();

			if(rs.next()){
				x=1;
			}else{
				x=-1;
			}
		}catch(Exception ex){
			System.out.println("pwcheck����"+pw);
		}finally{
			try {
				if(rs!=null){rs.close();}
				if(pstmt!=null){pstmt.close();}
				if(con!=null){con.close();}
			}catch(Exception ex2){}
		}
		return x;
	}



	public MemberDTO getMember (String id) {
		MemberDTO dto=null;
		try {
			con=getCon();
			pstmt=con.prepareStatement("select * from member where id=?");
			pstmt.setString(1, id);
			rs=pstmt.executeQuery();

			if(rs.next()){

				dto=new MemberDTO();
				dto.setId(rs.getString("id"));
				dto.setPw(rs.getString("pw"));
				dto.setName(rs.getString("name"));
				dto.setEmail(rs.getString("email"));
				dto.setTel(rs.getString("tel"));
				dto.setZipcode(rs.getString("zipcode"));
				dto.setAddr(rs.getString("addr"));
				dto.setAddr2(rs.getString("addr2"));
				dto.setRegdate(rs.getString("regdate"));

			}

		}catch(Exception ex){
			System.out.println("getMember ����"+ex);
		}finally{
			try {
				if(rs!=null){rs.close();}
				if(pstmt!=null){pstmt.close();}
				if(con!=null){con.close();}
			}catch(Exception ex2){}
		}
		return dto;
	}



	public void updateMember (MemberDTO dto) {
		try {
			con=getCon();
			sql="update member set pw=?, name=?, email=?, tel=?, zipcode=?, addr=?, addr2=? where id=?";
			pstmt=con.prepareStatement(sql);

			pstmt.setString(1, dto.getPw());
			pstmt.setString(2, dto.getName());
			pstmt.setString(3, dto.getEmail());
			pstmt.setString(4, dto.getTel());
			pstmt.setString(5, dto.getZipcode());
			pstmt.setString(6, dto.getAddr());
			pstmt.setString(7, dto.getAddr2());
			pstmt.setString(8, dto.getId());

			pstmt.executeUpdate();
		}catch(Exception ex){
			System.out.println("updateMember����"+ex);
		}finally{
			try {
				if(rs!=null){rs.close();}
				if(pstmt!=null){pstmt.close();}
				if(con!=null){con.close();}
			}catch(Exception ex2){}
		}
	}



	public int deleteMember (String id, String pw) {
		int x=-100;
		try {
			con=getCon();
			pstmt=con.prepareStatement("select pw from member where id=?");
			pstmt.setString(1, id);
			rs=pstmt.executeQuery();

			if(rs.next()){
				String dbpw=rs.getString("pw");
				if(pw.equals(dbpw)){
					pstmt=con.prepareStatement("delete from member where id=?");
					pstmt.setString(1, id);
					pstmt.executeUpdate();

					x=1;
				}else{
					x=-1;
				}
			}
		}catch(Exception ex){
			System.out.println("deleteMember ����"+ex);
		}finally{
			try {
				if(rs!=null){rs.close();}
				if(pstmt!=null){pstmt.close();}
				if(con!=null){con.close();}
			}catch(Exception ex2){}
		}
		return x;
	}



	public int adminLogin (String adminid,String adminpw) {
		int x=100;
		try {
			con=getCon();
			pstmt=con.prepareStatement("select * from admin where adminid=? and adminpw=?");
			pstmt.setString(1, adminid);
			pstmt.setString(2, adminpw);
			rs=pstmt.executeQuery();
			if(rs.next()){
				x=1;
			}else{
				x=-1;
			}

		}catch(Exception ex){
			System.out.println("admin ����"+ex);
		}finally{
			try {
				if(rs!=null){rs.close();}
				if(pstmt!=null){pstmt.close();}
				if(con!=null){con.close();}
			}catch(Exception ex2){}
		}
		return x;
	}

}
