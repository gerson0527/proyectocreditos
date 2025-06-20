import {
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  route("/", "./routes/login.tsx"),
  route("/dashboard", "./routes/dashboard.tsx"),
  route("/clientes/:id", "./routes/cliente-detalle.tsx"), // ✅ Agregar .tsx
  route("/creditos/:id", "./routes/credito-detalle.tsx"), // ✅ Cambiar a .jsx
  route("*", "./routes/404.tsx"),
] satisfies RouteConfig;