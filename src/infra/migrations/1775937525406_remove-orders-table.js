export const up = (pgm) => {
  pgm.dropColumns("order_items", ["order_id"]);

  pgm.dropTable("orders");
};

export const down = false;
