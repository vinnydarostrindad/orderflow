export const up = function up(pgm) {
  pgm.createType("role", ["manager", "cashier", "cook", "waiter"]);

  pgm.createTable("employees", {
    id: {
      type: "uuid",
      unique: true,
      primaryKey: "true",
      notNull: "true",
    },
    business_id: {
      type: "uuid",
      notNull: true,
      reference: "bussinesses(id)",
      onDelete: "cascade",
    },
    name: {
      type: "varchar(254)",
      notNull: true,
    },
    role: {
      type: "role",
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
