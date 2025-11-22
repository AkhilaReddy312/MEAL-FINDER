// 1. TOGGLE MENU


const toggleBtn = document.getElementById("toggleBtn");
const closeBtn = document.getElementById("closeBtn");
const sidebar = document.getElementById("sidebar");

if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
        sidebar.style.right = "0px";
    });
}

if (closeBtn) {
    closeBtn.addEventListener("click", () => {
        sidebar.style.right = "-300px";
    });
}



// 2. API LINKS

const CATEGORIES_API = "https://www.themealdb.com/api/json/v1/1/categories.php";
const SEARCH_API = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
const FILTER_API = "https://www.themealdb.com/api/json/v1/1/filter.php?c=";
const DETAILS_API = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";



// 3. LOAD CATEGORIES ON HOMEPAGE

const loadCategories = async () => {
    const box = document.getElementById("categoryList");
    const sideList = document.getElementById("sideList");

    if (!box) return;

    const res = await fetch(CATEGORIES_API);
    const data = await res.json();
    const categories = data.categories;

    categories.forEach(category => {
        box.innerHTML += `
            <div class="card" onclick="openCategory('${category.strCategory}')">
                <img src="${category.strCategoryThumb}">
                <p>${category.strCategory}</p>
            </div>
        `;

        if (sideList) {
            sideList.innerHTML += `
                <li onclick="openCategory('${category.strCategory}')">
                    ${category.strCategory}
                </li>
            `;
        }
    });
};

loadCategories();



// 4. OPEN CATEGORY PAGE

const openCategory = (name) => {
    window.location.href = `category.html?c=${name}`;
};



// 5. LOAD MEALS BY CATEGORY 

const loadMealsByCategory = async () => {
    const title = document.getElementById("catTitle");
    const list = document.getElementById("mealList");

    if (!title || !list) return;

    const params = new URLSearchParams(window.location.search);
    const categoryName = params.get("c");

    title.innerText = categoryName;

    const res = await fetch(FILTER_API + categoryName);
    const data = await res.json();
    const meals = data.meals;

    meals.forEach(meal => {
        list.innerHTML += `
            <div class="card" onclick="openMeal('${meal.idMeal}')">
                <img src="${meal.strMealThumb}">
                <p>${meal.strMeal}</p>
            </div>
        `;
    });
};

loadMealsByCategory();



// 6. OPEN MEAL DETAILS PAGE

const openMeal = (id) => {
    window.location.href = `meal.html?id=${id}`;
};



// 7. LOAD MEAL DETAILS 

const loadMealDetails = async () => {
    const box = document.getElementById("mealDetails");
    if (!box) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const res = await fetch(DETAILS_API + id);
    const data = await res.json();
    const meal = data.meals[0];

    box.innerHTML = `
        <h2>${meal.strMeal}</h2>
        <img src="${meal.strMealThumb}" style="width:300px;border-radius:10px">
        <p><b>Category:</b> ${meal.strCategory}</p>
        <p style="margin-top:15px;"><b>Instructions:</b><br>${meal.strInstructions}</p>
    `;
};

loadMealDetails();


// 8. SEARCH FUNCTION (Homepage)

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
