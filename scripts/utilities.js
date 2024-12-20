import { generateCocktailCard } from "./index.js";

/**
 * Då json-objektet som representerar en cocktail är lite
 * halvtokigt utformat av de som utvecklat API:et, så har ni
 * här en hjälpfunktion som konverterar den halvtoiga datan
 * till ett mer lättarbetat objekt istället. Bortrensat är
 * alla ingredienser och measures som är null samt ett antal
 * attribut som ni inte kommer att han någon användning för.
 */
export function mapRawCocktailData(rawCocktail) {
  return {
    id: rawCocktail.idDrink,
    name: rawCocktail.strDrink,
    tags: rawCocktail.strTags ? rawCocktail.strTags.split(",") : [],
    category: rawCocktail.strCategory,
    alcoholic: rawCocktail.strAlcoholic === "Alcoholic",
    glass: rawCocktail.strGlass,
    instructions: rawCocktail.strInstructions,
    thumbnail: rawCocktail.strDrinkThumb,
    ingredients: Array.from({ length: 15 })
      .map((_, index) => ({
        ingredient: rawCocktail[`strIngredient${index + 1}`],
        measure: rawCocktail[`strMeasure${index + 1}`],
      }))
      .filter((item) => item.ingredient),
  };
}

export function toggleButtons(buttons, disabled) {
  buttons.forEach((button) => {
    if (button) {
      button.disabled = disabled;
    }
  });
}

export function renderTags(tags) {
  if (tags && tags.length > 0) {
    return `<p><b>Tags:</b> ${tags.join(", ")}</p>`;
  }

  return "";
}

export function renderIngredients(ingredients) {
  return ingredients
    .map(
      (ingredient) =>
        `<li>${ingredient.ingredient}${
          ingredient.measure ? ` - ${ingredient.measure}` : ""
        }</li>`
    )
    .join("");
}

export function createSearchCard() {
  const searchCard = document.createElement("div");
  searchCard.classList.add("content-card", "search");

  const heading = document.createElement("h3");
  heading.textContent = "Search results:";
  searchCard.appendChild(heading);

  return searchCard;
}

export function setupResultsContainer(searchCardContent) {
  let searchCardResults = searchCardContent.querySelector(".results");

  if (!searchCardResults) {
    searchCardResults = document.createElement("div");
    searchCardResults.classList.add("results");
    searchCardContent.appendChild(searchCardResults);
  } else {
    searchCardResults.innerHTML = "";
  }

  return searchCardResults;
}

export function paginateResults(results, itemsPerPage) {
  results.sort((a, b) => a.name.localeCompare(b.name));

  const paginated = [];

  for (let index = 0; index < results.length; index += itemsPerPage) {
    paginated.push(results.slice(index, index + itemsPerPage));
  }

  return paginated;
}

export function renderPage(results, container) {
  results.forEach((result) => {
    const resultItem = document.createElement("p");
    resultItem.classList.add("result-item");
    resultItem.textContent = result.name;

    resultItem.addEventListener("click", () => {
      generateCocktailCard(result);
    });

    container.appendChild(resultItem);
  });
}

export function setupPageNavigation(container, onClick) {
  let pageNavigation = container.querySelector(".card-icons.search");

  if (!pageNavigation) {
    pageNavigation = document.createElement("div");
    pageNavigation.classList.add("card-icons", "search");

    const pageNavigationBackward = document.createElement("span");

    pageNavigationBackward.classList.add("material-symbols-outlined");
    pageNavigationBackward.id = "page-backward";
    pageNavigationBackward.textContent = "keyboard_arrow_left";

    pageNavigation.appendChild(pageNavigationBackward);

    const pageNavigationForward = document.createElement("span");

    pageNavigationForward.classList.add("material-symbols-outlined");
    pageNavigationForward.id = "page-forward";
    pageNavigationForward.textContent = "keyboard_arrow_right";

    pageNavigation.appendChild(pageNavigationForward);

    container.insertBefore(pageNavigation, container.firstChild);
  }

  pageNavigation.onclick = (event) => {
    if (typeof onClick !== "function") {
      console.error("Page navigation requires a valid callback.");
      return;
    }

    const clickedButton = event.target;

    if (clickedButton.id === "page-backward") {
      onClick("backward");
    } else if (clickedButton.id === "page-forward") {
      onClick("forward");
    }
  };
}
