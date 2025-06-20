// pagelogin.tsx
import { LoginForm } from "./components/login-form"
import { Quotes } from "./components/quotes"

export default function PageLogin() {
  return (
    <div className="flex h-screen w-full"> {/* w-full para ocupar el 100% */}
      <div className="w-1/2 flex items-center justify-center p-10">
        <LoginForm />
      </div>
      <div className="w-1/2 bg-primary flex items-center justify-center p-10 text-white">
        <Quotes />
      </div>
    </div>
  )
}