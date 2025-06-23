import MissingParamError from "../../../utils/errors/missing-param-error.js";

export default class GetMenuUseCase {
  constructor({ menuRepository } = {}) {
    this.menuRepository = menuRepository;
  }

  async execute(businessId, menuId) {
    if (!businessId) throw new MissingParamError("businessId");

    if (!menuId) {
      const menus = await this.menuRepository.findAll(businessId);

      return menus;
    }

    const menu = await this.menuRepository.findById(businessId, menuId);

    return menu;
  }
}
