"use strict";

const form = document.querySelector("#risk-form");
const probability = document.querySelector("#probability");
const damage = document.querySelector("#damage");
const errorBox = document.querySelector("#form-error");
const result = document.querySelector("#result");
const scoreNode = document.querySelector("#score");
const levelNode = document.querySelector("#level");
const priorityNode = document.querySelector("#priority");

function isValidFactor(value) {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

function classifyRisk(score) {
  if (score <= 4) {
    return { key: "low", label: "Basso", message: "Mantenere le misure e monitorare." };
  }
  if (score <= 9) {
    return { key: "moderate", label: "Moderato", message: "Programmare miglioramenti e controlli." };
  }
  if (score <= 16) {
    return { key: "high", label: "Alto", message: "Intervenire in tempi brevi e rivalutare." };
  }
  return {
    key: "critical",
    label: "Critico",
    message: "Sospendere o controllare l’attività prima di procedere."
  };
}

function renderResult(score) {
  const classification = classifyRisk(score);
  scoreNode.textContent = String(score);
  levelNode.textContent = classification.label;
  priorityNode.textContent = classification.message;
  result.dataset.level = classification.key;
  result.hidden = false;
  result.focus();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorBox.textContent = "";

  const p = Number(probability.value);
  const d = Number(damage.value);

  if (!isValidFactor(p) || !isValidFactor(d)) {
    errorBox.textContent = "Selezionare probabilità e danno da 1 a 5.";
    (probability.value ? damage : probability).focus();
    return;
  }

  renderResult(p * d);
});

form.addEventListener("reset", () => {
  queueMicrotask(() => {
    errorBox.textContent = "";
    result.hidden = true;
    delete result.dataset.level;
    probability.focus();
  });
});

function initQrCode() {
  const qrContainer = document.querySelector("#qrcode");
  const target = new URL("./guida-rischio.pdf", document.baseURI).href;

  if (!qrContainer) return;

  if (typeof window.QRCode === "undefined") {
    qrContainer.textContent = "QR code non disponibile. Utilizzare il collegamento al PDF.";
    return;
  }

  qrContainer.innerHTML = "";
  new QRCode(qrContainer, {
    text: target,
    width: 160,
    height: 160,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M
  });
}

window.addEventListener("DOMContentLoaded", initQrCode);
