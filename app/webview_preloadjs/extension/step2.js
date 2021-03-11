function deepCopyFunction(inObject){
  var outObject, value, key

  if (typeof inObject !== "object" || inObject === null) {
      return inObject // Return the value if inObject is not an object
  }

  // Create an array or object to hold the values
  outObject = Array.isArray(inObject) ? [] : {}

  for (key in inObject) {
      value = inObject[key]

      // Recursively (deep) copy for nested objects, including arrays
      outObject[key] = deepCopyFunction(value)
  }

  return outObject
}
_go = deepCopyFunction(window.history.go);
window.history.go = function (offset) {
  if(!offset || offset==0){
    location.reload();
  }
  _go(offset);
};

const { ipcRenderer } = require('electron');
function init() {
  // add global variables to your web page
  window.isElectron = true
  window.ipcRenderer = ipcRenderer
  console.log("init");
}
init();
window.onload= initPopupScript;
// document.addEventListener('DOMContentLoaded', initPopupScript);
function initPopupScript(){
}

