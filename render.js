const { ipcRenderer, shell } = require('electron');
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
	imgMap = {}
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
	displayNumDuplicates();
    displayDuplicates();
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

function displayDuplicates() {
    const duplicates = Object.values(imgMap).filter(paths => paths.length > 1);
	console.log(duplicates);
    const dupCardsContainer = document.querySelector('.dup-cards');
    dupCardsContainer.innerHTML = '';

    duplicates.forEach(paths => {
        const card = document.createElement('div');
        card.classList.add('dup-card');
		card.style.border = '1px solid #ccc';

		paths.forEach(filePath => {
			const imgPath = document.createElement('p');
            imgPath.textContent = filePath;
			imgPath.className = "img-paths";
			imgPath.addEventListener('click', () => openPath(filePath));
            card.appendChild(imgPath);
        });

		const viewButton = document.createElement('button');
        viewButton.textContent = 'View Image';
        viewButton.className = 'view-button';
		viewButton.addEventListener('click', () => showImage(paths[0]));
        card.appendChild(viewButton);

        dupCardsContainer.appendChild(card);
    });
}

function displayNumDuplicates() {
	const numDupsDiv = document.querySelector(".num-dups");
	const duplicates = Object.values(imgMap).filter(paths => paths.length > 1);
	const numDups = duplicates.length
	numDupsDiv.innerText = "Sets of duplicates images remaining: " + numDups
}

function showImage(filePath) {
    console.log("Showing image:", filePath);
    window.open(filePath);
}

function openPath(filePath) {
	console.log("Opening image path:", filePath);
	shell.showItemInFolder(filePath); 
}