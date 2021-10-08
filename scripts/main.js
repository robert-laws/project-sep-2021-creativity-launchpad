// arrays for holding resource data
const resourcesList = []; // initial list of resources loaded from JSON file
let filteredResourcesList = []; // reusable list of resources that is a filtered version of resourcesList
let sortState = '';

// page elements
const siteContainer = document.querySelector('#site-container'); // container for all the resources
const cardsContainer = document.querySelector('#cards-container'); // container for all the cards
const cardsTotal = document.querySelector('#cards-total'); // total number of cards

const filterButton = document.querySelector('#filter-button'); // button to filter resources
const aToZButton = document.querySelector('#a-to-z-button'); // button to sort resources in alphabetical order
const resourcesSearchInput = document.querySelector('#resources-search'); // input for searching resources
const clearSearchButton = document.querySelector('#clear-search'); // button to clear search input

const sidePanel = document.querySelector('#side-panel'); // side panel for filter options
const resetFiltersButton = document.querySelector('#reset-filters-button');

// initial data load of resources
const getResourceData = async () => {
  const response = await fetch('./data/resources.json');
  const data = await response.json();
  resourcesList.pushWithEvent(...data.resources);
  filteredResourcesList.push(...data.resources);
};

// card template for resource cards
const cardTemplate = ({ id, resource_image, title, short_description }) => {
  return `
    <div class="card">
      <a href="resource.html">
        <figure>
          <img src="images/${resource_image}" alt="" />
          <figcaption>
            <h5 class="bold">${title}</h5>
            <p>${short_description}</p>
          </figcaption>
        </figure>
      </a>
    </div>
  `;
};

// add custom listener for array events on the resourcesList array
Array.prototype.listeners = {};
Array.prototype.addListener = function (event, callback) {
  if (!this.listeners[event]) {
    this.listeners[event] = [];
  }
  this.listeners[event].push(callback);
};

Array.prototype.pushWithEvent = function () {
  const size = this.length;
  const argsList = Array.prototype.slice.call(arguments);
  for (let index = 0; index < argsList.length; index++) {
    this[size + index] = argsList[index];
  }
  this.triggerEvent('add', argsList);
};

Array.prototype.triggerEvent = function (eventName, elements) {
  if (this.listeners[eventName] && this.listeners[eventName].length) {
    this.listeners[eventName].forEach((callback) =>
      callback(eventName, elements, this)
    );
  }
};

// update cards within the DOM
const addCardsArrayToDOM = (arrayList) => {
  cardsContainer.innerHTML = arrayList.join('');
};

resourcesList.addListener('add', (items, args) => {
  const cards = buildCards(args);
  addCardsArrayToDOM(cards);
  updateTotalCards(cards.length);
});

// transformation of resource data into cards
const buildCards = (resourcesData) => {
  const cards = resourcesData.map(
    ({ id, resource_image, title, short_description }) => {
      return cardTemplate({ id, resource_image, title, short_description });
    }
  );

  updateTotalCards(cards.length);

  return cards;
};

// update the total number of cards for display
const updateTotalCards = (total) => {
  cardsTotal.innerHTML = `${total} Total Resources`;
};

// remove all cards from the cards container
const clearCards = () => {
  cardsContainer.innerHTML = '';
};

// sort resources alphabetically
const sortCardsAtoZ = () => {
  let sortedResourcesList = [];
  if (sortState === 'desc' || sortState === '') {
    if (filteredResourcesList.length > 0) {
      sortedResourcesList = sortList(filteredResourcesList, 'asc');
    } else {
      sortedResourcesList = sortList(resourcesList, 'asc');
    }
    sortState = 'asc';
  } else {
    if (filteredResourcesList.length > 0) {
      sortedResourcesList = sortList(filteredResourcesList, 'desc');
    } else {
      sortedResourcesList = sortList(resourcesList, 'desc');
    }
    sortState = 'desc';
  }

  updateSortButton(sortState);
  clearCards();
  filteredResourcesList = sortedResourcesList;
  const cards = buildCards(filteredResourcesList);
  cardsContainer.innerHTML = cards.join('');
};

const sortList = (list, order) => {
  if (order === 'asc') {
    return list.sort((a, b) => {
      if (a.title > b.title) {
        return 1;
      } else {
        return -1;
      }
    });
  } else {
    return list.sort((a, b) => {
      if (a.title > b.title) {
        return -1;
      } else {
        return 1;
      }
    });
  }
};

const updateSortButton = (order) => {
  if (order === 'asc') {
    aToZButton.style.backgroundColor = 'rgb(248, 224, 142)';
    aToZButton.innerHTML = 'Sorted A - Z';
  } else {
    aToZButton.style.backgroundColor = 'rgb(248, 224, 142)';
    aToZButton.innerHTML = 'Sorted Z - A';
  }
};

// side panel toggle to hide and show
const handleToggle = (e) => {
  const toggleMenu = () => sidePanel.classList.toggle('side-panel-open');
  if (!sidePanel.classList.contains('side-panel-open')) {
    toggleMenu();
    addOffClick(e, toggleMenu);
  }
};

const addOffClick = (e, callback) => {
  const offClick = (event) => {
    if (e !== event) {
      callback();
      siteContainer.removeEventListener('click', offClick);
    }
  };
  siteContainer.addEventListener('click', offClick);
};

// add event listeners to filter button
filterButton.addEventListener('click', handleToggle);

// add event listeners to reset filter options
resetFiltersButton.addEventListener('click', (e) => {
  e.preventDefault();
  const filterCheckboxes = document.querySelectorAll(
    '.side-panel .option-item input[type="checkbox"]'
  );
  filterCheckboxes.forEach((checkbox) => {
    checkbox.checked = false;
    triggerElementEvent(checkbox, 'change');
  });
});

const triggerElementEvent = (element, eventName) => {
  const event = new Event(eventName);
  element.dispatchEvent(event);
};

// add event listeners to aToZ button
aToZButton.addEventListener('click', (e) => {
  e.preventDefault();
  sortCardsAtoZ();
});

resourcesSearchInput.addEventListener('input', (e) => {
  let search = e.target.value;
  searchResources(search);
});

clearSearchButton.addEventListener('click', (e) => {
  e.preventDefault();
  resourcesSearchInput.value = '';
  triggerElementEvent(resourcesSearchInput, 'input');
});

// filter process [TO BE REFACTORED]
let filterCategoryConditions = [];
let filterProjectTypeConditions = [];

const checkCategoryFilters = (event) => {
  filterCategoryConditions = [];
  const checkboxes = document.querySelectorAll(event.currentTarget.myParam);

  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      let category = checkbox.id.split('-');
      category = category.slice(0, category.length - 1).join(' ');
      filterCategoryConditions.push(category);
    }
  });

  applyFilters();
};

const checkProductTypeFilters = () => {
  const checkboxes = document.querySelectorAll(
    '.project-type-filter-options input[type="checkbox"]'
  );

  filterProjectTypeConditions = [];

  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      let projectType = checkbox.id.split('-');
      projectType = projectType.slice(0, projectType.length - 1).join(' ');
      filterProjectTypeConditions.push(projectType);
    }
  });

  applyFilters();
};

const applyFilters = () => {
  let appliedFilters = [];
  let categoryFilters = [];
  let projectTypeFilters = [];

  if (
    filterCategoryConditions.length === 0 &&
    filterProjectTypeConditions.length === 0
  ) {
    appliedFilters = resourcesList;
  } else {
    categoryFilters = resourcesList.filter((resource) => {
      return filterCategoryConditions.includes(resource.category);
    });

    projectTypeFilters = resourcesList.filter((resource) => {
      return resource.projects.some((project) => {
        return filterProjectTypeConditions.includes(project);
      });
    });

    if (
      filterCategoryConditions.length > 0 &&
      filterProjectTypeConditions.length > 0
    ) {
      appliedFilters = categoryFilters.filter((resource) => {
        return projectTypeFilters.includes(resource);
      });
    } else {
      appliedFilters = categoryFilters.concat(projectTypeFilters);
    }
  }

  clearCards();
  filteredResourcesList = appliedFilters;
  filteredResourcesList = sortList(filteredResourcesList, sortState);
  const cards = buildCards(filteredResourcesList);
  cardsContainer.innerHTML = cards.join('');
};

const searchResources = (search) => {
  let searchMatches = [];

  if (search.length > 0) {
    searchMatches = filteredResourcesList.filter((resource) => {
      return resource.title.toLowerCase().includes(search.toLowerCase());
    });

    clearCards();
    filteredResourcesList = searchMatches;
    filteredResourcesList = sortList(filteredResourcesList, sortState);
    const cards = buildCards(filteredResourcesList);
    cardsContainer.innerHTML = cards.join('');
  } else {
    applyFilters();
  }
};

// add event listeners for category filter options
(function () {
  const domLocation = '.category-filter-options input[type="checkbox"]';
  const checkboxes = document.querySelectorAll(domLocation);

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', checkCategoryFilters);
    checkbox.myParam = domLocation;
  });
})();

// add event listeners for project type filter options
(function () {
  const checkboxes = document.querySelectorAll(
    '.project-type-filter-options input[type="checkbox"]'
  );

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', checkProductTypeFilters);
  });
})();

getResourceData();
