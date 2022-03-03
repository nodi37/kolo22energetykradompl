const fs = require('fs');
const mongoose = require('mongoose');
const _ = require('lodash');
const path = require('path');
const dirName = path.join(__dirname, '..');
const {
    newDate,
    generateHtml,
    fail2banTimestamp,
    findBesttResults,
    scaleImage
} = require('./generators');

const model = mongoose.Schema({
    year: {
        type: Number,
        required: true,
        unique: true

    },
    allPariticipants: {
        type: Array
    },
    firstPlace: {
        type: Object
    },
    secondPlace: {
        type: Object
    },
    thirdPlace: {
        type: Object
    },
    bestOneDsc: {
        type: String
    },
    bestOneImg: {
        type: String
    }
});

const Ranking = new mongoose.model('Ranking', model);


//CREATES RANKING
async function createRanking(year) {
    return new Promise((resolve, reject) => {
        const ranking = new Ranking({
            year: year,
            bestOneImg: 'nobodyYet.png'
        })
        ranking.save().then(() => {
            const result1 = { status: 200, answer: 'New descriptions document created' };
            resolve(result1);
        }).catch(err => {
            reject(err);
        })
    }).catch((err) => {
        console.log('Error creating new ranking, probably requested year already exist!');
        console.log(err);
        return { status: 500, answer: 'Server error!' };
    });
}

//FINDS RANKINGS 
async function listRankings() {
    return new Promise((resolve, reject) => {
        Ranking.find().sort({ 'year': -1 }).then(documents => {
            var rankings = [];
            documents.forEach(doc => {
                rankings.push(doc.year)
            })
            const result = { status: 200, answer: rankings };
            resolve(result);
        }).catch(err => { reject(err) })
    }).catch((err) => {
        console.log('Error listing rankings!');
        console.log(err);
        return { status: 500, answer: 'Server error!' };
    });
}

//TO BUILD
async function updateRanking(data) {
    return new Promise(async (resolve, reject) => {
        const { year, participantId, resultIndex, aName, weight, points, compDate, func } = data;
        const toDo = parseInt(func, 10);
        const result = { status: 200, answer: "Participant patched succesfully" };

        switch (toDo) {
            case 0:
                const participant = {
                    participantId: _.kebabCase(aName),
                    aName: aName,
                    results: [[weight, points, compDate]],
                    weightSum: parseInt(weight),
                    pointSum: parseInt(points)
                }
                pushParticipant(year, participant);
                resolve(result);
                break;

            case 1:
                if (!weight || !points || !compDate) {
                    reject("Data not valid when adding new user results! Case 1, switch statement in updateRanking func!");
                } else {
                    const docToManage = await prepareParticipantUpdate(year, participantId);
                    const toPush = [weight, points, compDate];
                    const arr = docToManage.results;
                    arr.push(toPush);
                    recalcSums(docToManage);
                    pushParticipant(year, docToManage);
                    resolve(result);
                }
                break;

            case 2:
                const docToManage1 = await prepareParticipantUpdate(year, participantId);
                if (docToManage1) {
                    docToManage1.results.splice(resultIndex, 1);
                }
                await recalcSums(docToManage1);
                if (docToManage1.results.length > 0) {
                    pushParticipant(year, docToManage1);
                }
                recalcPodium(year)
                resolve(result);
                break;

            default:
                break;
        }
    }).catch((err) => {
        console.log('Error patching ranking!');
        console.log(err);
        return { status: 500, answer: 'Server error!' };
    });
}

//RECALCULATING SUMS OF WEIGHT AND POINTS
async function recalcSums(doc) {
    var weightSumTmp = 0;
    var pointSumTmp = 0;
    doc.results.forEach(result => {
        weightSumTmp += parseInt(result[0]);
        pointSumTmp += parseInt(result[1]);
    });
    doc.weightSum = weightSumTmp;
    doc.pointSum = pointSumTmp;
    return doc;
}


//RECALCULATE BEST
function recalcPodium(year) {
    Ranking.findOne({ year: year }).then(async doc => {
        const sorted = await doc.allPariticipants.sort(findBesttResults).reverse();
        const data = {
            year: year,
            firstPlace: sorted[0],
            secondPlace: sorted[1],
            thirdPlace: sorted[2]
        }

        pushDataToRanking(data);

    }).catch(err => {
        console.log("Error when looking for ranking when recalculating podium!")
        console.log(err);
    });
}



//Looks for participant, if found then remove and give back document to manage
async function prepareParticipantUpdate(year, participantId) {
    return new Promise(async (resolve, reject) => {
        const docToManage = await prepareParticipants(year, participantId);
        if (!docToManage) {
            reject("Error looking for participant");
        } else {
            const removed = await removeParticipant(year, docToManage);
            if (!removed) {
                reject("Error removing participant");
            } else {
                resolve(docToManage);
            }
        }
    }).catch(err => {
        console.log("Error when looking for patricipant");
        console.log(err);
        return 0;
    });
}

//FINDS PARTICIPANT TO MANAGE
async function prepareParticipants(year, pId) {
    return new Promise((resolve, reject) => {
        Ranking.findOne({ year: year }).then(doc => {
            doc.allPariticipants.forEach(part => {
                if (part.participantId == pId) {
                    resolve(part);
                }
            })
        }).catch(err => reject(err));
    }).catch(err => {
        console.log("Error when looking for patricipant");
        console.log(err);
        return 0;
    });
}

//REMOVES PARTICIPANT 
async function removeParticipant(year, docToManage) {
    return new Promise((resolve, reject) => {
        Ranking.findOneAndUpdate({ year: year }, { $pull: { allPariticipants: docToManage } }).then(doc => {
            resolve(doc);
        }).catch(err => reject(err));
    }).catch(err => {
        console.log("Error when removing patricipant");
        console.log(err);
        return 0;
    })
}

//PUSHES BACK PARTICIPANT
async function pushParticipant(year, docToManage) {
    return new Promise((resolve, reject) => {
        Ranking.findOneAndUpdate({ year: year }, { $push: { allPariticipants: docToManage } }).then(doc => {
            recalcPodium(year);
            resolve(doc);
        }).catch(err => reject(err));
    }).catch(err => {
        console.log("Error when pushing patricipant");
        console.log(err);
        return 0;
    })
}


//GETS SPECIFIED RANKING
async function getSpecifiedRanking(year) {
    return new Promise((resolve, reject) => {
        Ranking.findOne({ year: year }).then(doc => {
            const result = { status: 200, answer: doc };
            resolve(result);
        }).catch(err => reject(err));
    }).catch((err) => {
        console.log('Error when getting ranking!');
        console.log(err);
        return { status: 500, answer: 'Server error!' };
    });
}

//Manages image 
async function manageBestInRankingImage(req) {
    return new Promise(async (resolve, reject) => {
        const tempDir = dirName + '/tmp/img/';
        const filename = req.file.filename;
        const originalName = req.file.originalname;
        const extension = originalName.slice(originalName.lastIndexOf('.'));
        const fullDir = dirName + '/public/img/wedkarzroku/';
        const imageName = 'bestOf' + req.body.year + extension;
        await scaleImage(1200, tempDir + filename, fullDir + imageName)
        const data = {
            year: req.body.year,
            bestOneDsc: req.body.text,
            bestOneImg: imageName
        }
        console.log(imageName + " added to wedkarzroku catalog");
        const doc = await pushDataToRanking(data);
        const result = { status: 200, answer: doc };
        resolve(result);
    }).catch((err) => {
        console.log('Error when managing ranking image!');
        console.log(err);
        return { status: 500, answer: 'Server error!' };
    });
}

//Update differnet ranking values 
async function pushDataToRanking(data) {
    return new Promise((resolve, reject) => {
        Ranking.findOneAndUpdate({ year: data.year }, { ...data }).then((doc) => {
            resolve(doc)
        }).catch(err => reject(err));
    }).catch(err => {
        console.log("Error when updating document, check pushDataToRanking function!");
        console.log(err);
    });
}

module.exports = {
    createRanking,
    listRankings,
    updateRanking,
    getSpecifiedRanking,
    manageBestInRankingImage
}