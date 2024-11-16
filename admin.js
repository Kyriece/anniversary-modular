// State management
const state = {
    carousel: [],
    music: { songs: [], initialPool: [] },
    introText: { 
        sentences: [], 
        textSize: 48, 
        initialDelay: 5000, 
        delayBetweenSentences: 1000 
    }
};

// Tab management
function showSection(sectionName) {
    document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(`${sectionName}-section`).classList.add('active');
    document.querySelector(`.tab[onclick="showSection('${sectionName}')"]`).classList.add('active');
}

// Status message
function showStatus(message) {
    const status = document.getElementById('saveStatus');
    status.textContent = message;
    status.style.display = 'block';
    setTimeout(() => status.style.display = 'none', 3000);
}

// Carousel functions
async function loadCarouselData() {
    try {
        const response = await fetch('/api/carousel');
        state.carousel = await response.json();
        renderCarouselItems();
    } catch (error) {
        console.error('Error loading carousel data:', error);
    }
}

function renderCarouselItems() {
    const container = document.getElementById('carouselItems');
    container.innerHTML = state.carousel.map((item, index) => `
        <div class="carousel-item">
            ${item.isVideo ? 
                `<video src="images/${item.image}" controls></video>` :
                `<img src="images/${item.image}" alt="${item.caption}">`
            }
            <input type="number" value="${index + 1}" onchange="updateOrder(${index}, this.value - 1)">
            <textarea placeholder="Caption" onchange="updateCaption(${index}, this.value)">${item.caption || ''}</textarea>
            <button class="move-btn" onclick="moveItem(${index}, ${index - 1})" ${index === 0 ? 'disabled' : ''}>↑</button>
            <button class="move-btn" onclick="moveItem(${index}, ${index + 1})" ${index === state.carousel.length - 1 ? 'disabled' : ''}>↓</button>
            <button class="delete-btn" onclick="deleteItem(${index})">Delete</button>
        </div>
    `).join('');
}

async function uploadImages() {
    const input = document.getElementById('imageUpload');
    for(let file of input.files) {
        const formData = new FormData();
        formData.append('image', file);
        try {
            const response = await fetch('/api/upload/image', {
                method: 'POST',
                body: formData
            });
            if(response.ok) {
                state.carousel.push({
                    image: file.name,
                    caption: '',
                    isVideo: file.type.startsWith('video/')
                });
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    }
    await saveCarouselData();
    showStatus('Files uploaded successfully!');
    input.value = '';
}

// Music functions
async function loadMusicData() {
    try {
        const response = await fetch('/api/music');
        state.music = await response.json();
        renderMusicData();
    } catch (error) {
        console.error('Error loading music data:', error);
    }
}

function renderMusicData() {
    const regularPlaylist = document.getElementById('regularPlaylist');
    const initialPool = document.getElementById('initialPool');

    regularPlaylist.innerHTML = state.music.songs.map((song, index) => `
        <div class="music-item">
            <input type="text" value="${song.title}" onchange="updateSongTitle('songs', ${index}, this.value)">
            <button class="delete-btn" onclick="deleteSong('songs', ${index})">Delete</button>
        </div>
    `).join('');

    initialPool.innerHTML = state.music.initialPool.map((song, index) => `
        <div class="music-item">
            <input type="text" value="${song.title}" onchange="updateSongTitle('initialPool', ${index}, this.value)">
            <button class="delete-btn" onclick="deleteSong('initialPool', ${index})">Delete</button>
        </div>
    `).join('');
}

async function uploadMusic() {
    const input = document.getElementById('musicUpload');
    for(let file of input.files) {
        const formData = new FormData();
        formData.append('music', file);
        try {
            const response = await fetch('/api/upload/music', {
                method: 'POST',
                body: formData
            });
            if(response.ok) {
                state.music.songs.push({
                    src: `music/${file.name}`,
                    title: file.name.replace('.mp3', '')
                });
            }
        } catch (error) {
            console.error('Error uploading music:', error);
        }
    }
    await saveMusicData();
    showStatus('Music uploaded successfully!');
    input.value = '';
}

// Intro text functions
async function loadIntroData() {
    try {
        const response = await fetch('/api/intro-text');
        state.introText = await response.json();
        renderIntroText();
        document.getElementById('textSize').value = state.introText.textSize;
        document.getElementById('initialDelay').value = state.introText.initialDelay;
        document.getElementById('delayBetween').value = state.introText.delayBetweenSentences;
    } catch (error) {
        console.error('Error loading intro text:', error);
    }
}

function renderIntroText() {
    const container = document.getElementById('introTextList');
    container.innerHTML = state.introText.sentences.map((text, index) => `
        <div class="intro-text-item">
            <input type="text" value="${text}" onchange="updateIntroText(${index}, this.value)">
            <button class="move-btn" onclick="moveIntroText(${index}, ${index - 1})" ${index === 0 ? 'disabled' : ''}>↑</button>
            <button class="move-btn" onclick="moveIntroText(${index}, ${index + 1})" ${index === state.introText.sentences.length - 1 ? 'disabled' : ''}>↓</button>
            <button class="delete-btn" onclick="deleteIntroText(${index})">Delete</button>
        </div>
    `).join('');
}

// Save functions
async function saveCarouselData() {
    try {
        await fetch('/api/carousel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state.carousel)
        });
        renderCarouselItems();
        showStatus('Carousel data saved!');
    } catch (error) {
        console.error('Error saving carousel data:', error);
    }
}

async function saveMusicData() {
    try {
        await fetch('/api/music', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state.music)
        });
        renderMusicData();
        showStatus('Music data saved!');
    } catch (error) {
        console.error('Error saving music data:', error);
    }
}

async function saveIntroSettings() {
    state.introText.textSize = parseInt(document.getElementById('textSize').value);
    state.introText.initialDelay = parseInt(document.getElementById('initialDelay').value);
    state.introText.delayBetweenSentences = parseInt(document.getElementById('delayBetween').value);
    
    try {
        await fetch('/api/intro-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state.introText)
        });
        showStatus('Intro settings saved!');
    } catch (error) {
        console.error('Error saving intro settings:', error);
    }
}

// Utility functions
function addIntroText() {
    state.introText.sentences.push('New text');
    renderIntroText();
}

function updateOrder(oldIndex, newIndex) {
    if (newIndex >= 0 && newIndex < state.carousel.length) {
        const item = state.carousel.splice(oldIndex, 1)[0];
        state.carousel.splice(newIndex, 0, item);
        saveCarouselData();
    }
}

function moveItem(oldIndex, newIndex) {
    if (newIndex >= 0 && newIndex < state.carousel.length) {
        const item = state.carousel.splice(oldIndex, 1)[0];
        state.carousel.splice(newIndex, 0, item);
        saveCarouselData();
    }
}

function updateCaption(index, newCaption) {
    state.carousel[index].caption = newCaption;
    saveCarouselData();
}

function deleteItem(index) {
    if(confirm('Are you sure you want to delete this item?')) {
        state.carousel.splice(index, 1);
        saveCarouselData();
    }
}

function updateSongTitle(listType, index, newTitle) {
    state.music[listType][index].title = newTitle;
    saveMusicData();
}

function deleteSong(listType, index) {
    if(confirm('Are you sure you want to delete this song?')) {
        state.music[listType].splice(index, 1);
        saveMusicData();
    }
}

function updateIntroText(index, newText) {
    state.introText.sentences[index] = newText;
    saveIntroSettings();
}

function moveIntroText(oldIndex, newIndex) {
    if (newIndex >= 0 && newIndex < state.introText.sentences.length) {
        const text = state.introText.sentences.splice(oldIndex, 1)[0];
        state.introText.sentences.splice(newIndex, 0, text);
        saveIntroSettings();
    }
}

function deleteIntroText(index) {
    if(confirm('Are you sure you want to delete this text?')) {
        state.introText.sentences.splice(index, 1);
        saveIntroSettings();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCarouselData();
    loadMusicData();
    loadIntroData();
});