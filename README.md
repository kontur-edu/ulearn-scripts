# ulearn scripts

Скрипты для автоматизации рутинных задач при проведении курсов с использованием платформы uLearn.

## Основные функции
1. Распределение студентов, зарегистрировавшихся на ulearn, по подгруппам по списку в виде CSV-файла
2. Выставление баллов в БРС УрФУ по таблице в виде CSV-файла
3. Перенос баллов студентов из Ведомости ulearn в Google Таблицу, в которой рассчитываются итоговые баллы

## Используемые API
- [uLearn API](https://api.ulearn.me/documentation/index.html) для получения групп студентов, переноса студентов
- API [ведомости курса uLearn](https://ulearn.me/Analytics/CourseStatistics?courseId=basicprogramming) получения баллов студентов
- API [мобильного модуля БРС УрФУ](https://brs.urfu.ru) для выставления баллов студентам
- [Google Spreadsheet API](https://developers.google.com/sheets/api/quickstart/nodejs) и [Google OAuth](https://developers.google.com/identity/protocols/OAuth2) для получения данных и заполнения данных о студентах в Google Таблицах

## Запуск
- Необходимо установить [Node.js](https://nodejs.org/en/)
- Выполнить в терминале `npm install` для установки зависимостей
- Скопировать папку `secret.sample` в `secret` и заполнить необходимые учетные данные
- Отредактировать `index.ts`, чтобы запускать нужные функции с нужными параметрами
- Выполнить в терминале `npm run` для запуска

Дорабатывать скрипты и запускать под откладкой удобно через [Visual Studio Code](https://code.visualstudio.com/)

## Технологии
Используется TypeScript и Node.js.