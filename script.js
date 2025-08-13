function calcDellCof() {
    resetResult();
    let sugar = Number(document.getElementById('sugar_id').value);
    let alcohol = Number(document.getElementById('alcohol_id').value);
    let result = document.getElementById('result_id');
    if (sugar > 0 && alcohol > 0 && result) {
        const res = sugar + (alcohol * 4.5)
        if (res >= 80) {
            result.textContent = 'Коєфіціент : ' + res.toFixed(2);
            result.style.color = "black";

        } else {
            result.textContent = 'Коєфіціент : ' + res.toFixed(2);
            result.style.color = "red";
        }
    } else {
        result.textContent = "Коєфіціент : не розраховано";
    }
}

function calcAlcohol() {
    let sugar = Number(document.getElementById('sugar_id').value);
    let alcohol = Number(document.getElementById('alcohol_id').value);

    let sugarVine = Number(document.getElementById('sugar-vine_id').value);
    let amountVine = Number(document.getElementById('amount-wine_id').value);
    let alcoholBlend = Number(document.getElementById('alcohol-blend_id').value);
    let total = document.getElementById('total_id');

    if (sugarVine > 0 && amountVine > 0 && alcoholBlend > 0 && sugar > 0 && alcohol > 0
        && (sugarVine > sugar) && (alcoholBlend > alcohol)  && total) {
        const result = ((alcohol - ((sugarVine - sugar) * 0.56)) / (alcoholBlend - alcohol)) * amountVine;
        if (result > 0) {
            total.textContent = 'Кількість спирту : ' + result.toFixed(3) + ' л.';
        } else {
            total.textContent = 'Кількість спирту : не розраховано';
        }
        let alert = document.getElementById('alert_id');
        if (alert) {
            alert.remove();
        }
    } else {
        const message = 'Деякі поля містять помилки. Перевірте значення та спробуйте знову!';
        const type = 'danger';
        addAlertPlaceholder(message, type);
    }
}

function resetAll() {
    const form = document.getElementById('form_id');
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.value = '0';
    });
    let total = document.getElementById('total_id');
    let result = document.getElementById('result_id');
    if (total && result) {
        total.textContent = 'Кількість спирту : не розраховано';
        result.textContent = 'Коєфіціент : не розраховано';
        total.style.color = "black";
        result.style.color = "black";
    }
    let alert = document.getElementById('alert_id');
    if (alert) {
        alert.remove();
    }
}

function addAlertPlaceholder(message, type) {
    let alert = document.getElementById('alert_id');
    if (alert) {
        return;
    }
    const alertPlaceholder = document.getElementById('liveAlertPlaceholder')
    const wrapper = document.createElement('div')
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert" id="alert_id">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
    ].join('')

    alertPlaceholder.append(wrapper);
}

function resetResult() {
    let total = document.getElementById('total_id');
    if (total) {
        total.textContent = 'Кількість спирту : не розраховано';
    }
}
