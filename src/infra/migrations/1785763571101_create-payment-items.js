export const up = (pgm) => {
  pgm.createTable("payment_items", {
    id: {
      type: "uuid",
      primaryKey: true,
    },

    payment_id: {
      type: "uuid",
      references: "payments(id)",
      onDelete: "cascade",
      notNull: true,
    },

    order_item_id: {
      type: "uuid",
      references: "order_items(id)",
      notNull: true,
    },

    quantity: {
      type: "smallint",
      notNull: true,
      check: "quantity > 0",
    },

    amount: {
      type: "numeric(10, 2)",
      notNull: true,
      check: "amount > 0",
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

  pgm.createIndex("payment_items", ["payment_id"], {
    name: "idx_payment_items_payment_id",
  });
};

export const down = false;
