import React from 'react';

const translations = {
  ru: {
    sidebar: { home: 'Главная', clubs: 'Клубы', projects: 'Проекты', activity: 'Моя Активность', parliament: 'Парламент', schedule: 'Встречи', profile: 'Профиль', chat: 'Чат', admin: 'Администрация', support: 'Поддержка' },
    search: { placeholder_short: 'Поиск...', placeholder_full: 'Поиск (новости, клубы, проекты)...', results_prefix: 'Результаты поиска по запросу:' },
    auth: { logout_title: 'Выход из аккаунта', logout_message: 'Вы уверены, что хотите выйти из аккаунта?', logout_confirm: 'Выйти', logout_cancel: 'Отмена', passwordLabel: 'Пароль', passwordPlaceholder: 'Введите пароль' },
    notifications: { title: 'Уведомления', clear: 'Очистить', none: 'Нет новых уведомлений', mark: 'Отметить', meeting_reminder: 'Напоминание о встрече' },
    admin: {
      confirm: {
        delete_news_title: 'Удалить новость',
        delete_news_message: 'Вы уверены, что хотите удалить эту новость?',
        delete_comment_title: 'Удалить комментарий',
        delete_comment_message: 'Вы уверены, что хотите удалить этот комментарий?',
        delete_club_title: 'Удалить клуб',
        delete_club_message: 'Удалить клуб невозможно восстановить. Продолжить?',
        delete_project_title: 'Удалить проект',
        delete_project_message: 'Вы уверены, что хотите удалить проект?',
        delete_button: 'Удалить'
      }
    },
    clubs: {
      title: 'Клубы и Сообщества',
      create: 'Создать клуб',
      form: {
        name: 'Название клуба',
        category: 'Категория',
        description: 'Описание',
        color: 'Цвет',
        placeholder_name: 'Название...',
        placeholder_description: 'Описание клуба...',
        instagram_label: 'Instagram',
        instagram_placeholder: '@username',
        tiktok_label: 'TikTok',
        tiktok_placeholder: '@username',
        telegram_label: 'Telegram',
        telegram_placeholder: '@username',
        youtube_label: 'YouTube',
        youtube_placeholder: '@username',
        website_label: 'Сайт',
        website_placeholder: 'www.example.com',
        social_heading: 'Ссылки и соцсети',
        social_optional: 'опционально',
        invalid_url: 'Неверный URL в поле'
      },
      join: 'Вступить',
      joined: 'Вы присоединились',
      view_all: 'Смотреть все',
      members_label: 'уч.',
      leave: 'Выйти',
      details_contacts: 'Контакты',
      contact_labels: { instagram: 'Instagram', telegram: 'Telegram', whatsapp: 'WhatsApp', tiktok: 'TikTok', youtube: 'YouTube', website: 'Сайт' },
      detail: {
        loading: 'Загрузка...',
        creator_label: 'Создатель',
        created_at_label: 'Дата создания',
        back_button: 'Назад к клубам',
        members_button: 'Участники и проекты',
        social_heading: 'Соцсети',
        no_socials: 'Ссылок пока нет',
        photos_heading: 'Фотографии',
        no_photos: 'Нет фотографий',
        activity_heading: 'Последняя активность',
        no_activity: 'Активность отсутствует'
      },
      error: {
        loading_title: 'Не удалось загрузить клуб'
      },
      descriptions: { debate: 'Искусство спора и риторики.', eco: 'Делаем наш университет зеленым.', art_studio: 'Рисование, дизайн и выставки.', tech_innovators: 'Разработка ПО и гаджетов.' },
      categories: { society: 'Общество', ecology: 'Экология', creativity: 'Творчество', science: 'Наука', sport: 'Спорт', art: 'Искусство', select: 'Выберите категорию' },
      members: {
        loading: 'Загрузка участников...',
        heading: 'Участники и проекты',
        participants_title: 'Участники',
        empty: 'Пока нет участников',
        removed_success: 'Участник удалён',
        removed_error: 'Не удалось удалить участника',
        remove: 'Удалить участника',
        projects_title: 'Проекты клуба',
        no_projects: 'Связанные проекты отсутствуют'
      }
    },
    projects: { heading: 'Студенческие Проекты', subtitle: 'Лучшие проекты студентов. Присоединяйтесь к команде или создайте свой.', empty: 'Здесь пока ничего нет', add: 'Добавить проект', form: { title: 'Название проекта', author: 'Автор', status: 'Статус', roles_placeholder: 'Frontend, Backend, Designer...' }, details: 'Подробнее', join_button: 'Вступить', labels: { author: 'Автор:', needed: 'Кого ищем:', team: 'Команда' }, statuses: { script: 'Сценарий', developing: 'В разработке', mvp: 'Запуск MVP', done: 'Завершено' }, title: { smart_greenhouse: 'Умная теплица', college_hub_app: 'College Hub App', short_film: 'Короткометражный фильм' } },
    activity: {
      empty_title: 'Вы не состоите в клубах или проектах',
      empty_message: 'Присоединяйтесь к сообществам или начните свой проект, чтобы здесь появилась история вашей активности.',
      title: 'Моя активность и Достижения',
      last_actions: 'Последние действия',
      my_clubs_title: 'Мои клубы',
      joined_clubs_title: 'Присоединившиеся клубы',
      my_projects_title: 'Мои проекты',
      joined_projects_title: 'Присоединившиеся проекты',
      join_button: 'Вступить',
      leave_club: 'Выйти из клуба',
      no_created_clubs: 'Вы ещё не создали клубы',
      no_joined_clubs: 'Вы ещё не состоите в клубах',
      no_created_projects: 'Вы ещё не создали проекты',
      no_joined_projects: 'Вы ещё не участвуете в проектах',
      active_memberships: 'активных членства',
      in_work: 'в работе',
      last_action_empty: 'Активность отсутствует'
    },
    schedule: { title: 'Расписание', add_meeting: 'Добавить встречу', edit_meeting: 'Редактировать встречу', export: 'Экспорт', no_meetings: 'Нет запланированных встреч', edit: 'Редактировать', delete: 'Удалить', form: { time: 'Время', placeholder_time: '09:00 - 10:30', name: 'Название', room: 'Аудитория', type: 'Тип', add: 'Добавить', save: 'Сохранить', cancel: 'Отмена', placeholder_name: 'Название встречи', placeholder_room: 'Ауд. 305', date: 'Дата', start_time: 'Время начала', end_time: 'Время окончания' }, all: 'Все встречи', types: { lecture: 'Лекция', seminar: 'Семинар', lab: 'Лабораторная', practice: 'Практика' }, subject: { math: 'Высшая математика', webdev: 'Веб-разработка', philosophy: 'Философия' }, room: { '305': 'Ауд. 305', lab2: 'Комп. класс 2', '101': 'Ауд. 101' } },
    parliament: {
      title: 'Парламент Колледжа',
      info: 'Здесь публикуются решения и важные объявления',
      roles: { president: 'Президент', vice_president: 'Вице-президент', curator_debate: 'Куратор проекта «Дебатный клуб»', curator_un: 'Куратор проекта «Модель ООН»', curator_social: 'Куратор проекта «Социальные сети»', curator_it: 'Куратор проекта «IT-проект / мини-приложение колледжа»', curator_charity: 'Куратор проекта «Благотворительность»', curator_events: 'Куратор проекта «Организация образовательных и развлекательных мероприятий»' },
      add_member: 'Добавить участника',
      add_description: 'Заполните форму, чтобы добавить нового участника парламента',
      loading: 'Загрузка парламента...',
      no_members: 'Пока нет участников',
      error: 'Не удалось загрузить список парламента',
      fields: {
        name: 'Имя',
        role: 'Роль',
        position: 'Должность',
        description: 'Описание',
        group: 'Группа/факультет',
        avatar: 'Фото'
      },
      actions: {
        add: 'Добавить участника',
        edit: 'Редактировать',
        save: 'Сохранить',
        remove: 'Снять с должности',
        delete: 'Удалить участника'
      },
      confirm_delete: 'Удалить участника навсегда?',
      confirm_remove: 'Снять участника с должности?',
      deleted_message: 'Участник удалён',
      create_validation: 'Укажите имя и роль участника'
    },
    chat: {
      title: 'Общий чат',
      subtitle: 'Текущий диалог для всех активистов и команд',
      pinned_label: 'Закреплено',
      quick_actions_title: 'Функции Telegram',
      placeholder: 'Написать сообщение...',
      send: 'Отправить',
      invite_link: 'Перейти в Telegram',
      status: { read: 'Прочитано', delivered: 'Доставлено', sent: 'Отправлено' },
      action_voice: 'Голосовое',
      action_sticker: 'Стикер',
      action_attach: 'Прикрепить',
      empty: 'Здесь пока нет сообщений'
    },
    common: { create: 'Создать', cancel: 'Отмена', at: 'в', details: 'Подробнее', close: 'Закрыть', save: 'Сохранить', access_denied: 'Доступ запрещён', empty_state: 'Здесь пока ничего нет', support: 'Служба поддержки' },
    profile: { title: 'Профиль', edit: 'Редактировать', cancel: 'Отмена', full_name: 'Полное имя', first_name: 'Имя', last_name: 'Фамилия', student_id_label: 'Student ID', role_label: 'Должность', placeholder_role: 'Студент, 2 курс', save_success: 'Профиль успешно обновлен', save: 'Сохранить', student_id_invalid: 'Student ID должен быть 6 цифр', not_specified: 'Не указано' },
    roles: { frontend: 'Frontend разработчик', backend: 'Backend разработчик', designer: 'Дизайнер', biologist: 'Биолог', marketing: 'Маркетолог', actor: 'Актёр', editor: 'Монтажёр' },
    language: { switch_to_en: 'Переключить на English', switch_to_ru: 'Switch to Russian' },
    app: { name: 'College Hub' },
    login: { welcome: 'Добро пожаловать в College Hub! 👋', register_title: 'Регистрация', register_subtitle: 'Создайте аккаунт для доступа к платформе', tab_login: 'Вход', tab_register: 'Регистрация', register_button: 'Зарегистрироваться', have_account: 'Уже есть аккаунт? Войти', no_account: 'Нет аккаунта? Зарегистрироваться', placeholder_first: 'Имя', placeholder_last: 'Фамилия', submit: 'Войти', instructions: 'Введите ваши данные для доступа', student_id_label: 'Student ID', student_id_placeholder: 'Например: 210105', no_id_help: 'Нет ID? Обратитесь в деканат.', errors: { required: 'Обязательное поле', min_chars: 'Должно быть минимум 2 символа', id_invalid: 'ID должен состоять минимум из 5 цифр' } },
    home: { tagline: 'Твой центр управления студенческой жизнью. Следи за расписанием, вступай в клубы и находи команду мечты.', news_title: 'Новости Колледжа', meetings: 'Встречи', in_minutes: 'Через 15 мин', popular_clubs: 'Популярные клубы', no_classes: 'Нет встреч', upcoming: 'Предстоящее', time: { minutes: 'мин', hours: 'ч', days: 'дней', weeks: 'недель', months: 'мес', years: 'лет' } },
    news: { author: { council: 'Студенческий Совет', robotics_club: 'Клуб Робототехники' }, time: { '2h': '2 часа назад', '5h': '5 часов назад' }, content: { hackathon: "🎉 Приглашаем всех на ежегодный хакатон 'College Code 2025'! Регистрация открыта до пятницы.", robotics_recruit: 'Ищем инженеров в команду для подготовки к битве роботов. Опыт не важен, главное желание учиться!' } },
    tags: { event: 'Событие', it: 'IT', clubs: 'Клубы', recruit: 'Набор' },
    activities: { action: { completed_task: 'Завершил задачу', participated: 'Участие', volunteered: 'Волонтерство' }, detail: { api_dev: 'Разработка API для мобильного приложения', spoke: 'Выступил спикером на турнире', collected_paper: 'Сбор макулатуры в корпусе А' }, date: { yesterday: 'Вчера', nov25: '25 Ноября', nov20: '20 Ноября' } },
    grades: { subjects: { math: 'Высшая математика', physics: 'Физика', programming: 'Программирование', history: 'История' } }
  },
  en: {
    sidebar: { home: 'Home', clubs: 'Clubs', projects: 'Projects', activity: 'Activity', parliament: 'Parliament', schedule: 'Schedule', profile: 'Profile', chat: 'Chat', admin: 'Administration', support: 'Support' },
    search: { placeholder_short: 'Search...', placeholder_full: 'Search (news, clubs, projects)...', results_prefix: 'Search results for:' },
    auth: { logout_title: 'Sign out', logout_message: 'Are you sure you want to sign out?', logout_confirm: 'Sign out', logout_cancel: 'Cancel', passwordLabel: 'Password', passwordPlaceholder: 'Enter password' },
    notifications: { title: 'Notifications', clear: 'Clear', none: 'No new notifications', mark: 'Mark', meeting_reminder: 'Meeting Reminder' },
    admin: {
      confirm: {
        delete_news_title: 'Delete news',
        delete_news_message: 'Are you sure you want to delete this news item?',
        delete_comment_title: 'Delete comment',
        delete_comment_message: 'This action cannot be undone. Delete comment?',
        delete_club_title: 'Delete club',
        delete_club_message: 'Deleting a club cannot be undone. Continue?',
        delete_project_title: 'Delete project',
        delete_project_message: 'Are you sure you want to delete this project?',
        delete_button: 'Delete'
      }
    },
    clubs: {
      title: 'Clubs & Communities',
      create: 'Create club',
      form: {
        name: 'Club name',
        category: 'Category',
        description: 'Description',
        color: 'Color',
        placeholder_name: 'Name...',
        placeholder_description: 'Club description...',
        instagram_label: 'Instagram',
        instagram_placeholder: '@username',
        tiktok_label: 'TikTok',
        tiktok_placeholder: '@username',
        telegram_label: 'Telegram',
        telegram_placeholder: '@username',
        youtube_label: 'YouTube',
        youtube_placeholder: '@username',
        website_label: 'Website',
        website_placeholder: 'www.example.com',
        social_heading: 'Links & socials',
        social_optional: 'optional',
        invalid_url: 'Invalid URL in'
      },
      join: 'Join',
      joined: 'Joined',
      view_all: 'See all',
      members_label: 'members',
      leave: 'Leave',
      details_contacts: 'Contacts',
      contact_labels: { instagram: 'Instagram', telegram: 'Telegram', whatsapp: 'WhatsApp', tiktok: 'TikTok', youtube: 'YouTube', website: 'Website' },
      detail: {
        loading: 'Loading...',
        creator_label: 'Creator',
        created_at_label: 'Created at',
        back_button: 'Back to clubs',
        members_button: 'Members & projects',
        social_heading: 'Social links',
        no_socials: 'No shared links yet',
        photos_heading: 'Photos',
        no_photos: 'No photos available',
        activity_heading: 'Recent activity',
        no_activity: 'No activity yet'
      },
      error: {
        loading_title: 'Unable to load club'
      },
      descriptions: { debate: 'The art of debate and rhetoric.', eco: 'Making our college greener.', art_studio: 'Drawing, design and exhibitions.', tech_innovators: 'Software development and gadgets.' },
      categories: { society: 'Society', ecology: 'Ecology', creativity: 'Creativity', science: 'Science', sport: 'Sport', art: 'Art', select: 'Select category' },
      members: {
        loading: 'Loading members...',
        heading: 'Members & projects',
        participants_title: 'Members',
        empty: 'No members yet',
        removed_success: 'Member removed',
        removed_error: 'Failed to remove member',
        remove: 'Remove member',
        projects_title: 'Club projects',
        no_projects: 'No linked projects'
      }
    },
    projects: { heading: 'Student Projects', subtitle: 'Top student work. Join a team or start your own.', empty: 'Nothing here yet', add: 'Add project', form: { title: 'Project title', author: 'Author', status: 'Status', roles_placeholder: 'Frontend, Backend, Designer...' }, details: 'Details', join_button: 'Join', labels: { author: 'Author:', needed: 'Looking for:', team: 'Team' }, statuses: { script: 'Script', developing: 'Developing', mvp: 'MVP Launch', done: 'Done' }, title: { smart_greenhouse: 'Smart Greenhouse', college_hub_app: 'College Hub App', short_film: 'Short Film' } },
    activity: {
      empty_title: 'You are not a member of any clubs or projects',
      empty_message: 'Join communities or start your project to see activity history here.',
      title: 'My activity & Achievements',
      last_actions: 'Recent actions',
      my_clubs_title: 'My Clubs',
      joined_clubs_title: 'Joined Clubs',
      my_projects_title: 'My Projects',
      joined_projects_title: 'Joined Projects',
      join_button: 'Join',
      leave_club: 'Leave Club',
      no_created_clubs: 'You have not created any clubs yet',
      no_joined_clubs: 'You have not joined any clubs yet',
      no_created_projects: 'You have not created any projects yet',
      no_joined_projects: 'You have not joined any projects yet',
      active_memberships: 'active memberships',
      in_work: 'in progress',
      last_action_empty: 'No activity yet'
    },
    schedule: { title: 'Schedule', add_meeting: 'Add meeting', edit_meeting: 'Edit meeting', export: 'Export', no_meetings: 'No scheduled meetings', edit: 'Edit', delete: 'Delete', form: { time: 'Time', placeholder_time: '09:00 - 10:30', name: 'Title', room: 'Room', type: 'Type', add: 'Add', save: 'Save', cancel: 'Cancel', placeholder_name: 'Meeting title', placeholder_room: 'Room 305', date: 'Date', start_time: 'Start time', end_time: 'End time' }, all: 'All meetings', types: { lecture: 'Lecture', seminar: 'Seminar', lab: 'Lab', practice: 'Practice' }, subject: { math: 'Higher Mathematics', webdev: 'Web Development', philosophy: 'Philosophy' }, room: { '305': 'Room 305', lab2: 'Computer lab 2', '101': 'Room 101' } },
    parliament: {
      title: 'College Parliament',
      info: 'Decisions and important announcements are published here',
      roles: { president: 'President', vice_president: 'Vice President', curator_debate: 'Debate Club Curator', curator_un: 'Model UN Curator', curator_social: 'Social Media Curator', curator_it: 'IT Project Curator', curator_charity: 'Charity Curator', curator_events: 'Events & Activities Curator' },
      add_member: 'Add a member',
      add_description: 'Fill out the form to add a new parliament member',
      loading: 'Loading parliament members...',
      no_members: 'No members yet',
      error: 'Unable to load parliament members',
      fields: {
        name: 'Name',
        role: 'Role',
        position: 'Position',
        description: 'Description',
        group: 'Group/Faculty',
        avatar: 'Photo'
      },
      actions: {
        add: 'Add member',
        edit: 'Edit',
        save: 'Save',
        remove: 'Remove from post',
        delete: 'Delete member'
      },
      confirm_delete: 'Delete this member permanently?',
      confirm_remove: 'Remove this member from the position?',
      deleted_message: 'Member removed',
      create_validation: 'Please provide both name and role'
    },
    chat: {
      title: 'Community Chat',
      subtitle: 'Open dialogue for students, clubs and parliament',
      pinned_label: 'Pinned',
      quick_actions_title: 'Telegram tools',
      placeholder: 'Write a message...',
      send: 'Send',
      invite_link: 'Open in Telegram',
      status: { read: 'Read', delivered: 'Delivered', sent: 'Sent' },
      action_voice: 'Voice',
      action_sticker: 'Sticker',
      action_attach: 'Attach',
      empty: 'No messages yet'
    },
    common: { create: 'Create', cancel: 'Cancel', at: 'at', details: 'Details', close: 'Close', save: 'Save', access_denied: 'Access denied', empty_state: 'Nothing here yet', support: 'Support' },
    profile: { title: 'Profile', edit: 'Edit', cancel: 'Cancel', full_name: 'Full name', first_name: 'First Name', last_name: 'Last Name', student_id_label: 'Student ID', role_label: 'Position', placeholder_role: 'Student, 2nd year', save_success: 'Profile updated successfully', save: 'Save', student_id_invalid: 'Student ID must be 6 digits', not_specified: 'Not specified' },
    roles: { frontend: 'Frontend developer', backend: 'Backend developer', designer: 'Designer', biologist: 'Biologist', marketing: 'Marketing specialist', actor: 'Actor', editor: 'Editor' },
    language: { switch_to_en: 'Switch to English', switch_to_ru: 'Переключить на Russian' },
    app: { name: 'College Hub' },
    login: { welcome: 'Welcome to College Hub! 👋', register_title: 'Registration', register_subtitle: 'Create an account to access the platform', tab_login: 'Sign In', tab_register: 'Register', register_button: 'Register', have_account: 'Already have an account? Sign in', no_account: "Don't have an account? Register", placeholder_first: 'First name', placeholder_last: 'Last name', submit: 'Sign in', instructions: 'Enter your details to sign in', student_id_label: 'Student ID', student_id_placeholder: 'E.g.: 210105', no_id_help: "No ID? Contact the registrar's office.", errors: { required: 'Required field', min_chars: 'Must be at least 2 characters', id_invalid: 'ID must be at least 5 digits' } },
    home: { tagline: 'Your student life control center. Follow the schedule, join clubs and find your dream team.', news_title: 'College News', meetings: 'Meetings', in_minutes: 'In 15 min', popular_clubs: 'Popular clubs', no_classes: 'No meetings', upcoming: 'Upcoming', time: { minutes: 'min', hours: 'h', days: 'days', weeks: 'weeks', months: 'months', years: 'years' } },
    news: { author: { council: 'Student Council', robotics_club: 'Robotics Club' }, time: { '2h': '2 hours ago', '5h': '5 hours ago' }, content: { hackathon: "🎉 Join us for the annual hackathon 'College Code 2025'! Registration is open until Friday.", robotics_recruit: 'We are looking for engineers to join the team for the robot battle. No experience needed, just eagerness to learn!' } },
    tags: { event: 'Event', it: 'IT', clubs: 'Clubs', recruit: 'Recruit' },
    activities: { action: { completed_task: 'Completed task', participated: 'Participated', volunteered: 'Volunteered' }, detail: { api_dev: 'API development for the mobile app', spoke: 'Spoke as a speaker at the tournament', collected_paper: 'Collected paper for recycling in Building A' }, date: { yesterday: 'Yesterday', nov25: 'Nov 25', nov20: 'Nov 20' } },
    grades: { subjects: { math: 'Higher Mathematics', physics: 'Physics', programming: 'Programming', history: 'History' } }
  }
};

export const I18nContext = React.createContext({ t: (k) => k, language: 'ru' });

export function I18nProvider({ language = 'ru', children }) {
  const t = (key) => {
    const parts = key.split('.');
    let cur = translations[language] || translations.ru;
    for (let p of parts) {
      if (cur && Object.prototype.hasOwnProperty.call(cur, p)) cur = cur[p];
      else return key;
    }
    return typeof cur === 'string' ? cur : key;
  };

  return React.createElement(
    I18nContext.Provider,
    { value: { t, language } },
    children
  );
}

export function useTranslation() {
  return React.useContext(I18nContext);
}

export function getT(language = 'ru') {
  return (key) => {
    const parts = key.split('.');
    let cur = translations[language] || translations.ru;
    for (let p of parts) {
      if (cur && Object.prototype.hasOwnProperty.call(cur, p)) cur = cur[p];
      else return key;
    }
    return typeof cur === 'string' ? cur : key;
  };
}
