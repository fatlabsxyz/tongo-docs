/* MathJax 3 loader + config for the Tongo docs.
   mdBook's built-in MathJax (2.7.1) is disabled (mathjax-support = false);
   we load MathJax 3 (tex-chtml) here so we get:
     - single-$ inline math ( $x$ )  in addition to  \(x\)
     - $$...$$ and \[...\] display math
     - the <mjx-container> DOM that theme/custom.css styles.
   Config must be set on window.MathJax BEFORE the library script runs, so we
   set it here and then inject the library from this same file. */
(function () {
  window.MathJax = {
    tex: {
      inlineMath: [["$", "$"], ["\\(", "\\)"]],
      displayMath: [["$$", "$$"], ["\\[", "\\]"]],
      processEscapes: true,
      tags: "none",
    },
    options: {
      // never treat code/pre/scripts as math
      skipHtmlTags: ["script", "noscript", "style", "textarea", "pre", "code"],
      ignoreHtmlClass: "no-mathjax",
    },
    chtml: {
      scale: 1.15,
      displayAlign: "center",
      displayIndent: "0",
    },
    startup: {
      typeset: true,
    },
  };

  var s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js";
  s.async = true;
  s.id = "MathJax-script";
  document.head.appendChild(s);
})();
