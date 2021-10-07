// arrays for holding resource data
const resourcesList = []; // initial list of resources loaded from JSON file
let filteredResourcesList = []; // reusable list of resources that is a filtered version of resourcesList

// page elements
const siteContainer = document.querySelector('#site-container'); // container for all the resources
const resourcesContainer = document.querySelector('#cards-container'); // container for all the resources
const cardsContainer = document.querySelector('#cards-container'); // container for all the cards
const cardsTotal = document.querySelector('#cards-total'); // total number of cards

const filterButton = document.querySelector('#filter-button'); // button to filter resources
const resetFiltersButton = document.querySelector('#reset-filters-button');
const aToZButton = document.querySelector('#a-to-z-button'); // button to sort resources in alphabetical order

const sidePanel = document.querySelector('#side-panel'); // side panel for filter options

// initial data load of resources
const getResourceData = async () => {
  const response = await fetch('./data/resources.json');
  const data = await response.json();
  resourcesList.pushWithEvent(...data.resources);
};

// card template for resource cards
const cardTemplate = ({ resource_image, title, short_description }) => {
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

resourcesList.addListener('add', (items, args) => {
  const cards = buildCards(args);
  cardsContainer.innerHTML = cards.join('');
});

// transformation of resource data into cards
const buildCards = (resourcesData) => {
  const cards = resourcesData.map(
    ({ resource_image, title, short_description }) => {
      return cardTemplate({ resource_image, title, short_description });
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
  resourcesContainer.innerHTML = '';
};

// sort resources alphabetically
const sortCardsAtoZ = () => {
  let sortedResourcesList = [];
  if (filteredResourcesList.length > 0) {
    sortedResourcesList = filteredResourcesList.sort((a, b) => {
      if (a.title > b.title) {
        return 1;
      } else {
        return -1;
      }
    });
  } else {
    sortedResourcesList = resourcesList.sort((a, b) => {
      if (a.title > b.title) {
        return 1;
      } else {
        return -1;
      }
    });
  }

  clearCards();
  filteredResourcesList = sortedResourcesList;
  const cards = buildCards(filteredResourcesList);
  resourcesContainer.innerHTML = cards.join('');
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
    triggerEvent(checkbox, 'change');
  });
});

const triggerEvent = (element, eventName) => {
  const event = new Event(eventName);
  element.dispatchEvent(event);
};

// add event listeners to aToZ button
aToZButton.addEventListener('click', (e) => {
  e.preventDefault();
  sortCardsAtoZ();
});

// filter process [TO BE REFACTORED]
let filterCategoryConditions = [];
let filterProjectTypeConditions = [];

const checkCategoryFilters = () => {
  const checkboxes = document.querySelectorAll(
    '.category-filter-options input[type="checkbox"]'
  );

  filterCategoryConditions = [];

  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      filterCategoryConditions.push(checkbox.id.split('-')[0]);
    }
  });

  console.log(filterCategoryConditions);

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

  console.log(filterProjectTypeConditions);

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
  const cards = buildCards(filteredResourcesList);
  resourcesContainer.innerHTML = cards.join('');
};

// add event listeners for category filter options
(function () {
  const checkboxes = document.querySelectorAll(
    '.category-filter-options input[type="checkbox"]'
  );

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', checkCategoryFilters);
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
