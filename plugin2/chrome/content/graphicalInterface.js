Components.utils.import("resource://pagesaver-modules/index.js");
Components.utils.import("resource://pagesaver-modules/repository.js");

//graphical interface
const NS_XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

//This function handles populating our extension's menu's and submenu's with items
function loadSavedPages(mainDocument){
	
	//gets main window using Firefox window mediator
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	var mainWindow = wm.getMostRecentWindow("navigator:browser");
	
	//sets the mainDocument equal to the mainWindow.document
	mainDocument = mainWindow.document;

	//this starts by removing any existing elements in the lists before 
	//adding the most current ones
	var element = mainDocument.getElementById("loadMenupopup");

	if(element){
		while(element.hasChildNodes()){
			while(element.firstChild.hasChildNodes()){
				while(element.firstChild.firstChild.hasChildNodes()){
					element.firstChild.firstChild.removeChild(element.firstChild.firstChild.firstChild);
				}
				element.firstChild.removeChild(element.firstChild.firstChild);
			}
			element.removeChild(element.firstChild);
		}
	}
	
	element = mainDocument.getElementById("deleteMenupopup");
	if(element){
		while(element.hasChildNodes()){
			element.removeChild(element.firstChild);
		}
	}
	
	//gets the most recent copy of our index file
	var indexObject = retrieveIndex();
	
	var folder = indexObject.index[0].folder;
	
	//populates the load menu, the ids correspond to the values we gave to each folder and file name, and the 
	//descriptions are the user inputted values, we add the folders as menus first, and then the pages as
	//elements to the folders
	for(var i =0;i<folder.length;i++){
		addMenu(folder[i]['@id'],folder[i]['@description'],null,'loadMenupopup',mainDocument);
		try{
			for(var j=0;j<folder[i].page.length;j++){
				addItemToMenu(folder[i].page[j]['@id'],folder[i].page[j]['@description'],loadPage,folder[i]['@id']+'popup',null,mainDocument);
			}
		}catch(err){
		}
	}
	
	
	//populates the delete menu, the ids correspond to the values we gave to each folder and file name, and the 
	//descriptions are the user inputted values, we add the folders as menus first, and then the pages as
	//elements to the folders, we also add a menu item to delete the whole folder of entries
	for(var i =0;i<folder.length;i++){
		addMenu(folder[i]['@id']+'delete',folder[i]['@description'],null,'deleteMenupopup',mainDocument);
		addItemToMenu(folder[i]['@id']+'deletefolder',"Delete Folder",deleteFolderCall,folder[i]['@id']+'deletepopup',null,mainDocument);
		try{
			for(var j=0;j<folder[i].page.length;j++){
				addItemToMenu(folder[i].page[j]['@id'],folder[i].page[j]['@description'],deletePageCall,folder[i]['@id']+'deletepopup',null,mainDocument);
			}
		}catch(err){
		}
	}
}

//called while populating the menus and submenus of the extension
//adds an item to the list and sets the event listener so that when it is clicked
//we can run some function to load/delete the specified page
function addItemToMenu(id, label, onCommand, menuid, insertBefore, mainDocument){

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

//Used to add menus while populating the extension, adds menu items to a menupopup
//and then assigns a new menupopup to the added menu because all menus and menuitems
//must be added as children to menupopup items
function addMenu(id, label, command, menuid, mainDocument){

    var onCmd = function() {
    	options.onCommand && options.onCommand();
    };
	
    var menu = mainDocument.createElementNS(NS_XUL, "menu");
    menu.setAttribute("id", id);
    menu.setAttribute("label", label);
	
	if (menuid) {
    	let ($ = function(id) mainDocument.getElementById(id)) {
          $(menuid).appendChild(menu);
    	}
    }
	
	//code to add the menupopup to the just added menu using some of the
	//previously used ids with minor adjustments
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

//listener function for the loadPage click event, takes the folder index and the 
//page index and opens the selected page in a new tab
function loadPage(){
	var url = retrievePage(this.id,this.parentContainer.id);
	//gets main window using Firefox window mediator for accessing the active browser
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	browser = wm.getMostRecentWindow("navigator:browser").getBrowser();
	browser.selectedTab = browser.addTab(url);
}

//listener to delete a specified page, takes the folder index and page index and deletes the page
//after something is deleted we update the gui to reflect the current saved pages
function deletePageCall(){
	var tempId = this.parentContainer.id.substring(0,this.parentContainer.id.lastIndexOf('delete'));
	deletePage(tempId,this.id);
	loadSavedPages(window.document);
}

//listener to delete an entire folder, takes the folder index and deletes the folder from the index
//file and from disk, after something is deleted we update the gui to reflect the current saved pages
function deleteFolderCall(){
	try {
		var tempId = this.parentContainer.id.substring(0,this.id.lastIndexOf('deletefolder'));
		deleteFolder(tempId);
		loadSavedPages(window.document);
	} catch(err){
		alert(err.message);
	}
}

//called whenever the save page option is selected in the menu, opens a new window that allows the
//user to input the description for the page, and what folder they want it saved to
function saveWindow(){
	try {
		window.open("chrome://pagesaver/content/savePage.xul", "bmarks", "chrome,width=700,height=50,centerscreen");
	} catch (err){
		alert(err.message);
	}
}
	   
//this function is run from the save page xul and is called when the window is being created, but before it is
//displayed.  It gathers the list of folders from the index file and puts them in alphabetic order, then 
//adds each of them to an editable combo box on the window for the user to select or add their own.
function onWindowLoad(){
	var indexObject=retrieveIndex();
	var myArray = new Array();
	
	var folder = indexObject.index[0].folder;
	
	for(var i = 0;i<folder.length;i++){
		myArray[i]=new Array(2);
		myArray[i][0] = folder[i]['@description'];
		myArray[i][1] = folder[i]['@id'];
	}
	
	myArray.sort();
	
	for(var i = 0;i<myArray.length;i++){
		document.getElementById("folderList").appendItem(myArray[i][0], myArray[i][1]);
	}
}
	   
//function called from the save page xul again, this occurs when the user presses the button
//marked "save page as" on the popped up window.  It makes sure that the description and the folder are
//both non-empty and then it saves the page to the desired folder with the desired description.
//the call to storePage() is in the repository, and after that we update the visible pages in our gui
//by calling loadSavedPages() once more, and then closing the window.
function savePage(){
	try {
		var savedName = document.getElementById("pageDescription").value; 
		var currentMenuName = document.getElementById("folderList").value;
		validateSavePage(savedName, currentMenuName);
		
		try {
			var folderValue = document.getElementById("folderList").selectedItem.value;
		} catch(err) {
			//no item selected
			folderValue=null;
		}
		
		//checks if no item was selected or the item selected is null
		if(folderValue==null){
			folderValue = newFolder(currentMenuName);
		}
	
		storePage(savedName, folderValue, window.opener.content);
	
		loadSavedPages(window.opener.document);
	
		window.close();
	} catch(err){
		alert(err.message);
	}
}

//encloses the validation for the save page
function validateSavePage(savedName, currentMenuName){
	if(!currentMenuName){
		throw {
			name:        "Validation Error",
			level:       "Show Stopper",
			message:     "No folder selected.",
			htmlMessage: "No folder selected."
		}
	} else if(!savedName){
		throw {
			name:        "Validation Error",
			level:       "Show Stopper",
			message:     "No description entered.",
			htmlMessage: "No description entered."
		}
	}
}
