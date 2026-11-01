import { won } from "./util.js";

export function quoteShipping(merchandise, postalCode, settings) {
  const digits = String(postalCode ?? "").replace(/\D/g, "");
  const base = merchandise >= settings.freeShippingThreshold ? 0 : settings.baseShippingFee;
  const isRemote =
    digits.length === 5 && settings.remotePrefixes.some((prefix) => digits.startsWith(prefix));
  const remote = isRemote ? settings.remoteSurcharge : 0;
  return { base, remote, fee: base + remote, isRemote };
}

export function shippingDetail(quote) {
  if (quote.base === 0 && quote.remote === 0) {
    return "무료배송 기준 이상이라 기본 배송비는 없습니다.";
  }
  const parts = [];
  parts.push(quote.base > 0 ? `기본 배송비 ${won(quote.base)}` : "기본 배송비 없음");
  if (quote.remote > 0) parts.push(`도서산간 추가 ${won(quote.remote)}`);
  return parts.join(", ");
}

export function cartShippingNote(merchandise, settings) {
  const quote = quoteShipping(merchandise, "", settings);
  const remoteNote = "도서산간 추가 배송비는 주소를 확인하는 주문서에서 확정됩니다.";
  if (quote.base === 0) {
    return `주문 금액이 ${won(settings.freeShippingThreshold)} 이상이라 기본 배송비는 없습니다. ${remoteNote}`;
  }
  return `기본 배송비 ${won(quote.base)}. ${won(settings.freeShippingThreshold)} 이상이면 기본 배송비는 없습니다. ${remoteNote}`;
}
