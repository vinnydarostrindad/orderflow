export default class GetMenuItemUseCase {
  constructor({ menuItemRepository } = {}) {
    this.menuItemRepository = menuItemRepository;
  }

  async execute({ menuId, menuItemId }) {
    if (!menuItemId) {
      const menuItems = await this.menuItemRepository.findAll(menuId);

      return menuItems;
    }

    const menuItem = await this.menuItemRepository.findById(menuItemId, menuId);

    return menuItem;
  }
}
