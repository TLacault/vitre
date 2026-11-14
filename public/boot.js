// Runs before the first paint (a classic script: MV3 allows no inline ones). Paints the tone of the last
// background, saved by Background.tsx, so a new tab opens on it rather than on black.
try {
  var c = localStorage.getItem('vitre.cover')
  if (c) document.documentElement.style.setProperty('--cover', c)
} catch (e) {}
