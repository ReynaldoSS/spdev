import { spfi, SPFI, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import "@pnp/sp/site-users/web";
import "@pnp/sp/batching";
import { WebPartContext } from "@microsoft/sp-webpart-base";

let _sp: SPFI | null = null;
export const getSP = (context?: WebPartContext): SPFI => {
  if (_sp) {
    return _sp;
  }
  if (!context) {
    throw new Error("SPFx context is required for the initial PnPjs setup.");
  }
  console.log("context carregado no pnpjsConfig:", context);
  _sp = spfi().using(SPFx(context));
  console.log(_sp.web.toUrl());
  return _sp;
};