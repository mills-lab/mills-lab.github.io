---
layout: article 
title: "DCM&B Annual Picnic"
share: false
external-url: 
image:
  teaser: picnic_t.png
  feature: banner-short-apb.png
---
Our lab attended the annual DCM&B annual picnic and had a lot of fun! 

{% for image in site.static_files %}
    {% if image.path contains 'images/2016-06-27-DCMB-picnic' %}
        <img src="{{ site.baseurl }}{{ image.path }}" alt="image" />
    {% endif %}
{% endfor %}
