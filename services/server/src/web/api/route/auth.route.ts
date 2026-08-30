import { Router } from "express";
import {
  login,
  register,
  logout,
  forgotPassword,
  resetPassword,
} from "../controller/auth.controller";
import { requireAuth } from "../middleware/auth";

export function useAuthRoute(logger: Logger) {
  const router = Router();

  router.post("/login", login);
  router.post("/register", register);
  router.post("/logout", requireAuth, logout);
  router.post("/forgot-password", forgotPassword);
  router.post("/reset-password", resetPassword);

  return router;
}


export default useAuthRoute;
