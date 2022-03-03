//RECAPTCHA
$('document').ready(() => {
    grecaptcha.ready(function () {
        grecaptcha.execute('6Lf2V1oeAAAAACyuWQWKxwgnobl7AIvBp93PZ8Jn', { action: 'get' }).then(function (token) {
            captchaReq(token)
        });
    });
    cookiesInfoLoader();
})

//PRELOADERS
var imageList = [];
var currentImg = '';
var currentDir = '';
var allPostsPage = '';
var postsAppended = '';
var query = '';

//SITE PRELOADER
async function allPostsPreloader() {
    addLoader();
    allPostsPage = 1;
    $('#btn-show-more').click(showMore);
    $('.search-engine__main').submit(searchHandler);
    const posts = await postsRequests('', 0, 6);
    postsAppended = posts.length;
    posts.forEach((post, index) => {
        appendPost(post, index);
    });
    removeLoader();
    if (posts.length < 6) {
        $('#btn-show-more').off('click');
        $('#btn-show-more').text('To już wszystkie wpisy...');
        $('#btn-show-more').removeClass('btn-green');
        $('#btn-show-more').addClass('btn-red');
    }
}

//COOKIES FUNCTIONS
function cookiesInfoLoader() {
    if (!document.cookie.includes('AcceptCookies=Yes')) {
        $('.cookies').css('display', 'flex').animate({ left: 0 }, 2000, () => {
            $('.cookies__btn').on('click', acceptCookies);
        })
    }

}

function acceptCookies() {
    $('.cookies').animate({ left: '-100%' }, 2000, () => {
        $('cookies').css('display', 'none');
        $('.cookies__btn').off('click');
    })
    document.cookie = `AcceptCookies=Yes; expires=Fri, 31 Dec 9999 23:59:59 GMT"; path=/;`
}

//SEARCH BAR HANDLER
async function searchHandler(e) {
    e.preventDefault();
    const input = $('.search-engine__input');
    const inputText = $('.search-engine__input').val();
    if (inputText.length < 1) {
        input.addClass('search-engine__input--red');
        setTimeout(() => {
            input.removeClass('search-engine__input--red');
        }, 1500);
    } else {
        $('#btn-show-more').click(showMore);
        $('#btn-show-more').text('Wczytaj więcej');
        $('#btn-show-more').removeClass('btn-red');
        $('#btn-show-more').addClass('btn-green');
        $('.card').remove();
        postsAppended = 0;
        query = inputText;
        showMore();
    }
}

//SHOW MORE BUTTON HANDLER
async function showMore() {
    addLoader();
    const posts = await postsRequests(query, postsAppended, 6);
    if (posts.length == 0 & query.length > 0) {
        turnOffShowMore();
        $('.search-engine__inf').html(`Brak wyników wyszukiwania dla frazy &ldquo;${query}&rdquo;.`);
    } else if (posts.length < 6) {
        turnOffShowMore();
        posts.forEach((post, index) => {
            appendPost(post, index);
        });
    } else {
        $('.search-engine__inf').html(`Wyniki wyszukiwania dla frazy &ldquo;${query}&rdquo;:`);
        postsAppended = + posts.length;
        posts.forEach((post, index) => {
            appendPost(post, index);
        });
    }
    removeLoader();
}

function turnOffShowMore() {
    $('#btn-show-more').off('click');
    $('#btn-show-more').text('To już wszystkie wpisy...');
    $('#btn-show-more').removeClass('btn-green');
    $('#btn-show-more').addClass('btn-red');
}

function addLoader() {
    $(`<div class="loader">&nbsp;</div>`).appendTo('.card-flex-container--all');
    appendSpinner();
}

function removeLoader() {
    $('.loader').remove();
}

////FULL VIEW GALLERY
function loadFullView(e) {
    const img = e.target.dataset.originalImage;
    currentImg = img;
    $(`<img src="${currentDir}/${img}" alt="" class="full-view__image">`).appendTo('.full-view__figure');
    $('.full-view__image').css('opacity', 1);
    $('.full-view').addClass('full-view--visible');
    $('.full-view').animate({ opacity: 1 }, 250);
    $('.full-view').click(closeView);
    $(document).keyup(keySupport);
    $('.full-view__close').click(closeView);
    $('.full-view__arrow--next').click(goToNextImage);
    $('.full-view__arrow--previous').click(returnToPreviousImage);
}

function appendNewImage(image) {
    currentImg = image;
    const toAppend = $(`<img src="${currentDir}/${image}" alt="" class="full-view__image">`);
    $('.full-view__image').animate({ opacity: 0 }, 500, () => {
        $('.full-view__image').remove();
        toAppend.appendTo('.full-view__figure');
        $('.full-view__image').animate({ opacity: 1 }, 500);
    });
}

function keySupport(e) {
    switch (e.key) {
        case 'Escape':
            closeView(e.key);
            break;
        case 'ArrowRight':
            goToNextImage();
            break;
        case 'ArrowLeft':
            returnToPreviousImage();
            break;
        default:
            break;
    }
}

function goToNextImage() {
    const element = imageList.indexOf(currentImg) + 1;
    const image = imageList[element]
    if (element == imageList.length) {
        appendNewImage(imageList[0]);
    } else {
        appendNewImage(image);
    }
}

function returnToPreviousImage() {
    const element = imageList.indexOf(currentImg) - 1;
    const image = imageList[element]
    if (element > -1) {
        appendNewImage(image);
    } else {
        const firstImage = imageList[imageList.length - 1]
        appendNewImage(firstImage)
    }
}

function closeView(e) {
    if (e.target == e.currentTarget || e.key == 'Escape') {
        $('.full-view').off('click');
        $(document).off('keyup');
        $('.full-view__close').off('click');
        $('.full-view__arrow--next').off('click');
        $('.full-view__arrow--previous').off('click');
        $('.full-view').animate({ opacity: 0 }, 250, () => {
            $('.full-view').removeClass('full-view--visible');
            $('.full-view__image').remove();
        });
    }
}
//LOADER 

function appendSpinner() {
    $('<svg class="loader__svg"><use href="/svg/icons.svg#icon-spinner2" /></svg>').appendTo('.loader');
}

//APPENDS POST CARD
function appendPost(post, index) {
    const { __v, _id, dateSimplified, href, imageList, mainImage, pDscLong, pDscShort, pName, pUserDate, public } = post;
    const ext = mainImage.slice(mainImage.lastIndexOf('.'));
    const fName = mainImage.replace(ext, '-mini' + ext);
    const userDateObj = new Date(pUserDate);
    const userDate = userDateObj.toLocaleDateString('pl', {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    $(`
    <div class='card'> 
        <img src='img/gallery/${_id}/${fName}' class='card__image' alt='Zdjęcie główne'>
        <h1 class='card__title'>${pName}</h1>
        <span class='card__divider'>&nbsp;</span>
        <p class='card__description card__date'>${userDate}</p>
        <p class='card__description'>${pDscShort}</p>
        <button onclick="location.href='/wpis/${dateSimplified}/${href}'" class='btn btn-green btn-green-card' type='button'>Czytaj więcej</button>
    </div>
    `).appendTo('.card-flex-container');
}

//POSTS REQUEST FOR SEARCH ENGINE
function postsRequests(query, postsLoaded, toLoad) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/api/posts/public',
            type: 'POST',
            data: { query: query, postsLoaded: postsLoaded, toLoad: toLoad }
        }).done((res) => {
            resolve(res.answer);
        }).fail((res) => {
            fail(res);
        });
    })
}



//RECAPTCHA SUPPPORT
function captchaReq(data) {
    $.ajax({
        url: '/api/captcha',
        type: 'POST',
        data: { token: data }
    }).fail(() => {
        console.log("Failed to verify captcha!");
    });
}

/////////////RESPONSE FAIL//////////////////
function fail(res) {
    console.log('This shouldnt happend, admin.js error, check server log');
    console.log(res)
    if (confirm('Coś poszło nie tak. Odświerz stronę i spróbuj jeszcze raz.')) {
        window.location.reload();
    }
}