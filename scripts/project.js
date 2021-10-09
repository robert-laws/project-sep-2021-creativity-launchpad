// Project
// Article Content
const params = new URLSearchParams(window.location.search);
if (!params.has('id')) {
  window.location.href = '404.html';
}

// resource page components
const projectLeadElement = document.querySelector('#project-lead');
const projectTextElement = document.querySelector('#project-text');

const projectId = params.get('id');
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

const getProjectDataById = (id) => {
  getProjectData()
    .then((allData) => {
      const data = allData.projects.find(
        (project) => project.id === parseInt(id)
      );
      if (data) {
        projectData.pushWithEvent(data);
      } else {
        window.location.href = '404.html';
      }
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
  document.title = `${title} | Resource`;
};

getProjectDataById(projectId);
