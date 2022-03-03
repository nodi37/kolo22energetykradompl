const Ajv = require("ajv");
const ajv = new Ajv(); //REQ VALIDATOR
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const upload = multer({
    dest: 'tmp/img'
});
ejs = require('ejs');

/////////////////////////////////////////////////////////////////////////
//////////////////////MONGOOSE CONNECTION////////////////////////////////
mongoose.connect('mongodb://localhost:27017/kolo22', (err) => {
    if (err) {
        console.log("Initial connection to MongoDB error!");
        console.log(err);
    } else {
        console.log("Connected do MongoDB!")
    }
});

mongoose.connection.on('error', err => {
    console.log("Connection with databse broken! Check database server!");
    console.log(err);
});

//////////////////////MONGOOSE CONNECTION////////////////////////////////
/////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////
//////////////////////PARTIAL FILES//////////////////////////////////////
const {
    rankingImageUploadSchema,
    patchRankingSchema,
    createRankingSchema,
    deleteCompetitionSchema,
    createCompetitionSchema,
    captchaSchema,
    logoDeleteSchema,
    postCreateSchema,
    imageUploadSchema,
    imageDeleteSchema,
    loginSchema,
    saveDescriptionsSchema,
    changeVisibilitySchema,
    publicPostsSchema
    //singlePostSchema
} = require('./src/validationSchemes');

const {
    register,
    login,
    verifyToken,
    verifyCaptcha
} = require('./src/user');

const {
    saveDescriptions,
    readDescriptions
} = require('./src/descriptions');

const {
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
} = require('./src/galleries');

const {
    createCompetition,
    getCompetitions,
    deleteCompetition
} = require('./src/competition');

const {
    createRanking,
    listRankings,
    updateRanking,
    getSpecifiedRanking,
    manageBestInRankingImage
} = require('./src/rankings');

const {
    newDate,
    generateHtml,
    fail2banTimestamp,
    findBesttResults,
    scaleImage
} = require('./src/generators');

const {
    createCounter,
    incVisitorCount,
    getVisitorCount
} = require('./src/visitscounter')

const firstRun = require('./src/firstRunFunction');

//////////////////////PARTIAL FILES//////////////////////////////////////
/////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////
//////////////////////EXPRESS CONFIG/////////////////////////////////////
const app = express();

require('dotenv').config({ path: __dirname + '/.env' });
app.set('trust proxy', true);
app.use(express.static('public'));
app.use(bodyparser.urlencoded({
    extended: true
}));
app.use(bodyparser.json());
app.use(cookieParser(process.env.COOKIESECRET));
app.set('view engine', 'ejs');

//////////////////////EXPRESS CONFIG/////////////////////////////////////
/////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////
//RESTRICTED PAGE ROUTES
//////////////////////////////////////////////
app.get('/admin/galerie/dodaj', verifyToken, (req, res) => {
    res.sendFile(__dirname + '/pages/restricted/newgallery.html');
});

app.get('/admin/galerie/edytuj/:id/', verifyToken, (req, res) => {
    if (req.params.id.length == 24) {
        res.sendFile(__dirname + '/pages/restricted/editGallery.html');
    } else {
        res.redirect('/404');
    }
});

app.get('/admin/galerie', verifyToken, (req, res) => {
    res.sendFile(__dirname + '/pages/restricted/galeries.html');
});

app.get('/admin/opisy', verifyToken, (req, res) => {
    res.sendFile(__dirname + '/pages/restricted/descriptions.html');
});

app.get('/admin/zawody', verifyToken, (req, res) => {
    res.sendFile(__dirname + '/pages/restricted/competitions.html');
});

app.get('/admin/wedkarzroku', verifyToken, (req, res) => {
    res.sendFile(__dirname + '/pages/restricted/wOfTheYear.html');
});

//////////////////////////////////////////////
//PAGE ROUTES
//////////////////////////////////////////////

/////EJS

app.get('/historia', async (req, res) => {
    const reqData = await loadRequiredData();
    res.render(__dirname + '/views/history.ejs', { ...reqData });
});

app.get('/zawody', async (req, res) => {
    const competitions = await getCompetitions();
    const chronologically = competitions.answer.sort((a, b) => { return a.dateValue.getTime() - b.dateValue.getTime() });
    const reqData = await loadRequiredData();
    res.render(__dirname + '/views/zawody.ejs', { data: chronologically, ...reqData });
});

app.get('/wedkarzroku', async (req, res) => {
    const date = new Date;
    const year = date.getFullYear();
    const rankings = await listRankings();

    if (rankings.answer.indexOf(parseInt(year)) == -1) {
        res.redirect(`/wedkarzroku/${rankings.answer[0]}`);
    } else {
        res.redirect(`/wedkarzroku/${year}`);
    }
});

app.get('/wedkarzroku/:year', async (req, res) => {
    const { year } = req.params;
    if (year.length === 4 && parseInt(year) > 1000 && parseInt(year) < 9999) {
        const data = await getSpecifiedRanking(year);
        const allPariticipants = data.answer.allPariticipants.sort(findBesttResults).reverse();
        const rankings = await listRankings();
        var rankingsArr = [];

        await rankings.answer.forEach(async ranking => {
            const check = await getSpecifiedRanking(ranking);
            if (check.answer.allPariticipants.length > 0) {
                rankingsArr.push(ranking);
            }
        });

        const reqData = await loadRequiredData();

        if (rankings.answer.indexOf(parseInt(year)) !== -1) {
            res.render(__dirname + '/views/wedkarzroku.ejs', {
                year: year,
                data: data.answer,
                allPariticipants: allPariticipants,
                rankings: rankingsArr.sort((a, b) => { return a - b }).reverse(),
                ...reqData
            });
        } else {
            res.redirect('/404');
        }
    } else {
        res.redirect('/404');
    }
});

app.get('/', async (req, res) => {
    const data = await getPublic({ query: '', postsLoaded: 0, toLoad: 5 });
    const reqData = await loadRequiredData();

    if(!req.cookies.AlreadyVisited){
        res.cookie('AlreadyVisited', true, {expires: new Date(Date.now()+9999999999999), path: '/'});
        incVisitorCount();
    } 

    res.render(__dirname + '/views/index.ejs', {
        data: data.answer.reverse(),
        ...reqData
    });
});

app.get('/wpis/:Y/:M/:D/:T', async (req, res) => {
    const { Y, M, D, T } = req.params;
    const data = await getSinglePost({ year: Y, month: M, day: D, href: T });
    const reqData = await loadRequiredData();
    if (data.status == 200) {
        res.render(__dirname + '/views/galleryView.ejs', {
            data: data.answer,
            ...reqData
        });
    } else {
        console.log("Bad link requested - ignore last findGallery error!");
        res.redirect('/404');
    }
});

app.get('/wpisy', async (req, res) => {
    const reqData = await loadRequiredData();
    res.render(__dirname + '/views/allposts.ejs', {
        ...reqData
    });
});

////HTML FILES

app.get('/cpanel', (req, res) => {
    if (req.signedCookies.Authorization) {
        res.redirect('/admin/opisy');
    } else {
        res.render(__dirname + '/views/login.ejs', {
            error: ''
        });
    }
});

app.get('/logout', (req, res) => {
    res.status(302);
    res.clearCookie('Authorization');
    res.redirect('/');
});

app.get('/404', (req, res) => {
    res.sendFile(__dirname + '/pages/404.html');
});


//////////////////////////////////////////////
//APIS
//////////////////////////////////////////////

//USER CAPTCHA VERIFICATION
app.post('/api/captcha', (req, res) => {
    if (ajv.validate(captchaSchema, req.body)) {
        verifyCaptcha(req);
        res.sendStatus(200);
    } else {
        failResponse(res);
    }
})

//LOGIN POST //COOKIES
app.post('/cpanel', async (req, res) => {
    if (ajv.validate(loginSchema, req.body)) {
        const { email, password } = req.body;
        const { status, answer } = await login(req.ip, email, password);

        if (status != 200) {
            res.render(__dirname + '/views/login.ejs', {
                error: 'Nieprawidłowe dane użytkownika!'
            });
        } else {
            res.status(302);
            res.cookie('Authorization', answer.token, {
                domain: '.kolo22energetyk.radom.pl',
                expires: answer.expires,
                signed: true,
                secure: true,
                httpOnly: true,
                sameSite: "Strict"
            });
            res.redirect('/admin/opisy');
        }
    } else {
        failResponse(res);
    }
});

//POST TO GET ALL PUBLIC POSTS 
app.post('/api/posts/public', async (req, res) => {
    if (ajv.validate(publicPostsSchema, req.body)) {
        const { status, answer } = await getPublic(req.body);
        res.status(status).json({ answer: answer });
    } else {
        failResponse(res);
    }
});


//GET TO READ DESCRIPTIONS
app.get('/api/descriptions', async (req, res) => {
    const { status, answer } = await readDescriptions();
    res.status(status).json({ answer: answer });
});

//GET TO LIST LOGOS
app.get('/api/logos', async (req, res) => {
    const { status, answer } = await listLogos();
    res.status(status).json({ answer: answer });
});
//GET TO GET COMPETITIONS LIST
app.get('/api/competition', async (req, res) => {
    const { status, answer } = await getCompetitions();
    res.status(status).json({ answer: answer });
});

app.get('/api/ranking/all', async (req, res) => {
    const { status, answer } = await listRankings();
    res.status(status).json({ answer: answer });
});

app.patch('/api/ranking/one', async (req, res) => {
    if (ajv.validate(createRankingSchema, req.body)) {
        const { status, answer } = await getSpecifiedRanking(req.body.year);
        res.status(status).json({ answer: answer });
    } else {
        failResponse(res);
    }
});


//////////////////////////////////////////////
//RESTRICTED APIS
//////////////////////////////////////////////
app.patch('/api/ranking', verifyToken, async (req, res) => {
    if (ajv.validate(patchRankingSchema, req.body)) {
        const { status, answer } = await updateRanking(req.body);
        res.status(status).json({ answer: answer });
    } else {
        failResponse(res);
    }
})

//POST TO CREATE NEW RANKING
app.post('/api/ranking', verifyToken, async (req, res) => {
    if (ajv.validate(createRankingSchema, req.body)) {
        const { status, answer } = await createRanking(req.body.year);
        res.status(status).json({ answer: answer });
    } else {
        failResponse(res);
    }
});

//POST TO CREATE COMPETITION 
app.post('/api/competition', verifyToken, async (req, res) => {
    if (ajv.validate(createCompetitionSchema, req.body)) {
        const { status, answer } = await createCompetition(req.body);
        res.status(status).json({ answer: answer });
    } else {
        failResponse(res);
    }
});


//DELETE TO DELETE COMPETITION 
app.delete('/api/competition', verifyToken, async (req, res) => {
    if (ajv.validate(deleteCompetitionSchema, req.body)) {
        const { status, answer } = await deleteCompetition(req.body.id);
        res.status(status).json({ answer: answer });
    } else {
        failResponse(res);
    }
});



//POST TO SAVE DESCRIPTIONS
app.post('/api/descriptions', verifyToken, async (req, res) => {
    if (ajv.validate(saveDescriptionsSchema, req.body)) {
        const { status, answer } = await saveDescriptions(req.body);
        res.status(status).json({ answer: answer });
    } else {
        failResponse(res);
    }
});

//POST TO SAVE RANKING IMAGE
app.post('/api/ranking/image', verifyToken, upload.single('image'), async (req, res) => {
    if (ajv.validate(rankingImageUploadSchema, req.body)) {
        const { status, answer } = await manageBestInRankingImage(req);
        res.status(status).json({ answer: answer });
    } else {
        failResponse(res);
    }
});

//POST TO SAVE IMAGES
app.post('/api/image', verifyToken, upload.single('image'), async (req, res) => {
    if (ajv.validate(imageUploadSchema, req.body)) {
        const { status, answer } = await saveImage(req);
        res.status(status).json({ answer: answer });
    } else {
        failResponse(res);
    }
});

//DELETE TO DELETE IMAGES IN GALLERY
app.delete('/api/image', verifyToken, async (req,res)=>{
    if (ajv.validate(imageDeleteSchema, req.body)) {
        const { status, answer } = await deleteImage(req.body);
        res.status(status).json({ answer: answer });
    } else {
        failResponse(res);
    }
});


//DELETE TO DELETE LOGO
app.delete('/api/logos', verifyToken, upload.single('image'), async (req, res) => {
    if (ajv.validate(logoDeleteSchema, req.body)) {
        const { status, answer } = await deleteLogo(req.body);
        res.status(status).json({ answer: answer });
    } else {
        failResponse(res);
    }
});

//POST TO CREATE GALLERY DOCUMENT
app.post('/api/post', verifyToken, async (req, res) => {
    if (ajv.validate(postCreateSchema, req.body)) {
        const { status, answer } = await createGallery(req.body);
        res.status(status).json({ answer: answer });
    } else {
        failResponse(res);
    }
});

//PATCH TO PATCH GALLERY DOCUMENT
app.patch('/api/post', verifyToken, async (req, res) => {
    if (ajv.validate(postCreateSchema, req.body)) {
        const { status, answer } = await updateGallery(req.body);
        res.status(status).json({ answer: answer });
    } else {
        failResponse(res);
    }
});

app.delete('/api/post', verifyToken, async (req, res) => {
    if (ajv.validate(changeVisibilitySchema, req.body)) {
        const { status, answer } = await deleteGallery(req.body.id);
        res.status(status).json({ answer: answer });
    } else {
        failResponse(res);
    }
});

app.post('/api/post/get', verifyToken, async (req, res) => {
    if (ajv.validate(changeVisibilitySchema, req.body)) {
        const { status, answer } = await findGallery(req.body.id);
        res.status(status).json({ answer: answer });
    } else {
        failResponse(res);
    }
});

app.patch('/api/post/cv', verifyToken, async (req, res) => {
    if (ajv.validate(changeVisibilitySchema, req.body)) {
        const { status, answer } = await changeVisibility(req.body.id);;
        res.status(status).json({ answer: answer });
    } else {
        failResponse(res);
    }
})

//GET TO GET ALL GALLERIES
app.get('/api/galleries', verifyToken, async (req, res) => {
    const { status, answer } = await listAllGalleries(req.body);
    res.status(status).json({ answer: answer });
});

//////////////////////////////////////////////
//OTHERS
//////////////////////////////////////////////

//LOADS MAIN DATA FOR EJS GENERATION
async function loadRequiredData() {
    const logos = await listLogos();
    const descriptions = await readDescriptions();
    const counter = await getVisitorCount();
    return { logos: logos.answer, descriptions: descriptions.answer, visitsCount: counter };
}

//Fail response function 
function failResponse(res) {
    console.log("Request was received but body was not matched!");
    res.status(400).json({ answer: "Bad request" });
}

//START FUNCTIONS!
app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
    firstRun();
});

//REDIRECTS TO 404 WHEN ANY WRONG LINK REQUESTED - NEEDS TO BE LAST ONE!
app.use(function (req, res) {
    res.redirect('/404');
});
