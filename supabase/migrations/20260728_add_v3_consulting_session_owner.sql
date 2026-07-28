begin;

alter table public.v3_consulting_sessions
  add column if not exists owner_id uuid;

alter table public.v3_consulting_sessions
  drop constraint if exists
    v3_consulting_sessions_owner_id_fkey;

alter table public.v3_consulting_sessions
  add constraint v3_consulting_sessions_owner_id_fkey
  foreign key (owner_id)
  references auth.users (id)
  on delete cascade;

alter table public.v3_consulting_sessions
  alter column owner_id
  set not null;

comment on column public.v3_consulting_sessions.owner_id is
  'Supabase Auth 사용자 ID. 모든 세션 조회·갱신은 이 값으로 소유권을 확인한다.';

create index if not exists
  v3_consulting_sessions_owner_persisted_at_index
  on public.v3_consulting_sessions (
    owner_id,
    persisted_at desc
  );

commit;