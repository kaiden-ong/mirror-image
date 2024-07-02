const { ipcRenderer } = require('electron');
const fs = require('fs');
const crypto = require('crypto');

let imgMap = {}

async function hash(arr) {
    for (const pathname of arr) {
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

ipcRenderer.send('message-from-worker', "worker working");
ipcRenderer.on('list-complete', (event, paths) => {
    imgMap = {}
    hash(paths)
    const duplicates = Object.values(imgMap).filter(paths => paths.length > 1);
    ipcRenderer.send('hash-complete', duplicates);
})