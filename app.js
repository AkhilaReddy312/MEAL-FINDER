//  1. TOGGLE MENU
const searchBtn = document.getElementById("searchBtn");

if (searchBtn) {
    searchBtn.addEventListener("click", async () => {
        const text = document.getElementById("searchInput").value.trim();
        const box = document.getElementById("categoryList");

        const res = await fetch(SEARCH_API + text);
        const data = await res.json();

        box.innerHTML = "";

        if (!data.meals) {
            box.innerHTML = "<p>No meals found.</p>";
            return;
        }

        data.meals.forEach(meal => {
            box.innerHTML += `
                <div class="card" onclick="openMeal('${meal.idMeal}')">
                    <img src="${meal.strMealThumb}">
                    <p>${meal.strMeal}</p>
                </div>
            `;
        });
    });
}
// 2. API LINKS
const CATEGORIES_API = "https://www.themealdb.com/api/json/v1/1/categories.php";
const SEARCH_API = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
const FILTER_API = "https://www.themealdb.com/api/json/v1/1/filter.php?c=";
const DETAILS_API = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";