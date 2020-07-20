function setui() {
	var gamescore = localStorage.getItem("game_score");
	var new_record = localStorage.getItem("new_record");

	$("#score").html(gamescore);
	if (new_record == 1) {
		$("#xinjilu").show();
	} else {
		$("#xinjilu").hide();
	}
}
