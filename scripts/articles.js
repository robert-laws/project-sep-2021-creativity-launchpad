// All Articles
// articles page components
const cardsContainer = document.querySelector('#article-cards'); // container for project cards
const cardsTotal = document.querySelector('#cards-total'); // total number of cards

const articlesList = [];

// initial data load of projects, calls a function when the array is changed
const getArticlesData = async () => {
  const response = await fetch('./data/articles.json');

  if (!response.ok) {
    const message = `An error has occurred: ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  return data;
};

const getAllArticlesData = () => {
  getArticlesData()
    .then((allData) => {
      articlesList.pushWithEvent(...allData.articles);
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

articlesList.addListener('add', (items, args) => {
  const cards = buildCards(args);
  updateTotalCards(cards.length);
  addCardsArrayToDOM(cards);
});

// transformation of resource data into cards
const buildCards = (data) => {
  const cards = data.map(
    ({ id, featured_image, title, pub_date, category }) => {
      return cardTemplate(id, featured_image, title, pub_date, category);
    }
  );

  return cards;
};

// update the total number of cards for display
const updateTotalCards = (total) => {
  cardsTotal.innerHTML = `${total} Total Articles`;
};

// update cards within the DOM
const addCardsArrayToDOM = (arrayList) => {
  cardsContainer.innerHTML = arrayList.join('');
};

const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const cardTemplate = (id, featured_image, title, pub_date, category) => {
  return `
    <div class='article'>
      <div class='article-content'>
        <span><strong>Category:</strong> ${category}</span>
        <a href='article.html?id=${id}'><h3>${title}</h3></a>
        <h6>Published on ${formatDate(pub_date)}</h6>
        <a href='article.html?id=${id}' class='button yellow'>
          Read More
        </a>
      </div>
      <div class='article-image'>
        <img
          src='images/${featured_image}'
          alt='${title}'
        />
      </div>
    </div>`;
};

getAllArticlesData();
