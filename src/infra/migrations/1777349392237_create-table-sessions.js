export const up = (pgm) => {
  pgm.createTable("table_sessions", {
    id: {
      primaryKey: true,
      type: "uuid",
    },
    table_id: {
      type: "uuid",
      references: "tables(id)",
      onDelete: "cascade",
      notNull: true,
    },
    name: {
      type: "text",
    },
    status: {
      type: "text",
      check: "status IN ('open', 'closed', 'cancelled')",
      notNull: true,
      default: "open",
    },
    opened_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },
    closed_at: {
      type: "timestamptz",
    },
  });

  pgm.createIndex("table_sessions", ["table_id"], {
    name: "unique_open_session_per_table",
    unique: true,
    where: "status = 'open'",
  });
};

export const down = false;
