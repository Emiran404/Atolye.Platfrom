import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  PlusCircle,
  Activity,
  ClipboardCheck,
  Users,
  Archive,
  BarChart,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  FileCheck,
  Clock,
  Shield,
  Monitor,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { t } from '../../utils/i18n';

const teacherMenuItems = [
  { path: '/ogretmen/panel', icon: Home, label: 'home', end: true },
  { path: '/ogretmen/sinav-olustur', icon: PlusCircle, label: 'createExamMenu' },
  { path: '/ogretmen/aktif-sinavlar', icon: Activity, label: 'activeExamsMenu' },
  { path: '/ogretmen/duzenleme-talepleri', icon: Clock, label: 'editRequestsMenu', badge: true },
  { path: '/ogretmen/ogrenci-listesi', icon: Users, label: 'studentListMenu' },
  { path: '/ogretmen/degerlendirme', icon: ClipboardCheck, label: 'evaluationMenu' },
  { path: '/ogretmen/arsiv', icon: Archive, label: 'archiveMenu' },
  { path: '/ogretmen/istatistikler', icon: BarChart, label: 'statisticsMenu' },
  { path: '/ogretmen/platform-yonetimi', icon: Shield, label: 'platformManagement' },
  { path: '/ogretmen/polyos-oga', icon: UserCheck, label: 'polyosOgaMenu', special: true },
  { path: '/ogretmen/bildirimler', icon: Bell, label: 'notificationsMenu' },
  { path: '/ogretmen/ayarlar', icon: Settings, label: 'settingsMenu' },
  { path: '/ogretmen/sorun-bildir', icon: AlertTriangle, label: 'reportProblemMenu' }
];

const TeacherSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { unreadCount } = useNotificationStore();

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen
        bg-slate-900 border-r border-slate-800
        transition-all duration-300 z-40
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-blue-500" />
            <div>
              <span className="font-bold text-slate-200">Atölye</span>
              <span className="text-xs text-slate-500 block">Öğretmen Paneli</span>
            </div>
          </div>
        )}
        {collapsed && <GraduationCap className="w-8 h-8 text-blue-500 mx-auto" />}
      </div>

      {/* Menu */}
      <nav className="p-3 space-y-1">
        {teacherMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg
              transition-all duration-200 relative
              ${item.special
                ? (isActive
                  ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-purple-300 border border-purple-500/50'
                  : 'bg-gradient-to-r from-purple-900/20 to-blue-900/20 text-purple-400 hover:from-purple-800/30 hover:to-blue-800/30 border border-purple-700/30'
                )
                : (isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )
              }
              ${collapsed ? 'justify-center' : ''}
            `}
            title={collapsed ? t(item.label) : ''}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{t(item.label)}</span>}
            {item.badge && unreadCount > 0 && (
              <span className={`
                absolute bg-red-500 text-white text-xs font-bold rounded-full
                ${collapsed ? 'top-0 right-0 w-4 h-4 flex items-center justify-center' : 'ml-auto px-2 py-0.5'}
              `}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>
    </aside>
  );
};

export default TeacherSidebar;
