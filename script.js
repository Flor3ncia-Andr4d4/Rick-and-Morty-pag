const charactersContainer = document.getElementById("characters-container");
const paginationContainer = document.getElementById("pagination");
const totalCountElement = document.getElementById("total-count");
const currentPageElement = document.getElementById("current-page");
const totalPageElement = document.getElementById("total-pages");
const genderButtons = document.querySelectorAll(".gender-button");
let currentPage = 1;
let currentGender = null; //  null para representar todos los géneros al inicio

async function getCharacters(page = 1, gender = null) {
  //  si se debe aplicar el filtro de género
  const genderQueryParam = gender ? `&gender=${gender}` : "";
  const response = await fetch(
    `https://rickandmortyapi.com/api/character/?page=${page}${genderQueryParam}`
  );
  const data = await response.json();
  return data;
}

async function getCharacterLocation(locationURL) {
  const response = await fetch(locationURL);
  const data = await response.json();
  return data.name;
}

async function getCharacterEpisode(episodeURL) {
  const response = await fetch(episodeURL);
  const data = await response.json();
  return data.name;
}

async function createCharacterCard(character) {
  const characterCard = document.createElement("div");
  characterCard.className = "character-card";
  characterCard.innerHTML = `
    <h2>${character.name}</h2>
    <img src="${character.image}" alt="${character.name}">
    <p>Género: ${character.gender}</p>
    <p>Especie: ${character.species}</p>
    <p>Estado: ${character.status}</p>
    <p>Origen: ${character.origin.name}</p>
    <p>Locación: <span id="location-${character.id}">${character.location.name}</span></p>
    <p>Episodio: <span id="episode-${character.id}">${character.episode[0]}</span></p>
    <button class="view-more-button" data-url="${character.url}">Ver más</button>
  `;
  charactersContainer.appendChild(characterCard);

  // Obtener y mostrar el nombre de la locación para el personaje
  getCharacterLocation(character.location.url)
    .then((locationName) => {
      const locationElement = document.getElementById(
        `location-${character.id}`
      );
      locationElement.textContent = locationName;
    })
    .catch((error) => console.log(error));

  // Obtener y mostrar el nombre del episodio para el personaje
  getCharacterEpisode(character.episode[0])
    .then((episodeName) => {
      const episodeElement = document.getElementById(`episode-${character.id}`);
      episodeElement.textContent = episodeName;
    })
    .catch((error) => console.log(error));
}

async function showCharacters(page, gender) {
  charactersContainer.innerHTML = "";
  const data = await getCharacters(page, gender);
  const characters = data.results;
  characters.forEach(createCharacterCard);

  // Actualizar el número total de personajes
  const totalCountElement = document.getElementById("total-count");
  totalCountElement.textContent = data.info.count;

  // Actualizar el número total de páginas para la paginación
  const totalPages = data.info.pages;
  updatePaginationButtons(totalPages);

  // Mostrar la información de paginación
  const currentPageElement = document.getElementById("current-page");
  currentPageElement.textContent = page;

  const totalPageElement = document.getElementById("total-pages");
  totalPageElement.textContent = totalPages;
}

function updatePaginationButtons(totalPages) {
  paginationContainer.innerHTML = "";
  const firstButton = createPaginationButton("«", 1, currentPage === 1);
  const prevButton = createPaginationButton(
    "<",
    currentPage - 1,
    currentPage === 1
  );
  const nextButton = createPaginationButton(
    ">",
    currentPage + 1,
    currentPage === totalPages
  );
  const lastButton = createPaginationButton(
    "»",
    totalPages,
    currentPage === totalPages
  );

  paginationContainer.appendChild(firstButton);
  paginationContainer.appendChild(prevButton);

  if (currentPage < totalPages) {
    paginationContainer.appendChild(nextButton);
  }

  paginationContainer.appendChild(lastButton);
}

function createPaginationButton(text, page, disabled) {
  const button = document.createElement("button");
  button.className = "pagination-button";
  button.innerText = text;
  button.disabled = disabled; // Deshabilitar el botón si está en la primera o última página
  if (disabled) {
    button.classList.add("disabled"); // Agregar clase CSS "disabled" al botón deshabilitado
  }
  button.addEventListener("click", () => {
    currentPage = page;
    showCharacters(currentPage, currentGender);
  });
  return button;
}

async function viewCharacterDetail(characterURL) {
  try {
    const character = await getCharacterDetail(characterURL);
    alert(`
      Nombre: ${character.name}
      Género: ${character.gender}
      Especie: ${character.species}
      Estado: ${character.status}
      Origen: ${character.origin.name}
      Locación: ${character.location.name}
    `);
  } catch (error) {
    console.log(error);
  }
}

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("view-more-button")) {
    const characterURL = event.target.getAttribute("data-url");
    viewCharacterDetail(characterURL);
  } else if (event.target.classList.contains("gender-button")) {
    // Si se hace clic en un botón de género, se obtiene el género correspondiente
    const gender = event.target.getAttribute("data-gender");

    // Si el género seleccionado es diferente al género actual, actualizamos el filtro de género
    if (gender === "all") {
      currentGender = null;
    } else {
      // Si se hace clic en otro botón de género, actualizar el filtro de género
      currentGender = gender;
    }

    currentPage = 1;
    showCharacters(currentPage, currentGender);
  }
});

// Mostrar todos los personajes al cargar la página
currentGender = null; // Establecer el filtro de género a null
showCharacters(currentPage, currentGender);
