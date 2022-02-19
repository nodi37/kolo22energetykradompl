var galleryId = '';
var isGalleryLoaded = 0;

//Admin/zawody preloader
async function competitionsPagePreLoader() {
    $('#addnewcomp').on('click', addCompBtnHandler);
    loadCompetitions();
}

//admin/wedkarzroku preloader
async function aotyPreloader() {
    $('#btn-save-aoty').on('click', saveBestAnglerHandler);
    $('#aoty__images-upload').on('change', bestAnglerFileNameHanlder)
    $('#add-ranking').on('click', addRankingBtnHandler);
    $('#change-year').on('change', changeYearSelectHandler);
    $('.ranking__table-add-new-person').on('click', addNewPersonHandler);
    $('#aName').val('');
    $('#weight').val('');
    $('#points').val('');
    loadRankings();
} 

//admin/opisy preloader
function descriptionPagePreLoader() {
    $('#save-notice').on('click', saveNoticeHandler);
    $('#save-mainHeader').on('click', saveMainHeaderHandler);
    $('#save-history').on('click', saveHistory);
    $('#save-descriptionTop').on('click', saveDTopHandler);
    $('#save-descriptionBottom').on('click', saveDBottomHandler);
    $('#save-image').on('click', prepareLogo);
    $('#description__logos-upload').on('change', logoBtnHandler);
    $('textarea').on('input', autoGrow);
    loadDescriptions();
    loadLogos();
}

//admin/galerie preloader
function galeriesPagePreLoader() {
    $('#addnewgallery').on('click', addBtnHandler);
    $('#btn-save-gallery').on('click', saveGalleryBtnHandler);
    $('#post__images-upload').on('change', imagesBtnHandler);
    loadGalleries();
}

//admin/galeria/edytuj preloader
function editPagePreLoader() {
    $('#btn-save-gallery').on('click', saveGalleryBtnHandler);
    $('#post__images-upload').on('change', imagesBtnHandler);
    const href = window.location.href;
    if (href.indexOf('edytuj') != -1) {
        const idStart = href.lastIndexOf('/') + 1;
        const idEnd = idStart + 24;
        const id = href.slice(idStart, idEnd);
        galleryId = id;
        isGalleryLoaded = 1;
        $("#save-status").css("display", "block");
        loadGallery();
    }
}

