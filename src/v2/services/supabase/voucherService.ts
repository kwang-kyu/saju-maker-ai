import { supabase } from "./supabaseClient";

export type VoucherCheckResult = {
  ok: boolean;
  message: string;
  remainingCount?: number;
  totalCount?: number;
};

export async function checkVoucherCode(code: string): Promise<VoucherCheckResult> {
  const cleanCode = code.trim().toUpperCase();

  if (!cleanCode) {
    return {
      ok: false,
      message: "이용권 번호를 입력해주세요.",
    };
  }

  const { data, error } = await supabase
    .from("voucher_codes")
    .select("code, total_count, used_count, expires_at, status")
    .eq("code", cleanCode)
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      message: error ? "Supabase 오류: " + error.message : "등록되지 않은 이용권입니다.",
    };
  }

  if (data.status !== "active") {
    return {
      ok: false,
      message: "비활성화된 이용권입니다.",
    };
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return {
      ok: false,
      message: "사용 기간이 만료된 이용권입니다.",
    };
  }

  const remainingCount = data.total_count - data.used_count;

  if (remainingCount <= 0) {
    return {
      ok: false,
      message: "사용 횟수를 모두 사용한 이용권입니다.",
    };
  }

  return {
    ok: true,
    message: "이용권 인증이 완료되었습니다.",
    remainingCount,
    totalCount: data.total_count,
  };
}

export async function useVoucherCode(code: string) {
  const cleanCode = code.trim().toUpperCase();

  if (!cleanCode) {
    return {
      ok: false,
      message: "이용권 번호가 없습니다.",
    };
  }

  if (cleanCode === "CHEON-ADMIN-9999") {
    await supabase.from("voucher_logs").insert({
      voucher_code: cleanCode,
      action: "admin_use",
      memo: "관리자 무제한권 사용",
    });

    return {
      ok: true,
      message: "관리자 이용권은 차감되지 않습니다.",
    };
  }

  const { data, error } = await supabase
    .from("voucher_codes")
    .select("code, total_count, used_count, status")
    .eq("code", cleanCode)
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      message: "이용권 정보를 찾을 수 없습니다.",
    };
  }

  const nextUsedCount = data.used_count + 1;

  if (data.status !== "active" || nextUsedCount > data.total_count) {
    return {
      ok: false,
      message: "사용 가능한 이용권이 아닙니다.",
    };
  }

  const { error: updateError } = await supabase
    .from("voucher_codes")
    .update({ used_count: nextUsedCount })
    .eq("code", cleanCode);

  if (updateError) {
    return {
      ok: false,
      message: "이용권 차감 오류: " + updateError.message,
    };
  }

  await supabase.from("voucher_logs").insert({
    voucher_code: cleanCode,
    action: "use",
    memo: "상담 리포트 생성",
  });

  return {
    ok: true,
    message: "이용권이 정상 차감되었습니다.",
    remainingCount: data.total_count - nextUsedCount,
    totalCount: data.total_count,
  };
}





