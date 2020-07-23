# landing_scratch
Scratch with configured gulp + webpack + twig + spritesmith.

## How to start

1. клонировать репозиторий или распаковать архив в папку проекта.
1. удалить папку .git, чтобы затем сделать `git init` для создания нового проекта
1. `npm start`: запустится сервер и watcher'ы - можно приступать к верстке.

## Где какие файлы распологать
```
/src/
    fonts/ - шрифты
    images/ - изображения
        icons/ - иконки. Все .png отсюда могут быть собраны в спрайт
    js/
        parts/
        templates/ - twig шаблоны используемые в js.
    style/ - css & scss файлы
    templates/ - шаблоны твиг 

    index.twig - в корне /src лежат шаблоны твиг - по одному на каждую отдельную страницу.
```

## подключение ресурсов в основных шаблонах твиг

```html 
<img src="{{ path('@images/moto.jpeg') }}" alt="some">
<script src="{{ path('@asset/js/main.js') }}"></script>
```
@images смотрит в директорию /dist/images или url /images
@asset cмотрит в директорию /dist. 
