
var button = document.getElementById("settings");
var lights = document.getElementById("select-text");

button.onclick = function() {
	this.nextElementSibling.classList.toggle("show");
	document.getElementById("select-text").classList.toggle("show");
}

lights.onclick = function() {
	document.getElementById("white-space").classList.toggle("dark");
	if (document.getElementById("select-text").innerHTML == "Lights: On"){
		document.getElementById("select-text").innerHTML = "Lights: Off";
		document.getElementById("select-text").style.color = "grey";
	}
	else if(document.getElementById("select-text").innerHTML == "Lights: Off"){
		document.getElementById("select-text").innerHTML = "Lights: On";
		document.getElementById("select-text").style.color = "#fafbc7";
	}
}

