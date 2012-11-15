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
	try {
		window.open("chrome://pagesaver/content/savePage.xul", "bmarks", "chrome,width=600,height=300");
	} catch (err){
		Components.utils.reportError(err);
		Components.utils.reportError(err.message);
	}
}