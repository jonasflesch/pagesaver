var EXPORTED_SYMBOLS = [ "savePageOld" ];

// gets the directory separator based on the operation system
// Windows uses \ and unix uses /
function directorySeparator(){
	var env = Components.classes["@mozilla.org/process/environment;1"].createInstance(Components.interfaces.nsIEnvironment);
		
	var systemRoot = env.get("SystemRoot");
	if(systemRoot == null || systemRoot == ''){
		//Unix
		return '/';
	} else {
		//Windows
		return '\\';
	}
}

function savePageOld(){
	try {
		Components.utils.reportError('savePage call');
		//newFolder('test');
		//newPage('138211678', 'test page');
	
		var profileDirectory = Components.classes["@mozilla.org/file/directory_service;1"].
           getService(Components.interfaces.nsIProperties).
           get("ProfD", Components.interfaces.nsIFile);
           
        var baseDir = profileDirectory.path + directorySeparator() + "pagesaver" + directorySeparator();
        
        var filePath = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		filePath.initWithPath(baseDir + "test" + directorySeparator());
        
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        
        file.initWithPath(baseDir + "test.html");
        
		var wbp = Components.classes['@mozilla.org/embedding/browser/nsWebBrowserPersist;1'].createInstance(Components.interfaces.nsIWebBrowserPersist);
		
		const nsIWBP = Components.interfaces.nsIWebBrowserPersist;
		
		//these are the same parameters from the default Save As of Firefox
		var outputFlags = 0;
		outputFlags |= wbp.ENCODE_FLAGS_ENCODE_BASIC_ENTITIES;
		wbp.persistFlags = nsIWBP.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION | nsIWBP.PERSIST_FLAGS_REPLACE_EXISTING_FILES | nsIWBP.PERSIST_FLAGS_FORCE_ALLOW_COOKIES;
	
		wbp.saveDocument(content.document, file, filePath, null, outputFlags, 80);	
	} catch (err){
		Components.utils.reportError(err);
		Components.utils.reportError(err.message);
	}
}