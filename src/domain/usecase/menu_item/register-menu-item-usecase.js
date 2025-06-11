import MenuItem from "../../entities/menu-item.js";
import DependencyError from "../../../utils/errors/dependency-error.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import RepositoryError from "../../../utils/errors/repository-error.js";

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
    if (!id) {
      // Fazer um erro mais específico depois
      throw new DependencyError("idGenerator");
    }

    const menuItem = new MenuItem({
      id,
      menuId,
      name,
      price,
      imagePath,
      description,
      type,
    });

    const result = await this.menuItemRepository.create(menuItem);
    if (!result) {
      // Fazer um erro mais específico depois
      throw new RepositoryError("menuItem");
    }
    return result;
  }
}
