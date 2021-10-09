const params = new URLSearchParams(window.location.search);
if (!params.has('id')) {
  window.location.href = '404.html';
}

// resource page components
const resourceFeaturedImageElement = document.querySelector(
  '#resource-featured-image'
);
const resourceContentElement = document.querySelector('#resource-content');
const resourceDetailsElement = document.querySelector('#resource-details');
const resourceDetailsImageElement = document.querySelector(
  '#resource-details-image'
);

const resourceId = params.get('id');
const resourcesData = [];

const getResourceData = async () => {
  const response = await fetch('./data/resources.json');
  const data = await response.json();
  return data;
};

const getResourceDataById = (id) => {
  const data = getResourceData(id);
  if (data.length > 0) {
    const resource = data.resources.find(
      (resource) => resource.id === parseInt(id)
    );
    if (resource) {
      resourcesData.pushWithEvent(resource);
    } else {
      window.location.href = '404.html';
    }
  } else {
    window.location.href = '404.html';
  }
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

resourcesData.addListener('add', (items, args) => {
  const {
    id,
    title,
    featured_image,
    long_description,
    category,
    requires_training,
    notes,
    items_included,
    projects,
    secondary_image,
  } = args[0];

  resourceFeaturedImageElement.innerHTML = resourceFeaturedImage(
    id,
    title,
    featured_image
  );

  resourceContentElement.innerHTML = resourceContent(
    id,
    title,
    category,
    projects,
    long_description
  );

  resourceDetailsElement.innerHTML = resourceDetails(
    id,
    category,
    requires_training,
    notes,
    items_included
  );

  resourceDetailsImageElement.innerHTML = resourceDetailsImage(
    id,
    title,
    secondary_image
  );

  updatePageTitle(title);
});

// resource image
const resourceFeaturedImage = (id, title, featured_image) => {
  return `<img id="resource-featured-image-${id}" src='images/${featured_image}' alt='${title}' />`;
};

// card template for resource cards
const resourceContent = (id, title, category, projects, long_description) => {
  return `
    <div id="resource-${id}-content-text" class="resource-content-text">
      <a href="/">
        <h3>${category.toUpperCase()} Category</h3>
      </a>
      <h1 class="xl3">${title}</h1>
      <div class="related-buttons">
        ${getProjectsList(projects)}
      </div>
      <div class="resource-description">
        <p>
          ${long_description}
        </p>
      </div>
    </div>
  `;
};

const resourceDetails = (
  id,
  category,
  requires_training,
  notes,
  items_included
) => {
  return `
    <div id='resource-${id}-details-text' class='resource-details-text'>
      <h2>Resource Details</h2>
      <div class='details-title'>
        <p>Category:</p>
        <p>${category.toUpperCase()}</p>
      </div>
      <div class='details-title'>
        <p>Requires Training:</p>
        <p>
          ${
            requires_training
              ? 'Yes, please speak with the media specialist'
              : 'None'
          }
        </p>
      </div>
      <div class='details-title'>
        <p>Notes:</p>
        <p>${notes}</p>
      </div>
      <div class='details-title'>
        <p>Items Included:</p>${getItemsIncluded(items_included)}
      </div>
    </div>
  `;
};

const resourceDetailsImage = (id, title, secondary_image) => {
  return `
    <figure id='resource-${id}-details-image' class="resource-details-image-container">
      <img src="images/${secondary_image}" alt="${title}" />
      <figcaption>Image Source: Unsplash</figcaption>
    </figure>
    `;
};

const getProjectsList = (projects) => {
  let projectsList = '';

  if (projects.length > 0) {
    projectsList += '<h6>Featured in Projects</h6>';
    projects.forEach((project) => {
      projectsList += `<a class="button tag green" href="project.html?project=${project
        .split(' ')
        .join('-')}">${project.toUpperCase()}</a>`;
    });
  }

  return projectsList;
};

const getItemsIncluded = (items_included) => {
  let itemsIncluded = '';

  if (items_included.length > 0) {
    itemsIncluded += '<ul>';
    items_included.forEach((item) => {
      itemsIncluded += `<li>${item}</li>`;
    });
    itemsIncluded += '</ul>';
  } else {
    itemsIncluded += '<p>None</p>';
  }

  return itemsIncluded;
};

const updatePageTitle = (title) => {
  document.title = `${title} | Resource`;
};

getResourceDataById(resourceId);
