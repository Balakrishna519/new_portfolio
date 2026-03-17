(() => {
  // -------- Theme toggle --------
  const themeToggle = document.getElementById('themeToggle');
  const preferred = localStorage.getItem('theme');
  if (preferred) document.documentElement.setAttribute('data-theme', preferred);
  themeToggle?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') || 'light';
    const next = cur === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  // -------- Year --------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // -------- Filters --------
  const grid = document.getElementById('projectGrid');
  if (grid) {
    document.querySelectorAll('.filter').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const key = btn.dataset.filter || 'all';
        grid.querySelectorAll('.project').forEach(card => {
          const tags = card.getAttribute('data-tags') || '';
          card.style.display = (key === 'all' || tags.includes(key)) ? 'flex' : 'none';
        });
      });
    });
  }

  // -------- Reveal on scroll --------
 const revealEls=document.querySelectorAll('.reveal');
if(revealEls.length){
const io=new IntersectionObserver((entries,observer)=>{
entries.forEach(e=>{
if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}
})
},{threshold:.15});
revealEls.forEach(el=>io.observe(el));
}



  // -------- Toast --------
  function toast(msg) {
    const t = document.createElement('div');
    t.textContent = msg;
    Object.assign(t.style, {
      position: 'fixed', bottom: '18px', left: '50%', transform: 'translateX(-50%)',
      background: 'linear-gradient(135deg, var(--brand, #a7f3d0), var(--brand-2, #93c5fd))',
      color: '#0b0c10', padding: '10px 14px', borderRadius: '999px',
      boxShadow: 'var(--shadow, 0 10px 30px rgba(0,0,0,.15))', zIndex: '1000'
    });
    document.body.appendChild(t);
    setTimeout(() => { t.remove(); }, 2200);
  }
  window.toast = toast;

  // -------- Project modal (<dialog id="modal">) --------
  const projectDialog = document.getElementById('modal'); // expected to be a <dialog>
  function openModal(key) {
    const titleMap = { portfolio: 'Personal Portfolio', attendance: 'Student Attendance Manager', nxtwave: 'NxtWave Clone' };
    const title = titleMap[key] || 'Project';
    const titleEl = document.getElementById('m-title');
    const bodyEl = document.getElementById('m-body');
    const tpl = document.getElementById('tpl-' + key);

    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.innerHTML = tpl?.innerHTML || '';

    if (projectDialog?.showModal) projectDialog.showModal();
    else projectDialog?.classList.add('open'); // fallback if not <dialog>
  }
  function closeModal() {
    if (projectDialog?.close) projectDialog.close();
    else projectDialog?.classList.remove('open');
  }
  window.openModal = openModal;
  window.closeModal = closeModal;

  // -------- Resume buttons --------
  const RESUME_URL = 'resume.pdf'; // replace with your real file path
  const resumeBtn = document.getElementById('resumeBtn');
  const resumeDownload = document.getElementById('resumeDownload');
  const contact = document.getElementById('contact');

  resumeBtn?.addEventListener('click', () => {
    toast('Scroll to Contact section for the download link');
    contact?.scrollIntoView({ behavior: 'smooth' });
  });

  resumeDownload?.addEventListener('click', (e) => {
    e.preventDefault();
    if (RESUME_URL === 'resume.pdf') toast('Add your real resume.pdf beside index.html');
    window.open(RESUME_URL, '_blank');
  });

  // -------- Certificate popup / modal --------
  const certModal = document.getElementById('certModal');
  const certImg   = document.getElementById('certImg');
  const certTitle = document.getElementById('certTitle');
  const certOrg   = document.getElementById('certOrg');
  const openFull  = document.getElementById('openFull');
  let lastFocused = null;

  /**
   * Open certificate viewer
   * @param {string} src - image url
   * @param {string} title - certificate name
   * @param {string} org - issuer
   * @param {'popup'|'modal'} mode - visual style; 'popup' (default) = bottom-right message
   */
  function openCert(src, title, org, mode = 'popup'){
    if(!certModal || !certImg) return;
    lastFocused = document.activeElement;

    // content
    certImg.src = src || '';
    certImg.alt = `${title || 'Certificate'} – ${org || ''}`;
    certTitle.textContent = title || 'Certificate';
    certOrg.textContent = org || '';
    if (openFull) openFull.href = src || '#';

    // visual mode
    certModal.classList.remove('closing');
    certModal.classList.toggle('popup', mode === 'popup');

    // show
    certModal.classList.add('open');
    certModal.setAttribute('aria-hidden','false');

    // scroll lock only for centered modal; popup keeps page scrollable
    if (mode !== 'popup') document.body.classList.add('body-lock');

    // focus
    certModal.querySelector('.modal-close')?.focus();
  }

  function closeCert(){
    if(!certModal) return;
    certModal.classList.add('closing');

    const isPopup = certModal.classList.contains('popup');
    const timeout = isPopup ? 200 : 180;

    setTimeout(() => {
      certModal.classList.remove('open','closing');
      certModal.setAttribute('aria-hidden','true');
      document.body.classList.remove('body-lock');
      if (certImg) certImg.src = '';
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }, timeout);
  }

  // backdrop click closes only when centered modal (not popup)
  certModal?.addEventListener('click', (e) => {
    const isPopup = certModal.classList.contains('popup');
    if (!isPopup && e.target === certModal) closeCert();
  });

  // ESC to close
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && certModal?.classList.contains('open')) closeCert();
  });

  // Expose globally for inline onclicks
  window.openCert = openCert;
  window.closeCert = closeCert;
})();




// ---- Header link active state on scroll ----
const navLinks = [...document.querySelectorAll('.nav .links a[href^="#"]')];
const sections = navLinks
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

function setActiveLink() {
  const scrollY = window.scrollY + 120; // offset for sticky header
  let current = sections[0];

  for (const sec of sections) {
    if (sec.offsetTop <= scrollY) current = sec;
  }

  navLinks.forEach(a => a.classList.toggle(
    'active',
    current && a.getAttribute('href') === `#${current.id}`
  ));
}

setActiveLink();
window.addEventListener('scroll', setActiveLink, { passive: true });
window.addEventListener('resize', setActiveLink);



// ---- Mobile menu toggle ----
const menuBtn = document.getElementById('menuToggle');
const linksBox = document.getElementById('primaryLinks');

menuBtn?.addEventListener('click', () => {
  const isOpen = linksBox?.classList.toggle('open');
  if (menuBtn) menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});

// Close menu after selecting a link (mobile)
linksBox?.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('click', () => {
    if (linksBox.classList.contains('open')) {
      linksBox.classList.remove('open');
      menuBtn?.setAttribute('aria-expanded', 'false');
    }
  });
});


/* SCROLL REVEAL */
/* SCROLL REVEAL */
/*
const revealElements = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver((entries) => {

  entries.forEach(entry => {

    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }

  });

}, { threshold: 0.15 });

revealElements.forEach(el => observer.observe(el));*/


/* MOBILE MENU */

const menuToggleBtn = document.getElementById("menuToggle");
const navMenu = document.getElementById("primaryLinks");

menuToggleBtn.addEventListener("click", () => {

  navMenu.classList.toggle("open");

});



const revealElements = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, { threshold: 0.2 });

revealElements.forEach(el => observer.observe(el));