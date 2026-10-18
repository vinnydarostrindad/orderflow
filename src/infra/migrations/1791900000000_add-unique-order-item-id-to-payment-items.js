export const up = (pgm) => {
  pgm.addConstraint("payment_items", "unique_payment_items_order_item_id", {
    unique: "order_item_id",
  });
};

export const down = false;
