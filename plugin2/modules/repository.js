var EXPORTED_SYMBOLS = [ "storePage", "retrievePage", "deletePage", "deleteFolder" ];

Components.utils.import("resource://pagesaver-modules/utils.js");
Components.utils.import("resource://pagesaver-modules/index.js");

//the extension of the saved file
const EXTENSION = "html";

//stores the content from the file open in the tab inside to the hard drive, updating the index
function storePage(description, folderIndex, content){
	var pageIndex = newPage(folderIndex, description);
	
	var folderFile = fileFolderPath(folderIndex, pageIndex);
	
	var file = filePath(folderIndex, pageIndex);
	
	var wbp = Components.classes['@mozilla.org/embedding/browser/nsWebBrowserPersist;1'].createInstance(Components.interfaces.nsIWebBrowserPersist);
	
	const nsIWBP = Components.interfaces.nsIWebBrowserPersist;
	
	//these are the same parameters from the default Save As of Firefox
	var outputFlags = 0;
	outputFlags |= wbp.ENCODE_FLAGS_ENCODE_BASIC_ENTITIES;
	wbp.persistFlags = nsIWBP.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION | nsIWBP.PERSIST_FLAGS_REPLACE_EXISTING_FILES | nsIWBP.PERSIST_FLAGS_FORCE_ALLOW_COOKIES;
	
	wbp.saveDocument(content.document, file, folderFile, null, outputFlags, 80);	
}

//return the File where the html file is saved in the hard drive
function filePath(folderIndex, pageIndex){
	var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
    file.initWithPath(baseDir() + directorySeparator() + folderIndex + directorySeparator() + pageIndex + "." + EXTENSION);
    return file;
}

//return the File for the folder where the CSS, JS, etc files are saved in the hard drive
function fileFolderPath(folderIndex, pageIndex){
	var filePath = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	filePath.initWithPath(baseDir() + directorySeparator() + folderIndex +  directorySeparator() + pageIndex + directorySeparator());
	return filePath;
}

//returns the File object for a folder in the hard drive
function folderPath(folderIndex){
	var filePath = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	filePath.initWithPath(baseDir() + directorySeparator() + folderIndex +  directorySeparator());
	return filePath;
}

//return the path for the page in the hard drive
//returns as string because is this way that Firefox needs it to load into the tab
function retrievePage(pageIndex, folderIndex){
	return baseDir() + folderIndex + directorySeparator() + pageIndex + "." + EXTENSION;
}

//deleted the folder from the hard drive and from the index
function deleteFolder(folderIndex){
	var folderFile = folderPath(folderIndex);
    
    //if the folder is new it is not created in the hard drive
    if(folderFile.exists()){
    	folderFile.remove(true);
    }
    
	deleteFolderFromIndex(folderIndex);
}

//deletes a page from the hard drive and from the index
function deletePage(folderIndex, pageIndex){
	var folderFile = fileFolderPath(folderIndex, pageIndex);
    var file = filePath(folderIndex, pageIndex);
    
    //remove recursive
    file.remove(true);
    folderFile.remove(true);
    
	deletePageFromIndex(folderIndex, pageIndex);
}