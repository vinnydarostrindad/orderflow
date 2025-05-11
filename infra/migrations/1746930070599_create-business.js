export const up = function up(pgm) {
  pgm.createTable("businesses", {
    id: {
      type: "uuid",
      unique: true,
      primaryKey: true,
      notNull: true,
    },

    name: {
      type: "varchar(254)",
      unique: true,
      notNull: true,
    },

    // Why 254 in length? https://stackoverflow.com/a/1199238
    email: {
      type: "varchar(254)",
      unique: true,
      notNull: true,
    },

    // Why 60 in length? https://www.npmjs.com/package/bcrypt#hash-info
    password: {
      type: "varchar(60)",
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
