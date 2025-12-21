const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;
const iconContainer = themeToggle ? themeToggle.querySelector('svg') : null;

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
        if (iconContainer) iconContainer.innerHTML = sunIcon;
        localStorage.setItem('theme', 'dark');
    } else {
        htmlElement.removeAttribute('data-theme');
        if (iconContainer) iconContainer.innerHTML = moonIcon;
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
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            setTheme('light');
        } else {
            setTheme('dark');
        }
    });
}

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
                const posts = data.items.slice(0, 10); // Display up to 10 posts

                // Build slider HTML
                let cardsHtml = '';
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

                    cardsHtml += `
                        <a href="${post.link}" target="_blank" rel="noopener noreferrer" class="blog-link blog-slide">
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

                // Wrap in slider structure
                blogContainer.innerHTML = `
                    <div class="blog-slider-track">
                        ${cardsHtml}
                    </div>
                `;

                // Slider functionality (Drag to scroll could be added here if needed, but native scroll is fine)



            } else {
                blogContainer.innerHTML = '<div class="loading-state">Failed to load posts.</div>';
            }
        })
        .catch(error => {
            console.error('Error fetching Medium posts:', error);
            blogContainer.innerHTML = '<div class="loading-state">Failed to load posts.</div>';
        });
}

// Project Filtering
function initProjectFilters() {
    const filterContainer = document.getElementById('project-filters');
    if (!filterContainer) return;

    const cards = document.querySelectorAll('.project-card');
    const companies = new Set();

    // extract companies from first tag
    cards.forEach(card => {
        const tag = card.querySelector('.tag');
        if (tag) {
            companies.add(tag.textContent.trim());
        }
    });

    // Create "All" button
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-chip active';
    allBtn.textContent = 'All';
    allBtn.addEventListener('click', () => filterProjects('All', allBtn));
    filterContainer.appendChild(allBtn);

    // Create company buttons
    companies.forEach(company => {
        const btn = document.createElement('button');
        btn.className = 'filter-chip';
        btn.textContent = company;
        btn.addEventListener('click', () => filterProjects(company, btn));
        filterContainer.appendChild(btn);
    });

    function filterProjects(company, activeBtn) {
        // Update active state
        document.querySelectorAll('.filter-chip').forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');

        // Show/Hide cards
        cards.forEach(card => {
            if (company === 'All') {
                card.classList.remove('hidden');
                // card.parentElement is the grid container, but the card is likely directly inside existing structure?
                // Wait, existing structure is: div.glass-card > ...
                // BUT in new implementation, is it?
                // Let's check index.html again.
                // <div class="glass-card project-card">...</div>
                // Yes, hidden class on card itself works if it's display:none.
            } else {
                const tag = card.querySelector('.tag');
                if (tag && tag.textContent.trim() === company) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            }
        });
    }
}

// Experience Modal
function initExperienceModal() {
    const modal = document.getElementById('experience-modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.getElementById('modal-close');
    const experienceItems = document.querySelectorAll('.clickable-experience, .clickable-project');

    if (!modal || !modalBody || !experienceItems.length) return;

    experienceItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Stop link navigation for project cards
            if (e.target.closest('a') && e.currentTarget.classList.contains('clickable-project')) {
                e.preventDefault();
            }

            // Clone the content to avoid removing it from the original place
            const clone = item.cloneNode(true);
            clone.classList.remove('clickable-experience', 'clickable-project');

            modalBody.innerHTML = '';
            modalBody.appendChild(clone);
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Close on click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Markdown Project Loader
async function loadProjects() {
    const container = document.getElementById('projects-container');
    if (!container) return;

    try {
        // Handle path based on whether we are in the /cv/ directory or root
        const isCVPage = window.location.pathname.includes('/cv/');
        const path = isCVPage ? '../projects.md' : 'projects.md';

        const response = await fetch(path);
        if (!response.ok) throw new Error('Failed to fetch projects.md');
        const markdown = await response.text();

        // Split by horizontal rule separator
        const items = markdown.split(/\n---\n/);
        let html = '';

        items.forEach(item => {
            const lines = item.trim().split('\n');
            if (lines.length < 2) return;

            let title = 'Project';
            let company = '';
            let tags = [];
            let contentLines = [];

            lines.forEach(line => {
                if (line.startsWith('# ')) {
                    title = line.replace('# ', '').trim();
                } else if (line.toLowerCase().includes('**company**:')) {
                    company = line.split(':')[1].trim();
                } else if (line.toLowerCase().includes('**tags**:')) {
                    const tagPart = line.split(':')[1];
                    tags = tagPart ? tagPart.split(',').map(t => t.trim().replace(/\*/g, '')) : [];
                } else if (line.trim() !== '') {
                    contentLines.push(line);
                }
            });

            const contentMarkdown = contentLines.join('\n');
            const parsedContent = typeof marked !== 'undefined' ? marked.parse(contentMarkdown) : contentMarkdown;
            const tagHtml = tags.map(t => `<span class="tag">${t}</span>`).join('');

            // determine classes based on page type
            const isLanding = !isCVPage;
            const cardClass = isLanding ? 'glass-card project-card clickable-project' : 'experience-item clickable-experience';

            if (isLanding) {
                html += `
                    <div class="${cardClass}" data-company="${company}">
                        <h3>${title}</h3>
                        <div class="project-description">${parsedContent}</div>
                        <div class="tags">${tagHtml}</div>
                    </div>
                `;
            } else {
                html += `
                    <div class="${cardClass}" data-company="${company}">
                        <div class="job-header">
                            <span class="job-title">${title}</span>
                            <span class="location-tag">${company}</span>
                        </div>
                        <div class="job-description">
                            ${parsedContent}
                        </div>
                        <div class="tags">${tagHtml}</div>
                    </div>
                `;
            }
        });

        container.innerHTML = html;

        // RE-INITIALIZE to pick up newly added dynamic items
        initProjectFilters();
        initExperienceModal();

    } catch (error) {
        console.error('Error loading projects:', error);
        container.innerHTML = `<div class="loading-state">Error loading projects: ${error.message}</div>`;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize static items (like on the CV page)
    initExperienceModal();
    initProjectFilters();

    // 2. Load dynamic projects from Markdown (like on the main page)
    loadProjects();
});
