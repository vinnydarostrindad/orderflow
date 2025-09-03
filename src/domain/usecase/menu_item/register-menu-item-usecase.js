import MenuItem from "../../entities/menu-item.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

export default class RegisterMenuItemUseCase {
  constructor({ idGenerator, menuItemRepository, supabaseAdapter } = {}) {
    this.idGenerator = idGenerator;
    this.menuItemRepository = menuItemRepository;
    this.supabaseAdapter = supabaseAdapter;
  }

  async execute({ menuId, name, price, imgFile, description, type } = {}) {
    if (!name) throw new MissingParamError("name");
    if (!price) throw new MissingParamError("price");
    if (!menuId) throw new MissingParamError("menuId");

    let fileName;
    if (imgFile?.fileName && imgFile?.content) {
      const timestamp = Date.now();
      const bucket = "menu-items-img";
      fileName = `${timestamp}_${imgFile?.fileName}`;
      await this.supabaseAdapter.uploadFile(bucket, fileName, imgFile);
    }

    const id = this.idGenerator.execute();

    const menuItem = new MenuItem({
      id,
      menuId,
      name,
      price,
      imagePath: fileName,
      description,
      type,
    });

    const createdMenuItem = await this.menuItemRepository.create(menuItem);

    return createdMenuItem;
  }
}
