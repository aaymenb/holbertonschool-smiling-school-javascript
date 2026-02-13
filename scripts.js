$(document).ready(function() {
    // Load Quotes
    $.ajax({
        url: 'https://smileschool-api.hbtn.info/quotes',
        method: 'GET',
        beforeSend: function() {
            $('#loader-quotes').show();
        },
        success: function(data) {
            $('#loader-quotes').hide();
            $('#carouselExampleControls').removeClass('d-none');
            
            data.forEach((quote, index) => {
                const activeClass = index === 0 ? 'active' : '';
                const quoteHtml = `
                    <div class="carousel-item ${activeClass}">
                        <div class="row mx-auto align-items-center">
                            <div class="col-12 col-sm-2 col-lg-2 offset-lg-1 text-center">
                                <img src="${quote.pic_url}" class="d-block align-self-center rounded-circle" alt="Carousel Pic ${index + 1}" width="160px" />
                            </div>
                            <div class="col-12 col-sm-7 offset-sm-2 col-lg-9 offset-lg-0">
                                <div class="quote-text">
                                    <p class="text-white">« ${quote.text} »</p>
                                    <h4 class="text-white font-weight-bold">${quote.name}</h4>
                                    <span class="text-white">${quote.title}</span>
                                </div>
                            </div>
                        </div>
                    </div>`;
                $('#quotes-container').append(quoteHtml);
            });
        },
        error: function() {
            $('#loader-quotes').hide();
            console.log('Error loading quotes');
        }
    });

    // Generic function to load videos and setup multi-item carousel
    function loadVideos(url, containerId, loaderId, carouselId) {
        $.ajax({
            url: url,
            method: 'GET',
            beforeSend: function() {
                $(`#${loaderId}`).show();
            },
            success: function(data) {
                $(`#${loaderId}`).hide();
                $(`#${carouselId}`).removeClass('d-none');
                
                data.forEach((video, index) => {
                    let starsHtml = '';
                    for (let s = 1; s <= 5; s++) {
                        const starImg = s <= video.star ? 'star_on.png' : 'star_off.png';
                        starsHtml += `<img src="images/${starImg}" alt="star" width="15px" />`;
                    }

                    const activeClass = index === 0 ? 'active' : '';
                    const videoHtml = `
                        <div class="carousel-item ${activeClass}">
                            <div class="col-12 col-sm-6 col-md-6 col-lg-3 d-flex justify-content-center">
                                <div class="card border-0">
                                    <img src="${video.thumb_url}" class="card-img-top" alt="Video thumbnail" />
                                    <div class="card-img-overlay text-center">
                                        <img src="images/play.png" alt="Play" width="64px" class="align-self-center play-overlay" />
                                    </div>
                                    <div class="card-body">
                                        <h5 class="card-title font-weight-bold">${video.title}</h5>
                                        <p class="card-text text-muted">${video['sub-title']}</p>
                                        <div class="creator d-flex align-items-center">
                                            <img src="${video.author_pic_url}" alt="Creator" width="30px" class="rounded-circle" />
                                            <h6 class="pl-3 m-0 main-color">${video.author}</h6>
                                        </div>
                                        <div class="info pt-3 d-flex justify-content-between">
                                            <div class="rating">${starsHtml}</div>
                                            <span class="main-color">${video.duration}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                    $(`#${containerId}`).append(videoHtml);
                });

                // Setup multi-item carousel sliding one by one
                $(`#${carouselId} .carousel-item`).each(function() {
                    let next = $(this).next();
                    if (!next.length) {
                        next = $(this).siblings(':first');
                    }
                    next.children(':first-child').clone().addClass('cloned').appendTo($(this));

                    for (let i = 0; i < 2; i++) {
                        next = next.next();
                        if (!next.length) {
                            next = $(this).siblings(':first');
                        }
                        next.children(':first-child').clone().addClass('cloned').appendTo($(this));
                    }
                });
            },
            error: function() {
                $(`#${loaderId}`).hide();
                console.log(`Error loading videos from ${url}`);
            }
        });
    }

    // Initialize Popular Tutorials if container exists
    if ($('#popular-container').length) {
        loadVideos(
            'https://smileschool-api.hbtn.info/popular-tutorials',
            'popular-container',
            'loader-popular',
            'carouselExampleControls2'
        );
    }

    // Initialize Latest Videos if container exists
    if ($('#latest-container').length) {
        loadVideos(
            'https://smileschool-api.hbtn.info/latest-videos',
            'latest-container',
            'loader-latest',
            'carouselExampleControls3'
        );
    }

    // Load Courses
    function loadCourses() {
        const q = $('#search-input').val();
        const topic = $('#topic-selected').text();
        const sort = $('#sort-selected').text().replace(/ /g, '_').toLowerCase();

        $.ajax({
            url: 'https://smileschool-api.hbtn.info/courses',
            method: 'GET',
            data: {
                q: q,
                topic: topic,
                sort: sort
            },
            beforeSend: function() {
                $('#loader-courses').show();
                $('#results-container').empty();
            },
            success: function(data) {
                $('#loader-courses').hide();
                
                // Initialize search value from API if first load
                if (!$('#search-input').data('initialized')) {
                    $('#search-input').val(data.q);
                    $('#search-input').data('initialized', true);
                }

                // Populate dynamic dropdowns if empty
                if ($('#topic-menu').is(':empty')) {
                    data.topics.forEach(t => {
                        const topicName = t.charAt(0).toUpperCase() + t.slice(1);
                        $('#topic-menu').append(`<a class="dropdown-item" href="#">${topicName}</a>`);
                    });
                }
                if ($('#sort-menu').is(':empty')) {
                    data.sorts.forEach(s => {
                        const sortName = s.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                        $('#sort-menu').append(`<a class="dropdown-item" href="#" data-sort="${s}">${sortName}</a>`);
                    });
                }

                // Update video count
                $('.video-count').text(`${data.courses.length} videos`);

                // Update results container
                data.courses.forEach(video => {
                    let starsHtml = '';
                    for (let s = 1; s <= 5; s++) {
                        const starImg = s <= video.star ? 'star_on.png' : 'star_off.png';
                        starsHtml += `<img src="images/${starImg}" alt="star" width="15px" />`;
                    }

                    const courseHtml = `
                        <div class="col-12 col-sm-4 col-lg-3 d-flex justify-content-center">
                            <div class="card border-0">
                                <img src="${video.thumb_url}" class="card-img-top" alt="Video thumbnail" />
                                <div class="card-img-overlay text-center">
                                    <img src="images/play.png" alt="Play" width="64px" class="align-self-center play-overlay" />
                                </div>
                                <div class="card-body">
                                    <h5 class="card-title font-weight-bold">${video.title}</h5>
                                    <p class="card-text text-muted">${video['sub-title']}</p>
                                    <div class="creator d-flex align-items-center">
                                        <img src="${video.author_pic_url}" alt="Creator" width="30px" class="rounded-circle" />
                                        <h6 class="pl-3 m-0 main-color">${video.author}</h6>
                                    </div>
                                    <div class="info pt-3 d-flex justify-content-between">
                                        <div class="rating">${starsHtml}</div>
                                        <span class="main-color">${video.duration}</span>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                    $('#results-container').append(courseHtml);
                });
            },
            error: function() {
                $('#loader-courses').hide();
                console.log('Error loading courses');
            }
        });
    }

    // Initialize Courses page
    if ($('#results-container').length) {
        loadCourses();

        $('#search-input').on('input', function() {
            loadCourses();
        });

        $(document).on('click', '#topic-menu .dropdown-item', function(e) {
            e.preventDefault();
            $('#topic-selected').text($(this).text());
            loadCourses();
        });

        $(document).on('click', '#sort-menu .dropdown-item', function(e) {
            e.preventDefault();
            $('#sort-selected').text($(this).text());
            loadCourses();
        });
    }
});
