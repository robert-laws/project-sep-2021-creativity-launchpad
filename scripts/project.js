// Project
// Article Content
const params = new URLSearchParams(window.location.search);
if (!params.has('id')) {
  window.location.href = '404.html';
}

// resource page components
const projectLeadElement = document.querySelector('#project-lead');
const projectTextElement = document.querySelector('#project-text');

const cardsContainer = document.querySelector('#cards-container'); // container for all the cards
const cardsTotal = document.querySelector('#cards-total'); // total number of cards

const projectType = params.get('id').split('-').join(' ');
const projectData = [];

const getProjectData = async () => {
  const response = await fetch('./data/projects.json');

  if (!response.ok) {
    const message = `An error has occurred: ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  return data;
};

const getRelatedResourcesData = async () => {
  const response = await fetch('./data/resources.json');

  if (!response.ok) {
    const message = `An error has occurred: ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  return data;
};

const getProjectDataById = (projectType) => {
  getProjectData()
    .then((allData) => {
      const data = allData.projects.find(
        (project) => project.project_type === projectType
      );
      if (data) {
        projectData.pushWithEvent(data);
      } else {
        window.location.href = '404.html';
      }

      return projectData;
    })
    .then((data) => {
      const projectType = data[0].project_type;

      getRelatedResourcesData().then((resourcesData) => {
        const relatedResourcesData = resourcesData.resources.filter(
          (resource) => resource.projects.includes(projectType)
        );

        const cards = buildCards(relatedResourcesData);
        updateTotalCards(cards.length);
        addCardsArrayToDOM(cards);
      });
    })
    .catch((error) => {
      document.querySelector('#main-content').innerHTML = `
      <section class='error-section'>
        <h2 class='error-message'>${error.message}</h2>
        <p>Sorry, an error occurred while processing your request.</p>
        <a href="index.html">Return to Homepage</a>
      </section>`;
    });
};

// add custom listener for array events on the articlesList array
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

projectData.addListener('add', (items, args) => {
  const { title, featured_image, description, project_content } = args[0];

  projectLeadElement.innerHTML = projectLead(
    title,
    featured_image,
    description
  );

  projectTextElement.innerHTML = projectText(project_content);

  updatePageTitle(title);
});

// update the total number of cards for display
const updateTotalCards = (total) => {
  cardsTotal.innerHTML = `${total} Total Resources`;
};

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

const projectLead = (title, featured_image, description) => {
  return `
    <h1>${title}</h1>
    <figure>
      <img
        src="images/${featured_image}"
        alt="${title}"
      />
      <figcaption>Image Source: Unsplash</figcaption>
    </figure>
    <h4>${description}</h4>
  `;
};

const projectText = (project_content) => {
  projectFullText = '';

  project_content.forEach((section) => {
    projectFullText += `<h2>${section.section_heading}</h2>`;
    projectFullText += section.paragraphs
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join('');
  });

  return projectFullText;
};

const updatePageTitle = (title) => {
  document.title = `${title} | Project`;
};

getProjectDataById(projectType);
