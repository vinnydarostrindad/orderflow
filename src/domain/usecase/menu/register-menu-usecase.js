import Menu from "../../entities/menu.js";
import DependencyError from "../../../utils/errors/dependency-error.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import RepositoryError from "../../../utils/errors/repository-error.js";

export default class RegisterMenuUseCase {
  constructor({ idGenerator, menuRepository } = {}) {
    this.idGenerator = idGenerator;
    this.menuRepository = menuRepository;
  }

  async execute({ name, business_id } = {}) {
    // Talvez isso não precise ser verificado, pois Menu() também faz isso
    // Dar uma observada nisso depois
    if (!name) {
      throw new MissingParamError("name");
    }
    if (!business_id) {
      throw new MissingParamError("business_id");
    }

    const id = this.idGenerator.execute();
    if (!id) {
      // Fazer um erro mais específico depois
      throw new DependencyError("idGenerator");
    }

    const menu = new Menu({
      id,
      business_id,
      name,
    });

    const result = await this.menuRepository.create(menu);
    if (!result) {
      // Fazer um erro mais específico depois
      throw new RepositoryError("menu");
    }
    return result;
  }
}
