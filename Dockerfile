FROM python:3.6-alpine3.6
MAINTAINER maksim.sokolskiy@raccoongang.com
ENV PYTHONUNBUFFERED 1
RUN apk --update add postgresql-dev alpine-sdk libxslt-dev
RUN mkdir /kaiwa
WORKDIR /kaiwa
ADD requirements.txt /kaiwa/requirements.txt
RUN pip install -r requirements.txt
