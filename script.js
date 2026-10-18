const form = document.getElementById("doseForm");
const clearBtn = document.getElementById("clearBtn");
const resultCard = document.getElementById("resultCard");
const errorMessage = document.getElementById("errorMessage");
const capacityWarning = document.getElementById("capacityWarning");

const totalMgPreset = document.getElementById("totalMgPreset");
const totalMlPreset = document.getElementById("totalMlPreset");
const doseMgPreset = document.getElementById("doseMgPreset");

const totalMgInput = document.getElementById("totalMg");
const totalMlInput = document.getElementById("totalMl");
const doseMgInput = document.getElementById("doseMg");

const totalMgCustomWrap = document.getElementById("totalMgCustomWrap");
const totalMlCustomWrap = document.getElementById("totalMlCustomWrap");
const doseMgCustomWrap = document.getElementById("doseMgCustomWrap");
const syringeTypeInput = document.getElementById("syringeType");
const syringeCapacityInput = document.getElementById("syringeCapacity");
const confirmLabelInput = document.getElementById("confirmLabel");

const resultUnits = document.getElementById("resultUnits");
const exactUnitsText = document.getElementById("exactUnitsText");
const resultMl = document.getElementById("resultMl");
const resultConcentration = document.getElementById("resultConcentration");
const resultDoses = document.getElementById("resultDoses");
const formulaText = document.getElementById("formulaText");

function parseNumber(value) {
  return Number(String(value).replace(",", "."));
}

function getSelectedValue(select, customInput) {
  if (select.value === "other") {
    return parseNumber(customInput.value);
  }
  return parseNumber(select.value);
}

function configurePreset(select, customWrap, customInput) {
  select.addEventListener("change", () => {
    const isOther = select.value === "other";
    customWrap.classList.toggle("hidden", !isOther);

    if (isOther) {
      customInput.focus();
    } else {
      customInput.value = "";
    }
  });
}

configurePreset(totalMgPreset, totalMgCustomWrap, totalMgInput);
configurePreset(totalMlPreset, totalMlCustomWrap, totalMlInput);
configurePreset(doseMgPreset, doseMgCustomWrap, doseMgInput);

function formatNumber(value, maxDecimals = 4) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals
  }).format(value);
}

function showError(message) {
  errorMessage.textContent = message;
  resultCard.classList.add("hidden");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorMessage.textContent = "";

  const totalMg = getSelectedValue(totalMgPreset, totalMgInput);
  const totalMl = getSelectedValue(totalMlPreset, totalMlInput);
  const doseMg = getSelectedValue(doseMgPreset, doseMgInput);
  const unitsPerMl = Number(syringeTypeInput.value);
  const syringeCapacityMl = Number(syringeCapacityInput.value);

  if (![totalMg, totalMl, doseMg, unitsPerMl, syringeCapacityMl].every(Number.isFinite)) {
    showError("Preencha todos os campos com números válidos.");
    return;
  }

  if (totalMg <= 0 || totalMl <= 0 || doseMg <= 0) {
    showError("Os valores precisam ser maiores que zero.");
    return;
  }

  if (!confirmLabelInput.checked) {
    showError("Confirme que você conferiu os valores diretamente no rótulo.");
    return;
  }

  if (doseMg > totalMg) {
    showError("A dose informada é maior que a quantidade total existente no frasco.");
    return;
  }

  const concentration = totalMg / totalMl;
  const requiredMl = doseMg / concentration;
  const syringeUnits = requiredMl * unitsPerMl;
  const dosesInVial = totalMg / doseMg;
  const maxUnits = syringeCapacityMl * unitsPerMl;

  if (!Number.isFinite(requiredMl) || !Number.isFinite(syringeUnits)) {
    showError("Não foi possível calcular. Confira os valores informados.");
    return;
  }

  const roundedUnits = Math.round(syringeUnits);

  resultUnits.textContent = formatNumber(roundedUnits, 0);
  exactUnitsText.textContent = `Valor exato: ${formatNumber(syringeUnits, 2)} unidades`;
  resultMl.textContent = formatNumber(requiredMl, 4);
  resultConcentration.textContent = `${formatNumber(concentration, 4)} mg/mL`;
  resultDoses.textContent = formatNumber(dosesInVial, 2);

  formulaText.textContent =
`Concentração = ${formatNumber(totalMg)} mg ÷ ${formatNumber(totalMl)} mL
Concentração = ${formatNumber(concentration, 4)} mg/mL

Volume necessário = ${formatNumber(doseMg)} mg ÷ ${formatNumber(concentration, 4)} mg/mL
Volume necessário = ${formatNumber(requiredMl, 4)} mL

Unidades U-100 = ${formatNumber(requiredMl, 4)} mL × ${unitsPerMl}
Unidades exatas = ${formatNumber(syringeUnits, 2)}
Unidades arredondadas = ${formatNumber(roundedUnits, 0)}`;

  capacityWarning.classList.add("hidden");
  capacityWarning.textContent = "";

  if (requiredMl > syringeCapacityMl) {
    capacityWarning.textContent =
      `O volume calculado ultrapassa a capacidade da seringa selecionada (${formatNumber(maxUnits)} unidades). Não divida ou improvise a aplicação sem orientação profissional.`;
    capacityWarning.classList.remove("hidden");
  } else if (!Number.isInteger(syringeUnits)) {
    const direction = roundedUnits > syringeUnits ? "para cima" : "para baixo";
    capacityWarning.textContent =
      `O valor exato foi arredondado ${direction}, de ${formatNumber(syringeUnits, 2)} para ${formatNumber(roundedUnits, 0)} unidades.`;
    capacityWarning.classList.remove("hidden");
  }

  resultCard.classList.remove("hidden");
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
});

clearBtn.addEventListener("click", () => {
  form.reset();
  syringeCapacityInput.value = "1";
  errorMessage.textContent = "";
  resultCard.classList.add("hidden");
  totalMgCustomWrap.classList.add("hidden");
  totalMlCustomWrap.classList.add("hidden");
  doseMgCustomWrap.classList.add("hidden");
  totalMgPreset.focus();
});
