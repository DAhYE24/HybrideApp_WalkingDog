document.body.style.overflow = 'hidden';

M.onReady(function() {	
	/* 3초 후에 메인 화면으로 이동 */
	setTimeout(function(){
		M.page.html({
		url: 'wd_main.html',
		animation: 'FADE'
	});
	}, 2000);	
}).onBack(function() {	
	/* 뒤로가기 버튼 눌렀을 경우 */
	M.pop.alert('앱을 종료하시겠습니까?', {
			title: '알림',
			buttons: ['취소', '확인']
		}, function(index) {
			switch(index) {
				case 0:
					break;
				case 1:
					M.sys.exit();
					break;
			}
		});	
})