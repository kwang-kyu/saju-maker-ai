export type ConsultingSessionPersistenceRow = {
    id:
      string;

    schemaVersion:
      number;

    updatedAt:
      string;

    payload:
      unknown;
  };

  export type InsertConsultingSessionPersistenceRowResult =
    | {
        status:
          "inserted";
      }
    | {
        status:
          "alreadyExists";

        existingUpdatedAt:
          string;
      };

  export type UpdateConsultingSessionPersistenceRowResult =
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

  export type UpdateConsultingSessionPersistenceRowInput = {
    row:
      ConsultingSessionPersistenceRow;

    expectedUpdatedAt:
      string;
  };

  /**
   * 세션 Repository와 실제 DB SDK 사이의 저장 Gateway 계약이다.
   *
   * 구현체는 insert 중복과 update 동시성 충돌을
   * 일반 예외로 숨기지 않고 명시적인 결과로 반환해야 한다.
   */
  export interface ConsultingSessionPersistenceGateway {
    findById(
      sessionId:
        string,
    ): Promise<ConsultingSessionPersistenceRow | null>;

    insert(
      row:
        ConsultingSessionPersistenceRow,
    ): Promise<InsertConsultingSessionPersistenceRowResult>;

    updateIfCurrent(
      input:
        UpdateConsultingSessionPersistenceRowInput,
    ): Promise<UpdateConsultingSessionPersistenceRowResult>;
  }
