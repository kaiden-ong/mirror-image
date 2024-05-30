const { ipcRenderer } = require('electron');

const setDirBtn = document.getElementById('locationButton')
const boxContainer = document.getElementById('boxContainer');
const selectedDirElement = document.getElementById('selectedDir');
const findBtn = document.getElementById('findButton');

setDirBtn.addEventListener('click', () => {
	ipcRenderer.send('select-dirs');
})

ipcRenderer.on('selected-directory', (event, paths) => {
	selectedDirElement.innerHTML = `<p>${paths}</p>`;
	boxContainer.style.display = 'flex';
});

findBtn.addEventListener('click', () => {
	console.log("CLICKED FIND")
	// TODO: go through selected folder and look at each file, if image => add to map if not hash not already there
	// At end, go through map check which keys have values > 1, return those as 2d array?
})