// Main JavaScript for Nuvei Apple Pay Documentation
class DocumentationSite {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebar-toggle');
        this.mainContent = document.querySelector('.main-content');
        this.navList = document.getElementById('nav-list');
        
        this.init();
    }

    init() {
        this.generateNavigation();
        this.setupEventListeners();
        this.setupScrollSpy();
        this.setupSmoothScrolling();
        this.setupResponsiveHandling();
    }

    generateNavigation() {
        // Get all sections with IDs
        const sections = document.querySelectorAll('.content-section[id]');
        const navHTML = Array.from(sections).map(section => {
            const id = section.id;
            const title = section.querySelector('h2')?.textContent || id;
            const cleanTitle = this.cleanTitle(title);
            
            return `<li><a href="#${id}" data-section="${id}">${cleanTitle}</a></li>`;
        }).join('');

        this.navList.innerHTML = navHTML;
    }

    cleanTitle(title) {
        // Clean up titles for navigation
        return title
            .replace(/^\d+\.\s*/, '') // Remove numbers at start
            .replace(/&\s+/g, '& ') // Clean up spacing around &
            .trim();
    }

    setupEventListeners() {
        // Sidebar toggle
        this.sidebarToggle?.addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Navigation clicks
        this.navList.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                const targetId = e.target.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
                
                // Close sidebar on mobile after navigation
                if (window.innerWidth <= 1024) {
                    this.closeSidebar();
                }
            }
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024 && 
                !this.sidebar.contains(e.target) && 
                !this.sidebarToggle.contains(e.target) &&
                this.sidebar.classList.contains('visible')) {
                this.closeSidebar();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.sidebar.classList.contains('visible')) {
                this.closeSidebar();
            }
        });
    }

    toggleSidebar() {
        if (window.innerWidth <= 1024) {
            this.sidebar.classList.toggle('visible');
            this.sidebarToggle.classList.toggle('shifted');
        }
    }

    closeSidebar() {
        this.sidebar.classList.remove('visible');
        this.sidebarToggle.classList.remove('shifted');
    }

    openSidebar() {
        this.sidebar.classList.add('visible');
        this.sidebarToggle.classList.add('shifted');
    }

    scrollToSection(sectionId) {
        const target = document.getElementById(sectionId);
        if (target) {
            const offsetTop = target.offsetTop - 20; // Account for fixed header space
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    setupScrollSpy() {
        const sections = document.querySelectorAll('.content-section[id]');
        const navLinks = document.querySelectorAll('.nav-list a[data-section]');

        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const sectionId = entry.target.id;
                const navLink = document.querySelector(`a[data-section="${sectionId}"]`);
                
                if (entry.isIntersecting) {
                    // Remove active class from all links
                    navLinks.forEach(link => link.classList.remove('active'));
                    // Add active class to current link
                    navLink?.classList.add('active');
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    setupSmoothScrolling() {
        // Enhance smooth scrolling for browsers that don't support it natively
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                const targetId = href.substring(1);
                
                if (targetId && document.getElementById(targetId)) {
                    e.preventDefault();
                    this.scrollToSection(targetId);
                }
            });
        });
    }

    setupResponsiveHandling() {
        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (window.innerWidth > 1024) {
                    // Reset sidebar state on desktop
                    this.sidebar.classList.remove('visible');
                    this.sidebarToggle.classList.remove('shifted');
                    this.mainContent.classList.remove('expanded');
                }
            }, 250);
        });
    }
}

// Table enhancements
class TableEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.makeTablesResponsive();
        this.addTableSorting();
    }

    makeTablesResponsive() {
        const tables = document.querySelectorAll('.styled-table');
        
        tables.forEach(table => {
            // Add responsive wrapper if not already present
            if (!table.parentElement.classList.contains('table-container')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-container';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }

            // Add mobile-friendly attributes
            this.addMobileLabels(table);
        });
    }

    addMobileLabels(table) {
        const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
        const rows = table.querySelectorAll('tbody tr');

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            cells.forEach((cell, index) => {
                if (headers[index]) {
                    cell.setAttribute('data-label', headers[index]);
                }
            });
        });
    }

    addTableSorting() {
        // Basic table sorting for data tables
        const tables = document.querySelectorAll('.styled-table');
        
        tables.forEach(table => {
            const headers = table.querySelectorAll('th');
            headers.forEach((header, index) => {
                // Only add sorting to tables that look like they have sortable data
                if (this.isSortableColumn(table, index)) {
                    header.style.cursor = 'pointer';
                    header.title = 'Click to sort';
                    
                    header.addEventListener('click', () => {
                        this.sortTable(table, index);
                    });
                }
            });
        });
    }

    isSortableColumn(table, columnIndex) {
        const rows = table.querySelectorAll('tbody tr');
        if (rows.length < 2) return false;
        
        // Check if column contains mostly numbers or dates
        let numericCount = 0;
        rows.forEach(row => {
            const cell = row.cells[columnIndex];
            if (cell && (this.isNumeric(cell.textContent) || this.isDate(cell.textContent))) {
                numericCount++;
            }
        });
        
        return numericCount > rows.length * 0.5;
    }

    isNumeric(str) {
        return !isNaN(parseFloat(str)) && isFinite(str);
    }

    isDate(str) {
        return !isNaN(Date.parse(str));
    }

    sortTable(table, columnIndex) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        const sortedRows = rows.sort((a, b) => {
            const aText = a.cells[columnIndex].textContent.trim();
            const bText = b.cells[columnIndex].textContent.trim();
            
            if (this.isNumeric(aText) && this.isNumeric(bText)) {
                return parseFloat(aText) - parseFloat(bText);
            } else if (this.isDate(aText) && this.isDate(bText)) {
                return new Date(aText) - new Date(bText);
            } else {
                return aText.localeCompare(bText);
            }
        });
        
        // Clear and repopulate tbody
        tbody.innerHTML = '';
        sortedRows.forEach(row => tbody.appendChild(row));
    }
}

// Code block enhancements
class CodeBlockEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.addCopyButtons();
        this.setupCodeHighlighting();
    }

    addCopyButtons() {
        const codeBlocks = document.querySelectorAll('pre code');
        
        codeBlocks.forEach(codeBlock => {
            const pre = codeBlock.parentElement;
            
            // Create copy button
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button';
            copyButton.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy
            `;
            copyButton.title = 'Copy code to clipboard';
            
            // Style the button
            copyButton.style.cssText = `
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: #cbd5e0;
                padding: 0.5rem;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.75rem;
                display: flex;
                align-items: center;
                gap: 0.25rem;
                transition: all 0.2s ease;
            `;
            
            // Make pre relative for absolute positioning
            pre.style.position = 'relative';
            
            // Add copy functionality
            copyButton.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(codeBlock.textContent);
                    copyButton.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20,6 9,17 4,12"></polyline>
                        </svg>
                        Copied!
                    `;
                    copyButton.style.background = 'rgba(34, 197, 94, 0.2)';
                    copyButton.style.borderColor = 'rgba(34, 197, 94, 0.4)';
                    copyButton.style.color = '#22c55e';
                    
                    setTimeout(() => {
                        copyButton.innerHTML = `
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            Copy
                        `;
                        copyButton.style.background = 'rgba(255, 255, 255, 0.1)';
                        copyButton.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        copyButton.style.color = '#cbd5e0';
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy code:', err);
                }
            });
            
            pre.appendChild(copyButton);
        });
    }

    setupCodeHighlighting() {
        // Initialize Prism.js if available
        if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
        }
    }
}

// Search functionality
class DocumentSearch {
    constructor() {
        this.searchResults = [];
        this.currentQuery = '';
        this.init();
    }

    init() {
        this.createSearchInterface();
        this.setupSearchFunctionality();
    }

    createSearchInterface() {
        const sidebar = document.querySelector('.sidebar');
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <div style="padding: 1rem; border-bottom: 1px solid var(--border-light);">
                <input type="search" placeholder="Search documentation..." class="search-input" id="doc-search">
                <div class="search-results" id="search-results" style="display: none;"></div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .search-input {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius);
                font-size: 0.875rem;
                background: var(--bg-primary);
                color: var(--text-primary);
            }
            .search-input:focus {
                outline: none;
                border-color: var(--primary-color);
                box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
            }
            .search-results {
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius);
                margin-top: 0.5rem;
                max-height: 200px;
                overflow-y: auto;
                box-shadow: var(--shadow-md);
            }
            .search-result-item {
                padding: 0.75rem;
                border-bottom: 1px solid var(--border-light);
                cursor: pointer;
                font-size: 0.875rem;
            }
            .search-result-item:hover {
                background: var(--bg-tertiary);
            }
            .search-result-item:last-child {
                border-bottom: none;
            }
            .search-highlight {
                background: yellow;
                color: black;
                padding: 0.1em 0.2em;
                border-radius: 2px;
            }
        `;
        document.head.appendChild(style);
        
        sidebar.insertBefore(searchContainer, sidebar.querySelector('.nav-list'));
    }

    setupSearchFunctionality() {
        const searchInput = document.getElementById('doc-search');
        const searchResults = document.getElementById('search-results');
        
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performSearch(e.target.value.trim(), searchResults);
            }, 300);
        });
        
        // Hide results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });
    }

    performSearch(query, resultsContainer) {
        if (query.length < 2) {
            resultsContainer.style.display = 'none';
            return;
        }
        
        this.currentQuery = query;
        const results = this.searchContent(query);
        this.displayResults(results, resultsContainer);
    }

    searchContent(query) {
        const sections = document.querySelectorAll('.content-section');
        const results = [];
        
        sections.forEach(section => {
            const sectionId = section.id;
            const title = section.querySelector('h2')?.textContent || '';
            const content = section.textContent.toLowerCase();
            const queryLower = query.toLowerCase();
            
            if (content.includes(queryLower)) {
                const snippet = this.extractSnippet(section.textContent, query);
                results.push({
                    sectionId,
                    title: this.cleanTitle(title),
                    snippet
                });
            }
        });
        
        return results.slice(0, 5); // Limit to 5 results
    }

    extractSnippet(text, query) {
        const queryLower = query.toLowerCase();
        const textLower = text.toLowerCase();
        const index = textLower.indexOf(queryLower);
        
        if (index === -1) return '';
        
        const start = Math.max(0, index - 50);
        const end = Math.min(text.length, index + query.length + 50);
        
        return text.substring(start, end).trim();
    }

    displayResults(results, container) {
        if (results.length === 0) {
            container.innerHTML = '<div class="search-result-item">No results found</div>';
        } else {
            container.innerHTML = results.map(result => `
                <div class="search-result-item" data-section="${result.sectionId}">
                    <strong>${result.title}</strong><br>
                    <small>${this.highlightQuery(result.snippet, this.currentQuery)}</small>
                </div>
            `).join('');
            
            // Add click handlers
            container.querySelectorAll('.search-result-item[data-section]').forEach(item => {
                item.addEventListener('click', () => {
                    const sectionId = item.getAttribute('data-section');
                    this.scrollToSection(sectionId);
                    container.style.display = 'none';
                });
            });
        }
        
        container.style.display = 'block';
    }

    highlightQuery(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    scrollToSection(sectionId) {
        const target = document.getElementById(sectionId);
        if (target) {
            const offsetTop = target.offsetTop - 20;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    cleanTitle(title) {
        return title
            .replace(/^\d+\.\s*/, '')
            .replace(/&\s+/g, '& ')
            .trim();
    }
}

// Progress indicator
class ReadingProgress {
    constructor() {
        this.init();
    }

    init() {
        this.createProgressBar();
        this.setupScrollTracking();
    }

    createProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        progressBar.innerHTML = '<div class="reading-progress-fill"></div>';
        
        const style = document.createElement('style');
        style.textContent = `
            .reading-progress {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 3px;
                background: rgba(37, 99, 235, 0.1);
                z-index: 9999;
            }
            .reading-progress-fill {
                height: 100%;
                background: var(--primary-color);
                width: 0%;
                transition: width 0.2s ease;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(progressBar);
    }

    setupScrollTracking() {
        const progressFill = document.querySelector('.reading-progress-fill');
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            progressFill.style.width = Math.min(100, Math.max(0, scrollPercent)) + '%';
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DocumentationSite();
    new TableEnhancements();
    new CodeBlockEnhancements();
    new DocumentSearch();
    new ReadingProgress();
    
    // Add any additional initialization here
    console.log('Nuvei Apple Pay Documentation loaded successfully');
});

// Export classes for potential use in other scripts
window.DocumentationSite = DocumentationSite;
window.TableEnhancements = TableEnhancements;
window.CodeBlockEnhancements = CodeBlockEnhancements;
window.DocumentSearch = DocumentSearch;
window.ReadingProgress = ReadingProgress;
