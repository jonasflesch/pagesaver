Components.utils.import("resource://pagesaver-modules/index.js");
Components.utils.import("resource://pagesaver-modules/repository.js");

//graphical interface
const NS_XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

function addItemToMenu(id, label, onCommand, menuid, insertBefore, mainDocument){
	//check for safety, if it is not the window of the browser doesnt add
	//if ("chrome://browser/content/browser.xul" != window.location) return;

    var menuitem = mainDocument.createElementNS(NS_XUL, "menuitem");
    menuitem.setAttribute("id", id);
    menuitem.setAttribute("label", label);
    menuitem.addEventListener("command", onCommand, true);

	if (menuid) {
    	let ($ = function(id) mainDocument.getElementById(id)) {
          $(menuid).appendChild(menuitem);
    	}
    }
}

function addMenu(id, label, command, menuid, mainDocument){
	//check for safety, if it is not the window of the browser doesnt add
	//if ("chrome://browser/content/browser.xul" != window.location) return;

    var onCmd = function() {
    	options.onCommand && options.onCommand();
    };
	
    var menu = mainDocument.createElementNS(NS_XUL, "menu");
    menu.setAttribute("id", id);
    menu.setAttribute("label", label);

	
	Components.utils.reportError("main document" +  mainDocument);
	if (menuid) {
    	let ($ = function(id) mainDocument.getElementById(id)) {
			Components.utils.reportError("menuid" +  $(menuid));
          $(menuid).appendChild(menu);
    	}
    }
	
	//if (menuid) {
    //	let ($ = function(id) mainDocument.getElementById(id)) {
    //      $(menuid).appendChild(menu);
    //	}
    //}
	
	var menupopupid=id+'popup';
	
	var menupopup = mainDocument.createElementNS(NS_XUL, "menupopup");
	menupopup.setAttribute("id", menupopupid);
	menupopup.setAttribute("type", "menu");

	if (id) {
    	let ($ = function(menupopupid) mainDocument.getElementById(menupopupid)) {
          $(id).appendChild(menupopup);
    	}
    }
	
	
}

function loadPage(){
	var urll = retrievePage(this.id,this.parentContainer.id);
    gBrowser.addTab(urll);
}
	   
function deletePageCall(){
	var tempId = this.parentContainer.id.substring(0,this.parentContainer.id.lastIndexOf('delete'));
	deletePage(tempId,this.id);
	loadSavedPages(window.document);
}

function deleteFolderCall(){
	var tempId = this.parentContainer.id.substring(0,this.id.lastIndexOf('deletefolder'));
	deleteFolder(tempId);
	loadSavedPages(window.document);
}
	   
function loadSavedPages(mainDocument){

	if(typeof mainDocument === "undefined"){
		mainDocument = window.document;
		Components.utils.reportError("window to source = " + window.document.toSource());
	}

	Components.utils.reportError("document = " + mainDocument.toSource());

	var element = mainDocument.getElementById("loadMenupopup");
	if(element){
		while(element.hasChildNodes()){
			Components.utils.reportError('element.firstChild'+element.firstChild.id);
			element.removeChild(element.firstChild);
		}
	}
	element = mainDocument.getElementById("deleteMenupopup");
	if(element){
		while(element.hasChildNodes()){
			element.removeChild(element.firstChild);
		}
	}
	
	var myFolders = retrieveIndex();
	
	for(var i =0;i<myFolders.index[0].folder.length;i++){
		addMenu(myFolders.index[0].folder[i]['@id'],myFolders.index[0].folder[i]['@description'],null,'loadMenupopup',mainDocument);
		try{
			for(var j=0;j<myFolders.index[0].folder[i].page.length;j++){
				addItemToMenu(myFolders.index[0].folder[i].page[j]['@id'],myFolders.index[0].folder[i].page[j]['@description'],loadPage,myFolders.index[0].folder[i]['@id']+'popup',null,mainDocument);
			}
		}catch(err){
			Components.utils.reportError(err.message);
		}
	}
	
	for(var i =0;i<myFolders.index[0].folder.length;i++){
		addMenu(myFolders.index[0].folder[i]['@id']+'delete',myFolders.index[0].folder[i]['@description'],null,'deleteMenupopup',mainDocument);
		addItemToMenu(myFolders.index[0].folder[i]['@id']+'deletefolder',"Delete Folder",deleteFolderCall,myFolders.index[0].folder[i]['@id']+'deletepopup',null,mainDocument);
		try{
			for(var j=0;j<myFolders.index[0].folder[i].page.length;j++){
				addItemToMenu(myFolders.index[0].folder[i].page[j]['@id'],myFolders.index[0].folder[i].page[j]['@description'],deletePageCall,myFolders.index[0].folder[i]['@id']+'deletepopup',null,mainDocument);
			}
		}catch(err){
			Components.utils.reportError(err.message);
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
			folderValue = newFolder(currentMenuName);
		}
	
		storePage(savedName, folderValue, window.opener.content);
	
		loadSavedPages(window.opener.document);
	
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
