const { ipcRenderer, shell } = require('electron');
const fs = require('fs');
const path = require('path');

const backBtn = document.getElementById("back-btn");
const nextBtn = document.getElementById("next-img-btn");
const numDupsDiv = document.querySelector(".num-dups");
const finishBtn = document.getElementById("finish-btn");
const toggleCheckbox = document.getElementById('toggle-checkbox');

let dups = {};

document.addEventListener('DOMContentLoaded', function() {
    dups = JSON.parse(localStorage.getItem('dups'));
    if (dups.length === 0) {
        numDupsDiv.innerText = "YAY! You have no duplicate images!!!";
    } else {
        if (dups.length > 1) nextBtn.style.display = 'flex';
        else finishBtn.style.display = 'flex';
        displayDuplicates();
        displayNumDuplicates();
    }
});

backBtn.addEventListener('click', () => {
    window.location.href = '../../index.html';
})

nextBtn.addEventListener('click', () => {
    dups.shift();
    localStorage.setItem('dups', JSON.stringify(dups));
    window.location.href = './duplicate-img.html';
})

finishBtn.addEventListener('click', () => {
    window.location.href = '../../index.html';
})

// todo
toggleCheckbox.addEventListener('change', function() {
    const isChecked = this.checked;
    console.log(`Toggle is now ${isChecked ? 'ON' : 'OFF'}`);
});

function displayDuplicates() {
	console.log(dups);
    const imgContent = document.querySelector('.img-details')
    const dupCards = document.querySelector('.dup-cards');
    dupCards.innerHTML = '';

    const card = document.createElement('div');
    card.classList.add('dup-card');

    dups[0].forEach(filePath => {
        const imgPath = document.createElement('p');
        imgPath.textContent = filePath;
        imgPath.className = "img-paths";
        imgPath.addEventListener('click', () => openPath(filePath));
        card.appendChild(imgPath);
    });

    // const viewButton = document.createElement('button');
    // viewButton.textContent = 'View Image';
    // viewButton.className = 'view-button';
    // viewButton.addEventListener('click', () => showImage(dups[0][0]));
    // card.appendChild(viewButton);
    const imgThumbnail = document.createElement('img');
    imgThumbnail.src = dups[0][0];
    imgThumbnail.className = 'img-thumbnail';
    imgThumbnail.addEventListener('click', () => showImage(dups[0][0]));
    imgContent.appendChild(imgThumbnail);

    const imgDups = document.createElement('p');
    imgDups.textContent = `Duplicates: ${dups[0].length}`;
    imgDups.className = 'img-dups';
    imgContent.appendChild(imgDups);

    const imgType = document.createElement('p');
    imgType.textContent = `File Type: ${path.extname(dups[0][0]).toUpperCase().substring(1)}`;
    imgType.className = 'img-type';
    imgContent.appendChild(imgType);

    const imgSize = document.createElement('p');
    var stats = fs.statSync(dups[0][0])
    var fileSize = stats.size;
    var fileSizeMB = Math.round((fileSize / (1024)) * 10) / 10;
    imgSize.textContent = `Image Size: ${fileSizeMB} KB`;
    imgSize.className = 'img-size';
    imgContent.appendChild(imgSize);

    dupCards.appendChild(card);
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