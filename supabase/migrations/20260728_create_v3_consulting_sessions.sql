begin;

create table if not exists public.v3_consulting_sessions (
  id text primary key,
  schema_version integer not null,
  updated_at text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  persisted_at timestamptz not null default now(),

  constraint v3_consulting_sessions_id_not_blank
    check (length(btrim(id)) > 0),

  constraint v3_consulting_sessions_updated_at_not_blank
    check (length(btrim(updated_at)) > 0),

  constraint v3_consulting_sessions_schema_version_positive
    check (schema_version > 0),

  constraint v3_consulting_sessions_payload_object
    check (jsonb_typeof(payload) = 'object'),

  constraint v3_consulting_sessions_payload_identity_matches
    check (
      payload ->> 'sessionId' = id
      and payload ->> 'updatedAt' = updated_at
    ),

  constraint v3_consulting_sessions_payload_schema_matches
    check (
      (payload ->> 'schemaVersion')::integer = schema_version
    )
);

comment on table public.v3_consulting_sessions is
  '천운문 v3 연속 상담 세션의 버전형 영속 저장소';

comment on column public.v3_consulting_sessions.updated_at is
  'ConsultingSession.updatedAt 원문. 낙관적 동시성 비교를 위해 text로 보존한다.';

comment on column public.v3_consulting_sessions.payload is
  'consultingSessionPersistenceRecord 직렬화 결과';

alter table public.v3_consulting_sessions
  enable row level security;

revoke all
  on table public.v3_consulting_sessions
  from anon, authenticated;

grant select, insert, update
  on table public.v3_consulting_sessions
  to service_role;

create index if not exists
  v3_consulting_sessions_persisted_at_index
  on public.v3_consulting_sessions (
    persisted_at desc
  );

commit;