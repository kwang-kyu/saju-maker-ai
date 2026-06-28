import { useState } from "react";

type InputFormProps = {
  onSubmit?: (formData: {
    name: string;
    birthDate: string;
    birthTime: string;
    gender: string;
    calendarType: string;
  }) => void;
};

const years = Array.from({ length: 91 }, (_, index) => String(1940 + index));
const months = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, "0")
);
const days = Array.from({ length: 31 }, (_, index) =>
  String(index + 1).padStart(2, "0")
);

const timeList = [
  { label: "자시 23:00~01:00", value: "23:00" },
  { label: "축시 01:00~03:00", value: "01:00" },
  { label: "인시 03:00~05:00", value: "03:00" },
  { label: "묘시 05:00~07:00", value: "05:00" },
  { label: "진시 07:00~09:00", value: "07:00" },
  { label: "사시 09:00~11:00", value: "09:00" },
  { label: "오시 11:00~13:00", value: "11:00" },
  { label: "미시 13:00~15:00", value: "13:00" },
  { label: "신시 15:00~17:00", value: "15:00" },
  { label: "유시 17:00~19:00", value: "17:00" },
  { label: "술시 19:00~21:00", value: "19:00" },
  { label: "해시 21:00~23:00", value: "21:00" },
];

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid #475569",
  background: "#020617",
  color: "#ffffff",
  fontSize: "15px",
  outline: "none",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  color: "#e2e8f0",
  fontWeight: 700,
  fontSize: "14px",
};

function InputForm({ onSubmit }: InputFormProps) {
  const [name, setName] = useState("");
  const [year, setYear] = useState("1962");
  const [month, setMonth] = useState("06");
  const [day, setDay] = useState("07");
  const [birthTime, setBirthTime] = useState("15:00");
  const [gender, setGender] = useState("male");
  const [calendarType, setCalendarType] = useState("solar");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTimeLabel =
    timeList.find((item) => item.value === birthTime)?.label ?? "";

  const handleSubmit = () => {
    if (!name || !year || !month || !day || !birthTime || !gender || !calendarType) {
      alert("이름, 생년월일, 출생시간, 성별을 모두 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);

    window.setTimeout(() => {
      onSubmit?.({
        name,
        birthDate: `${year}-${month}-${day}`,
        birthTime,
        gender,
        calendarType,
      });
    }, 450);
  };

  const buttonStyle = (active: boolean) => ({
    padding: "12px 10px",
    borderRadius: "12px",
    border: active ? "1px solid #f9a8d4" : "1px solid #475569",
    background: active
      ? "linear-gradient(135deg, #7c3aed, #ec4899)"
      : "#020617",
    color: "#ffffff",
    fontWeight: active ? 800 : 600,
    cursor: "pointer",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
  });

  return (
    <div style={{ opacity: isSubmitting ? 0.72 : 1, transition: "opacity 0.25s ease" }}>
      <div style={{ display: "grid", gap: "16px", marginBottom: "18px" }}>
        <div>
          <label style={labelStyle}>이름</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="예: 김광규"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>양력 / 음력</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <button type="button" style={buttonStyle(calendarType === "solar")} onClick={() => setCalendarType("solar")}>
              양력
            </button>
            <button type="button" style={buttonStyle(calendarType === "lunar")} onClick={() => setCalendarType("lunar")}>
              음력
            </button>
          </div>
        </div>

        <div>
          <label style={labelStyle}>생년월일</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            <select style={inputStyle} value={year} onChange={(event) => setYear(event.target.value)}>
              {years.map((item) => (
                <option key={item} value={item}>{item}년</option>
              ))}
            </select>
            <select style={inputStyle} value={month} onChange={(event) => setMonth(event.target.value)}>
              {months.map((item) => (
                <option key={item} value={item}>{Number(item)}월</option>
              ))}
            </select>
            <select style={inputStyle} value={day} onChange={(event) => setDay(event.target.value)}>
              {days.map((item) => (
                <option key={item} value={item}>{Number(item)}일</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>출생시간</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {timeList.map((item) => (
              <button
                key={item.value}
                type="button"
                style={buttonStyle(birthTime === item.value)}
                onClick={() => setBirthTime(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p style={{ margin: "10px 0 0", color: "#cbd5e1", fontSize: "13px" }}>
            현재 선택된 시간: {selectedTimeLabel}
          </p>
        </div>

        <div>
          <label style={labelStyle}>성별</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <button type="button" style={buttonStyle(gender === "male")} onClick={() => setGender("male")}>
              남성
            </button>
            <button type="button" style={buttonStyle(gender === "female")} onClick={() => setGender("female")}>
              여성
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        style={{
          width: "100%",
          padding: "16px 20px",
          borderRadius: "16px",
          border: "none",
          background: isSubmitting
            ? "linear-gradient(135deg, #334155, #64748b)"
            : "linear-gradient(135deg, #7c3aed, #ec4899)",
          color: "#ffffff",
          fontSize: "17px",
          fontWeight: 800,
          cursor: isSubmitting ? "wait" : "pointer",
          boxShadow: "0 16px 36px rgba(236, 72, 153, 0.28)",
          transition: "transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
        }}
      >
        {isSubmitting ? "🔮 사주 분석 중..." : "🔮 사주 분석하기"}
      </button>
    </div>
  );
}

export default InputForm;
