(function (global) {
    class FaviconOverlay {
        constructor(options) {
            // Инициализация параметров
            this.colorStart = options.colorStart || 'pink';  // Цвет накладываемого круга
            this.colorPause = options.colorPause || 'yellow';  // Цвет накладываемого круга
            this.defaultFavicon = options.defaultFavicon || ''; // Путь к исходному favicon
            this.favicon = this.getFaviconElement();  // Получаем элемент favicon
            this.canvas = document.createElement('canvas');  // Canvas для рисования
            this.ctx = this.canvas.getContext('2d');  // Контекст для рисования на canvas
            this.isActive = false;  // Состояние активирован ли эффект наложения

            this.setDefaultFavicon();
        }

        // Метод для получения или создания тега <link rel="icon">
        getFaviconElement() {
            let favicon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');

            // Если тег <link rel="icon"> не найден, создаем его
            if (!favicon) {
                favicon = document.createElement('link');
                favicon.rel = 'icon';
                favicon.href = this.defaultFavicon;  // Устанавливаем путь к изображению по умолчанию
                document.head.appendChild(favicon);  // Добавляем тег в <head>
            } else {
                const href = favicon.getAttribute('href');

                // Проверяем, если href является base64 строкой или относительной/абсолютной ссылкой
                if (href && (href.startsWith('data:image') || href.startsWith('http'))) {
                    return favicon;
                } else {
                    favicon.href = this.defaultFavicon;  // Устанавливаем путь к изображению по умолчанию
                }
            }

            return favicon;
        }

        setDefaultFavicon() {
            if (this.defaultFavicon) {
                return;
            }

            const favInRootPath = '/favicon.ico';

            fetch(favInRootPath).then(response => {
                window.console.log('response', response);

                if (response.ok) {
                    this.defaultFavicon = favInRootPath;
                } else {
                    this.defaultFavicon = this.createDefaultFavicon();
                }
            }).catch(error => {
            });
        }

        createDefaultFavicon() {
            // Создаем canvas для рисования
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Устанавливаем размер favicon (например, 16x16 пикселей)
            const size = 32;
            canvas.width = size;
            canvas.height = size;

            // Рисуем пустое изображение (прозрачный фон)
            ctx.fillStyle = 'rgba(0, 0, 0, 0)'; // Прозрачный фон
            ctx.fillRect(0, 0, size, size);

            // Преобразуем canvas в base64 строку для использования как favicon
            return canvas.toDataURL('image/png');
        }

        // Метод для создания нового favicon с наложением
        createFaviconWithOverlay(type = 'start') {
            const img = new Image();
            img.src = this.defaultFavicon;

            img.onload = () => {
                // Настроим размер canvas, равный размеру favicon
                this.canvas.width = img.width;
                this.canvas.height = img.height;

                // Нарисуем favicon на canvas
                this.ctx.drawImage(img, 0, 0);

                // Рассчитываем размер круга (50% от размера favicon)
                const circleRadius = img.width / 4; // 50% от ширины (диаметр = радиус * 2)

                let color = (type === 'start') ? this.colorStart : this.colorPause;

                // Наложим круг в правый верхний угол
                this.ctx.beginPath();
                this.ctx.arc(img.width - circleRadius, circleRadius, circleRadius, 0, 2 * Math.PI);
                this.ctx.fillStyle = color;  // Цвет накладываемого круга
                this.ctx.fill();

                // Преобразуем canvas в новый favicon
                const newFavicon = this.canvas.toDataURL('image/png');
                this.favicon.href = newFavicon;  // Обновляем favicon

                // Отображаем сгенерированный favicon в div
                const newFaviconImg = new Image();
                newFaviconImg.src = newFavicon;
            };
        }

        // Метод для активации наложения
        activate(type = 'start') {
            this.isActive = true;
            this.createFaviconWithOverlay(type);  // Создаем наложение
        }

        // Метод для деактивации наложения
        deactivate() {
            if (this.isActive) {
                this.isActive = false;
                this.favicon.href = this.defaultFavicon;  // Восстанавливаем исходный favicon
            }
        }

    }

    // Экспортируем класс FaviconOverlay в глобальную область
    global.FaviconOverlay = FaviconOverlay;

})(window);

const faviconoverlay = new FaviconOverlay({});

window.addEventListener('load', function () {
    setTimeout(() => {
        function checkActivate(timemanBlock) {
            if (timemanBlock.classList.contains('timeman-start') || timemanBlock.classList.contains('timeman-completed')) {
                faviconoverlay.deactivate();  // Деактивируем наложение
            } else if (timemanBlock.classList.contains('timeman-paused')) {
                faviconoverlay.activate('pause');  // Активируем наложение - режим пауза (timeman-block-active timeman-paused)
            } else {
                faviconoverlay.activate();  // Активируем наложение (timeman-block-active)
            }
        };

        const timemanBlock = document.querySelector('.timeman-block');

        if (timemanBlock) {
            // Первоначальная проверка наличия класса 'timeman-start' при загрузке страницы
            checkActivate(timemanBlock);

            // Создаем наблюдателя за изменениями в атрибутах элемента
            const observer = new MutationObserver(function (mutationsList) {
                mutationsList.forEach(function (mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        // Проверяем наличие класса 'timeman-start' у контейнера
                        checkActivate(timemanBlock);
                    }
                });
            });

            // Настроим наблюдателя на изменение атрибутов (классов)
            observer.observe(timemanBlock, {
                attributes: true,  // Отслеживаем изменения атрибутов
            });
        }
    }, 100);  // Сразу после загрузки страницы
});
