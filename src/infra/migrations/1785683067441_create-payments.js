export const up = (pgm) => {
  pgm.createTable("payments", {
    id: {
      type: "uuid",
      primaryKey: true,
    },

    table_session_id: {
      type: "uuid",
      references: "table_sessions(id)",
      onDelete: "cascade",
      notNull: true,
    },

    method: {
      type: "text",
      check: "method IN ('pix', 'debit', 'credit', 'money')",
      notNull: true,
    },

    amount: {
      type: "numeric(10, 2)",
      check: "amount > 0",
      notNull: true,
    },

    status: {
      type: "text",
      check: "status IN ('completed', 'cancelled')",
      notNull: true,
      default: "completed",
    },

    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },

    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },
  });

  pgm.createIndex("payments", ["table_session_id"], {
    name: "idx_payments_table_session_id",
  });
};

export const down = false;
