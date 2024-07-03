const { ipcRenderer, shell } = require('electron');
const fs = require('fs');
const path = require('path');

// buttons
const backBtn = document.getElementById("back-btn");
const nextBtn = document.getElementById("next-img-btn");
const finishBtn = document.getElementById("finish-btn");
const nextBtnList = document.getElementById("next-img-btn-list");
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

let dups = {};

document.addEventListener('DOMContentLoaded', function() {
    dups = JSON.parse(localStorage.getItem('dups'));
    if (dups.length === 0) {
        numDupsDiv.innerText = "YAY! You have no duplicate images!!!";
    } else {
        if (dups.length > 1)  {
            nextBtn.style.display = 'flex';
            nextBtnList.style.display = 'flex';
        } else {
            finishBtn.style.display = 'flex';
            finishBtnList.style.display = 'flex';
        }
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

nextBtnList.addEventListener('click', () => {
    dups.shift();
    localStorage.setItem('dups', JSON.stringify(dups));
    window.location.href = './duplicate-img.html';
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
    imgThumbnail.src = dups[0][0];
    if (isChecked) {
        imgContentList.appendChild(imgThumbnail);
        imgContentList.appendChild(imgDups);
        imgContentList.appendChild(imgType);
        imgContentList.appendChild(imgSize);
    } else {
        document.querySelectorAll(".img-group").forEach(group => group.classList.remove("active"));
        detailList.firstElementChild.classList.add("active")
        imgContent.appendChild(imgThumbnail);
        imgContent.appendChild(imgDups);
        imgContent.appendChild(imgType);
        imgContent.appendChild(imgSize);
    }
});

function displayDuplicates() {
	console.log(dups);
    dupCards.innerHTML = '';

    dups[0].forEach(filePath => {
        const imgPath = document.createElement('p');
        imgPath.textContent = filePath.replace(/-/g, '\u2011').replace(/\\/g, '\u200B\\');
        imgPath.className = "img-paths";
        imgPath.addEventListener('click', () => openPath(filePath));
        dupCards.appendChild(imgPath);
    });

    const trashBtn = document.createElement('button');
    trashBtn.className = "trash-btn";

    dupCards.appendChild(trashBtn);

    dups.forEach((filePaths, index) => {
        const imgGroup = document.createElement('p');
        imgGroup.textContent = filePaths[0].replace(/-/g, '\u2011').replace(/\\/g, '\u200B\\') + `, ... + ${filePaths.length} more`;
        imgGroup.className = "img-group";
        if (index === 0) {
            imgGroup.classList.add('active');
        }
        imgGroup.addEventListener('click', () => {
            document.querySelectorAll(".img-group").forEach(group => group.classList.remove("active"));
            imgGroup.classList.add("active");
            imgThumbnail.src = filePaths[0];
        });
        detailList.appendChild(imgGroup);
    })

    // const viewButton = document.createElement('button');
    // viewButton.textContent = 'View Image';
    // viewButton.className = 'view-button';
    // viewButton.addEventListener('click', () => showImage(dups[0][0]));
    // card.appendChild(viewButton);
    imgThumbnail = document.createElement('img');
    imgThumbnail.src = dups[0][0];
    imgThumbnail.className = 'img-thumbnail';
    imgThumbnail.addEventListener('click', () => showImage(dups[0][0]));

    imgDups = document.createElement('p');
    imgDups.textContent = `Duplicates: ${dups[0].length}`;
    imgDups.className = 'img-dups';
    

    imgType = document.createElement('p');
    imgType.textContent = `File Type: ${path.extname(dups[0][0]).toUpperCase().substring(1)}`;
    imgType.className = 'img-type';

    imgSize = document.createElement('p');
    var stats = fs.statSync(dups[0][0])
    var fileSize = stats.size;
    var fileSizeMB = Math.round((fileSize / (1024)) * 10) / 10;
    imgSize.textContent = `Image Size: ${fileSizeMB} KB`;
    imgSize.className = 'img-size';

    imgContent.appendChild(imgThumbnail);
    imgContent.appendChild(imgDups);
    imgContent.appendChild(imgType);
    imgContent.appendChild(imgSize);
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