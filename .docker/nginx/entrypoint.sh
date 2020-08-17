#!/bin/bash

cp /var/www/.docker/nginx/nginx.conf /etc/nginx/conf.d
nginx -g 'daemon off;'
