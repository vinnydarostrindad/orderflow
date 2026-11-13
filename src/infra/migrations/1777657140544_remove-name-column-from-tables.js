export const up = (pgm) => {
  pgm.dropColumn("tables", "name");
};

export const down = false;
