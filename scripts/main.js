// Main JavaScript File
let resourcesList = [];

const resourceCards = document.querySelector('#cards-section');
const clearCardsButton = document.querySelector('#clear-cards');
const aToZButton = document.querySelector('#a-to-z-cards');
const filterButton = document.querySelector('#filter-button');

const getResourceData = async () => {
  const response = await fetch('./data/resources.json');
  const data = await response.json();
  const cardsList = buildCards(data.resources);
  const htmlCards = cardsList.join('');
  resourceCards.innerHTML = htmlCards;
};

// const getData = async () => {
//   try {
//     const response = await fetch(
//       'https://jsonplaceholder.typicode.com/todos/1'
//     );
//     const data = await response.json();
//     console.log(data);
//   } catch (err) {
//     console.log(err);
//   }
// };

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

const initResourceData = (data) => {
  resourcesList = data;
  buildResourceCards(addCards);
};

const initResourceCards = (addCardsToPage) => {
  resourcesList.forEach((resource) => {
    const newCard = buildResourceCard(resource);
    addCardsToPage(newCard);
  });
};

const buildResourceCards = (addCardsToPage) => {
  data.forEach((resource) => {
    const newCard = buildResourceCard(resource);
    addCardsToPage(newCard);
  });
};

const sortCardsAtoZ = () => {
  const sortedResourceList = resourcesList.sort((a, b) => {
    if (a.title > b.title) {
      return 1;
    } else {
      return -1;
    }
  });

  clearCards();
  buildResourceCards(sortedResourceList, addCards);
};

const filterCards = (filterOption) => {
  const filteredResourceList = resourcesList.filter((resource) => {
    return resource.category === filterOption;
  });

  clearCards();
  buildResourceCards(filteredResourceList, addCards);
};

const buildResourceCard = (resource) => {
  const card = document.createElement('div');
  card.setAttribute('class', 'card');

  const cardLink = document.createElement('a');
  cardLink.setAttribute('href', 'resource.html');

  const cardFigure = document.createElement('figure');

  const cardImage = document.createElement('img');
  cardImage.setAttribute('src', `images/${resource.resource_image}`);
  cardImage.setAttribute('alt', 'card');

  const cardCaption = document.createElement('figcaption');

  const cardCaptionTitle = document.createElement('h5');
  const cardCaptionTitleText = document.createTextNode(resource.title);
  cardCaptionTitle.appendChild(cardCaptionTitleText);

  const cardCaptionParagraph = document.createElement('p');
  const cardCaptionParagraphText = document.createTextNode(
    resource.short_description
  );
  cardCaptionParagraph.appendChild(cardCaptionParagraphText);

  cardCaption.appendChild(cardCaptionTitle);
  cardCaption.appendChild(cardCaptionParagraph);

  cardFigure.appendChild(cardImage);
  cardFigure.appendChild(cardCaption);

  cardLink.appendChild(cardFigure);

  card.appendChild(cardLink);

  return card;
};

const addCards = (newCard) => {
  resourceCards.appendChild(newCard);
};

const clearCards = () => {
  resourceCards.innerHTML = '';
};

clearCardsButton.addEventListener('click', clearCards);

aToZButton.addEventListener('click', sortCardsAtoZ);

filterButton.addEventListener('click', () => {
  filterCards('audio');
});

getResourceData();
