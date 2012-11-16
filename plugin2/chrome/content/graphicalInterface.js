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
    //menuitem.addEventListener("command", command, true);

	if (menuid) {
    	let ($ = function(id) window.document.getElementById(id)) {
          $(menuid).appendChild(menuitem);
    	}
    }
}

function addMenu(id, label, command, menuid){
	//check for safety, if it is not the window of the browser doesnt add
	if ("chrome://browser/content/browser.xul" != window.location) return;

    var onCmd = function() {
    	options.onCommand && options.onCommand();
    };
	
    var menu = window.document.createElementNS(NS_XUL, "menu");
    menu.setAttribute("id", id);
    menu.setAttribute("label", label);
    //menu.addEventListener("command", command, true);

	if (menuid) {
    	let ($ = function(id) window.document.getElementById(id)) {
          $(menuid).appendChild(menu);
    	}
    }
	
	var menupopupid=id+'popup';
	
	 var menupopup = window.document.createElementNS(NS_XUL, "menupopup");
	menupopup.setAttribute("id", menupopupid);
	menupopup.setAttribute("type", "menu");

	if (id) {
    	let ($ = function(menupopupid) window.document.getElementById(menupopupid)) {
          $(id).appendChild(menupopup);
    	}
    }
	
	
}

function loadSavedPages(){
	var element = document.getElementById("loadMenupopup");
	if(element){
		while(element.hasChildNodes()){
			element.removeChild(element.firstChild);
		}
	}
	element = document.getElementById("deleteMenupopup");
	if(element){
		while(element.hasChildNodes()){
			element.removeChild(element.firstChild);
		}
	}
	
	var myFolders = retrieveIndex();
	for(var i =0;i<myFolders.index[0].folder.length;i++){
		addMenu(myFolders.index[0].folder[i]['@id'],myFolders.index[0].folder[i]['@description'],null,'loadMenupopup');
		try{
			for(var j=0;j<myFolders.index[0].folder[i].page.length;j++){
				addItemToMenu(myFolders.index[0].folder[i].page[j]['@id'],myFolders.index[0].folder[i].page[j]['@description'],null,myFolders.index[0].folder[i]['@id']+'popup',null);
			}
		}catch(err){
		}
	}
	
	for(var i =0;i<myFolders.index[0].folder.length;i++){
		addMenu(myFolders.index[0].folder[i]['@id']+'delete',myFolders.index[0].folder[i]['@description'],null,'deleteMenupopup');
		addItemToMenu(myFolders.index[0].folder[i]['@id']+'deletefolder',"Delete Folder",null,myFolders.index[0].folder[i]['@id']+'deletepopup',null);
		try{
			for(var j=0;j<myFolders.index[0].folder[i].page.length;j++){
				addItemToMenu(myFolders.index[0].folder[i].page[j]['@id'],myFolders.index[0].folder[i].page[j]['@description'],null,myFolders.index[0].folder[i]['@id']+'deletepopup',null);
			}
		}catch(err){
		}
	}
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
	

	storePage(savedName, folderValue, window.opener.content);

	loadSavedPages();
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
