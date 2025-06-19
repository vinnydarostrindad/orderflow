import MenuItem from "../../entities/menu-item.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

export default class RegisterMenuItemUseCase {
  constructor({ idGenerator, menuItemRepository } = {}) {
    this.idGenerator = idGenerator;
    this.menuItemRepository = menuItemRepository;
  }

  async execute({ menuId, name, price, imagePath, description, type } = {}) {
    // Talvez isso não precise ser verificado, pois MenuItem() também faz isso
    // Dar uma observada nisso depois
    if (!name) {
      throw new MissingParamError("name");
    }
    if (!price) {
      throw new MissingParamError("price");
    }
    if (!menuId) {
      throw new MissingParamError("menuId");
    }

    const id = this.idGenerator.execute();

    const menuItem = new MenuItem({
      id,
      menuId,
      name,
      price,
      imagePath,
      description,
      type,
    });

    const createdMenuItem = await this.menuItemRepository.create(menuItem);

    return createdMenuItem;
  }
}
