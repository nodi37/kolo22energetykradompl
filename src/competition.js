const mongoose = require('mongoose');

const model = mongoose.Schema({
    dateValue: {
        type: Date
    },
    titleValue: {
        type: String
    },
    descValue: {
        type: String
    }
});

const Competition = new mongoose.model('Competition', model);

async function createCompetition(data) {
    return new Promise((resolve, reject) => {
        const competition = new Competition({
            ...data
        });
        competition.save().then(() => {
            const result = { status: 200, answer: 'Saved' };
            resolve(result);
        }).catch(err => reject(err));
    }).catch((err) => {
        console.log('createCompetition error: ');
        console.log(err);
        return { status: 500, answer: 'Server error!' };
    });
}

async function getCompetitions() {
    return new Promise((resolve,reject)=>{
        Competition.find().then(documents=>{
            const result = { status: 200, answer: documents.sort((a,b) => {return a.dateValue.getTime() - b.dateValue.getTime()}).reverse() };
            resolve(result);
        }).catch(err => reject(err));
    }).catch((err) => {
        console.log('getCompetitions error: ');
        console.log(err);
        return { status: 500, answer: 'Server error!' };
    });
}

async function deleteCompetition(id) {
    return new Promise((resolve,reject)=>{
        Competition.findOneAndDelete({_id: id}).then(() => {
            const result = { status: 200, answer: 'Saved' };
            resolve(result);
        }).catch(err => reject(err));
    }).catch((err) => {
        console.log('deleteCompetition error: ');
        console.log(err);
        return { status: 500, answer: 'Server error!' };
    });
}

module.exports = {
    createCompetition,
    getCompetitions,
    deleteCompetition
}