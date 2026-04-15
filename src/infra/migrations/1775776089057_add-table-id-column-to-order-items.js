export const up = (pgm) => {
  pgm.addColumns("order_items", {
    table_id: {
      type: "uuid",
      notNull: true,
      references: "tables(id)",
      onDelete: "cascade",
    },
  });

  pgm.createIndex("order_items", "table_id");
};

export const down = false;
