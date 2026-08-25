const STEP_OPTIONS = {
  category: [
    { value: 'activity', title: 'Activity', sub: 'Museums, parks, markets, viewpoints' },
    { value: 'craft', title: 'Arts & Crafts', sub: 'Pottery, workshops, hands-on classes' },
    { value: 'food', title: 'Food Spot', sub: 'Restaurants, brunch, cafés' },
    { value: 'nightlife', title: 'Club / Nightlife', sub: 'Bars, clubs, live music' },
  ],
  vibe: [
    { value: 'chill', title: 'Chill', sub: 'Slow, easy, low-key' },
    { value: 'adventurous', title: 'Adventurous', sub: 'Something new, a bit bold' },
    { value: 'romantic', title: 'Romantic', sub: 'For two, or feeling it' },
    { value: 'social', title: 'Social', sub: 'Best with people around' },
    { value: 'productive', title: 'Productive', sub: 'Get something done' },
  ],
  budget: [
    { value: 'low', title: 'Free / Low-cost', sub: 'Keeping it light' },
    { value: 'mid', title: 'Mid-range', sub: 'Happy to spend a bit' },
    { value: 'splurge', title: 'Splurge', sub: 'Treat yourself' },
  ],
  time: [
    { value: 'morning', title: 'Morning', sub: '' },
    { value: 'afternoon', title: 'Afternoon', sub: '' },
    { value: 'evening', title: 'Evening', sub: '' },
    { value: 'late', title: 'Late night', sub: '' },
  ],
  area: [
    { value: 'central', title: 'Central', sub: 'West End, City, Southbank' },
    { value: 'north', title: 'North', sub: 'Camden, Islington, Hampstead' },
    { value: 'south', title: 'South', sub: 'Brixton, Greenwich, Battersea' },
    { value: 'east', title: 'East', sub: 'Shoreditch, Hackney, Canary Wharf' },
    { value: 'west', title: 'West', sub: 'Notting Hill, Kensington, Chelsea' },
    { value: 'any', title: 'Anywhere', sub: "Don't mind travelling" },
  ],
};

const CATEGORY_LABELS = {
  activity: 'Activity',
  craft: 'Arts & Crafts',
  food: 'Food Spot',
  nightlife: 'Club / Nightlife',
};

const STEP_IDS = ['category', 'vibe', 'budget', 'time', 'area'];

let currentStepIndex = 0;
let answers = {};
let lastResultName = null;

function renderOptions(key, list, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  list.forEach((opt) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option-card';
    btn.innerHTML = `<span class="opt-title">${opt.title}</span>` +
      (opt.sub ? `<span class="opt-sub">${opt.sub}</span>` : '');
    btn.addEventListener('click', () => selectOption(key, opt.value));
    container.appendChild(btn);
  });
}

function selectOption(key, value) {
  answers[key] = value;
  if (currentStepIndex < STEP_IDS.length - 1) {
    currentStepIndex++;
    renderStep();
  } else {
    showResult();
  }
}

function showIntro() {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  document.getElementById('screen-intro').classList.add('active');
  setProgressVisible(false);
}

function renderStep() {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  const activeId = 'screen-' + STEP_IDS[currentStepIndex];
  document.getElementById(activeId).classList.add('active');
  setProgressVisible(true);
  updateProgress();
}

function setProgressVisible(visible) {
  document.getElementById('progress').style.visibility = visible ? 'visible' : 'hidden';
}

function updateProgress() {
  const dots = document.querySelectorAll('#progress .dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('filled', i < currentStepIndex);
    dot.classList.toggle('current', i === currentStepIndex);
  });
}

function handleBack() {
  if (currentStepIndex > 0) {
    currentStepIndex--;
    renderStep();
  } else {
    showIntro();
  }
}

function pickSpot(excludeName) {
  const { category, vibe, budget, time, area } = answers;
  const pool = SPOTS.filter((s) => s.category === category);
  const areaMatch = (s) => area === 'any' || s.area.includes(area);

  // Relax constraints in order (area, then time, then budget, then vibe) until something
  // matches, so odd combinations (e.g. romantic + nightlife) always return a plausible real spot.
  const attempts = [
    (s) => areaMatch(s) && s.vibes.includes(vibe) && s.budgets.includes(budget) && s.times.includes(time),
    (s) => s.vibes.includes(vibe) && s.budgets.includes(budget) && s.times.includes(time),
    (s) => s.vibes.includes(vibe) && s.budgets.includes(budget),
    (s) => s.vibes.includes(vibe),
    () => true,
  ];

  let matches = [];
  for (const test of attempts) {
    matches = pool.filter(test);
    if (matches.length) break;
  }

  if (excludeName && matches.length > 1) {
    matches = matches.filter((s) => s.name !== excludeName);
  }

  return matches[Math.floor(Math.random() * matches.length)];
}

function showResult() {
  const spot = pickSpot(null);
  lastResultName = spot.name;
  renderResult(spot);
}

function regenerate() {
  const spot = pickSpot(lastResultName);
  lastResultName = spot.name;
  renderResult(spot);
}

function renderResult(spot) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  document.getElementById('screen-result').classList.add('active');
  setProgressVisible(false);

  document.getElementById('result-category').textContent = CATEGORY_LABELS[spot.category];
  document.getElementById('result-name').textContent = spot.name;
  document.getElementById('result-desc').textContent = spot.description;

  const mapsQuery = encodeURIComponent(`${spot.name}, London`);
  document.getElementById('result-maps').href = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  const websiteLink = document.getElementById('result-website');
  if (spot.website) {
    websiteLink.href = spot.website;
    websiteLink.hidden = false;
  } else {
    websiteLink.hidden = true;
  }

  const meta = document.getElementById('result-meta');
  meta.innerHTML = '';
  const labels = [
    STEP_OPTIONS.vibe.find((o) => o.value === answers.vibe),
    STEP_OPTIONS.budget.find((o) => o.value === answers.budget),
    STEP_OPTIONS.time.find((o) => o.value === answers.time),
    answers.area !== 'any' ? STEP_OPTIONS.area.find((o) => o.value === answers.area) : null,
  ].filter(Boolean).map((o) => o.title);

  labels.forEach((label) => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = label;
    meta.appendChild(chip);
  });
}

function restart() {
  answers = {};
  lastResultName = null;
  currentStepIndex = 0;
  showIntro();
}

function init() {
  renderOptions('category', STEP_OPTIONS.category, 'options-category');
  renderOptions('vibe', STEP_OPTIONS.vibe, 'options-vibe');
  renderOptions('budget', STEP_OPTIONS.budget, 'options-budget');
  renderOptions('time', STEP_OPTIONS.time, 'options-time');
  renderOptions('area', STEP_OPTIONS.area, 'options-area');

  document.getElementById('btn-start').addEventListener('click', () => {
    currentStepIndex = 0;
    renderStep();
  });
  document.querySelectorAll('[data-back]').forEach((btn) => btn.addEventListener('click', handleBack));
  document.getElementById('btn-regenerate').addEventListener('click', regenerate);
  document.getElementById('btn-restart').addEventListener('click', restart);

  setProgressVisible(false);
}

init();
