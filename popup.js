//거추장 스럽지만 나무위키 편집 페이지가 아닐경우를 위함.
function getCurrentTabInfo(){
  chrome.tabs.query({active : true, lastFocusedWindow : true}, function(tab) {
    chrome.tabs.executeScript({
      code: 'document.location.href'
  
    }, function(result){
        var re = new RegExp("(https:\/\/namu.wiki\/edit\/)");
        var state = re.exec(result);
        
        if(state != null){
          //이기능은 content script에서 sendMessage로 구현하고
          localStorage.setItem("current", result);
        }else{
          //나무위키가 아닐 경우를 위함
          localStorage.removeItem("current");
        }
        
    });  
  })
  
  return Promise.resolve();
}


//popup.html에 동적요소 그리기
function drawSaveList(){
  var msg = "DEFAULT";
  var saveList = null;
  var currentUrl = localStorage.getItem("current");
  var force = null;

  if(currentUrl == null){
    msg = "나무위키 편집 페이지가 아닙니다.";

    $("#forceSave").hide();
    $("#saveList").hide();
    
    force = "수동저장된 문서가 없습니다.";
    currentUrl = "나무위키 편집이 아닙니다."
    $("#targetUrl").html(currentUrl);
    
    $("#display").html(msg);
  }else{
    $("#targetUrl").html(decodeURIComponent(currentUrl));
    saveList = localStorage.getItem(currentUrl).split(",");
    force = localStorage.getItem(currentUrl+"forceTime");
    if(force == null){
      force = "수동저장된 문서가 없습니다.";
    }else{
      $("#forceSaveItem").unbind("click").bind("click", forceClick);
    }

    msg = $("#listbody");
    msg.html('');
    saveList = saveList.reverse();
    for(var i=0;i<saveList.length;i++){
      var temp = null;
      ct = $("<td scope='row'>"+saveList[i]+"</td>");
      ct.bind("click", logClick);

      temp = $("<tr></tr>");
      temp.append(ct);

      msg.append(temp);
    }

  }
  
  $("#forceSaveItem").html(force);


  return Promise.resolve();
}

//auto save 요소 클릭시 돌릴지 선택가능함.
function logClick(){
  var flag = confirm("본문의 내용을 해당 시점으로 돌리겠습니까?" + this.innerHTML);
  if(flag == true){
    setContentFromLocalStorage(this.innerHTML);
  }else{
    //취소
  }
}

function forceClick(){
  var flag = confirm("본문의 내용을 해당 시점으로 돌리겠습니까?" + this.innerHTML);
  if(flag == true){
    setContentFromLocalStorage(localStorage["current"]+"forceContent");
  }else{
    //취소
  }
}

function setContentFromLocalStorage(key){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    chrome.tabs.sendMessage(tabs[0].id, {action: "contentRecover", content : localStorage[key]}, function(response) {});  
  });  
}



chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  if(request.action == "contentChange"){
    drawSaveList();
  }
})


$("#tip").bind("click", function(){
  $("#tipList").toggle();
});
//값 가져오기부터 해야하는데 popup은 디버그가 상당히 어렵다.

setInterval(function(){ 
  $("#currentTime").html(new Date().toLocaleString());
  },1000);
window.onload = function(){
  drawSaveList();
}