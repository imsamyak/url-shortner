import { Router } from "express";
import {
  login,
  register,
  forgotPassword,
  resetPassword,
} from "../controller/auth.controller";

export default function useAuthRoute(logger: Logger) {
  const router = Router();

  router.post("/login", login);
  router.post("/register", register);
  router.post("/forgot-password", forgotPassword);
  router.post("/reset-password", resetPassword);

  return router;
}
