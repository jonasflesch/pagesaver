Components.utils.import("resource://pagesaver-modules/index.js");
Components.utils.import("resource://pagesaver-modules/repository.js");

//graphical interface
const NS_XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

function addItemToMenu(id, label, command, menuid, insertBefore){
	//check for safety, if it is not the window of the browser doesnt add
	if ("chrome://browser/content/browser.xul" != window.location) return;

    var onCmd = function() {
    	options.onCommand && options.onCommand();
    };

    var menuitem = window.document.createElementNS(NS_XUL, "menuitem");
    menuitem.setAttribute("id", id);
    menuitem.setAttribute("label", label);
    menuitem.addEventListener("command", command, true);

	//check for safety
    if (menuid) {
    	let ($ = function(id) window.document.getElementById(id)) {
          $(menuid).insertBefore(menuitem, $(insertBefore));
    	}
    }
}

function loadSavedPages(){
	addItemToMenu('test', 'Click me', null, 'pagesavermenupopup', 'testextension-menuitem');
}
function saveSomething(){
	var savedName = document.getElementById("pageDescription").value;
	Components.utils.reportError("selected page is: " + savedName);
	newFolder('teste rs');
	storePage(savedName, '871122613', content);
	//var urll = retrievePage('848722047', '105704317');
	//Components.utils.reportError(urll);
	//gBrowser.addTab(urll);
		
	//deletePage('871122613', '12370611');
	//deleteFolder('871122613');
	
	
}

function onWindowLoad(){
	for(var i =0;i<window.arguments[0].length;i++){
		document.getElementById("folderList").appendItem(window.arguments[0][i]);
	}
}

function savePage(){
	try {
		var myArray = new Array();
		myArray[0]= "Apples";
		myArray[1]= "Oranges";
		myArray[2]= "Bananas";
		window.openDialog("chrome://pagesaver/content/savePage.xul", "bmarks", "chrome,width=600,height=50,centerscreen",myArray);
		//newFolder('teste rs');
		//storePage('rio grande do sul', '871122613', content);
		//var urll = retrievePage('848722047', '105704317');
		//Components.utils.reportError(urll);
		//gBrowser.addTab(urll);
		
		//deletePage('871122613', '12370611');
		//deleteFolder('871122613');
	} catch (err){
		Components.utils.reportError(err);
		Components.utils.reportError(err.message);
	}
}