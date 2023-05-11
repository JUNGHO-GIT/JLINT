                                                        <%@ page language="java" contentType="text/html; charset=UTF-8"
                                                            pageEncoding="UTF-8"%>
                                                        <%@ include file="/header/header.jsp" %>
                                                        <%--inputForm.jsp --%>


                                                        <link rel="stylesheet" type="text/css"
                                                          href="${ctxpath}/css/inputForm_css.css">

                                                        <html>
                                                        <head>
                                                          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                                                          <title>Insert title here</title>




                                                          <script src="//code.jquery.com/jquery-3.6.0.min.js"></script>
                                                          <script type="text/javascript" src="aa.js"></script>

                                                          <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>

                                                          <script>
                                                          function findAddr(){

                                                            new daum.Postcode({
                                                              oncomplete:function(data){
                                                                document.getElementById('zipcode').value=data.zonecode;
                                                                document.getElementById('addr').value=data.address;
                                                              }
                                                            }).open();
                                                          }//openDaumPostcode()------

                                                          </script>

                                                          <script type="text/javascript">
                                                            //Ajax으로 id중복 체크
                                                          function idCheck(){
                                                              if($('#id').val()==''){
                                                                alert("id를 입력 하세요");
                                                                $('#id').focus();
                                                                return false;
                                                              }else{
                                                                $.ajax({
                                                                  type:"POST",
                                                                  url:"confirmID.jsp",
                                                                  data:"id="+$('#id').val(),
                                                                  dataType:"JSON",
                                                                  success:function(data){
                                                        //					console.log("data=" + data.x);
                                                                    if(data.x==1){
                                                                      //사용중인 id
                                                                      alert("사용 중인 id입니다");
                                                                      $('#id').val('').focus();
                                                                    }else{//-1
                                                                      //사용가능한 id
                                                                      alert("사용 가능한id입니다");
                                                                      $('#idck').val('true');
                                                                      $('#pw').focus();
                                                                    }
                                                                  }//success-end
                                                                })//$.ajax-end

                                                              }//else-end
                                                            }//idCheck()-end


                                                            function aa(){
                                                              if($('#idck').val()=='false'){
                                                                alert("id중복 체크 하세요");
                                                                $('#id').focus();
                                                                return false;
                                                              }//if-end
                                                            }//aa()-end
                                                          </script>
                                                        </head>
                                                        <body>

                                                          <h2>회원가입</h2>
                                                          <form name="inputForm" method="post" action="${ctxpath}/member/inputPro.do" onSubmit="return check2()">
                                                          <table  class = "dataTable">
                                                            <tr>
                                                              <td>ID</td>
                                                              <td>
                                                                <input class="text_box_2" type="text" name="id" id="id" size="20" placeholder="id입력">
                                                                <input type="hidden" name="idck" id="idck" value="false">
                                                                <input class = "button" type="button" value="ID중복체크" onClick="idCheck()">
                                                              </td>
                                                            </tr>


                                                            <tr>
                                                              <td>암호</td>
                                                              <td><input type="password" name="pw" id="pw" size="12" onFocus="aa()">
                                                              </td>
                                                            </tr>


                                                            <tr>
                                                              <td>암호확인</td>
                                                                <td>
                                                                  <input type="password" name="pw2" id="pw2" size="12">
                                                                </td>
                                                            </tr>



                                                            <tr>
                                                              <td>이름</td>
                                                              <td>
                                                                <input class="text_box" type="text" name="name" id="name" size="30" placeholder="입력">
                                                              </td>
                                                            </tr>

                                                            <tr>
                                                                <td>이메일</td>
                                                                <td>
                                                                  <input class="text_box" type="text" name="email" id="email" size="30" placeholder="OOO@naver.com">
                                                                </td>
                                                              </tr>


                                                              <tr>
                                                                    <td>전화</td>
                                                                    <td>
                                                                      <input class="text_box"  type="text" name="tel" id="tel" size="14" placeholder="전화번호입력">
                                                                    </td>
                                                                  </tr>


                                                            <tr>
                                                                    <td>우편번호</td>
                                                                    <td>
                                                                      <input  class="text_box_2"  type="text" name="zipcode" id="zipcode" size="7">
                                                                      <input class = "button" type="button" value="주소찾기" onClick="findAddr()">
                                                                    </td>
                                                                  </tr>

                                                                      <tr>
                                                                      <td>주소</td>
                                                                      <td>
                                                                        <input class="text_box" type="text" name="addr" id="addr" size="50" readonly>
                                                                      </td>
                                                                  </tr>

                                                                  <tr>
                                                                      <td>상세주소</td>
                                                                      <td>
                                                                        <input class="text_box" type="text" name="addr2" id="addr2" size="20" >
                                                                      </td>
                                                                  </tr>

                                                              <tr>
                                                                <td colspan="2" align="center" class="submit_id">
                                                                  <input type="submit" value="회원가입"><br>
                                                                  <input type="reset" value="다시입력"><br>
                                                                  <input class = "button_noInput" type="button" value="가입안함" onClick="location='${ctxpath}/template/template.jsp'">
                                                                </td>
                                                              </tr>

                                                              </table>
                                                            </form>


                                                            </body>
                                                          </html>