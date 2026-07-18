-- Tabela de permissão por ferramenta (Workspace auth / Better Auth + Neon).
-- user_id é text para casar com o id do Better Auth. Sem RLS (acesso só server-side).
create table if not exists tool_permissions (
  user_id    text not null references "user"(id) on delete cascade,
  tool_slug  text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, tool_slug)
);
create index if not exists tool_permissions_user_id_idx on tool_permissions (user_id);
