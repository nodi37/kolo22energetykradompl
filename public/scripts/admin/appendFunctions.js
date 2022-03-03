//Appends compettions on wedkarzroku page
function appendCompetition(comp) {
    const dateObj = new Date(comp.dateValue);
    const date = dateObj.toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });

    $(`
    <li class="competitions__list-item">
    <div class="competition-item">
        <div class="competition-item__top">
            <p class="competition-item__date">${date}</p>
            <p class="competition-item__title">${comp.titleValue}</p><button data-id="${comp._id}"
                class="btn btn-red competition-item__delete">Usuń</button>
        </div>
        <p class="competition-item__description">${comp.descValue}</p>
    </div>
    </li>   
    `).appendTo('.competitions__list');
}

//APPENDS GALLERY ON GALLERIES PAGE
function appendGallery(doc) {
    const btnClass = doc.public ? 'btn-green' : 'btn-blue';
    const btnText = doc.public ? 'Opublikowany' : 'Publikuj';
    var ext = '';
    var fName = '';

    if (doc.mainImage) {
        ext = doc.mainImage.slice(doc.mainImage.lastIndexOf('.'));
        fName = doc.mainImage.replace(ext, '-mini' + ext);
    } else {
        fName = 'no-image'
    }

    $(`
    <div class='gallery'>
    <div class='gallery__top'>
        <img src='/img/gallery/${doc._id}/${fName}' class='gallery__image' alt='Brak zdjęcia!'><p class='gallery__header'>${doc.pName}</p>
    </div>
    <div class='gallery__btn-container'>
        <button data-id='${doc._id}' data-func='changeVisibility' class='btn admin-btn ${btnClass} gControllBtn'>${btnText}</button>
        <button data-id='${doc._id}' data-func='edit' class='btn admin-btn btn-yellow gControllBtn'>Edytuj</button>
        <button data-id='${doc._id}' data-func='delete' class='btn admin-btn btn-red gControllBtn'>Usuń</button>
    </div>
    </div>
    `).appendTo('.galleries');
}

//APPENDS MINIATURES AFTER UPLOAD/ON LOAD
function appendMiniatures(data) {
    const { status, thumb, counter } = data;
    if (status == 200) {
        $(`<div class="post__miniature"><img src="/img/gallery/${galleryId}/${thumb}" alt="Miniature" class="post__miniature-img"><span class='post__miniature-delete-button' data-gallery-id=${galleryId} data-miniature-name=${thumb}>&times;</span></div>`).appendTo('#post__miniatures');
    } else {
        $("#save-status").text(`Wystąpił błąd!`);
        $("#save-status").css('background-color', 'var(--color-red-dark)');
    }
}



//JUST APPEND LOGOS ON PAGE LOAD
function appendLogos(element) {
    $(".description__logos").append(`
    <div class='description__logo-container'>
    <img class='description__logo' src='/img/logo/${element._id + element.ext}'>
    <span class='description__logo-delete-button' data-logo-name=${element._id}>&times;</span>
    </div>`
    );
}

//Appends ranking year

function appendRankingYear(year, index) {
    const isDefault = index == 0 ? 'default' : '';
    $(`<option value="${year}" ${isDefault}>${year}</option>`).appendTo('#change-year');
    if (isDefault) {
        appendRankingTable(year);
    }
}

//Appends best one image and name 
async function appendBestOne(data) {
    $('.aoty__img').remove();
    $('.aoty__description').text(data.dsc);
    $(`
    <img class="aoty__img" src="/img/wedkarzroku/${data.img}" alt="Wedkarz roku!">
    `).appendTo('.aoty__img-container');

}

//Appends ranking year
async function appendRankingTable(year) {
    const tableData = await getTableReq(year);
    const competitions = await getCompetitions();
    const competitionsArray = []; //Array for competitions dates
    appendBestOne({ img: tableData.bestOneImg, dsc: tableData.bestOneDsc });

    competitions.forEach((comp, i) => { //Pushes competitions to array and appends options for new angler form.
        const dateValue = comp.dateValue;
        const toAppend = dateValue.slice(0, dateValue.indexOf('T'));
        $(`<option value="${toAppend}" default>${toAppend}</option>`).appendTo(`#user-competiton-select-new`);
        competitionsArray.push(toAppend);
    });

    $(`
    <tr>
    <th>Lp.</th>
    <th>Imię i naziwsko</th>
    <th>Wyniki</th>
    <th>Dodaj</th>
    </tr>
    `).appendTo('.ranking__inner-table-main');

    tableData.allPariticipants.forEach(async (part, index) => { //This is for every user!
        const { aName, participantId, pointSum, results, weightSum } = part;
        const compToAppend = [...competitionsArray]; //Makes temp copy of competitions array for every participant.
        //Appends participant to table.
        $(`
            <tr>
            <td>${index + 1}</td>
            <td>${aName}</td>
            <td>
                <table class="ranking__inner-table ranking__inner-table-${index}"></table>
            </td>
            <td>
                <select name="user-competiton" class="ranking__competition-select" id="user-competiton-select-${participantId}">
                    <option value="" default>&nbsp;</option>
                </select>
            </td>
            <td data-id="${participantId}" class="ranking__table-add">&plus;</td>
        </tr>`).appendTo('.ranking__inner-table-main'); 
        //Appends participant results to user row in table and removes used competition dates from temp >compToAppend< array. 
        results.forEach((result, i) => { 
            $(`                    
            <tr>
            <td>${result[0]}g</td>
            <td>${result[1]}pkt</td>
            <td>${result[2]}</td>
            <td data-id="${participantId}" data-result-index=${i} class="ranking__table-delete">&times;</td>
            </tr>`).appendTo(`.ranking__inner-table-${index}`);
            compToAppend.splice(compToAppend.indexOf(result[2]), 1);
        });
        //Appends remaining dates to select input for user
        compToAppend.forEach(el => {
            $(`<option value="${el}" default>${el}</option>`).appendTo(`#user-competiton-select-${participantId}`);
        });
    });
    $('.ranking__table-delete').on('click', deletePersonResult);
    $('.ranking__table-add').on('click', addNewPersonalResultHandler);
}