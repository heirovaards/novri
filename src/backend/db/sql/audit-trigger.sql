create or replace function audit_row() returns trigger language plpgsql as $$
declare
  v_actor  text  := nullif(current_setting('app.user_id', true), '');
  v_new    jsonb := case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end;
  v_old    jsonb := case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end;
  v_row    jsonb := coalesce(v_new, v_old);
  v_fk     text  := case when tg_nargs >= 1 then tg_argv[0] end;   -- parent fk column
  v_parent text  := case when tg_nargs >= 2 then tg_argv[1] end;   -- parent table name
begin
  insert into audit_log(at, actor_user_id, action, entity_type, entity_id,
                        parent_entity_type, parent_entity_id, prodi_id, before, after)
  values (now(), v_actor, lower(tg_op)::audit_action, tg_table_name, v_row->>'id',
          v_parent, case when v_fk is not null then v_row->>v_fk end,
          nullif(v_row->>'prodi_id','')::uuid, v_old, v_new);
  return coalesce(new, old);
end $$;
