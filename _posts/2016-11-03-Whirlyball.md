---
layout: media 
title: "Whirly Ball with Boyle Lab"
share: false
external-url: 
image:
  teaser: whirly_t.png
  feature: banner-short-apb.png
ads: false
---
Our lab was recently challenged to <a href="http://www.whirlyballannarbor.com/">Whirly Ball</a> by the infamous <a href="http://boylelab.org/">"Team Boyle"</a>, and naturally we had to step up and represent ourselves accordingly. It was a grueling, hard fought match that after some ambiguity ended in a tie between the labs after 5 rounds. Expect a rematch in the near future!

<div>
{% for image in site.static_files %}
    {% if image.path contains 'images/2016-11-03-Whirlyball' %}
        <img src="{{ site.baseurl }}{{ image.path }}" alt="image" />
    {% endif %}
{% endfor %}
</div>
