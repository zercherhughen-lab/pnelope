import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useServices } from '../context/ServiceContext';
import { LayoutDashboard, BarChart3, KeyRound, Boxes, BookOpen, Settings, LogOut, Search, X, ChevronDown, ChevronRight, Layers, FolderKanban, Shield, Menu } from 'lucide-react';
import { VapeLogo } from './VapeLogo';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout } = useAuth();
  const { services, selectedServiceId, setSelectedServiceId, selectedService } = useServices();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Category collapse states
  const [openNavCategories, setOpenNavCategories] = useState<{ [key: string]: boolean }>({
    principal: true,
    gestion: true,
  });

  const toggleNavCategory = (catKey: string) => {
    setOpenNavCategories((prev) => ({ ...prev, [catKey]: !prev[catKey] }));
  };

  const navCategories = [
    {
      key: 'principal',
      title: 'Principal',
      icon: FolderKanban,
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, testid: 'nav-dashboard' },
        { to: '/stats', label: 'Estadísticas', icon: BarChart3, testid: 'nav-stats' },
      ],
    },
    {
      key: 'gestion',
      title: 'Servicios & Claves',
      icon: Shield,
      items: [
        { to: '/services', label: 'Services', icon: Boxes, testid: 'nav-services' },
        { to: '/licenses', label: 'Licenses', icon: KeyRound, testid: 'nav-licenses' },
      ],
    },
  ];

  const allItems = [
    ...navCategories.flatMap((c) => c.items),
    { to: '/docs', label: 'Documentation', icon: BookOpen, testid: 'nav-docs' },
    { to: '/settings', label: 'Settings', icon: Settings, testid: 'nav-settings' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const match = allItems.find(item => item.label.toLowerCase().includes(searchQuery.toLowerCase().trim()));
    if (match) {
      navigate(match.to);
      setMobileMenuOpen(false);
    } else {
      navigate('/services');
      setMobileMenuOpen(false);
    }
  };

  const renderSidebarContent = () => (
    <>
      <div className="px-3 pt-4 pb-3 flex items-center justify-between">
        <NavLink
          to="/dashboard"
          data-testid="brand-link"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center hover:bg-white/5 transition-colors duration-200 group rounded-lg p-1"
        >
          <VapeLogo height={22} className="ml-1 mt-0.5 group-hover:scale-105 transition-transform duration-200" />
        </NavLink>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-3 overflow-y-auto">
        {navCategories.map((cat) => {
          const filteredItems = searchQuery.trim()
            ? cat.items.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase().trim()))
            : cat.items;

          if (searchQuery.trim() && filteredItems.length === 0) return null;

          const isOpen = openNavCategories[cat.key];

          return (
            <div key={cat.key} className="space-y-1">
              {/* Category Header toggle */}
              <button
                type="button"
                onClick={() => toggleNavCategory(cat.key)}
                className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider hover:text-white transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  {cat.icon && <cat.icon className="w-3.5 h-3.5 text-zinc-200 shrink-0" />}
                  {cat.title}
                </span>
                {isOpen ? <ChevronDown className="w-3 h-3 text-zinc-500" /> : <ChevronRight className="w-3 h-3 text-zinc-500" />}
              </button>

              {/* Collapsible Items */}
              {isOpen && (
                <div className="space-y-0.5 pl-1">
                  {filteredItems.map(({ to, label, icon: Icon, testid }) => (
                    <NavLink
                      key={to}
                      to={to}
                      data-testid={testid}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-2.5 py-2 md:py-1.5 rounded-lg text-xs transition-all duration-200 ${
                          isActive
                            ? 'bg-white/10 text-white font-medium shadow-sm border border-white/10'
                            : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                        }`
                      }
                    >
                      <Icon className="w-3.5 h-3.5 text-white shrink-0" />
                      <span>{label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-1 shrink-0">
        {/* Settings Link at Bottom Left */}
        <NavLink
          to="/settings"
          data-testid="nav-settings"
          onClick={() => setMobileMenuOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-2.5 py-2 md:py-1.5 rounded-lg text-xs transition-all duration-200 ${
              isActive
                ? 'bg-white/10 text-white font-medium border border-white/10'
                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
            }`
          }
        >
          <Settings className="w-3.5 h-3.5 text-white shrink-0" />
          <span>Ajustes</span>
        </NavLink>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="relative pt-1">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-[calc(50%+2px)] -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0b0b0a] border border-white/10 focus:border-white/30 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-[calc(50%+2px)] -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </form>

        <button
          data-testid="logout-btn"
          onClick={() => {
            setMobileMenuOpen(false);
            logout();
            navigate('/');
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 md:py-1.5 rounded-lg text-xs text-zinc-400 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20 transition-all duration-200"
        >
          <LogOut className="w-3.5 h-3.5 text-white shrink-0" />
          <span>Salir</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#0b0b0a] text-zinc-100 font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-52 border-r border-white/10 flex-col shrink-0 bg-[#111110]">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111110] border-r border-white/10 flex flex-col transition-transform duration-300 md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderSidebarContent()}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0b0b0a]">
        {/* Top Header Bar with Service Dropdown Selector */}
        <header className="h-14 border-b border-white/10 bg-[#111110] px-3 sm:px-6 flex items-center justify-between shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Hamburger Button for Mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-zinc-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 border border-white/10 shrink-0"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium shrink-0">
              <Layers className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="hidden sm:inline">Servicio Activo:</span>
            </div>

            {/* Custom Dropdown Selector */}
            <div className="relative inline-block min-w-0 max-w-[160px] sm:max-w-none">
              <select
                value={selectedServiceId}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    navigate('/services');
                  } else {
                    setSelectedServiceId(e.target.value);
                  }
                }}
                className="w-full bg-[#181816] hover:bg-[#20201d] text-white text-xs font-semibold px-2.5 sm:px-3 py-1.5 pr-7 sm:pr-8 rounded-lg border border-white/15 outline-none cursor-pointer transition-colors shadow-sm appearance-none truncate"
              >
                <option value="all">Todos los Servicios ({services.length})</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.prefix || 'VAPE'})
                  </option>
                ))}
                <option value="__new__">+ Crear servicio...</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {selectedService && (
            <div className="hidden lg:flex items-center gap-3 text-xs text-zinc-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              <span>Prefix: <strong className="text-white font-mono">{selectedService.prefix || 'VAPE'}</strong></span>
              <span className="text-white/20">|</span>
              <span>API Key: <strong className="text-emerald-400 font-mono">{selectedService.api_key.substring(0, 8)}...</strong></span>
            </div>
          )}
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <motion.div
            key={window.location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
