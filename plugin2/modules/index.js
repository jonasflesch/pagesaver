var EXPORTED_SYMBOLS = [ "newFolder" ];

function newFolder(description){
	try {
		Components.utils.reportError('newFolder call');
		var folder = new Object();
		folder['@description'] = description;
		//TODO check if the random is not repeated
		//TODO remove mystical number
		folder['@id'] = Math.floor((Math.random()*1000000000)+1);
		
		var indexObject = retrieveIndexFile();
	
		indexObject.folder.push(folder);
	
		saveIndexFile(indexObject);	
	} catch (err){
		Components.utils.reportError(err);
		Components.utils.reportError(err.message);
	}
}

function newPage(folderIndex, description){
	try {
		var page = new Object();
		page['@description'] = description;
		//TODO check if the random is not repeated
		//TODO remove mystical number
		page['@id'] = Math.floor((Math.random()*1000000000)+1);
	
		var indexObject = retrieveIndexFile();
	
		Components.utils.reportError(indexObject.folder.length);
	
		for (var i=0;i<indexObject.folder.length;i++){
			Components.utils.reportError(indexObject.folder[i]['@id']);
			if(indexObject.folder[i]['@id'] == folderIndex){
		        if (!indexObject.folder[i].hasOwnProperty('page')) {
		        	indexObject.folder[i].page = new Array();
		        }
				indexObject.folder[i].page.push(page);
				break;
			}
		}
		saveIndexFile(indexObject);
	} catch (err){
		Components.utils.reportError(err);
		Components.utils.reportError(err.message);
	}
}

function retrieveIndexFile(){
	try {
		Components.utils.reportError('retrieveIndexFile call');
		var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath("/Users/jonasflesch/Documents/testpagesaver/index.xml");
		if(!file.exists()){
			//TODO put this in new folder and put an error here
			var indexObject = new Object();
			indexObject.folder = new Array();
		} else {
			Components.utils.import("resource://gre/modules/NetUtil.jsm");
			
			//TODO make it assynchronous
			var data = "";
			var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
			var cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"].createInstance(Components.interfaces.nsIConverterInputStream);
			fstream.init(file, -1, 0, 0);
			cstream.init(fstream, "UTF-8", 0, 0); // you can use another encoding here if you wish
			
			let (str = {}) {
			  let read = 0;
			  do { 
			    read = cstream.readString(0xffffffff, str); // read as much as we can and put it in str.value
			    data += str.value;
			  } while (read != 0);
			}
			cstream.close();
			
			var dataAsXml = new DOMParser().parseFromString(data,"text/xml");
			var indexObject = getJXONTree(dataAsXml);
 
// 			NetUtil.asyncFetch(file, function(inputStream, status) {
// 				if (!Components.isSuccessCode(status)) {
// 	    			return;
// 				}
//  				//reads from the inputstream to the string variable
// 			  	var data = NetUtil.readInputStreamToString(inputStream, inputStream.available());
// 			  	Components.utils.reportError('data Read from file: ' + data);
// 			});
// 			Components.utils.reportError('data Read from file2: ' + data);
		}
		Components.utils.reportError(indexObject.toSource());
		
		return indexObject;
	} catch (err){
		Components.utils.reportError(err);
		Components.utils.reportError(err.message);
	}
}

function saveIndexFile(indexObject){
	try {
		Components.utils.reportError('saveIndexFile call');
		Components.utils.import("resource://gre/modules/NetUtil.jsm");
		Components.utils.import("resource://gre/modules/FileUtils.jsm");
	
		var xmlDoc = createXML(indexObject);
		var xmlAsString = new XMLSerializer().serializeToString(xmlDoc);
		Components.utils.reportError(xmlAsString);
 
		// file is nsIFile, data is a string
	
		var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath("/Users/jonasflesch/Documents/testpagesaver/index.xml");
 
		var ostream = FileUtils.openSafeFileOutputStream(file)
 
		var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
		converter.charset = "UTF-8";
		var istream = converter.convertToInputStream(xmlAsString);
 
		// The last argument (the callback) is optional.
		NetUtil.asyncCopy(istream, ostream, function(status) {
			if (!Components.isSuccessCode(status)) {
			// Handle error!
				return;
			}
		});
	} catch (err){
		Components.utils.reportError(err);
		Components.utils.reportError(err.message);
	}
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
 
function getJXONTree (oXMLParent) {
  var vResult = /* put here the default value for empty nodes! */ true, nLength = 0, sCollectedTxt = "";
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
  /* if (nLength > 0) { Object.freeze(vResult); } */
  return vResult;
}

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
  const oNewDoc = document.implementation.createDocument("", "", null);
  loadObjTree(oNewDoc, oObjTree);
  return oNewDoc;
}