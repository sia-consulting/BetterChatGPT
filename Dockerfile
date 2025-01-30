FROM node:alpine AS builder

RUN addgroup -S appgroup && \
  adduser -S appuser -G appgroup && \
  mkdir -p /home/appuser/app && \
  chown appuser:appgroup /home/appuser/app
USER appuser

RUN yarn config set prefix ~/.yarn && \
  yarn global add serve

WORKDIR /home/appuser/app
COPY --chown=appuser:appgroup package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY --chown=appuser:appgroup . .
RUN yarn build


# Stage 2: Serve app with nginx
FROM nginx:latest
COPY --from=builder /home/appuser/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["/usr/sbin/nginx", "-g", "daemon off;"]