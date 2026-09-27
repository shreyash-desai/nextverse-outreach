import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, CalendarCheck, Bot, LogOut, Shield } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin } from '../../utils/auth';

const navItems = [
  { icon: Home, label: 'Home', to: '/' },
  { icon: Users, label: 'Leads', to: '/leads' },
  { icon: Bot, label: 'Chatbot', to: '/chatbot' },
];

export function BottomNav() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
      <div className="bg-surface/90 backdrop-blur-md rounded-full shadow-floating border border-border/50 px-2 py-2 flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all duration-200',
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-textMuted hover:text-textPrimary hover:bg-gray-50'
              )
            }
          >
            <item.icon className="w-5 h-5 mb-0.5" strokeWidth={2} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
        {isAdmin() && (
          <NavLink
            to="/team"
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all duration-200',
                isActive 
                  ? 'text-purple-700 bg-purple-100' 
                  : 'text-purple-500 hover:text-purple-700 hover:bg-purple-50'
              )
            }
          >
            <Shield className="w-5 h-5 mb-0.5" strokeWidth={2} />
            <span className="text-[10px] font-medium">Team</span>
          </NavLink>
        )}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all duration-200 text-textMuted hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-5 h-5 mb-0.5" strokeWidth={2} />
          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
