"use strict";

(function applyRaiseCashHotfix() {
  if (window.__raiseCashHotfix20260502d) return;
  window.__raiseCashHotfix20260502d = true;

  const style = document.createElement("style");
  style.textContent = ".debt-dock{display:none!important;}";
  document.head.appendChild(style);

  const originalGetTurnControls = getTurnControls;
  getTurnControls = function patchedGetTurnControls(player) {
    const controls = originalGetTurnControls(player);
    if (game?.debt) {
      controls.diceHtml = `<button type="button" class="center-roll-button debt-roll-button" data-center-action="debt">Raise Cash</button>`;
      controls.actionsHtml = controls.actionsHtml.includes('data-action="debt"')
        ? controls.actionsHtml.replace("Resolve Debt", "Raise Cash")
        : `${controls.actionsHtml}${button("Raise Cash", "debt")}`;
    }
    return controls;
  };

  statusForCurrentTurn = function patchedStatusForCurrentTurn() {
    const player = activePlayer();
    if (!player) return "";
    if (game.animating) return game.status || `${player.name} is moving.`;
    if (game.phase === "over") return `${player.name} wins.`;
    if (game.debt) {
      const debtor = playerById(game.debt.playerId);
      const shortfall = Math.max(0, -(debtor?.cash || 0));
      if (shortfall <= 0) return `${debtor?.name || player.name} has enough cash to pay ${debtCreditorName(game.debt)}.`;
      return `${debtor?.name || player.name} needs to raise $${shortfall} to pay ${debtCreditorName(game.debt)}.`;
    }
    if (game.phase === "rolling") return `${player.name} is rolling.`;
    if (game.phase === "buy") return `${board[player.position].name} is available for $${board[player.position].price}.`;
    if (game.phase === "pending") return game.pending?.message || "Resolve the pending action.";
    if (game.phase === "trafficExit") return `${player.name} did not roll doubles on the third traffic turn. Use a Peach Pass or buy one for $${TRAFFIC_FINE}, then move ${game.trafficExit?.total || 0}.`;
    if (game.phase === "resolve") return `${player.name} is at ${board[player.position].name}. End the turn when ready.`;
    if (player.inTraffic) return trafficRollStatus(player);
    return `${player.name}, roll to play.`;
  };

  const originalRenderDebtModal = renderDebtModal;
  renderDebtModal = function patchedRenderDebtModal() {
    if (game?.debt) game.phase = "debt";
    return originalRenderDebtModal();
  };

  minimizeDebt = function patchedMinimizeDebt() {
    if (game?.debt) game.phase = "debt";
    closeModal();
    render();
  };

  autoRaiseCash = function patchedAutoRaiseCash(player = null) {
    const debt = game?.debt;
    const debtor = debt ? playerById(debt.playerId) : player;
    if (!debt || !debtor) return;
    game.phase = "debt";
    const startingCash = debtor.cash;
    log(`${debtor.name} chose Auto Raise Cash. The Bank will sell buildings first, then mortgage eligible properties.`);
    autoSellBuildings(debtor);
    mortgageRecommendations(debtor).forEach((space) => {
      if (debtor.cash >= 0) return;
      mortgageProperty(debtor, space.index);
    });
    if (debtor.cash === startingCash) {
      game.status = `${debtor.name} has no automatic sell or mortgage move available right now.`;
      log(game.status);
    } else {
      game.status = `${debtor.name} auto-raised $${debtor.cash - startingCash}.`;
      log(game.status);
    }
    if (debtor.cash < 0) {
      log(`${debtor.name} is still short $${Math.abs(debtor.cash)} after legal automatic liquidation.`);
    }
  };

  finishDebtIfSolved = function patchedFinishDebtIfSolved() {
    if (!game.debt) return;
    const debt = game.debt;
    const player = playerById(debt.playerId);
    if (player.cash < 0) return;
    settleDebt(debt);
    game.debt = null;
    game.phase = "resolve";
    game.status = `${player.name} raised enough cash and paid ${debtCreditorName(debt)}.`;
    log(`${player.name} raised enough cash and paid $${debt.amount} to ${debtCreditorName(debt)}.`);
    closeModal();
    render();
  };
})();
