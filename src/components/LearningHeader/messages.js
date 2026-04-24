import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  myLearning: {
    id: 'learningHeader.dashboardLink',
    defaultMessage: 'Моё обучение',
    description: 'Ссылка на дашборд в основном меню хедера страницы курса',
  },
  catalog: {
    id: 'learningHeader.discoveryLink"',
    defaultMessage: 'Каталог обучения',
    description: 'Ссылка на каталог курсов в основном меню хедера',
  },
    aiAssis: {
    id: 'learningHeader.ai-assistant',
    defaultMessage: 'ИИ-ассистент',
    description: 'Ссылка на страницу рейтингов в основном меню хедера',
  },
  ratings: {
    id: 'learningHeader.header.ratings',
    defaultMessage: 'Рейтинги',
    description: 'Ссылка на страницу рейтингов в основном меню хедера',
  },

  profile: {
    id: 'learningHeader.profileLink',
    defaultMessage: 'Профиль',
    description: 'Ссылка на профиль пользователя в выпадающем меню',
  },
  account: {
    id: 'learningHeader.accountLink',
    defaultMessage: 'Учётная запись',
    description: 'Ссылка на настройки аккаунта в выпадающем меню',
  },
  rewards: {
    id: 'learningHeader.rewardsLink',
    defaultMessage: 'Мои награды',
    description: 'Ссылка на награды пользователя в выпадающем меню',
  },
  signOut: {
    id: 'learningHeader.exitLink',
    defaultMessage: 'Выйти',
    description: 'Ссылка на выход из аккаунта в выпадающем меню',
  },

  courseOrgNumber: {
    id: 'learningHeader.course.orgNumber',
    defaultMessage: '{org} {number}',
    description: 'Формат организации и номера курса',
  },
  courseTitle: {
    id: 'learningHeader.course.title',
    defaultMessage: '{title}',
    description: 'Название курса',
  },
});

export default messages;