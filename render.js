const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

const setDirBtn = document.getElementById('locationButton');
const boxContainer = document.getElementById('boxContainer');
const selectedDirElement = document.getElementById('selectedDir');
const findBtn = document.getElementById('findButton');
const imgFileTypes = ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.svg', '.webp',
    '.heif', '.heic', '.cr2', '.nef', '.arw', '.orf', '.rw2', '.psd', '.ico', '.eps', '.pdf', '.ai', '.kra'];
let imgMap = {};

setDirBtn.addEventListener('click', () => {
	ipcRenderer.send('select-dirs');
});

ipcRenderer.on('selected-directory', (event, paths) => {
    selectedDirElement.innerHTML = `<p>${paths}</p>`;
    boxContainer.style.display = 'flex';
});

findBtn.addEventListener('click', () => {
    const dirToSearch = selectedDirElement.textContent.trim();
    const files = fs.readdirSync(dirToSearch);

    files.forEach(file => {
        const ext = file.split('.').pop();
        if (imgFileTypes.includes(`.${ext.toLowerCase()}`)) {
			const filePath = path.join(dirToSearch, file);
            const hash = getFileHash(filePath);

            if (imgMap[hash]) {
                imgMap[hash].push(filePath);
            } else {
                imgMap[hash] = [filePath];
            }
        }
    });

    const duplicates = Object.values(imgMap).filter(paths => paths.length > 1);
    console.log(duplicates);
});

function getFileHash(filePath) {
	try {
		const fileBuffer = fs.readFileSync(filePath);
		const hash = require('crypto').createHash('md5').update(fileBuffer).digest('hex');
		return hash;
	} catch (error) {
		console.log("Error:", error)
	}
	
}
