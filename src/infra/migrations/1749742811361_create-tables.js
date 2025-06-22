export const up = (pgm) => {
  pgm.createTable(
    "tables",
    {
      id: {
        type: "uuid",
        primaryKey: true,
      },

      business_id: {
        type: "uuid",
        references: "businesses(id)",
        notNull: true,
        onDelete: "cascade",
      },

      number: {
        type: "smallint",
        notNull: true,
        unique: true,
      },

      name: {
        type: "varchar(254)",
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
      constraint: {
        unique: ["business_id", "number"],
      },
    },
  );
};

export const down = false;
