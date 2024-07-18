const { ipcRenderer, shell } = require('electron');
const fs = require('fs');
const path = require('path');

// buttons
const backBtn = document.getElementById("back-btn");
const nextBtn = document.getElementById("next-img-btn");
const finishBtn = document.getElementById("finish-btn");
const finishBtnList = document.getElementById("finish-btn-list");

// toggle button
const toggleCheckbox = document.getElementById('toggle-checkbox');
const toggleText = document.querySelector(".toggle-text");

// view content
const singleView = document.querySelector(".dups-content");
const listView = document.querySelector(".list-view");

// box content
const numDupsDiv = document.querySelector(".num-dups");
const imgContent = document.querySelector('.img-details')
const dupCards = document.querySelector('.dup-cards');
const imgContentList = document.querySelector('.img-details-list')
const detailList = document.querySelector('.detail-list');
let imgThumbnail, imgType, imgSize, imgDups

// delete modal
const modal = document.getElementById('deleteModal');
const confirmDelete = document.getElementById('confirmDelete');
const cancelDelete = document.getElementById('cancelDelete');

let dups = {};
let dupsIndex;

document.addEventListener('DOMContentLoaded', function() {
    dups = JSON.parse(localStorage.getItem('dups'));
    dupsIndex = localStorage.getItem('index');
    if (dups.length === 0) {
        numDupsDiv.innerText = "YAY! You have no duplicate images!!!";
    } else {
        if (dupsIndex < dups.length - 1)  {
            nextBtn.style.display = 'flex';
        } else {
            finishBtn.style.display = 'flex';
        }
        displayDuplicates();
        displayNumDuplicates();
    }
});

backBtn.addEventListener('click', () => {
    window.location.href = '../../index.html';
})

nextBtn.addEventListener('click', () => {
    dupsIndex++;
    localStorage.setItem('index', dupsIndex);
    window.location.href = './duplicate-img.html';
})

finishBtn.addEventListener('click', () => {
    window.location.href = '../../index.html';
})

finishBtnList.addEventListener('click', () => {
    window.location.href = '../../index.html';
})

// todo
toggleCheckbox.addEventListener('change', function() {
    const isChecked = this.checked;
    if (isChecked) {
        toggleText.textContent = "List View";
        singleView.style.display = 'none';
        listView.style.display = 'flex';
    } else {
        toggleText.textContent = "Single View";
        singleView.style.display = 'flex';
        listView.style.display = 'none';
    }
    imgThumbnail.src = dups[dupsIndex][0];
    if (isChecked) {
        imgContentList.appendChild(imgThumbnail);
        imgContentList.appendChild(imgDups);
        imgContentList.appendChild(imgType);
        imgContentList.appendChild(imgSize);
        document.querySelectorAll(".img-group").forEach(group => group.classList.remove("active"));
        detailList.children[dupsIndex].classList.add("active");
    } else {
        imgDups.textContent = `Duplicates: ${dups[dupsIndex].length}`
        imgType.textContent = `File Type: ${path.extname(dups[dupsIndex][0]).toUpperCase().substring(1)}`;
        var stats = fs.statSync(dups[dupsIndex][0])
        var fileSize = stats.size;
        var fileSizeMB = Math.round((fileSize / (1024)) * 10) / 10;
        imgSize.textContent = `Image Size: ${fileSizeMB} KB`;
        imgContent.appendChild(imgThumbnail);
        imgContent.appendChild(imgDups);
        imgContent.appendChild(imgType);
        imgContent.appendChild(imgSize);
    }
});

function displayDuplicates() {
	console.log(dups);
    dupCards.innerHTML = '';

    dups[dupsIndex].forEach(filePath => {
        const pathCard = document.createElement('div');
        pathCard.className = "path-card";
        const imgPath = document.createElement('p');
        imgPath.textContent = filePath.replace(/-/g, '\u2011').replace(/\\/g, '\u200B\\');
        imgPath.className = "img-paths";
        imgPath.addEventListener('click', () => openPath(filePath));
        const trashBtnContainer = document.createElement('div');
        trashBtnContainer.className = "trash-btn-container";
        const trashBtn = document.createElement('button');
        trashBtn.className = "trash-btn";
        trashBtn.addEventListener('click', () => openDeleteModal(filePath));
        trashBtnContainer.appendChild(trashBtn);
        pathCard.appendChild(imgPath);
        pathCard.appendChild(trashBtnContainer);
        dupCards.appendChild(pathCard);
    });
    
    dups.forEach((filePaths, index) => {
        const imgGroup = document.createElement('p');
        imgGroup.textContent = filePaths[0].replace(/-/g, '\u2011').replace(/\\/g, '\u200B\\') + `, ... + ${filePaths.length - 1} more`;
        imgGroup.className = "img-group";
        if (index === dupsIndex) {
            imgGroup.classList.add('active');
        }
        imgGroup.addEventListener('click', () => {
            document.querySelectorAll(".img-group").forEach(group => group.classList.remove("active"));
            imgGroup.classList.add("active");
            imgThumbnail.src = filePaths[0];
            imgDups.textContent = `Duplicates: ${filePaths.length}`;
            imgType.textContent = `File Type: ${path.extname(filePaths[0]).toUpperCase().substring(1)}`;
            var stats = fs.statSync(filePaths[0])
            var fileSize = stats.size;
            var fileSizeMB = Math.round((fileSize / (1024)) * 10) / 10;
            imgSize.textContent = `Image Size: ${fileSizeMB} KB`;
        });
        detailList.appendChild(imgGroup);
    })

    // const viewButton = document.createElement('button');
    // viewButton.textContent = 'View Image';
    // viewButton.className = 'view-button';
    // viewButton.addEventListener('click', () => showImage(dups[0][0]));
    // card.appendChild(viewButton);
    imgThumbnail = document.createElement('img');
    imgThumbnail.src = dups[dupsIndex][0];
    imgThumbnail.className = 'img-thumbnail';
    imgThumbnail.addEventListener('click', () => showImage(dups[dupsIndex][0]));

    imgDups = document.createElement('p');
    imgDups.textContent = `Duplicates: ${dups[dupsIndex].length}`;
    imgDups.className = 'img-dups';
    

    imgType = document.createElement('p');
    imgType.textContent = `File Type: ${path.extname(dups[dupsIndex][0]).toUpperCase().substring(1)}`;
    imgType.className = 'img-type';

    imgSize = document.createElement('p');
    var stats = fs.statSync(dups[dupsIndex][0])
    var fileSize = stats.size;
    var fileSizeMB = Math.round((fileSize / (1024)) * 10) / 10;
    imgSize.textContent = `Image Size: ${fileSizeMB} KB`;
    imgSize.className = 'img-size';

    imgContent.appendChild(imgThumbnail);
    imgContent.appendChild(imgDups);
    imgContent.appendChild(imgType);
    imgContent.appendChild(imgSize);
}

function openDeleteModal(filePath) {
    modal.style.display = 'block';
    confirmDelete.onclick = function() {
        deleteConfirm(filePath);
        modal.style.display = 'none';
    }
}

cancelDelete.onclick = function() {
    modal.style.display = 'none';
}

function deleteConfirm(path) {
    fs.unlink(path, (err) => {
        if (err) {
            console.error(`Error deleting file: ${err}`);
            return;
        }
        dups[dupsIndex] = dups[dupsIndex].filter(filePath => filePath !== path);
        const pathCards = document.querySelectorAll('.path-card');
        pathCards.forEach(card => {
            const cardPath = card.querySelector('.img-paths').textContent;
            if (cardPath === path.replace(/-/g, '\u2011').replace(/\\/g, '\u200B\\')) {
                dupCards.removeChild(card);
            }
        });
        imgDups.textContent = `Duplicates: ${dups[dupsIndex].length}`;
    });
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

function displayNumDuplicates() {
	numDupsDiv.innerText = "Sets of duplicates images remaining: " + dups.length
}

function showImage(filePath) {
    console.log("Showing image:", filePath);
    window.open(filePath);
}

function openPath(filePath) {
	console.log("Opening image path:", filePath);
	shell.showItemInFolder(filePath); 
}