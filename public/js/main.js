document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('search-form');
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const { value: searchQuery } = document.getElementById('search-input');
    window.location.href = `/trades/search/?query=${encodeURIComponent(searchQuery)}`;
  });
});