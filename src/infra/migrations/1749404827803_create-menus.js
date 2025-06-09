export const up = (pgm) => {
  pgm.createTable(
    "menus",
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

      name: {
        type: "varchar(254)",
        notNull: true,
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
        unique: ["business_id", "name"],
      },
    },
  );
};

export const down = false;
