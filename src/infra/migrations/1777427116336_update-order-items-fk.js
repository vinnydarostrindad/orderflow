export const up = (pgm) => {
  pgm.dropIndex("order_items", "table_id");
  pgm.dropConstraint("order_items", "order_items_table_id_fkey");

  pgm.renameColumn("order_items", "table_id", "table_session_id");
  pgm.alterColumn("order_items", "table_session_id", {
    type: "uuid",
    notNull: true,
    onDelete: "cascade",
  });

  pgm.addConstraint("order_items", "order_item_table_session_id_fkey", {
    foreignKey: {
      columns: "table_session_id",
      references: "table_sessions(id)",
      onDelete: "cascade",
    },
  });
  pgm.createIndex("order_items", "table_session_id");
};

export const down = false;
