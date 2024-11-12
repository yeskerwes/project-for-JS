const apiKey = '2f2387e6e7be49778fbebda9053a4185';
const apiUrl = 'https://api.spoonacular.com/recipes/complexSearch';

let favoriteRecipes = JSON.parse(localStorage.getItem('favorites')) || [];

document.getElementById('searchInput').addEventListener('input', searchRecipes);
document.querySelector('.favorite-button').addEventListener('click', showFavoritesList);

async function searchRecipes() {
    const query = document.getElementById('searchInput').value;
    if (!query.trim()) return;

    const response = await fetch(`${apiUrl}?apiKey=${apiKey}&query=${query}`);
    const data = await response.json();
    displayRecipes(data.results);

    localStorage.setItem('currentRecipes', JSON.stringify(data.results));
}

function displayRecipes(recipes) {
    const recipeGrid = document.getElementById('recipeGrid');
    recipeGrid.innerHTML = '';
    if (recipes.length === 0) {
        recipeGrid.innerHTML = '<p>No recipes found. Try a different search.</p>';
        return;
    }

    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        recipeCard.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}" />
            <h3>${recipe.title}</h3>
            <p>Preparation time: ${recipe.readyInMinutes} mins</p>
            <button onclick="viewRecipeDetails(${recipe.id})">View Details</button>
            <button onclick="toggleFavorite(${recipe.id}, '${recipe.title}', '${recipe.image}')">
                ${favoriteRecipes.some(fav => fav.id === recipe.id) ? '★' : '☆'}
            </button>
        `;
        recipeGrid.appendChild(recipeCard);
    });
}

async function viewRecipeDetails(id) {
    const response = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`);
    const recipe = await response.json();
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <h2>${recipe.title}</h2>
        <p>${recipe.summary}</p>
        <h4>Ingredients</h4>
        <ul>${recipe.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('')}</ul>
        <h4>Instructions</h4>
        <p>${recipe.instructions}</p>
        <h4>Nutritional Information</h4>
        <p>Calories: ${recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 'N/A'} kcal</p>
    `;
    document.getElementById('recipeModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('recipeModal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('recipeModal');
    if (event.target == modal) {
        closeModal();
    }
}

function toggleFavorite(id, title, image) {
    const exists = favoriteRecipes.some(recipe => recipe.id === id);
    if (exists) {
        favoriteRecipes = favoriteRecipes.filter(recipe => recipe.id !== id);
    } else {
        favoriteRecipes.push({ id, title, image });
    }
    localStorage.setItem('favorites', JSON.stringify(favoriteRecipes));
    updateFavoriteIcon(id);

    if (document.querySelector('.favorite-button').classList.contains('active')) {
        showFavoritesList();
    }
}

function updateFavoriteIcon(id) {
    document.querySelectorAll(`.recipe-card button`).forEach(button => {
        if (button.onclick && button.onclick.toString().includes(`toggleFavorite(${id},`)) {
            button.innerHTML = favoriteRecipes.some(fav => fav.id === id) ? '★' : '☆';
        }
    });
}

function showFavoritesList() {
    document.querySelector('.favorite-button').classList.add('active');
    const recipeGrid = document.getElementById('recipeGrid');
    recipeGrid.innerHTML = '';

    if (favoriteRecipes.length === 0) {
        recipeGrid.innerHTML = '<p>You have no favorite recipes.</p>';
        return;
    }

    favoriteRecipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        recipeCard.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}" />
            <h3>${recipe.title}</h3>
            <button onclick="viewRecipeDetails(${recipe.id})">View Details</button>
            <button onclick="toggleFavorite(${recipe.id}, '${recipe.title}', '${recipe.image}')">★</button>
        `;
        recipeGrid.appendChild(recipeCard);
    });
}
