//////////////////////////////////////////////////
//REQUESTS FUNCTIONS 
//////////////////////////////////////////////////

//Image request for /wedkarzroku page
function sendBestAnglerImage(data) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/api/ranking/image',
            type: 'POST',
            enctype: 'multipart/form-data',
            processData: false,
            contentType: false,
            cache: false,
            data: data
        }).done((res) => {
            done(res)
        }).fail((res) => {
            fail(res);
        });
    });
}

//PATCHES RANKINGS FOR DIFFERENT FUNCTIONS
async function getTableReq(year) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/api/ranking/one',
            type: 'PATCH',
            data: {year:year}
        }).done((res) => {
            resolve(res.answer)
        }).fail((res) => {
            reject(res)
        });
    }).catch(err => {
        fail(err);
    });
}

function rankingPatchReq(data) {
    $.ajax({
        url: '/api/ranking',
        type: 'patch',
        data: data
    }).done((res) => {
        done(res)
    }).fail((res) => {
        fail(res);
    });
}

//Lists rankings 
async function getRankingsReq() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/api/ranking/all',
            type: 'GET'
        }).done((res) => {
            resolve(res.answer)
        }).fail((res) => {
            reject(res)
        });
    }).catch(err => {
        fail(err);
    });
}

//Add ranking Year request 
function addRankingReq(year) {
    $.ajax({
        url: '/api/ranking',
        type: 'post',
        data: {year: year}
    }).done((res) => {
        done(res);
    }).fail((res) => {
        fail(res);
    });
}


//GALERY IMAGE SENDER
function sendImage(data) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/api/image',
            type: 'POST',
            enctype: 'multipart/form-data',
            processData: false,
            contentType: false,
            cache: false,
            data: data,
            timeout: 900000,
            xhr: function () {
                var xhr = $.ajaxSettings.xhr();
                xhr.upload.onprogress = function (e) {
                    if (e.lengthComputable) {
                        const progress = Math.round(e.loaded / e.total * 100);
                        $('.post__image-save-status').css('width', `${progress}%`);
                    }
                };
                return xhr;
            }
        }).done((res) => {
            $('.post__image-save-status').css('width', `0%`);
            resolve({ status: 200, thumb: res.answer });
        }).fail((res) => {
            reject(res)
        }).catch(err => {
            fail(err)
        });
    });
}

//Gallery image remover
function deleteImageReq(miniature) {
    $.ajax({
        url: '/api/image',
        type: 'DELETE',
        data: miniature
    }).done((res) => {
        done(res);
    }).fail((res) => {
        fail(res);
    });
}

//COMPETITION
function createNewCompetitionReq(data) {
        $.ajax({
            url: '/api/competition',
            type: 'POST',
            data: data
        }).done((res) => {
            done(res);
        }).fail((res) => {
            fail(res);
        });
}

async function getCompetitions() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/api/competition',
            type: 'GET'
        }).done((res) => {
            resolve(res.answer)
        }).fail((res) => {
            reject(res)
        });
    }).catch(err => {
        fail(err);
    });
}

async function deleteCompetitionReq(id) {
    $.ajax({
        url: '/api/competition',
        type: 'DELETE',
        data: {id: id}
    }).done((res) => {
        done(res);
    }).fail((res) => {
        fail(res);
    });
}

//DESCRIPTIONS
function saveDescriptions(data) {
    $.ajax({
        url: '/api/descriptions',
        type: 'POST',
        data: data
    }).done((res) => {
        done(res);
    }).fail((res) => {
        fail(res);
    });
}


function loadDescriptions() {
    $.ajax({
        url: '/api/descriptions',
        type: 'GET'
    }).done((res) => {
        const data = res.answer;
        $('#description__notice').val(data.notice);
        $('#description__notice-title').val(data.noticeTitle);
        $('#description__history').val(data.history);
        $('#description__top-header').val(data.mainHeader);
        $('#description__top').val(data.descriptionTop);
        $('#description__bottom').val(data.descriptionBottom);
    }).fail((res) => {
        fail(res);
    });
}


//LOGOS
function loadLogos() {
    $.ajax({
        url: '/api/logos',
        type: 'GET'
    }).done((res) => {
        const data = res.answer;
        data.forEach(element => {
            appendLogos(element);
        });
        $('.description__logo-delete-button').on('click', deleteHandler);
    }).fail((res) => {
        fail(res);
    });

}

function deleteLogo(lName) {
    $.ajax({
        url: '/api/logos',
        type: 'DELETE',
        data: { lName: lName }
    }).done((res) => {
        done(res);
    }).fail((res) => {
        fail(res);
    });
}

//GALERIES
async function loadGalleriesReq() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/api/galleries',
            type: 'GET'
        }).done((res) => {
            resolve(res.answer);
        }).fail((res) => {
            reject(res);
        });
    }).catch(err => {
        fail(err);
    });
}

async function loadGalleryReq() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/api/post/get',
            type: 'post',
            data: { id: galleryId }
        }).done((res) => {
            resolve(res.answer);
        }).fail((res) => {
            reject(res);
        });
    }).catch(err => {
        fail(err);
    });
}

async function createPost(data) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/api/post',
            type: 'POST',
            data: data
        }).done((res) => {
            resolve(res.answer)
        }).fail((res) => {
            reject(res)
        });
    }).catch(err => {
        fail(err);
    });
}

async function updateGalleryReqest(data) {
    $("#save-status").text(`Aktualizuję...`);
    $.ajax({
        url: '/api/post',
        type: 'PATCH',
        data: data
    }).done((res) => {
        $("#save-status").text(`Zapisano!`);
    }).fail((res) => {
        fail(res);
    });
}

async function deleteGalleryReq(id) {
    $.ajax({
        url: '/api/post/',
        type: 'DELETE',
        data: { id: id }
    }).done((res) => {
        done(res)
    }).fail((res) => {
        fail(res);
    });
}

async function changeVisibilityReq(id) {
    $.ajax({
        url: '/api/post/cv',
        type: 'PATCH',
        data: { id: id }
    }).done((res) => {
        done(res)
    }).fail((res) => {
        fail(res);
    });
}
