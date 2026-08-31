import {
  useState,
  type FormEvent,
} from "react";

import {
  useV3ConsultingAuth,
} from "../hooks/useV3ConsultingAuth";
import type {
  V3ConsultingRequest,
} from "../consulting/v3ConsultingRequest";
import {
  createV3InitialConsultingSession,
} from "../services/v3ConsultingSessionApiClient";
import type {
  V3InitialConsultingSessionResponse,
} from "../services/v3ConsultingSessionApiClient";

import {
  V3ConsultingSessionConversation,
} from "./V3ConsultingSessionConversation";
import {
  normalizeHasActiveBusinessForRequest,
  resolveHasActiveBusinessOnOccupationChange,
  resolveNullableBooleanFromSelection,
  SEPARATE_BUSINESS_QUESTION_LABEL,
  shouldShowSeparateBusinessQuestion,
} from "./occupationBusinessInputResolver";
import {
  VNextEntryFlow,
} from "../vnext/entry/VNextEntryFlow";
import {
  isVNextEntryScreenPhase,
} from "../vnext/entry/vNextEntryState";
import {
  useVNextEntry,
} from "../vnext/entry/vNextEntryUIAdapter";
import {
  buildVNextConsultingRequestFromBirthProfile,
} from "../vnext/entry/vNextBirthInputAdapter";
import {
  VNextReportShell,
} from "../vnext/report/VNextReportShell";
import {
  useVNextReport,
} from "../vnext/report/vNextReportUIAdapter";
import "../vnext/entry/vNextEntry.css";
import {
  isVNextModeEnabled,
  useVNextConsulting,
} from "../vnext/ui/vNextConsultingUIAdapter";
import {
  VNextConsultingPanel,
} from "../vnext/ui/VNextConsultingPanel";
import {
  VNextConsultingShell,
} from "../vnext/ui/VNextConsultingShell";

import "./v3ConsultingApp.css";

  type Gender =
    V3ConsultingRequest[
      "sajuInput"
    ][
      "gender"
    ];

  type CalendarType =
    V3ConsultingRequest[
      "sajuInput"
    ][
      "calendarType"
    ];

  type MaritalStatus =
    NonNullable<
      V3ConsultingRequest[
        "humanLifeContextInput"
      ][
        "maritalStatus"
      ]
    >;

  type OccupationStatus =
    NonNullable<
      V3ConsultingRequest[
        "humanLifeContextInput"
      ][
        "occupationStatus"
      ]
    >;

  type FinancialResponsibility =
    NonNullable<
      V3ConsultingRequest[
        "humanLifeContextInput"
      ][
        "financialResponsibility"
      ]
    >;

  type BooleanSelection =
    | "unknown"
    | "yes"
    | "no";

    const V3_AUTH_CALLBACK_PATH =
  "/v3-auth-callback";

function buildV3AuthRedirectUrl():
  string {
  return new URL(
    V3_AUTH_CALLBACK_PATH,
    globalThis.location.origin,
  ).toString();
}

  function getTodayIsoDate():
    string {
    const now =
      new Date();

    const year =
      now.getFullYear();

    const month =
      String(
        now.getMonth() + 1,
      ).padStart(
        2,
        "0",
      );

    const day =
      String(
        now.getDate(),
      ).padStart(
        2,
        "0",
      );

    return `${year}-${month}-${day}`;
  }

  function readErrorMessage(
    error: unknown,
  ): string {
    if (
      error instanceof Error
      && error.message.trim()
    ) {
      return error.message;
    }

    return "천운문 v3 상담 요청을 처리하지 못했습니다.";
  }

  export function V3ConsultingApp() {
    const vNextMode = isVNextModeEnabled();
    const {
      state: vNextEntryState,
      startConsulting: startVNextConsulting,
      selectMode: selectVNextMode,
      completeBirthInput: completeVNextBirthInput,
      goBack: goBackVNextEntry,
    } = useVNextEntry();
    const showVNextEntryFlow = vNextMode
      && isVNextEntryScreenPhase(vNextEntryState.phase);
    const showVNextReportFlow = vNextMode
      && vNextEntryState.phase === "report"
      && vNextEntryState.birthProfile !== null;
    const showVNextConsultingFlow = vNextMode
      && vNextEntryState.phase === "consulting"
      && vNextEntryState.birthProfile !== null;
    const {
      accessToken,
      authenticated,
      loading:
        authLoading,
      error:
        authError,
      signInWithKakao,
      signOut,
    } = useV3ConsultingAuth();
    const {
      state: vNextState,
      loadingLabel: vNextLoadingLabel,
      isBusy: vNextIsBusy,
      isStreaming: vNextIsStreaming,
      submitQuestion: submitVNextQuestion,
      submitFollowUpQuestion: submitVNextFollowUpQuestion,
    } = useVNextConsulting({
      mockGateway: vNextMode,
    });
    const {
      state: vNextReportState,
      loadingLabel: vNextReportLoadingLabel,
      isBusy: vNextReportIsBusy,
      isStreaming: vNextReportIsStreaming,
      startReport: startVNextReport,
      setActiveSection: setVNextReportActiveSection,
    } = useVNextReport({
      mockGateway: vNextMode,
    });
    const [
      vNextFollowUpQuestion,
      setVNextFollowUpQuestion,
    ] = useState("");
    const [
      vNextFollowUpError,
      setVNextFollowUpError,
    ] = useState("");
    const [
      name,
      setName,
    ] = useState("");

    const [
      birthDate,
      setBirthDate,
    ] = useState("");

    const [
      birthTime,
      setBirthTime,
    ] = useState("");

    const [
      gender,
      setGender,
    ] = useState<Gender>(
      "male",
    );

    const [
      calendarType,
      setCalendarType,
    ] = useState<CalendarType>(
      "solar",
    );

    const [
      maritalStatus,
      setMaritalStatus,
    ] = useState<MaritalStatus>(
      "unknown",
    );

    const [
      hasChildren,
      setHasChildren,
    ] = useState<BooleanSelection>(
      "unknown",
    );

    const [
      occupationStatus,
      setOccupationStatus,
    ] = useState<OccupationStatus>(
      "unknown",
    );

    const [
      hasActiveBusiness,
      setHasActiveBusiness,
    ] = useState<BooleanSelection>(
      "unknown",
    );

    const [
      financialResponsibility,
      setFinancialResponsibility,
    ] = useState<FinancialResponsibility>(
      "unknown",
    );

    const [
      question,
      setQuestion,
    ] = useState("");

    const [
      initialSession,
      setInitialSession,
    ] = useState<V3InitialConsultingSessionResponse | null>(
      null,
    );

    const [
      errorMessage,
      setErrorMessage,
    ] = useState("");

    const [
      isSubmitting,
      setIsSubmitting,
    ] = useState(false);

    async function handleSubmit(
      event:
        FormEvent<HTMLFormElement>,
    ) {
      event.preventDefault();

      if (
        isSubmitting
        || authLoading
        || vNextIsBusy
        || vNextIsStreaming
      ) {
        return;
      }

      if (
        !authenticated
        || accessToken
        === null
      ) {
        setErrorMessage(
          "카카오 로그인 후 천운문 상담을 시작해 주세요.",
        );

        return;
      }

      setIsSubmitting(
        true,
      );

      setInitialSession(
        null,
      );

      setErrorMessage(
        "",
      );

      const request:
        V3ConsultingRequest = {
          sajuInput: {
            name:
              name.trim(),

            birthDate,

            birthTime,

            gender,

            calendarType,

            referenceDate:
              getTodayIsoDate(),

            luckStartMethod:
              "minuteBased",
          },

          humanLifeContextInput: {
            maritalStatus,

            hasChildren:
              resolveNullableBooleanFromSelection(
                hasChildren,
              ),

            occupationStatus,

            hasActiveBusiness:
              normalizeHasActiveBusinessForRequest(
                occupationStatus,
                hasActiveBusiness,
              ),

            financialResponsibility,
          },

          question:
            question.trim(),
        };

      if (vNextMode) {
        try {
          await submitVNextQuestion(
            request,
          );
        } catch (
          error
        ) {
          setErrorMessage(
            readErrorMessage(
              error,
            ),
          );
        } finally {
          setIsSubmitting(
            false,
          );
        }

        return;
      }

      try {
        const session =
          await createV3InitialConsultingSession({
            accessToken,

            request,
          });

          setInitialSession(
            session,
          );
      } catch (
        error
      ) {
        setErrorMessage(
          readErrorMessage(
            error,
          ),
        );
      } finally {
        setIsSubmitting(
          false,
        );
      }
    }

    function buildVNextConsultingRequest(
      questionText: string,
    ): V3ConsultingRequest {
      if (vNextEntryState.birthProfile) {
        return buildVNextConsultingRequestFromBirthProfile(
          vNextEntryState.birthProfile,
          questionText,
          getTodayIsoDate(),
          {
            maritalStatus,
            hasChildren: resolveNullableBooleanFromSelection(hasChildren),
            occupationStatus,
            hasActiveBusiness: normalizeHasActiveBusinessForRequest(
              occupationStatus,
              hasActiveBusiness,
            ),
            financialResponsibility,
          },
        );
      }

      return {
        sajuInput: {
          name: name.trim(),
          birthDate,
          birthTime,
          gender,
          calendarType,
          referenceDate: getTodayIsoDate(),
          luckStartMethod: "minuteBased",
        },
        humanLifeContextInput: {
          maritalStatus,
          hasChildren: resolveNullableBooleanFromSelection(hasChildren),
          occupationStatus,
          hasActiveBusiness: normalizeHasActiveBusinessForRequest(
            occupationStatus,
            hasActiveBusiness,
          ),
          financialResponsibility,
        },
        question: questionText,
      };
    }

    async function handleVNextFollowUpSubmit() {
      const normalizedFollowUp =
        vNextFollowUpQuestion.trim();

      if (
        normalizedFollowUp.length
        === 0
        || vNextIsBusy
        || vNextIsStreaming
        || !authenticated
      ) {
        return;
      }

      setVNextFollowUpError(
        "",
      );

      try {
        await submitVNextFollowUpQuestion(
          normalizedFollowUp,
          buildVNextConsultingRequest(
            normalizedFollowUp,
          ),
        );

        setVNextFollowUpQuestion(
          "",
        );
      } catch (
        error
      ) {
        setVNextFollowUpError(
          readErrorMessage(
            error,
          ),
        );
      }
    }

    if (showVNextEntryFlow) {
      return (
        <VNextEntryFlow
          phase={vNextEntryState.phase}
          selectedMode={vNextEntryState.selectedMode}
          onStartConsulting={startVNextConsulting}
          onSelectMode={selectVNextMode}
          onCompleteBirthInput={completeVNextBirthInput}
          onGoBack={goBackVNextEntry}
        />
      );
    }

    if (showVNextReportFlow && vNextEntryState.birthProfile) {
      return (
        <VNextReportShell
          birthProfile={vNextEntryState.birthProfile}
          authenticated={authenticated}
          authLoading={authLoading}
          authError={authError}
          onSignIn={() => {
            void signInWithKakao(
              buildV3AuthRedirectUrl(),
            )
              .catch(
                (error) => {
                  setErrorMessage(
                    readErrorMessage(
                      error,
                    ),
                  );
                },
              );
          }}
          onSignOut={() => {
            void signOut()
              .catch(
                (error) => {
                  setErrorMessage(
                    readErrorMessage(
                      error,
                    ),
                  );
                },
              );
          }}
          state={vNextReportState}
          loadingLabel={vNextReportLoadingLabel}
          isBusy={vNextReportIsBusy}
          isStreaming={vNextReportIsStreaming}
          startReport={startVNextReport}
          setActiveSection={setVNextReportActiveSection}
        />
      );
    }

    if (showVNextConsultingFlow && vNextEntryState.birthProfile) {
      return (
        <VNextConsultingShell
          birthProfile={vNextEntryState.birthProfile}
          authenticated={authenticated}
          authLoading={authLoading}
          authError={authError}
          onSignIn={() => {
            void signInWithKakao(
              buildV3AuthRedirectUrl(),
            )
              .catch(
                (error) => {
                  setErrorMessage(
                    readErrorMessage(
                      error,
                    ),
                  );
                },
              );
          }}
          onSignOut={() => {
            void signOut()
              .catch(
                (error) => {
                  setErrorMessage(
                    readErrorMessage(
                      error,
                    ),
                  );
                },
              );
          }}
          state={vNextState}
          loadingLabel={vNextLoadingLabel}
          isBusy={vNextIsBusy}
          isStreaming={vNextIsStreaming}
          submitQuestion={submitVNextQuestion}
          submitFollowUpQuestion={submitVNextFollowUpQuestion}
        />
      );
    }

    return (
      <div className="v3-consulting-app">
        <header className="v3-consulting-header">
          <div className="v3-consulting-header-inner">
            <p className="v3-consulting-eyebrow">
              Cheonunmun Consulting v3
            </p>

            <h1 className="v3-consulting-title">
              사람을 먼저 읽는 천운문 상담
            </h1>

            <div className="v3-consulting-auth">
              {authLoading ? (
                <p className="v3-consulting-help">
                  로그인 상태를 확인하고 있습니다.
                </p>
              ) : authenticated ? (
                <button
                  className="v3-consulting-auth-button"
                  type="button"
                  onClick={() => {
                    void signOut()
                      .catch(
                        (error) => {
                          setErrorMessage(
                            readErrorMessage(
                              error,
                            ),
                          );
                        },
                      );
                  }}
                >
                  로그아웃
                </button>
              ) : (
                <button
                  className="v3-consulting-auth-button"
                  type="button"
                  onClick={() => {
                    void signInWithKakao(
                      buildV3AuthRedirectUrl()
                    )
                      .catch(
                        (error) => {
                          setErrorMessage(
                            readErrorMessage(
                              error,
                            ),
                          );
                        },
                      );
                  }}
                >
                  카카오로 로그인
                </button>
              )}

              {authError ? (
                <p
                  className="v3-consulting-error"
                  role="alert"
                >
                  {readErrorMessage(
                    authError,
                  )}
                </p>
              ) : null}
            </div>

            <p className="v3-consulting-subtitle">
              생년월일시에서 사람의 구조와 현재 국면을 먼저
              읽은 뒤, 질문의 조건과 위험을 판단합니다.
              GPT는 엔진이 확정한 판단을 바꾸지 않고
              이해하기 쉽게 설명합니다.
            </p>

            {vNextMode ? (
              <p className="v3-consulting-help">
                vNext UI 연결 모드가 활성화되어 있습니다.
                (#v3?vnext=1)
              </p>
            ) : null}

            {showVNextConsultingFlow && vNextEntryState.birthProfile ? (
              <p className="v3-consulting-help">
                {vNextEntryState.birthProfile.displayName?.trim()
                  || "상담자"}님의 출생 정보가 준비되었습니다.
                질문을 입력해 주세요.
              </p>
            ) : null}
          </div>
        </header>

        <main className="v3-consulting-main">
          <div className="v3-consulting-grid">
            <section className="v3-consulting-panel">
              <form
                className="v3-consulting-form"
                onSubmit={handleSubmit}
              >
                {!showVNextConsultingFlow ? (
                <div className="v3-consulting-section">
                  <div className="v3-consulting-section-heading">
                    <span className="v3-consulting-section-number">
                      1
                    </span>

                    <h2 className="v3-consulting-section-title">
                      출생 원천 정보
                    </h2>

                    <p className="v3-consulting-section-description">
                      사주 계산과 사람의 구조를 읽는 데 필요한
                      원천 정보입니다.
                    </p>
                  </div>

                  <div className="v3-consulting-fields">
                    <div className="v3-consulting-field v3-consulting-field--full">
                      <label
                        className="v3-consulting-label"
                        htmlFor="v3-name"
                      >
                        이름
                      </label>

                      <input
                        id="v3-name"
                        className="v3-consulting-input"
                        type="text"
                        value={name}
                        onChange={(event) =>
                          setName(
                            event.target.value,
                          )
                        }
                        placeholder="상담받을 분의 이름"
                        autoComplete="name"
                        required
                      />
                    </div>

                    <div className="v3-consulting-field">
                      <label
                        className="v3-consulting-label"
                        htmlFor="v3-birth-date"
                      >
                        생년월일
                      </label>

                      <input
                        id="v3-birth-date"
                        className="v3-consulting-input"
                        type="date"
                        value={birthDate}
                        onChange={(event) =>
                          setBirthDate(
                            event.target.value,
                          )
                        }
                        max={getTodayIsoDate()}
                        required
                      />
                    </div>

                    <div className="v3-consulting-field">
                      <label
                        className="v3-consulting-label"
                        htmlFor="v3-birth-time"
                      >
                        출생시간
                      </label>

                      <input
                        id="v3-birth-time"
                        className="v3-consulting-input"
                        type="time"
                        value={birthTime}
                        onChange={(event) =>
                          setBirthTime(
                            event.target.value,
                          )
                        }
                        required
                      />

                      <p className="v3-consulting-help">
                        정확한 출생시간을 입력해 주세요.
                      </p>
                    </div>

                    <div className="v3-consulting-field">
                      <label
                        className="v3-consulting-label"
                        htmlFor="v3-gender"
                      >
                        성별
                      </label>

                      <select
                        id="v3-gender"
                        className="v3-consulting-select"
                        value={gender}
                        onChange={(event) =>
                          setGender(
                            event.target.value as Gender,
                          )
                        }
                      >
                        <option value="male">
                          남성
                        </option>

                        <option value="female">
                          여성
                        </option>
                      </select>
                    </div>

                    <div className="v3-consulting-field">
                      <label
                        className="v3-consulting-label"
                        htmlFor="v3-calendar-type"
                      >
                        달력 기준
                      </label>

                      <select
                        id="v3-calendar-type"
                        className="v3-consulting-select"
                        value={calendarType}
                        onChange={(event) =>
                          setCalendarType(
                            event.target.value as CalendarType,
                          )
                        }
                      >
                        <option value="solar">
                          양력
                        </option>

                        <option value="lunar">
                          음력
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
                ) : null}

                {!showVNextConsultingFlow ? (
                <div className="v3-consulting-section">
                  <div className="v3-consulting-section-heading">
                    <span className="v3-consulting-section-number">
                      2
                    </span>

                    <h2 className="v3-consulting-section-title">
                      현재 삶의 현실
                    </h2>

                    <p className="v3-consulting-section-description">
                      사주만으로 알 수 없는 현재 책임과 생활
                      조건을 판단에 반영합니다.
                    </p>
                  </div>

                  <div className="v3-consulting-fields">
                    <div className="v3-consulting-field">
                      <label
                        className="v3-consulting-label"
                        htmlFor="v3-marital-status"
                      >
                        혼인 상태
                      </label>

                      <select
                        id="v3-marital-status"
                        className="v3-consulting-select"
                        value={maritalStatus}
                        onChange={(event) =>
                          setMaritalStatus(
                            event.target.value as MaritalStatus,
                          )
                        }
                      >
                        <option value="unknown">
                          선택 안 함
                        </option>

                        <option value="single">
                          미혼
                        </option>

                        <option value="married">
                          기혼
                        </option>

                        <option value="divorced">
                          이혼
                        </option>

                        <option value="widowed">
                          사별
                        </option>
                      </select>
                    </div>

                    <div className="v3-consulting-field">
                      <label
                        className="v3-consulting-label"
                        htmlFor="v3-has-children"
                      >
                        자녀 여부
                      </label>

                      <select
                        id="v3-has-children"
                        className="v3-consulting-select"
                        value={hasChildren}
                        onChange={(event) =>
                          setHasChildren(
                            event.target.value as BooleanSelection,
                          )
                        }
                      >
                        <option value="unknown">
                          선택 안 함
                        </option>

                        <option value="yes">
                          있음
                        </option>

                        <option value="no">
                          없음
                        </option>
                      </select>
                    </div>

                    <div className="v3-consulting-field">
                      <label
                        className="v3-consulting-label"
                        htmlFor="v3-occupation-status"
                      >
                        현재 주된 활동
                      </label>

                      <select
                        id="v3-occupation-status"
                        className="v3-consulting-select"
                        value={occupationStatus}
                        onChange={(event) => {
                          const nextOccupationStatus =
                            event.target.value as OccupationStatus;

                          setOccupationStatus(
                            nextOccupationStatus,
                          );

                          setHasActiveBusiness(
                            resolveHasActiveBusinessOnOccupationChange(
                              nextOccupationStatus,
                              occupationStatus,
                              hasActiveBusiness,
                            ),
                          );
                        }}
                      >
                        <option value="unknown">
                          선택 안 함
                        </option>

                        <option value="student">
                          학생
                        </option>

                        <option value="employed">
                          직장인
                        </option>

                        <option value="selfEmployed">
                          자영업자
                        </option>

                        <option value="businessOwner">
                          사업자
                        </option>

                        <option value="unemployed">
                          구직·무직
                        </option>

                        <option value="retired">
                          은퇴
                        </option>
                      </select>
                    </div>

                    {shouldShowSeparateBusinessQuestion(
                      occupationStatus,
                    ) ? (
                      <div className="v3-consulting-field">
                        <label
                          className="v3-consulting-label"
                          htmlFor="v3-active-business"
                        >
                          {SEPARATE_BUSINESS_QUESTION_LABEL}
                        </label>

                        <select
                          id="v3-active-business"
                          className="v3-consulting-select"
                          value={hasActiveBusiness}
                          onChange={(event) =>
                            setHasActiveBusiness(
                              event.target.value as BooleanSelection,
                            )
                          }
                        >
                          <option value="unknown">
                            선택 안 함
                          </option>

                          <option value="yes">
                            있음
                          </option>

                          <option value="no">
                            없음
                          </option>
                        </select>
                      </div>
                    ) : null}

                    <div className="v3-consulting-field v3-consulting-field--full">
                      <label
                        className="v3-consulting-label"
                        htmlFor="v3-financial-responsibility"
                      >
                        경제적 책임 수준
                      </label>

                      <select
                        id="v3-financial-responsibility"
                        className="v3-consulting-select"
                        value={financialResponsibility}
                        onChange={(event) =>
                          setFinancialResponsibility(
                            event.target.value as FinancialResponsibility,
                          )
                        }
                      >
                        <option value="unknown">
                          선택 안 함
                        </option>

                        <option value="low">
                          낮음
                        </option>

                        <option value="medium">
                          보통
                        </option>

                        <option value="high">
                          높음
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
                ) : null}

                <div className="v3-consulting-section">
                  <div className="v3-consulting-section-heading">
                    <span className="v3-consulting-section-number">
                      {showVNextConsultingFlow ? "1" : "3"}
                    </span>

                    <h2 className="v3-consulting-section-title">
                      지금 판단할 질문
                    </h2>

                    <p className="v3-consulting-section-description">
                      결정 대상, 시기, 자금이나 책임 조건을
                      구체적으로 적을수록 현실 판단이 분명해집니다.
                    </p>
                  </div>

                  <div className="v3-consulting-fields">
                    <div className="v3-consulting-field v3-consulting-field--full">
                      <label
                        className="v3-consulting-label"
                        htmlFor="v3-question"
                      >
                        상담 질문
                      </label>

                      <textarea
                        id="v3-question"
                        className="v3-consulting-textarea"
                        value={question}
                        onChange={(event) =>
                          setQuestion(
                            event.target.value,
                          )
                        }
                        placeholder="예: 대출 부담이 있고 생활비를 유지해야 하는데, 올해 상가를 매수해도 될까요?"
                        required
                      />

                      <p className="v3-consulting-help">
                        단순한 운세 질문보다 실제로 결정해야 하는
                        행동과 현실 조건을 함께 적어 주세요.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  className="v3-consulting-submit"
                  type="submit"
                  disabled={
                    isSubmitting
                    || vNextIsBusy
                    || vNextIsStreaming
                    || authLoading
                    || !authenticated
                  }
                >
                  {isSubmitting
                  || vNextIsBusy
                  || vNextIsStreaming
                    ? vNextLoadingLabel
                      ?? "사람의 구조와 질문을 읽는 중입니다"
                    : authLoading
                      ? "로그인 상태 확인 중"
                      : authenticated
                        ? vNextMode
                          ? "vNext 상담 시작"
                          : "천운문 v3 상담 시작"
                        : "카카오 로그인 후 상담 가능"}
                </button>
              </form>
            </section>

            <section className="v3-consulting-panel v3-consulting-result">
              <div className="v3-consulting-result-header">
                <p className="v3-consulting-result-kicker">
                  ENGINE DECISION EXPLANATION
                </p>

                <h2 className="v3-consulting-result-title">
                  상담 결과
                </h2>
              </div>

              <div className="v3-consulting-result-body">
                {vNextMode ? (
                  <VNextConsultingPanel
                    state={vNextState}
                    loadingLabel={vNextLoadingLabel}
                    isBusy={vNextIsBusy}
                    isStreaming={vNextIsStreaming}
                    followUpQuestion={vNextFollowUpQuestion}
                    onFollowUpQuestionChange={setVNextFollowUpQuestion}
                    onFollowUpSubmit={() => {
                      void handleVNextFollowUpSubmit();
                    }}
                    followUpErrorMessage={vNextFollowUpError}
                  />
                ) : null}

                {!vNextMode
                && isSubmitting ? (
                  <div className="v3-consulting-loading">
                    <div
                      className="v3-consulting-spinner"
                      aria-hidden="true"
                    />

                    <p className="v3-consulting-loading-title">
                      사람을 먼저 읽고 있습니다
                    </p>

                    <p className="v3-consulting-loading-description">
                      원국 계산부터 사람의 구조, 현재 국면,
                      질문 판단 순서로 분석합니다.
                    </p>
                  </div>
                ) : null}

                {!vNextMode
                && !isSubmitting
                && errorMessage ? (
                  <p
                    className="v3-consulting-error"
                    role="alert"
                  >
                    {errorMessage}
                  </p>
                ) : null}

{!vNextMode
                && !isSubmitting
                && !errorMessage
                && initialSession
                && accessToken ? (
                  <V3ConsultingSessionConversation
                    key={initialSession.sessionId}
                    accessToken={accessToken}
                    initialSession={initialSession}
                  />
                ) : null}

                {!vNextMode
                && !isSubmitting
                && !errorMessage
                && initialSession === null ? (
                  <div className="v3-consulting-empty">
                    <div className="v3-consulting-empty-inner">
                      <div
                        className="v3-consulting-empty-symbol"
                        aria-hidden="true"
                      >
                        天
                      </div>

                      <p className="v3-consulting-empty-title">
                        아직 상담을 시작하지 않았습니다
                      </p>

                      <p className="v3-consulting-empty-description">
                        왼쪽의 출생 정보와 현재 현실을 입력하고,
                        지금 결정해야 하는 질문을 적어 주세요.
                        엔진 판단이 완성되면 이곳에 설명됩니다.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </main>
      </div>
    );
  }
