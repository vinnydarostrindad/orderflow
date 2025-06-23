export const up = (pgm) => {
  pgm.createTable(
    "menu_items",
    {
      id: {
        type: "uuid",
        primaryKey: true,
      },

      menu_id: {
        type: "uuid",
        references: "menus(id)",
        notNull: true,
        onDelete: "cascade",
      },

      name: {
        type: "varchar(254)",
        notNull: true,
      },

      price: {
        type: "numeric(10, 2)",
        notNull: true,
      },

      image_path: {
        type: "text",
      },

      description: {
        type: "text",
      },

      type: {
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
    },
    {
      constraints: {
        unique: ["menu_id", "name"],
      },
    },
  );
};

export const down = false;
