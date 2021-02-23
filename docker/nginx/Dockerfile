FROM nginx:alpine

# fix timezone
ENV TIMEZONE Europe/Moscow
RUN ln -snf /usr/share/zoneinfo/$TIMEZONE /etc/localtime && echo $TIMEZONE > /etc/timezone

# clear default configs
RUN rm -f /etc/nginx/conf.d/*
