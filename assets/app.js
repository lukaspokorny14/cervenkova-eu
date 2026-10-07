const CONFIG = {"form":{"endpoint":"https://formspree.io/f/xzedblnp","privacyReviewed":true,"title":"Nezávazné objednání","bookingText":"Závazně se můžete objednat telefonicky (607 836 430, preferuji SMS, pokud mám sezení, hovory nepřijímám) nebo prostřednictvím e-mailu (veronika@cervenkova.eu). Potřebuji jen orientačně vědět, s čím se potýkáte a jaké jsou vaše časové možnosti. Domluvíme si termín prvního setkání a na něm probereme všechno potřebné. Po první návštěvě si rozmyslíte, zda máte zájem ve spolupráci pokračovat.\n\nPro nezávazné objednání lze využít následující formulář.","note":"Vybrané datum je pouze vaše preference. Formulář nezobrazuje volné termíny a odesláním nevzniká potvrzená rezervace. Termín si domluvíme osobně.","fields":{"name":"Jméno a příjmení","email":"E-mail","phone":"Telefon","date":"Preferované datum","message":"Vzkaz"},"messageHint":"Do zprávy prosím uvádějte pouze stručné informace potřebné k navázání kontaktu. Neposílejte zdravotnickou dokumentaci ani podrobnou zdravotní historii.","dateHint":"Zvolte preferovaný den; nejde o nabídku volných termínů.","privacyText":"Odesláním formuláře berete na vědomí","privacyLinkLabel":"informace o zpracování osobních údajů","privacyTextAfter":".","submit":"Odeslat nezávaznou žádost","loading":"Odesílám…","success":"Děkuji za zprávu. Vaše žádost byla odeslána. Ozvu se vám ohledně potvrzení termínu. Odeslání formuláře není potvrzením rezervace.","error":"Zprávu se nepodařilo odeslat. Vaše údaje zůstaly vyplněné. Zkuste to znovu nebo mě kontaktujte e-mailem či SMS.","rateLimit":"Odeslání je nyní dočasně omezené. Zkuste to později nebo mě kontaktujte e-mailem či SMS.","timeout":"Nepodařilo se ověřit výsledek odeslání. Žádost mohla dorazit. Než ji odešlete znovu, ověřte prosím přijetí e-mailem nebo SMS.","unavailable":"Formulář je nyní nedostupný. Pro objednání prosím využijte e-mail nebo SMS uvedené výše.","noScript":"Pro odeslání formuláře je potřeba JavaScript. Můžete se objednat také e-mailem nebo SMS.","required":"Vyplňte prosím toto pole.","invalidEmail":"Zadejte platnou e-mailovou adresu.","invalidPhone":"Zadejte telefonní číslo s 9 až 15 číslicemi; můžete použít +, mezery, pomlčky a závorky.","invalidDate":"Vyberte prosím dnešní nebo budoucí datum.","invalidName":"Zadejte prosím jméno a příjmení.","invalidMessage":"Napište prosím krátký vzkaz.","invalidSummary":"Zkontrolujte prosím označená pole.","subject":"Nezávazná žádost o termín – cervenkova.eu","honeypot":"Toto pole ponechte prázdné"},"legacy":{"main":"","services":"terapie/","visit":"#objednani","pricing":"#cenik","about":"o-mne/","info":"#kontakt"},"base":"/"};
'use strict';
document.documentElement.classList.add('js');

// GitHub Pages neumí serverové přesměrování původních PHP adres.
if (/\/index\.php$/.test(location.pathname)) {
  const page = new URLSearchParams(location.search).get('page') || 'main';
  if (Object.hasOwn(CONFIG.legacy, page)) location.replace(CONFIG.base + CONFIG.legacy[page]);
}

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
function closeMenu(restoreFocus = false) {
  nav?.classList.remove('is-open');
  toggle?.setAttribute('aria-expanded', 'false');
  if (toggle) toggle.querySelector('span').textContent = toggle.dataset.open;
  if (restoreFocus) toggle?.focus();
}
toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.querySelector('span').textContent = open ? toggle.dataset.close : toggle.dataset.open;
  nav.classList.toggle('is-open', open);
});
nav?.addEventListener('click', e => { if(e.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') closeMenu(true); });
document.addEventListener('click', e => { if(!e.target.closest('.header')) closeMenu(); });
matchMedia('(min-width: 761px)').addEventListener('change', () => closeMenu());

const form = document.querySelector('#booking-form');
if (form) {
  const copy = CONFIG.form;
  const submit = form.querySelector('[type=submit]');
  const status = document.querySelector('#form-status');
  const fields = [...form.querySelectorAll('[required]')];
  const date = form.elements.preferred_date;
  let pending = false;
  const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };
  date.min = today();
  date.addEventListener('focus',()=> { date.min=today(); });
  submit.disabled = false;
  function announce(message,state) {
    status.textContent=message;
    status.dataset.state=state;
    status.focus({preventScroll:true});
  }
  function validate(field) {
    const value=field.value.trim();
    let message='';
    if (!value) message=copy.required;
    else if(field.id==='email' && (field.validity.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) message=copy.invalidEmail;
    else if(field.id==='phone' && (!/^\+?[\d\s()\-]+$/.test(value) || value.replace(/\D/g,'').length<9 || value.replace(/\D/g,'').length>15)) message=copy.invalidPhone;
    else if(field.id==='date' && (field.validity.badInput || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value<today())) message=copy.invalidDate;
    else if(field.id==='name' && (value.length<3 || !/\S\s+\S/.test(value))) message=copy.invalidName;
    else if(field.id==='message' && value.length<2) message=copy.invalidMessage;
    field.setAttribute('aria-invalid',String(Boolean(message)));
    document.querySelector(`#${field.id}-error`).textContent=message;
    return !message;
  }
  fields.forEach(field=> {
    field.addEventListener('blur',()=> { if(field.value || field.hasAttribute('aria-invalid')) validate(field); });
    field.addEventListener('input',()=> { if(field.getAttribute('aria-invalid')==='true') validate(field); });
  });
  form.addEventListener('submit',async event=> {
    event.preventDefault();
    if(pending) return;
    const valid=fields.map(validate).every(Boolean);
    if(!valid) {
      status.textContent=copy.invalidSummary;
      status.dataset.state='error';
      fields.find(field=>field.getAttribute('aria-invalid')==='true')?.focus();
      return;
    }
    if(form.elements._gotcha.value) { announce(copy.error,'error'); return; }
    if(copy.endpoint==='TO_BE_CONFIGURED' || !copy.privacyReviewed) { announce(copy.unavailable,'error'); return; }
    pending=true;
    submit.disabled=true;
    submit.textContent=copy.loading;
    form.setAttribute('aria-busy','true');
    status.textContent='';
    const data=new FormData(form);
    data.set('_subject',copy.subject);
    for(const field of fields) data.set(field.name,field.value.trim());
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),20000);
    try {
      const response=await fetch(copy.endpoint,{method:'POST',body:data,headers:{Accept:'application/json'},signal:controller.signal,credentials:'omit'});
      if(!response.ok) { announce(response.status===429?copy.rateLimit:copy.error,'error'); return; }
      const result = await response.json().catch(()=>null);
      if(!result || (result.ok!==true && !result.next)) { announce(copy.error,'error'); return; }
      form.reset();
      fields.forEach(field=> { field.removeAttribute('aria-invalid'); document.querySelector(`#${field.id}-error`).textContent=''; });
      announce(copy.success,'success');
    } catch(error) {
      announce(error.name==='AbortError'?copy.timeout:copy.error,'error');
    } finally {
      clearTimeout(timeout);
      pending=false;
      submit.disabled=false;
      submit.textContent=copy.submit;
      form.removeAttribute('aria-busy');
    }
  });
}
