function adminCheck(){
	//id체크



	if($('#admin_id').val()==''){
 	alert("아이디를 입력하시오.");
 	$('#admin_id').focus();
 	return false;
	}

	if($('#admin_pw').val()==''){
 	alert("비밀번호를 입력하시오.");
 	$('#admin_pw').focus();
	return false;
	}


	if($('#admin_pw2').val()==''){
 	alert("비밀번호를 다시 입력해 주세요.");
 	$('#admin_pw').value = '';
 	$('#admin_pw').focus();
	return false;
	}


	if($('#admin_tel').val()==''){
 	alert("전화번호를 입력하시오.");
 	$('#admin_tel').focus();
	return false;
	}

	return true;
}




   function confirmIdCheck(){

  	 	var id_validation = /^[a-zA-Z0-9]{6,12}$/;


  	    if($('#admin_id').val()==''){
  	       alert("ID를 입력하세요");

  	    	 console.log("빈칸확인절차까진 진행됨");
  	    }
  	    //******************************
  	    else if(id_validation.test($('#admin_id').val())){
  				console.log("정규표현식에 맞음 성공");

  				//-------------------
  			      $.ajax({
  			         type:'POST',
  			         url:'${ctxpath}/admin/idCheck.do',
  			         data:"admin_id="+$('#admin_id').val(),
  			         dataType:'JSON',
  			         success:function(data){

  			            if(data.check==-1){
  			               //alert("사용 중인 ID입니다.");
  			             	$("#olmessage").text("이미 사용중인 아이디 입니다.");
  			             	$("#olmessage").addClass("oldmessagef");
  			             	$("#olmessage").removeClass("olmessaget");
  			               $('#admin_id').value="";
  			               $('#admin_id').val('').focus();

  			            }else if(data.check==1){
			  			    console.log("ajax 성공");
  			             	$("#olmessage").text("사용 가능한 아이디 입니다.");
  			             	$("#olmessage").addClass("oldmessaget");
  			             	$("#olmessage").removeClass("olmessagef"); //oldmessage에 각각 클래스를 입혔다가 지우는 행동을 하는 이유는
  			             							//성공시와 실패시에 각각의 글씨에 다른 스타일을 적용하기 위해 (oldmessaget는 성공 oldmessagef는 실패)
  			           //    alert("사용 가능 한 ID입니다.");
  			               $('#admin_pw').focus();


  			            }
  			         }//success
  			       });

  	   	 }else if(!id_validation.test($('#admin_id').val())){
  	   		 console.log("정규표현식에 맞지 않음 실패");
  	   		 //alert("6~12자리의 영문 대소문자, 숫자로 이루어진 아이디를 작성하시오.");
  			$("#olmessage").text("6~12자리의 영문 대소문자, 숫자로 이루어진 아이디를 작성하시오.");
           	$("#olmessage").addClass("olmessagef");
           	$("#olmessage").removeClass("olmessaget");
  	   		 $('#admin_id').value='';
  			$('#admin_id').focus();

  			return false;
  	 }   //elseif-end

	             	$("#olmessage").text(""); //얘만 안되는 이유를 모르겠음 ㅡㅡ
  			       return true;
   }//confirmIdCheck() end
  	    //*******************************







 function confirmPwCheck(){

  	 	var pw_validation =  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
  		//하나 이상의 대문자, 하나의 소문자, 하나의 숫자 및 하나의 특수 문자 형태의 8~15 자리 이내의 암호 규칙.

  	    if($('#admin_pw').val()==''){
  	      // alert("pw를 입력하세요");
  	       $("#password-error").text("비밀번호를 입력하세요.");
			 	$("#password-error").removeClass("password-errorf");
   				$("#password-error").addClass("password-errort");
  	       $('#admin_pw').focus();
  	    }
  	    //******************************
  	    else if(pw_validation.test($('#admin_pw').val())){
  				console.log("정규표현식에 맞음 성공");

  				if($('#admin_pw').val() != $('#admin_pw2').val()){
			 	//alert("비밀번호와 비밀번호확인이 다릅니다.");

			 	$("#password-error").text("비밀번호와 비밀번호확인이 다릅니다.");
   				$("#password-error").addClass("password-errorf");
			 	$("#password-error").removeClass("password-errort");
			 	$('#admin_pw').val('');
			 	$('#admin_pw2').val('');
			 	$('#admin_pw').val('').focus();
			 	return false;
				}
  				$("#password-error").text("");
  			       return true;

  	   	 }else if(!pw_validation.test($('#admin_pw').val())){
  	   		 console.log("정규표현식에 맞지 않음 실패");
  	   		 //alert("8~15자리의 영문 대소문자, 숫자, 특수문자가 포함된 암호를 작성하시오.");
  			$("#password-error").text("8~15자리의 영문 대소문자, 숫자, 특수문자가 포함된 암호를 작성하시오.");
   				$("#password-error").addClass("password-errorf");
			 	$("#password-error").removeClass("password-errort");
  			$('admin_#pw').val('');
  			$('#admin_pw2').val('');
  			$('#admin_pw').focus();
  			event.preventDefault();
  	 }   //elseif-end
  	    //*******************************
   }//confirmIdCheck() end



