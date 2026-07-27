import type {
    ConsultingSession,
  } from "./consultingSession";

  export type CreateConsultingSessionResult =
    | {
        status:
          "created";
      }
    | {
        status:
          "alreadyExists";

        existingUpdatedAt:
          string;
      };

  export type UpdateConsultingSessionResult =
    | {
        status:
          "updated";
      }
    | {
        status:
          "notFound";
      }
    | {
        status:
          "conflict";

        currentUpdatedAt:
          string;
      };

  export type UpdateConsultingSessionInput = {
    session:
      ConsultingSession;

    /**
     * 조회 당시 세션의 updatedAt이다.
     *
     * 저장소는 현재 저장된 updatedAt과 정확히 일치할 때만 갱신해야 한다.
     * 일치하지 않으면 다른 요청이 먼저 세션을 변경한 것이므로
     * conflict를 반환하여 턴 유실과 덮어쓰기를 막는다.
     */
    expectedUpdatedAt:
      string;
  };

  /**
   * 연속 상담 세션의 영속 저장소 계약이다.
   *
   * API나 상담 엔진은 Supabase 구현 세부사항을 알지 않으며,
   * 반드시 이 계약을 통해 세션을 조회·생성·갱신한다.
   */
  export interface ConsultingSessionRepository {
    findById(
      sessionId:
        string,
    ): Promise<ConsultingSession | null>;

    create(
      session:
        ConsultingSession,
    ): Promise<CreateConsultingSessionResult>;

    update(
      input:
        UpdateConsultingSessionInput,
    ): Promise<UpdateConsultingSessionResult>;
  }
