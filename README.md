Kaiwa - Conversational Task Project
---


Assessing and practicing skills through structured conversations with bots.



Installation and Usage
===

    docker-compose build
    docker-compose run kaiwa python manage.py migrate
    docker-compose run kaiwa python manage.py createsuperuser
    docker-compose up -d

    test on http://localhost:8000
