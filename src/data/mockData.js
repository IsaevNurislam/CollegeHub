export const INITIAL_NEWS_FEED = [
  {
    id: 1,
    author: "Студенческий Совет",
    authorKey: 'news.author.council',
    time: "2 часа назад",
    timeKey: 'news.time.2h',
    content: "🎉 Приглашаем всех на ежегодный хакатон 'Campus Code 2025'! Регистрация открыта до пятницы.",
    contentKey: 'news.content.hackathon',
    tags: ["Событие", "IT"],
    tagsKeys: ['tags.event', 'tags.it'],
    likes: 45,
    comments: 12,
    liked: false
  },
  {
    id: 2,
    author: "Клуб Робототехники",
    authorKey: 'news.author.robotics_club',
    time: "5 часов назад",
    timeKey: 'news.time.5h',
    content: "Ищем инженеров в команду для подготовки к битве роботов. Опыт не важен, главное желание учиться!",
    contentKey: 'news.content.robotics_recruit',
    tags: ["Клубы", "Набор"],
    tagsKeys: ['tags.clubs', 'tags.recruit'],
    likes: 28,
    comments: 5,
    liked: true
  }
];

export const INITIAL_CLUBS = [
  { id: 1, name: "Debate Club", category: "Общество", categoryKey: 'clubs.categories.society', members: 120, description: "Искусство спора и риторики.", descriptionKey: 'clubs.descriptions.debate', color: "bg-blue-500", instagram: "@debate_club", telegram: "@debateclub", whatsapp: "+996700123456" }, 
  { id: 2, name: "Eco Campus", category: "Экология", categoryKey: 'clubs.categories.ecology', members: 85, description: "Делаем наш университет зеленым.", descriptionKey: 'clubs.descriptions.eco', color: "bg-green-500", instagram: "@eco_campus", telegram: "@ecocampus", whatsapp: "" },
  { id: 3, name: "Art Studio", category: "Творчество", categoryKey: 'clubs.categories.creativity', members: 200, description: "Рисование, дизайн и выставки.", descriptionKey: 'clubs.descriptions.art_studio', color: "bg-purple-500", instagram: "@art_studio", telegram: "", whatsapp: "" },
  { id: 4, name: "Tech Innovators", category: "Наука", categoryKey: 'clubs.categories.science', members: 150, description: "Разработка ПО и гаджетов.", descriptionKey: 'clubs.descriptions.tech_innovators', color: "bg-sky-600", instagram: "@tech_innovators", telegram: "@techinnovators", whatsapp: "+996700654321" }, 
];

export const INITIAL_PROJECTS = [
  { id: 1, title: "Умная теплица", titleKey: 'projects.title.smart_greenhouse', description: "Система автоматизации климата для теплиц на базе IoT", status: "developing", needed: ["Frontend", "Biologist"], neededKeys: ['roles.frontend','roles.biologist'], author: "Иван К." },
  { id: 2, title: "College Hub App", titleKey: 'projects.title.college_hub_app', description: "Мобильное приложение для управления студенческой жизнью", status: "mvp", needed: ["Marketing"], neededKeys: ['roles.marketing'], author: "Мария Л." },
  { id: 3, title: "Короткометражный фильм", titleKey: 'projects.title.short_film', description: "Документальный фильм о студенческой жизни колледжа", status: "script", needed: ["Actor", "Editor"], neededKeys: ['roles.actor','roles.editor'], author: "Киноклуб" },
];

export const INITIAL_SCHEDULE = [
  { date: "2025-11-28", time: "08:30 - 10:00", subject: "Высшая математика", subjectKey: 'schedule.subject.math', room: "Ауд. 305", roomKey: 'schedule.room.305', type: "lecture", color: "border-blue-500" },
  { date: "2025-11-28", time: "10:15 - 11:45", subject: "Веб-разработка", subjectKey: 'schedule.subject.webdev', room: "Комп. класс 2", roomKey: 'schedule.room.lab2', type: "lab", color: "border-green-500" },
  { date: "2025-11-29", time: "12:30 - 14:00", subject: "Философия", subjectKey: 'schedule.subject.philosophy', room: "Ауд. 101", roomKey: 'schedule.room.101', type: "seminar", color: "border-yellow-500" },
];

export const USER_ACTIVITIES = [
  { id: 1, club: "Tech Innovators", action: "Завершил задачу", actionKey: 'activities.action.completed_task', detail: "Разработка API для мобильного приложения", detailKey: 'activities.detail.api_dev', date: "Вчера", dateKey: 'activities.date.yesterday' },
  { id: 2, club: "Debate Club", action: "Участие", actionKey: 'activities.action.participated', detail: "Выступил спикером на турнире", detailKey: 'activities.detail.spoke', date: "25 Ноября", dateKey: 'activities.date.nov25' },
  { id: 3, club: "Eco Campus", action: "Волонтерство", actionKey: 'activities.action.volunteered', detail: "Сбор макулатуры в корпусе А", detailKey: 'activities.detail.collected_paper', date: "20 Ноября", dateKey: 'activities.date.nov20' }
];

export const MOCK_USER = {
  studentId: "12345",
  name: "Алексей Смирнов",
  role: "Студент, 2 курс",
  roleKey: 'profile.placeholder_role',
  avatar: "АС", 
  notifications: 3,
  joinedClubs: [1, 4], 
  joinedProjects: [1] 
};

export const INITIAL_PARLIAMENT = [
  { id: 1, name: 'Ayana Omoshova', role: 'Президент', roleKey: 'parliament.roles.president', group: 'MAN-28', avatar: 'AO' },
  { id: 2, name: 'Saikal Mambetova', role: 'Вице-президент', roleKey: 'parliament.roles.vice_president', group: 'FIN-28A', avatar: 'SM' },
  { id: 3, name: 'Darina Matveenko', role: 'Куратор проекта «Дебатный клуб»', roleKey: 'parliament.roles.curator_debate', group: 'MAN-28', avatar: 'DM' },
  { id: 4, name: 'Abdykaparov Emirlan', role: 'Куратор проекта «Модель ООН»', roleKey: 'parliament.roles.curator_un', group: 'CYB-28', avatar: 'AE' },
  { id: 5, name: 'Imanalieva Sarah', role: 'Куратор проекта «Социальные сети»', roleKey: 'parliament.roles.curator_social', group: 'MAR-28', avatar: 'IS' },
  { id: 6, name: 'Isaev Nurislam', role: 'Куратор проекта «IT-проект / мини-приложение колледжа»', roleKey: 'parliament.roles.curator_it', group: 'PRG-28B', avatar: 'IN' },
  { id: 7, name: 'Alibek Alikov', role: 'Куратор проекта «Благотворительность»', roleKey: 'parliament.roles.curator_charity', group: 'MAN-28', avatar: 'AA' },
  { id: 8, name: 'Daniel', role: 'Куратор проекта «Организация образовательных и развлекательных мероприятий»', roleKey: 'parliament.roles.curator_events', group: 'PRG-28C', avatar: 'D' }
];

export const INITIAL_CHAT_MESSAGES = [
  {
    id: 1,
    author: 'София Б.',
    avatar: 'СБ',
    time: '09:42',
    text: 'Кто придёт в коворкинг? Поддержим новую презентацию клуба.',
    isMine: false,
    status: 'read',
    pinned: true,
    tags: ['#общий', '#анонс'],
  },
  {
    id: 2,
    author: 'Ты',
    avatar: 'Т',
    time: '09:45',
    text: 'Я уже готовлю доклад, через минуту скину макет обложки.',
    isMine: true,
    status: 'sent',
    attachments: [{ type: 'image', label: 'cover.webp' }]
  },
  {
    id: 3,
    author: 'Федор Ж.',
    avatar: 'ФЖ',
    time: '09:49',
    text: 'Поставил опрос в соцсетях и переслал ссылку в Телеграм-канал.',
    isMine: false,
    status: 'delivered',
    quickActions: ['@team', '#event']
  },
  {
    id: 4,
    author: 'Манон И.',
    avatar: 'МИ',
    time: '09:52',
    text: 'Сделаю голосовое позже, выберу мелодию в телеграм-боте.',
    isMine: false,
    status: 'read',
    attachments: [{ type: 'voice', label: 'Сообщение 00:32' }]
  },
  {
    id: 5,
    author: 'Ты',
    avatar: 'Т',
    time: '09:55',
    text: 'Супер, добавлю тайм-код в закреп и отправлю всем в общий чат.',
    isMine: true,
    status: 'sent',
  }
];