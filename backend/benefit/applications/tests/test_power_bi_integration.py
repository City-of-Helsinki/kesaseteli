import csv
from io import StringIO

from django.urls import reverse

from applications.enums import ApplicationBatchStatus


def test_get_power_bi_data(power_bi_client, decided_application_with_decision_date):
    batch = decided_application_with_decision_date.batch
    url = (
        reverse("powerbi_integration_url")
        + f"?decision_date_after={batch.decision_date}"
        + f"&decision_date_before={batch.decision_date}"
    )

    response = power_bi_client.get(url)
    assert response["Content-Type"] == "text/csv"

    content = "".join([chunk.decode("utf-8") for chunk in response.streaming_content])

    # Parse CSV content
    csv_reader = csv.reader(StringIO(content), delimiter=";")
    rows = list(csv_reader)

    # Assert CSV has a header and at least one data row
    assert len(rows) > 1
    header = rows[0]
    assert "Hakemusnumero" in header
    assert "Talpaan viennin päivä" in header

    assert rows[1][header.index("Hakemusnumero")] == str(
        decided_application_with_decision_date.application_number
    )

    assert (
        decided_application_with_decision_date.batch.status
        == ApplicationBatchStatus.COMPLETED
    )

    assert rows[1][header.index("Talpaan viennin päivä")] == str(
        decided_application_with_decision_date.batch.modified_at.strftime("%d.%m.%Y")
    )
