import MenuItem from "../../../domain/entities/menu-item.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

describe("MenuItem Entity", () => {
  test("Should throw if no props are provided", () => {
    expect(() => new MenuItem()).toThrow(new MissingParamError("id"));
  });

  test("Should throw if no id are provided", () => {
    const props = {
      menuId: "any_menu_id",
      name: "any_name",
      price: "any_price",
      imagePath: "any_img_path",
      description: "any_description",
      type: "any_type",
    };
    expect(() => new MenuItem(props)).toThrow(new MissingParamError("id"));
  });

  test("Should throw if no menuId is provided", () => {
    const props = {
      id: "any_menu_item_id",
      name: "any_name",
      price: "any_price",
      imagePath: "any_img_path",
      description: "any_description",
      type: "any_type",
    };
    expect(() => new MenuItem(props)).toThrow(new MissingParamError("menuId"));
  });

  test("Should throw if no name is provided", () => {
    const props = {
      id: "any_menu_item_id",
      menuId: "any_menu_id",
      price: "any_price",
      imagePath: "any_img_path",
      description: "any_description",
      type: "any_type",
    };
    expect(() => new MenuItem(props)).toThrow(new MissingParamError("name"));
  });

  test("Should throw if no price is provided", () => {
    const props = {
      id: "any_menu_item_id",
      menuId: "any_menu_id",
      name: "any_name",
      imagePath: "any_img_path",
      description: "any_description",
      type: "any_type",
    };
    expect(() => new MenuItem(props)).toThrow(new MissingParamError("price"));
  });

  test("Should return MenuItem", () => {
    const props = {
      id: "any_menu_item_id",
      menuId: "any_menu_id",
      name: "any_name",
      price: "any_price",
      imagePath: "any_img_path",
      description: "any_description",
      type: "any_type",
    };

    const menu = new MenuItem(props);
    expect(menu).toEqual({
      id: "any_menu_item_id",
      menuId: "any_menu_id",
      name: "any_name",
      price: "any_price",
      imagePath: "any_img_path",
      description: "any_description",
      type: "any_type",
    });
  });
});
