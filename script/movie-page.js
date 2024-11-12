const apiKey = 'baa24f5d3068edb8016f1a0ea1ce3382'; 
const apiUrl = 'https://api.themoviedb.org/3';
const searchBox = document.querySelector('.search-box');
const suggestionsBox = document.getElementById('suggestions');
const searchResultsContainer = document.getElementById('search-results-container');
const searchResults = document.getElementById('search-results');
const searchButton = document.querySelector('.search-button');
const favoritesPopup = document.getElementById('favoritesPopup');
const favoritesList = document.getElementById('favoritesList');
const favoriteButton = document.getElementById('addToFavoriteButton');
let currentMovies = []; 
let currentMovieId = null; 

searchButton.addEventListener('click', handleSearch);
favoriteButton.addEventListener('click', toggleFavorite);


async function fetchMovies(query) {
    const response = await fetch(`${apiUrl}/search/movie?api_key=${apiKey}&query=${query}`);
    const data = await response.json();
    return data.results;
}

async function fetchMovieDetails(movieId) {
    const response = await fetch(`${apiUrl}/movie/${movieId}?api_key=${apiKey}`);
    return response.json();
}

function displayResults(movies) {
    searchResults.innerHTML = '';
    movies.forEach(movie => {
        const resultItem = document.createElement('div');
        resultItem.classList.add('search-result-item');
        resultItem.innerHTML = `
            <img src="${movie.poster_path ? `https://image.tmdb.org/t/p/w154${movie.poster_path}` : 'placeholder.jpg'}" alt="">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <p>Дата выпуска: ${movie.release_date || 'Неизвестно'}</p>
                <p>Рейтинг: ${movie.vote_average || 'N/A'}</p>
            </div>
        `;
        resultItem.onclick = () => openDetails(movie.id);
        searchResults.appendChild(resultItem);
    });
    searchResultsContainer.style.display = 'block';
}

async function handleSearch() {
    const query = searchBox.value.trim();
    if (query) {
        currentMovies = await fetchMovies(query);
        displayResults(currentMovies);
    }
}

async function openDetails(movieId) {
    const movie = await fetchMovieDetails(movieId);
    document.getElementById('movieTitle').textContent = movie.title || 'Название неизвестно';
    document.getElementById('movieDescription').textContent = movie.overview || 'Описание отсутствует';
    currentMovieId = movieId;
    updateFavoriteButton(movieId);
    document.getElementById('popup').style.display = 'flex';
}

function closeDetails() {
    document.getElementById('popup').style.display = 'none';
}

function toggleFavorite() {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (favorites.includes(currentMovieId)) {
        favorites = favorites.filter(id => id !== currentMovieId);
    } else {
        favorites.push(currentMovieId);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteButton(currentMovieId);
}

function openFav() {
    viewFavorites();
}


function updateFavoriteButton(movieId) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favoriteButton.textContent = favorites.includes(movieId) ? 'Удалить из избранного' : 'Добавить в избранное';
}

async function viewFavorites() {
    favoritesList.innerHTML = '';
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    for (const movieId of favorites) {
        const movie = await fetchMovieDetails(movieId);
        const favoriteItem = document.createElement('div');
        favoriteItem.classList.add('search-result-item');
        favoriteItem.innerHTML = `
            <img src="${movie.poster_path ? `https://image.tmdb.org/t/p/w154${movie.poster_path}` : 'placeholder.jpg'}" alt="">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <p>Дата выпуска: ${movie.release_date || 'Неизвестно'}</p>
                <p>Рейтинг: ${movie.vote_average || 'N/A'}</p>
            </div>
        `;
        favoriteItem.onclick = () => openDetails(movieId);
        favoritesList.appendChild(favoriteItem);
    }
    favoritesPopup.style.display = 'flex';
}

function closeFavorites() {
    favoritesPopup.style.display = 'none';
}

function sortResults(criteria) {
    const sortedMovies = [...currentMovies].sort((a, b) => {
        if (criteria === 'release_date') return new Date(b.release_date) - new Date(a.release_date);
        if (criteria === 'vote_average') return b.vote_average - a.vote_average;
    });
    displayResults(sortedMovies);
}

searchBox.addEventListener('input', async () => {
    const query = searchBox.value.trim();
    if (query) {
        const movies = await fetchMovies(query);
        displaySuggestions(movies.slice(0, 5));
    } else {
        suggestionsBox.style.display = 'none';
    }
});

function displaySuggestions(movies) {
    suggestionsBox.innerHTML = '';
    movies.forEach(movie => {
        const suggestionItem = document.createElement('div');
        suggestionItem.classList.add('suggestion-item');
        suggestionItem.innerHTML = `
            <img src="${movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : 'placeholder.jpg'}" alt="">
            <div><strong>${movie.title}</strong><br><small>${movie.release_date || 'Unknown'}</small></div>
        `;
        suggestionsBox.appendChild(suggestionItem);
    });
    suggestionsBox.style.display = 'block';
}

document.addEventListener('click', (event) => {
    if (!suggestionsBox.contains(event.target) && event.target !== searchBox) {
        suggestionsBox.style.display = 'none';
    }
});
favoriteButton.addEventListener('click', (e) => {
    e.stopPropagation(); 
    toggleFavorite();
});

document.querySelector('.favorite-button').addEventListener('click', viewFavorites);
