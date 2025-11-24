// 1. TOGGLE MENU


const toggleBtn = document.getElementById('toggleBtn');
const closeBtn = document.getElementById('closeBtn');
const sidebar = document.getElementById('sidebar');
const sideList = document.getElementById('sideList');

// create overlay element if not present
let sidebarOverlay = document.getElementById('sidebarOverlay');
if (!sidebarOverlay) {
    sidebarOverlay = document.createElement('div');
    sidebarOverlay.id = 'sidebarOverlay';
    document.body.appendChild(sidebarOverlay);
}

function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('visible');
    if (closeBtn) closeBtn.classList.remove('black'); // cross orange when opened
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
}

function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('visible');
    if (closeBtn) closeBtn.classList.add('black'); // cross black when closed
    document.body.style.overflow = '';
    if (toggleBtn) toggleBtn.focus();
}

// Toggle open/close with hamburger
if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        // open if closed, otherwise close
        if (sidebar && sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });
}

// Close button
if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        // immediate visual feedback then close
        closeBtn.classList.add('black');
        closeSidebar();
    });
}

// Clicking overlay closes
sidebarOverlay.addEventListener('click', closeSidebar);

// ESC closes
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
});

// Clicking category in sidebar: delegate to <li> and redirect
if (sideList) {
    sideList.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (!li) return;
        const category = li.textContent.trim();
        if (!category) return;
        // navigate to category page
        window.location.href = `category.html?c=${encodeURIComponent(category)}`;
        closeSidebar();
    });
}


// 1. API LINKS

const CATEGORIES_API = "https://www.themealdb.com/api/json/v1/1/categories.php";
const SEARCH_API = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
const FILTER_API = "https://www.themealdb.com/api/json/v1/1/filter.php?c=";
const DETAILS_API = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";


// 2. HELPERS: meals rendering

const mealsHeading = document.getElementById("mealsHeading");
const mealsContainer = document.getElementById("mealsList");
const categoryBox = document.getElementById("categoryList");

function renderMeals(meals) {
    if (!mealsContainer) return;
    mealsContainer.innerHTML = "";

    if (!meals || meals.length === 0) {
        mealsContainer.innerHTML = "<p style='grid-column:1/-1;padding:16px;'>No meals found.</p>";
        return;
    }

    meals.forEach(meal => {
        mealsContainer.innerHTML += `
            <div class="card" onclick="window.location.href='meal.html?id=${meal.idMeal}'">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <p class="cat-badge">${meal.strCategory || ''}</p>
                <div class="title">${meal.strMeal}</div>
            </div>
        `;
    });

    if (mealsHeading) mealsHeading.textContent = "MEALS";
    if (mealsContainer) mealsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}



// 3. LOAD CATEGORIES ON HOMEPAGE

const loadCategories = async () => {
    if (!categoryBox) return;

    try {
        const res = await fetch(CATEGORIES_API);
        const data = await res.json();
        const categories = data?.categories || [];

        categoryBox.innerHTML = ""; // clear
        if (sideList) sideList.innerHTML = ""; // clear

        categories.forEach(category => {
            categoryBox.innerHTML += `
                <div class="card" onclick="openCategory('${category.strCategory}')">
                    <img src="${category.strCategoryThumb}" alt="${category.strCategory}">
                    <p class="cat-badge">${category.strCategory}</p>
                    <div class="title">${category.strCategory}</div>
                </div>
            `;

            if (sideList) {
                // create <li> (click handler is delegated above)
                const li = document.createElement('li');
                li.textContent = category.strCategory;
                sideList.appendChild(li);
            }
        });
    } catch (err) {
        console.error("Failed loading categories:", err);
    }
};

loadCategories();



// 4. OPEN CATEGORY PAGE

const openCategory = (name) => {
    const pathname = window.location.pathname;
    const onIndex = pathname.endsWith('/') || pathname.endsWith('/index.html') || pathname.endsWith('index.html');

    if (onIndex && mealsContainer && mealsHeading) {
        fetch(FILTER_API + encodeURIComponent(name))
            .then(res => res.json())
            .then(data => renderMeals(data.meals))
            .catch(err => {
                console.error("Failed to load category meals:", err);
                if (mealsContainer) mealsContainer.innerHTML = "<p>Could not load meals. Try again later.</p>";
            });
        return;
    }

    window.location.href = `category.html?c=${encodeURIComponent(name)}`;
};



// 5. LOAD MEALS BY CATEGORY 

const loadMealsByCategory = async () => {
    const title = document.getElementById("catTitle");
    const list = document.getElementById("mealList");
    if (!title || !list) return;

    const params = new URLSearchParams(window.location.search);
    const categoryName = params.get("c") || "";
    title.innerText = categoryName;

    try {
        const res = await fetch(FILTER_API + encodeURIComponent(categoryName));
        const data = await res.json();
        const meals = data?.meals || [];
        list.innerHTML = "";
        meals.forEach(meal => {
            list.innerHTML += `
                <div class="card" onclick="openMeal('${meal.idMeal}')">
                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                    <div class="title">${meal.strMeal}</div>
                </div>
            `;
        });
    } catch (err) {
        console.error("Failed to load meals by category:", err);
    }
}

if (window.location.pathname.endsWith('category.html')) {
    loadMealsByCategory();
}



// 6. OPEN MEAL DETAILS PAGE
const openMeal = (id) => {
    window.location.href = `meal.html?id=${encodeURIComponent(id)}`;
};





// 7. LOAD MEAL DETAILS 

const loadMealDetails = async () => {
    const box = document.getElementById("mealDetails");
    if (!box) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) { box.innerHTML = "<p>No meal id provided.</p>"; return; }

    try {
        const res = await fetch(DETAILS_API + encodeURIComponent(id));
        const data = await res.json();
        const meal = data?.meals?.[0];
        if (!meal) { box.innerHTML = "<p>Meal not found.</p>"; return; }

        box.innerHTML = `
            <h2>${meal.strMeal}</h2>
            <img src="${meal.strMealThumb}" style="width:300px;border-radius:10px">
            <p><b>Category:</b> ${meal.strCategory}</p>
            <p style="margin-top:15px;"><b>Instructions:</b><br>${meal.strInstructions}</p>
        `;
    } catch (err) {
        console.error("Failed to load meal details:", err);
    }
};
if (window.location.pathname.endsWith('meal.html')) {
    loadMealDetails();
}


// 8. SEARCH FUNCTION 

const searchBtn = document.getElementById("searchBtn");
if (searchBtn) {
    searchBtn.addEventListener("click", async () => {
        const text = document.getElementById("searchInput").value.trim();
        if (!text) return;

        try {
            const res = await fetch(SEARCH_API + encodeURIComponent(text));
            const data = await res.json();

            if (!data?.meals || data.meals.length === 0) {
                if (mealsContainer) {
                    mealsContainer.innerHTML = `<div class="no-results">NO FOODS FOUND...</div>`;
                    mealsHeading.textContent = "MEALS";
                    mealsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                return;
            }

            renderMeals(data.meals);
        } catch (err) {
            console.error("Search failed:", err);
        }
    });

    document.getElementById("searchInput").addEventListener("keydown", (e) => {
        if (e.key === "Enter") searchBtn.click();
    });
}

function goHome() {
    window.location.href = "index.html";
}
