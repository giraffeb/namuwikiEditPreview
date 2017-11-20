
//컨텐츠 변화 확인을 위한 hashFunction util
//this code from mozila developer
function sha256(str) {
  // We transform the string into an arraybuffer.
  var buffer = new TextEncoder("utf-8").encode(str);
  return crypto.subtle.digest("SHA-256", buffer).then(function (hash) {
    return hex(hash);
  });
}

function hex(buffer) {
  var hexCodes = [];
  var view = new DataView(buffer);
  for (var i = 0; i < view.byteLength; i += 4) {
    // Using getUint32 reduces the number of iterations needed (we process 4 bytes each time)
    var value = view.getUint32(i);
    // toString(16) will give the hex representation of the number without padding
    var stringValue = value.toString(16);
    // We use concatenation and slice for padding
    var padding = '00000000';
    var paddedValue = (padding + stringValue).slice(-padding.length);
    hexCodes.push(paddedValue);
  }

  // Join all the hex strings into one
  return hexCodes.join("");
}

//사용법
// sha256("foobar").then(function(digest) {
//   console.log(digest);
// });
//hash function end





//TODO : localStorage.setItem() -> sendMessage() to background.js
/*
contentScript와 extension다른 개체들 사이에 localstorage가 공유되지 않는다. 
그렇게 만든 이유는 모른다.
contentScript의 localStorage.setItem()을 sendMessage() to background.js로 만들어서
background.js에서 처리하자.
*/
function isDiff(){
  //현재 content 값
  var content = $("#textInput").val();

  var v = sha256(content)
          .then(function(cur /* content로 구한 hash값*/){
            //이전 단위시간 전에 저장된 hashcode
            var pre = localStorage.getItem("pre");
            var flag = null;
            
            if(pre == cur){
              flag = false;      
            }else{
              flag = true;
            }
            
            localStorage.setItem("pre", cur);
            return Promise.resolve(flag);
          }).then(function(flag){
            if(flag == true){
              var contentVal = $("#textInput").val();
              
              //send to background.js
              chrome.runtime.sendMessage(
                {action : "content"
              , content: contentVal});
            }
          });
}


//사용자가 저장을 요청한다. 문서가 변경되지 않아도 저장한다.
function forceSaveContent(){
 //TODO 구현하시오.
  var contentVal = $("#textInput").val();
 
 //send to background.js
 chrome.runtime.sendMessage(
   {action : "forceSaveContent"
 , content: contentVal});
}


/*
  key event발생시 호출
*/
function callNamuwikiPreview(){
  
  var $ef = $("#editForm"), $pf = $("#previewFrame");

  if ($pf.length > 0) {
    $pf.remove();
  }

  $pf = $("<iframe></iframe>").attr({
    "name": "previewFrame",
    "id": "previewFrame"
  });

  $(".tab-pane#preview").append($pf);

  $ef.attr({
    "method": "POST",
    "target": "_blank",
    "action": "/preview/" + encodeURIComponent($ef.attr('data-title'))
  });
  
  //새창으로 요청하기
  //여기가 핵심
    window.open("" ,"namuPreview",
          "toolbar=no, width=946, height=document.body.clientHeight, directories=no, status=no");

    var url = "/preview/" + encodeURIComponent($ef.attr('data-title'));
    $ef.attr({
      "method": "POST",
      "target": "namuPreview",
      "action": "/preview/" + encodeURIComponent($ef.attr('data-title'))
    });

    $ef.submit();
}




//키이벤트 처리
document.addEventListener('keydown',function(e){
  if(e.key == "z" && e.altKey == true){
    //가장 마지막 저장 가져와서 textInput에 inject 하고 미리보기 새로고침 하기 위함
  }
  
  if(e.key == "s" && e.altKey == true){
    forceSaveContent();
  }

  if(e.key == "`" && e.altKey == true){
    callNamuwikiPreview();
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  console.log("content script get message");
  if(request.action == "contentRecover"){
    //TODO : undo stack에 덮어쓰기 전 데이터를 남길 수 있을까?
    $("#textInput").val(request.content);
  }
});



window.onload = function(){
  //사이트 최초 로드시에는 저장하자.
  chrome.runtime.sendMessage({action : "init", content : document.location.href});
  
  var contentVal = $("#textInput").val();
  sha256(contentVal)
  .then(function(cur /* content로 구한 hash값*/){
    localStorage.setItem("pre", cur);
    
    //send to background.js
    chrome.runtime.sendMessage(
      {action : "content"
    , content: contentVal});    
  });

  var autoSaveTime = 10000; //10sec
  setInterval(isDiff, autoSaveTime);
  
}