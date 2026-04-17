import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  aiAssistant: {
    id: 'ai.widget.title',
    defaultMessage: 'ИИ-ассистент',
  },
  typeMessage: {
    id: 'ai.widget.typeMessage',
    defaultMessage: 'Задайте вопрос...',
  },
  welcomeGlobal: {
    id: 'ai.widget.welcome.global',
    defaultMessage: 'Я ИИ-ассистент. Помогу сориентироваться на {siteName}.',
  },
  welcomeCourse: {
    id: 'ai.widget.welcome.course',
    defaultMessage: ' Также я готов ответить на любые вопросы по материалам этого курса.',
  },
  clearHistory: {
    id: 'ai.widget.clearHistory',
    defaultMessage: 'Удалить чат',
  },
  cancelClearHistory: {
    id: 'ai.widget.cancelClearHistory',
    defaultMessage: 'Отмена',
  },
  errorGeneral: {
    id: 'ai.widget.error.general',
    defaultMessage: 'Ошибка при обращении к ИИ-ассистенту. Повторите запрос позже.',
  },
  errorTokenLimit: {
    id: 'ai.widget.error.tokenLimit',
    defaultMessage: 'Вы достигли лимита запросов к ИИ-ассистенту. Задайте вопрос позже.',
  },
});

export default messages;