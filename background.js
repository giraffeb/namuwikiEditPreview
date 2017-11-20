console.log("call background script");


//전송 받은 content를 저장한다.
//배열의 길이가 넘을때만 정리하고
function saveContent(content){
  var listMaxSize = 7;
  var contentList = null;
  var listKey = localStorage["current"];

  if(localStorage.getItem(listKey) == null){
    contentList = [];
    localStorage.setItem(listKey, contentList);
  }else{
    contentList = localStorage.getItem(listKey).split(",");
    if(contentList[0] == ""){
      contentList = contentList.slice(1);
    }
  }
        
  if(contentList.length > listMaxSize){
    
    delkey = contentList[0];
    localStorage.removeItem(delkey);
    contentList = contentList.slice(1);
    localStorage.setItem(listKey, contentList);
  }

  //시간값을 키로
  key = new Date();

  contentList.push(key.toLocaleString());
  localStorage.setItem(listKey, contentList)
  localStorage.setItem(key.toLocaleString(), content);
  //저장찍어보기
  //console.log(content);

}

function forceSaveContent(content){
  var urlKey = localStorage.getItem("current");
  localStorage.setItem(urlKey+"forceContent", content);
  localStorage.setItem(urlKey+"forceTime", new Date().toLocaleString());
}

//popup.js에게 새로운 저장을 알림.
function sendDataChangeMessage(){
  
  chrome.runtime.sendMessage({
    action : "contentChange"
  });
}

//얘가 로직임.
//backgrond.js and popup.js share localStorage
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  // console.log("receive the msg : "+request.action);
  
  if(request.action == "init"){
    localStorage.setItem("current", request.content);
  }
  
  if(request.action == "forceSaveContent"){
    // console.log("force save content listen");
    forceSaveContent(request.content);
    sendDataChangeMessage();   
  }

  if(request.action == "content"){
    
    saveContent(request.content);
    sendDataChangeMessage();   
  }
})


//tabs event functions
//백그라운드에서 처리해야 tab을 클릭해서 다른탭으로 이동할 때마다 적용해줄 수 있다.
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



chrome.tabs.onActivated.addListener(function(){
  console.log("tabs onActivated listen");
  getCurrentTabInfo();
});

