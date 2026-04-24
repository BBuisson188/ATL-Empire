"use strict";

const STARTING_CASH = 1500;
const PASS_GO = 200;
const TRAFFIC_FINE = 50;
const MAX_PLAYERS = 4;
const STORAGE_KEY = "atlEmpireSave";
const SAVE_INDEX_KEY = "atlEmpireSaveIndex";
const SAVE_SLOT_PREFIX = "atlEmpireSave:";
const MOVE_STEP_MS = 1000;
const playerColors = ["#2563eb", "#dc2626", "#16a34a", "#d97706"];

const tokens = [
  { id: "peach", name: "Peach", asset: "peach.png" },
  { id: "peanut", name: "Peanut", asset: "peanut.png" },
  { id: "coke", name: "Coke Bottle", asset: "coke.png" },
  { id: "jet", name: "Delta Jet", asset: "jet.png" },
  { id: "camera", name: "Movie Camera", asset: "camera.png" },
  { id: "record", name: "Vinyl Record", asset: "record.png" },
  { id: "torch", name: "Olympic Torch", asset: "torch.png" },
  { id: "sandwich", name: "Chicken Sandwich", asset: "sandwich.png" }
];

const botProfiles = {
  conservative: { label: "Conservative", buyAt: 0.65, auction: 0.62, reserve: 450, buildReserve: 600 },
  balanced: { label: "Balanced", buyAt: 0.88, auction: 0.82, reserve: 280, buildReserve: 420 },
  aggressive: { label: "Aggressive", buyAt: 1.15, auction: 1.02, reserve: 120, buildReserve: 240 },
  collector: { label: "Collector", buyAt: 1.0, auction: 0.92, reserve: 220, buildReserve: 360 }
};

const groups = {
  brown: { name: "Real Estate", color: "#7b4f36", houseCost: 50 },
  lightBlue: { name: "Malls", color: "#80c8e8", houseCost: 50 },
  pink: { name: "Schools", color: "#d65aa0", houseCost: 100 },
  orange: { name: "Sports", color: "#f08a24", houseCost: 100 },
  red: { name: "Districts", color: "#cf3f36", houseCost: 150 },
  yellow: { name: "Mixed-Use", color: "#f4c84a", houseCost: 150 },
  green: { name: "Attractions", color: "#3d9b5c", houseCost: 200 },
  darkBlue: { name: "Airports", color: "#274b9f", houseCost: 200 },
  trail: { name: "Trails", color: "#607d3b" },
  utility: { name: "Utilities", color: "#64748b" }
};

const propertyStats = [
  ["brown", 60, [2, 10, 30, 90, 160, 250]],
  ["brown", 60, [4, 20, 60, 180, 320, 450]],
  ["lightBlue", 100, [6, 30, 90, 270, 400, 550]],
  ["lightBlue", 100, [6, 30, 90, 270, 400, 550]],
  ["lightBlue", 120, [8, 40, 100, 300, 450, 600]],
  ["pink", 140, [10, 50, 150, 450, 625, 750]],
  ["pink", 140, [10, 50, 150, 450, 625, 750]],
  ["pink", 160, [12, 60, 180, 500, 700, 900]],
  ["orange", 180, [14, 70, 200, 550, 750, 950]],
  ["orange", 180, [14, 70, 200, 550, 750, 950]],
  ["orange", 200, [16, 80, 220, 600, 800, 1000]],
  ["red", 220, [18, 90, 250, 700, 875, 1050]],
  ["red", 220, [18, 90, 250, 700, 875, 1050]],
  ["red", 240, [20, 100, 300, 750, 925, 1100]],
  ["yellow", 260, [22, 110, 330, 800, 975, 1150]],
  ["yellow", 260, [22, 110, 330, 800, 975, 1150]],
  ["yellow", 280, [24, 120, 360, 850, 1025, 1200]],
  ["green", 300, [26, 130, 390, 900, 1100, 1275]],
  ["green", 300, [26, 130, 390, 900, 1100, 1275]],
  ["green", 320, [28, 150, 450, 1000, 1200, 1400]],
  ["darkBlue", 350, [35, 175, 500, 1100, 1300, 1500]],
  ["darkBlue", 400, [50, 200, 600, 1400, 1700, 2000]]
];

let statCursor = 0;
const board = [
  corner("go", "Peachtree Street", "Collect $200 when you pass."),
  deed("Hirsch Realty", "brown", "A boutique brokerage square with a polished front-door key."),
  cardSpace("community", "Hotlanta Community", "arthur-m-blank-family-foundation"),
  deed("Bolst", "brown", "A modern brokerage card with clean signs and city blocks."),
  tax("Georgia Income Tax", 200),
  trail("PATH400"),
  deed("Lenox Square", "lightBlue", "A mall facade with glass doors and busy Peachtree shoppers."),
  cardSpace("chance", "Peachtree Chance"),
  deed("Perimeter Mall", "lightBlue", "A suburban shopping hub with a bright circular atrium."),
  deed("Phipps Plaza", "lightBlue", "A luxury mall card with gold trim and valet lights."),
  corner("traffic", "Stuck in Rush Hour", "Just visiting unless you were sent here."),
  deed("Whitefield Academy", "pink", "A school crest, chapel roofline, and neat green quad."),
  utility("Georgia Power"),
  deed("Marist School", "pink", "A campus card with classic brick and blue-green fields."),
  deed("Heritage Prep", "pink", "A small school card with a chapel bell and warm windows.", "heritage-preparatory-school"),
  trail("Stone Mtn Trail", "stone-mountain-trail"),
  deed("Atlanta Hawks", "orange", "A basketball court card with red and gold streaks."),
  cardSpace("community", "Hotlanta Community", "arthur-m-blank-family-foundation"),
  deed("Atlanta Braves", "orange", "A baseball night-game card with navy lights and a home-plate glow."),
  deed("Atlanta Falcons", "orange", "A football card with red-black speed lines and stadium lights."),
  corner("lottery", "Georgia Lottery", "Collect the jackpot pot when the house rule is on."),
  deed("Vinings", "red", "A riverside district card with dining lights and tree-lined streets."),
  cardSpace("chance", "Peachtree Chance"),
  deed("Decatur", "red", "A courthouse square card with restaurants, rails, and old brick."),
  deed("Buckhead", "red", "A skyline district card with polished towers and late-night traffic."),
  trail("Silver Comet Trail"),
  deed("The Battery Atlanta", "yellow", "A mixed-use ballpark district with lights and walkable streets."),
  deed("Atlantic Station", "yellow", "A city shopping district card with bridges, shops, and apartments."),
  utility("AT&T Fiber"),
  deed("Ponce City Market", "yellow", "A landmark brick market card with rooftop lights and food hall buzz."),
  corner("goToTraffic", "Take I-285 at 5PM", "Go directly to rush hour traffic."),
  deed("College Football Hall of Fame", "green", "A helmet wall and downtown attraction card."),
  deed("World of Coca-Cola", "green", "A museum card with red glass, bubbles, and a silver bottle."),
  cardSpace("community", "Hotlanta Community", "arthur-m-blank-family-foundation"),
  deed("Georgia Aquarium", "green", "A blue glass attraction card with whale-shark silhouettes."),
  trail("Atlanta BeltLine"),
  cardSpace("chance", "Peachtree Chance"),
  deed("Peachtree DeKalb", "darkBlue", "A polished private jet waiting on the runway.", "peachtree-dekalb-airport"),
  tax("City of Atlanta Property Tax", 100),
  deed("Hartsfield Jackson", "darkBlue", "A jumbo jet lifting over the world's busiest runway.", "hartsfield-jackson-airport")
].map((space, index) => ({ ...space, index }));

function corner(kind, name, description) {
  return { type: kind, name, description };
}

function cardSpace(deck, name, assetSlug = "") {
  return { type: "card", deck, name, assetSlug, description: deck === "chance" ? "Draw a Peachtree Chance card." : "Draw a Hotlanta Community card." };
}

function tax(name, amount) {
  return { type: "tax", name, amount, description: `Pay $${amount}.` };
}

function deed(name, group, art, assetSlug = "") {
  const [statGroup, price, rent] = propertyStats[statCursor++];
  if (statGroup !== group) throw new Error(`Property stat mismatch for ${name}`);
  return { type: "property", kind: "deed", name, group, price, mortgage: Math.floor(price / 2), houseCost: groups[group].houseCost, rent, art, assetSlug };
}

function trail(name, assetSlug = "") {
  return { type: "property", kind: "trail", name, group: "trail", price: 200, mortgage: 100, rent: [25, 50, 100, 200], art: "A green path card with mile markers, trees, bikes, and skyline hints.", assetSlug };
}

function utility(name, assetSlug = "") {
  return { type: "property", kind: "utility", name, group: "utility", price: 150, mortgage: 75, rent: [], art: name.includes("Power") ? "A utility card with bright substations and Atlanta streetlights." : "A utility card with glowing fiber lines under the city grid.", assetSlug };
}

const chanceCards = [
  { text: "Take a direct flight to Hartsfield Jackson.", action: { type: "advance", to: "Hartsfield Jackson" } },
  { text: "Cruise back to Peachtree Street. Collect $200.", action: { type: "advance", to: "Peachtree Street" } },
  { text: "Head to Buckhead for a meeting. If you pass Peachtree Street, collect $200.", action: { type: "advance", to: "Buckhead" } },
  { text: "Meet friends at Lenox Square. If you pass Peachtree Street, collect $200.", action: { type: "advance", to: "Lenox Square" } },
  { text: "Hop onto the nearest trail. If owned, pay double trail rent.", action: { type: "nearest", kind: "trail", multiplier: 2 } },
  { text: "Bike to the nearest trail. If owned, pay double trail rent.", action: { type: "nearest", kind: "trail", multiplier: 2 } },
  { text: "Your phone is searching for the nearest utility. Roll dice and pay 10 times the roll if owned.", action: { type: "nearest", kind: "utility", multiplier: 10 } },
  { text: "A film shoot uses your driveway. Collect $50.", action: { type: "collect", amount: 50 } },
  { text: "Peach Pass. Keep this card until you need to escape rush hour traffic.", action: { type: "peachPass" } },
  { text: "Wrong turn near Spaghetti Junction. Go back 3 spaces.", action: { type: "moveRelative", amount: -3 } },
  { text: "Take I-285 at 5PM. Go directly to rush hour traffic.", action: { type: "goTraffic" } },
  { text: "Condo association repairs are due. Pay $25 per condo and $100 per tower.", action: { type: "repairs", condo: 25, tower: 100 } },
  { text: "Speeding fine on the connector. Pay $15.", action: { type: "pay", amount: 15, pot: true } },
  { text: "Take a BeltLine detour. Advance to Atlanta BeltLine. If you pass Peachtree Street, collect $200.", action: { type: "advance", to: "Atlanta BeltLine" } },
  { text: "You chaired the neighborhood board. Pay each player $50.", action: { type: "payEach", amount: 50 } },
  { text: "Your building loan matures. Collect $150.", action: { type: "collect", amount: 150 } }
];

const communityCards = [
  { text: "Advance to Peachtree Street. Collect $200.", action: { type: "advance", to: "Peachtree Street" } },
  { text: "Production office overpaid your location fee. Collect $200.", action: { type: "collect", amount: 200 } },
  { text: "Cut down a tree without an arborist permit. Pay $50.", action: { type: "pay", amount: 50, pot: true } },
  { text: "You sell stock in a local startup. Collect $50.", action: { type: "collect", amount: 50 } },
  { text: "Peach Pass. Keep this card until you need to escape rush hour traffic.", action: { type: "peachPass" } },
  { text: "Traffic report says I-285 is stopped. Go directly to rush hour traffic.", action: { type: "goTraffic" } },
  { text: "Holiday fund matures at your credit union. Receive $100.", action: { type: "collect", amount: 100 } },
  { text: "Georgia income tax refund. Collect $20.", action: { type: "collect", amount: 20 } },
  { text: "It's your birthday dinner on the BeltLine. Collect $10 from every player.", action: { type: "collectEach", amount: 10 } },
  { text: "You got cast as a background extra in an Atlanta film shoot. Collect $100.", action: { type: "collect", amount: 100 } },
  { text: "Hospital fees after a pickup game injury. Pay $100.", action: { type: "pay", amount: 100, pot: true } },
  { text: "Preschool tuition deposit is due. Pay $50.", action: { type: "pay", amount: 50, pot: true } },
  { text: "Consulting fee from an Atlanta nonprofit. Receive $25.", action: { type: "collect", amount: 25 } },
  { text: "Street repairs on your block. Pay $40 per condo and $115 per tower.", action: { type: "repairs", condo: 40, tower: 115 } },
  { text: "You win second prize at the neighborhood festival. Collect $10.", action: { type: "collect", amount: 10 } },
  { text: "You inherit a Midtown condo deposit. Collect $100.", action: { type: "collect", amount: 100 } }
];

let game = null;

const els = {
  setup: document.getElementById("setup"),
  game: document.getElementById("game"),
  setupForm: document.getElementById("setup-form"),
  humanCount: document.getElementById("human-count"),
  botCount: document.getElementById("bot-count"),
  gameName: document.getElementById("game-name"),
  lotteryToggle: document.getElementById("lottery-toggle"),
  playerConfigs: document.getElementById("player-configs"),
  savedGamesPanel: document.getElementById("saved-games-panel"),
  savedGamesList: document.getElementById("saved-games-list"),
  board: document.getElementById("board"),
  gameTitle: document.getElementById("game-title"),
  activePlayer: document.getElementById("active-player"),
  dice: document.getElementById("dice"),
  statusLine: document.getElementById("status-line"),
  actionButtons: document.getElementById("action-buttons"),
  playersList: document.getElementById("players-list"),
  spaceDetail: document.getElementById("space-detail"),
  gameLog: document.getElementById("game-log"),
  panelTabs: [...document.querySelectorAll("[data-panel-tab]")],
  panelSections: [...document.querySelectorAll("[data-panel-section]")],
  modal: document.getElementById("modal"),
  modalContent: document.getElementById("modal-content"),
  playMode: document.getElementById("play-mode"),
  popover: document.getElementById("space-popover"),
  saveGame: document.getElementById("save-game"),
  newGame: document.getElementById("new-game"),
  artLightbox: document.getElementById("art-lightbox"),
  artLightboxImage: document.getElementById("art-lightbox-image"),
  cardGalleryRoot: document.getElementById("card-gallery-root")
};

let modalKind = "default";
let currentPanelTab = "space";

init();

function init() {
  clearLegacyOfflineCache();
  registerGlobalUiEvents();
  if (els.cardGalleryRoot) {
    renderCardGalleryPage();
    return;
  }
  if (!els.setup || !els.game) return;
  migrateLegacySave();
  renderSetupPlayers();
  renderSavedGamesList();
  els.humanCount.addEventListener("change", syncCounts);
  els.botCount.addEventListener("change", syncCounts);
  els.setupForm.addEventListener("submit", startGameFromSetup);
  els.saveGame.addEventListener("click", saveGame);
  els.playMode.addEventListener("click", togglePlayMode);
  els.panelTabs.forEach((buttonEl) => {
    buttonEl.addEventListener("click", () => setPanelTab(buttonEl.dataset.panelTab));
  });
  window.addEventListener("resize", () => {
    normalizePanelTab();
    syncPanelTabs();
  });
  els.newGame.addEventListener("click", () => {
    location.reload();
  });
  if (els.savedGamesList) {
    els.savedGamesList.addEventListener("click", handleSavedGamesClick);
  }
}

function clearLegacyOfflineCache() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister().catch(() => {}));
    }).catch(() => {});
  }
  if ("caches" in window) {
    caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))).catch(() => {});
  }
}

function registerGlobalUiEvents() {
  document.addEventListener("click", (event) => {
    const zoomTarget = event.target.closest("[data-zoom-src]");
    if (zoomTarget) {
      event.stopPropagation();
      openArtLightbox(zoomTarget.dataset.zoomSrc, zoomTarget.dataset.zoomTitle || "");
      return;
    }
    if (els.popover && !els.popover.classList.contains("hidden") && !event.target.closest(".space-popover") && !event.target.closest(".space")) {
      closeSpacePopover();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeArtLightbox();
  });
  if (els.artLightbox) els.artLightbox.addEventListener("click", closeArtLightbox);
}

function syncCounts() {
  const humans = Number(els.humanCount.value);
  const maxBots = MAX_PLAYERS - humans;
  [...els.botCount.options].forEach((option) => {
    option.disabled = Number(option.value) > maxBots;
  });
  if (Number(els.botCount.value) > maxBots) els.botCount.value = String(maxBots);
  renderSetupPlayers();
}

function renderSetupPlayers() {
  const humans = Number(els.humanCount.value);
  const bots = Number(els.botCount.value);
  els.playerConfigs.innerHTML = "";
  let tokenCursor = 0;
  for (let i = 0; i < humans; i++) {
    els.playerConfigs.appendChild(playerConfigRow({ index: i, type: "human", name: `Player ${i + 1}`, tokenIndex: tokenCursor++ }));
  }
  for (let i = 0; i < bots; i++) {
    const profile = Object.keys(botProfiles)[i % 4];
    els.playerConfigs.appendChild(playerConfigRow({ index: humans + i, type: "bot", name: botProfiles[profile].label, tokenIndex: tokenCursor++, profile }));
  }
}

function playerConfigRow({ index, type, name, tokenIndex, profile = "balanced" }) {
  const row = document.createElement("div");
  row.className = "player-config";
  row.innerHTML = `
    <span class="player-type">${type === "bot" ? "AI" : "Human"}</span>
    <label>Name<input data-player-name="${index}" value="${name}" maxlength="18"></label>
    <label>Piece<select data-player-token="${index}">${tokens.map((token, i) => `<option value="${token.id}" ${i === tokenIndex ? "selected" : ""}>${token.name}</option>`).join("")}</select></label>
    ${type === "bot" ? `<label>Style<select data-player-profile="${index}">${Object.entries(botProfiles).map(([id, data]) => `<option value="${id}" ${id === profile ? "selected" : ""}>${data.label}</option>`).join("")}</select></label>` : ""}
  `;
  return row;
}

function startGameFromSetup(event) {
  event.preventDefault();
  const humans = Number(els.humanCount.value);
  const bots = Number(els.botCount.value);
  const total = Math.min(MAX_PLAYERS, humans + bots);
  const usedTokens = new Set();
  const players = [];
  for (let i = 0; i < total; i++) {
    const isBot = i >= humans;
    let token = document.querySelector(`[data-player-token="${i}"]`).value;
    if (usedTokens.has(token)) token = tokens.find((candidate) => !usedTokens.has(candidate.id)).id;
    usedTokens.add(token);
    players.push({
      id: `p${i}`,
      name: document.querySelector(`[data-player-name="${i}"]`).value.trim() || `Player ${i + 1}`,
      isBot,
      profile: isBot ? document.querySelector(`[data-player-profile="${i}"]`).value : "human",
      token,
      color: playerColors[i % playerColors.length],
      cash: STARTING_CASH,
      position: 0,
      inTraffic: false,
      trafficTurns: 0,
      peachPasses: 0,
      bankrupt: false
    });
  }
  game = {
    saveId: createSaveId(),
    title: els.gameName.value.trim() || "ATL Empire",
    players,
    current: 0,
    phase: "roll",
    animating: false,
    movingPlayerId: null,
    autoPlay: true,
    pending: null,
    debt: null,
    trafficExit: null,
    status: `${players[0].name}, roll to play.`,
    dice: [0, 0],
    doubles: 0,
    lotteryPot: 0,
    lotteryEnabled: els.lotteryToggle.checked,
    owners: {},
    improvements: {},
    mortgaged: {},
    lastCard: null,
    revealedCards: {
      chance: null,
      community: null
    },
    selectedSpaceIndex: 0,
    chanceDeck: shuffle([...Array(chanceCards.length).keys()]),
    communityDeck: shuffle([...Array(communityCards.length).keys()]),
    log: []
  };
  showGame();
  log("Game started. Each player begins with $1,500.");
  render();
  maybeRunBot();
}

function hydrate(saved) {
  const restored = {
    ...saved,
    log: saved.log || [],
    lastCard: saved.lastCard || null,
    autoPlay: saved.autoPlay !== false,
    pending: saved.pending || null,
    debt: saved.debt || null,
    trafficExit: saved.trafficExit || null,
    animating: false,
    movingPlayerId: null,
    revealedCards: {
      chance: saved.revealedCards?.chance || null,
      community: saved.revealedCards?.community || null
    },
    saveId: saved.saveId || createSaveId(),
    selectedSpaceIndex: Number.isInteger(saved.selectedSpaceIndex) ? saved.selectedSpaceIndex : saved.players?.[saved.current || 0]?.position || 0
  };
  restored.players.forEach((player, index) => {
    player.color = player.color || playerColors[index % playerColors.length];
    if (!tokens.some((token) => token.id === player.token)) player.token = tokens[index % tokens.length].id;
  });
  if (restored.phase === "rolling") restored.phase = "roll";
  if (!restored.status) restored.status = `${restored.players[restored.current]?.name || "Player"}, roll to play.`;
  return restored;
}

function showGame() {
  els.setup.classList.add("hidden");
  els.game.classList.remove("hidden");
  els.gameTitle.textContent = game.title;
  if (game.selectedSpaceIndex == null) game.selectedSpaceIndex = activePlayer().position;
  updatePlayModeButton();
}

function render() {
  normalizePanelTab();
  syncPanelTabs();
  renderBoard();
  renderPlayers();
  renderTurn();
  renderSpaceDetail(currentSelectedSpaceIndex());
  renderLog();
}

function renderBoard() {
  els.board.innerHTML = "";
  const currentPlayer = activePlayer();
  const center = document.createElement("div");
  center.className = "board-center";
  center.innerHTML = `
    <div class="center-frame">
      <img class="center-brand-image" src="assets/branding/atl-empire-board-logo-small.png" alt="ATL Empire board logo">
      <p class="center-tagline">Build districts, dodge traffic, and turn the city into your empire.</p>
      <div class="deck-row">
        ${renderDeckStack("chance")}
        ${renderCenterTurnConsole(currentPlayer)}
        ${renderDeckStack("community")}
      </div>
      <div class="center-status-row center-status-row-compact">
        <div class="center-note">
          <span>Lottery Pot</span>
          <strong>$${game.lotteryPot}</strong>
        </div>
      </div>
    </div>
    ${game.auction ? auctionDockHtml() : ""}
    ${game.debt ? debtDockHtml() : ""}
  `;
  els.board.appendChild(center);
  board.forEach((space) => {
    const owner = game.owners[space.index] ? playerById(game.owners[space.index]) : null;
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = `space ${space.type} ${space.group || ""} ${boardRingClass(space.index)} pos-${space.index} ${owner ? "owned" : ""} ${game.mortgaged[space.index] ? "mortgaged" : ""}`;
    cell.style.setProperty("--group-color", groups[space.group]?.color || "#d6cab1");
    if (owner) cell.style.setProperty("--owner-color", owner.color);
    cell.innerHTML = `
      <span class="space-glow"></span>
      ${owner ? `<span class="owner-flag" title="Owned by ${escapeHtml(owner.name)}"></span>` : ""}
      <span class="space-inner">
        ${space.group ? `<span class="color-band"></span>` : ""}
        <span class="space-label">${spaceLabel(space)}</span>
        <span class="space-art">${spaceArt(space, "thumb")}</span>
        <span class="space-name">${boardRingClass(space.index) === "space-corner" ? cornerName(space) : space.name}</span>
        ${space.price ? `<span class="space-price">$${space.price}</span>` : ""}
        <span class="tokens-here">${tokensOn(space.index)}</span>
      </span>
    `;
    cell.addEventListener("click", (event) => {
      event.stopPropagation();
      selectSpace(space.index, true);
      render();
      showSpacePopover(space.index, cell);
    });
    els.board.appendChild(cell);
  });
  els.board.querySelectorAll("[data-deck-preview]").forEach((deck) => {
    deck.addEventListener("click", () => {
      renderDeckDetail(deck.dataset.deckPreview);
    });
  });
  const dock = els.board.querySelector("[data-open-auction]");
  if (dock) dock.addEventListener("click", (event) => {
    event.stopPropagation();
    renderAuctionModal();
  });
  const debtDock = els.board.querySelector("[data-open-debt]");
  if (debtDock) debtDock.addEventListener("click", (event) => {
    event.stopPropagation();
    renderDebtModal();
  });
}

function auctionDockHtml() {
  const auction = game.auction;
  const space = board[auction.spaceIndex];
  const bidder = playerById(auction.active[auction.turn % auction.active.length]);
  return `
    <button type="button" class="auction-dock" data-open-auction>
      <span>Auction</span>
      <strong>${space.name}</strong>
      <em>${bidder ? `${bidder.name}'s turn` : "Open"}</em>
    </button>
  `;
}

function debtDockHtml() {
  const player = playerById(game.debt.playerId);
  return `
    <button type="button" class="debt-dock" data-open-debt>
      <span>Debt</span>
      <strong>${player.name} needs $${Math.abs(player.cash)}</strong>
      <em>Tap to choose how to raise cash</em>
    </button>
  `;
}

function renderPlayers() {
  els.playersList.innerHTML = game.players.map((player, index) => {
    const props = ownedProperties(player.id);
    return `
      <article class="player-card ${index === game.current ? "active" : ""} ${player.bankrupt ? "bankrupt" : ""}" data-player-detail="${player.id}" style="--player-color:${player.color}">
        <div class="player-main">
          <span class="player-token token-${player.token}" style="--token-color:${player.color}">${tokenMarkup(player.token)}</span>
          <div>
            <strong>${escapeHtml(player.name)}</strong>
            <span>${player.isBot ? botProfiles[player.profile].label : "Human"} · ${board[player.position].name}</span>
          </div>
        </div>
        <div class="money">$${player.cash}</div>
        <div class="mini-props"><b>${props.length} properties</b>${props.map((space) => `<span style="background:${groups[space.group].color}" title="${space.name}"></span>`).join("")}</div>
      </article>
    `;
  }).join("");
  els.playersList.querySelectorAll("[data-player-detail]").forEach((card) => {
    card.addEventListener("click", () => openPlayerDetail(card.dataset.playerDetail));
  });
}

function renderTurn() {
  const player = activePlayer();
  els.activePlayer.textContent = player.name;
  els.dice.innerHTML = `${dieMarkup(game.dice[0], "compact")}${dieMarkup(game.dice[1], "compact")}`;
  els.dice.setAttribute("aria-label", game.dice[0] ? `Dice showing ${game.dice[0]} and ${game.dice[1]}` : "Dice not rolled yet");
  els.statusLine.textContent = game.status || statusForCurrentTurn();
  els.actionButtons.innerHTML = `<p class="turn-panel-note">Use the board center controls to roll, resolve space actions, and end the turn.</p>`;
}

function button(label, action, disabled = false) {
  return `<button type="button" data-action="${action}" ${disabled ? "disabled" : ""}>${label}</button>`;
}

function renderSpaceDetail(index) {
  const space = board[index];
  const owner = game?.owners[index] ? playerById(game.owners[index]) : null;
  const improvements = game?.improvements[index] || 0;
  els.spaceDetail.innerHTML = `
    <article class="space-detail-card">
      <div class="detail-head">
        ${spaceArt(space, "detail")}
        <div class="detail-copy">
          <p class="detail-kicker">${spaceLabel(space)}</p>
          <h3>${space.name}</h3>
          <p>${space.description || space.art || ""}</p>
        </div>
      </div>
      ${space.price ? `<dl class="detail-grid">
        <dt>Price</dt><dd>$${space.price}</dd>
        <dt>Owner</dt><dd>${owner ? `<span class="detail-owner"><span class="player-dot" style="background:${owner.color}"></span>${escapeHtml(owner.name)}</span>` : "Unowned"}</dd>
        <dt>Mortgage</dt><dd>$${space.mortgage}</dd>
        ${space.kind === "deed" ? `<dt>Build</dt><dd>${improvements < 5 ? `${improvements} condo${improvements === 1 ? "" : "s"}` : "Tower"}</dd>` : ""}
        <dt>Rent</dt><dd>${rentSummary(space)}</dd>
      </dl>` : ""}
      ${renderSpaceDetailActions(space, owner)}
    </article>
  `;
  wireSpaceDetailActions(index);
}

function rentSummary(space) {
  if (space.kind === "trail") return "$25 / $50 / $100 / $200";
  if (space.kind === "utility") return "4x dice, or 10x dice with both utilities";
  return deedRentRows(space);
}

function deedRentRows(space) {
  if (space.kind !== "deed") return "";
  return `
    <div class="rent-table">
      <span>Base rent</span><strong>$${space.rent[0]}</strong>
      <span>With color set</span><strong>$${space.rent[0] * 2}</strong>
      <span>1 condo</span><strong>$${space.rent[1]}</strong>
      <span>2 condos</span><strong>$${space.rent[2]}</strong>
      <span>3 condos</span><strong>$${space.rent[3]}</strong>
      <span>4 condos</span><strong>$${space.rent[4]}</strong>
      <span>Tower</span><strong>$${space.rent[5]}</strong>
    </div>
  `;
}

function renderLog() {
  els.gameLog.innerHTML = game.log.slice(-18).reverse().map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function handleAction(action) {
  const player = activePlayer();
  if (game.animating) return;
  if (player.isBot && action !== "botStep" && action !== "pending" && action !== "manage" && action !== "trade") return;
  if (action === "noop") return;
  if (action === "botStep") runBotStep();
  if (action === "pending") resolvePending();
  if (action === "debt") renderDebtModal();
  if (action === "usePeachPass") exitTrafficBeforeRoll("card");
  if (action === "buyPeachPass") exitTrafficBeforeRoll("pay");
  if (action === "trafficExitPass") resolveTrafficExit("card");
  if (action === "trafficExitPay") resolveTrafficExit("pay");
  if (action === "roll") rollDice();
  if (action === "buy") buyProperty(player, board[player.position]);
  if (action === "auction") auctionProperty(board[player.position]);
  if (action === "end") endTurn();
  if (action === "manage") openManageModal(player);
  if (action === "trade") openTradeModal(player);
}

function renderCenterTurnConsole(player) {
  const controls = getTurnControls(player);
  return `
    <section class="center-turn-console">
      <div class="center-turn-head">
        <div class="center-spotlight">
          <span>Turn</span>
          <strong><span class="player-dot" style="background:${player.color}"></span>${escapeHtml(player.name)}</strong>
          <em>${board[player.position].name}</em>
        </div>
        <div class="center-roll-bay" aria-live="polite">
          ${controls.diceHtml}
        </div>
      </div>
      <p class="center-turn-status">${escapeHtml(game.status || statusForCurrentTurn())}</p>
      <div class="center-turn-actions">
        ${controls.actionsHtml}
      </div>
    </section>
  `;
}

function getTurnControls(player) {
  const actions = [];
  let diceHtml = `
    <div class="center-dice ${game.phase === "rolling" ? "rolling" : ""}">
      ${dieMarkup(game.dice[0])}
      ${dieMarkup(game.dice[1])}
    </div>
  `;
  if (game.animating) {
    actions.push(button("Moving...", "noop", true));
  } else {
    if (game.phase === "roll") {
      if (player.inTraffic && !player.isBot) {
        if (player.peachPasses > 0) actions.push(button("Use Peach Pass", "usePeachPass"));
        actions.push(button(`Buy Peach Pass $${TRAFFIC_FINE}`, "buyPeachPass"));
      }
      if (!player.isBot || !game.autoPlay) {
        diceHtml = `<button type="button" class="center-roll-button" data-center-action="${player.isBot && !game.autoPlay ? "botStep" : "roll"}">${player.isBot && !game.autoPlay ? "Next: Roll" : "Roll Dice"}</button>`;
      }
    }
    if (game.phase === "rolling") actions.push(button("Rolling...", "noop", true));
    if (game.phase === "pending") actions.push(button(game.pending?.label || "Next", "pending"));
    if (game.phase === "debt") actions.push(button("Resolve Debt", "debt"));
    if (game.phase === "trafficExit") {
      if (player.peachPasses > 0) actions.push(button("Use Peach Pass", "trafficExitPass"));
      actions.push(button(`Buy Peach Pass $${TRAFFIC_FINE}`, "trafficExitPay"));
    }
    if (game.phase === "buy") {
      const space = board[player.position];
      if (player.isBot && !game.autoPlay) actions.push(button("Next: Decide", "botStep"));
      else {
        actions.push(button(`Buy for $${space.price}`, "buy"));
        actions.push(button("Auction", "auction"));
      }
    }
    if (game.phase === "resolve") actions.push(button(player.isBot && !game.autoPlay ? "Next: End Turn" : "End Turn", player.isBot && !game.autoPlay ? "botStep" : "end"));
    actions.push(button("Manage", "manage"));
    actions.push(button("Trade", "trade"));
  }
  return {
    diceHtml,
    actionsHtml: actions.join("")
  };
}

function togglePlayMode() {
  game.autoPlay = !game.autoPlay;
  game.status = game.autoPlay ? "Autoplay is on. Bots will move automatically." : "Manual mode is on. Use Next to step through bot turns and payments.";
  updatePlayModeButton();
  render();
  saveGame(false);
  if (game.autoPlay) maybeRunBot();
}

function updatePlayModeButton() {
  if (!els.playMode || !game) return;
  els.playMode.textContent = game.autoPlay ? "Autoplay" : "Manual";
  els.playMode.classList.toggle("mode-manual", !game.autoPlay);
}

function statusForCurrentTurn() {
  const player = activePlayer();
  if (!player) return "";
  if (game.animating) return game.status || `${player.name} is moving.`;
  if (game.phase === "over") return `${player.name} wins.`;
  if (game.phase === "rolling") return `${player.name} is rolling.`;
  if (game.phase === "buy") return `${board[player.position].name} is available for $${board[player.position].price}.`;
  if (game.phase === "pending") return game.pending?.message || "Resolve the pending action.";
  if (game.phase === "debt") return `${player.name} needs to raise $${Math.abs(player.cash)} before continuing.`;
  if (game.phase === "trafficExit") return `${player.name} did not roll doubles on the third traffic turn. Use a Peach Pass or buy one for $${TRAFFIC_FINE}, then move ${game.trafficExit?.total || 0}.`;
  if (game.phase === "resolve") return `${player.name} is at ${board[player.position].name}. End the turn when ready.`;
  if (player.inTraffic) return trafficRollStatus(player);
  return `${player.name}, roll to play.`;
}

function trafficRollStatus(player) {
  const rollNumber = Math.min(player.trafficTurns + 1, 3);
  const label = rollNumber === 1 ? "first" : rollNumber === 2 ? "second" : "third";
  return `${player.name}, ${label} roll to get out of traffic. Use a Peach Pass, buy one for $${TRAFFIC_FINE}, or roll for doubles.`;
}

function rollDice() {
  const player = activePlayer();
  if (game.phase !== "roll") return;
  const d1 = rand(1, 6);
  const d2 = rand(1, 6);
  game.phase = "rolling";
  game.status = `${player.name} is rolling.`;
  game.dice = [d1, d2];
  render();
  setTimeout(() => { void finishRoll(player.id, d1, d2); }, 420);
}

async function finishRoll(playerId, d1, d2) {
  const player = activePlayer();
  if (!player || player.id !== playerId || game.phase !== "rolling") return;
  game.phase = "roll";
  const total = d1 + d2;
  const doubles = d1 === d2;
  if (player.inTraffic) {
    await handleTrafficRoll(player, doubles, total);
    render();
    saveGame(false);
    maybeRunBot();
    return;
  }
  game.doubles = doubles ? game.doubles + 1 : 0;
  if (game.doubles >= 3) {
    log(`${player.name} rolled three doubles and got stuck in rush hour.`);
    sendToTraffic(player);
    game.phase = "resolve";
    render();
    saveGame(false);
    maybeRunBot();
    return;
  }
  await animateMove(player, total);
  await resolveLanding(player);
  render();
  saveGame(false);
  maybeRunBot();
}

async function handleTrafficRoll(player, doubles, total) {
  if (player.isBot && player.peachPasses > 0) {
    player.peachPasses -= 1;
    player.inTraffic = false;
    player.trafficTurns = 0;
    log(`${player.name} used a Peach Pass to escape rush hour.`);
    await animateMove(player, total);
    await resolveLanding(player);
    return;
  }
  player.trafficTurns += 1;
  if (doubles) {
    player.inTraffic = false;
    player.trafficTurns = 0;
    log(`${player.name} rolled doubles and escaped rush hour.`);
    await animateMove(player, total);
    await resolveLanding(player);
    return;
  }
  if (player.trafficTurns >= 3) {
    if (!player.isBot) {
      game.phase = "trafficExit";
      game.trafficExit = { playerId: player.id, total };
      game.status = `${player.name} did not roll doubles on the third traffic turn. Use a Peach Pass or buy one for $${TRAFFIC_FINE}, then move ${total}.`;
      return;
    }
    chargePlayer(player, TRAFFIC_FINE, null, true);
    player.inTraffic = false;
    player.trafficTurns = 0;
    log(`${player.name} bought a $50 Peach Pass after three turns in traffic.`);
    await animateMove(player, total);
    await resolveLanding(player);
    return;
  }
  game.phase = "resolve";
  game.status = `${player.name} is still stuck in rush hour traffic.`;
}

function exitTrafficBeforeRoll(method) {
  const player = activePlayer();
  if (!player?.inTraffic || game.phase !== "roll") return;
  if (method === "card") {
    if (player.peachPasses <= 0) return;
    player.peachPasses -= 1;
    log(`${player.name} used a Peach Pass before rolling.`);
    game.status = `${player.name} used a Peach Pass and will roll to move.`;
  } else {
    chargePlayer(player, TRAFFIC_FINE, null, true);
    if (game.phase === "debt") return;
    log(`${player.name} bought a $50 Peach Pass before rolling.`);
    game.status = `${player.name} bought a Peach Pass and will roll to move.`;
  }
  player.inTraffic = false;
  player.trafficTurns = 0;
  render();
  saveGame(false);
  rollDice();
}

async function resolveTrafficExit(method) {
  const exit = game.trafficExit;
  if (!exit) return;
  const player = playerById(exit.playerId);
  if (method === "card") {
    if (player.peachPasses <= 0) return;
    player.peachPasses -= 1;
    log(`${player.name} used a Peach Pass after the third failed traffic roll.`);
  } else {
    chargePlayer(player, TRAFFIC_FINE, null, true);
    if (game.phase === "debt") return;
    log(`${player.name} bought a $50 Peach Pass after the third failed traffic roll.`);
  }
  player.inTraffic = false;
  player.trafficTurns = 0;
  game.trafficExit = null;
  game.phase = "roll";
  await animateMove(player, exit.total);
  await resolveLanding(player);
  render();
  saveGame(false);
  maybeRunBot();
}

function movePlayer(player, steps) {
  const oldPosition = player.position;
  player.position = (player.position + steps + board.length) % board.length;
  game.selectedSpaceIndex = player.position;
  if (steps > 0 && player.position < oldPosition) {
    player.cash += PASS_GO;
    log(`${player.name} passed Peachtree Street and collected $200.`);
  }
  log(`${player.name} moved to ${board[player.position].name}.`);
  game.status = `${player.name} landed on ${board[player.position].name}.`;
}

async function resolveLanding(player) {
  const space = board[player.position];
  if (space.type === "property") {
    if (!game.owners[space.index]) {
      game.phase = "buy";
      game.status = `${player.name} landed on ${space.name}. It is available for $${space.price}.`;
      if (player.isBot && game.autoPlay) setTimeout(() => botBuyDecision(player, space), 450);
      return;
    }
    if (game.owners[space.index] !== player.id && !game.mortgaged[space.index]) {
      const amount = calculateRent(space);
      const owner = playerById(game.owners[space.index]);
      if (!game.autoPlay) {
        const colorSetText = space.kind === "deed" && (game.improvements[space.index] || 0) === 0 && ownsMonopoly(owner.id, space.group) ? " Color-set rent applies." : "";
        setPending("payRent", player, `${player.name} landed on ${space.name}. Rent due to ${owner.name}: $${amount}.${colorSetText}`, "Pay Rent", { spaceIndex: space.index, amount });
        return;
      }
      payRent(player, space);
      game.status = `${player.name} paid $${amount} rent to ${owner.name} for ${space.name}.`;
    } else if (game.mortgaged[space.index]) {
      log(`${space.name} is mortgaged, so no rent is due.`);
      game.status = `${player.name} landed on mortgaged ${space.name}. No rent is due.`;
    } else {
      game.status = `${player.name} landed on their own ${space.name}.`;
    }
  }
  if (space.type === "tax") {
    if (!game.autoPlay) {
      setPending("payTax", player, `${player.name} landed on ${space.name}. Pay $${space.amount}.`, "Pay Tax", { spaceIndex: space.index, amount: space.amount });
      return;
    }
    chargePlayer(player, space.amount, null, true);
    log(`${player.name} paid ${space.name}: $${space.amount}.`);
    game.status = `${player.name} paid ${space.name}: $${space.amount}.`;
  }
  if (space.type === "card") {
    if (!game.autoPlay) {
      setPending("drawCard", player, `${player.name} landed on ${space.name}. Draw a card.`, "Draw Card", { deck: space.deck });
      return;
    }
    await drawCard(player, space.deck);
  }
  if (space.type === "lottery") {
    if (game.lotteryEnabled && game.lotteryPot > 0) {
      if (!game.autoPlay) {
        setPending("collectLottery", player, `${player.name} landed on Georgia Lottery. Collect $${game.lotteryPot}.`, "Collect Lottery", {});
        return;
      }
      player.cash += game.lotteryPot;
      log(`${player.name} won the Georgia Lottery pot: $${game.lotteryPot}.`);
      game.status = `${player.name} won the Georgia Lottery pot.`;
      game.lotteryPot = 0;
    } else {
      log(`${player.name} stopped at the Georgia Lottery.`);
      game.status = `${player.name} landed on Georgia Lottery. No pot to collect.`;
    }
  }
  if (space.type === "goToTraffic") {
    if (!game.autoPlay) {
      setPending("goTraffic", player, `${player.name} hit I-285 at 5PM. Go to rush hour traffic.`, "Go To Traffic", {});
      return;
    }
    sendToTraffic(player);
  }
  if (game.phase !== "buy" && game.phase !== "over") game.phase = "resolve";
}

function setPending(type, player, message, label, data) {
  game.pending = { type, playerId: player.id, message, label, data };
  game.phase = "pending";
  game.status = message;
}

async function resolvePending() {
  const pending = game.pending;
  if (!pending) return;
  const player = playerById(pending.playerId);
  game.pending = null;
  if (pending.type === "payRent") {
    payRent(player, board[pending.data.spaceIndex]);
    game.status = `${player.name} paid $${pending.data.amount} rent for ${board[pending.data.spaceIndex].name}.`;
  }
  if (pending.type === "payTax") {
    chargePlayer(player, pending.data.amount, null, true);
    log(`${player.name} paid ${board[pending.data.spaceIndex].name}: $${pending.data.amount}.`);
    game.status = `${player.name} paid ${board[pending.data.spaceIndex].name}.`;
  }
  if (pending.type === "drawCard") {
    await drawCard(player, pending.data.deck);
    game.status = game.lastCard;
  }
  if (pending.type === "collectLottery") {
    player.cash += game.lotteryPot;
    log(`${player.name} won the Georgia Lottery pot: $${game.lotteryPot}.`);
    game.status = `${player.name} collected the Georgia Lottery pot.`;
    game.lotteryPot = 0;
  }
  if (pending.type === "goTraffic") sendToTraffic(player);
  if (game.phase !== "buy" && game.phase !== "over") game.phase = "resolve";
  render();
  saveGame(false);
}

async function drawCard(player, deckName) {
  const deck = deckName === "chance" ? game.chanceDeck : game.communityDeck;
  const cards = deckName === "chance" ? chanceCards : communityCards;
  if (deck.length === 0) deck.push(...shuffle([...Array(cards.length).keys()]));
  const cardIndex = deck.shift();
  const card = cards[cardIndex];
  const deckLabel = deckName === "chance" ? "Peachtree Chance" : "Hotlanta Community";
  game.lastCard = `${deckLabel}: ${card.text}`;
  selectSpace(player.position);
  game.revealedCards[deckName] = {
    deck: deckName,
    cardIndex,
    title: deckLabel,
    text: card.text,
    action: card.action
  };
  log(`${player.name} drew ${game.lastCard}`);
  render();
  await wait(380);
  await applyCard(player, card.action);
}

async function applyCard(player, action) {
  if (action.type === "advance") {
    const target = board.findIndex((space) => space.name === action.to);
    await animateAdvanceTo(player, target);
    await resolveLanding(player);
  }
  if (action.type === "nearest") {
    const target = nearestSpace(player.position, action.kind);
    await animateAdvanceTo(player, target);
    const space = board[target];
    if (!game.owners[target]) game.phase = "buy";
    else if (game.owners[target] !== player.id) payRent(player, space, action.multiplier);
  }
  if (action.type === "collect") player.cash += action.amount;
  if (action.type === "pay") chargePlayer(player, action.amount, null, action.pot);
  if (action.type === "peachPass") player.peachPasses += 1;
  if (action.type === "moveRelative") {
    await animateMove(player, action.amount);
    await resolveLanding(player);
  }
  if (action.type === "goTraffic") sendToTraffic(player);
  if (action.type === "repairs") {
    const due = ownedProperties(player.id).reduce((sum, space) => {
      const count = game.improvements[space.index] || 0;
      return sum + (count === 5 ? action.tower : count * action.condo);
    }, 0);
    chargePlayer(player, due, null, true);
    log(`${player.name} paid $${due} for repairs.`);
  }
  if (action.type === "payEach") {
    game.players.filter((other) => other.id !== player.id && !other.bankrupt).forEach((other) => chargePlayer(player, action.amount, other.id));
  }
  if (action.type === "collectEach") {
    game.players.filter((other) => other.id !== player.id && !other.bankrupt).forEach((other) => chargePlayer(other, action.amount, player.id));
  }
}

function advanceTo(player, target) {
  if (target < player.position) {
    player.cash += PASS_GO;
    log(`${player.name} passed Peachtree Street and collected $200.`);
  }
  player.position = target;
  log(`${player.name} advanced to ${board[target].name}.`);
}

async function animateMove(player, steps) {
  if (!steps) return;
  game.animating = true;
  game.movingPlayerId = player.id;
  const direction = steps > 0 ? 1 : -1;
  for (let step = 0; step < Math.abs(steps); step++) {
    const oldPosition = player.position;
    player.position = (player.position + direction + board.length) % board.length;
    if (direction > 0 && player.position < oldPosition) {
      player.cash += PASS_GO;
      log(`${player.name} passed Peachtree Street and collected $200.`);
    }
    game.selectedSpaceIndex = player.position;
    game.status = `${player.name} is moving to ${board[player.position].name}.`;
    render();
    await wait(MOVE_STEP_MS);
  }
  log(`${player.name} moved to ${board[player.position].name}.`);
  game.status = `${player.name} landed on ${board[player.position].name}.`;
  game.animating = false;
  game.movingPlayerId = null;
}

async function animateAdvanceTo(player, target) {
  const steps = (target - player.position + board.length) % board.length;
  if (!steps) return;
  await animateMove(player, steps);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function nearestSpace(from, kind) {
  for (let step = 1; step <= board.length; step++) {
    const index = (from + step) % board.length;
    if (board[index].kind === kind) return index;
  }
  return from;
}

function sendToTraffic(player) {
  player.position = 10;
  game.selectedSpaceIndex = 10;
  player.inTraffic = true;
  player.trafficTurns = 0;
  game.doubles = 0;
  game.status = trafficRollStatus(player);
  log(`${player.name} is stuck in rush hour traffic.`);
}

function buyProperty(player, space) {
  if (!space.price || game.owners[space.index] || player.cash < space.price) {
    auctionProperty(space);
    return;
  }
  player.cash -= space.price;
  game.owners[space.index] = player.id;
  log(`${player.name} bought ${space.name} for $${space.price}.`);
  game.status = `${player.name} bought ${space.name} for $${space.price}.`;
  game.phase = "resolve";
  selectSpace(space.index);
  render();
  saveGame(false);
}

function auctionProperty(space) {
  if (!space.price || game.owners[space.index]) return;
  if (game.players.some((player) => !player.bankrupt && !player.isBot)) {
    openAuctionModal(space);
    return;
  }
  resolveAutoAuction(space);
}

function resolveAutoAuction(space) {
  const bids = game.players
    .filter((player) => !player.bankrupt && player.cash > 0)
    .map((player) => ({
      player,
      bid: player.isBot ? botAuctionBid(player, space) : Math.min(player.cash, Math.max(1, Math.floor(space.price * 0.75)))
    }))
    .filter((entry) => entry.bid > 0)
    .sort((a, b) => b.bid - a.bid);
  const winner = bids[0];
  if (winner) {
    winner.player.cash -= winner.bid;
    game.owners[space.index] = winner.player.id;
    log(`${winner.player.name} won the auction for ${space.name} at $${winner.bid}.`);
    game.status = `${winner.player.name} won the auction for ${space.name} at $${winner.bid}.`;
  } else {
    log(`No one bid on ${space.name}.`);
    game.status = `No one bid on ${space.name}.`;
  }
  game.phase = "resolve";
  render();
  saveGame(false);
}

function openAuctionModal(space) {
  const active = game.players.filter((player) => !player.bankrupt && player.cash > 0).map((player) => player.id);
  const auction = { spaceIndex: space.index, active, currentBid: 0, highBidder: null, turn: 0 };
  game.phase = "auction";
  game.auction = auction;
  game.status = `Auction started for ${space.name}.`;
  renderAuctionModal();
  render();
}

function renderAuctionModal() {
  const auction = game.auction;
  if (!auction) return;
  const space = board[auction.spaceIndex];
  const bidder = playerById(auction.active[auction.turn % auction.active.length]);
  const minBid = auction.currentBid + 10;
  showModal(`
    <h2>Auction: ${space.name}</h2>
    <p class="modal-note">Current bid: <strong>$${auction.currentBid}</strong>${auction.highBidder ? ` by ${escapeHtml(playerById(auction.highBidder).name)}` : ""}</p>
    <div class="auction-card">
      ${spaceArt(space, "detail")}
      <strong style="color:${bidder.color}">${escapeHtml(bidder.name)}'s bid</strong>
      <span>Cash: $${bidder.cash}</span>
    </div>
    ${bidder.isBot ? `<p>${escapeHtml(bidder.name)} is ready to decide.</p>` : `<label>Bid amount<input id="auction-bid" type="number" min="${minBid}" max="${bidder.cash}" step="10" value="${Math.min(bidder.cash, Math.max(minBid, Math.ceil(space.price * 0.55 / 10) * 10))}"></label>`}
    <div class="modal-actions">
      <button id="auction-minimize">Minimize</button>
      <button id="auction-pass">Pass</button>
      <button id="auction-bid-action">${bidder.isBot ? "Next" : "Bid"}</button>
    </div>
  `, "auction");
  document.getElementById("auction-minimize").addEventListener("click", minimizeAuction);
  document.getElementById("auction-pass").addEventListener("click", () => auctionPass(bidder.id));
  document.getElementById("auction-bid-action").addEventListener("click", () => {
    if (bidder.isBot) auctionBotAct(bidder);
    else auctionBid(bidder.id, Number(document.getElementById("auction-bid").value));
  });
}

function minimizeAuction() {
  closeModal();
  render();
}

function auctionBid(playerId, amount) {
  const auction = game.auction;
  const player = playerById(playerId);
  if (!auction || !player || amount <= auction.currentBid || amount > player.cash) return;
  auction.currentBid = amount;
  auction.highBidder = playerId;
  auction.turn = (auction.turn + 1) % auction.active.length;
  game.status = `${player.name} bid $${amount} for ${board[auction.spaceIndex].name}.`;
  renderAuctionModal();
  render();
}

function auctionPass(playerId) {
  const auction = game.auction;
  if (!auction) return;
  const player = playerById(playerId);
  auction.active = auction.active.filter((id) => id !== playerId);
  log(`${player.name} passed on the auction.`);
  if (auction.active.length <= 1) finishAuction();
  else {
    auction.turn = auction.turn % auction.active.length;
    game.status = `${player.name} passed.`;
    renderAuctionModal();
    render();
  }
}

function auctionBotAct(player) {
  const space = board[game.auction.spaceIndex];
  const bid = botAuctionBid(player, space);
  const nextBid = Math.max(game.auction.currentBid + 10, Math.floor(bid / 10) * 10);
  if (bid > game.auction.currentBid && nextBid <= player.cash) auctionBid(player.id, nextBid);
  else auctionPass(player.id);
}

function finishAuction() {
  const auction = game.auction;
  const space = board[auction.spaceIndex];
  if (auction.highBidder) {
    const winner = playerById(auction.highBidder);
    winner.cash -= auction.currentBid;
    game.owners[space.index] = winner.id;
    log(`${winner.name} won the auction for ${space.name} at $${auction.currentBid}.`);
    game.status = `${winner.name} won the auction for ${space.name} at $${auction.currentBid}.`;
  } else {
    log(`No one bid on ${space.name}.`);
    game.status = `No one bid on ${space.name}.`;
  }
  game.auction = null;
  game.phase = "resolve";
  closeModal();
  render();
  saveGame(false);
  maybeRunBot();
}

function botBuyDecision(player, space) {
  if (game.phase !== "buy" || activePlayer().id !== player.id) return;
  const profile = botProfiles[player.profile];
  const ownsGroup = ownedProperties(player.id).some((owned) => owned.group === space.group);
  const collectorBoost = player.profile === "collector" && ownsGroup ? 1.35 : 1;
  const maxSpend = Math.floor(space.price * profile.buyAt * collectorBoost);
  if (player.cash - space.price >= profile.reserve && space.price <= maxSpend) buyProperty(player, space);
  else auctionProperty(space);
  setTimeout(maybeRunBot, 500);
}

function botAuctionBid(player, space) {
  const profile = botProfiles[player.profile];
  const ownsGroup = ownedProperties(player.id).filter((owned) => owned.group === space.group).length;
  const boost = player.profile === "collector" ? 1 + ownsGroup * 0.18 : 1;
  return Math.max(0, Math.min(player.cash - profile.reserve, Math.floor(space.price * profile.auction * boost)));
}

function payRent(player, space, cardMultiplier = null) {
  const ownerId = game.owners[space.index];
  const amount = calculateRent(space, cardMultiplier);
  const colorSetRent = space.kind === "deed" && (game.improvements[space.index] || 0) === 0 && ownsMonopoly(ownerId, space.group);
  chargePlayer(player, amount, ownerId);
  log(`${player.name} paid $${amount} rent${colorSetRent ? " with color set" : ""} to ${playerById(ownerId).name} for ${space.name}.`);
}

function calculateRent(space, cardMultiplier = null) {
  const ownerId = game.owners[space.index];
  if (space.kind === "trail") {
    const count = ownedProperties(ownerId).filter((owned) => owned.kind === "trail").length;
    return space.rent[Math.max(0, count - 1)] * (cardMultiplier || 1);
  }
  if (space.kind === "utility") {
    const count = ownedProperties(ownerId).filter((owned) => owned.kind === "utility").length;
    const multiplier = cardMultiplier || (count === 2 ? 10 : 4);
    return (game.dice[0] + game.dice[1]) * multiplier;
  }
  const improvements = game.improvements[space.index] || 0;
  if (improvements === 0 && ownsMonopoly(ownerId, space.group)) return space.rent[0] * 2;
  return space.rent[improvements];
}

function chargePlayer(player, amount, recipientId = null, toPot = false) {
  if (amount <= 0) return;
  player.cash -= amount;
  if (recipientId) playerById(recipientId).cash += amount;
  if (!recipientId && toPot && game.lotteryEnabled) game.lotteryPot += amount;
  if (player.cash < 0) resolveDebt(player);
}

function resolveDebt(player) {
  if (!player.isBot) {
    game.debt = { playerId: player.id };
    game.phase = "debt";
    game.status = `${player.name} needs to raise $${Math.abs(player.cash)} before continuing.`;
    renderDebtModal();
    return;
  }
  autoMortgage(player);
  if (player.cash >= 0) return;
  player.bankrupt = true;
  Object.keys(game.owners).forEach((index) => {
    if (game.owners[index] === player.id) {
      delete game.owners[index];
      delete game.improvements[index];
      delete game.mortgaged[index];
    }
  });
  log(`${player.name} is bankrupt. Their properties returned to the bank.`);
  if (game.players.filter((candidate) => !candidate.bankrupt).length === 1) {
    const winner = game.players.find((candidate) => !candidate.bankrupt);
    game.phase = "over";
    log(`${winner.name} wins ATL Empire.`);
  }
}

function renderDebtModal() {
  const debt = game.debt;
  if (!debt) return;
  const player = playerById(debt.playerId);
  const need = Math.abs(player.cash);
  const recommendations = mortgageRecommendations(player);
  showModal(`
    <h2>Raise Cash</h2>
    <p class="modal-note">${escapeHtml(player.name)} is short $${need}. Choose what to mortgage, or minimize this and manage/trade first.</p>
    <div class="debt-summary">
      <strong>Cash: $${player.cash}</strong>
      <span>Recommended: ${recommendations[0] ? `${recommendations[0].name} for $${recommendations[0].mortgage}` : "No mortgage available"}</span>
    </div>
    <div class="manage-list">
      ${recommendations.map((space) => debtMortgageRow(player, space)).join("") || "<p>No unmortgaged properties available. You may need to trade or declare bankruptcy.</p>"}
    </div>
    <div class="modal-actions">
      <button id="debt-minimize">Minimize</button>
      <button id="debt-manage">Manage</button>
      <button id="debt-trade">Trade</button>
      <button id="debt-bankrupt">Declare Bankruptcy</button>
      <button id="debt-continue" ${player.cash >= 0 ? "" : "disabled"}>Continue</button>
    </div>
  `, "debt");
  document.getElementById("debt-minimize").addEventListener("click", closeModal);
  document.getElementById("debt-manage").addEventListener("click", () => openManageModal(player));
  document.getElementById("debt-trade").addEventListener("click", () => openTradeModal(player));
  document.getElementById("debt-bankrupt").addEventListener("click", () => bankruptPlayer(player));
  document.getElementById("debt-continue").addEventListener("click", finishDebtIfSolved);
  els.modalContent.querySelectorAll("[data-debt-mortgage]").forEach((buttonEl) => {
    buttonEl.addEventListener("click", () => {
      mortgageProperty(player, Number(buttonEl.dataset.debtMortgage));
      finishDebtIfSolved(false);
      if (game.debt) renderDebtModal();
    });
  });
}

function debtMortgageRow(player, space) {
  return `
    <article class="manage-row">
      <span class="chip" style="background:${groups[space.group].color}"></span>
      <div><strong>${space.name}</strong><span>Mortgage for $${space.mortgage}</span></div>
      <button data-debt-mortgage="${space.index}">Mortgage</button>
    </article>
  `;
}

function mortgageRecommendations(player) {
  return ownedProperties(player.id)
    .filter((space) => !game.mortgaged[space.index])
    .sort((a, b) => {
      const aImproved = game.improvements[a.index] || 0;
      const bImproved = game.improvements[b.index] || 0;
      return aImproved - bImproved || a.mortgage - b.mortgage;
    });
}

function finishDebtIfSolved(closeWhenDone = true) {
  if (!game.debt) return;
  const player = playerById(game.debt.playerId);
  if (player.cash < 0) return;
  game.debt = null;
  game.phase = "resolve";
  game.status = `${player.name} raised enough cash.`;
  if (closeWhenDone) closeModal();
  render();
  saveGame(false);
}

function bankruptPlayer(player) {
  player.bankrupt = true;
  Object.keys(game.owners).forEach((index) => {
    if (game.owners[index] === player.id) {
      delete game.owners[index];
      delete game.improvements[index];
      delete game.mortgaged[index];
    }
  });
  game.debt = null;
  game.phase = "resolve";
  log(`${player.name} declared bankruptcy. Their properties returned to the bank.`);
  closeModal();
  render();
  saveGame(false);
}

function autoMortgage(player) {
  ownedProperties(player.id)
    .filter((space) => !game.mortgaged[space.index])
    .sort((a, b) => (game.improvements[a.index] || 0) - (game.improvements[b.index] || 0))
    .forEach((space) => {
      if (player.cash >= 0) return;
      game.mortgaged[space.index] = true;
      game.improvements[space.index] = 0;
      player.cash += space.mortgage;
      log(`${player.name} mortgaged ${space.name} for $${space.mortgage}.`);
    });
}

function endTurn() {
  const player = activePlayer();
  if (game.phase === "over") return;
  clearRevealedCards();
  const doubles = game.dice[0] && game.dice[0] === game.dice[1] && !player.inTraffic;
  if (doubles && game.doubles > 0 && game.phase === "resolve") {
    game.phase = "roll";
    game.status = `${player.name} rolled doubles and goes again.`;
  } else {
    game.current = nextPlayerIndex();
    game.phase = "roll";
    game.dice = [0, 0];
    game.doubles = 0;
    game.status = `${activePlayer().name}, roll to play.`;
    game.selectedSpaceIndex = activePlayer().position;
    if (activePlayer().inTraffic) game.status = trafficRollStatus(activePlayer());
  }
  botBuild(activePlayer());
  render();
  saveGame(false);
  maybeRunBot();
}

function nextPlayerIndex() {
  let next = game.current;
  do {
    next = (next + 1) % game.players.length;
  } while (game.players[next].bankrupt);
  return next;
}

function maybeRunBot() {
  if (!game || game.phase === "over") return;
  const player = activePlayer();
  if (!player.isBot || player.bankrupt) return;
  if (!game.autoPlay) return;
  setTimeout(() => {
    if (game.phase === "roll") rollDice();
    else if (game.phase === "resolve") endTurn();
  }, 700);
}

function runBotStep() {
  const player = activePlayer();
  if (!player?.isBot) return;
  if (game.phase === "roll") rollDice();
  else if (game.phase === "buy") botBuyDecision(player, board[player.position]);
  else if (game.phase === "pending") resolvePending();
  else if (game.phase === "resolve") endTurn();
}

function botBuild(player) {
  if (!player?.isBot || player.bankrupt) return;
  const profile = botProfiles[player.profile];
  groupIds().forEach((group) => {
    if (!ownsMonopoly(player.id, group)) return;
    const buildable = ownedProperties(player.id).filter((space) => canBuildImprovement(player, space.index));
    if (!buildable.length) return;
    const cheapest = buildable.sort((a, b) => (game.improvements[a.index] || 0) - (game.improvements[b.index] || 0))[0];
    if ((game.improvements[cheapest.index] || 0) >= 5) return;
    if (player.cash - cheapest.houseCost >= profile.buildReserve) {
      player.cash -= cheapest.houseCost;
      game.improvements[cheapest.index] = (game.improvements[cheapest.index] || 0) + 1;
      log(`${player.name} added ${game.improvements[cheapest.index] === 5 ? "a tower" : "a condo"} to ${cheapest.name}.`);
    }
  });
}

function openManageModal(player) {
  const props = ownedProperties(player.id);
  showModal(`
    <h2>Manage ${escapeHtml(player.name)}</h2>
    <p class="modal-note">Build evenly across complete color sets. Mortgaging clears condos and towers on that property.</p>
    <div class="manage-list">
      ${props.map((space) => manageRow(player, space)).join("") || "<p>No properties yet.</p>"}
    </div>
    <div class="modal-actions"><button data-close>Done</button></div>
  `);
  els.modalContent.querySelectorAll("[data-build]").forEach((buttonEl) => buttonEl.addEventListener("click", () => {
    buildImprovement(player, Number(buttonEl.dataset.build));
    refreshManageModal(player);
  }));
  els.modalContent.querySelectorAll("[data-mortgage]").forEach((buttonEl) => buttonEl.addEventListener("click", () => {
    mortgageProperty(player, Number(buttonEl.dataset.mortgage));
    refreshManageModal(player);
  }));
  els.modalContent.querySelectorAll("[data-unmortgage]").forEach((buttonEl) => buttonEl.addEventListener("click", () => {
    unmortgageProperty(player, Number(buttonEl.dataset.unmortgage));
    refreshManageModal(player);
  }));
}

function refreshManageModal(player) {
  render();
  if (els.modal.open) els.modalContent.innerHTML = "";
  openManageModal(player);
}

function manageRow(player, space) {
  const improvements = game.improvements[space.index] || 0;
  const buildReason = buildBlockedReason(player, space.index);
  const canBuild = !buildReason;
  return `
    <article class="manage-row">
      <span class="chip" style="background:${groups[space.group].color}"></span>
      <div><strong>${space.name}</strong><span>${game.mortgaged[space.index] ? "Mortgaged" : improvements === 5 ? "Tower" : `${improvements} condo(s)`}</span></div>
      ${canBuild ? `<button data-build="${space.index}">Build $${space.houseCost}</button>` : space.kind === "deed" && ownsMonopoly(player.id, space.group) ? `<span class="build-note">${buildReason}</span>` : ""}
      ${game.mortgaged[space.index] ? `<button data-unmortgage="${space.index}">Unmortgage $${Math.ceil(space.mortgage * 1.1)}</button>` : `<button data-mortgage="${space.index}">Mortgage $${space.mortgage}</button>`}
    </article>
  `;
}

function buildImprovement(player, index) {
  const space = board[index];
  if (!canBuildImprovement(player, index)) return;
  player.cash -= space.houseCost;
  game.improvements[index] = (game.improvements[index] || 0) + 1;
  selectSpace(index);
  log(`${player.name} built ${game.improvements[index] === 5 ? "a tower" : "a condo"} on ${space.name}.`);
  saveGame(false);
}

function canBuildImprovement(player, index) {
  return !buildBlockedReason(player, index);
}

function buildBlockedReason(player, index) {
  const space = board[index];
  if (!space || space.kind !== "deed") return "Not buildable";
  if (game.owners[index] !== player.id) return "Not owned";
  if (!ownsMonopoly(player.id, space.group)) return "Need color set";
  if (game.mortgaged[index]) return "Mortgaged";
  if ((game.improvements[index] || 0) >= 5) return "Fully built";
  if (player.cash < space.houseCost) return "Need cash";
  const groupSpaces = board.filter((candidate) => candidate.group === space.group && candidate.kind === "deed");
  if (groupSpaces.some((candidate) => game.mortgaged[candidate.index])) return "Unmortgage set first";
  const counts = groupSpaces.map((candidate) => game.improvements[candidate.index] || 0);
  const min = Math.min(...counts);
  if ((game.improvements[index] || 0) > min) return "Build evenly";
  return "";
}

function mortgageProperty(player, index) {
  if (game.owners[index] !== player.id) return;
  const space = board[index];
  game.mortgaged[index] = true;
  game.improvements[index] = 0;
  selectSpace(index);
  player.cash += space.mortgage;
  log(`${player.name} mortgaged ${space.name}.`);
  saveGame(false);
}

function unmortgageProperty(player, index) {
  const space = board[index];
  const cost = Math.ceil(space.mortgage * 1.1);
  if (game.owners[index] !== player.id || player.cash < cost) return;
  player.cash -= cost;
  delete game.mortgaged[index];
  selectSpace(index);
  log(`${player.name} unmortgaged ${space.name}.`);
  saveGame(false);
}

function openTradeModal(player) {
  const others = game.players.filter((candidate) => candidate.id !== player.id && !candidate.bankrupt);
  showModal(`
    <h2>Trade</h2>
    <label>Trade with<select id="trade-player">${others.map((other) => `<option value="${other.id}">${escapeHtml(other.name)}</option>`).join("")}</select></label>
    <div id="trade-builder"></div>
    <div class="modal-actions"><button data-close>Cancel</button><button id="confirm-trade" ${others.length ? "" : "disabled"}>Propose Trade</button></div>
  `);
  const partnerSelect = document.getElementById("trade-player");
  const renderTradeBuilder = () => {
    const partner = playerById(partnerSelect.value);
    document.getElementById("trade-builder").innerHTML = tradeBuilderHtml(player, partner);
  };
  partnerSelect.addEventListener("change", renderTradeBuilder);
  renderTradeBuilder();
  const confirm = document.getElementById("confirm-trade");
  if (confirm) confirm.addEventListener("click", () => {
    proposeTrade(player, playerById(partnerSelect.value));
  });
}

function tradeBuilderHtml(left, right) {
  return `
    <div class="trade-grid">
      ${tradeSideHtml("You give", "left", left)}
      ${tradeSideHtml(`${escapeHtml(right.name)} gives`, "right", right)}
    </div>
  `;
}

function tradeSideHtml(title, side, player) {
  const props = ownedProperties(player.id).filter((space) => (game.improvements[space.index] || 0) === 0);
  return `
    <section class="trade-side">
      <h3>${title}</h3>
      <label>Cash<input id="${side}-cash" type="number" min="0" max="${player.cash}" value="0"></label>
      <div class="trade-props">
        ${props.map((space) => `<label><input type="checkbox" data-${side}-prop="${space.index}"> <span style="background:${groups[space.group].color}"></span>${space.name}</label>`).join("") || "<p>No tradable properties.</p>"}
      </div>
    </section>
  `;
}

function proposeTrade(from, to) {
  const leftCash = Number(document.getElementById("left-cash").value);
  const rightCash = Number(document.getElementById("right-cash").value);
  const leftProps = [...els.modalContent.querySelectorAll("[data-left-prop]:checked")].map((input) => Number(input.dataset.leftProp));
  const rightProps = [...els.modalContent.querySelectorAll("[data-right-prop]:checked")].map((input) => Number(input.dataset.rightProp));
  if (leftCash > from.cash || rightCash > to.cash) return;
  const offer = { fromId: from.id, toId: to.id, leftCash, rightCash, leftProps, rightProps };
  if (to.isBot) {
    const accepted = botAcceptsTrade(to, offer);
    if (accepted) applyTrade(offer);
    else {
      log(`${to.name} rejected ${from.name}'s trade proposal.`);
      game.status = `${to.name} rejected the trade proposal.`;
    }
    closeModal();
    render();
    saveGame(false);
    return;
  }
  renderTradeReview(offer);
}

function renderTradeReview(offer) {
  const from = playerById(offer.fromId);
  const to = playerById(offer.toId);
  showModal(`
    <h2>Trade Proposal</h2>
    <p class="modal-note">${escapeHtml(from.name)} proposes a trade with ${escapeHtml(to.name)}.</p>
    <div class="trade-grid">
      ${tradeReviewSide(`${escapeHtml(from.name)} gives`, offer.leftCash, offer.leftProps)}
      ${tradeReviewSide(`${escapeHtml(to.name)} gives`, offer.rightCash, offer.rightProps)}
    </div>
    <div class="modal-actions"><button id="reject-trade">Reject</button><button id="counter-trade">Counter</button><button id="accept-trade">Accept</button></div>
  `);
  document.getElementById("accept-trade").addEventListener("click", () => {
    applyTrade(offer);
    closeModal();
    render();
    saveGame(false);
  });
  document.getElementById("reject-trade").addEventListener("click", () => {
    log(`${to.name} rejected ${from.name}'s trade proposal.`);
    closeModal();
  });
  document.getElementById("counter-trade").addEventListener("click", () => openTradeModal(to));
}

function tradeReviewSide(title, cash, props) {
  return `<section class="trade-side"><h3>${title}</h3><p>Cash: $${cash}</p>${props.map((index) => `<p><span class="chip" style="background:${groups[board[index].group].color}"></span> ${board[index].name}</p>`).join("") || "<p>No properties.</p>"}</section>`;
}

function applyTrade(offer) {
  const from = playerById(offer.fromId);
  const to = playerById(offer.toId);
  from.cash += offer.rightCash - offer.leftCash;
  to.cash += offer.leftCash - offer.rightCash;
  offer.leftProps.forEach((index) => game.owners[index] = to.id);
  offer.rightProps.forEach((index) => game.owners[index] = from.id);
  log(`${from.name} and ${to.name} completed a trade.`);
  game.status = `${from.name} and ${to.name} completed a trade.`;
}

function botAcceptsTrade(bot, offer) {
  const give = offer.rightCash + offer.rightProps.reduce((sum, index) => sum + board[index].price, 0);
  const get = offer.leftCash + offer.leftProps.reduce((sum, index) => sum + board[index].price, 0);
  const profile = botProfiles[bot.profile];
  return get >= give * (bot.profile === "conservative" ? 1.25 : profile.auction);
}

function showModal(html, kind = "default") {
  modalKind = kind;
  els.modal.className = `modal modal-${kind}`;
  els.modalContent.innerHTML = html;
  els.modalContent.querySelectorAll("[data-close]").forEach((buttonEl) => buttonEl.addEventListener("click", closeModal));
  if (!els.modal.open) els.modal.showModal();
}

function closeModal() {
  if (els.modal.open) els.modal.close();
  modalKind = "default";
  els.modal.className = "modal";
}

function openPlayerDetail(playerId) {
  const player = playerById(playerId);
  const props = ownedProperties(player.id);
  showModal(`
    <h2><span class="player-dot" style="background:${player.color}"></span>${escapeHtml(player.name)}</h2>
    <p class="modal-note">${player.isBot ? botProfiles[player.profile].label : "Human"} · ${board[player.position].name} · Cash $${player.cash}</p>
    <div class="portfolio-list">
      ${groupIds().concat(["trail", "utility"]).map((group) => portfolioGroup(player, group)).join("")}
    </div>
    <p>Peach Pass cards: ${player.peachPasses}</p>
    <div class="modal-actions"><button data-close>Close</button></div>
  `);
}

function portfolioGroup(player, group) {
  const props = ownedProperties(player.id).filter((space) => space.group === group);
  if (!props.length) return "";
  return `
    <section class="portfolio-group">
      <h3><span class="chip" style="background:${groups[group].color}"></span>${groups[group].name}</h3>
      ${props.map((space) => `<p>${space.name}${game.mortgaged[space.index] ? " · Mortgaged" : ""}${space.kind === "deed" ? ` · ${game.improvements[space.index] === 5 ? "Tower" : `${game.improvements[space.index] || 0} condos`}` : ""}</p>`).join("")}
    </section>
  `;
}

function showSpacePopover(index, anchor) {
  const space = board[index];
  const owner = game.owners[index] ? playerById(game.owners[index]) : null;
  const improvements = game.improvements[index] || 0;
  els.popover.innerHTML = `
    <button type="button" class="popover-close" aria-label="Close">x</button>
    <article class="space-detail-card compact">
      <div class="detail-head">
        ${spaceArt(space, "detail")}
        <div class="detail-copy">
          <p class="detail-kicker">${spaceLabel(space)}</p>
          <h3>${space.name}</h3>
          <p>${space.description || space.art || ""}</p>
        </div>
      </div>
      ${owner ? `<p class="detail-owner"><span class="player-dot" style="background:${owner.color}"></span>Owned by ${escapeHtml(owner.name)}</p>` : ""}
      ${space.price ? `<dl class="detail-grid">
        <dt>Price</dt><dd>$${space.price}</dd>
        <dt>Mortgage</dt><dd>$${space.mortgage}</dd>
        ${space.kind === "deed" ? `<dt>Build</dt><dd>${improvements === 5 ? "Tower" : `${improvements} condo${improvements === 1 ? "" : "s"}`}</dd>` : ""}
        <dt>Rent</dt><dd>${rentSummary(space)}</dd>
      </dl>` : ""}
    </article>
    ${owner && space.kind === "deed" && ownsMonopoly(owner.id, space.group) ? `<div class="popover-actions">
      ${canBuildImprovement(owner, index) ? `<button type="button" data-popover-build="${index}">Build $${space.houseCost}</button>` : `<span class="build-note">${buildBlockedReason(owner, index)}</span>`}
    </div>` : ""}
  `;
  const boardRect = els.board.getBoundingClientRect();
  const rect = anchor.getBoundingClientRect();
  els.popover.classList.remove("hidden");
  const popRect = els.popover.getBoundingClientRect();
  let left = rect.left - boardRect.left + rect.width / 2 - popRect.width / 2;
  let top = rect.top - boardRect.top + rect.height / 2 - popRect.height / 2;
  left = Math.max(8, Math.min(left, boardRect.width - popRect.width - 8));
  top = Math.max(8, Math.min(top, boardRect.height - popRect.height - 8));
  els.popover.style.left = `${left}px`;
  els.popover.style.top = `${top}px`;
  els.board.appendChild(els.popover);
  els.popover.querySelector(".popover-close").addEventListener("click", closeSpacePopover);
  const buildButton = els.popover.querySelector("[data-popover-build]");
  if (buildButton) {
    buildButton.addEventListener("click", (event) => {
      event.stopPropagation();
      buildImprovement(owner, Number(buildButton.dataset.popoverBuild));
      render();
      const newAnchor = els.board.querySelector(`.pos-${index}`);
      if (newAnchor) showSpacePopover(index, newAnchor);
    });
  }
}

function closeSpacePopover() {
  els.popover.classList.add("hidden");
}

function openArtLightbox(src, title = "") {
  if (!src) return;
  els.artLightboxImage.src = src;
  els.artLightboxImage.alt = title;
  els.artLightbox.classList.remove("hidden");
  els.artLightbox.setAttribute("aria-hidden", "false");
}

function closeArtLightbox() {
  if (els.artLightbox.classList.contains("hidden")) return;
  els.artLightbox.classList.add("hidden");
  els.artLightbox.setAttribute("aria-hidden", "true");
  els.artLightboxImage.removeAttribute("src");
  els.artLightboxImage.alt = "";
}

function clearRevealedCards() {
  if (!game) return;
  game.revealedCards = { chance: null, community: null };
}

function setPanelTab(tab) {
  if (!tab) return;
  currentPanelTab = tab;
  normalizePanelTab();
  syncPanelTabs();
}

function isTabletBoardLayout() {
  return window.innerWidth <= 1400;
}

function normalizePanelTab() {
  if (isTabletBoardLayout() && currentPanelTab === "turn") {
    currentPanelTab = "space";
  }
}

function selectSpace(index, openPanel = false) {
  if (!game || !Number.isInteger(index)) return;
  game.selectedSpaceIndex = index;
  if (openPanel) setPanelTab("space");
}

function currentSelectedSpaceIndex() {
  return Number.isInteger(game?.selectedSpaceIndex) ? game.selectedSpaceIndex : activePlayer()?.position || 0;
}

function renderSpaceDetailActions(space, owner) {
  if (!space.price) return "";
  const player = activePlayer();
  const actions = [];
  const notes = [];
  if (owner?.id === player.id && !player.bankrupt) {
    if (space.kind === "deed") {
      const buildReason = buildBlockedReason(player, space.index);
      if (!buildReason) actions.push(`<button type="button" data-space-build="${space.index}">Build ${game.improvements[space.index] >= 4 ? "Tower" : "Condo"} $${space.houseCost}</button>`);
      else if (ownsMonopoly(player.id, space.group)) notes.push(buildReason);
    }
    if (game.mortgaged[space.index]) actions.push(`<button type="button" data-space-unmortgage="${space.index}">Unmortgage $${Math.ceil(space.mortgage * 1.1)}</button>`);
    else actions.push(`<button type="button" data-space-mortgage="${space.index}">Mortgage $${space.mortgage}</button>`);
  }
  if (game.phase === "buy" && player.position === space.index && !owner && !player.isBot) {
    actions.push(`<button type="button" data-space-buy="${space.index}">Buy for $${space.price}</button>`);
    actions.push(`<button type="button" data-space-auction="${space.index}">Auction</button>`);
  }
  if (!actions.length && !notes.length) return "";
  return `
    <div class="detail-actions">
      ${actions.join("")}
      ${notes.map((note) => `<p class="detail-note">${escapeHtml(note)}</p>`).join("")}
    </div>
  `;
}

function wireSpaceDetailActions(index) {
  const buildButton = els.spaceDetail.querySelector("[data-space-build]");
  const mortgageButton = els.spaceDetail.querySelector("[data-space-mortgage]");
  const unmortgageButton = els.spaceDetail.querySelector("[data-space-unmortgage]");
  const buyButton = els.spaceDetail.querySelector("[data-space-buy]");
  const auctionButton = els.spaceDetail.querySelector("[data-space-auction]");
  if (buildButton) buildButton.addEventListener("click", () => {
    buildImprovement(activePlayer(), Number(buildButton.dataset.spaceBuild));
    render();
  });
  if (mortgageButton) mortgageButton.addEventListener("click", () => {
    mortgageProperty(activePlayer(), Number(mortgageButton.dataset.spaceMortgage));
    render();
  });
  if (unmortgageButton) unmortgageButton.addEventListener("click", () => {
    unmortgageProperty(activePlayer(), Number(unmortgageButton.dataset.spaceUnmortgage));
    render();
  });
  if (buyButton) buyButton.addEventListener("click", () => handleAction("buy"));
  if (auctionButton) auctionButton.addEventListener("click", () => handleAction("auction"));
  els.board.querySelectorAll("[data-center-action]").forEach((buttonEl) => {
    buttonEl.addEventListener("click", () => handleAction(buttonEl.dataset.centerAction));
  });
  els.board.querySelectorAll(".center-turn-actions [data-action]").forEach((buttonEl) => {
    buttonEl.addEventListener("click", () => handleAction(buttonEl.dataset.action));
  });
}

function syncPanelTabs() {
  els.panelTabs.forEach((buttonEl) => {
    buttonEl.classList.toggle("active", buttonEl.dataset.panelTab === currentPanelTab);
  });
  els.panelSections.forEach((sectionEl) => {
    sectionEl.classList.toggle("active-panel", sectionEl.dataset.panelSection === currentPanelTab);
  });
}

function renderDeckStack(deckName) {
  const meta = deckMeta(deckName);
  const revealed = game.revealedCards?.[deckName];
  return `
    <button type="button" class="deck-stack ${meta.stackClass} ${revealed ? "revealed" : ""}" data-deck-preview="${deckName}">
      <span class="deck-stack-shell">
        <span class="deck-stack-face deck-back">
          <span class="deck-stack-art">${assetImage(meta.asset, "thumb", svgIcon(meta.icon))}</span>
          <span>${meta.top}</span>
          <strong>${meta.bottom}</strong>
        </span>
        <span class="deck-stack-face deck-front">
          ${revealed ? deckRevealCardHtml(deckName, revealed) : ""}
        </span>
      </span>
    </button>
  `;
}

function renderDeckDetail(deckName) {
  setPanelTab("space");
  const meta = deckMeta(deckName);
  const revealed = game.revealedCards?.[deckName];
  if (revealed) {
    els.spaceDetail.innerHTML = `
      <article class="space-detail-card">
        <div class="detail-head detail-head-card">
          <div class="detail-card-preview">${deckRevealCardHtml(deckName, revealed)}</div>
          <div class="detail-copy">
            <p class="detail-kicker">Latest Draw</p>
            <h3>${revealed.title}</h3>
            <p>${revealed.text}</p>
          </div>
        </div>
      </article>
    `;
    return;
  }
  els.spaceDetail.innerHTML = `
    <article class="space-detail-card">
      <div class="detail-head">
        ${zoomableArtFromSlug(meta.asset.replace("assets/board/", "").replace(".png", ""), "detail", svgIcon(meta.icon), meta.title)}
        <div class="detail-copy">
          <p class="detail-kicker">Card Deck</p>
          <h3>${meta.title}</h3>
          <p>${meta.description}</p>
        </div>
      </div>
    </article>
  `;
}

function deckMeta(deckName) {
  return deckName === "chance"
    ? {
        title: "Peachtree Chance",
        top: "Peachtree",
        bottom: "Chance",
        asset: "assets/board/peachtree-chance.png",
        icon: "chance",
        stackClass: "chance-stack",
        description: "A shuffled stack of Atlanta-flavored chance cards with movement, fines, and lucky breaks."
      }
    : {
        title: "Hotlanta Community",
        top: "Hotlanta",
        bottom: "Community",
        asset: "assets/board/arthur-m-blank-family-foundation.png",
        icon: "heart",
        stackClass: "community-stack",
        description: "A mixed deck of city-life twists, neighborhood moments, and Hotlanta surprises."
      };
}

function deckRevealCardHtml(deckName, revealed) {
  return `
    <article class="deck-reveal-card ${deckName}">
      <div class="deck-reveal-top">
        <span>${deckName === "chance" ? "Chance Card" : "Community Card"}</span>
        <strong>${revealed.title}</strong>
      </div>
      <div class="deck-reveal-graphic">${cardGraphic(deckName, revealed.cardIndex, revealed.action, revealed.text)}</div>
      <p class="deck-reveal-text">${escapeHtml(revealed.text)}</p>
    </article>
  `;
}

function cardGraphic(deckName, cardIndex, action, text) {
  const palette = cardPalette(deckName, cardIndex);
  const icon = cardIconKind(action, text);
  const inner = svgInner(icon);
  const accent = 18 + (cardIndex % 5) * 11;
  return `
    <svg viewBox="0 0 180 110" aria-hidden="true">
      <defs>
        <linearGradient id="card-grad-${deckName}-${cardIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.start}"/>
          <stop offset="100%" stop-color="${palette.end}"/>
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="172" height="102" rx="22" fill="url(#card-grad-${deckName}-${cardIndex})"/>
      <circle cx="${42 + accent}" cy="30" r="18" fill="${palette.glow}" opacity="0.35"/>
      <circle cx="${138 - accent / 2}" cy="76" r="26" fill="${palette.glow}" opacity="0.22"/>
      <path d="M18 ${76 - cardIndex % 6} C54 ${48 + cardIndex % 7}, 88 ${95 - cardIndex % 5}, 162 ${38 + cardIndex % 6}" stroke="${palette.line}" stroke-width="8" stroke-linecap="round" fill="none" opacity="0.45"/>
      <path d="M22 92 H156" stroke="${palette.line}" stroke-width="4" stroke-linecap="round" opacity="0.3"/>
      <g transform="translate(58 22) scale(1.05)" color="${palette.icon}">
        ${inner}
      </g>
    </svg>
  `;
}

function cardPalette(deckName, cardIndex) {
  const chance = [
    { start: "#ffe29c", end: "#f5a53d", glow: "#fff7cf", line: "#8c5313", icon: "#5b2d09" },
    { start: "#ffd978", end: "#e8882d", glow: "#fff1ba", line: "#9b5617", icon: "#653009" },
    { start: "#ffd9a8", end: "#efac48", glow: "#fff0d7", line: "#85501c", icon: "#4a2b0c" }
  ];
  const community = [
    { start: "#ffe9da", end: "#d89272", glow: "#fff4ee", line: "#8f4f4e", icon: "#5a2b37" },
    { start: "#f8e4da", end: "#c88276", glow: "#fff5ef", line: "#83445d", icon: "#512535" },
    { start: "#f5dfd4", end: "#b97a73", glow: "#fef0eb", line: "#7a3f54", icon: "#4a2234" }
  ];
  const list = deckName === "chance" ? chance : community;
  return list[cardIndex % list.length];
}

function cardIconKind(action, text = "") {
  const lower = text.toLowerCase();
  if (action.type === "advance") return lower.includes("airport") || lower.includes("flight") ? "jet" : "road";
  if (action.type === "nearest") return action.kind === "trail" ? "trail" : "fiber";
  if (action.type === "collect") return lower.includes("film") ? "camera" : "lottery";
  if (action.type === "pay") return lower.includes("tree") ? "attraction" : "tax";
  if (action.type === "peachPass") return "road";
  if (action.type === "moveRelative") return "traffic";
  if (action.type === "goTraffic") return "traffic";
  if (action.type === "repairs") return "blocks";
  if (action.type === "payEach" || action.type === "collectEach") return "district";
  return "chance";
}

function svgInner(kind) {
  return svgIcon(kind).replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
}

function renderCardGalleryPage() {
  els.cardGalleryRoot.innerHTML = `
    <main class="card-gallery-page">
      <header class="card-gallery-header">
        <p class="eyebrow">ATL Empire</p>
        <h1>Card Gallery</h1>
        <p>Eyeball-test every Peachtree Chance and Hotlanta Community card using the same reveal card code as the live board.</p>
      </header>
      <section class="card-gallery-section">
        <div class="card-gallery-title">
          <p class="eyebrow">Deck One</p>
          <h2>Peachtree Chance</h2>
        </div>
        <div class="card-gallery-grid">
          ${chanceCards.map((card, index) => `<article class="card-gallery-item">${deckRevealCardHtml("chance", {
            deck: "chance",
            cardIndex: index,
            title: "Peachtree Chance",
            text: card.text,
            action: card.action
          })}</article>`).join("")}
        </div>
      </section>
      <section class="card-gallery-section">
        <div class="card-gallery-title">
          <p class="eyebrow">Deck Two</p>
          <h2>Hotlanta Community</h2>
        </div>
        <div class="card-gallery-grid">
          ${communityCards.map((card, index) => `<article class="card-gallery-item">${deckRevealCardHtml("community", {
            deck: "community",
            cardIndex: index,
            title: "Hotlanta Community",
            text: card.text,
            action: card.action
          })}</article>`).join("")}
        </div>
      </section>
    </main>
  `;
}

function boardRingClass(index) {
  if ([0, 10, 20, 30].includes(index)) return "space-corner";
  if (index < 10) return "space-edge edge-bottom";
  if (index < 20) return "space-edge edge-left";
  if (index < 30) return "space-edge edge-top";
  return "space-edge edge-right";
}

function spaceLabel(space) {
  if (space.type === "go") return "Go";
  if (space.type === "traffic") return "Gridlock";
  if (space.type === "lottery") return "Georgia Lottery";
  if (space.type === "goToTraffic") return "I-285 at 5PM";
  if (space.type === "tax") return "Tax";
  if (space.type === "card") return space.deck === "chance" ? "Chance" : "Hood";
  if (space.kind === "trail") return "Trail";
  if (space.kind === "utility") return "Utility";
  if (space.group === "brown") return "Realtor";
  if (space.group === "yellow") return "MX-Use";
  if (space.group === "green") return "Sites";
  if (space.group === "darkBlue") return "Airport";
  if (space.group && groups[space.group]) return groups[space.group].name;
  return "Space";
}

function activePlayer() {
  return game.players[game.current];
}

function playerById(id) {
  return game.players.find((player) => player.id === id);
}

function ownedProperties(playerId) {
  return Object.entries(game.owners).filter(([, owner]) => owner === playerId).map(([index]) => board[Number(index)]);
}

function ownsMonopoly(playerId, group) {
  if (!group || group === "trail" || group === "utility") return false;
  const groupSpaces = board.filter((space) => space.group === group);
  return groupSpaces.length > 0 && groupSpaces.every((space) => game.owners[space.index] === playerId);
}

function groupIds() {
  return Object.keys(groups).filter((group) => !["trail", "utility"].includes(group));
}

function log(message) {
  game.log.push(message);
  if (game.log.length > 80) game.log.shift();
}

function saveGame(showMessage = true) {
  persistGameState(game);
  if (showMessage) {
    log(`Saved ${game.title} for offline play on this device.`);
    render();
  }
}

function createSaveId() {
  return `save-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function saveStorageKey(id) {
  return `${SAVE_SLOT_PREFIX}${id}`;
}

function readSaveIndex() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVE_INDEX_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSaveIndex(index) {
  localStorage.setItem(SAVE_INDEX_KEY, JSON.stringify(index));
}

function buildSaveMeta(state) {
  return {
    id: state.saveId,
    title: state.title || "ATL Empire",
    updatedAt: Date.now(),
    currentPlayer: state.players?.[state.current]?.name || "Player 1",
    playerSummary: (state.players || []).map((player) => player.name).join(", ")
  };
}

function persistGameState(state) {
  if (!state.saveId) state.saveId = createSaveId();
  localStorage.setItem(saveStorageKey(state.saveId), JSON.stringify(state));
  const index = readSaveIndex().filter((entry) => entry.id !== state.saveId);
  index.unshift(buildSaveMeta(state));
  writeSaveIndex(index);
}

function migrateLegacySave() {
  const legacy = localStorage.getItem(STORAGE_KEY);
  if (!legacy) return;
  try {
    const parsed = JSON.parse(legacy);
    if (parsed?.players) {
      const restored = hydrate(parsed);
      persistGameState(restored);
    }
  } catch {}
  localStorage.removeItem(STORAGE_KEY);
}

function renderSavedGamesList() {
  if (!els.savedGamesPanel || !els.savedGamesList) return;
  const saves = readSaveIndex().filter((entry) => localStorage.getItem(saveStorageKey(entry.id)));
  if (!saves.length) {
    els.savedGamesPanel.classList.add("hidden");
    els.savedGamesList.innerHTML = "";
    return;
  }
  els.savedGamesPanel.classList.remove("hidden");
  els.savedGamesList.innerHTML = saves.map((save) => `
    <article class="saved-game-card">
      <div class="saved-game-copy">
        <strong>${escapeHtml(save.title)}</strong>
        <span>${escapeHtml(save.playerSummary || "")}</span>
        <span>Current turn: ${escapeHtml(save.currentPlayer || "Player 1")} · Updated ${new Date(save.updatedAt).toLocaleString()}</span>
      </div>
      <div class="saved-game-actions">
        <button type="button" data-save-load="${save.id}">Load</button>
        <button type="button" data-save-edit="${save.id}">Edit</button>
        <button type="button" data-save-delete="${save.id}">Delete</button>
      </div>
    </article>
  `).join("");
}

function handleSavedGamesClick(event) {
  const loadButton = event.target.closest("[data-save-load]");
  const editButton = event.target.closest("[data-save-edit]");
  const deleteButton = event.target.closest("[data-save-delete]");
  if (loadButton) loadSavedGame(loadButton.dataset.saveLoad);
  if (editButton) renameSavedGame(editButton.dataset.saveEdit);
  if (deleteButton) deleteSavedGame(deleteButton.dataset.saveDelete);
}

function loadSavedGame(saveId) {
  const raw = localStorage.getItem(saveStorageKey(saveId));
  if (!raw) {
    deleteSavedGame(saveId, false);
    renderSavedGamesList();
    return;
  }
  try {
    game = hydrate(JSON.parse(raw));
    game.saveId = saveId;
    showGame();
    log(`Loaded ${game.title}.`);
    render();
    maybeRunBot();
  } catch {
    deleteSavedGame(saveId, false);
    renderSavedGamesList();
  }
}

function renameSavedGame(saveId) {
  const raw = localStorage.getItem(saveStorageKey(saveId));
  if (!raw) return;
  try {
    const state = JSON.parse(raw);
    const nextTitle = window.prompt("Rename saved game", state.title || "ATL Empire");
    if (!nextTitle) return;
    state.title = nextTitle.trim() || "ATL Empire";
    state.saveId = saveId;
    persistGameState(state);
    renderSavedGamesList();
  } catch {}
}

function deleteSavedGame(saveId, askFirst = true) {
  if (askFirst && !window.confirm("Delete this saved game?")) return;
  localStorage.removeItem(saveStorageKey(saveId));
  writeSaveIndex(readSaveIndex().filter((entry) => entry.id !== saveId));
  renderSavedGamesList();
}

function shuffle(items) {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}

function spaceIcon(space) {
  const lower = space.name.toLowerCase();
  if (space.type === "go") return svgIcon("peachtree");
  if (space.type === "traffic") return svgIcon("traffic");
  if (space.type === "goToTraffic") return svgIcon("road");
  if (space.type === "lottery") return svgIcon("lottery");
  if (space.type === "tax") return svgIcon("tax");
  if (space.type === "card") return svgIcon(space.deck === "chance" ? "chance" : "heart");
  if (space.kind === "trail") return svgIcon("trail");
  if (space.kind === "utility") return svgIcon(lower.includes("power") ? "power" : "fiber");
  if (lower.includes("airport")) return svgIcon(lower.includes("hartsfield") ? "jet" : "privateJet");
  if (["hawks", "braves", "falcons"].some((name) => lower.includes(name))) return svgIcon("sport");
  if (["school", "academy", "preparatory", "marist"].some((name) => lower.includes(name))) return svgIcon("school");
  if (["mall", "plaza", "phipps", "lenox"].some((name) => lower.includes(name))) return svgIcon("mall");
  if (["aquarium", "coca", "football"].some((name) => lower.includes(name))) return svgIcon("attraction");
  if (["battery", "station", "market"].some((name) => lower.includes(name))) return svgIcon("blocks");
  if (["buckhead", "decatur", "vinings"].some((name) => lower.includes(name))) return svgIcon("district");
  return svgIcon("key");
}

function spaceArt(space, variant = "detail") {
  return zoomableArtFromSlug(spaceSlug(space), variant, spaceIcon(space), space.name);
}

function zoomableArtFromSlug(slug, variant, fallback, title = "") {
  const src = `assets/board/${slug}.png`;
  const artClass = variant === "thumb" ? "thumb-art detail-art-button" : "detail-art detail-art-button";
  return `<button type="button" class="${artClass}" data-zoom-src="${src}" data-zoom-title="${escapeHtml(title)}" aria-label="Open art for ${escapeHtml(title)}">${assetImage(src, variant, fallback)}</button>`;
}

function assetImage(src, variant, fallback) {
  return `<img class="generated-art generated-art-${variant}" src="${src}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><span class="art-fallback">${fallback}</span>`;
}

function spaceSlug(space) {
  return space.assetSlug || slugify(space.name);
}

function cornerName(space) {
  if (space.type === "goToTraffic" || space.type === "lottery") return "";
  return space.name;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function tokenMarkup(id) {
  const token = tokens.find((candidate) => candidate.id === id) || tokens[0];
  return `
    <span class="piece-token ${token.id}">
      <span class="piece-shadow"></span>
      <img class="piece-image" src="assets/tokens/${token.asset}" alt="${escapeHtml(token.name)} token" loading="lazy" decoding="async">
    </span>
  `;
}

function tokensOn(index) {
  if (!game) return "";
  return game.players
    .filter((player) => !player.bankrupt && player.position === index)
    .map((player) => `<span class="board-token token-${player.token} ${game.movingPlayerId === player.id ? "moving" : ""}" style="--token-color:${player.color}" title="${escapeHtml(player.name)}">${tokenMarkup(player.token)}</span>`)
    .join("");
}

function dieMarkup(value, variant = "full") {
  const label = value ? `Die showing ${value}` : "Die waiting for roll";
  const pips = new Set(diePipIndexes(value));
  return `
    <span class="die-face ${variant === "compact" ? "die-compact" : ""}" role="img" aria-label="${label}">
      <span class="die-grid">
        ${Array.from({ length: 9 }, (_, index) => `<span class="die-pip ${pips.has(index + 1) ? "visible" : ""}"></span>`).join("")}
      </span>
    </span>
  `;
}

function diePipIndexes(value) {
  const map = {
    1: [5],
    2: [1, 9],
    3: [1, 5, 9],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9]
  };
  return map[value] || [];
}

function svgIcon(kind) {
  const map = {
    peach: `<svg viewBox="0 0 64 64"><circle cx="30" cy="36" r="18"/><path d="M34 16c12 0 19 6 22 17-12 0-20-6-22-17Z"/></svg>`,
    peanut: `<svg viewBox="0 0 64 64"><path d="M23 12c8 0 12 7 10 16 8 2 13 9 10 17-3 10-14 13-22 7-9-7-7-18 0-23-5-7-4-17 2-17Z"/></svg>`,
    bottle: `<svg viewBox="0 0 64 64"><path d="M27 7h10v13c6 6 8 16 7 29-1 6-5 9-12 9s-11-3-12-9c-1-13 1-23 7-29V7Z"/><path d="M24 34h16"/></svg>`,
    jet: `<svg viewBox="0 0 64 64"><path d="M58 31 8 12l7 17-9 5 9 5-7 17 50-19c4-2 4-4 0-6Z"/></svg>`,
    camera: `<svg viewBox="0 0 64 64"><rect x="8" y="20" width="32" height="24" rx="4"/><path d="M40 27l16-9v28l-16-9Z"/><circle cx="23" cy="32" r="6"/></svg>`,
    record: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="23"/><circle cx="32" cy="32" r="7"/><circle cx="32" cy="32" r="2"/></svg>`,
    torch: `<svg viewBox="0 0 64 64"><path d="M32 7c10 12 2 16 2 24 6-5 12-2 12 6 0 8-6 14-14 14s-14-6-14-14c0-10 9-17 14-30Z"/><path d="M25 51h14l-4 8h-6Z"/></svg>`,
    sandwich: `<svg viewBox="0 0 64 64"><path d="M10 28c5-13 39-13 44 0v6H10v-6Z"/><rect x="12" y="34" width="40" height="12" rx="4"/><path d="M16 47h32"/></svg>`,
    peachtree: `<svg viewBox="0 0 64 64"><circle cx="30" cy="36" r="18"/><path d="M34 16c12 0 19 6 22 17-12 0-20-6-22-17Z"/></svg>`,
    traffic: `<svg viewBox="0 0 64 64"><rect x="9" y="28" width="46" height="16" rx="5"/><circle cx="19" cy="48" r="5"/><circle cx="45" cy="48" r="5"/><path d="M18 28l6-10h16l7 10"/></svg>`,
    road: `<svg viewBox="0 0 64 64"><path d="M25 58 31 6h6l8 52"/><path d="M34 14v7M35 30v9M37 48v8"/></svg>`,
    lottery: `<svg viewBox="0 0 64 64"><rect x="12" y="18" width="40" height="30" rx="5"/><circle cx="24" cy="33" r="7"/><circle cx="40" cy="33" r="7"/><path d="M18 18v-6h28v6"/></svg>`,
    tax: `<svg viewBox="0 0 64 64"><rect x="16" y="10" width="32" height="44" rx="3"/><path d="M23 22h18M23 32h18M23 42h10"/></svg>`,
    chance: `<svg viewBox="0 0 64 64"><path d="M26 44c0-10 12-10 12-21 0-7-5-12-13-12-6 0-11 3-14 8"/><circle cx="28" cy="54" r="4"/></svg>`,
    heart: `<svg viewBox="0 0 64 64"><path d="M32 53S10 39 10 23c0-8 5-13 12-13 5 0 8 3 10 6 2-3 5-6 10-6 7 0 12 5 12 13 0 16-22 30-22 30Z"/></svg>`,
    trail: `<svg viewBox="0 0 64 64"><path d="M8 48c13-18 30 5 48-20"/><circle cx="15" cy="45" r="4"/><circle cx="49" cy="29" r="4"/><path d="M18 18h13l-7 14"/></svg>`,
    power: `<svg viewBox="0 0 64 64"><path d="M36 5 17 36h14l-4 23 20-34H33l3-20Z"/></svg>`,
    fiber: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="8"/><path d="M32 8v16M32 40v16M8 32h16M40 32h16M15 15l12 12M37 37l12 12M49 15 37 27M27 37 15 49"/></svg>`,
    privateJet: `<svg viewBox="0 0 64 64"><path d="M57 31 19 17l5 13-16 3 16 3-5 13 38-14c4-1 4-3 0-4Z"/></svg>`,
    sport: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22"/><path d="M13 32h38M32 10c-7 10-7 34 0 44M32 10c7 10 7 34 0 44"/></svg>`,
    school: `<svg viewBox="0 0 64 64"><path d="M8 28 32 15l24 13-24 13L8 28Z"/><path d="M18 34v12c8 6 20 6 28 0V34"/></svg>`,
    mall: `<svg viewBox="0 0 64 64"><rect x="13" y="22" width="38" height="30" rx="3"/><path d="M22 22c0-8 4-13 10-13s10 5 10 13M13 33h38"/></svg>`,
    attraction: `<svg viewBox="0 0 64 64"><path d="M12 50h40L46 22 32 9 18 22l-6 28Z"/><path d="M24 50V33h16v17"/></svg>`,
    blocks: `<svg viewBox="0 0 64 64"><rect x="10" y="25" width="17" height="27"/><rect x="29" y="13" width="25" height="39"/><path d="M35 22h12M35 31h12M35 40h12M15 33h7M15 42h7"/></svg>`,
    district: `<svg viewBox="0 0 64 64"><path d="M10 52h44"/><rect x="14" y="24" width="10" height="28"/><rect x="28" y="12" width="12" height="40"/><rect x="44" y="30" width="8" height="22"/></svg>`,
    key: `<svg viewBox="0 0 64 64"><circle cx="23" cy="32" r="10"/><path d="M33 32h22M47 32v8M39 32v6"/></svg>`
  };
  return map[kind] || map.key;
}
