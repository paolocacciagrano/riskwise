"use strict";

const form = document.querySelector("#risk-form");
const hazard = document.querySelector("#hazard");
const probability = document.querySelector("#probability");
const damage = document.querySelector("#damage");
const errorBox = document.querySelector("#form-error");
const result = document.querySelector("#result");
const scenarioNode = document.querySelector("#scenario");
const formulaNode = document.querySelector("#formula");
const scoreNode = document.querySelector("#score");
const levelNode = document.querySelector("#level");
const priorityNode = document.querySelector("#priority");
const boundaryNote = document.querySelector("#boundary-note");

const PUBLIC_SITE = "https://paolocacciagrano.github.io/riskwise/";
const PDF_URL = new URL("guida-rischio.pdf", PUBLIC_SITE).href;

function isValidFactor(value) {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

function classifyRisk(score) {
  if (score <= 4) {
    return {
      key: "low",
      label: "Basso",
      message: "Mantenere le misure esistenti e programmare il monitoraggio."
    };
  }

  if (score <= 9) {
    return {
      key: "moderate",
      label: "Moderato",
      message: "Programmare miglioramenti, controlli e una successiva rivalutazione."
    };
  }

  if (score <= 16) {
    return {
      key: "high",
      label: "Alto",
      message: "Adottare misure in tempi brevi e verificare il rischio residuo."
    };
  }

  return {
    key: "critical",
    label: "Critico",
    message: "Controllare o sospendere l'attività prima di procedere, salvo misure immediate adeguate."
  };
}

function isBoundaryScore(score) {
  return [4, 5, 9, 10, 16, 17].includes(score);
}

function renderResult(p, d) {
  const score = p * d;
  const classification = classifyRisk(score);
  const scenario = hazard.value.trim();

  scenarioNode.textContent = scenario || "Non specificato";
  formulaNode.textContent = `${p} × ${d}`;
  scoreNode.textContent = String(score);
  levelNode.textContent = classification.label;
  priorityNode.textContent = classification.message;

  if (isBoundaryScore(score)) {
    boundaryNote.textContent =
      "Il punteggio è prossimo a una soglia di classificazione: documentare le ragioni della stima e riesaminare i fattori nel contesto concreto.";
    boundaryNote.hidden = false;
  } else {
    boundaryNote.textContent = "";
    boundaryNote.hidden = true;
  }

  result.dataset.level = classification.key;
  result.hidden = false;
  result.focus();
}

function showValidationError() {
  errorBox.textContent = "Selezionare probabilità e danno con valori compresi tra 1 e 5.";
  const firstInvalid = probability.value ? damage : probability;
  firstInvalid.setAttribute("aria-invalid", "true");
  firstInvalid.focus();
}

function clearValidationState() {
  errorBox.textContent = "";
  probability.removeAttribute("aria-invalid");
  damage.removeAttribute("aria-invalid");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearValidationState();

  const p = Number(probability.value);
  const d = Number(damage.value);

  if (!isValidFactor(p) || !isValidFactor(d)) {
    showValidationError();
    return;
  }

  renderResult(p, d);
});

form.addEventListener("reset", () => {
  queueMicrotask(() => {
    clearValidationState();
    result.hidden = true;
    delete result.dataset.level;
    scenarioNode.textContent = "Non specificato";
    formulaNode.textContent = "-";
    scoreNode.textContent = "-";
    levelNode.textContent = "-";
    priorityNode.textContent = "";
    boundaryNote.hidden = true;
    probability.focus();
  });
});

probability.addEventListener("change", clearValidationState);
damage.addEventListener("change", clearValidationState);

function initQrCode() {
  const qrContainer = document.querySelector("#qrcode");
  if (!qrContainer) return;

  if (typeof window.QRCode === "undefined") {
    const fallback = document.createElement("a");
    fallback.href = PDF_URL;
    fallback.textContent = "Apri la guida PDF";
    qrContainer.replaceChildren(fallback);
    return;
  }

  qrContainer.replaceChildren();
  new QRCode(qrContainer, {
    text: PDF_URL,
    width: 180,
    height: 180,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M
  });
}

window.addEventListener("DOMContentLoaded", initQrCode);
