import { getSP } from "../../pnpjsConfig";

const LIST_NAME = "CRUDItems";

//READ
export const getItems = async () => {
    const sp = getSP();
    return await sp.web.lists.getByTitle(LIST_NAME).items.select("Id", "Title")();
}
//CREATE
export const createItem = async (title: string) => {
    const sp = getSP();
    return await sp.web.lists.getByTitle(LIST_NAME).items.add({
        Title: title
    });
}
//UPDATE
export const updateItem = async (id: number, title: string) => {
    const sp = getSP();
    return await sp.web.lists.getByTitle(LIST_NAME).items.getById(id).update({
        Title: title
    });
}
//DELETE
export const deleteItem = async (id: number) => {
    const sp = getSP();
    return await sp.web.lists.getByTitle(LIST_NAME).items.getById(id).delete();
}