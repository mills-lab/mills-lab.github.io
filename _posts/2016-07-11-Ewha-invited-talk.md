---
layout: media 
title: "Ewha Invited Talk"
share: false
external-url: 
image:
  teaser: ewha_t.png
  feature: banner-short-apb.png
ads: false
---
Ryan was invited to South Korea to give a seminar at <a href="http://www.ewha.ac.kr/mbs/ewhaen/">Ewha Womans University</a> over the labs work on structural variation. There he met with former colleagues and collaborators and got a chance to learn about the rich history and culture of the South Korean people.

<div>
{% for image in site.static_files %}
    {% if image.path contains 'images/2016-07-11-Ewha-talk' %}
        <img src="{{ site.baseurl }}{{ image.path }}" alt="image" />
    {% endif %}
{% endfor %}
</div>
