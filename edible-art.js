const studio = document.querySelector('.studio');
const leaf = document.querySelector('.gold-leaf');
for (let i = 0; i < 38; i++) {
  const flake = document.createElement('i');
  flake.style.cssText = `--x:${(i * 37) % 97}%;--y:${(i * 29) % 99}%;--size:${5 + i % 10}px;--time:${6 + i % 9}s;--delay:-${i % 12}s`;
  leaf.append(flake);
}
const toggle = document.querySelector('#motion-toggle');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
toggle.hidden = motion.matches;
motion.addEventListener('change', () => { toggle.hidden = motion.matches; });
toggle.onclick = () => {
  const paused = studio.classList.toggle('paused');
  toggle.setAttribute('aria-pressed', paused);
  toggle.textContent = paused ? 'Resume motion' : 'Pause motion';
};
