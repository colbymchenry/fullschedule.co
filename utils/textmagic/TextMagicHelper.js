import {instance} from "textmagic-client/src/ApiClient";
import TextMagicApi from "textmagic-client/src/api/TextMagicApi";
import {Settings} from "../../modals/Settings";

export default class TextMagicHelper {

    static async getInstance() {
        const settings = await Settings.getInstance();
        const client = instance;
        const auth = client.authentications['BasicAuth'];
        auth.username = settings.get("text_magic_user");
        auth.password = settings.get("text_magic_api_key");
        return new TextMagicApi();
    }

}