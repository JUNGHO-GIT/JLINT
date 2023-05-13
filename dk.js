function adminCheck () {
  if ($("#admin_id").val() == "") {
    alert("아이디를 입력하시오.");
    $("#admin_id").focus();
    return false;
  }

  if ($("#admin_pw").val() == "") {
    alert("비밀번호를 입력하시오.");
    $("#admin_pw").focus();
    return false;
  }

  if ($("#admin_pw2").val() == "") {
    alert("비밀번호를 다시 입력해 주세요.");
    $("#admin_pw").value = "";
    $("#admin_pw").focus();
    return false;
  }

  if ($("#admin_tel").val() == "") {
    alert("전화번호를 입력하시오.");
    $("#admin_tel").focus();
    return false;
  }

  return true;

}

// --------------------------------------------------------------------------------------------->
function confirmIdCheck () {
  var id_validation = /^[a-zA-Z0-9] {6, 12}$/;
  if ($("#admin_id").val() == "") {
    alert("ID를 입력하세요");
    console.log("빈칸확인절차까진 진행됨");
  }
  else if (id_validation.test($("#admin_id").val())) {
    console.log("정규표현식에 맞음 성공");
    $.ajax({
      type: "POST", url: "${ctxpath}/admin/idCheck.do", data: "admin_id=" + $("#admin_id").val(), dataType: "JSON", success: function  (data) {
        if (data.check == -1) {
          $("#olmessage").text("이미 사용중인 아이디 입니다.");
          $("#olmessage").addClass("oldmessagef");
          $("#olmessage").removeClass("olmessaget");
          $("#admin_id").value = "";
          $("#admin_id").val("").focus();
        }
        else if (data.check == 1) {
          console.log("ajax 성공");
          $("#olmessage").text("사용 가능한 아이디 입니다.");
          $("#olmessage").addClass("oldmessaget");
          $("#olmessage").removeClass("olmessagef");
          $("#admin_pw").focus();
        }
      }, });
  }
  else if (!id_validation.test($("#admin_id").val())) {
    console.log("정규표현식에 맞지 않음 실패");
    $("#olmessage").text("6~12자리의 영문 대소문자, 숫자로 이루어진 아이디를 작성하시오.");
    $("#olmessage").addClass("olmessagef");
    $("#olmessage").removeClass("olmessaget");
    $("#admin_id").value = "";
    $("#admin_id").focus();
    return false;
  }

  $("#olmessage").text("");
  return true;

}

// --------------------------------------------------------------------------------------------->
function confirmPwCheck () {
  var pw_validation = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
  if ($("#admin_pw").val() == "") {
    $("#password-error").text("비밀번호를 입력하세요.");
    $("#password-error").removeClass("password-errorf");
    $("#password-error").addClass("password-errort");
    $("#admin_pw").focus();
  }
  else if (pw_validation.test($("#admin_pw").val())) {
    console.log("정규표현식에 맞음 성공");
    if ($("#admin_pw").val() != $("#admin_pw2").val()) {
      $("#password-error").text("비밀번호와 비밀번호확인이 다릅니다.");
      $("#password-error").addClass("password-errorf");
      $("#password-error").removeClass("password-errort");
      $("#admin_pw").val("");
      $("#admin_pw2").val("");
      $("#admin_pw").val("").focus();
      return false;
    }
    $("#password-error").text("");
    return true;
  }
  else if (!pw_validation.test($("#admin_pw").val())) {
    console.log("정규표현식에 맞지 않음 실패");
    $("#password-error").text("8~15자리의 영문 대소문자, 숫자, 특수문자가 포함된 암호를 작성하시오.");
    $("#password-error").addClass("password-errorf");
    $("#password-error").removeClass("password-errort");
    $("admin_#pw").val("");
    $("#admin_pw2").val("");
    $("#admin_pw").focus();
    event.preventDefault();
  }
}
