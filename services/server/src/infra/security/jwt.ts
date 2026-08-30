import JwtService, { JwtServiceConfig } from "@app/utils/jwt";
import { ConfigurationError } from "@app/error";
import config from "../../config";

function initJwt<T extends object>(jwtConfig: JwtServiceConfig) {
    try {
        return new JwtService<T>(jwtConfig);
    } catch (err: any) {
        throw new ConfigurationError({
            message: "JWT service initialization failure",
            options: { cause: err },
        });
    }
}

export const jwt = initJwt<AuthContext>(config.jwt);
export default jwt;
