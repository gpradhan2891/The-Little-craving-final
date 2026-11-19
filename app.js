const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const products = [
  {
    "id": "floral",
    "title": "Floral cascade",
    "photo": "cake-menu/floral.jpg",
    "video": "assets/cake-menu/ciao-style-video-final.mp4"
  },
  {
    "id": "pink",
    "title": "Pink lily",
    "photo": "cake-menu/pink.jpg",
    "video": "assets/cake-menu/pink-lily-scored.mp4"
  },
  {
    "id": "rainbow",
    "title": "Rainbow birthday",
    "photo": "cake-menu/rainbow.jpg",
    "video": "assets/cake-menu/rainbow-final.mp4"
  },
  {
    "id": "anniversary",
    "title": "Silver anniversary",
    "photo": "cake-menu/anniversary.jpg",
    "video": "assets/cake-menu/anniversary-final.mp4"
  },
  {
    "id": "chocolate",
    "title": "Chocolate birthday",
    "photo": "cake-menu/chocolate.jpg",
    "video": "assets/cake-menu/chocolate-final.mp4"
  },
  {
    "id": "engagement",
    "title": "Engagement",
    "photo": "cake-menu/engagement.jpg",
    "video": "assets/cake-menu/engagement-final.mp4"
  },
  {
    "id": "gift",
    "title": "Cake and flowers",
    "photo": "cake-menu/gift.jpg",
    "video": "assets/cake-menu/gift-final.mp4"
  },
  {
    "id": "photo-cake",
    "title": "Photo cake",
    "photo": "cake-menu/photo-cake.jpg",
    "video": "assets/cake-menu/photo-cake-final.mp4"
  }
];
let index=0, box=[], toastTimer;
try{box=JSON.parse(localStorage.getItem('tlc-love-box')||'[]').filter(id=>products.some(p=>p.id===id))}catch{}
function notify(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3000)}
const film = $('#menu-film');
const picture = $('#menu-photo');
const swap = $('#swap-film');
function showPhoto() {
  film.pause();
  film.hidden = true;
  picture.hidden = false;
  swap.textContent = 'Watch video';
}
function select(i) {
  index = i;
  const product = products[i];
  showPhoto();
  film.removeAttribute('src');
  film.load();
  picture.src = 'assets/' + product.photo;
  picture.alt = product.title;
  film.poster = picture.src;
  film.setAttribute('aria-label', product.title + ' video');
  swap.hidden = !product.video;
  $('#cake-title').textContent = product.title;
  $$('.cake-choices button').forEach(button => button.setAttribute('aria-pressed', button.dataset.kind === product.id));
  renderBox();
}
$$('.cake-choices button').forEach((button,i) => button.onclick = () => select(i));
swap.onclick = () => {
  if (!film.hidden) return showPhoto();
  film.muted = products[index].id !== 'pink';
  film.src = products[index].video;
  picture.hidden = true;
  film.hidden = false;
  swap.textContent = 'Show photo';
  film.play().catch(() => {});
};
let previousFocus;
function open(id){$$('dialog[open]').forEach(d=>d.close());previousFocus=document.activeElement;$(id).showModal();document.body.style.overflow='hidden'}
$$('dialog').forEach(d=>{d.querySelector('.close').onclick=()=>d.close();d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}});d.addEventListener('close',()=>{if(!$('dialog[open]')){document.body.style.overflow='';previousFocus?.focus({preventScroll:true})}})});
function renderBox(){ $('#bag-count').textContent=box.length;$('#box-items').innerHTML=box.length?box.map(id=>{const p=products.find(p=>p.id===id);return `<div class="box-item"><img src="assets/${p.photo}" alt=""><span>${p.title}</span><button data-remove="${id}" aria-label="Remove ${p.title}">Remove</button></div>`}).join(''):'<p>Your box is waiting for something lovely.<br>Explore the cake menu and save an idea.</p>';$$('[data-remove]').forEach(b=>b.onclick=()=>{box=box.filter(id=>id!==b.dataset.remove);saveBox()});$('#add-box').textContent=box.includes(products[index].id)?'Saved in your box ✓':'Save this cake +'}
function saveBox(){try{localStorage.setItem('tlc-love-box',JSON.stringify(box))}catch{}renderBox()}
$('#add-box').onclick=()=>{const p=products[index];if(!box.includes(p.id)){box.push(p.id);saveBox();notify('A little idea added to your box.')}else notify('This lovely idea is already in your box.')};$('#open-bag').onclick=()=>{renderBox();open('#box-dialog')};
$$('[data-enquire]').forEach(b=>b.onclick=()=>open('#enquiry-dialog'));
$('#brief-form').onsubmit = event => {
  event.preventDefault();
  const data = new FormData(event.target);
  const lines = ['Hello Smriti, I have a cake enquiry.',
    'Occasion: ' + data.get('occasion'), 'Celebration date: ' + data.get('date'),
    'Weight: ' + data.get('weight') + ' kg', 'My little detail: ' + data.get('idea')];
  if (box.length) lines.push('Saved cakes: ' + box.map(id => products.find(p => p.id === id).title).join(', '));
  const message = lines.join('\n');
  const url = 'https://wa.me/919082355387?text=' + encodeURIComponent(message);
  window.open(url, '_blank', 'noopener');
  navigator.clipboard?.writeText(message).catch(() => {});
};
$('#review-draft').onsubmit = async event => {
  event.preventDefault();
  const form = event.target;
  const draft = form.querySelector('textarea');
  const copying = draft.value.trim() && navigator.clipboard?.writeText(draft.value.trim());
  window.open(form.querySelector('a').href, '_blank', 'noopener');
  try {
    if (copying) await copying;
    form.querySelector('[role=status]').textContent = copying ? 'Draft copied. Select ' + form.elements.rating.value + ' out of 5 stars on Google and paste your review.' : 'Your draft stays here to copy.';
  } catch {
    draft.select();
    form.querySelector('[role=status]').textContent = 'Select and copy your draft, then paste it on Google.';
  }
};
const topics = {
  'Cake weight': 'Have a weight in mind? Enter it in kilograms when you plan your cake. Smriti can confirm it against your guest count.',
  'Size and servings': 'How many people are celebrating? Add the guest count and whether you prefer small slices or dessert portions.',
  'Design': 'Choose a cake from the collection and save it to your box. Include your colours, theme and topper ideas.',
  'Ingredients': 'Tell Smriti the flavours you love and any ingredients you want to include or avoid.',
  'Dietary restrictions': 'List allergies and dietary requirements. Ask Smriti to confirm ingredients and cross-contact before ordering.',
  'Healthier options': 'Prefer less sweetness or a particular ingredient swap? Add your preference so Smriti can confirm what works for your design.'
};
for (const [topic, answer] of Object.entries(topics)) {
  const button = document.createElement('button');
  button.className = 'pill';
  button.textContent = topic;
  button.onclick = () => { $('#muffin-answer').textContent = answer; };
  $('#muffin-topics').append(button);
}
$('#ask-muffin').onclick = () => open('#muffin-dialog');

const photos=[['photo-cake.jpg','A memory, made sweet.'],['engagement.jpg','The sweetest yes.'],['pink.jpg','A little floral feeling.'],['rainbow.jpg','Birthday kind of happy.'],['anniversary.jpg','Twenty-five, together.'],['floral.jpg','Flowers with feeling.'],['chocolate.jpg','A darker kind of lovely.'],['gift.jpg','A little box of love.']];
$('#photo-grid').innerHTML=photos.map(([src,label])=>`<button class="diary-card" data-image="assets/${src}" data-caption="${label}"><img src="assets/${src}" loading="lazy" alt="${label}"><span>${label}</span></button>`).join('');
const lightbox=document.createElement('dialog');lightbox.id='photo-dialog';lightbox.innerHTML='<button class="close" aria-label="Close photograph">×</button><img alt="" style="max-height:65svh;object-fit:contain;margin-top:25px;border-radius:12px"><p style="margin-top:20px;font:24px var(--serif)"></p>';document.body.append(lightbox);lightbox.querySelector('.close').onclick=()=>lightbox.close();lightbox.onclose=()=>{document.body.style.overflow='';previousFocus?.focus({preventScroll:true})};
document.addEventListener('click',e=>{const b=e.target.closest('[data-image]');if(b){lightbox.querySelector('img').src=b.dataset.image;lightbox.querySelector('img').alt=b.dataset.caption||'The Little Craving archive photograph';lightbox.querySelector('p').textContent=b.dataset.caption||'From the TLC archive';open('#photo-dialog')}});
let archiveData=[],archiveLimit=24;
async function showArchive(){const panel=$('#archive');panel.hidden=!panel.hidden;$('#archive-toggle').textContent=panel.hidden?'Explore our Instagram grid ↗':'Close the Instagram grid ↑';if(!panel.hidden&&!archiveData.length){try{archiveData=await(await fetch('asset-library.json')).json();renderArchive()}catch{notify('The Instagram grid could not load. Please try again.')}}}
function renderArchive(){const filtered=archiveData;$('#archive-grid').innerHTML=filtered.slice(0,archiveLimit).map(p=>`<button data-image="${p.url}" data-caption="From The Little Craving’s Instagram grid"><img src="${p.thumbnail}" alt="The Little Craving portfolio photograph" loading="lazy" width="${p.width}" height="${p.height}"></button>`).join('');$('#archive-count').textContent=`${Math.min(archiveLimit,filtered.length)} of ${filtered.length} photographs`;$('#load-more').hidden=archiveLimit>=filtered.length;}
$('#archive-toggle').onclick=showArchive;$('#load-more').onclick=()=>{archiveLimit+=24;renderArchive()};
select(0);
document.body.dataset.sceneReady='true';
