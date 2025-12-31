/**
 * Blog System
 * Handles loading, filtering, and displaying blog posts
 */

class BlogSystem {
  constructor(options = {}) {
    this.containerSelector = options.container || '#blog-grid';
    this.container = document.querySelector(this.containerSelector);
    this.postsUrl = options.postsUrl || 'data/posts.json';
    this.postsPerPage = options.postsPerPage || 9;
    this.isPreview = options.isPreview || false;
    this.previewCount = options.previewCount || 3;

    this.posts = [];
    this.filteredPosts = [];
    this.currentFilter = 'all';
    this.currentPage = 1;
    this.isLoading = false;

    if (this.container) {
      this.init();
    }
  }

  async init() {
    this.showLoading();
    await this.loadPosts();
    this.setupFilters();
    this.setupLoadMore();
    this.render();
  }

  async loadPosts() {
    try {
      const data = await utils.fetchJSON(this.postsUrl);
      if (data && data.posts) {
        this.posts = data.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        this.filteredPosts = [...this.posts];
      }
    } catch (error) {
      console.error('Error loading blog posts:', error);
      this.showError('Fehler beim Laden der Blog-Beiträge.');
    }
  }

  setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn[data-filter]');

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        this.setFilter(filter);

        // Update active state
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  setFilter(filter) {
    this.currentFilter = filter;
    this.currentPage = 1;

    if (filter === 'all') {
      this.filteredPosts = [...this.posts];
    } else {
      this.filteredPosts = this.posts.filter(post =>
        post.category.toLowerCase().replace(/\s+/g, '-') === filter ||
        post.tags.some(tag => tag.toLowerCase().replace(/\s+/g, '-') === filter)
      );
    }

    this.render();
  }

  setupLoadMore() {
    const loadMoreBtn = document.querySelector('#load-more button');
    const loadMoreContainer = document.querySelector('#load-more');

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        this.currentPage++;
        this.render(true);
      });
    }
  }

  render(append = false) {
    if (!this.container) return;

    const startIndex = 0;
    const endIndex = this.isPreview
      ? this.previewCount
      : this.currentPage * this.postsPerPage;

    const postsToShow = this.filteredPosts.slice(startIndex, endIndex);

    if (!append) {
      this.container.innerHTML = '';
    }

    if (postsToShow.length === 0) {
      this.showEmpty();
      return;
    }

    const fragment = document.createDocumentFragment();

    postsToShow.forEach((post, index) => {
      // Skip if already rendered (when appending)
      if (append && index < (this.currentPage - 1) * this.postsPerPage) {
        return;
      }

      const card = this.createPostCard(post);
      fragment.appendChild(card);
    });

    this.container.appendChild(fragment);

    // Update load more button visibility
    this.updateLoadMoreButton(endIndex);

    // Trigger animations
    this.animateNewCards();
  }

  createPostCard(post) {
    const article = document.createElement('article');
    article.className = 'blog-card glass card animate-on-scroll';
    article.dataset.category = post.category.toLowerCase().replace(/\s+/g, '-');

    // Create image placeholder if no image
    const imageHtml = post.image
      ? `<img src="${post.image}" alt="${utils.escapeHtml(post.title)}" loading="lazy">`
      : `<div class="image-placeholder">
           <span>${post.category.charAt(0)}</span>
         </div>`;

    article.innerHTML = `
      <a href="blog-post.html?id=${post.id}" class="blog-image">
        ${imageHtml}
      </a>
      <div class="blog-content">
        <div class="blog-meta">
          <span class="blog-category">${utils.escapeHtml(post.category)}</span>
          <span class="blog-date">${utils.formatDate(post.date)}</span>
          <span class="blog-read-time">${post.readTime || '5 min'}</span>
        </div>
        <h3 class="blog-title">
          <a href="blog-post.html?id=${post.id}">${utils.escapeHtml(post.title)}</a>
        </h3>
        <p class="blog-excerpt">${utils.escapeHtml(post.excerpt)}</p>
        <div class="tags">
          ${post.tags.map(tag => `<span class="tag">${utils.escapeHtml(tag)}</span>`).join('')}
        </div>
      </div>
    `;

    return article;
  }

  updateLoadMoreButton(currentEndIndex) {
    const loadMoreContainer = document.querySelector('#load-more');
    if (!loadMoreContainer || this.isPreview) return;

    if (currentEndIndex >= this.filteredPosts.length) {
      loadMoreContainer.style.display = 'none';
    } else {
      loadMoreContainer.style.display = 'block';
    }
  }

  animateNewCards() {
    // Small delay to ensure DOM is updated
    setTimeout(() => {
      const cards = this.container.querySelectorAll('.animate-on-scroll:not(.animate-in)');
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('animate-in');
        }, index * 100);
      });
    }, 50);
  }

  showLoading() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Lade Beiträge...</p>
      </div>
    `;
  }

  showEmpty() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="empty-state">
        <p>Keine Beiträge gefunden.</p>
      </div>
    `;
  }

  showError(message) {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="error-state">
        <p>${utils.escapeHtml(message)}</p>
        <button class="btn-secondary glass" onclick="window.blogSystem.init()">
          Erneut versuchen
        </button>
      </div>
    `;
  }
}

/**
 * Single Post Loader
 * Loads and displays a single blog post
 */
class SinglePostLoader {
  constructor() {
    this.postContainer = document.getElementById('post-content');
    this.postsUrl = 'data/posts.json';

    if (this.postContainer) {
      this.init();
    }
  }

  async init() {
    const postId = this.getPostIdFromUrl();
    if (!postId) {
      this.showError('Kein Beitrag angegeben.');
      return;
    }

    this.showLoading();
    const post = await this.loadPost(postId);

    if (post) {
      this.render(post);
      this.updateMetaTags(post);
    } else {
      this.showError('Beitrag nicht gefunden.');
    }
  }

  getPostIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  async loadPost(id) {
    try {
      const data = await utils.fetchJSON(this.postsUrl);
      if (data && data.posts) {
        return data.posts.find(post => post.id.toString() === id.toString());
      }
    } catch (error) {
      console.error('Error loading post:', error);
    }
    return null;
  }

  render(post) {
    // Update page title
    document.title = `${post.title} | Leonic's World`;

    // Update post header
    const header = document.querySelector('.post-header');
    if (header) {
      header.innerHTML = `
        <div class="container">
          <div class="post-meta">
            <span class="post-category">${utils.escapeHtml(post.category)}</span>
            <span class="post-date">${utils.formatDate(post.date)}</span>
            <span class="post-read-time">${post.readTime || '5 min'} Lesezeit</span>
          </div>
          <h1 class="post-title">${utils.escapeHtml(post.title)}</h1>
          <div class="post-author">
            <img src="images/profile/leon-small.jpg" alt="${utils.escapeHtml(post.author)}" onerror="this.style.display='none'">
            <span>von ${utils.escapeHtml(post.author)}</span>
          </div>
        </div>
      `;
    }

    // Update featured image
    const featuredImage = document.querySelector('.post-featured-image');
    if (featuredImage && post.image) {
      featuredImage.innerHTML = `<img src="${post.image}" alt="${utils.escapeHtml(post.title)}">`;
    } else if (featuredImage) {
      featuredImage.style.display = 'none';
    }

    // Update content
    if (this.postContainer) {
      this.postContainer.innerHTML = post.content || `<p>${utils.escapeHtml(post.excerpt)}</p>`;
    }

    // Update tags
    const tagsContainer = document.querySelector('.post-tags');
    if (tagsContainer && post.tags) {
      tagsContainer.innerHTML = post.tags.map(tag =>
        `<span class="tag">${utils.escapeHtml(tag)}</span>`
      ).join('');
    }

    // Setup navigation
    this.setupNavigation(post);
  }

  async setupNavigation(currentPost) {
    try {
      const data = await utils.fetchJSON(this.postsUrl);
      if (!data || !data.posts) return;

      const posts = data.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      const currentIndex = posts.findIndex(p => p.id.toString() === currentPost.id.toString());

      const prevPost = posts[currentIndex + 1];
      const nextPost = posts[currentIndex - 1];

      const prevLink = document.querySelector('.nav-prev');
      const nextLink = document.querySelector('.nav-next');

      if (prevLink && prevPost) {
        prevLink.href = `blog-post.html?id=${prevPost.id}`;
        prevLink.textContent = `← ${prevPost.title}`;
      } else if (prevLink) {
        prevLink.style.visibility = 'hidden';
      }

      if (nextLink && nextPost) {
        nextLink.href = `blog-post.html?id=${nextPost.id}`;
        nextLink.textContent = `${nextPost.title} →`;
      } else if (nextLink) {
        nextLink.style.visibility = 'hidden';
      }
    } catch (error) {
      console.error('Error setting up navigation:', error);
    }
  }

  updateMetaTags(post) {
    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', post.excerpt);
    }

    // Update Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', post.title);
    }

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', post.excerpt);
    }

    if (post.image) {
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        ogImage.setAttribute('content', post.image);
      }
    }
  }

  showLoading() {
    if (!this.postContainer) return;
    this.postContainer.innerHTML = `
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Lade Beitrag...</p>
      </div>
    `;
  }

  showError(message) {
    if (!this.postContainer) return;
    this.postContainer.innerHTML = `
      <div class="error-state">
        <p>${utils.escapeHtml(message)}</p>
        <a href="blog.html" class="btn-primary glass">Zurück zum Blog</a>
      </div>
    `;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on blog listing page
  if (document.querySelector('#blog-grid')) {
    window.blogSystem = new BlogSystem();
  }

  // Check if we're on blog preview (home page)
  if (document.querySelector('#blog-preview')) {
    window.blogPreview = new BlogSystem({
      container: '#blog-preview',
      isPreview: true,
      previewCount: 3
    });
  }

  // Check if we're on single post page
  if (document.querySelector('#post-content')) {
    window.singlePost = new SinglePostLoader();
  }
});

// Export classes
window.BlogSystem = BlogSystem;
window.SinglePostLoader = SinglePostLoader;
