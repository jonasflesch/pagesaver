var EXPORTED_SYMBOLS = [ "directorySeparator", "baseDir" ];

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

function baseDir(){
	var profileDirectory = Components.classes["@mozilla.org/file/directory_service;1"].
		getService(Components.interfaces.nsIProperties).
		get("ProfD", Components.interfaces.nsIFile);
           
    return profileDirectory.path + directorySeparator() + "pagesaver" + directorySeparator();
}