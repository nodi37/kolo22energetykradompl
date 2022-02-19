//////////////////////////////////////////////////
//OTHER FUNCTIONS 
//////////////////////////////////////////////////

//Textarea auto grow function
function autoGrow(e) {
    if ($(e.target).val().length < 5) {
        $(e.target).css('height', '8rem');
    }
    $(e.target).css('height', e.target.scrollHeight + 'px');
}

//LOADS COMPETITIONS
async function loadRankings() {
    const rankings = await getRankingsReq();
    rankings.forEach((year, index)=>{
        appendRankingYear(year, index);
    });
}

async function loadCompetitions() {
    const competitions = await getCompetitions();
    competitions.forEach(comp=>{
        appendCompetition(comp);
    });
    $('.competition-item__delete').on('click', deleteCompetitionBtnHandler);
}

//LOADS GALERIES
async function loadGalleries() {
    const gToAppend = await loadGalleriesReq();
    gToAppend.forEach(doc => {
        appendGallery(doc)
    });
    $('.gControllBtn').on('click', galleryBtnHanlder);
}



async function loadGallery() {
    const gData = await loadGalleryReq();
    const { __v, _id, dateSimplified, imageList, mainImage, pDscLong, pDscShort, pName, public } = gData;
    const imgCount = imageList.length;
    const status = 200;

    //SETS TEXTAREAS 
    $('#post__name').val(pName);
    $('#post__description').val(pDscShort);
    $('#post__all').val(pDscLong);

    //APPENDS MINIATURES
    var counter = 1;
    gData.imageList.forEach(async (image) => {
        const fExt = image.slice(image.lastIndexOf('.'));
        const thumb = image.replace(fExt, '-mini' + fExt);
        const data = { status, thumb, imgCount, counter };
        ++counter;
        appendMiniatures(data);
    });

    //MARKS RIGHT MAIN IMAGE
    $('.post__miniature').each((i, element) => {
        if (element.childNodes[0].src.indexOf(mainImage.slice(0, mainImage.lastIndexOf('.'))) !== -1) {
            $('.post__miniature').removeClass('post__miniature--active');
            $(element).addClass('post__miniature--active');
        };
    });
}

//UPDATES GALLERY
async function updateGallery() {
    var src, mainImage;
    const pName = $('#post__name').val();
    const pDscShort = $('#post__description').val();
    const pDscLong = $('#post__all').val();
    if($(".post__miniature--active").length>0) {
        src = $(".post__miniature--active")[0].childNodes[0].src;
        mainImage = src.slice(src.lastIndexOf('/') + 1).replace('-mini', '');
    }
    const data = { galleryId: galleryId, pName: pName, pDscShort: pDscShort, pDscLong: pDscLong, mainImage: mainImage };
    updateGalleryReqest(data);
}


//RUNS REQUEST TO SAVE GALLERY
async function saveGallery(data) {
    galleryId = await createPost(data);
    if (galleryId !== "Server error") {
        isGalleryLoaded = 1;
        $("#save-status").css("display", "block");
        $("#save-status").text(`Utworzono galerię ${galleryId}`);
        await sendImages();
    } else {
        fail(galleryId);
    }
}

//SENDS IMAGES TO POST
async function sendImages() {
    $("#save-status").text(`Zapisuje zdjęcia...`);
    $("#save-status").css(`background-color`,'var(--color-yellow-dark)');
    const images = Array.from($('#post__images-upload').prop('files'));
    const imgCount = images.length;
    if (imgCount > 0) {
        var counter = 0;
        images.forEach(async (image) => {
            const formData = new FormData();
            formData.append('image', image);
            formData.append('postImage', 1);
            formData.append('gId', galleryId);
            const result = await sendImage(formData);
            ++counter;
            appendMiniatures({ ...result, imgCount, counter })
        });
    }
}

//PREPARES LOGO TO SEND
async function prepareLogo() {
    const href = $('#description__logos-href').val();
    if ($('#description__logos-upload').prop('files').length < 1) {
        $(".description__logos-upload-label").text("Najpierw wybierz logo!");
    } else if (href.length<1){
        $(".description__logos-upload-label").text("Uzupełnij link!");
    }else {
        const formData = new FormData();
        const image = $('#description__logos-upload').prop('files')[0];
        formData.append('image', image);
        formData.append('href', href)
        formData.append('postImage', 0);
        const result = await sendImage(formData);
        if (result.status == 200) {
            done();
        } else {
            fail();
        }
    }
}


//RESPONSE FUNCTIONS
function done(res) {
    if (confirm('Zmiany wprowadzone, naciśnij OK by przeładować.')) {
        window.location.reload();
    }
}

function fail(res) {
    console.log('This shouldnt happend, admin.js error, check server log');
    console.log(res)
    if (confirm('Coś poszło nie tak. Odświerz stronę i spróbuj jeszcze raz.')) {
        window.location.reload();
    }
}



