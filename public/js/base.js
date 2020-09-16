function toMD5(str) {
	return CryptoJS.MD5(str).toString();
}

function downloadFile(blobParts, blobType, downloadFileName) {

	var newBlob = new Blob([blobParts], {type: blobType});

	if (window.navigator && window.navigator.msSaveOrOpenBlob) {
		window.navigator.msSaveOrOpenBlob(newBlob);
		return
	}

	var data = window.URL.createObjectURL(newBlob);
	var link = document.createElement('a');
	link.href = data;
	link.download = downloadFileName

	document.body.appendChild(link);

	link.click();

	setTimeout(function(){
		document.body.removeChild(link);
		window.URL.removeObjectURL(data);
	}, 100)

}