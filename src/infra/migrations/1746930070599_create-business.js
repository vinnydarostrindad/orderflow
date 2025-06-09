export const up = function up(pgm) {
  pgm.createTable("businesses", {
    id: {
      type: "uuid",
      primaryKey: true,
    },

    name: {
      type: "varchar(254)",
      unique: true,
      notNull: true,
    },

    email: {
      type: "varchar(254)",
      unique: true,
      notNull: true,
    },

    password: {
      type: "text",
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
  });
};

export const down = false;
