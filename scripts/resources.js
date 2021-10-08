// arrays for holding state data
const resourcesList = []; // initial list of resources loaded from JSON file
let filteredResourcesList = []; // reusable list of resources that is a filtered version of resourcesList
let searchTerms = '';
let sortState = '';

// page elements
// entire visible page container upon loading
const siteContainer = document.querySelector('#site-container'); // container for all the resources

// container for resource cards
const cardsContainer = document.querySelector('#cards-container'); // container for all the cards
const cardsTotal = document.querySelector('#cards-total'); // total number of cards

// button area elements
const filterButton = document.querySelector('#filter-button'); // button to filter resources
const aToZButton = document.querySelector('#a-to-z-button'); // button to sort resources in alphabetical order
const resourcesSearchInput = document.querySelector('#resources-search'); // input for searching resources
const clearSearchButton = document.querySelector('#clear-search'); // button to clear search input

// filter panel elements
const sidePanel = document.querySelector('#side-panel'); // side panel for filter options
const resetFiltersButton = document.querySelector('#reset-filters-button');

// initial data load of resources, calls a function when the array is changed
const getResourceData = async () => {
  const response = await fetch('./data/resources.json');
  const data = await response.json();
  resourcesList.pushWithEvent(...data.resources);
  filteredResourcesList.push(...data.resources);
};

// card template for resource cards
const cardTemplate = (id, resource_image, title, short_description) => {
  return `
    <div class="card">
      <a href="resource.html?id=${id}">
        <figure>
          <img src="images/${resource_image}" alt="${title}" />
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

resourcesList.addListener('add', (items, args) => {
  const cards = buildCards(args);
  updateTotalCards(cards.length);
  addCardsArrayToDOM(cards);
});

// update cards within the DOM
const addCardsArrayToDOM = (arrayList) => {
  cardsContainer.innerHTML = arrayList.join('');
};

// transformation of resource data into cards
const buildCards = (resourcesData) => {
  const cards = resourcesData.map(
    ({ id, resource_image, title, short_description }) => {
      return cardTemplate(id, resource_image, title, short_description);
    }
  );

  return cards;
};

// process changes to list
const processResources = (workingArray) => {
  clearCards();

  filteredResourcesList = workingArray;
  filteredResourcesList = sortList(filteredResourcesList, sortState);
  const cards = buildCards(filteredResourcesList);

  updateTotalCards(cards.length);
  addCardsArrayToDOM(cards);
};

// update the total number of cards for display
const updateTotalCards = (total) => {
  cardsTotal.innerHTML = `${total} Total Resources`;
};

// remove all cards from the cards container
const clearCards = () => {
  cardsContainer.innerHTML = '';
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

// function to trigger events for one event listener from other event
const triggerElementEvent = (element, eventName) => {
  const event = new Event(eventName);
  element.dispatchEvent(event);
};

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

// add event listeners to aToZ button
aToZButton.addEventListener('click', (e) => {
  e.preventDefault();
  sortCardsAtoZ();
});

// search resources
resourcesSearchInput.addEventListener('input', (e) => {
  let search = e.target.value;
  // searchResources(search);
  searchTerms = search;
  checkAllOptions();
});

clearSearchButton.addEventListener('click', (e) => {
  e.preventDefault();
  resourcesSearchInput.value = '';
  triggerElementEvent(resourcesSearchInput, 'input');
});

// filter resources
let filterCategoryConditions = [];
let filterProjectTypeConditions = [];

// loop through all category checkboxes and add checked to array
// REFACTOR
// abstracted version of getting filter checked options
const findCheckedOptions = (event) => {
  checkboxArray = [];
  const checkboxGroup = event.currentTarget.groupName;
  const checkboxes = document.querySelectorAll(event.currentTarget.domName);

  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      let item = checkbox.id.split('-');
      item = item.slice(0, item.length - 1).join(' ');
      checkboxArray.push(item);
    }
  });

  updateFilterConditions(checkboxGroup, checkboxArray);
  checkAllOptions();
};

const updateFilterConditions = (group, array) => {
  if (group === 'category') {
    filterCategoryConditions = array;
  } else if (group === 'project-type') {
    filterProjectTypeConditions = array;
  }
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

  return appliedFilters;
};

// search resources
const searchResources = () => {
  let searchMatches = [];

  if (searchTerms.length > 0) {
    searchMatches = resourcesList.filter((resource) => {
      return resource.title.toLowerCase().includes(searchTerms.toLowerCase());
    });
  }

  return searchMatches;
};

// sort resources alphabetically
const sortCardsAtoZ = () => {
  if (filteredResourcesList.length > 0) {
    if (sortState === 'desc' || sortState === '') {
      sortState = 'asc';
    } else {
      sortState = 'desc';
    }
    updateSortButton(sortState);

    processResources(filteredResourcesList);
  }
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

// add event listeners for category filter options
(function () {
  const domLocation = '.category-filter-options input[type="checkbox"]';
  const checkboxes = document.querySelectorAll(domLocation);

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', findCheckedOptions);
    checkbox.domName = domLocation;
    checkbox.groupName = 'category';
  });
})();

// add event listeners for project type filter options
(function () {
  const domLocation = '.project-type-filter-options input[type="checkbox"]';
  const checkboxes = document.querySelectorAll(domLocation);

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', findCheckedOptions);
    checkbox.domName = domLocation;
    checkbox.groupName = 'project-type';
  });
})();

const checkAllOptions = () => {
  const originalArray = resourcesList;

  const filterResults = applyFilters();
  const searchResults = searchResources(searchTerms);

  if (filterResults.length === 0 && searchResults.length === 0) {
    if (
      filterCategoryConditions.length > 0 ||
      filterProjectTypeConditions.length > 0 ||
      searchTerms.length > 0
    ) {
      filteredResourcesList = [];
    } else {
      filteredResourcesList = originalArray;
    }
  } else if (filterResults.length === 0 && searchResults.length > 0) {
    if (
      filterCategoryConditions.length > 0 ||
      filterProjectTypeConditions.length > 0
    ) {
      filteredResourcesList = [];
    } else {
      filteredResourcesList = searchResults;
    }
  } else if (filterResults.length > 0 && searchResults.length === 0) {
    if (searchTerms.length > 0) {
      filteredResourcesList = [];
    } else {
      filteredResourcesList = filterResults;
    }
  } else {
    filteredResourcesList = filterResults.filter((resource) => {
      return searchResults.includes(resource);
    });
  }

  processResources(filteredResourcesList);
};

getResourceData();
