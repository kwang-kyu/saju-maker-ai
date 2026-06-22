type Props = {
    activeTab: string;
    result: string;
    moneyResult: string;
    jobResult: string;
    loveResult: string;
    healthResult: string;
    yearResult: string;
    daeunResult: string;
    aiResult: string;
    resultStyle: any;
  };
  
  export function TodayLuckContent({
    activeTab,
    result,
    moneyResult,
    jobResult,
    loveResult,
    healthResult,
    yearResult,
    daeunResult,
    aiResult,
    resultStyle,
  }: Props) {
    return (
      <div style={resultStyle}>
        {activeTab === "basic" && result}
        {activeTab === "money" && moneyResult}
        {activeTab === "job" && jobResult}
        {activeTab === "love" && loveResult}
        {activeTab === "health" && healthResult}
        {activeTab === "year" && yearResult}
        {activeTab === "daeun" && daeunResult}
        {activeTab === "ai" && aiResult}
      </div>
    );
  }