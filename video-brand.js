// The supplied film is the complete logo: its lettering is never reconstructed.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const logos = [...document.querySelectorAll('.brand-lockup')].map((lockup) => {
  const video = lockup.querySelector('video');
  const button = lockup.querySelector('.logo-motion');
  const state = { video, button, visible: false, paused: reducedMotion.matches };
  const label = video.dataset.place;
  video.muted = true;
  button.hidden = false;

  const updateButton = () => {
    const playing = !video.paused;
    button.textContent = playing ? 'Ⅱ' : '▶';
    button.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${label} logo animation`);
    button.title = button.getAttribute('aria-label');
  };
  state.sync = () => {
    if (state.paused || !state.visible || document.hidden) {
      video.pause();
      updateButton();
      return;
    }
    if (!video.getAttribute('src')) video.src = video.dataset.src;
    video.play().catch((error) => {
      // Leaving the viewport can abort a pending play without a user pause.
      if (error.name !== 'AbortError') state.paused = true;
      updateButton();
    });
  };
  video.addEventListener('playing', () => {
    video.parentElement.classList.add('has-motion');
    updateButton();
  });
  video.addEventListener('pause', updateButton);
  video.addEventListener('error', () => {
    video.parentElement.classList.remove('has-motion');
    button.hidden = true;
  });
  button.addEventListener('click', () => {
    state.paused = !video.paused;
    state.sync();
  });
  updateButton();
  return state;
});

const visibility = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const state = logos.find(({ video }) => video === entry.target);
    state.visible = entry.isIntersecting;
    state.sync();
  }
}, { threshold: .05 });
logos.forEach(({ video }) => visibility.observe(video));
document.addEventListener('visibilitychange', () => logos.forEach((state) => state.sync()));
window.addEventListener('pageshow', () => logos.forEach((state) => state.sync()));
reducedMotion.addEventListener('change', () => {
  for (const state of logos) {
    state.paused = reducedMotion.matches;
    if (reducedMotion.matches) state.video.parentElement.classList.remove('has-motion');
    state.sync();
  }
});

const heroFilm = document.querySelector('.hero-film video');
if (!reducedMotion.matches) heroFilm.play().catch(() => {});
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) heroFilm.pause();
});

const muffinIcon = document.querySelector('#ask-muffin video');
function syncMuffinIcon() {
  if (reducedMotion.matches) {
    muffinIcon.removeAttribute('src');
    muffinIcon.load();
  } else {
    muffinIcon.src = muffinIcon.dataset.src;
    muffinIcon.play().catch(() => {});
  }
}
syncMuffinIcon();
reducedMotion.addEventListener('change', syncMuffinIcon);
