const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const dirName = path.join(__dirname, '..');

const {
    register,
    login,
    verifyToken,
    verifyCaptcha
} = require('./user');

const {
    saveDescriptions,
    readDescriptions
} = require('./descriptions');


const User = mongoose.model("User");
const Description = mongoose.model("Description");

module.exports = async () => {
    const users = await User.find();
    const description = await Description.find();
    const dirs = [`${dirName}/public/img/gallery`, `${dirName}/public/img/logo`, `${dirName}/public/img/wedkarzroku`, `${dirName}/tmp/img`];

    if (users.length < 1) {
        console.log("First run! Registering new user!");
        register(process.env.KOLO22USER, process.env.KOLO22PASSWORD);
    }

    if (description.length < 1) {
        console.log("Saving default descriptions!");
        const defDsc = {
            mainHeader: "Witaj na stronie koła wędkarskeigo numer 22. Energetyk Radom",
            descriptionTop: "Od ponad 20 lat zrzeszamy pasjonatów wędkarstwa!",
            notice: "{Przykładowy nagłówek ogłoszenia}[Przykładowy tekst ogłoszenia]",
            noticeTitle: "Przykładowy tytuł ogłoszenia",
            history: "{Przykładowy nagłówek historii koła}[Przykładowy tekst historii koła]",
            descriptionBottom: "{Zarząd koła}[Imię i nazwisko - stanowisko][Imię i nazwisko - stanowisko]{Kontakt}[Przykładowy tekst]"
        };
        saveDescriptions(defDsc);
    }

    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            console.log(dir + " not exist! Creating!");
            fs.mkdirSync(dir, { recursive: true });
            if (dir.indexOf('wedkarzroku') != -1) {
                fs.copyFile(dirName + "/public/img/nobodyYet.png", dir + "/nobodyYet.png", () => {
                    console.log('Created nobodyYet.png copy!');
                });
            }
        }
    });
}