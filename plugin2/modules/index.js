var EXPORTED_SYMBOLS = [ "newFolder", "newPage", "deletePageFromIndex", "deleteFolderFromIndex", "retrieveIndex" ];

Components.utils.import("resource://pagesaver-modules/utils.js");

//maximum size of the id of a page or folder
const RANDOMSIZE = 1000000000;

//creates a new folder in the index
function newFolder(description){
	try {
		Components.utils.reportError('newFolder call');
		var folder = new Object();
		folder['@description'] = description;
		
		var indexObject = retrieveIndex();
		
		Components.utils.reportError(indexObject.index[0].folder);
		
		folder['@id'] = generateRandomIdForPageOrFolder(indexObject.index[0].folder);
	
		indexObject.index[0].folder.push(folder);
	
		saveIndexFile(indexObject);

		return folder['@id'];
	} catch (err){
		Components.utils.reportError(err);
		Components.utils.reportError(err.message);
	}
}

//creates a new page into the index, returning the generated ID
function newPage(folderIndex, description){
	try {
		var page = new Object();
		page['@description'] = description;
		
		var indexObject = retrieveIndex();
	
		Components.utils.reportError(indexObject.index[0].folder.length);
	
		for(var i=0;i<indexObject.index[0].folder.length;i++){
			Components.utils.reportError(indexObject.index[0].folder[i]['@id']);
			if(indexObject.index[0].folder[i]['@id'] == folderIndex){
		        if(!indexObject.index[0].folder[i].hasOwnProperty('page')) {
		        	indexObject.index[0].folder[i].page = new Array();
		        }
		        page['@id'] = generateRandomIdForPageOrFolder(indexObject.index[0].folder[i].page);
		        
				indexObject.index[0].folder[i].page.push(page);
				break;
			}
		}
		saveIndexFile(indexObject);
		
		return page['@id'];
	} catch (err){
		Components.utils.reportError(err);
		Components.utils.reportError(err.message);
	}
}

//deletes a page from the index
function deletePageFromIndex(folderIndex, pageIndex){
	var indexObject = retrieveIndex();
	for(var i=0;i < indexObject.index[0].folder.length;i++){
		if(indexObject.index[0].folder[i]['@id'] == folderIndex){
			for(var j=0;j < indexObject.index[0].folder[i].page.length;j++){
				if(indexObject.index[0].folder[i].page[j]['@id'] == pageIndex){
					indexObject.index[0].folder[i].page.splice(j,1);
					break;
				}
			}
			break;
		}
	}
	saveIndexFile(indexObject);
}

//deletes a folder from the index
function deleteFolderFromIndex(folderIndex){
	var indexObject = retrieveIndex();
	for(var i=0;i < indexObject.index[0].folder.length;i++){
		if(indexObject.index[0].folder[i]['@id'] == folderIndex){
			indexObject.index[0].folder.splice(i,1);
			break;
		}
	}
	saveIndexFile(indexObject);
}

//retrieves a random number to be used as id for a file or folder
function generateRandomIdForPageOrFolder(pageOrFolder){
	//safety: check if random number already exists
	var idPageOrFolder = Math.floor((Math.random()*RANDOMSIZE)+1);
	//check for safety
	if (!(typeof pageOrFolder === "undefined")) {
		for (var j=0;j<pageOrFolder.length;j++){
			if(pageOrFolder[j]['@id'] == idPageOrFolder){
				return generateRandomIdForPage(pageOrFolder);
			}
		}
	}
	
	return idPageOrFolder;
}

//gets the index as an object from the profile directory
function retrieveIndex(){
	try {
		Components.utils.reportError('retrieveIndex call');
		
		var file = indexFile();
		
		if(!file.exists()){
			var indexObject = new Object();
			indexObject.index = new Array();
			indexObject.index.push(new Object());
			indexObject.index[0].folder = new Array();
		} else {
			Components.utils.import("resource://gre/modules/NetUtil.jsm");
			
			var data = "";
			var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
			var cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"].createInstance(Components.interfaces.nsIConverterInputStream);
			fstream.init(file, -1, 0, 0);
			cstream.init(fstream, "UTF-8", 0, 0);
			
			let (str = {}) {
			  let read = 0;
			  do { 
			    read = cstream.readString(0xffffffff, str);
			    data += str.value;
			  } while (read != 0);
			}
			cstream.close();
			
			var domParser = Components.classes["@mozilla.org/xmlextras/domparser;1"].createInstance(Components.interfaces.nsIDOMParser);
			
			var dataAsXml = domParser.parseFromString(data,"text/xml");
			var indexObject = getJXONTree(dataAsXml);
			
			if(!indexObject.hasOwnProperty('index')) {
				Components.utils.reportError('no index, creating');
				indexObject.index = new Array();
				indexObject.index.push(new Object());
			}
			if(!indexObject.index[0].hasOwnProperty('folder')) {
				indexObject.index[0].folder = new Array();
			}

		}
		Components.utils.reportError(indexObject.toSource());
		
		return indexObject;
	} catch (err){
		Components.utils.reportError(err);
		Components.utils.reportError(err.message);
	}
}

// saves the object serialized as a XML into the profile directory
function saveIndexFile(indexObject){
	try {
		Components.utils.reportError('saveIndexFile call');
		
		var xmlDoc = createXML(indexObject);
		
		var xmlSerializer = Components.classes["@mozilla.org/xmlextras/xmlserializer;1"].createInstance(Components.interfaces.nsIDOMSerializer);
		
		var xmlAsString = xmlSerializer.serializeToString(xmlDoc);
		Components.utils.reportError(xmlAsString);
		
		var file = indexFile();
		
		var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
 
		// Mozilla flags : https://developer.mozilla.org/en-US/docs/PR_Open
		// 0x02	Open for writing only.
		// 0x08	If the file does not exist, the file is created. If the file exists, this flag has no effect.
		// 0x20	If the file exists, its length is truncated to 0.
		foStream.init(file, 0x02 | 0x08 | 0x20, 0666, 0); 
 
		var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
		converter.init(foStream, "UTF-8", 0, 0);
		converter.writeString(xmlAsString);
		converter.close(); // this closes foStream
	} catch (err){
		Components.utils.reportError(err);
		Components.utils.reportError(err.message);
	}
}

//returns the file for the index.xml of the plugin
function indexFile(){
	var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(baseDir() + "index.xml");
	return file;
}


//https://developer.mozilla.org/en-US/docs/JXON
//public domain license
function parseText (sValue) {
  if (/^\s*$/.test(sValue)) { return null; }
  if (/^(?:true|false)$/i.test(sValue)) { return sValue.toLowerCase() === "true"; }
  if (isFinite(sValue)) { return parseFloat(sValue); }
  if (isFinite(Date.parse(sValue))) { return new Date(sValue); }
  return sValue;
}

//transforms the XML into an javascript object
function getJXONTree (oXMLParent) {
  var vResult = new Object(), nLength = 0, sCollectedTxt = "";
  if (oXMLParent.hasAttributes()) {
    vResult = {};
    for (nLength; nLength < oXMLParent.attributes.length; nLength++) {
      oAttrib = oXMLParent.attributes.item(nLength);
      vResult["@" + oAttrib.name.toLowerCase()] = parseText(oAttrib.value.trim());
    }
  }
  if (oXMLParent.hasChildNodes()) {
    for (var oNode, sProp, vContent, nItem = 0; nItem < oXMLParent.childNodes.length; nItem++) {
      oNode = oXMLParent.childNodes.item(nItem);
      if (oNode.nodeType === 4) { sCollectedTxt += oNode.nodeValue; } /* nodeType is "CDATASection" (4) */
      else if (oNode.nodeType === 3) { sCollectedTxt += oNode.nodeValue.trim(); } /* nodeType is "Text" (3) */
      else if (oNode.nodeType === 1 && !oNode.prefix) { /* nodeType is "Element" (1) */
        if (nLength === 0) { vResult = {}; }
        sProp = oNode.nodeName.toLowerCase();
        vContent = getJXONTree(oNode);
        if (vResult.hasOwnProperty(sProp)) {
          vResult[sProp].push(vContent);
        } else { vResult[sProp] = [vContent]; nLength++; }
      }
    }
  }
  if (sCollectedTxt) { nLength > 0 ? vResult.keyValue = parseText(sCollectedTxt) : vResult = parseText(sCollectedTxt); }
  return vResult;
}

//transforms a javascript object into an XML
function createXML (oObjTree) {
  function loadObjTree (oParentEl, oParentObj) {
    var vValue, oChild;
    if (oParentObj instanceof String || oParentObj instanceof Number || oParentObj instanceof Boolean) {
      oParentEl.appendChild(oNewDoc.createTextNode(oParentObj.toString())); /* verbosity level is 0 */
    } else if (oParentObj.constructor === Date) {
      oParentEl.appendChild(oNewDoc.createTextNode(oParentObj.toGMTString()));    
    }
    for (var sName in oParentObj) {
      if (isFinite(sName)) { continue; } /* verbosity level is 0 */
      vValue = oParentObj[sName];
      if (sName === "keyValue") {
        if (vValue !== null && vValue !== true) { oParentEl.appendChild(oNewDoc.createTextNode(vValue.constructor === Date ? vValue.toGMTString() : String(vValue))); }
      } else if (sName === "keyAttributes") { /* verbosity level is 3 */
        for (var sAttrib in vValue) { oParentEl.setAttribute(sAttrib, vValue[sAttrib]); }
      } else if (sName.charAt(0) === "@") {
        oParentEl.setAttribute(sName.slice(1), vValue);
      } else if (vValue.constructor === Array) {
        for (var nItem = 0; nItem < vValue.length; nItem++) {
          oChild = oNewDoc.createElement(sName);
          loadObjTree(oChild, vValue[nItem]);
          oParentEl.appendChild(oChild);
        }
      } else {
        oChild = oNewDoc.createElement(sName);
        if (vValue instanceof Object) {
          loadObjTree(oChild, vValue);
        } else if (vValue !== null && vValue !== true) {
          oChild.appendChild(oNewDoc.createTextNode(vValue.toString()));
        }
        oParentEl.appendChild(oChild);
      }
    }
  }
  var currentWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser");
  
  Components.utils.reportError(currentWindow);
  
  const oNewDoc = currentWindow.document.implementation.createDocument("", "", null);
  
  Components.utils.reportError(oNewDoc);
  
  loadObjTree(oNewDoc, oObjTree);
  return oNewDoc;
}