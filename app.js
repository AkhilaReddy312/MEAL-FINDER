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

const categoriesCache = {
    list: null
};

const fetchCategoriesOnce = async () => {
    if (categoriesCache.list) return categoriesCache.list;
    try {
        const res = await fetch(CATEGORIES_API);
        const data = await res.json();
        categoriesCache.list = data?.categories || [];
        return categoriesCache.list;
    } catch (err) {
        console.error("Failed to fetch categories:", err);
        categoriesCache.list = [];
        return categoriesCache.list;
    }
};


// 2. HELPERS: meals rendering

const mealsHeading = document.getElementById("mealsHeading");
const mealsContainer = document.getElementById("mealsList");
const categoryBox = document.getElementById("categoryList");

function renderMeals(meals) {
    if (!mealsContainer) return;

    // Unhide meals section if hidden (keeps previous behavior)
    const mealsSection = document.getElementById('mealsSection');
    if (mealsSection) mealsSection.style.display = '';
    else {
        const mh = document.getElementById('mealsHeading');
        const ml = document.getElementById('mealsList');
        if (mh) mh.classList.remove('hidden');
        if (ml) ml.classList.remove('hidden');
    }

    mealsContainer.innerHTML = "";

    if (!meals || meals.length === 0) {
        mealsContainer.innerHTML = "<p style='grid-column:1/-1;padding:16px;'>No meals found.</p>";
        return;
    }

    meals.forEach(meal => {
        // only show origin when the API actually provides it
        const originRaw = meal.strArea;
        const origin = originRaw && originRaw.trim() !== "" ? originRaw.trim() : null;

        // build origin HTML only if origin exists
        const originHtml = origin ? `<div class="origin">${origin}</div>` : "";

        mealsContainer.innerHTML += `
            <div class="card" onclick="window.location.href='meal.html?id=${encodeURIComponent(meal.idMeal)}'">
                <img src="${meal.strMealThumb}" alt="${(meal.strMeal || '')}">
                <p class="cat-badge">${meal.strCategory || ''}</p>

                <div class="card-info">
                    ${originHtml}
                    <div class="title">${meal.strMeal || ''}</div>
                </div>
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

const openCategory = async (name) => {
    const pathname = window.location.pathname;
    const onIndex = pathname.endsWith('/') || pathname.endsWith('/index.html') || pathname.endsWith('index.html');

    if (onIndex && mealsContainer && mealsHeading) {
        // 1) get category descriptions (cached)
        const categories = await fetchCategoriesOnce();
        const found = categories.find(c => c.strCategory.toLowerCase() === String(name).toLowerCase());

        // 2) create/update description box above meals section
        let descBox = document.getElementById('categoryDescription');
        if (!descBox) {
            descBox = document.createElement('div');
            descBox.id = 'categoryDescription';
            descBox.className = 'category-description';
            const mealsSection = document.getElementById('mealsSection') || document.querySelector('section#mealsSection') || document.querySelector('section .section');
            if (mealsSection && mealsSection.parentNode) {
                mealsSection.parentNode.insertBefore(descBox, mealsSection);
            } else {
                document.body.insertBefore(descBox, document.body.firstChild);
            }
        }

        descBox.innerHTML = `
      <h3 class="cat-desc-title">${found ? found.strCategory : name}</h3>
      <p class="cat-desc-text">${found ? (found.strCategoryDescription || "No description available.") : "No description available."}</p>
    `;

        // ensure meals area is visible
        const mealsSection = document.getElementById('mealsSection');
        if (mealsSection) mealsSection.style.display = '';

        // 3) fetch and render meals for the category
        try {
            const res = await fetch(FILTER_API + encodeURIComponent(name));
            const data = await res.json();
            renderMeals(data?.meals || []);
        } catch (err) {
            console.error("Failed to load category meals:", err);
            if (mealsContainer) mealsContainer.innerHTML = "<p>Could not load meals. Try again later.</p>";
        }

        // scroll to the description so user sees it
        descBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }

    // fallback for non-index pages
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

    // fetch categories once to get the description
    const categories = await fetchCategoriesOnce();
    const found = categories.find(c => c.strCategory.toLowerCase() === String(categoryName).toLowerCase());

    // create or update description element just below title
    let descBox = document.getElementById('categoryDescription');
    if (!descBox) {
        descBox = document.createElement('div');
        descBox.id = 'categoryDescription';
        descBox.className = 'category-description';
        title.parentNode.insertBefore(descBox, title.nextSibling);
    }

    descBox.innerHTML = `
    <h3 class="cat-desc-title">${found ? found.strCategory : categoryName}</h3>
    <p class="cat-desc-text">${found ? (found.strCategoryDescription || "No description available.") : "No description available."}</p>
  `;

    // now fetch meals for the category and render them in the grid
    try {
        const res = await fetch(FILTER_API + encodeURIComponent(categoryName));
        const data = await res.json();
        const meals = data?.meals || [];
        list.innerHTML = "";
        meals.forEach(meal => {
            list.innerHTML += `
        <div class="card" onclick="openMeal('${meal.idMeal}')">
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
          <div class="card-info">
            <div class="origin">${meal.strArea || ''}</div>
            <div class="title">${meal.strMeal}</div>
          </div>
        </div>
      `;
        });
    } catch (err) {
        console.error("Failed to load meals by category:", err);
        list.innerHTML = "<p>Could not load meals. Try again later.</p>";
    }
};

if (window.location.pathname.endsWith('category.html')) {
    loadMealsByCategory();
}



// 6. OPEN MEAL DETAILS PAGE
const openMeal = (id) => {
    window.location.href = `meal.html?id=${encodeURIComponent(id)}`;
};





// 7. LOAD MEAL DETAILS 

const loadMealDetails = async () => {
    // run only when on meal.html
    if (!window.location.pathname.endsWith('meal.html') && !window.location.pathname.endsWith('/meal.html')) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const breadcrumb = document.getElementById("breadcrumb");
    const detailsBox = document.getElementById("mealDetails");

    if (!id) {
        if (detailsBox) detailsBox.innerHTML = "<p>No meal id provided.</p>";
        return;
    }

    try {
        const res = await fetch(DETAILS_API + encodeURIComponent(id));
        const data = await res.json();
        const meal = data?.meals?.[0];

        if (!meal) {
            if (detailsBox) detailsBox.innerHTML = "<p>Meal not found.</p>";
            return;
        }

        // breadcrumb
        if (breadcrumb) {
            breadcrumb.innerHTML = `<div class="breadcrumb-inner"><span class="home-pill">🏠</span>&nbsp;&nbsp; ${meal.strMeal} ${meal.strArea ? '(' + meal.strArea + ')' : ''}</div>`;
        }

        // ingredients + measures
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ing = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ing && ing.trim()) {
                ingredients.push({ ingredient: ing.trim(), measure: (measure || '').trim() });
            }
        }

        const tags = meal.strTags ? meal.strTags.split(',').map(t => t.trim()).filter(Boolean) : [];
        const metaSource = meal.strSource || meal.strYoutube || '';

        // build HTML
        detailsBox.innerHTML = `
      <div class="meal-grid">
        <div class="meal-left">
          <div class="meal-image-wrap"><img src="${meal.strMealThumb || ''}" alt="${(meal.strMeal || 'Meal')}"></div>

          <div class="measure-box" aria-label="Measures">
            ${ingredients.map(i => `
              <div class="measure-row">
                <div class="measure-left">${i.measure || ''}</div>
                <div class="measure-right">${i.ingredient}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <aside class="meal-right">
          <div class="meta-box">
            <p><strong>Category:</strong> ${meal.strCategory || ''}</p>
            <p><strong>Area:</strong> ${meal.strArea || ''}</p>
            <p><strong>Source:</strong> ${metaSource ? `<a href="${metaSource}" target="_blank" rel="noopener noreferrer">${metaSource.replace(/^https?:\/\//, '')}</a>` : ''}</p>
            <p><strong>Tags:</strong> ${tags.length ? tags.map(t => `<span class="pill">${t}</span>`).join(' ') : 'none'}</p>
          </div>

          <div class="ingredients-box" aria-label="Ingredients">
            <h4>Ingredients</h4>
            <ul class="ingredients-list">
              ${ingredients.map(i => `<li>${i.ingredient}</li>`).join('')}
            </ul>
          </div>
        </aside>
      </div>

      <section class="instructions-section">
        <h3>Instructions</h3>
        <div class="instructions">
          ${(meal.strInstructions || '').split(/\r?\n\r?\n/).map(p => `<p>${p.replace(/\r?\n/g, ' ')}</p>`).join('')}
        </div>
      </section>
    `;

        // scroll to breadcrumb so hero remains visible above
        if (breadcrumb) breadcrumb.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
        console.error("Failed to load meal details:", err);
        if (detailsBox) detailsBox.innerHTML = "<p>Failed to load meal details.</p>";
    }
};

// call it (no-op on other pages)
loadMealDetails();


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
