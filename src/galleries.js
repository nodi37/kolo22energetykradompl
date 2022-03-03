const fs = require('fs');
const mongoose = require('mongoose');
const sharp = require('sharp');
const _ = require('lodash');
const path = require('path');
const dirName = path.join(__dirname, '..');

const {
    newDate,
    generateHtml,
    fail2banTimestamp,
    findBesttResults,
    scaleImage
} = require('./generators.js');

const model = mongoose.Schema({
    href: {
        type: String,
        required: true
    },
    ext: {
        type: String,
        required: true
    }
});

const gModel = mongoose.Schema({
    public: {
        type: Boolean,
        required: true
    },
    href: {
        type: String,
        required: true
    },
    pName: {
        type: String,
        required: true
    },
    pDscShort: {
        type: String
    },
    pDscLong: {
        type: String
    },
    pDscLongHtml: {
        type: String
    },
    dateSimplified: {
        type: String
    },
    mainImage: {
        type: String
    },
    imageList: {
        type: Array
    },
    pUserDate: {
        type: Date
    }
})

const Logo = new mongoose.model('Logo', model);
const Gallery = new mongoose.model('Gallery', gModel);

//SAVE IMAGES AND LOGOS FUNCTION //TO REFACTOR
async function saveImage(req) {
    return new Promise((resolve, reject) => {
        const originalName = req.file.originalname;
        const filename = req.file.filename;
        const fileExtension = originalName.slice(originalName.lastIndexOf('.'));
        const postImage = parseInt(req.body.postImage, 10);
        const tempDir = dirName + '/tmp/img/';
        const imgDir = dirName + '/public/img/';
        if (!postImage) {
            const fullDir = imgDir + 'logo/';
            const newLogo = new Logo({ href: req.body.href, ext: fileExtension });

            newLogo.save().then((doc) => {
                const nextName = doc._id.toString();
                fs.rename(tempDir + filename, fullDir + nextName + fileExtension, (err) => {
                    if (!err) {
                        const result = { status: 200, answer: 'Logo saved' };
                        resolve(result);
                    } else {
                        reject(err);
                    }
                });
            }).catch(err => {
                reject(err);
            });
        } else {
            const galleryId = req.body.gId;
            const fullDir = imgDir + 'gallery/' + galleryId + '/';
            const imageName = filename + fileExtension;
            Gallery.findOneAndUpdate({ _id: galleryId }, { $push: { imageList: imageName } }).then(() => {
                fs.rename(tempDir + filename, fullDir + imageName, async (err) => {
                    if (!err) {
                        console.log(`Image ${imageName} succesfully added to gallery ${galleryId}`)
                        const answer = await createthumbnail(fullDir + imageName)
                        const result = { status: 200, answer: answer };
                        resolve(result);
                    } else {
                        reject(err);
                    }
                });
            }).catch(err => {
                reject(err);
            });
        }
    }).catch(err => {
        console.log("This shouldnt happen, check saveImage function!");
        console.log(err);
        return { status: 500, answer: "Server error" };
    });
};

//DeleteImage
async function deleteImage(data) {
    return new Promise(async (resolve, reject) => {
        const { galleryId, miniatureName } = data;
        const imageName = miniatureName.replace('-mini','');
        const galleryDir = `${dirName}/public/img/gallery/${galleryId}/`;
        fs.unlinkSync(galleryDir+miniatureName, (err)=>reject(err));
        fs.unlinkSync(galleryDir+imageName, (err)=>reject(err));
        //This line under gives back gallery object before pulling image! 
        const gallery = await Gallery.findOneAndUpdate({_id: galleryId}, { $pull: { imageList: imageName } }).catch(err=>{reject(err)});
        if(gallery.imageList.length==1){
            //Thats why in this if length ==1, if there was only one image in array and this function is triggered, here will be no images now!
            changeVisibility(galleryId);
        }
        const result = { status: 200, answer: "Image deleted!" };
        resolve(result);
    }).catch(err => {
        console.log("This shouldnt happen, check deleteImage func");
        console.log(err);
        return { status: 500, answer: "Server error" };
    });
}

//CREATES THUMBNAILS FOR GALLERY IMAGES
async function createthumbnail(img) {
    return new Promise((resolve, reject) => {
        const filePath = img.slice(0, img.lastIndexOf('.'));
        const extension = img.slice(img.lastIndexOf('.'));
        const outputFile = filePath + '-mini' + extension;
        const thumbName = outputFile.slice(outputFile.lastIndexOf('/') + 1);
        sharp(img).resize({ width: 1200 }).toFile(outputFile).then(() => {
            console.log(thumbName + " created!");
            resolve(thumbName);
        }).catch(err => {
            reject(err);
        });
    }).catch(err => {
        console.log("Error saving thubnail! Check cretethubnail function!");
        console.log(err);
        return "Some error here! Will probably never happen :D";
    });
}

//JUST LISTS LOGOS
async function listLogos() {
    return new Promise((resolve, reject) => {
        Logo.find().then(documents => {
            const result = { status: 200, answer: documents };
            resolve(result);
        }).catch(err => reject(err));
    }).catch(err => {
        console.log("This shouldnt happen, check listLogos func");
        console.log(err);
        return { status: 500, answer: "Server error" };
    });
}

//JUST DELETES LOGOS
async function deleteLogo(data) {
    return new Promise(async (resolve, reject) => {
        const lName = data.lName.toString();
        Logo.findOneAndDelete({ _id: lName }).then(doc => {
            fs.rm(dirName + '/public/img/logo/' + lName + doc.ext, err => {
                if (err) {
                    console.log(err);
                    reject("Error occured on removing logo " + lName);
                } else {
                    const result = { status: 200, answer: "Logo succesfuly removed!" };
                    resolve(result);
                }
            })
        }).catch(err => {
            console.log(err)
            reject("Logo not found!");
        });
    }).catch(err => {
        console.log("This shouldnt happen, check deleteLogo function");
        console.log(err);
        return { status: 500, answer: "Server error" };
    })
}

//CREATES GALLERY DOCUMENT IN DB AND GALLERY FOLDER!
async function createGallery(data) {
    return new Promise((resolve, reject) => {
        const date = new Date();
        const dateSimplified = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDay()}`;
        const href = _.kebabCase(data.pName).slice(0, 39);
        const newGallery = new Gallery({
            public: false,
            href: href,
            ...data,
            dateSimplified: dateSimplified
        })
        newGallery.save().then(doc => {
            fs.mkdirSync(dirName + '/public/img/gallery/' + doc._id);
            const result = { status: 200, answer: doc._id };
            resolve(result);
        }).catch(err => {
            console.log("Error creating gallery!");
            console.log(err)
            reject(err)
        });
    }).catch(err => {
        console.log("This shouldnt happen, check createGallery function");
        console.log(err);
        return { status: 500, answer: "Server error" };
    })
}

//UPDATES GALLERY DOCUMENT.
async function updateGallery(data) {
    return new Promise(async (resolve, reject) => {
        const id = data.galleryId;
        const href = _.kebabCase(data.pName).slice(0, 39);
        const pDscLongHtml = await generateHtml(data.pDscLong);
        const toUpdate = { ...data, href, pDscLongHtml: pDscLongHtml };
        Gallery.findOneAndUpdate({ _id: id }, toUpdate).then(() => {
            const result = { status: 200, answer: "Document succesfully updated" };
            resolve(result);
        }).catch(err => reject(err));
    }).catch(err => {
        console.log("This shouldnt happen, check updateGallery function");
        console.log(err);
        return { status: 500, answer: "Server error" };
    })
}

///LISTS ALL GALERIES, ALSO UNPUBLIC, THIS IS FOR ADMIN PAGE
async function listAllGalleries() {
    return new Promise((resolve, reject) => {
        Gallery.find().sort({ '_id': -1 }).then(docs => {
            const result = { status: 200, answer: docs };
            resolve(result);
        }).catch(err => reject(err));
    }).catch(err => {
        console.log("This shouldnt happen, check listAllGalleries function");
        console.log(err);
        return { status: 500, answer: "Server error" };
    });
}

//

//DELETES COMPLETE GALLERY!
async function deleteGallery(id) {
    return new Promise((resolve, reject) => {
        Gallery.findOneAndDelete({ _id: id }).then(doc => {
            const dirPath = dirName + '/public/img/gallery/' + doc.id;
            fs.rm(dirPath, { recursive: true, force: true }, (err) => {
                if (err) {
                    reject(err)
                } else {
                    const result = { status: 200, answer: `Gallery ${doc._id} deleted!` };
                    console.log(`Gallery ${doc._id} deleted!`);
                    resolve(result);
                }
            });
        }).catch(err => reject(err));
    }).catch(err => {
        console.log("This shouldnt happen, check deleteGallery function");
        console.log(err);
        return { status: 500, answer: "Server error" };
    });
}


//MAKES GALLERY PUBLIC/UNPUBLIC
async function changeVisibility(gId) {
    return new Promise(async (resolve, reject) => {
        const doc = await Gallery.findOne({ _id: gId }).catch(err => { reject(err) });
        
        if (doc) {
            var updateObj = {};
            const toSet = doc.public ? false : true;

            if (toSet) {
                if(doc.imageList.length > 0){
                    const mainImage = !doc.mainImage ? doc.imageList[0] : doc.mainImage;
                    updateObj = {
                        "public": toSet,
                        "mainImage": mainImage
                    }
                } else {
                    reject("No images or other error!");
                }
            } else {
                updateObj = {
                    "public": toSet
                }
            }
            Gallery.findOneAndUpdate({ _id: gId }, updateObj).then(() => {
                const result = { status: 200, answer: `Gallery ${gId} visibility changed!` };
                console.log(`Gallery ${gId} visibility changed!`);
                resolve(result);
            }).catch(err => { reject(err) });
        } 
    }).catch(err => {
        console.log("This shouldnt happen, check changeVisibility function");
        console.log(err);
        return { status: 500, answer: "Server error" };
    });
}

//GIVES BACK ONE REQUESTED GALLERY by ID //FOR ADMIN PAGE
async function findGallery(id) {
    return new Promise(async (resolve, reject) => {
        Gallery.findOne({ _id: id }).then(doc => {
            const result = { status: 200, answer: doc };
            resolve(result);
        }).catch(err => reject(err));
    }).catch(err => {
        console.log("This shouldnt happen, check findGallery function");
        console.log(err);
        return { status: 500, answer: "Server error" };
    });
}

//GETS PUBLIC GALLERIES WITH QUERY TO SHOW ON MAIN PAGE AND IN SEARCH PAGE
async function getPublic(data) {
    return new Promise((resolve, reject) => {
        const searchKw = data.query;
        const query = {
            public: true,
            $or: [{
                pName: {
                    "$regex": searchKw,
                    "$options": "i"
                }
            },
            {
                pDscShort: {
                    "$regex": searchKw,
                    "$options": "i"
                }
            },
            {
                pDscLong: {
                    "$regex": searchKw,
                    "$options": "i"
                }
            }
            ]
        }
        Gallery.find(query).sort({ "pUserDate": -1 }).skip(data.postsLoaded).limit(data.toLoad).then(documents => {
            const result = { status: 200, answer: documents };
            resolve(result);
        }).catch(err => reject(err));
    }).catch(err => {
        console.log("This shouldnt happen, check getPublic function");
        console.log(err);
        return { status: 500, answer: "Server error" };
    });
}

//GETS GALLERY by DATE AND HREF //FOR MAIN PAGE
async function getSinglePost(data) {
    return new Promise((resolve, reject) => {
        const { year, month, day, href } = data;
        const dateSimplified = `${year}/${month}/${day}`
        Gallery.findOne({ public: true, dateSimplified: dateSimplified, href: href }).then((doc) => {
            if (!doc) {
                reject("Document not found!");
            } else {
                const result = { status: 200, answer: doc };
                resolve(result);
            }
        }).catch(err => reject(err));
    }).catch(err => {
        console.log("This shouldnt happen, check getSinglePost function");
        console.log(err);
        return { status: 500, answer: "Server error" };
    });

}

module.exports = {
    saveImage,
    deleteImage,
    listLogos,
    deleteLogo,
    createGallery,
    updateGallery,
    listAllGalleries,
    changeVisibility,
    deleteGallery,
    findGallery,
    getPublic,
    getSinglePost
}
