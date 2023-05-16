import logging

from django.conf import settings
from django_extensions.management.jobs import QuarterHourlyJob

from shared.audit_log.tasks import send_audit_log_to_elastic_search

LOGGER = logging.getLogger(__name__)


class Job(QuarterHourlyJob):
    help = "Send AuditLogEntry to centralized log center every 15 minutes"

    def execute(self):
        if settings.ENABLE_SEND_AUDIT_LOG:
            LOGGER.info("Sending audit log entries to ElasticSearch...")
            sent_entries_count = send_audit_log_to_elastic_search()
            LOGGER.info(
                f"Sent {sent_entries_count} audit log entries to ElasticSearch."
            )
        else:
            LOGGER.info(
                "Setting ENABLE_SEND_AUDIT_LOG is False, "
                "skipping sending audit log entries."
            )
