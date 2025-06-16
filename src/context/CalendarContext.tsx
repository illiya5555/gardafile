// src/context/CalendarContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCalendarSync, TimeSlot } from '../hooks/useCalendarSync';

interface CalendarContextType {
    timeSlots: TimeSlot[];
    loading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    getActiveTimeSlotsForDate: (date: string) => TimeSlot[];
    isDateAvailable: (date: string) => boolean;
    isDateBooked: (date: string) => boolean; // Функция для проверки "забронированных" дней по бизнес-правилу
    refreshCalendarData: () => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const calendarSync = useCalendarSync();

    /**
     * Проверяет, является ли день "забронированным" по бизнес-правилу.
     * Правило: будние дни (Пн-Пт) в Июне и Июле считаются забронированными для частных мероприятий.
     * @param dateStr - Дата в формате 'YYYY-MM-DD'
     */
    const isDateBooked = (dateStr: string): boolean => {
        // Создаем объект Date, обязательно указывая время T00:00:00, чтобы избежать проблем с часовыми поясами
        const date = new Date(dateStr + 'T00:00:00');
        const month = date.getMonth(); // JavaScript месяцы: 0-11. Июнь = 5, Июль = 6.
        const dayOfWeek = date.getDay(); // JavaScript дни недели: Воскресенье = 0, Понедельник = 1, ..., Суббота = 6.

        // Применяем правило для Июня и Июля
        if (month === 5 || month === 6) { 
            // Возвращаем true (забронировано), если это день с Понедельника по Пятницу
            return dayOfWeek >= 1 && dayOfWeek <= 5;
        }

        // Для всех остальных месяцев это правило не действует
        return false;
    };

    /**
     * Определяет, доступна ли дата для выбора клиентом.
     * Дата доступна, если на нее есть хотя бы один АКТИВНЫЙ слот в базе данных
     * И она НЕ считается "забронированной" по бизнес-правилу.
     * @param dateStr - Дата в формате 'YYYY-MM-DD'
     */
    const isDateAvailable = (dateStr: string): boolean => {
        // 1. Проверяем наличие активных слотов в базе данных (из useCalendarSync)
        const hasActiveSlotsFromDB = calendarSync.isDateAvailable(dateStr);
        
        // 2. Проверяем, не заблокирован ли день по бизнес-правилу
        const isBookedByRule = isDateBooked(dateStr);

        // 3. Дата доступна, только если оба условия выполняются
        return hasActiveSlotsFromDB && !isBookedByRule;
    };

    const value: CalendarContextType = {
        timeSlots: calendarSync.timeSlots,
        loading: calendarSync.loading,
        error: calendarSync.error,
        lastUpdated: calendarSync.lastUpdated,
        getActiveTimeSlotsForDate: calendarSync.getActiveTimeSlotsForDate,
        refreshCalendarData: calendarSync.refreshData,
        // Наши функции, которые объединяют данные из БД и бизнес-логику
        isDateAvailable: isDateAvailable,
        isDateBooked: isDateBooked,
    };

    return (
        <CalendarContext.Provider value={value}>
            {children}
        </CalendarContext.Provider>
    );
};

export const useCalendar = (): CalendarContextType => {
    const context = useContext(CalendarContext);
    if (context === undefined) {
        throw new Error('useCalendar must be used within a CalendarProvider');
    }
    return context;
};