import MenuItem from "../../entities/menu-item.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import { writeFile } from "node:fs/promises";

export default class RegisterMenuItemUseCase {
  constructor({ idGenerator, menuItemRepository } = {}) {
    this.idGenerator = idGenerator;
    this.menuItemRepository = menuItemRepository;
  }

  async execute({ menuId, name, price, imgFile, description, type } = {}) {
    if (!name) throw new MissingParamError("name");
    if (!price) throw new MissingParamError("price");
    if (!menuId) throw new MissingParamError("menuId");

    let imagePath;
    if (imgFile?.fileName && imgFile?.content) {
      const timestamp = Date.now();
      imagePath = `assets/${timestamp}_${imgFile?.fileName}`;
      await writeFile(`./src/main/pages/${imagePath}`, imgFile?.content);
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
