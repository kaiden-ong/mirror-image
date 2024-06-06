const { ipcRenderer, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
var Walk = require("@root/walk");

const setDirBtn = document.getElementById('locationButton');
const boxContainer = document.getElementById('boxContainer');
const selectedDirElement = document.getElementById('selectedDir');
const findBtn = document.getElementById('findButton');
const imgFileTypes = ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.svg', '.webp',
    '.heif', '.heic', '.cr2', '.nef', '.arw', '.orf', '.rw2', '.psd', '.ico', '.eps', '.pdf', '.ai', '.kra'];
let imgMap = {};
let totalImg = 0;
const title = document.getElementById("home-title");
const subtitle = document.getElementById("home-subtitle");
const loadingSpinner = document.getElementById("loadingSpinner");

setDirBtn.addEventListener('click', () => {
	ipcRenderer.send('select-dirs');
});

ipcRenderer.on('selected-directory', (event, paths) => {
    selectedDirElement.innerHTML = `<p>${paths}</p>`;
    boxContainer.style.display = 'flex';
    imgMap = {};
    // displayDuplicates();
    // hideNumDup();
});

findBtn.addEventListener('click', async () => {
    console.log("clicked")
	imgMap = {}
    const dirToSearch = selectedDirElement.textContent.trim();
    loading();
    await Walk.walk(dirToSearch, walkFunc).then(function () {
        console.log("Done");
    });
    // findDuplicates(dirToSearch)
    const duplicates = Object.values(imgMap).filter(paths => paths.length > 1);
    localStorage.setItem('dups', JSON.stringify(duplicates));
    document.getElementById("loadingText").innerText = "Check complete!";
    document.getElementById("loadingText").style.color = "green";
    document.querySelector(".spinner").style.display = 'none';
    document.querySelector(".checkmark").style.display = 'flex';
    await delay(2000);
    window.location.href = 'public/components/duplicate-img.html';
});

async function loading() {
    const btnContainer = document.querySelector(".button-container");
    const boxContainer = document.querySelector(".box-container");
    subtitle.innerText = "";
    btnContainer.style.display = 'none';
    boxContainer.style.display = 'none';
    loadingSpinner.style.display = 'flex';
}

function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

async function walkFunc(err, pathname, dirent) {
    if (err) {
      return false;
    }
    if (!dirent.isDirectory() && !dirent.name.startsWith('.') && !dirent.name.startsWith('$')) {
        console.log(pathname)
        const ext = path.extname(pathname).toLowerCase();
        if (imgFileTypes.includes(ext) && fileLocal(pathname)) {
            totalImg++;
            title.innerText = `Images checked: ${totalImg}\nDuplicates found: ${(Object.values(imgMap).filter(paths => paths.length > 1)).length}`;
            const hash = getFileHash(pathname);
            if (hash) {
                if (imgMap[hash]) {
                    imgMap[hash].push(pathname);
                } else {
                    imgMap[hash] = [pathname];
                }
            }
        }
    }
}

// function findDuplicates(directory) {
//     fs.readdir(directory, function(err, list) {
//         list.forEach(file => {
//             if(! /^\..*/.test(file)) {
                // const fullPath = path.join(directory, file);
                // if (isDir(fullPath)) {
                //     findDuplicates(fullPath);
                // } else {
                //     const ext = path.extname(file).toLowerCase();
                //     if (imgFileTypes.includes(ext) && fileLocal(fullPath)) {
                //         const hash = getFileHash(fullPath);
                //         if (hash) {
                //             if (imgMap[hash]) {
                //                 imgMap[hash].push(fullPath);
                //             } else {
                //                 imgMap[hash] = [fullPath];
                //             }
                //         }
                //     }
                // }
//                 console.log(file)
//             }
//         });
//     });
// }

function fileLocal(filePath) {
    try {
        const stats = fs.statSync(filePath);
        if (stats.blocks === 0) {
            return false;
        }
        return true;
    } catch (error) {
        console.error(`Error checking file attributes: ${filePath}`, error);
        return false;
    }
}

function getFileHash(filePath) {
	try {
		const fileBuffer = fs.readFileSync(filePath);
		const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
		return hash;
	} catch (error) {
		console.log("Error:", error)
        return null;
	}	
}

// TODO: Use this code to create a page that shows all at once, so that we can delete more quickly

// function displayDuplicates() {
//     const duplicates = Object.values(imgMap).filter(paths => paths.length > 1);
// 	console.log(duplicates);
//     const dupCardsContainer = document.querySelector('.dup-cards');
//     dupCardsContainer.innerHTML = '';

//     duplicates.forEach(paths => {
//         const card = document.createElement('div');
//         card.classList.add('dup-card');
// 		card.style.border = '1px solid #ccc';

// 		paths.forEach(filePath => {
// 			const imgPath = document.createElement('p');
//             imgPath.textContent = filePath;
// 			imgPath.className = "img-paths";
// 			imgPath.addEventListener('click', () => openPath(filePath));
//             card.appendChild(imgPath);
//         });

// 		const viewButton = document.createElement('button');
//         viewButton.textContent = 'View Image';
//         viewButton.className = 'view-button';
// 		viewButton.addEventListener('click', () => showImage(paths[0]));
//         card.appendChild(viewButton);

//         dupCardsContainer.appendChild(card);
//     });
// }

// function displayNumDuplicates() {
//     const numDupsDiv = document.querySelector(".num-dups");
// 	const duplicates = Object.values(imgMap).filter(paths => paths.length > 1);
// 	const numDups = duplicates.length
// 	numDupsDiv.innerText = "Sets of duplicates images remaining: " + numDups
// }

// function showImage(filePath) {
//     console.log("Showing image:", filePath);
//     window.open(filePath);
// }

// function openPath(filePath) {
// 	console.log("Opening image path:", filePath);
// 	shell.showItemInFolder(filePath); 
// }