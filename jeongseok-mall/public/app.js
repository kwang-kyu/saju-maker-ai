function won(amount) {
  return `${Number(amount).toLocaleString("ko-KR")}원`;
}

const variant = document.querySelector("[data-variant-select]");
if (variant) {
  const price = document.querySelector("[data-price]");
  const stock = document.querySelector("[data-stock]");
  const qty = document.querySelector("#qty");
  const sync = () => {
    const option = variant.selectedOptions[0];
    if (!option || !option.value) {
      if (stock) stock.textContent = "";
      return;
    }
    if (price) price.textContent = won(option.dataset.price);
    if (stock) stock.textContent = `재고 ${option.dataset.stock}개`;
    if (qty) qty.max = option.dataset.stock || qty.max;
  };
  variant.addEventListener("change", sync);
}

const summary = document.querySelector("#summary");
if (summary) {
  const config = {
    threshold: Number(summary.dataset.threshold),
    base: Number(summary.dataset.base),
    remote: Number(summary.dataset.remote),
    prefixes: JSON.parse(summary.dataset.prefixes || "[]"),
    merch: Number(summary.dataset.merch),
  };
  const postal = document.querySelector("#postal_code");
  const expected = document.querySelector("[name=expected_total]");
  const fee = summary.querySelector("[data-fee]");
  const detail = summary.querySelector("[data-fee-detail]");
  const total = summary.querySelector("[data-total]");
  const button = document.querySelector(".checkout button.btn[type=submit]");

  const quote = (code) => {
    const digits = String(code || "").replace(/\D/g, "");
    const isRemote = digits.length === 5 && config.prefixes.some((prefix) => digits.startsWith(prefix));
    const base = config.merch >= config.threshold ? 0 : config.base;
    const remoteFee = isRemote ? config.remote : 0;
    return { base, remote: remoteFee, fee: base + remoteFee };
  };
  const detailText = (quoted) => {
    if (quoted.base === 0 && quoted.remote === 0) return "무료배송 기준 이상이라 기본 배송비는 없습니다.";
    const parts = [quoted.base > 0 ? `기본 배송비 ${won(quoted.base)}` : "기본 배송비 없음"];
    if (quoted.remote > 0) parts.push(`도서산간 추가 ${won(quoted.remote)}`);
    return parts.join(", ");
  };
  const render = () => {
    const choice = document.querySelector("[name=address_choice]:checked");
    const code = choice && choice.value !== "new" && choice.dataset.postal ? choice.dataset.postal : postal?.value;
    const quoted = quote(code);
    const amount = config.merch + quoted.fee;
    if (fee) fee.textContent = won(quoted.fee);
    if (detail) detail.textContent = detailText(quoted);
    if (total) total.textContent = won(amount);
    if (expected) expected.value = String(amount);
    if (button && !button.disabled) button.textContent = `${won(amount)} 결제하기`;
  };
  postal?.addEventListener("input", render);
  document.querySelectorAll("[name=address_choice]").forEach((input) => {
    input.addEventListener("change", render);
  });
}

document.querySelectorAll("form[data-confirm]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    if (!window.confirm(form.dataset.confirm)) event.preventDefault();
  });
});

document.querySelectorAll("form[data-once]").forEach((form) => {
  form.addEventListener("submit", () => {
    window.setTimeout(() => {
      form.querySelectorAll("button[type=submit]").forEach((button) => {
        button.disabled = true;
      });
    }, 0);
  });
});

const addVariant = document.querySelector("[data-add-variant]");
if (addVariant) {
  addVariant.addEventListener("click", () => {
    const box = document.querySelector("[data-variant-rows]");
    const rows = [...box.querySelectorAll(".variant-row")];
    if (rows.length >= 30) return;
    const row = rows[0].cloneNode(true);
    const index = rows.length;
    row.querySelectorAll("input").forEach((input) => {
      input.name = input.name.replace(/_\d+$/, `_${index}`);
      input.value = "";
    });
    box.appendChild(row);
  });
}
