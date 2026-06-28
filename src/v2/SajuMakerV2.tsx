import { useState } from "react";
import { MainMenu, type MenuKey } from "./components/MainMenu";
import InputForm from "./components/InputForm";
import ResultView from "./components/ResultView";

type SajuFormData = {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: string;
  calendarType: string;
};

export function SajuMakerV2() {
  const [activeMenu, setActiveMenu] = useState<MenuKey>("basic");
  const [formData, setFormData] = useState<SajuFormData | null>(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #1e1b4b 0, #0f172a 38%, #020617 100%)",
        color: "#fff",
        padding: "28px 16px",
      }}
    >
      <main style={{ maxWidth: "560px", margin: "0 auto" }}>
        <section
          style={{
            padding: "22px",
            border: "1px solid #334155",
            borderRadius: "28px",
            background:
              "linear-gradient(180deg, rgba(15,23,42,0.96), rgba(2,6,23,0.98))",
            boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
          }}
        >
          <header style={{ textAlign: "center", marginBottom: "26px" }}>
            <p
              style={{
                margin: "0 0 8px",
                color: "#f9a8d4",
                fontWeight: 800,
                letterSpacing: "0.08em",
              }}
            >
              REAL SAJU CONSULTING
            </p>
            <h1 style={{ margin: "0 0 10px", fontSize: "30px" }}>
              천운문 v2
            </h1>
            <p style={{ margin: 0, color: "#cbd5e1", lineHeight: "1.7" }}>
              사주를 쉽게 풀어주는 현실 상담
            </p>
          </header>

          {!formData ? (
            <section
              style={{
                padding: "24px",
                border: "1px solid #334155",
                borderRadius: "22px",
                background: "rgba(15, 23, 42, 0.74)",
              }}
            >
              <h2 style={{ margin: "0 0 8px", fontSize: "23px" }}>
                사주 정보 입력
              </h2>
              <p style={{ margin: "0 0 18px", color: "#cbd5e1" }}>
                이름과 생년월일을 입력하면 상담이 시작됩니다.
              </p>
              <InputForm onSubmit={setFormData} />
            </section>
          ) : (
            <>
              <section
                style={{
                  padding: "22px",
                  border: "1px solid #334155",
                  borderRadius: "22px",
                  background: "rgba(15, 23, 42, 0.74)",
                  marginBottom: "18px",
                }}
              >
                <h2 style={{ margin: "0 0 8px", fontSize: "23px" }}>
                  {formData.name}님의 상담이 준비되었습니다.
                </h2>
                <p style={{ margin: 0, color: "#cbd5e1", lineHeight: "1.7" }}>
                  기본 상담부터 확인한 뒤, 필요하면 AI 종합상담과 심층상담으로 이어가세요.
                </p>
              </section>

              <MainMenu activeMenu={activeMenu} onChangeMenu={setActiveMenu} />

              <section
                style={{
                  marginTop: "18px",
                  padding: "24px",
                  border: "1px solid #334155",
                  borderRadius: "22px",
                  background: "rgba(2, 6, 23, 0.76)",
                }}
              >
                <ResultView
                  name={formData.name}
                  birthDate={formData.birthDate}
                  birthTime={formData.birthTime}
                  gender={formData.gender}
                  calendarType={formData.calendarType}
                  selectedMenu={activeMenu}
                />
              </section>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
