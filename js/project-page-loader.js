document.addEventListener("DOMContentLoaded", () => {
    const projectsContainer = document.getElementById("projectsContainer");

    fetch("/data/projects.json")
        .then(response => response.json())
        .then(projects => {
            projects.forEach(project => {
                const projectCard = createProjectCard(project);
                projectsContainer.appendChild(projectCard);
            });
        })
        .catch(error => {
            console.error("Error loading project data:", error);
            projectsContainer.innerHTML = "<p>Error loading projects.</p>";
        });
});

function createProjectCard(project) {
    const card = document.createElement("div");
    card.className = "project-card";

    const imageContainer = document.createElement("div");
    imageContainer.className = "project-image-container";

    if (project.imageUrl) {
        const image = document.createElement("img");
        image.className = "project-image";
        image.src = project.imageUrl;
        image.alt = project.title;
        image.onerror = function() {
            this.style.display = 'none';
            imageContainer.classList.add('no-image');
        };
        imageContainer.appendChild(image);
    } else {
        imageContainer.classList.add('no-image');
    }

    const info = document.createElement("div");
    info.className = "project-info";

    const title = document.createElement("h3");
    title.textContent = project.title;

    const description = document.createElement("p");
    description.textContent = project.short_description || "No description available.";

    const date = document.createElement("span");
    date.className = "project-date";
    date.textContent = project.date || "Date not specified";

    info.appendChild(title);
    info.appendChild(description);
    info.appendChild(date);

    card.appendChild(imageContainer);
    card.appendChild(info);

    const link = document.createElement("a");
    link.href = `/pages/project-page.html?id=${project.id}`;
    link.className = "project-link";
    link.appendChild(card);

    return link;
}