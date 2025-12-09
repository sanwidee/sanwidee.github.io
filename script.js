const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;
const iconContainer = themeToggle.querySelector('svg');

const sunIcon = `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
</svg>
`;

const moonIcon = `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
</svg>
`;

// Function to set theme
function setTheme(theme) {
    if (theme === 'dark') {
        htmlElement.setAttribute('data-theme', 'dark');
        iconContainer.innerHTML = sunIcon; // Show sun in dark mode (to switch to light)
        localStorage.setItem('theme', 'dark');
    } else {
        htmlElement.removeAttribute('data-theme');
        iconContainer.innerHTML = moonIcon; // Show moon in light mode (to switch to dark)
        localStorage.setItem('theme', 'light');
    }
}

// Check for saved preference or system preference
const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme) {
    setTheme(savedTheme);
} else if (systemPrefersDark) {
    setTheme('dark');
}

// Toggle event listener
themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        setTheme('light');
    } else {
        setTheme('dark');
    }
});

// Download PDF
const downloadBtn = document.getElementById('download-btn');

if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
        const element = document.querySelector('.paper-container');
        const currentTheme = htmlElement.getAttribute('data-theme');

        // Temporarily switch to light mode for PDF generation
        if (currentTheme === 'dark') {
            htmlElement.removeAttribute('data-theme');
        }

        const opt = {
            margin: 0,
            filename: 'Ikhsan_Widi_Adyatma_CV.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // Generate PDF and then restore theme
        setTimeout(() => {
            html2pdf().set(opt).from(element).save().then(() => {
                if (currentTheme === 'dark') {
                    htmlElement.setAttribute('data-theme', 'dark');
                }
            });
        }, 100);
    });
}

// Fetch Medium Posts
const mediumRssUrl = 'https://medium.com/feed/@widi.adyatma';
const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(mediumRssUrl)}`;
const blogContainer = document.getElementById('medium-posts');

if (blogContainer) {
    fetch(rss2jsonUrl)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok') {
                const posts = data.items.slice(0, 3); // Display top 3 posts
                let html = '';

                posts.forEach(post => {
                    // Extract first image from content if thumbnail is missing
                    let imageUrl = post.thumbnail;
                    if (!imageUrl) {
                        const imgMatch = post.content.match(/<img[^>]+src="([^">]+)"/);
                        if (imgMatch) {
                            imageUrl = imgMatch[1];
                        } else {
                            // Fallback image or placeholder
                            imageUrl = 'assets/profile.png';
                        }
                    }

                    // Format Date
                    const date = new Date(post.pubDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });

                    html += `
                        <a href="${post.link}" target="_blank" rel="noopener noreferrer" class="blog-link">
                            <div class="blog-card">
                                <img src="${imageUrl}" alt="${post.title}" class="blog-image">
                                <div class="blog-content">
                                    <h3>${post.title}</h3>
                                    <span class="blog-date">${date}</span>
                                </div>
                            </div>
                        </a>
                    `;
                });

                blogContainer.innerHTML = html;
            } else {
                blogContainer.innerHTML = '<div class="loading-state">Failed to load posts.</div>';
            }
        })
        .catch(error => {
            console.error('Error fetching Medium posts:', error);
            blogContainer.innerHTML = '<div class="loading-state">Failed to load posts.</div>';
        });
}
