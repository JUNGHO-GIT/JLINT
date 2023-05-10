function memberCheck(){
	//id체크



	if($('#member_id').val()==''){
 	alert("아이디를 입력하시오.");
 	return false;
	}

	if($('#member_pw').val()==''){
 	alert("비밀번호를 입력하시오.");
	return false;
	}


	if($('#member_pw2').val()==''){
 	alert("비밀번호를 다시 입력해 주세요.");
 	$('#member_pw').value = '';
 	$('#member_pw').focus();
	return false;
	}

	if($('#member_name').val()==''){
 	alert("성함을 입력하시오.");
	return false;
	}

	if($('#member_email').val()==''){
 	alert("이메일을 입력하시오.");
	return false;
	}

	if($('#member_tel').val()==''){
 	alert("전화번호를 입력하시오.");
	return false;
	}

	if($('#member_addr').val()==''){
 	alert("우편번호와 주소를 입력하시오.");
 	$('#member_zipcode').focus();
	return false;
	}

	if($('#member_addr2').val()==''){
 	alert("상세 주소를 입력하시오.");
 	$('#member_addr2').focus();
	return false;
	}
	return true;
}//memberCheck-end


  	    //******************************
  	    //******************************
		//submit할때 발동되는 약관동의 확인함수
function agree_check(){

	if(!document.getElementById("check_all").checked) {
	//alert("약관에 동의하셔야 합니다.");
	$("#agreeMessage").text("이용 약관에 동의해주세요.");
   	$("#agreeMessage").addClass("agreeMessagef");
	return false;
	}
	$("#agreeMessage").text("");
	return true;



}//agree-check-end







 function confirmPwCheck(){

  	 	var pw_validation =  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
  		//하나 이상의 대문자, 하나의 소문자, 하나의 숫자 및 하나의 특수 문자 형태의 8~15 자리 이내의 암호 규칙.

  	    if($('#member_pw').val()==''){
  	      // alert("pw를 입력하세요");
  	       $("#password-error").text("8~15자리의 영문 대소문자, 숫자, 특수문자가 포함된 암호를 작성하시오.");
			 	$("#password-error").removeClass("password-errorf");
   				$("#password-error").addClass("password-errort");
  	       $('#member_pw').focus();
  	    }
  	    //******************************
  	    else if(pw_validation.test($('#member_pw').val())){
  				console.log("정규표현식에 맞음 성공");

  				if($('#member_pw').val() != $('#member_pw2').val()){
			 	//alert("비밀번호와 비밀번호확인이 다릅니다.");

			 	$("#password-error").text("비밀번호와 비밀번호확인이 다릅니다.");
   				$("#password-error").addClass("password-errorf");
			 	$("#password-error").removeClass("password-errort");
			 	$('#member_pw').val('');
			 	$('#member_pw2').val('');
			 	$('#member_pw').val('').focus();
			 	return false;
				}
  				$("#password-error").text("");
  			       return true;

  	   	 }else if(!pw_validation.test($('#member_pw').val())){
  	   		 console.log("정규표현식에 맞지 않음 실패");
  	   		 //alert("8~15자리의 영문 대소문자, 숫자, 특수문자가 포함된 암호를 작성하시오.");
  			$("#password-error").text("8~15자리의 영문 대소문자, 숫자, 특수문자가 포함된 암호를 작성하시오.");
   				$("#password-error").addClass("password-errorf");
			 	$("#password-error").removeClass("password-errort");
  			$('member_#pw').val('');
  			$('#member_pw2').val('');
  			$('#member_pw').focus();
  			event.preventDefault();
  	 }   //elseif-end

   }//confirmIdCheck() end




function confirTelCheck(){


	var tel_validation = /^01[0|1|6|7|8|9].?([0-9]{3,4}).?([0-9]{4})$/;

		if($('#member_tel').val()== ''){
			return false;
		}
		else if(tel_validation.test($('#member_tel').val())){
  				console.log("정규표현식에 맞음 성공");



			 	return true;
  	   	 }else if(!tel_validation.test($('#member_tel').val())){
  	   		 console.log("정규표현식에 맞지 않음 실패");
  	   		 alert("전화번호를 옳게 작성하였는지 확인해주세요.");
  			$('#member_tel').val('');
  			$('#member_tel').focus();
  			return false;
  	 }   //elseif-end

}//confirmEmailCheck-end
