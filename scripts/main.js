function handleFileSelect(evt) {
  handleCsvFiles(evt.target.files);
}

function handleFileDrop(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  handleCsvFiles(evt.dataTransfer.files);
}

function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy';
}

function handleCsvFiles(files) {
  // TODO : Umang, please make this function return a Promise, you basically want this "json".
  let output = '';
  if (files.length === 1) {
    const file = files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
      const contents = e.target.result;
      const json = parseCsv(contents);
      if (json.status === 'success') {
        // SUCCESS
        output = json.message;
      } else {
        // ERROR
        output = json.message;
      }
      setOutput(output)
    };
    reader.readAsText(file);
  } else {
    output = 'You\'ve uploaded more than one file.';
    setOutput(output)
  }
}

function setOutput(output) {
  document.getElementById('list').innerHTML = '<p>' + output + '</p>';
}

const dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileDrop, false);
document.getElementById('files').addEventListener('change', handleFileSelect, false);