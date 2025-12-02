import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute - защита маршрутов по ролям
 * Если loading - показывает загрузку
 * Если not authenticated - редирект на лог ин
 * Если authenticated но нет прав - редирект на домашнюю
 */
export default function ProtectedRoute({
  isLoading,
  isAuthenticated,
  user,
  requiredRole, // 'admin', 'user', или null (просто аутентифицирован)
  element
}) {
  // Если ещё загружается - показываем загрузку
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
          <p className="mt-2 text-gray-500">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Если не аутентифицирован - редирект на логин
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Проверка ролей
  if (requiredRole === 'admin' && !user?.isAdmin) {
    // Нет прав администратора - редирект на домашнюю
    return <Navigate to="/" replace />;
  }

  // Всё хорошо - показываем компонент
  return element;
}
