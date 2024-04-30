from django.shortcuts import render
from django.http import JsonResponse
from agora_token_builder import RtcTokenBuilder
import random
import time


def get_token(request):
    appId = 'e58ba9c06aee42f8a4a595cca8389e80'
    appCertificate = 'b0c49009693d465da10cfee998906d50'
    channelName = request.GET.get('channel')
    uid = random.randint(1, 230)
    expirationTimeInSeconds = 3600 * 24
    currentTimeStamp = time.time()
    privilegeEpiredTs = currentTimeStamp + expirationTimeInSeconds
    role = 1

    token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeEpiredTs)
    return JsonResponse({'token': token, 'uid': uid}, safe=False)

def lobby(request):
    return render(request, template_name='base/lobby.html')

def room(request):
    return render(request, template_name='base/room.html')