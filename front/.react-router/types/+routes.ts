// Generated by React Router

import "react-router"

declare module "react-router" {
  interface Register {
    pages: Pages
    routeFiles: RouteFiles
  }
}

type Pages = {
  "/": {
    params: {};
  };
  "/dashboard": {
    params: {};
  };
  "/clientes/:id": {
    params: {
      "id": string;
    };
  };
  "/creditos/:id": {
    params: {
      "id": string;
    };
  };
  "/*": {
    params: {
      "*": string;
    };
  };
};

type RouteFiles = {
  "root.tsx": {
    id: "root";
    page: "/" | "/dashboard" | "/clientes/:id" | "/creditos/:id" | "/*";
  };
  "./routes/login.tsx": {
    id: "routes/login";
    page: "/";
  };
  "./routes/dashboard.tsx": {
    id: "routes/dashboard";
    page: "/dashboard";
  };
  "./routes/cliente-detalle.tsx": {
    id: "routes/cliente-detalle";
    page: "/clientes/:id";
  };
  "./routes/credito-detalle.tsx": {
    id: "routes/credito-detalle";
    page: "/creditos/:id";
  };
  "./routes/404.tsx": {
    id: "routes/404";
    page: "/*";
  };
};