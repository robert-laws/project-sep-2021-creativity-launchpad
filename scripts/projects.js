// All projects
// projects page components
const cardsContainer = document.querySelector('#project-cards'); // container for project cards
const cardsTotal = document.querySelector('#cards-total'); // total number of cards

const projectsList = [];

// initial data load of projects, calls a function when the array is changed
const getProjectsData = async () => {
  const response = await fetch('./data/projects.json');

  if (!response.ok) {
    const message = `An error has occurred: ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  return data;
};

const getAllProjectsData = () => {
  getProjectsData()
    .then((allData) => {
      projectsList.pushWithEvent(...allData.projects);
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

projectsList.addListener('add', (items, args) => {
  const cards = buildCards(args);
  updateTotalCards(cards.length);
  addCardsArrayToDOM(cards);
});

// transformation of resource data into cards
const buildCards = (data) => {
  const cards = data.map(({ id, featured_image, title, project_type }) => {
    return cardTemplate(id, featured_image, title, project_type);
  });

  return cards;
};

// update the total number of cards for display
const updateTotalCards = (total) => {
  cardsTotal.innerHTML = `${total} Total Projects`;
};

// update cards within the DOM
const addCardsArrayToDOM = (arrayList) => {
  cardsContainer.innerHTML = arrayList.join('');
};

const cardTemplate = (id, featured_image, title, project_type) => {
  return `
    <div class='card'>
      <a href='project.html?id=${project_type.split(' ').join('-')}'>
        <figure>
          <img src='images/${featured_image}' alt='${title}' />
          <figcaption>
            <h5 class='bold'>${title}</h5>
          </figcaption>
        </figure>
      </a>
    </div>
  `;
};

getAllProjectsData();
