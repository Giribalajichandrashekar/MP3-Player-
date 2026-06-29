const audio = document.getElementById('myAudio');
const playPauseBtn = document.getElementById('playPauseBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const timerDisplay = document.getElementById('timerDisplay');
const hoursInput = document.getElementById('hoursInput');
const minutesInput = document.getElementById('minutesInput');
const secondsInput = document.getElementById('secondsInput');
const playlistInput = document.getElementById('playlistInput');
const playlistDisplay = document.getElementById('playlistDisplay');

let timerInterval;
let timeLeft = calculateTimeInSeconds();
let isPlaying = false;
let playlist = [];
let currentTrackIndex = 0;
let timerRunning = false;
let isShuffled = false;

function calculateTimeInSeconds() {
    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;
    return (hours * 3600) + (minutes * 60) + seconds;
}

function updateTimerDisplay() {
    let totalSeconds = timeLeft;
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (!timerRunning) {
        timerRunning = true;
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerRunning = false;
                audio.pause();
                isPlaying = false;
                playPauseBtn.textContent = 'Play';
                timeLeft = 0;
                updateTimerDisplay();
                alert("Timer ended! Audio paused.");
            }
        }, 1000);
    }
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
}

function loadTrack(trackIndex) {
    if (trackIndex >= 0 && trackIndex < playlist.length) {
        currentTrackIndex = trackIndex;
        audio.src = playlist[trackIndex].url;
        audio.load();
        highlightCurrentTrack();
    }
}

function playTrack() {
    if (playlist.length > 0) {
        audio.play();
        playPauseBtn.textContent = 'Pause';
        isPlaying = true;
        if (!timerRunning) {
            startTimer();
        }
        highlightCurrentTrack();
    }
}

function pauseAudio() {
    audio.pause();
    playPauseBtn.textContent = 'Play';
    isPlaying = false;
    pauseTimer();
}

function playNextTrack() {
    currentTrackIndex++;
    if (currentTrackIndex >= playlist.length) {
        currentTrackIndex = 0; // Loop back to the beginning of the playlist
    }
    loadTrack(currentTrackIndex);
    playTrack();
}

function playPreviousTrack() {
    currentTrackIndex--;
    if (currentTrackIndex < 0) {
        currentTrackIndex = playlist.length - 1; // Loop to the end of the playlist
    }
    loadTrack(currentTrackIndex);
    playTrack();
}


function highlightCurrentTrack() {
    document.querySelectorAll('#playlistDisplay li').forEach(item => item.classList.remove('active'));
    const currentPlaylistItem = playlistDisplay.children[currentTrackIndex];
    if (currentPlaylistItem) {
        currentPlaylistItem.classList.add('active');
    }
}

function shufflePlaylist() {
    if (playlist.length <= 1) return;

    isShuffled = true;

    const shuffledPlaylist = [...playlist];

    for (let i = shuffledPlaylist.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPlaylist[i], shuffledPlaylist[j]] = [shuffledPlaylist[j], shuffledPlaylist[i]];
    }

    playlist = shuffledPlaylist;
    currentTrackIndex = 0;
    updatePlaylistDisplay();
}

function updatePlaylistDisplay() {
    playlistDisplay.innerHTML = '';
    playlist.forEach((track, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = track.name;
        listItem.addEventListener('click', () => {
            loadTrack(index);
            playTrack();
        });
        playlistDisplay.appendChild(listItem);
    });
}


playPauseBtn.addEventListener('click', () => {
    if (!isPlaying) {
        if (playlist.length > 0) {
            timeLeft = calculateTimeInSeconds();
            updateTimerDisplay();
            if (!audio.src) {
                loadTrack(currentTrackIndex);
            }
            playTrack();
        } else {
            alert("Please select audio files to create a playlist.");
        }
    } else {
        pauseAudio();
    }
});

shuffleBtn.addEventListener('click', () => {
    if (playlist.length > 0) {
        shufflePlaylist();
        loadTrack(0);
        playTrack();
    } else {
        alert("Please select audio files to create a playlist first to shuffle.");
    }
});

prevBtn.addEventListener('click', () => {
    if (playlist.length > 0) {
        playPreviousTrack();
    } else {
        alert("Please select audio files to create a playlist first.");
    }
});

nextBtn.addEventListener('click', () => {
    if (playlist.length > 0) {
        playNextTrack();
    } else {
        alert("Please select audio files to create a playlist first.");
    }
});


audio.addEventListener('ended', () => {
    playNextTrack();
});

playlistInput.addEventListener('change', (event) => {
    playlist = [];
    playlistDisplay.innerHTML = '';
    isShuffled = false;
    const files = event.target.files;
    if (files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileURL = URL.createObjectURL(file);
            playlist.push({ url: fileURL, name: file.name });

            const listItem = document.createElement('li');
            listItem.textContent = file.name;
            listItem.addEventListener('click', () => {
                loadTrack(i);
                playTrack();
            });
            playlistDisplay.appendChild(listItem);
        }

        if (playlist.length > 0) {
            loadTrack(0);
        }
    }
});

// Initialize timer display on page load
updateTimerDisplay();

// --- Keyboard Shortcut Handling ---
document.addEventListener('keydown', function(event) {
    if (playlist.length > 0) { // Only handle keys if there's a playlist loaded
        switch (event.code) {
            case 'MediaTrackPrevious': // Media Previous Track key
            case 'ArrowLeft':         // Left Arrow Key (Alternative)
                playPreviousTrack();
                break;
            case 'MediaTrackNext':     // Media Next Track key
            case 'ArrowRight':        // Right Arrow Key (Alternative)
                playNextTrack();
                break;
        }
    }
});