export const up = (pgm) => {
  pgm.createTable("tables", {
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
  });
};

export const down = false;
