// A native, swipeable review strip. Only the visible strip is animated.
const section = document.querySelector('.review-ribbon');
if (section) {
  const viewport = section.querySelector('.review-viewport');
  const group = section.querySelector('.review-group');
  const toggle = section.querySelector('#review-flow-toggle');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = preference.matches;
  let hovered = false;
  let focused = false;
  let visible = false;
  let previous = performance.now();
  let cycleWidth = 0;
  let position = 0;
  let frameId;
  let dragging = false;

  // The visual continuation is excluded from the accessibility tree.
  const copy = group.cloneNode(true);
  copy.classList.add('review-group-copy');
  copy.setAttribute('aria-hidden', 'true');
  copy.querySelectorAll('a').forEach(link => link.setAttribute('tabindex', '-1'));
  section.querySelector('.review-track').append(copy);

  function controls() {
    toggle.innerHTML = paused
      ? '<span aria-hidden="true">▶</span> Play flow'
      : '<span aria-hidden="true">Ⅱ</span> Pause flow';
    section.dataset.flow = paused ? 'paused' : 'playing';
  }
  function setPaused(value) {
    paused = value;
    controls();
    position = viewport.scrollLeft;
    previous = performance.now();
  }
  toggle.addEventListener('click', () => setPaused(!paused));
  viewport.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') hovered = true; });
  viewport.addEventListener('pointerleave', () => { hovered = false; });
  viewport.addEventListener('focusin', () => { focused = true; });
  viewport.addEventListener('focusout', event => { focused = viewport.contains(event.relatedTarget); });
  viewport.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') setPaused(true);
    dragging = true;
  });
  window.addEventListener('pointerup', () => { dragging = false; });
  window.addEventListener('pointercancel', () => { dragging = false; });
  viewport.addEventListener('wheel', () => setPaused(true), { passive: true });
  viewport.addEventListener('keydown', event => {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) setPaused(true);
  });
  section.querySelectorAll('[data-review-direction]').forEach(button => {
    button.addEventListener('click', () => {
      setPaused(true);
      const distance = group.querySelector('.flow-review').getBoundingClientRect().width + 20;
      viewport.scrollBy({ left: distance * Number(button.dataset.reviewDirection), behavior: preference.matches ? 'instant' : 'smooth' });
    });
  });
  const resize = new ResizeObserver(() => {
    cycleWidth = group.getBoundingClientRect().width;
    position = viewport.scrollLeft;
  });
  resize.observe(group);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    previous = performance.now();
    position = viewport.scrollLeft;
  });
  intersection.observe(section);
  preference.addEventListener('change', event => setPaused(event.matches));
  document.addEventListener('visibilitychange', () => { previous = performance.now(); });
  function animate(now) {
    const elapsed = Math.min((now - previous) / 1000, .06);
    previous = now;
    if (visible && !document.hidden && !paused && !hovered && !focused && !dragging && cycleWidth) {
      position = (position + elapsed * 30) % cycleWidth;
      viewport.scrollLeft = position;
    } else {
      position = viewport.scrollLeft;
    }
    frameId = requestAnimationFrame(animate);
  }
  controls();
  frameId = requestAnimationFrame(animate);
  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    cancelAnimationFrame(frameId);
    resize.disconnect();
    intersection.disconnect();
  });
}
