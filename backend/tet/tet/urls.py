from django.conf import settings
from django.contrib import admin
from django.http import HttpResponse
from django.urls import include, path
from django.views.decorators.http import require_GET
from rest_framework import routers

from events.api.v1 import views as event_views
from tet.views import TetGDPRAPIView, TetLogoutView, UserInfoView

router = routers.DefaultRouter()
router.register(r"events", event_views.JobPostingsViewSet, basename="jobpostings")

urlpatterns = [
    path("v1/", include((router.urls, "v1"), namespace="v1")),
    path("v1/events/<pk>/publish/", event_views.PublishTetPostingView.as_view()),
    path("v1/events/<pk>/image/", event_views.DeletePostingImageView.as_view()),
    path("v1/images/", event_views.ImageView.as_view()),
    path("gdpr-api/v1/user/<uuid:uuid>", TetGDPRAPIView.as_view(), name="gdpr_v1"),
    path("userinfo/", UserInfoView.as_view(), name="userinfo"),
    path("logout/", TetLogoutView.as_view(), name="tet_logout"),
    path("oidc/", include("shared.oidc.urls")),
]

urlpatterns += [path("oauth2/", include("shared.azure_adfs.urls"))]

if settings.ENABLE_ADMIN:
    urlpatterns.append(path("admin/", admin.site.urls))


@require_GET
def healthz_handler(*args, **kwargs):
    return HttpResponse(status=200)


@require_GET
def readiness_handler(*args, **kwargs):
    return HttpResponse(status=200)


urlpatterns += [path("healthz", healthz_handler), path("readiness", readiness_handler)]
