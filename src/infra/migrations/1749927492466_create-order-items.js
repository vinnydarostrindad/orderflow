export const up = (pgm) => {
  pgm.createTable("order_items", {
    id: {
      type: "uuid",
      primaryKey: true,
    },

    order_id: {
      type: "uuid",
      references: "orders(id)",
      notNull: true,
      onDelete: "cascade",
    },

    menu_item_id: {
      type: "uuid",
      references: "menu_items(id)",
      notNull: true,
      onDelete: "cascade",
    },

    quantity: {
      type: "smallint",
      notNull: true,
    },

    unit_price: {
      type: "numeric(10, 2)",
      notNull: true,
    },

    total_price: {
      type: "numeric(10, 2)",
      notNull: true,
    },

    status: {
      type: "text",
      check:
        "status IN ('pending', 'in_progress', 'ready', 'delivered', 'cancelled')",
      notNull: true,
      default: "pending",
    },

    notes: {
      type: "text",
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
