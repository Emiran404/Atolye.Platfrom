import { create } from 'zustand';
import { liveSessionApi } from '../services/api';

const useLiveSessionStore = create((set, get) => ({
    sessions: [],
    loading: false,

    sendHeartbeat: async (examId, studentId, studentName, studentNumber, className, currentQuestion) => {
        try {
            return await liveSessionApi.heartbeat({ examId, studentId, studentName, studentNumber, className, currentQuestion });
        } catch (error) {
            console.error('Heartbeat error:', error);
            return null;
        }
    },

    reportWarning: async (examId, studentId, type, message) => {
        try {
            await liveSessionApi.reportWarning({ examId, studentId, type, message });
        } catch (error) {
            console.error('Warning report error:', error);
        }
    },

    loadExamSessions: async (examId) => {
        set({ loading: true });
        try {
            const response = await liveSessionApi.getExamSessions(examId);
            if (response.success) {
                set({ sessions: response.sessions, loading: false });
                return response.sessions;
            }
        } catch (error) {
            console.error('Load exam sessions error:', error);
        }
        set({ loading: false });
        return [];
    },

    finishSession: async (examId, studentId) => {
        try {
            await liveSessionApi.finishSession(examId, studentId);
        } catch (error) {
            console.error('Finish session error:', error);
        }
    },

    cancelSession: async (examId, studentId) => {
        try {
            await liveSessionApi.cancelSession(examId, studentId);
        } catch (error) {
            console.error('Cancel session error:', error);
        }
    }
}));

export { useLiveSessionStore };
