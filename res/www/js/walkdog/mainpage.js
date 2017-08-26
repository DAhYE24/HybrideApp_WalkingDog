document.body.style.overflow = 'hidden';

/* 콘테이너 띄우기 */
var dogName = M.data.storage("petName");
var dogType = M.data.storage("petType");
var properTime = "0분";
document.getElementById("txtPetName").innerHTML = dogName; // 이름 적용
switch(dogType){
	case "대형견":
		properTime = "1시간 30분";
		break;
	case "중형견":
		properTime = "1시간";
		break;
	case "소형견":
		properTime = "30분";
		break;
}
document.getElementById("txtPetTime").innerHTML = properTime; // 적정 산책량

var c_timer = $("#container_timer");
var c_register = $("#container_register");
if(!dogName){ //반려견이 등록되어 있지 않는 경우
	c_timer.css("display", "none");
	c_register.css("display", "block");
}else{
	c_timer.css("display", "block");
	c_register.css("display", "none");
}

/* 반려견 등록 */
function btnRegister() {
	M.page.html({
		url: 'wd_register.html',
		animation: 'SLIDE_LEFT'
	});
}

/* 변수 */
var timerChk = false; // 타이머가 처음 시작하는지 확인하는 변수
var firstChk = false; // 지도 그리기가 처음 시작인지 확인하는 변수

/* 타이머 기능 */
var	walkTimer = function() {
	var	startAt	= 0, lapTime = 0;
	var	now	= function() {
			return (new Date()).getTime(); 
	}; 
		
	/* 타이머 버튼 */
	this.start = function() { // 시작 버튼
		startAt	= startAt ? startAt : now();
		startMarker();
		getMap = setInterval(function() {
			drawNewCoordinate();
		}, 3000);
	};
	this.pause = function() { // 일시정지 버튼
		lapTime	= startAt ? lapTime + now() - startAt : lapTime;
		startAt	= 0;
		clearInterval(getMap);
	};
	this.stop = function() { // 정지 버튼
		lapTime = startAt = 0;
		clearInterval(getMap);
		endMarker()
	};

	/* 지속 */
	this.time = function() {
		return lapTime + (startAt ? now() - startAt : 0); 
	};
};

var dogwalking = new walkTimer(); // 타이머 시작 
var dog_timer;
var clocktimer;
var getMap;

function pad(num, size) { // 숫자를 알맞게 변환시켜주는 부분
	var s = "0000" + num;
	return s.substr(s.length - size);
}

function formatTime(time) { // 시간 계산
	var hour = minute = second = 0;
	var newTime = '';
	
	/* 시, 분, 초 계산*/
	hour = Math.floor(time / (60 * 60 * 1000));
	time = time % (60 * 60 * 1000);
	minute = Math.floor(time / (60 * 1000));
	time = time % (60 * 1000);
	second = Math.floor(time / 1000);

	newTime = pad(hour, 2) + ':' + pad(minute, 2) + ':' + pad(second, 2);
	return newTime;
}

function show() { // 타이머 시간을 화면에 출력
	dog_timer = document.getElementById('time');
	update();
}

function update() { // 타이머 시간 업데이트
	dog_timer = document.getElementById('time');
	dog_timer.innerHTML = formatTime(dogwalking.time());
}

function start() { // 타이머 시작
	clocktimer = setInterval("update()", 1);
	if(timerChk == false){
		M.pop.alert({
	        title: 'GPS',
	        message: 'GPS 위치 서비스를 실행하셨습니까?',
	        buttons: ['예', '아니요'],
	        callback: function(index){
	        	switch(index) {
				case 0:
					if(firstChk == true){
						startMark.setMap(null);
						endMark.setMap(null);
					}
					timerChk = true;
					dogwalking.start();						
					break;
				case 1:
					M.pop.instance("GPS 위치 서비스를 먼저 실행해주세요");
					break;
	        	}
	        }
		});
	}else if(timerChk == true)	dogwalking.start();
}

function pause() { // 타이머 일시정지
	dogwalking.pause();
	clearInterval(clocktimer);
}

function stop() { // 타이머 종료
	pause();
	dogwalking.stop();
	update();
	M.pop.instance("산책을 종료합니다");
	timerChk = false;
}

/* 새로고침 기능 */
function btnRefresh(){
	drawNewCoordinate();
}

/* 기본 지도 표시 */
var map; // 지도 변수
var coordLines; // 지도 경로 값
var linePath; //라인 객체
var startMark; // 시작 마커
var endMark; // 종료 마커

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.628290, lng: 127.090474},
    zoom: 15
  });
}

function getLocation(){ // GSP를 통해서 위치 값 받아오는 부분
	if(navigator.geolocation)	return navigator.geolocation;
	else	M.pop.instance("GPS 위치 서비스를 실행하세요");
	return null;
}

function startMarker(){
	var firstLoc = getLocation();
	firstLoc.getCurrentPosition(function(position){// getCurrentPosition() 최초 위치를 얻음
		var flat = position.coords.latitude;	// 위도
		var flon = position.coords.longitude;	// 경도		
		var startLoc = new google.maps.LatLng(flat, flon);
		
		map.setCenter(startLoc);	// 현재 위치를 지도 중앙에 표시
		startMark = new google.maps.Marker({ // 시작 마커 그리기
		    position: startLoc,
		    map: map,
		    title: '산책 시작 지점',
		    icon: 'http://i.imgur.com/6c3M2YE.png'
		 });
		// 산책 경로 그리기
		coordLines = [{lat: flat, lng: flon}];
		linePath = new google.maps.Polyline({
			path: coordLines,
		    geodesic: true,
		    strokeColor: '#FF0000',
		    strokeOpacity: 1.0,
		    strokeWeight: 2
		});
		linePath.setMap(map);
	});	
}

function drawNewCoordinate(){
	var nowLoc = getLocation();
	nowLoc.getCurrentPosition(function(position){
		var nlat = position.coords.latitude;	// 위도
		var nlon = position.coords.longitude;	// 경도
		
		linePath.setMap(null);
		coordLines.push({lat: nlat, lng: nlon});
		linePath = new google.maps.Polyline({
			path: coordLines,
		    geodesic: true,
		    strokeColor: '#FF0000',
		    strokeOpacity: 1.0,
		    strokeWeight: 2
		});
		linePath.setMap(map);
	});
}

function endMarker(){
	var endLoc = getLocation();
	endLoc.getCurrentPosition(function(position){// getCurrentPosition() 최초 위치를 얻음
		var elat = position.coords.latitude;	// 위도
		var elon = position.coords.longitude;	// 경도		
		var lastLoc = new google.maps.LatLng(elat, elon);
		
		// 산책 경로 그리기
		linePath.setMap(null);
		coordLines.push({lat: elat, lng: elon});
		linePath = new google.maps.Polyline({
			path: coordLines,
		    geodesic: true,
		    strokeColor: '#FF0000',
		    strokeOpacity: 1.0,
		    strokeWeight: 2
		});
		linePath.setMap(map);
		
		map.setCenter(lastLoc);	// 현재 위치를 지도 중앙에 표시
		endMark = new google.maps.Marker({ // 시작 마커 그리기
		    position: lastLoc,
		    map: map,
		    title: '산책 종료 지점',
		    icon: 'http://i.imgur.com/oG1MpwV.png'
		 });
	});	
}


