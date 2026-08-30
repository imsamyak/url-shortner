import { Request, Response } from "express";
import AuthService from "../../../core/service/auth.service";

// POST: /api/v1/auth/login
export const login = async (req: Request, res: Response) => {
  const logger = req.log;

  try {
    logger.debug("Login: START");

    const { email, password } = req.body;
    const authService = new AuthService(req.auth, logger);
    const data = await authService.login({ email, password });

    logger.debug("Login: SUCCESS");
    return res.status(200).json({ message: "Login successful", data });
  } catch (err) {
    logger.error(err, "Login: FAILED");
    throw err;
  }
};

// POST: /api/v1/auth/register
export const register = async (req: Request, res: Response) => {
  const logger = req.log;

  try {
    logger.debug("Register: START");

    const { email, password, name } = req.body;
    const authService = new AuthService(req.auth, logger);
    const data = await authService.register({ email, password, name });

    logger.debug("Register: SUCCESS");

    return res.status(201).json({ message: "Registration successful", data });
  } catch (err) {
    logger.error(err, "Register: FAILED");
    throw err;
  }
};

// POST: /api/v1/auth/logout
export const logout = async (req: Request, res: Response) => {
  const logger = req.log;

  try {
    logger.debug("Logout: START");

    const authService = new AuthService(req.auth, logger);
    await authService.logout();

    logger.debug("Logout: SUCCESS");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    logger.error(err, "Logout: FAILED");
    throw err;
  }
};

// POST: /api/v1/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response) => {
  const logger = req.log;

  try {
    logger.debug("ForgotPassword: START");

    const { email } = req.body;
    const authService = new AuthService(req.auth, logger);
    await authService.forgotPassword({ email });

    logger.debug("ForgotPassword: SUCCESS");
    return res.status(200).json({
      message: "Password reset link generated and sent to registered email",
    });
  } catch (err) {
    logger.error(err, "ForgotPassword: FAILED");
    throw err;
  }
};

// POST: /api/v1/auth/reset-password
export const resetPassword = async (req: Request, res: Response) => {
  const logger = req.log;

  try {
    logger.debug("ResetPassword: START");

    const { token, newPassword } = req.body;
    const authService = new AuthService(req.auth, logger);
    await authService.resetPassword({ token, newPassword });

    logger.debug("ResetPassword: SUCCESS");
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    logger.error(err, "ResetPassword: FAILED");
    throw err;
  }
};
