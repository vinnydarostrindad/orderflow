export const up = function up(pgm) {
  pgm.createTable("employees", {
    id: {
      type: "uuid",
      primaryKey: true,
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
      type: "text",
      check: "role IN ('manager', 'cashier', 'cook', 'waiter')",
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
