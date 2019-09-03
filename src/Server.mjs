import $express from "express";
import $fs from "fs";
import $jwt from "jsonwebtoken";
import $path from "path";

/**
 *
 * Web Server for TeqFW ("express" based).
 */
export default class TeqFw_Core_App_Server {
    constructor(spec) {
        /**
         * Application configuration object.
         *
         * @type {TeqFw_Core_App_Configurator}
         */
        const _config = spec.TeqFw_Core_App_Configurator$;
        /** @type TeqFw_Core_App_Registry_Module */
        const _reg_mods = spec.TeqFw_Core_App_Registry_Module$;
        /**
         * Registry for application realms.
         *
         * @type {TeqFw_Core_App_Registry_Server_Realm}
         * @const
         */
        const _reg_realms = spec.TeqFw_Core_App_Registry_Server_Realm$;
        /**
         * Registry for application routes.
         *
         * @type {TeqFw_Core_App_Registry_Server_Route}
         */
        const _reg_routes = spec.TeqFw_Core_App_Registry_Server_Route$;

        /**
         * Instance of "express" web server.
         *
         * @const
         */
        const _server = $express();

        /**
         * Initialization function to be called from {@link TeqFw_Core_App#run}.
         *
         * @return {Promise<void>}
         * @memberOf TeqFw_Core_App_Server.prototype
         */
        this.init = function () {

            function set_default_route() {
                _server.get("*", (req, res) => {
                    /* get available/default languages/realms */
                    const lang_avail = _config.get("lang/available");
                    const realm_avail = _reg_realms.getRealmsNames();
                    const realm_default = _reg_realms.getDefaultRealmName();

                    const url = req.url;
                    const parts = url.split("/");
                    parts.shift();  // remove first empty part ("/" - beginning of the URL)
                    let current_part = parts.shift(); // get first part of URL (lang?)
                    let lang = _config.get("lang/default"),
                        realm_name = realm_default,
                        route = "";
                    if (lang_avail.includes(current_part)) {
                        lang = current_part;
                        current_part = parts.shift();
                    } else if (current_part.length === 2) {
                        /* this part may be a language code, use default lang and skip the part */
                        current_part = parts.shift();
                    }
                    if (realm_avail.includes(current_part)) {
                        realm_name = current_part;
                        current_part = parts.shift();
                    }
                    if (current_part) {
                        route = current_part + "/" + parts.join("/");
                    }

                    // send realm's startup page for requested realm
                    const realm_data = _reg_realms.getRealmByName(realm_name);
                    const path_home_page = realm_data.path_to_home_page;
                    $fs.readFile(path_home_page, null, (err, data) => {
                        if (err) throw err;
                        res.send("" + data);
                    });
                });
            }

            function set_jwt() {
                // JWT Test route
                _server.post("/user/login", (req, res) => {
                    const {body} = req;
                    const {username} = body;
                    const {password} = body;

                    const user = {
                        name: "alex",
                        acl: ["role1", "role2"],
                        groups: ["group1", "group2"]
                    };

                    //checking to make sure the user entered the correct username/password combo
                    if (username === "alex" && password === "secret") {
                        //if user log in success, generate a JWT token for the user with a secret key
                        $jwt.sign({user}, "private_key", {expiresIn: "1h"}, (err, token) => {
                            if (err) {
                                console.log(err)
                            }
                            res.send(token);
                        });
                    } else {
                        console.log("ERROR: Could not log in");
                    }
                });


                //This is a protected route
                const check_token = (req, res, next) => {
                    const header = req.headers['authorization'];

                    if (typeof header !== 'undefined') {
                        const bearer = header.split(' ');
                        const token = bearer[1];

                        req.token = token;
                        next();
                    } else {
                        //If header is undefined return Forbidden (403)
                        res.sendStatus(403)
                    }
                };

                _server.get("/user/data", check_token, (req, res) => {
                    //verify the JWT token generated for the user
                    $jwt.verify(req.token, "private_key", (err, authorizedData) => {
                        if (err) {
                            //If error send Forbidden (403)
                            console.log("ERROR: Could not connect to the protected route");
                            res.sendStatus(403);
                        } else {
                            //If token is successfully verified, we can send the authorized data
                            res.json({
                                message: "Successful log in",
                                authorizedData
                            });
                            console.log("SUCCESS: Connected to protected route");
                        }
                    })
                });

            }

            /**
             * Setup static files for application's `./pub`.
             */
            function set_static_pub() {
                const path_root = _config.get("path/root");

                // application's `./pub/` folder
                const path_pub = $path.join(path_root, "pub");
                _server.use("/pub", $express.static(path_pub));

                // service worker is limited by loading address;
                // use mapping to prevent "Service-Worker-Allowed" HTTP header usage.
                const path_worker = $path.join(path_root, "node_modules", "teqfw-core-app", "pub", "service-worker.js");
                _server.use("/service-worker.js", $express.static(path_worker));

                // `manifest.json` & `favicon.ico`
                const path_manifest = $path.join(path_root, "pub", "manifest.json");
                _server.use("/manifest.json", $express.static(path_manifest));

                const path_favicon = $path.join(path_root, "pub", "favicon.ico");
                _server.use("/favicon.ico", $express.static(path_favicon));

                // map DI lib
                const path_di = $path.join(path_root, "node_modules", "@teqfw", "di", "src",);
                _server.use("/Container.mjs", $express.static($path.join(path_di, "Container.mjs")));
                _server.use("/Container/", $express.static($path.join(path_di, "Container")));
                _server.use("/Util.mjs", $express.static($path.join(path_di, "Util.mjs")));

                // map `./pub/` folders for modules
                const mods = _reg_mods.get();
                for (const one of mods) {
                    const name = one.name;
                    const path = one.path;
                    if (path && path.pub) {
                        const path_pub = path.pub;
                        const url = "/pub/" + name;
                        _server.use(url, $express.static(path_pub));
                    }
                }
            }

            function set_routes() {
                const all = _reg_routes.get();
                /** @type {TeqFw_Core_App_Registry_Server_Route.Entry} one */
                for (const one of all) {
                    const data = one[1];
                    const path = data.path;
                    const handler = data.handler;
                    if (path && handler) {
                        _server.all(path, handler.exec);
                    }
                }
            }

            /* This function actions. */
            return new Promise(function (resolve) {
                // setup order is important
                _server.use($express.json());
                set_static_pub();
                set_jwt();
                set_routes();
                set_default_route();
                resolve();
            });
        };

        /**
         * Run web server.
         *
         * @param {number} port
         * @param {Function} callable
         * @memberOf TeqFw_Core_App_Server.prototype
         */
        this.listen = (port, callable) => {
            _server.listen(port, callable);
        };
    }
}

