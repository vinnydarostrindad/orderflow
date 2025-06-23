import MissingParamError from "../../../utils/errors/missing-param-error.js";

export default class GetMenuItemUseCase {
  constructor({ menuItemRepository } = {}) {
    this.menuItemRepository = menuItemRepository;
  }

  async execute(menuId, menuItemId) {
    if (!menuId) throw new MissingParamError("menuId");

    if (!menuItemId) {
      const menuItems = await this.menuItemRepository.findAll(menuId);

      return menuItems;
    }

    const menuItem = await this.menuItemRepository.findById(menuId, menuItemId);

    return menuItem;
  }
}
