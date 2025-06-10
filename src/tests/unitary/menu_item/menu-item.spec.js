import MenuItem from "../../../domain/entities/menu-item.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

describe("MenuItem Entity", () => {
  test("Should throw if no props are provided", () => {
    // Fazer uma validação melhor
    expect(() => new MenuItem()).toThrow(new MissingParamError("id"));
  });

  test("Should throw if no id are provided", () => {
    const props = {
      menu_id: "any_menu_id",
      name: "any_name",
      price: "any_price",
      image_path: "any_img_path",
      description: "any_description",
      type: "any_type",
    };
    expect(() => new MenuItem(props)).toThrow(new MissingParamError("id"));
  });

  test("Should throw if no menu_id is provided", () => {
    const props = {
      id: "any_menu_item_id",
      name: "any_name",
      price: "any_price",
      image_path: "any_img_path",
      description: "any_description",
      type: "any_type",
    };
    expect(() => new MenuItem(props)).toThrow(new MissingParamError("menu_id"));
  });

  test("Should throw if no name is provided", () => {
    const props = {
      id: "any_menu_item_id",
      menu_id: "any_menu_id",
      price: "any_price",
      image_path: "any_img_path",
      description: "any_description",
      type: "any_type",
    };
    expect(() => new MenuItem(props)).toThrow(new MissingParamError("name"));
  });

  test("Should throw if no price is provided", () => {
    const props = {
      id: "any_menu_item_id",
      menu_id: "any_menu_id",
      name: "any_name",
      image_path: "any_img_path",
      description: "any_description",
      type: "any_type",
    };
    expect(() => new MenuItem(props)).toThrow(new MissingParamError("price"));
  });

  test("Should return MenuItem", () => {
    const props = {
      id: "any_menu_item_id",
      menu_id: "any_menu_id",
      name: "any_name",
      price: "any_price",
      image_path: "any_img_path",
      description: "any_description",
      type: "any_type",
    };

    const menu = new MenuItem(props);
    expect(menu).toEqual({
      id: "any_menu_item_id",
      menu_id: "any_menu_id",
      name: "any_name",
      price: "any_price",
      image_path: "any_img_path",
      description: "any_description",
      type: "any_type",
    });
  });
});
