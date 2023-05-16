# ==============================
FROM helsinkitest/python:3.9-slim as appbase
# ==============================
RUN mkdir /entrypoint

COPY --chown=appuser:appuser benefit/requirements.txt /app/requirements.txt
COPY --chown=appuser:appuser benefit/requirements-prod.txt /app/requirements-prod.txt
COPY --chown=appuser:appuser benefit/.prod/escape_json.c /app/.prod/escape_json.c
COPY --chown=appuser:appuser shared /shared/

RUN apt-install.sh \
        git \
        netcat \
        libpq-dev \
        build-essential \
        wkhtmltopdf \
        gettext \
    && pip install -U pip \
    && pip install --no-cache-dir -r /app/requirements.txt \
    && pip install --no-cache-dir  -r /app/requirements-prod.txt \
    && uwsgi --build-plugin /app/.prod/escape_json.c \
    && mv /app/escape_json_plugin.so /app/.prod/escape_json_plugin.so \
    && apt-cleanup.sh build-essential

COPY --chown=appuser:appuser benefit/docker-entrypoint.sh /entrypoint/docker-entrypoint.sh
ENTRYPOINT ["/entrypoint/docker-entrypoint.sh"]
COPY --chown=appuser:appuser benefit /app/

# ==============================
FROM appbase as development
# ==============================

COPY --chown=appuser:appuser benefit/requirements-dev.txt /app/requirements-dev.txt
RUN apt-install.sh \
        build-essential \
    && pip install --no-cache-dir -r /app/requirements-dev.txt \
    && apt-cleanup.sh build-essential

ENV DEV_SERVER=1


USER appuser

# Compile messages as a part of Docker image build so it doesn't have to be done during
# container startup. This removes the need for writeable localization directories.
RUN django-admin compilemessages

EXPOSE 8000/tcp

# ==============================
FROM appbase as production
# ==============================

RUN SECRET_KEY="only-used-for-collectstatic" python manage.py collectstatic

USER appuser

# Compile messages as a part of Docker image build so it doesn't have to be done during
# container startup. This removes the need for writeable localization directories.
RUN django-admin compilemessages

EXPOSE 8000/tcp
