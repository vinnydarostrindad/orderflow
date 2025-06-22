export const up = function up(pgm) {
  pgm.createTable(
    "orders",
    {
      id: {
        type: "uuid",
        primaryKey: true,
      },

      business_id: {
        type: "uuid",
        notNull: true,
        references: "businesses(id)",
        onDelete: "cascade",
      },

      table_id: {
        type: "uuid",
        notNull: true,
        references: "tables(id)",
        onDelete: "cascade",
      },

      table_number: {
        type: "smallint",
        notNull: true,
      },

      status: {
        type: "text",
        check:
          "status IN ('pending', 'in_progress', 'ready', 'delivered', 'cancelled')",
        notNull: true,
        default: "pending",
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
    },
    {
      constraints: {
        unique: ["business_id", "table_number"],
      },
    },
  );
};

export const down = false;
