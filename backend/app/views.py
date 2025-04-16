from django.http import HttpResponse, JsonResponse
from django.shortcuts import render

# Create your views here.
def index(request):
    return HttpResponse("ok")

def test_api(request):
    return JsonResponse({"message": "hello world"})