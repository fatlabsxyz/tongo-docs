// Add custom footer to mdBook
(function() {
  const footer = document.createElement('footer');
  footer.className = 'tongo-footer';
  footer.innerHTML = `
    <div class="footer-content">
      <div class="footer-links">
        <a href="https://tongo.cash" target="_blank" rel="noopener noreferrer">WEBSITE</a>
        <a href="https://demo.tongo.cash" target="_blank" rel="noopener noreferrer">APP</a>
        <a href="https://github.com/fatlabsxyz/tongo" target="_blank" rel="noopener noreferrer">GITHUB</a>
        <a href="https://t.me/tongoxyz" target="_blank" rel="noopener noreferrer">TELEGRAM</a>
        <a href="https://twitter.com/tongoxyz" target="_blank" rel="noopener noreferrer">TWITTER</a>
      </div>
      <div class="footer-credits">
        <a href="https://fatsolutions.xyz/" target="_blank" rel="noopener noreferrer">BUILT BY FAT SOLUTIONS</a>
        <a href="https://twitter.com/fatsolutionsxyz" target="_blank" rel="noopener noreferrer">@FATSOLUTIONSXYZ</a>
      </div>
    </div>
  `;

  // Append to <body> so `position: fixed` anchors to the viewport reliably
  // (an ancestor with a transform would otherwise become its containing block).
  document.body.appendChild(footer);
})();
