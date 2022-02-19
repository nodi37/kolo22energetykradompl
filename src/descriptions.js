const mongoose = require('mongoose');

const {
    newDate,
    generateHtml,
    fail2banTimestamp,
    findBesttResults,
    scaleImage
} = require('./generators.js');


const model = mongoose.Schema({
    exist: {
        type: Boolean,
        required: true,
        unique: true
    },
    notice: {
        type: String
    },
    noticeTitle: {
        type: String
    },
    history: {
        type: String
    },
    historyHtml: {
        type: String
    },
    mainHeader: {
        type: String
    },
    descriptionTop: {
        type: String
    },
    descriptionBottom: {
        type: String
    },
    descriptionBottomHtml: {
        type: String
    },
    noticeHtml: {
        type: String
    }
});

const Description = new mongoose.model('Description', model);

async function saveDescriptions(data) {
    return new Promise(async (resolve, reject) => {
        var obj = {}

        if (data.history) {
            html = await generateHtml(data.history);
            obj = { ...obj, historyHtml: html }
        }

        if (data.notice) {
            html = await generateHtml(data.notice);
            obj = { ...obj, noticeHtml: html }
        }

        if (data.descriptionBottom) {
            html = await generateHtml(data.descriptionBottom);
            obj = { ...obj, descriptionBottomHtml: html }
        }

        Description.findOneAndUpdate({ exist: true }, { ...data, ...obj }, (err, doc) => {
            if (!err) {
                if (!doc) {
                    const newdoc = { exist: true, ...data, ...obj }
                    const descriptions = new Description(newdoc);
                    descriptions.save().then(() => {
                        const result = { status: 200, answer: 'New descriptions document created' };
                        resolve(result);
                    }).catch(err => {
                        reject(err);
                    });
                } else {
                    const result = { status: 200, answer: 'Saved' };
                    resolve(result);
                }
            } else {
                reject('Some server error');
            }
        }).clone().catch(err => { reject(err) });
    }).catch((err) => {
        console.log('saveDescriptions function error!');
        console.log(err);
        return { status: 500, answer: 'Server error!' };
    });
}

async function readDescriptions() {
    return new Promise((resolve, reject) => {
        Description.findOne({ exist: true }, (err, doc) => {
            if (err) {
                reject(err);
            } else {
                const result = { status: 200, answer: doc };
                resolve(result);
            }
        }).clone().catch(err => {
            reject(err);
        })
    }).catch((err) => {
        console.log('readDescriptions error 2: ' + err);
        return { status: 500, answer: 'Server error!' };
    });
}



module.exports = {
    saveDescriptions,
    readDescriptions
}