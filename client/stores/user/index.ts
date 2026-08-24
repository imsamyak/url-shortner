import { defineStore } from "pinia";
import type { User } from "~/types";
import type {
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "./dto";

export const useUserStore = defineStore("user", {
  state: () => ({
    profile: null as User | null,
    isInitialized: false,
  }),
  getters: {
    isLoggedIn: (state) => !!state.profile,
  },
  actions: {
    async load() {
      try {
        const fetcher = useRequestFetch();
        const res = await fetcher("/api/user/profile");
        this.profile = res.data.user;
        return { success: true };
      } catch (err: any) {
        return {
          success: false,
          message: err.data?.message || "Failed to fetch profile",
        };
      }
    },

    async update(name: string) {
      if (!this.isLoggedIn) {
        return {
          success: false,
          message: "You are not logged in",
        };
      }

      try {
        await $fetch("/api/user/profile", {
          method: "PUT",
          body: { name },
        });
        if (this.profile) {
          this.profile.name = name;
        }
        return { success: true };
      } catch (err: any) {
        return {
          success: false,
          message: err.data?.message || "Failed to update profile",
        };
      }
    },

    async login(params: LoginPayload) {
      if (this.isLoggedIn) {
        return {
          success: false,
          message: "You are already logged in",
        };
      }
      try {
        const res = await $fetch("/api/auth/login", {
          method: "POST",
          body: {
            email: params.email,
            password: params.password,
          },
        });
        this.profile = res.data.user;
        this.isInitialized = true;
        return {
          success: true,
          message: "Login successful",
        };
      } catch (err: any) {
        return {
          success: false,
          message: err.data?.message || "An unexpected error occurred",
        };
      }
    },

    async register(params: RegisterPayload) {
      if (this.isLoggedIn) {
        return {
          success: false,
          message: "You are already logged in",
        };
      }
      try {
        await $fetch("/api/auth/register", {
          method: "POST",
          body: {
            name: params.name,
            email: params.email,
            password: params.password,
          },
        });

        await this.load();
        this.isInitialized = true;
        return {
          success: true,
          message: "Registration successful",
        };
      } catch (err: any) {
        return {
          success: false,
          message: err.data?.message || "An unexpected error occurred",
        };
      }
    },

    async logout() {
      try {
        await $fetch("/api/auth/logout", {
          method: "POST",
        });
        this.profile = null;
        this.isInitialized = true;
        return {
          success: true,
          message: "Logged out successfully",
        };
      } catch (err: any) {
        return {
          success: false,
          message: err.data?.message || "An unexpected error occurred",
        };
      }
    },

    async forgotPassword(params: ForgotPasswordPayload) {
      if (this.isLoggedIn) {
        return {
          success: false,
          message: "You are already logged in",
        };
      }
      try {
        await $fetch("/api/auth/forgot", {
          method: "POST",
          body: {
            email: params.email,
          },
        });

        return {
          success: true,
          message: "Password reset email sent",
        };
      } catch (err: any) {
        return {
          success: false,
          message: err.data?.message || "An unexpected error occurred",
        };
      }
    },

    async resetPassword(params: ResetPasswordPayload) {
      if (this.isLoggedIn) {
        return {
          success: false,
          message: "You are already logged in",
        };
      }
      try {
        await $fetch("/api/auth/reset", {
          method: "POST",
          body: {
            token: params.token,
            newPassword: params.password,
          },
        });

        return {
          success: true,
          message: "Password has been reset",
        };
      } catch (err: any) {
        return {
          success: false,
          message: err.data?.message || "An unexpected error occurred",
        };
      }
    },
  },
});
