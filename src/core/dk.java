package member;
import java.sql.*;

import javax.sql.*;//DateSource
import javax.naming.*;//lookup

//DAO: 비즈니스 로직처리
public class MemberDAO {
	//싱글톤 객체 사용: 메모리 저약
	private static MemberDAO instance=new MemberDAO(); //객체 생성

	//생성자

	public MemberDAO(){}

	public static MemberDAO getInstance(){
		return instance;
	}
	//=================
	//커넥션 얻기
	//=================

	private Connection getCon() throws Exception{
		Context ct=new InitialContext();
		DataSource ds=(DataSource)ct.lookup("java:comp/env/jdbc/mysql");
		return ds.getConnection();
	}

	//전역변수
	Connection con=null;
	Statement stmt=null;
	PreparedStatement pstmt=null;
	ResultSet rs=null;
	String sql="";

	//===============
	//id 중복 체크
	//===============

	public int confirmID(String id){
		int x=-100;
		try{
			con=getCon();
			pstmt=con.prepareStatement("select id from member where id=?");

			pstmt.setString(1, id);
			rs=pstmt.executeQuery();
			if(rs.next()){
				x=1; //이미 사용중인 id
			}else{
				x=-1;//사용 가능한 id
			}
		}catch(Exception ex){
			System.out.println("confirmID예외"+ex);
		}finally{
			try{
				if(rs!=null){rs.close();}
				if(pstmt!=null){pstmt.close();}
				if(con!=null){con.close();}
			}catch(Exception ex2){}
		}//finally-end
		return x;
	}//confirmID-end
	//===============
	//회원 가입 insert
	//===============
	public void insertMember(MemberDTO dto){
		try{
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
			System.out.println("insertMember 예외"+ex);
		}finally{
			try{
			if(pstmt!=null){pstmt.close();}
			if(con!=null){con.close();}
			}catch(Exception ex2){}
		}//finally-end
	}//insert-end
	//============
	//로그인,인증
	//============
	public int userCheck(String id,String pw){
		int x=-1;
		String dbpw="";
		try{
			con=getCon();
			pstmt=con.prepareStatement("select pw from member where id=?");
			pstmt.setString(1, id);
			rs=pstmt.executeQuery();

			if(rs.next()){
				dbpw=rs.getString("pw");
				if(pw.equals(dbpw)){//암호가 일치
					x=1;
				}else{//암호 틀릴때
					x=0;
				}//else-end

			}else{//없는 id
				x=-1;
			}//else-end
		}catch(Exception ex){
			System.out.println("userCheck()-예외"+ex);
		}finally{
			try{
				if(rs!=null){rs.close();}
				if(pstmt!=null){pstmt.close();}
				if(con!=null){con.close();}
			}catch(Exception ex2){}
		}//finally-end
		return x;
	}//userCheck()-end
	//===================
	//
	//===================
	public int pwCheck(String id, String pw){
		int x=-100;
		try{
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
			System.out.println("pwcheck예외"+pw);
		}finally{
			try{
				if(rs!=null){rs.close();}
				if(pstmt!=null){pstmt.close();}
				if(con!=null){con.close();}
			}catch(Exception ex2){}
		}//finally-end
		return x;
	}//pwCheck-end
	//=========
	//내정보 수정 fornt-end보낼것
	//=========
	public MemberDTO getMember(String id){
		MemberDTO dto=null;
		try{
			con=getCon();
			pstmt=con.prepareStatement("select * from member where id=?");
			pstmt.setString(1, id);
			rs=pstmt.executeQuery();

			if(rs.next()){
				//rs내용 dto넣기
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

			}//if-end

		}catch(Exception ex){
			System.out.println("getMember 예외"+ex);
		}finally{
			try{
				if(rs!=null){rs.close();}
				if(pstmt!=null){pstmt.close();}
				if(con!=null){con.close();}
			}catch(Exception ex2){}
		}//finally-end
		return dto;
	}//getMember-end
	//=====================
	//DB내정보 수정
	//=====================
	public void updateMember(MemberDTO dto){
		try{
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
			System.out.println("updateMember에러"+ex);
		}finally{
			try{
				if(rs!=null){rs.close();}
				if(pstmt!=null){pstmt.close();}
				if(con!=null){con.close();}
			}catch(Exception ex2){}
		}//finally-end
	}//updatemember-end
	//==================
	// DB글 삭제
	//==================
	public int deleteMember(String id, String pw){
		int x=-100;
		try{
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
				}//else-end
			}//if-end
		}catch(Exception ex){
			System.out.println("deleteMember 예외"+ex);
		}finally{
			try{
				if(rs!=null){rs.close();}
				if(pstmt!=null){pstmt.close();}
				if(con!=null){con.close();}
			}catch(Exception ex2){}
		}//finally=end
		return x;
	}//deleteMember-end
	//======================
	//admin(관리자 로그인)
	//======================
	public int adminLogin(String adminid,String adminpw){
		int x=100;
		try{
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
			System.out.println("admin 에러"+ex);
		}finally{
			try{
				if(rs!=null){rs.close();}
				if(pstmt!=null){pstmt.close();}
				if(con!=null){con.close();}
			}catch(Exception ex2){}
		}//finally-end
		return x;
	}//adminLogin-end

}//class-end
