const {Cc,Ci,Cu,components} = require("chrome");

var addPageSaverToMenu = function(pwindow){
		var menuitem = require("menuitems").Menuitem({
		id: "clickme",
		menuid: "menu_ToolsPopup",
		label: "Click Me!",
		onCommand: function() {
			console.log("clicked");
			salva(pwindow);
		},
		insertbefore: "menu_pageInfo"
	});

}

var salva = function(pwindow){
	try {
		var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
		file.initWithPath("/Users/jonasflesch/Documents/testpagesaver/test.html");
	    	var filePath = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
		filePath.initWithPath("/Users/jonasflesch/Documents/testpagesaver/test/");
		var wbp = Cc['@mozilla.org/embedding/browser/nsWebBrowserPersist;1'].createInstance(Ci.nsIWebBrowserPersist);
		
		const nsIWBP = Ci.nsIWebBrowserPersist;
	
		console.log(pwindow);
	
		console.log("before save");
		console.log(pwindow.content.document);
		
		var outputFlags = 0;
		outputFlags |= wbp.ENCODE_FLAGS_ENCODE_BASIC_ENTITIES;
		
		wbp.persistFlags = nsIWBP.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION | nsIWBP.PERSIST_FLAGS_REPLACE_EXISTING_FILES | nsIWBP.PERSIST_FLAGS_FORCE_ALLOW_COOKIES;
	
		wbp.saveDocument(pwindow.content.document, file, filePath, null, outputFlags, 80);
	    	console.log("Saved");	
	} catch (err){
		console.log(err);
		console.log(err.message);
	}
}

var delegate = {
  onTrack: function (window) {
    console.log("Tracking a window: " + window.location);
    addPageSaverToMenu(window);
  },
  onUntrack: function (window) {
    console.log("Untracking a window: " + window.location);
    // Undo your modifications!
  }
};
var winUtils = require("window-utils");
var tracker = new winUtils.WindowTracker(delegate);