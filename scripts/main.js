// Main JavaScript File
const resourceCards = document.querySelector('#cards-section');

const getResourceData = async () => {
  const response = await fetch('./data/resources.json');
  const data = await response.json();
  buildResourceCards(data, addCards);
};

const buildResourceCards = (data, addCardsToPage) => {
  data.resources.map((resource) => {
    const newCard = buildResourceCard(resource);
    addCardsToPage(newCard);
  });
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

getResourceData();
