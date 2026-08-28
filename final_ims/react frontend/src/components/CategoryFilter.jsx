import React from 'react';

/**
 * CategoryFilter Component
 * 
 * Props:
 * - categories: string[] (list of available categories)
 * - selectedCategory: string (lifted state from parent)
 * - onSelectCategory: function (callback to parent when a category is clicked)
 * - searchQuery: string (lifted state for search)
 * - onSearchChange: function (callback to parent when search query changes)
 * - totalCount: number (number of filtered products)
 */
export default function CategoryFilter({
  categories = [],
  selectedCategory = 'ALL',
  onSelectCategory,
  searchQuery = '',
  onSearchChange,
  totalCount = 0
}) {
  return (
    <div className="filter-container">
      {/* Search Input Bar */}
      <div className="search-bar-wrap">
        <div className="search-input-box">
          <svg
            className="search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search products by title, SKU, brand, or category..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <div className="results-count-pill">
          {totalCount} {totalCount === 1 ? 'product' : 'products'} found
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="category-pills" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === 'ALL'}
          className={`category-pill ${selectedCategory === 'ALL' ? 'active' : ''}`}
          onClick={() => onSelectCategory('ALL')}
        >
          All Categories
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={selectedCategory === cat}
            className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
