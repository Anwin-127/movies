// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyDlAbn6xcqhr7LqmBi-EItdM0FkuyDdMTs",
    authDomain: "yourmovies-6813e.firebaseapp.com",
    projectId: "yourmovies-6813e",
    storageBucket: "yourmovies-6813e.appspot.com",
    messagingSenderId: "778214503696",
    appId: "1:778214503696:web:8086c0e24f253e1fa0a195",
    measurementId: "G-NDC02KKDRD"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Login Functionality
document.getElementById('login').addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password).then(userCredential => {
        document.getElementById('auth').style.display = 'none';
        document.getElementById('movie-app').style.display = 'block';

        // Load movies after login
        loadMovies();
    }).catch(error => alert(error.message));
});

// Sign Up Functionality
document.getElementById('signup').addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.createUserWithEmailAndPassword(email, password).then(userCredential => {
        alert('User Created Successfully');
    }).catch(error => alert(error.message));
});

// Add Movie Functionality
document.getElementById('add-movie').addEventListener('click', () => {
    const movieName = document.getElementById('movie-name').value;
    const movieGenre = document.getElementById('movie-genre').value;
    const movieRating = document.getElementById('movie-rating').value;
    const user = auth.currentUser;

    if (user && movieName && movieGenre && movieRating) {
        db.collection('movies').add({
            userId: user.uid,
            name: movieName,
            genre: movieGenre,
            rating: parseInt(movieRating), // Rating out of 5
        }).then(() => {
            alert('Movie Added');
            loadMovies(); // Load movies after adding
        }).catch(error => alert(error.message));
    }
});

// Load Movies for the Authenticated User and Categorize by Genre
function loadMovies() {
    const user = auth.currentUser;
    if (user) {
        db.collection('movies').where('userId', '==', user.uid).get().then(snapshot => {
            const movieList = document.getElementById('movie-list');
            movieList.innerHTML = ''; // Clear existing entries

            const genres = {}; // Object to hold movies categorized by genre

            snapshot.forEach(doc => {
                const movieData = doc.data();
                if (!genres[movieData.genre]) {
                    genres[movieData.genre] = [];
                }
                genres[movieData.genre].push({ id: doc.id, ...movieData });
            });

            // Display movies grouped by genre
            for (let genre in genres) {
                const genreSection = document.createElement('div');
                genreSection.innerHTML = `<h3>${genre}</h3>`;
                genres[genre].forEach(movie => {
                    const movieElement = document.createElement('div');
                    movieElement.className = 'movie-card';
                    movieElement.innerHTML = `
                        <p><strong>${movie.name}</strong></p>
                        <p>Rating: ${getStarRating(movie.rating)}</p>
                        <button onclick="editMovie('${movie.id}', '${movie.name}', '${movie.rating}')">Edit</button>
                        <button onclick="deleteMovie('${movie.id}')">Delete</button>
                    `;
                    genreSection.appendChild(movieElement);
                });
                movieList.appendChild(genreSection);
            }
        });
    }
}

// Convert rating to stars (for a 5-star system)
function getStarRating(rating) {
    const totalStars = 5; // Now a 5-star system
    const fullStars = Math.floor(rating);
    const emptyStars = totalStars - fullStars;
    return '★'.repeat(fullStars) + '☆'.repeat(emptyStars); // Full stars and empty stars
}

// Edit Movie Functionality
function editMovie(movieId, movieName, movieRating) {
    const newMovieName = prompt('Edit Movie Name', movieName);
    const newMovieRating = prompt('Edit Rating', movieRating);

    if (newMovieName && newMovieRating) {
        db.collection('movies').doc(movieId).update({
            name: newMovieName,
            rating: parseInt(newMovieRating),
        }).then(() => {
            alert('Movie Updated');
            loadMovies();
        }).catch(error => alert(error.message));
    }
}

// Delete Movie Functionality
function deleteMovie(movieId) {
    db.collection('movies').doc(movieId).delete().then(() => {
        alert('Movie Deleted');
        loadMovies();
    }).catch(error => alert(error.message));
}
