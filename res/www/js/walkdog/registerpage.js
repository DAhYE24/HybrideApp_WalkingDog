document.body.style.overflow = 'hidden';

var petName= $("#dogName");
var petType = $("#dogType");

function petInfoRegister(){
	if(petName.val().length == 0){
		M.pop.instance("반려견 이름을 입력해주세요");
	}else if(petType.val().length == 0) {
		M.pop.instance("반려견 종류를 입력해주세요");
	}else {
		// 반려견 정보 저장
		M.data.storage("petName", petName.val());
		M.data.storage("petType", petType.val());
		// 페이지 이동
		M.page.html({
			url: 'wd_main.html',
			animation: 'SLIDE_RIGHT'
		});
	}
}
