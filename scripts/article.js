// Article Content
const params = new URLSearchParams(window.location.search);
if (!params.has('id')) {
  window.location.href = '404.html';
}

// resource page components
const articleLeadElement = document.querySelector('#article-lead');
const articleTextElement = document.querySelector('#article-text');

const articleId = params.get('id');
const articlesData = [];

const getArticleData = async (id) => {
  const response = await fetch('./data/articles.json');
  const data = await response.json();
  articlesData.pushWithEvent(
    data.articles.find((article) => article.id === parseInt(id))
  );
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

articlesData.addListener('add', (items, args) => {
  const {
    title,
    sub_title,
    featured_image,
    category,
    pub_date,
    article_content,
  } = args[0];

  articleLeadElement.innerHTML = articleLead(
    title,
    sub_title,
    pub_date,
    category,
    featured_image
  );

  articleTextElement.innerHTML = articleText(article_content);

  updatePageTitle(title);
});

const articleLead = (title, sub_title, pub_date, category, featured_image) => {
  return `
    <span>${category}</span>
    <h1>${title}</h1>
    <h4>${sub_title}</h4>
    <div class="author">
      <p>Published on ${formatDate(pub_date)}</p>
    </div>
    <figure>
      <img
        src="images/${featured_image}"
        alt="${title}"
      />
      <figcaption>Image Source: Unsplash</figcaption>
    </figure>
  `;
};

const articleText = (article_content) => {
  articleFullText = '';

  article_content.forEach((section) => {
    articleFullText += `<h2>${section.section_heading}</h2>`;
    articleFullText += section.paragraphs
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join('');
  });

  return articleFullText;
};

const updatePageTitle = (title) => {
  document.title = `${title} | Resource`;
};

const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

getArticleData(articleId);
