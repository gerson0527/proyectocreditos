// Compare this snippet from sidebar.tsx:
import { Menu, Search, UserCheck, CreditCard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/sidebar/sidebar"
import { NotificationsPanel, type Notification } from "@/components/notifications-panel/notifications-panel"
import { ThemeToggle } from "@/components/theme-toggle/theme-toggle"
import { useState } from 'react'
import { SearchService, type SearchResult } from '@/services/search.service'
import { useNavigate } from 'react-router'

interface HeaderProps {
  activeSection: string
  onSectionChange: (section: string) => void
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onRemoveNotification: (id: string) => void
}

export function Header({
  activeSection,
  onSectionChange,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemoveNotification,
}: HeaderProps) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const navigate = useNavigate();


  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!value) {
      setResults([])
      return
    }
    try {
      const searchResults = await SearchService.search(value)
      setResults(searchResults)
    } catch (error) {
      console.error('Error en la búsqueda:', error)
    }
  }

  const handleSelect = (result: SearchResult) => {
    setResults([])
    if (result.type === 'cliente') {
      navigate(`/clientes/${result.id}`)
    } else {
      navigate(`/creditos/${result.id}`)
    }
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <Sidebar activeSection={activeSection} onSectionChange={onSectionChange} />
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1 relative">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar clientes, créditos..."
            className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
            onChange={handleSearch}
            onFocus={() => setIsSearching(true)}
            onBlur={() => setTimeout(() => setIsSearching(false), 200)}
          />
        </div>

        {isSearching && results.length > 0 && (
          <div className="absolute top-full mt-1 w-full md:w-2/3 lg:w-1/3 bg-background rounded-md border shadow-lg overflow-hidden z-50">
            {results.filter(result => result.type === 'cliente').length > 0 && (
              <div className="p-2">
                <div className="text-sm font-medium text-muted-foreground px-2 py-1">Clientes</div>
                {results
                  .filter(result => result.type === 'cliente')
                  .map(result => (
                    <div
                      key={result.id}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted cursor-pointer rounded-sm"
                      onClick={() => handleSelect(result)}
                    >
                      <UserCheck className="h-4 w-4" />
                      <div>
                        <div className="text-sm">{result.title}</div>
                        <div className="text-xs text-muted-foreground">{result.subtitle}</div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {results.filter(result => result.type === 'credito').length > 0 && (
              <div className="p-2 border-t">
                <div className="text-sm font-medium text-muted-foreground px-2 py-1">Créditos</div>
                {results
                  .filter(result => result.type === 'credito')
                  .map(result => (
                    <div
                      key={result.id}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted cursor-pointer rounded-sm"
                      onClick={() => handleSelect(result)}
                    >
                      <CreditCard className="h-4 w-4" />
                      <div>
                        <div className="text-sm">{result.title}</div>
                        <div className="text-xs text-muted-foreground">{result.subtitle}</div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {results.length === 0 && (
              <div className="p-4 text-sm text-center text-muted-foreground">
                No se encontraron resultados.
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NotificationsPanel
          notifications={notifications}
          onMarkAsRead={onMarkAsRead}
          onMarkAllAsRead={onMarkAllAsRead}
          onRemoveNotification={onRemoveNotification}
        />
      </div>
    </header>
  )
}

