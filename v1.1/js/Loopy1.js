/**********************************

LOOPY!
- with edit & play mode

**********************************/

Loopy.MODE_EDIT = 0;
Loopy.MODE_PLAY = 1;

Loopy.TOOL_INK = 0;
Loopy.TOOL_DRAG = 1;
Loopy.TOOL_ERASE = 2;
Loopy.TOOL_LABEL = 3;

function Loopy(config){

	var self = this;
	self.config = config;

	// Loopy: EMBED???
	self.embedded = _getParameterByName("embed");
	self.embedded = !!parseInt(self.embedded); // force to Boolean

	// Offset & Scale?!?!
	self.offsetX = 0;
	self.offsetY = 0;
	self.offsetScale = 1;

	// Mouse
	Mouse.init(document.getElementById("canvasses")); // TODO: ugly fix, ew
	
	// Model
	self.model = new Model(self);

	// Loopy: SPEED!
	self.signalSpeed = 3;

	// Sidebar
	self.sidebar = new Sidebar(self);
	self.sidebar.showPage("Edit"); // start here

	// Play/Edit mode
	self.mode = Loopy.MODE_EDIT;

	// Tools
	self.toolbar = new Toolbar(self);
	self.tool = Loopy.TOOL_INK;
	self.ink = new Ink(self);
	self.drag = new Dragger(self);
	self.erase = new Eraser(self);
	self.label = new Labeller(self);

	// Play Controls
	self.playbar = new PlayControls(self);
	self.playbar.showPage("Editor"); // start here

	// Modal
	self.modal = new Modal(self);

	//////////
	// INIT //
	//////////

	self.init = function(){
		self.loadFromURL(); // try it.
	};

	///////////////////
	// UPDATE & DRAW //
	///////////////////

	// Update
	self.update = function(){
		Mouse.update();
		if(self.wobbleControls>=0) self.wobbleControls--; // wobble
		if(!self.modal.isShowing){ // modAl
			self.model.update(); // modEl
		}
	};
	setInterval(self.update, 1000/30); // 30 FPS, why not.

	// Draw
	self.draw = function(){
		if(!self.modal.isShowing){ // modAl
			self.model.draw(); // modEl
		}
		requestAnimationFrame(self.draw);
	};

	// TODO: Smarter drawing of Ink, Edges, and Nodes
	// (only Nodes need redrawing often. And only in PLAY mode.)

	//////////////////////
	// PLAY & EDIT MODE //
	//////////////////////

	self.showPlayTutorial = false;
	self.wobbleControls = -1;
	self.setMode = function(mode){

		self.mode = mode;
		publish("loopy/mode");

		// Play mode!
		if(mode==Loopy.MODE_PLAY){
			self.showPlayTutorial = true; // show once!
			if(!self.embedded) self.wobbleControls=45; // only if NOT embedded
			self.sidebar.showPage("Edit");
			self.playbar.showPage("Player");
			self.sidebar.dom.setAttribute("mode","play");
			self.toolbar.dom.setAttribute("mode","play");
			document.getElementById("canvasses").removeAttribute("cursor"); // TODO: EVENT BASED
		}else{
			publish("model/reset");
		}

		// Edit mode!
		if(mode==Loopy.MODE_EDIT){
			self.showPlayTutorial = false; // donezo
			self.wobbleControls = -1; // donezo
			self.sidebar.showPage("Edit");
			self.playbar.showPage("Editor");
			self.sidebar.dom.setAttribute("mode","edit");
			self.toolbar.dom.setAttribute("mode","edit");
			document.getElementById("canvasses").setAttribute("cursor", self.toolbar.currentTool); // TODO: EVENT BASED
		}

	};

	/////////////////
	// SAVE & LOAD //
	/////////////////

	self.dirty = false;

	// YOU'RE A DIRTY BOY
	subscribe("model/changed", function(){
		if(!self.embedded) self.dirty = true;
	});

	subscribe("export/file", function(){
		var element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + self.model.serialize());
		element.setAttribute('download', "system_model.loopy");

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	});

	subscribe("import/file", function(){
		let input = document.createElement('input');
		input.type = 'file';
		input.onchange = e => {
			var file = e.target.files[0];
			var reader = new FileReader();
			reader.readAsText(file,'UTF-8');
			reader.onload = readerEvent => {
				var content = readerEvent.target.result;
				self.model.deserialize(content);
			}
		};
		input.click();
	});

	self.saveToURL = function(embed){

		// Create link
		var dataString = self.model.serialize();
		var uri = dataString; // encodeURIComponent(dataString);
		var base = window.location.origin + window.location.pathname;
		var historyLink = base+"?data="+uri;
		var link;
		if(embed){
			link = base+"?embed=1&data="+uri;
		}else{
			link = historyLink;
		}

		// NO LONGER DIRTY!
		self.dirty = false;

		// PUSH TO HISTORY
		window.history.replaceState(null, null, historyLink);

		return link;
	};
	
	// "BLANK START" DATA:
	//var _blankData = "[[[1,403,223,1,%22something%22,4],[2,405,382,1,%22something%2520else%22,5]],[[2,1,94,-1,0],[1,2,89,1,0]],[[609,311,%22need%2520ideas%2520on%2520what%2520to%250Asimulate%253F%2520how%2520about%253A%250A%250A%25E3%2583%25BBtechnology%250A%25E3%2583%25BBenvironment%250A%25E3%2583%25BBeconomics%250A%25E3%2583%25BBbusiness%250A%25E3%2583%25BBpolitics%250A%25E3%2583%25BBculture%250A%25E3%2583%25BBpsychology%250A%250Aor%2520better%2520yet%252C%2520a%250A*combination*%2520of%250Athose%2520systems.%250Ahappy%2520modeling!%22]],2%5D";
	//var _blankData = '[[[3,812,454,1,"%2520%2520%2520Type%25202%2520%2520%2520%2520Diabetes",0],[4,571,103,1,"%2520%2520%2520%2520%2520%2520%2520%2520%2520Genetic%2520%2520%2520%2520%2520%2520%2520%2520%2520predisposition",0],[5,410,156,1,"%2520%2520%2520%2520%2520%2520Not%2520eating%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520fruits%2520and%2520%2520%2520%2520vegetables",0],[6,286,274,1,"%2520Being%2520obese",0],[7,909,91,1,"%2520%2520%2520Drinking%2520%2520%2520%2520alcohol",0],[8,1085,99,1,"High%2520blood%2520pressure",0],[9,1243,156,1,"Smoking",0],[10,1364,275,1,"Poor%2520quality%2520sleep",0],[11,1419,600,1,"%2520High%2520carb%2520diet",0],[12,324,738,1,"High%2520stress",0],[14,1171,814,1,"%2520%2520%2520%2520Working%2520a%2520job%2520%2520%2520%2520%2520%2520%2520where%2520you%2520sit%2520%2520%2520%2520all%2520day",0],[15,994,819,1,"%2520%2520%2520High%2520%2520%2520%2520cholesterol",0],[16,645,820,1,"%2520Eating%2520lots%2520of%2520junk%2520foods",0],[17,814,818,1,"Consistent%2520overeating",0],[18,474,813,1,"%2520Eating%2520lots%2520of%2520fast%2520foods",0],[19,1331,742,1,"%2520%2520%2520%2520%2520%2520%2520Family%2520%2520%2520%2520%2520%2520%2520%2520history",0],[21,229,601,1,"Not%2520regularly%2520exercising",0],[22,227,431,1,"%2520%2520%2520%2520%2520%2520High%2520sugar%2520%2520%2520%2520%2520%2520diet",0],[23,1425,432,1,"Old%2520age",0],[24,739,94,1,"Eating%2520lots%2520of%2520meat",0]],[],[],24%5D'
	//var _blankData = '[[[3,659,344,1,"%2520%2520%2520Type%25202%2520%2520%2520%2520Diabetes",0],[4,475,113,1,"%2520%2520%2520%2520%2520%2520%2520%2520%2520Genetic%2520%2520%2520%2520%2520%2520%2520%2520%2520predisposition",0],[5,351,130,1,"%2520%2520%2520%2520%2520%2520Not%2520eating%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520fruits%2520and%2520%2520%2520%2520vegetables",0],[6,268,222,1,"%2520Being%2520obese",0],[7,724,110,1,"%2520%2520%2520Drinking%2520%2520%2520%2520alcohol",0],[8,843,112,1,"High%2520blood%2520pressure",0],[9,959,142,1,"Smoking",0],[10,1041,232,1,"%2520%2520Poor%2520quality%2520%2520sleep",0],[11,1051,468,1,"%2520High%2520carb%2520diet",0],[12,282,567,1,"High%2520stress",0],[14,897,597,1,"%2520%2520%2520%2520Working%2520a%2520job%2520%2520%2520%2520%2520%2520%2520where%2520you%2520sit%2520%2520%2520%2520all%2520day",0],[15,777,598,1,"%2520%2520%2520High%2520%2520%2520%2520cholesterol",0],[16,524,602,1,"%2520Eating%2520lots%2520of%2520junk%2520foods",0],[17,648,601,1,"Consistent%2520overeating",0],[18,400,601,1,"%2520%2520%2520%2520%2520Eating%2520lots%2520of%2520%2520%2520%2520%2520fast%2520foods",0],[19,1008,574,1,"%2520%2520%2520%2520%2520%2520%2520Family%2520%2520%2520%2520%2520%2520%2520%2520history",0],[21,242,456,1,"Not%2520regularly%2520exercising",0],[22,242,339,1,"%2520%2520%2520%2520%2520%2520High%2520sugar%2520%2520%2520%2520%2520%2520diet",0],[23,1057,349,1,"Old%2520age",0],[24,600,109,1,"Eating%2520lots%2520of%2520meat",0]],[],[],24%5D'
	if(typeof _blankData === 'undefined'){
		_blankData = '[[[3,744,622,1,"%2520%2520%2520Type%25202%2520%2520%2520%2520Diabetes",0],[6,508,444,1,"%2520%2520%2520%2520%2520%2520%2520Being%2520%2520%2520%2520%2520%2520%2520%2520obese",0],[8,953,450,1,"High%2520blood%2520pressure",0],[15,949,807,1,"%2520%2520%2520High%2520%2520%2520%2520cholesterol",0],[23,515,802,1,"Old%2520age",0]],[],[],27%5D'
	}

	self.loadFromURL = function(){
		var data = _getParameterByName("data");
		if(!data) data=decodeURIComponent(_blankData);
		self.model.deserialize(data);
	}; 


	///////////////////////////
	//////// EMBEDDED? ////////
	///////////////////////////

	self.init();

	if(self.embedded){

		// Hide all that UI
		self.toolbar.dom.style.display = "none";
		self.sidebar.dom.style.display = "none";

		// If *NO UI AT ALL*
		var noUI = !!parseInt(_getParameterByName("no_ui")); // force to Boolean
		if(noUI){
			_PADDING_BOTTOM = _PADDING;
			self.playbar.dom.style.display = "none";
		}

		// Fullscreen canvas
		document.getElementById("canvasses").setAttribute("fullscreen","yes");
		self.playbar.dom.setAttribute("fullscreen","yes");
		publish("resize");

		// Center & SCALE The Model
		self.model.center(true);
		subscribe("resize",function(){
			self.model.center(true);
		});

		// Autoplay!
		self.setMode(Loopy.MODE_PLAY);

		// Also, HACK: auto signal
		var signal = _getParameterByName("signal");
		if(signal){
			signal = JSON.parse(signal);
			var node = self.model.getNode(signal[0]);
			node.takeSignal({
				delta: signal[1]*0.33
			});
		}

	}else{

		// Center all the nodes & labels

		// If no nodes & no labels, forget it.
		if(self.model.nodes.length>0 || self.model.labels.length>0){

			// Get bounds of ALL objects...
			var bounds = self.model.getBounds();
			var left = bounds.left;
			var top = bounds.top;
			var right = bounds.right;
			var bottom = bounds.bottom;

			// Re-center!
			var canvasses = document.getElementById("canvasses");
			var cx = (left+right)/2;
			var cy = (top+bottom)/2;
			var offsetX = (canvasses.clientWidth+50)/2 - cx;
			var offsetY = (canvasses.clientHeight-80)/2 - cy;

			// MOVE ALL NODES
			for(var i=0;i<self.model.nodes.length;i++){
				var node = self.model.nodes[i];
				node.x += offsetX;
				node.y += offsetY;
			}

			// MOVE ALL LABELS
			for(var i=0;i<self.model.labels.length;i++){
				var label = self.model.labels[i];
				label.x += offsetX;
				label.y += offsetY;
			}

		}

	}

	// NOT DIRTY, THANKS
	self.dirty = false;

	// SHOW ME, THANKS
	document.body.style.opacity = "";

	// GO.
	requestAnimationFrame(self.draw);


}
