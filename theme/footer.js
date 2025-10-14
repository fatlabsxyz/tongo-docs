// Add custom footer to mdBook
(function() {
  const footer = document.createElement('footer');
  footer.className = 'tongo-footer';
  footer.innerHTML = `
    <div class="footer-content">
      <div class="footer-links">
        <a href="https://github.com/fatlabsxyz" target="_blank" rel="noopener noreferrer">GITHUB</a>
        <a href="https://t.me/tongoxyz" target="_blank" rel="noopener noreferrer">TELEGRAM</a>
        <a href="https://docs.tongo.cash" target="_blank" rel="noopener noreferrer">DOCS</a>
        <a href="https://twitter.com/tongoxyz" target="_blank" rel="noopener noreferrer">TWITTER</a>
      </div>
      <div class="footer-credits">
        <a href="https://fatsolutions.xyz/" target="_blank" rel="noopener noreferrer">BUILT BY FAT SOLUTIONS</a>
        <a href="https://twitter.com/fatsolutionsxyz" target="_blank" rel="noopener noreferrer">@FATSOLUTIONSXYZ</a>
      </div>
    </div>
  `;

  const content = document.querySelector('.content');
  if (content) {
    content.appendChild(footer);
  }
})();
