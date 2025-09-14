/*=========================================
Обозначения (вводимые пользователем)
A_t — целевая крепость (фракция), напр. 0.17.
S_t — целевая сахаристость (г/л).

V0 — начальныц объём виноградного сусла, л.
S0 — начальная сахаристость сусла(г/л).
D0 - начальная плотность сусла (г/л),

S_m — текущая сахаристость сусла в момент внесения (г/л).
A_m — текущая крепость (фракция, напр. 0.06 для 6%);
альтернативно A_m можно получить через (S0 - S_m)/1600.

A_s — крепость спиртосодержащего материала (фракция, напр. 0.95).
S_s — сахаристость спиртосодержащего материала (г/л). Часто для чистого ректификата S_s ≈ 0. Для бренди/ликёра — >0.
Мы пренебрегаем усадкой объёма (V = V0 + x).
=========================================*/


let unitOfSugar = true; // Цукристість - true, густина - false
let isSimplifiedCalculationSystem = false;
let collapsed = true;
let isSaveHistory = false;

// ==================== Toast ====================
function showToast(message, type = "info") {
    const toastContainer = document.getElementById("toastContainer");

    let bgClass = "bg-primary";
    if (type === "success") bgClass = "bg-success";
    if (type === "warning") bgClass = "bg-warning text-dark";
    if (type === "danger") bgClass = "bg-danger";

    const toastEl = document.createElement("div");
    toastEl.className = `toast align-items-center text-white ${bgClass} border-0`;
    toastEl.role = "alert";
    toastEl.ariaLive = "assertive";
    toastEl.ariaAtomic = "true";
    toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;

    toastContainer.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, {delay: 3000});
    toast.show();
    toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}

// ==================== Расчет CU ====================
function calculateCU() {
    resetResult();
    let S_t = parseFloat(document.getElementById('sugarTarget').value);
    let A_t = parseFloat(document.getElementById('alcoholTarget').value);
    if (isNaN(A_t) || A_t < 0 || isNaN(S_t) || S_t < 0) {
        return null;
    }
    let conservationUnit = document.getElementById('conservationUnit');
    const CU = S_t + (A_t * 4.5);
    if (CU < 80) {
        conservationUnit.textContent = 'Кількість CU : ';
        conservationUnit.textContent += CU.toFixed(2);
        conservationUnit.style.color = "red";
    } else {
        conservationUnit.textContent = 'Кількість CU : ';
        conservationUnit.textContent += CU.toFixed(2);
        conservationUnit.style.color = "green";
    }
    return {A_t: A_t / 100, S_t: S_t * 10};
}

// ==================== Основной расчет ====================
function calcResult() {
    let S0 = Number(document.getElementById('S0').value * 10);
    let V0 = Number(document.getElementById('V0').value);
    let As = Number(document.getElementById('As').value / 100);
    let Ss = Number(document.getElementById('Ss').value * 10);
    let D0;

    let dellaData = calculateCU();

    if ((!dellaData || [V0, S0, As].some(v => isNaN(v) || v <= 0)) || (isNaN(Ss) || Ss < 0)) {
        resetResultBox();
        return;
    }
    if (unitOfSugar) {
        D0 = (S0 / 10 + 269.55213512) / 0.26678527537;
    } else {
        D0 = S0 / 10;
        S0 = (-269.55213512 + 0.26678527537 * S0 / 10) * 10;
    }

    // console.log(D0);

    let A_t = dellaData.A_t;
    let S_t = dellaData.S_t;
    let box = document.getElementById("resultBox");

    let denom = (As - A_t) - (S_t - Ss) / 1690;
    if (Math.abs(denom) < 1e-6) {
        box.className = "alert alert-danger";
        box.textContent = "Помилка: некоректні параметри (ділення на 0)";
        return;
    }

    // Сахаристость сусла на момент внесения
    let S_star = (S_t * (As - A_t) + (A_t - S0 / 1690) * (S_t - Ss)) / denom;
    // Спиртуозность сусла на момент внесения
    let A_m_star = (S0 - S_star) / 1690;
    // Плотность сусла на момент внесения
    let D_star = (D0 * 0.001 - (A_m_star * 100) / 131.25) * 1000;

    let x_alc = V0 * (A_t - A_m_star) / (As - A_t);
    let x_sug = V0 * (S_t - S_star) / (Ss - S_t);

    // Объем спирта для внесения
    let avg_x = (x_alc + x_sug) / 2;
    let diffPercent = Math.abs(x_alc - x_sug) / avg_x * 100;

    // Определяем цвет прогресс-бара и alert
    let alertClass = "alert-primary";
    let color = "#198754"; // зелёный
    let diffMsg = "";

    if (diffPercent > 10) {
        alertClass = "alert-danger";
        color = "#dc3545"; // красный
        diffMsg = `Різниця між розрахунком по спирту та цукру: ${diffPercent.toFixed(1)}% (неузгоджено!)`;
    } else if (diffPercent > 5) {
        alertClass = "alert-warning";
        color = "#ffc107"; // жёлтый
        diffMsg = `Різниця між розрахунком по спирту та цукру: ${diffPercent.toFixed(1)}% (увага)`;
    }

    let progressHtml = `<div class="progress mb-2" style="height: 8px;"> <div class="progress-bar" role="progressbar"
      style="width: ${Math.min(diffPercent, 100)}%; background-color: ${color};"></div>
    </div>
  `;

    if (([S_star, A_m_star, avg_x].some(v => isNaN(v) || v <= 0))
        || (!unitOfSugar && (isNaN(D_star) || D_star <= 0))) {
        box.className = "alert alert-danger";
        box.textContent = "Помилка: некоректні параметри!";
        return;
    }

    let msg = unitOfSugar ?
        `<b>Початкова густина сусла:</b> ${D0.toFixed(1)} г/л <br>
    <b>Об'єм AM:</b> ${avg_x.toFixed(2)} л (по спирту: ${x_alc.toFixed(2)} л, по цукру: ${x_sug.toFixed(2)} л)<br>
    <b>Момент спиртування:</b>  цукор ≈ ${(S_star / 10).toFixed(1)} г/100см<sup>3</sup>, (густина : ${D_star.toFixed(1)} г/л)<br>
    <b>Спиртуозність сусла на момент спиртування:</b> ${(A_m_star * 100).toFixed(2)} об. %<br>
    ${diffMsg}`
        :
        `<b>Початкова цукристість сусла:</b> ${(S0 * 0.1).toFixed(2)} г/100см<sup>3</sup><br>
    <b>Об'єм AM:</b> ${avg_x.toFixed(2)} л (по спирту: ${x_alc.toFixed(2)} л, по цукру: ${x_sug.toFixed(2)} л)<br>
    <b>Момент спиртування:</b>  густина ≈ ${D_star.toFixed(1)} г/л (цукор : ${(S_star / 10).toFixed(2)} г/100см<sup>3</sup>)<br>
    <b>Спиртуозність сусла на момент спиртування:</b> ${(A_m_star * 100).toFixed(2)} об. %<br>
    ${diffMsg}`

    box.className = `alert ${alertClass}`;
    box.innerHTML = progressHtml + msg;

    if (isSaveHistory) {

        const result = {
            addVolume: avg_x,
            sugarMoment: S_star,
            densityMoment: D_star,
            alcMoment: A_m_star
        };

        const saveBtn = document.getElementById("saveCalcBtn");
        saveBtn.classList.remove("d-none");
        saveBtn.onclick = () => {
            addToHistory({V0, S0, D0, As, Ss, A_t, S_t}, result);
            showToast("✅ Розрахунок сбережено", "success");
            // saveBtn.classList.add("d-none");
            // Автоматически открываем шаг 4 и скроллим к нему
            const step3 = document.getElementById("flush-collapseSix");
            const bsCollapse = new bootstrap.Collapse(step3, {show: true});
            step3.scrollIntoView({behavior: "smooth"});
        };
    }
}

// ==================== История ====================
const HISTORY_LIMIT = 5;

function showAccordionItemHistory() {
    let historyItems = document.getElementById("history-item_id");
    if (isSaveHistory && historyItems) {
        historyItems.classList.add("d-none");
    } else {
        historyItems.classList.remove("d-none");
    }
    isSaveHistory = !isSaveHistory;
    calcResult();
}

function getHistory() {
    return JSON.parse(localStorage.getItem("calcHistory") || "[]");
}

function saveHistory(history) {
    localStorage.setItem("calcHistory", JSON.stringify(history));
}

function addToHistory(inputs, result) {
    let history = getHistory();
    let entry = {inputs, result, timestamp: Date.now()};
    history.unshift(entry);
    if (history.length > HISTORY_LIMIT) history = history.slice(0, HISTORY_LIMIT);
    saveHistory(history);
    renderHistory();
}

function renderHistory() {
    let history = getHistory();
    let historyBox = document.getElementById("historyBox");
    if (history.length === 0) {
        historyBox.innerHTML = `<p class="text-muted">Жодного запису не знайдено</p>`;
        return;
    }
    if (historyBox) {
        historyBox.innerHTML = '';
        if (unitOfSugar) {
            //------------------------------>  По сахару
            history.forEach((his, index) => {
                let inp = his.inputs;
                let res = his.result;
                let date = new Date(his.timestamp).toLocaleString();
                let historyItem = document.createElement('div')
                historyItem.innerHTML = [
                    `<div class="card  mt-3">
                       <div class="card-header">
                         <div class="date">
                            <small>${date}</small>
                            <button type="button" class="btn-close" aria-label="Close" onclick="deleteFromHistory(${index})"></button>
                         </div>
                       </div>

                       <div class="card-body">
                         <small class="desc"><b>Початкові дані:</b></small><br>
                         <small><b>At:</b> ${(inp.A_t * 100).toFixed(1)} об.% | <b>St:</b> ${(inp.S_t / 10).toFixed(1)} г/100см<sup>3</sup></small> |
                         <small><b>V0:</b> ${inp.V0} л | <b>S0:</b> ${(inp.S0 / 10).toFixed(1)} г/100см<sup>3</sup></small> |
                         <small><b>As:</b> ${(inp.As * 100).toFixed(1)} об.% | <b>Ss:</b> ${(inp.Ss / 10).toFixed(1)} г/100см<sup>3</sup></small><br>
                       </div>

                       <div class="card-footer">
                         <small class="desc"><b>Результат розрахунку:</b></small><br>
                         <small><b>Об'єм AM:</b> ${res.addVolume.toFixed(2)} л</small> |
                         <small><b>Момент (цукор):</b> ${(res.sugarMoment / 10).toFixed(1)} г/100см<sup>3</sup></small> |
                         <small><b>Спирт. сусла:</b> ${(res.alcMoment * 100).toFixed(2)} об.%</small>
                       </div>
                     </div>`
                ].join('')
                historyBox.appendChild(historyItem);
            });
        } else {
            //------------------------------->  По густоте
            history.forEach((his, index) => {
                let inp = his.inputs;
                let res = his.result;
                let date = new Date(his.timestamp).toLocaleString();
                let historyItem = document.createElement('div')
                historyItem.innerHTML = [
                    `<div class="card mt-3">
                      <div class="card-header">
                        <div class="date">
                            <small>${date}</small>
                            <button type="button" class="btn-close" aria-label="Close"
                            onclick="deleteFromHistory(${index})"></button>
                        </div>
                      </div>

                      <div class="card-body">
                        <small class="desc"><b>Початкові дані:</b></small><br>
                        <small><b>At:</b> ${(inp.A_t * 100).toFixed(1)} об.% | <b>St:</b> ${(inp.S_t / 10).toFixed(1)} г/100см<sup>3</sup></small> |
                        <small><b>V0:</b> ${inp.V0} л | <b>D0:</b> ${(inp.D0).toFixed(1)} г/л</small> |
                        <small><b>As:</b> ${(inp.As * 100).toFixed(1)} об.% | <b>Ss:</b> ${(inp.Ss / 10).toFixed(1)} г/100см<sup>3</sup></small><br>
                      </div>

                      <div class="card-footer">
                        <small class="desc"><b>Результат розрахунку:</b></small><br>
                        <small><b>Об'єм AM:</b> ${res.addVolume.toFixed(2)} л</small> |
                        <small><b>Момент (густина):</b> ${res.densityMoment.toFixed(1)} г/л</small> |
                        <small><b>Спирт. сусла:</b> ${(res.alcMoment * 100).toFixed(2)} об.%</small>
                      </div>
                    </div>`
                ].join('')
                historyBox.appendChild(historyItem);
            });
        }
    }
}

function loadFromHistory(index) {
    let history = getHistory();
    let entry = history[index];
    if (!entry) return;

    document.getElementById("V0").value = entry.inputs.V0;
    document.getElementById("S0").value = entry.inputs.S0;
    document.getElementById("As").value = entry.inputs.As;
    document.getElementById("Ss").value = entry.inputs.Ss;
    document.getElementById("alcoholTarget").value = entry.inputs.A_t;
    document.getElementById("sugarTarget").value = entry.inputs.S_t;

    calcResult();

}

function deleteFromHistory(index) {
    let history = getHistory();
    history.splice(index, 1);
    saveHistory(history);
    renderHistory();
    showToast("Запис видалено", "warning");
}

// document.getElementById("clearHistoryBtn").addEventListener("click", () => {
//     // let history = getHistory();
//     // if (history.length === 0) {
//     //     return
//     // }
//     if (confirm("Ви впевнені, що хочете видалити всю історію розрахунків?")) {
//         localStorage.removeItem("calcHistory");
//         renderHistory();
//         showToast("Записи видалені", "danger");
//     }
// });

document.addEventListener("DOMContentLoaded", () => {
    renderHistory();
});

// ============= Reset ===================================


function resetAll() {
    const form = document.getElementById('calcForm');
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.value = '0';
        input.classList.remove("is-invalid", "is-valid");
    });
    resetResult();
}


function resetResult() {
    resetResultBox();
    resetCU();
}

function resetResultBox() {
    let box = document.getElementById("resultBox");
    box.className = "alert alert-secondary";
    box.textContent = "Заповніть кроки 1 та 2";
    document.getElementById("saveCalcBtn").classList.add("d-none");
}

function resetCU() {
    let conservationUnit = document.getElementById("conservationUnit");
    conservationUnit.textContent = "Кількість CU : не розраховано";
    conservationUnit.style.color = "black";
}

function changeMeasurementMethod(bool) {
    const wortParameter = document.getElementById('wortParameter_id');
    if (wortParameter) {
        if (bool) {
            wortParameter.innerHTML = [
                `<div class="parameter_id">
                    <p class="desc">Додайте показники цукристості сусла, його кількість та
                     спиртуозність <strong>спиртовмісного матеріалу</strong> (далі AМ)
                            , яким плануєте проводити стабілізацію</p>
                   <div class="mb-3">
                   <label for="S0" class="form-label">Початкова цукристість сусла <code> (S0)</code>, г/100см<sup>3</sup></label>
                <input type="number" class="form-control" id="S0" required value="0" min="15" max="35" step="0.5"' +
                ' placeholder="Початкова цукристість" oninput="resetResult()"></div>
                </div>`
            ].join('')
        } else {
            wortParameter.innerHTML = [
                `<div id="parameter_id">
                  <p class="desc">Додайте показники густини сусла, його кількість та
                     спиртуозність <strong>спиртовмісного матеріалу</strong> (далі AМ)
                            , яким плануєте проводити стабілізацію</p>
                  <div class="mb-3">
                  <label for="S0" class="form-label">Початкова густина сусла <code> (D0)</code>, г/л.</label>
                <input type="number" class="form-control" id="S0" required value="0" min="1000" max="1200" step="5"' +
                ' placeholder="Початкова густина" oninput="resetResult()"></div>
                </div>`
            ].join('')
        }

        let sugarWineStart = document.getElementById('S0');
        sugarWineStart.addEventListener("input", () => {
            resetResult();
            addEventForInput(sugarWineStart);
        });
        resetResultBox();
        unitOfSugar = bool;
        renderHistory();
    }
}

function changeCalculationSystem() {
    if (!isSimplifiedCalculationSystem) {

    } else {
        const alcoholBlendSugar = document.getElementById('alcoholBlendSugar_id');
        if (alcoholBlendSugar) {
            alcoholBlendSugar.remove();
        }
    }
}

function expandAccordion() {
    const accordionCollapse = document.getElementById('accordionId');
    const accordionElems = accordionCollapse.querySelectorAll('.accordion-collapse');
    const accordionButtons = accordionCollapse.querySelectorAll('button');
    if (accordionCollapse && accordionElems && accordionButtons) {
        if (collapsed) {
            accordionElems.forEach(el => {
                el.classList.add('show')
            })
            accordionButtons.forEach(btn => {
                btn.classList.remove('collapsed');
                btn.setAttribute('aria-expanded', 'true');
            });
        } else {
            accordionElems.forEach(el => {
                el.classList.remove('show')
            })
            accordionButtons.forEach(btn => {
                btn.classList.add('collapsed');
                btn.setAttribute('aria-expanded', 'false');
            });
        }
        collapsed = !collapsed;
    }
}

// Динамический пересчёт и подсветка при вводе любого поля
document.querySelectorAll("#calcForm input").forEach(input => {
    input.addEventListener("input", () => {
        resetResult();
        addEventForInput(input);
    });
});

function addEventForInput(input) {
    validationInput(input);
    // Шаг 1: пересчёт CU
    if (input.id === "alcoholTarget" || input.id === "sugarTarget") {
        calculateCU();
    }

    // Шаг 3: автоматический пересчёт
    let allInputs = Array.from(document.querySelectorAll("#calcForm input"));
    if (allInputs.every(i => i.value !== "" && parseFloat(i.value) >= 0 && !isNaN(parseFloat(i.value)))) {
        calcResult();
    }
}

function validationInput(input) {
    let val = parseFloat(input.value);
    if (input.value === "" || val <= 0 || isNaN(val)) {
        if (input.id !== "Ss") {
            input.classList.add("is-invalid");
            input.classList.remove("is-valid");
        } else {
            if (input.value === "" || val < 0 || isNaN(val)) {
                input.classList.add("is-invalid");
                input.classList.remove("is-valid");
            } else {
                input.classList.add("is-valid");
                input.classList.remove("is-invalid");
            }
        }
    } else {
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
    }
}

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
