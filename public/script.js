// Hearts Animation
const heartContainer = document.getElementById('heart-container');

function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart');
    heart.style.left = Math.random() * 100 + 'vw';
    const size = Math.random() * 20 + 10;
    heart.style.setProperty('--heart-size', `${size}px`);
    const fallDuration = Math.random() * 2 + 3;
    heart.style.animationDuration = `${fallDuration}s, ${fallDuration}s`;
    const initialRotate = Math.random() * 360 - 180;
    heart.style.setProperty('--initial-rotate', `${initialRotate}deg`);
    heartContainer.appendChild(heart);
    setTimeout(() => heart.remove(), fallDuration * 1000);
}

setInterval(createHeart, 300);

// Text Animation Functions
function typeSentence(sentence, textSize, delay) {
    return new Promise(resolve => {
        const textElement = document.getElementById('big-text');
        textElement.style.fontSize = textSize + 'px';
        textElement.textContent = '';

        setTimeout(() => {
            let index = 0;
            const typing = setInterval(() => {
                textElement.textContent += sentence[index];
                index++;
                if (index === sentence.length) {
                    clearInterval(typing);
                    resolve();
                }
            }, 100);
        }, delay);
    });
}

async function typeSentences(sentences, textSize, initialDelay, delayBetweenSentences) {
    let sentence_count = 0;
    await new Promise(resolve => setTimeout(resolve, initialDelay));
    for (let i = 0; i < sentences.length; i++) {
        await typeSentence(sentences[i], textSize, i === 0 ? 0 : delayBetweenSentences);
        await new Promise(resolve => setTimeout(resolve, sentence_count >= 5 ? 40000 : 4000));
        sentence_count++;
    }
}

// Carousel Functions
let slideIndex = 1;

function showSlides() {
    const slides = document.getElementsByClassName("slide");
    const slideTexts = document.getElementsByClassName("slide-text");
    Array.from(slides).forEach((slide, i) => {
        slide.classList.remove("central");
        slideTexts[i].style.display = "none";
    });
    slides[slideIndex].classList.add("central");
    slideTexts[slideIndex].style.display = "block";
}

function changeSlide(n) {
    const container = document.querySelector('.slide-container');
    const containerWidth = container.offsetWidth;
    const slideWidth = containerWidth / 4;
    
    slideIndex += n;
    const numSlides = document.querySelectorAll('.slide').length;
    
    if (slideIndex >= numSlides) slideIndex = 0;
    if (slideIndex < 0) slideIndex = numSlides - 1;

    const centralSlideOffset = (containerWidth - slideWidth * 2) / 2;
    const targetTranslateX = -slideIndex * slideWidth + centralSlideOffset;
    
    currentTranslateX = targetTranslateX;
    container.style.transform = `translateX(${targetTranslateX}px)`;
    showSlides();
}

// Video Handling Functions
function initializeVideoHandling() {
    const videos = document.querySelectorAll('.gallery-video');
    const container = document.querySelector('.slide-container');

    function playVideo(video) {
        if (!video.paused) return;
        video.play();
    }

    function pauseVideo(video) {
        if (video.paused) return;
        video.pause();
    }

    container.addEventListener('transitionend', () => {
        const centralSlide = document.querySelector('.slide.central .gallery-video');
        videos.forEach(video => {
            video === centralSlide ? playVideo(video) : pauseVideo(video);
        });
    });
}

// Music Player Functions
function initializeAudioPlayer() {
    const audioPlayer = document.getElementById("audio-player");
    const nowPlaying = document.getElementById("song-title");
    const prevSongButton = document.getElementById("prev-song");
    const nextSongButton = document.getElementById("next-song");
    const playPauseButton = document.getElementById("play-pause");
    const progressBar = document.getElementById("progress-bar");
    const progressContainer = document.getElementById("progress-container");

    let currentSongIndex = 0;
    let shuffledSongs = [];

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    async function initializePlaylist() {
        try {
            const response = await fetch('/api/music');
            const musicData = await response.json();
            const { songs, initialPool } = musicData;

            const randomInitialSongIndex = Math.floor(Math.random() * initialPool.length);
            const randomInitialSong = initialPool[randomInitialSongIndex];
            const remainingInitialSongs = initialPool.filter((_, i) => i !== randomInitialSongIndex);
            const allSongs = [...remainingInitialSongs, ...songs];

            shuffleArray(allSongs);
            shuffledSongs = [randomInitialSong, ...allSongs];
            loadSong(0);
        } catch (error) {
            console.error('Error loading music:', error);
        }
    }

    function loadSong(index) {
        if (!shuffledSongs.length) return;
        audioPlayer.src = shuffledSongs[index].src;
        nowPlaying.textContent = shuffledSongs[index].title;
        audioPlayer.play().catch(console.error);
    }

    function nextSong() {
        currentSongIndex = (currentSongIndex + 1) % shuffledSongs.length;
        loadSong(currentSongIndex);
    }

    function prevSong() {
        currentSongIndex = (currentSongIndex - 1 + shuffledSongs.length) % shuffledSongs.length;
        loadSong(currentSongIndex);
    }

    // Event Listeners
    playPauseButton.addEventListener("click", () => {
        if (audioPlayer.paused) {
            audioPlayer.play().catch(console.error);
            playPauseButton.innerHTML = '<img src="icons/pause.svg" alt="Pause">';
        } else {
            audioPlayer.pause();
            playPauseButton.innerHTML = '<img src="icons/play.svg" alt="Play">';
        }
    });

    nextSongButton.addEventListener("click", nextSong);
    prevSongButton.addEventListener("click", prevSong);
    audioPlayer.addEventListener("ended", nextSong);

    audioPlayer.addEventListener("timeupdate", () => {
        const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.style.width = percent + '%';
    });

    progressContainer.addEventListener("click", e => {
        const rect = progressContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        audioPlayer.currentTime = pos * audioPlayer.duration;
    });

    progressContainer.addEventListener("touchstart", e => {
        e.preventDefault();
        const rect = progressContainer.getBoundingClientRect();
        const pos = (e.touches[0].clientX - rect.left) / rect.width;
        audioPlayer.currentTime = pos * audioPlayer.duration;
    });

    return { initializePlaylist };
}

// Loading Functions
async function loadCarouselContent() {
    try {
        const response = await fetch('/api/carousel');
        const carouselData = await response.json();
        
        const slideContainer = document.querySelector('.slide-container');
        const slideTexts = document.querySelector('.slide-texts');
        
        const slidesHTML = carouselData.map((item, index) => {
            if (item.isVideo) {
                return `
                    <div class="slide${index === 0 ? ' central' : ''}">
                        <video controls class="gallery-video">
                            <source src="images/${item.image}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    </div>`;
            }
            return `
                <div class="slide${index === 0 ? ' central' : ''}">
                    <img src="images/${item.image}" alt="Slide ${index + 1}">
                </div>`;
        }).join('\n');
        
        const captionsHTML = carouselData.map(item => 
            `<div class="slide-text">${item.caption || ''}</div>`
        ).join('\n');
        
        slideContainer.innerHTML = slidesHTML;
        slideTexts.innerHTML = captionsHTML;
        
        showSlides();
    } catch (error) {
        console.error('Error loading carousel data:', error);
    }
}

async function loadIntroText() {
    try {
        console.log('Loading intro text...');
        const response = await fetch('/api/intro-text');
        const introData = await response.json();
        console.log('Loaded intro text:', introData);
        typeSentences(
            introData.sentences,
            introData.textSize,
            introData.initialDelay,
            introData.delayBetweenSentences
        );
    } catch (error) {
        console.error('Error loading intro text:', error);
    }
}

// Main Initialization
document.addEventListener("DOMContentLoaded", async function() {
    try {
        // Initialize audio player first (returns methods we need)
        const audioPlayer = initializeAudioPlayer();
        
        // Load all content
        await Promise.all([
            loadCarouselContent(),
            loadIntroText(),
            audioPlayer.initializePlaylist()
        ]);

        // Initialize other components
        initializeVideoHandling();
        initializeCarouselTouch();
        showSlides();
    } catch (error) {
        console.error('Initialization error:', error);
    }
});