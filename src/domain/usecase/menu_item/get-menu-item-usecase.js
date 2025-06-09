import MissingParamError from "../../../utils/errors/missing-param-error.js";

export default class GetMenuUseCase {
  constructor({ menuRepository } = {}) {
    this.menuRepository = menuRepository;
  }

  async execute(business_id, menu_id) {
    if (!business_id) {
      throw new MissingParamError("business_id");
    }

    if (!menu_id) {
      const menus = await this.menuRepository.findAll(business_id);
      if (!menus) {
        return null;
      }

      return menus;
    }

    const menu = await this.menuRepository.findById(business_id, menu_id);
    if (!menu) {
      return null;
    }
    return menu;
  }
}
