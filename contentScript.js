
document.addEventListener('keydown',function(e){
  console.log(e.key);

  if(e.key == "`" && e.altKey == true){
    console.log("request preview");

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
});
