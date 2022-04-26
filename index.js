var errorMessage = document.querySelector("#errormsg");
var svg = document.querySelector("#image");
var textInput = document.querySelector("#textinput");
var progressHeader = document.querySelector("#progressHeader");
var textInput = document.querySelector("#textinput");
var historyList = document.querySelector("#historyList");


var coordBoundries = [
	[52.4306791 , 4.7548437], //lefttop
	[52.2779776 , 5.107695] // rightbot
]

var list = undefined;
var amountFound = -1;

fetch("data.json").then((res) => res.json()).then(data => {
	list = data;
	updateAndIncrementProgress();
})

function updateAndIncrementProgress(addr) {
	progressHeader.innerHTML = `Progress: ${++amountFound} / ${list.length}`;
	if (addr)
	{
		var listItem = document.createElement("li");
		listItem.innerHTML = addr.name + ", " + addr.adress;

		historyList.prepend(listItem);
	}
	if (amountFound == list.length)
		alert("go outside");
}

textInput.onkeydown = ((e) => {
	if (e.key == "Enter") {
		if (check(textInput.value) == false) {
			errorMessage.style.display = 'block';
		}
		else
		{
			textInput.value = '';
		}
	}
	else
		errorMessage.style.display = 'none';
})

fetch("amsterdam.Svg").then(res => res.text()).then(data => {
	var parser = new DOMParser();

	var image = parser.parseFromString(data, "image/svg+xml");

	svg.innerHTML += image.children[0].children[0].innerHTML;
})

function putDot(lat, long) {
	var topPrc = (lat - coordBoundries[1][0]) / (coordBoundries[0][0] - coordBoundries[1][0]);
	var leftPrc = (long - coordBoundries[1][1]) / (coordBoundries[0][1] - coordBoundries[1][1]);
	
	var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");

	circle.setAttribute('cx', svg.width.baseVal.value * (1 - leftPrc));
	circle.setAttribute('cy', svg.height.baseVal.value * (1 - topPrc));
	circle.setAttribute('r', 5);

	svg.appendChild(circle);
}


function similarity(s1, s2) {
	if (!s1 || !s2)
		return 0;

	var longer = s1;
	var shorter = s2;
	if (s1.length < s2.length) {
	  longer = s2;
	  shorter = s1;
	}
	var longerLength = longer.length;
	if (longerLength == 0) {
	  return 1.0;
	}
	return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
  }

function editDistance(s1, s2) {
	s1 = s1.toLowerCase();
	s2 = s2.toLowerCase();
  
	var costs = new Array();
	for (var i = 0; i <= s1.length; i++) {
	  var lastValue = i;
	  for (var j = 0; j <= s2.length; j++) {
		if (i == 0)
		  costs[j] = j;
		else {
		  if (j > 0) {
			var newValue = costs[j - 1];
			if (s1.charAt(i - 1) != s2.charAt(j - 1))
			  newValue = Math.min(Math.min(newValue, lastValue),
				costs[j]) + 1;
			costs[j - 1] = lastValue;
			lastValue = newValue;
		  }
		}
	  }
	  if (i > 0)
		costs[s2.length] = lastValue;
	}
	return costs[s2.length];
}

function check(input) {
	let i = 0;
	let found = false;
	for (; i < list.length; i++) {
		const e = list[i];

		const nameNoNumber = e.name.split(' ');
		nameNoNumber.pop();

		if (e.found != undefined)
			continue;

		if (similarity(nameNoNumber.join(' '), input) > 0.85 || similarity(e.alternateName, input) > 0.85 || e.adress == input)
		{
			putDot(parseFloat(e.coords[0]), parseFloat(e.coords[1]));
			found = true;
			e["found"] = true;
			updateAndIncrementProgress(e);

		}
	}
	return found;
}