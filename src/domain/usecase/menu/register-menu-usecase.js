import Menu from "../../entities/menu.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

export default class RegisterMenuUseCase {
  constructor({ idGenerator, menuRepository } = {}) {
    this.idGenerator = idGenerator;
    this.menuRepository = menuRepository;
  }

  async execute({ name, businessId } = {}) {
    // Talvez isso não precise ser verificado, pois Menu() também faz isso
    // Dar uma observada nisso depois
    if (!name) {
      throw new MissingParamError("name");
    }
    if (!businessId) {
      throw new MissingParamError("businessId");
    }

    const id = this.idGenerator.execute();

    const menu = new Menu({
      id,
      businessId,
      name,
    });

    const createdMenu = await this.menuRepository.create(menu);

    return createdMenu;
  }
}
