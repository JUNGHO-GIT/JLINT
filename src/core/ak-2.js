function check() {
  if ($("#title").val() == "") {
    alert("글제목을 입력하세요");
    $("#title").focus();
    return false;
  }
  if ($("#content").val() == "") {
    alert("글내용을 입력하세요");
    $("#content").focus();
    return false;
  }
  if ($("#pw").val() == "") {
    alert("pw를 입력하세요");
    $("#pw").focus();
    return false;
  }
  if ($("#writer").val() == "") {
    alert("글쓴이를 입력하세요");
    $("#writer").focus();
    return false;
  }
  return true;
}
function pwcheck() {
  if ($("#pw").val() == "") {
    alert("비밀번호를 입력하세요");
    $("#pw").focus();
    return false;
  }
  if ($("#pw").val() != $("#pw2").val()) {
    alert("비밀번호가 다릅니다");
    $("#pw").focus();
    return false;
  }
  return true;
}