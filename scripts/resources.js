const resourcesList = [];
let filteredResourcesList = [];

const siteContainer = document.querySelector('.site-container');
const resourcesContainer = document.querySelector('#cards-section');
const resourcesTotal = document.querySelector('#cards-total');

const filterButton = document.querySelector('#filter-button');
const aToZButton = document.querySelector('#a-to-z-cards');
const clearCardsButton = document.querySelector('#clear-cards');

const sidePanel = document.querySelector('#side-tools');

const audioFilter = document.querySelector('#audio-option');
const videoFilter = document.querySelector('#video-option');
const softwareFilter = document.querySelector('#software-option');
const equipmentFilter = document.querySelector('#equipment-option');

const getResourceData = async () => {
  const response = await fetch('./data/resources.json');
  const data = await response.json();
  resourcesList.pushWithEvent(...data.resources);
};

// https://jsvault.com/array-listener/
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
  resourcesContainer.innerHTML = cards.join('');
});

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

const buildCards = (resourcesData) => {
  const cards = resourcesData.map(
    ({ resource_image, title, short_description }) => {
      return cardTemplate({ resource_image, title, short_description });
    }
  );

  updateTotalCards(cards.length);

  return cards;
};

const updateTotalCards = (total) => {
  resourcesTotal.innerHTML = `${total} Total Resources`;
};

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

const clearCards = () => {
  resourcesContainer.innerHTML = '';
};

const toggleSidePanel = () => {
  if (sidePanel.classList.contains('side-panel-open')) {
    sidePanel.classList.remove('side-panel-open');
  } else {
    sidePanel.classList.add('side-panel-open');
  }
};

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

filterButton.addEventListener('click', handleToggle);

aToZButton.addEventListener('click', sortCardsAtoZ);

clearCardsButton.addEventListener('click', clearCards);

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

    // let categoryResourceIds = new Set(
    //   categoryFilters.map((resource) => resource.id)
    // );
    // appliedFilters = [
    //   ...categoryFilters,
    //   ...projectTypeFilters.filter((resource) => {
    //     return !categoryResourceIds.has(resource.id);
    //   }),
    // ];
  }

  clearCards();
  filteredResourcesList = appliedFilters;
  const cards = buildCards(filteredResourcesList);
  resourcesContainer.innerHTML = cards.join('');
};

// audioFilter.addEventListener('click', (e) => {
//   checkCategoryFilters();
//   // const checked = e.target.checked;
//   // if (checked) {
//   //   filteredResourcesList = resourcesList.filter(
//   //     (resource) => resource.category === 'audio'
//   //   );

//   //   clearCards();
//   //   const cards = buildCards(filteredResourcesList);
//   //   resourcesContainer.innerHTML = cards.join('');
//   // }
// });

// videoFilter.addEventListener('click', (e) => {
//   checkCategoryFilters();
// });

// softwareFilter.addEventListener('click', (e) => {
//   checkCategoryFilters();
// });

(function () {
  const checkboxes = document.querySelectorAll(
    '.category-filter-options input[type="checkbox"]'
  );

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('click', checkCategoryFilters);
  });
})();

(function () {
  const checkboxes = document.querySelectorAll(
    '.project-type-filter-options input[type="checkbox"]'
  );

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('click', checkProductTypeFilters);
  });
})();

getResourceData();
