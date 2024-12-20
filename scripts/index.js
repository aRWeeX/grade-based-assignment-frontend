import {
  mapRawCocktailData,
  toggleButtons,
  renderTags,
  renderIngredients,
  createSearchCard,
  setupResultsContainer,
  paginateResults,
  renderPage,
  setupPageNavigation,
} from "./utilities.js";

setTimeout(() => {
  document.querySelector(".loader").style.display = "none";
  document.querySelector(".content").style.display = "flex";
}, 3000);

const baseUrl = "https://www.thecocktaildb.com/api/json/v1/";
const apiKey = "1";

async function fetchRandomCocktail() {
  const randomCocktailUrl = `${baseUrl}${apiKey}/random.php`;

  try {
    const response = await fetch(randomCocktailUrl);

    if (!response.ok) {
      throw new Error(`Error fetching random cocktail: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.drinks || data.drinks.length === 0) {
      return null;
    }

    const rawCocktailData = data.drinks[0];
    const mappedCocktailData = mapRawCocktailData(rawCocktailData);

    return mappedCocktailData;
  } catch (error) {
    console.error("Error fetching random cocktail:", error.message);
    return null;
  }
}

async function fetchCocktail(cocktailName) {
  const searchCocktailUrl = `${baseUrl}${apiKey}/search.php?s=${cocktailName}`;

  try {
    const response = await fetch(searchCocktailUrl);

    if (!response.ok) {
      throw new Error(
        `Error fetching cocktail ${cocktailName}: ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.drinks || data.drinks.length === 0) {
      return [];
    }

    const rawCocktailData = data.drinks;
    const mappedCocktailData = rawCocktailData.map(mapRawCocktailData);

    return mappedCocktailData;
  } catch (error) {
    console.error(`Error fetching cocktail ${cocktailName}:`, error.message);
    return [];
  }
}

document.addEventListener("click", async (event) => {
  const cardDetailsContainer = document.querySelector(
    ".content-card.card-details"
  );
  const newCocktailButton = event.target.closest(".new-cocktail");
  const addFavoriteButton = document.querySelector(".add-favorite");
  const seeMoreButton = event.target.closest(".see-more");

  if (newCocktailButton) {
    try {
      toggleButtons(
        [newCocktailButton, addFavoriteButton, seeMoreButton],
        true
      );

      const isCardContentVisible =
        cardDetailsContainer?.classList.contains("visible");

      const cocktail = await fetchRandomCocktail();

      if (cocktail) {
        generateCocktailCard(cocktail);

        const newCardDetailsContainer = document.querySelector(
          ".content-card.card-details"
        );

        if (newCardDetailsContainer) {
          newCardDetailsContainer.classList.toggle(
            "visible",
            isCardContentVisible
          );
        }
      }
    } catch (error) {
      console.error("Error fetching new cocktail:", error.message);
    } finally {
      toggleButtons(
        [newCocktailButton, addFavoriteButton, seeMoreButton],
        false
      );
    }
  } else if (seeMoreButton) {
    cardDetailsContainer?.classList.toggle("visible");
  }
});

const form = document.querySelector(".search-container > form");
const inputCocktailName = document.querySelector(
  '.search-fields > input[name="search-cocktail"]'
);
let debounceTimeout;

form.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();

    clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(async () => {
      const inputData = inputCocktailName.value.trim();

      if (inputData) {
        const cocktail = await fetchCocktail(inputData);

        if (cocktail && cocktail.length) {
          generateSearchCard(cocktail);
          form.reset();
        }
      }
    }, 300);
  }
});

const formSearchClick = document.querySelector(".search-submit");

formSearchClick.addEventListener("click", async (event) => {
  event.preventDefault();

  const inputData = inputCocktailName.value.trim();

  if (inputData) {
    const cocktail = await fetchCocktail(inputData);

    if (cocktail && cocktail.length) {
      generateSearchCard(cocktail);
      form.reset();
    }
  }
});

const formSearchExpand = document.querySelector(".search-expand");

formSearchExpand.addEventListener("click", (event) => {
  event.preventDefault();

  const inputs = document.querySelectorAll(".search-input.additional");

  const areInputsVisible = Array.from(inputs).some((input) =>
    input.classList.contains("visible")
  );

  inputs.forEach((input) => {
    input.classList.toggle("visible", !areInputsVisible);
  });
});

export function generateCocktailCard(cocktail) {
  const cardHtml = `
    <div class="content-card cocktail">
      <div class="card-icons">
        <span class="material-symbols-outlined new-cocktail" title="New cocktail">
          refresh
        </span>
        <span class="material-symbols-outlined add-favorite" title="Add favorite">
          star
        </span>
        <span class="material-symbols-outlined see-more" title="See more">
          keyboard_arrow_right
        </span>
      </div>
      <h2>${cocktail.name}</h2>
      <img src="${cocktail.thumbnail}" alt="${cocktail.name}" />
      <div class="content-card card-details">${generateCardDetails(
        cocktail
      )}</div>
    </div>
  `;

  const content = document.querySelector(".content");
  content.innerHTML = cardHtml;
}

function generateCardDetails(cocktail) {
  return `
    <p><b>Category:</b> ${cocktail.category}</p>
    ${renderTags(cocktail.tags)}
    <p><b>Instructions:</b> ${cocktail.instructions}</p>
    <p><b>Ingredients:</b></p>
    <ul>
      ${renderIngredients(cocktail.ingredients)}
    </ul>
    <p><b>Glass:</b> ${cocktail.glass}</p>
  `;
}

function generateSearchCard(searchString) {
  const contentContainer = document.querySelector(".content");
  let searchCardContent = document.querySelector(".content-card.search");

  if (!searchCardContent) {
    searchCardContent = createSearchCard();
    contentContainer.appendChild(searchCardContent);
  }

  const searchCardResults = setupResultsContainer(searchCardContent);

  if (Array.isArray(searchString)) {
    const itemsPerPage = 10;
    const paginatedResults = paginateResults(searchString, itemsPerPage);
    let currentPageIndex = 0;

    renderPage(paginatedResults[currentPageIndex], searchCardResults);

    if (paginatedResults.length > 1) {
      setupPageNavigation(searchCardContent, (direction) => {
        if (direction === "backward" && currentPageIndex > 0) {
          currentPageIndex--;
        } else if (
          direction === "forward" &&
          currentPageIndex < paginatedResults.length - 1
        ) {
          currentPageIndex++;
        }

        searchCardResults.innerHTML = "";
        renderPage(paginatedResults[currentPageIndex], searchCardResults);

        const backwardButton =
          searchCardContent.querySelector("#page-backward");
        const forwardButton = searchCardContent.querySelector("#page-forward");

        backwardButton.style.color =
          currentPageIndex === 0 ? "transparent" : "";
        backwardButton.style.pointerEvents =
          currentPageIndex === 0 ? "none" : "auto";

        forwardButton.style.color =
          currentPageIndex === paginatedResults.length - 1 ? "transparent" : "";
        forwardButton.style.pointerEvents =
          currentPageIndex === paginatedResults.length - 1 ? "none" : "auto";
      });
    }
  }
}

(async () => {
  const cocktail = await fetchRandomCocktail();

  if (cocktail) {
    generateCocktailCard(cocktail);
  }
})();
