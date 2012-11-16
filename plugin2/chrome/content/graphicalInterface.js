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
function savePage(){
	var savedName = document.getElementById("pageDescription").value; 
	var currentMenuName = document.getElementById("folderList").value;
	Components.utils.reportError(currentMenuName);
	if(!currentMenuName){
		Components.utils.reportError("no folder selected");
	}
	else if(!savedName){
		Components.utils.reportError("no description entered");
	}
	else{
		try{
			var folderValue = document.getElementById("folderList").selectedItem.value;
		}catch(err){
			folderValue=null;
		}
		if(folderValue==null){
			Components.utils.reportError("new folder created?");
			folderValue = newFolder(currentMenuName);
		}
	
	storePage(savedName,folderValue, window.opener.content);
	//var urll = retrievePage('848722047', '105704317');
	//Components.utils.reportError(urll);
	//gBrowser.addTab(urll);
		
	//deletePage('871122613', '12370611');
	//deleteFolder('871122613');
	
	window.close();
	}
	
}

function onWindowLoad(){
	var myFolders=retrieveIndex();
	var myArray = new Array();
	for(var i =0;i<myFolders.index[0].folder.length;i++){
		myArray[i]=new Array(2);
		myArray[i][0] = myFolders.index[0].folder[i]['@description'];
		myArray[i][1] = myFolders.index[0].folder[i]['@id'];
	}
	myArray.sort();
	for(var i =0;i<myArray.length;i++){
		document.getElementById("folderList").appendItem(myArray[i][0], myArray[i][1]);
	}
	
	/*for(var i =0;i<myFolders.index[0].folder.length;i++){
		document.getElementById("folderList").appendItem(myFolders.index[0].folder[i]['@description'], myFolders.index[0].folder[i]['@id']);
	}*/
}

function saveWindow(){
	try {
		window.open("chrome://pagesaver/content/savePage.xul", "bmarks", "chrome,width=700,height=50,centerscreen");
	} catch (err){
		Components.utils.reportError(err);
		Components.utils.reportError(err.message);
	}
}
