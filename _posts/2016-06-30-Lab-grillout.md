---
layout: media 
title: "Lab Grill-out"
share: false
external-url: 
image:
  teaser: grill_t.png
  feature: banner-short-apb.png
ads: false
---
The lab got together for a grillout at Ryan's house. We broke in his new Big Green egg and had quite the smorgasbord of food and desserts, followed by some party games!

<div>
{% for image in site.static_files %}
    {% if image.path contains 'images/2016-06-30-Lab-grillout' %}
        <img src="{{ site.baseurl }}{{ image.path }}" alt="image" />
    {% endif %}
{% endfor %}
</div>
