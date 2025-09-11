export const up = (pgm) => {
  pgm.dropConstraint("orders", "orders_uniq_business_id_table_number");

  pgm.addConstraint("tables", "tables_business_id_number_key", {
    unique: ["business_id", "number"],
  });
};

export const down = false;
