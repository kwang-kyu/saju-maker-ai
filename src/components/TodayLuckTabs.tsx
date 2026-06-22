type Props = {
    activeTab: string;
    setActiveTab: (tab: string) => void;
  
    tabWrapStyle: any;
    tabButtonStyle: any;
    activeTabStyle: any;
  };
  
  export function TodayLuckTabs({
    activeTab,
    setActiveTab,
    tabWrapStyle,
    tabButtonStyle,
    activeTabStyle,
  }: Props) {
    return (
      <div style={tabWrapStyle}>
        <button style={activeTab === "basic" ? activeTabStyle : tabButtonStyle} onClick={() => setActiveTab("basic")}>기본사주</button>
        <button style={activeTab === "ai" ? activeTabStyle : tabButtonStyle} onClick={() => setActiveTab("ai")}>AI종합상담</button>
        <button style={activeTab === "year" ? activeTabStyle : tabButtonStyle} onClick={() => setActiveTab("year")}>올해 운세</button>
        <button style={activeTab === "daeun" ? activeTabStyle : tabButtonStyle} onClick={() => setActiveTab("daeun")}>대운</button>
        <button style={activeTab === "money" ? activeTabStyle : tabButtonStyle} onClick={() => setActiveTab("money")}>오늘 재물 흐름</button>
        <button style={activeTab === "job" ? activeTabStyle : tabButtonStyle} onClick={() => setActiveTab("job")}>오늘일 활동운</button>
        <button style={activeTab === "love" ? activeTabStyle : tabButtonStyle} onClick={() => setActiveTab("love")}>오늘의 연애운</button>
        <button style={activeTab === "health" ? activeTabStyle : tabButtonStyle} onClick={() => setActiveTab("health")}>오늘의 건강운</button>
      </div>
    );
  }