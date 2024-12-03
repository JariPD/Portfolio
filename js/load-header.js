// Ensure header loads before executing other scripts
document.addEventListener('DOMContentLoaded', () => {
    const headerPlaceholder = document.getElementById('header');
    
    if (headerPlaceholder) {
      fetch('/header.html')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.text();
        })
        .then(data => {
          headerPlaceholder.innerHTML = data;
          
          // Add hamburger menu event listener after header is loaded
          const hamburger = document.getElementById('hamburger');
          if (hamburger) {
            hamburger.addEventListener('click', function() {
              document.querySelector('.nav-links').classList.toggle('active');
            });
          }
        })
        .catch(error => {
          console.error('Error loading header:', error);
          headerPlaceholder.innerHTML = '<p>Error loading header</p>';
        });
    }
  });