//////////////////////////////////////////////////
//Button handlers
//////////////////////////////////////////////////

//Just sets file name on /wedkarzroku page
function bestAnglerFileNameHanlder() {
    $(".post__images-upload-label").text($('#aoty__images-upload').prop('files')[0].name);
}

//Handler to save best on /wedkarzroku page
function saveBestAnglerHandler() {
    const year = $('#change-year').children("option:selected").val();
    const text = $('#aoty__text').val();
    const image = $('#aoty__images-upload').prop('files')[0];
    
    if (!text || !image){
        alert("Uzupełnij oba pola!");
    } else {
        const formData = new FormData();
        formData.append('year', year);
        formData.append('text', text);
        formData.append('image', image);
        sendBestAnglerImage(formData);
    }
}


//Adds new result for person
function addNewPersonalResultHandler(e) {
    const weight = prompt("Wpisz wagę:");
    const points = prompt("Wpisz ilość punktów:");
    const cDate = $(`#user-competiton-select-${e.target.dataset.id}`)[0].value;
    const data = {
        year: $('#change-year').children("option:selected").val(),
        participantId: e.target.dataset.id,
        weight: weight,
        points: points,
        compDate: cDate,
        func: 1
    }

    if (!weight || !points || cDate.length<1) {
        alert("Wprowadzone dane są nieprawidłowe! Wprowadź wagę, ilość punktów oraz wybierz datę zawodów.")
    } else {
        rankingPatchReq(data);
    }
}

//Deletes result
function deletePersonResult(e) {
    const data = {
        year: $('#change-year').children("option:selected").val(),
        participantId: e.target.dataset.id,
        resultIndex: e.target.dataset.resultIndex,
        func: 2
    }
    rankingPatchReq(data);
}

//Adds new person to ranking
async function addNewPersonHandler() {
    var dataValid = 1;
    const year = $('#change-year').children("option:selected").val();
    const cDate = $(`#user-competiton-select-new`)[0].value;
    const data = {
        year: year,
        aName: $('#aName').val(),
        weight: $('#weight').val(),
        points: $('#points').val(),
        compDate: cDate,
        func: 0
    }

    if (!year) {
        alert('Uzupełnij wybierz rok rankingowy!');
    } else {
        Object.values(data).forEach(entry => {
            if (entry.length < 1) {
                dataValid = 0;
            }
        })
        dataValid?rankingPatchReq(data):alert('Uzupełnij wszystkie pola!');
    }
}

//Just handler for year select
function changeYearSelectHandler() {
    var selected = $('#change-year').children("option:selected").val();
    $('.ranking__inner-table-main').children().remove();
    appendRankingTable(selected);
}


//Dodaj rok rankingowy button handler
function addRankingBtnHandler() {
    const year = window.prompt("Wpisz rok:");
    if (year && year > 1980 && year < 9999) {
        addRankingReq(year);
    } else if (!year) { } else {
        alert('Wprowadzono nieprawidłową wartość!');
    }
}

//Saves notice
function saveNoticeHandler() {
    const value = $('#description__notice').val();
    const noticeTitle = $('#description__notice-title').val();
    const data = { notice: value, noticeTitle: noticeTitle };
    saveDescriptions(data);
}

//Saves main header
function saveMainHeaderHandler() {
    const value = $('#description__top-header').val();
    const data = { mainHeader: value };
    saveDescriptions(data);
}

function saveHistory() {
    const value = $('#description__history').val();
    const data = { history: value };
    saveDescriptions(data);
}

//Saves top description under header
function saveDTopHandler() {
    const value = $('#description__top').val();
    const data = { descriptionTop: value };
    saveDescriptions(data);
}

//Saves bottom description
function saveDBottomHandler() {
    const value = $('#description__bottom').val();
    const data = { descriptionBottom: value };
    saveDescriptions(data);
}

//Just sets file name on the logo upload button
function logoBtnHandler() {
    $(".description__logos-upload-label").text($('#description__logos-upload').prop('files')[0].name);
}

//Redirects to add page
function addBtnHandler() {
    window.location.href = '/admin/galerie/dodaj';
}

//Deletes logo
function deleteHandler(e) {
    const logoName = e.target.dataset.logoName;
    deleteLogo(logoName)
}

//Handler for image upload button in add gallery page
function imagesBtnHandler() {
    const images = Array.from($('#post__images-upload').prop('files')).length;
    const word = images < 5 ? 'pliki' : 'plików'
    $(".post__images-upload-label").text(`Wybrałeś ${images} ${word}.`);
}

//Save gallery btn handler
async function saveGalleryBtnHandler() {
    const pName = $('#post__name').val();
    const pDscShort = $('#post__description').val();
    const pDscLong = $('#post__all').val();
    const pUserDate = $('#post__date').val();
    const data = { pName: pName, pDscShort: pDscShort, pDscLong: pDscLong, pUserDate: pUserDate };
    $("#save-status").css(`background-color`, 'var(--color-yellow-dark)');
    $("#save-status").text(`Zapisuję galerię!`);
    if (!pName || !pUserDate) {
        alert("Uzupełnij datę oraz nazwę wpisu!");
    } else if (isGalleryLoaded) {
        await sendImages();
        await updateGallery();
    } else {
        await saveGallery(data);
    }
    $("#save-status").text(`Zapisano!`);
    $("#save-status").css('background-color', 'var(--color-dark-green)');
}

//Marks main miniature
function miniatureClickHandler(e) {
    $('.post__miniature').removeClass('post__miniature--active');
    $(e.currentTarget).addClass('post__miniature--active');
}

//Deletes image from gallery
function miniatureDeleteHandler(e) {
    e.stopPropagation();
    if(confirm('Na pewno chcesz usunąć to zdjęcie?')) {
        deleteImageReq(e.currentTarget.dataset)
    }
}

//Gallery buttons functions
function galleryBtnHanlder(e) {
    const { func, id } = e.currentTarget.dataset;
    switch (func) {
        case 'changeVisibility':
            changeVisibilityReq(id)
            break;
        case 'edit':
            window.location.href = `/admin/galerie/edytuj/${id}`;
            break;
        case 'delete':
            if (confirm("Ten wpis zostanie kompletnie usunięty wraz ze wszystkimi plikami z serwera. Jesteś pewny?")) {
                deleteGalleryReq(id);
            }
            break;
        default:
            alert("Coś jest nie tak!")
            console.log("Funkcja galleryBtnHandler");
            break;
    }
}


//Button handler to add new competition in /zawody page
function addCompBtnHandler() {
    const dateInput = $('#competition-creator__date');
    const titleInput = $('#competition-creator__title');
    const descriptionInput = $('#competition-creator__dsc');
    const dateValue = dateInput.val();
    const titleValue = titleInput.val();
    const descValue = descriptionInput.val();
    const obj = { dateValue: dateValue, titleValue: titleValue, descValue: descValue };

    if (!dateValue) {
        dateInput.addClass('background--red');
    } else if (!titleValue) {
        titleInput.addClass('background--red');
    } else if (!descValue) {
        descriptionInput.addClass('background--red');
    } else {
        createNewCompetitionReq(obj)
    }
}

//Button handler to delete competition in /zawody page
function deleteCompetitionBtnHandler(e) {
    if (confirm("Jesteś pewny?")) {
        deleteCompetitionReq(e.target.dataset.id)
    }
}