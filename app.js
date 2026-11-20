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
let index=0, toastTimer;
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
$$('[data-enquire]').forEach(b=>b.onclick=()=>open('#enquiry-dialog'));
$('#brief-form').onsubmit = event => {
  event.preventDefault();
  const data = new FormData(event.target);
  const lines = ['Hello Smriti, I have a cake enquiry.',
    'Occasion: ' + data.get('occasion'), 'Celebration date: ' + data.get('date'),
    'Weight: ' + data.get('weight') + ' kg', 'My little detail: ' + data.get('idea')];
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
const muffinTopics = [
  ['About us', /who.*(make|bake|own|run|found)|who is (smriti|muffin)|about (you|us|the little craving)|tagline|mascot|premix|pre.mix|freshly baked/i, 'Smriti founded The Little Craving and personally handcrafts each cake fresh to order, from scratch. I’m Muffin the Pug! We’re spreading sweetness everywhere one bite at a time. Little things. Big love.'],
  ['Location', /where.*(located|based|shop|bakery|cakery|you)|location|address|mira road east/i, 'Our boutique home cakery is based in Mira Road East, Thane (Mumbai). We serve the local area and select parts of Mumbai.'],
  ['Cakes and cupcakes', /what.*(kind|type).*cake|menu|cupcakes?|favou?rs|photo cakes?|gift box|floral cascade|pink lily|rainbow cake/i, 'We make bespoke birthday, anniversary, engagement and milestone cakes. Explore photo cakes with framed or suspended prints, Floral Cascade and Pink Lily, rainbow and themed cakes, silver anniversary cakes, dark chocolate cakes, and clear cake-and-flower gift boxes. Matching cupcakes and celebration favors are available too.'],
  ['Custom designs', /customi[sz]|theme|recreate|design|collage|topper/i, 'Yes! Smriti can build a design around your story, from favorite colors and milestone numbers to flowers or a framed or suspended photo collage. Share your reference and celebration date on WhatsApp.'],
  ['Eggless options', /egg[ -]?less|without eggs?|no eggs?/i, '100% eggless cakes and cupcakes are available on request. Mention eggless when you enquire.'],
  ['Sweetness and ingredients', /sugar|sweete?n|health|ingredient swap/i, 'You can request reduced sweetness or ingredient swaps. Smriti can confirm what works for your chosen cake.'],
  ['Dietary restrictions', /allerg|gluten|vegan|dietary|nut.free|dairy/i, 'Tell Smriti about allergies or dietary requirements so she can confirm ingredients and cross-contact before you order.'],
  ['Flavors', /flavou?rs?|belgian|vanilla|red velvet|berry|compote/i, 'Options include artisanal Belgian chocolate, vanilla bean, red velvet, fresh fruit and berry compotes, and seasonal specials. Tell Smriti which flavors you like.'],
  ['Weight and servings', /how much cake|how (many|big)|serv(e|ing)|guest|portions?|slices?|weight|\bkg\b|cake size/i, 'General guide: 0.5 kg serves 3–5 guests; 1 kg serves 6–10; 1.5 kg serves 10–14; 2 kg or more serves 15–20+ and suits multi-tier designs. Share your guest count and preferred slice size for a recommendation.'],
  ['Order and quotes', /how.*(order|quote|book)|place an order/i, 'Explore the menu, then choose Plan my cake or Send via WhatsApp. Share your date, guest count and design ideas with Smriti at +91 90823 55387.'],
  ['Advance notice', /advance|lead time|how (early|soon|long)|last.minute|notice|express|tomorrow|same.day/i, 'Standard custom cakes usually need 2–3 days. Allow up to 4 days for standard orders depending on availability. Multi-tier, engagement and intricate designs need 4–7 days. Ask Smriti about last-minute slots.'],
  ['Pricing', /pric|cost|budget|charge|rate card|how much (is|does)|quote/i, 'Smriti provides a personalized quote based on weight, flavor and design details such as photo prints, flowers or clear gift packaging. Send your date, guest count and design ideas on WhatsApp.'],
  ['Delivery and pickup', /deliver|pickup|pick up|collection point|doorstep/i, 'Pickup is available in Mira Road East. We offer doorstep delivery across Mira Road, Thane and nearby Mumbai suburbs. Share your area and date to confirm.'],
  ['Contact', /contact|phone|number|instagram|website|whatsapp|reach/i, 'WhatsApp or call +91 90823 55387. Find us on Instagram at @the_little_craving and at thelittlecraving.netlify.app.']
];
const muffinHandoff = $('#muffin-handoff');
function replyAsMuffin(answer, question) {
  $('#muffin-answer').textContent = answer || 'Smriti can help with that. Open WhatsApp to review and send your question.';
  const message = question
    ? 'Hi Smriti, I have a question from Ask Muffin: ' + question
    : 'Hi Smriti, I’d like to plan a cake. My celebration date, guest count and design ideas are:';
  muffinHandoff.href = 'https://wa.me/919082355387?text=' + encodeURIComponent(message);
  muffinHandoff.hidden = false;
}
for (const [topic, , answer] of muffinTopics) {
  const button = document.createElement('button');
  button.className = 'pill';
  button.textContent = topic;
  button.onclick = () => replyAsMuffin(answer);
  $('#muffin-topics').append(button);
}
$('#muffin-form').onsubmit = event => {
  event.preventDefault();
  const question = new FormData(event.target).get('question').trim();
  if (!question) {
    $('#muffin-answer').textContent = 'Type a question for Muffin.';
    muffinHandoff.hidden = true;
    return;
  }
  const matches = muffinTopics.filter(([, pattern]) => pattern.test(question));
  replyAsMuffin(matches.map(([, , answer]) => answer).join('\n\n'), question);
};
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
