document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("id");

  fetch("/data/projects.json")
    .then((response) => response.json())
    .then((projects) => {
      const project = projects.find((p) => p.id === projectId);

      if (project) {
        // Fill title
        document.title = `${project.title}`;
        document.querySelector("h1").innerText = project.title;

        // Add video
        const videoIframe = document.querySelector(".video-container iframe");
        videoIframe.src = project.videoUrl;

        // Fill project information
        const projectInfo = document.querySelectorAll(".project-info p");
        projectInfo[0].querySelector("span").innerHTML = `<strong>Project Duur:</strong> ${project.duration}`;
        projectInfo[1].querySelector("span").innerHTML = `<strong>Omschrijving:</strong> ${project.description}`;
                   
        // Fill technologies
        const techList = document.querySelector(".tech-list");
        techList.innerHTML = project.technologies
          .map((tech) => `<li>${tech}</li>`)
          .join("");

        // Check if team information is not none
        if (project.team && project.team.length > 0) {
          // Fill team
          const teamList = document.getElementById("project-team");
          teamList.innerHTML = project.team
            .map(
              (member) => `
                    <li><strong>${member.name}:</strong> ${member.role}</li>
                `
            )
            .join("");
        } else {
          // Verberg de teamsectie als er geen teaminformatie is
          document.getElementById("project-team-section").style.display =
            "none";
        }
      } else {
        document.body.innerHTML = "<h1>Project not found</h1>";
      }
    })
    .catch((error) => {
      console.error("Error when trying to load project data:", error);
      document.body.innerHTML = "<h1>Error loading project data.</h1>";
    });
});
