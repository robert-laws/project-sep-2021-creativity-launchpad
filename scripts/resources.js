const resourcesList = [];
let filteredResourcesList = [];
const resourcesContainer = document.querySelector('#cards-section');

const aToZButton = document.querySelector('#a-to-z-cards');

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

  return cards;
};

const sortCardsAtoZ = () => {
  const filteredResourcesList = resourcesList.sort((a, b) => {
    if (a.title > b.title) {
      return 1;
    } else {
      return -1;
    }
  });

  clearCards();
  const cards = buildCards(filteredResourcesList);
  resourcesContainer.innerHTML = cards.join('');
};

const clearCards = () => {
  resourcesContainer.innerHTML = '';
};

aToZButton.addEventListener('click', sortCardsAtoZ);

getResourceData();
