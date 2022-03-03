const sharp = require('sharp');

function newDate() {
    return new Date().toLocaleString('en-GB');
}

async function generateHtml(data) {
    return new Promise((resolve, reject) => {
        const stepOne = data.replaceAll('{', "<h3 class='header-green'>");
        const stepTwo = stepOne.replaceAll('}', "</h3>");
        const stepThree = stepTwo.replaceAll('[', "<p class='summary__description'>");
        const stepFour = stepThree.replaceAll(']', "</p>");
        resolve(stepFour);
    }).catch(err => { return err });
}

function fail2banTimestamp() {
    const now = new Date();
    const tZOffset = now.getTimezoneOffset() / 60;
    const month = now.toLocaleString('en-US', { month: 'short' });
    const day = (now.getUTCDate() < 10) ? ("0" + now.getUTCDate()) : now.getUTCDate();
    const hours = (now.getUTCHours() - tZOffset < 10) ? ("0" + now.getUTCHours() - tZOffset) : (now.getUTCHours() - tZOffset);
    const minutes = (now.getUTCMinutes() < 10) ? ("0" + now.getUTCMinutes()) : now.getUTCMinutes();
    const seconds = (now.getUTCSeconds() < 10) ? ("0" + now.getUTCSeconds()) : now.getUTCSeconds();
    return `${month} ${day} ${hours}:${minutes}:${seconds}`
}

function findBesttResults(a, b) {
    if (a.pointSum > b.pointSum) {
        return -1;
    } else if (a.pointSum == b.pointSum) {
        if (a.weightSum < b.weightSum) {
            return -1;
        }
    } else {
        return 0;
    }
}

function scaleImage(width, img, outputFile) {
    return new Promise((resolve, reject) => {
        sharp(img).resize({ width: width }).toFile(outputFile).then(() => {
            resolve(200);
        }).catch(err => {
            reject(err);
        });
    }).catch(err => {
        console.log(err)
        return err;
    });
}

module.exports = {
    newDate,
    generateHtml,
    fail2banTimestamp,
    findBesttResults,
    scaleImage
}

