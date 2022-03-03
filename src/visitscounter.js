const mongoose = require('mongoose');

const model = mongoose.Schema({
    exists: {
        type: Boolean,
        required: true,
        unique: true
    },
    counter: {
        type: Number
    }
});

const Counter = new mongoose.model('Counter', model);

function createCounter() {
    const counter = new Counter({
        exists: true,
        counter: 0
    });
    counter.save();
}

function incVisitorCount() {
    Counter.updateOne({ sku: "abc123" }, { $inc: { counter: 1} }).catch(err=>console.log(err));
}

async function getVisitorCount() {
    return new Promise((resolve, reject)=>{
        Counter.findOne({ exist: true }).then(doc=>{
            resolve(doc.counter);
        }).catch(err=>{reject(err)})
    }).catch(err=>{
        console.log("getVisitorCount Error");
        console.log(err);
        return 0;
    })
}


module.exports = {
    createCounter,
    incVisitorCount,
    getVisitorCount
}