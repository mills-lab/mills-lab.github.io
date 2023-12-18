---
layout: media 
title: "2023 Lab Holiday Party"
share: false
external-url: 
image:
  teaser: 2023_labHolidayParty_t.jpg
  feature: banner-short-apb.png
ads: false
---
We had our annual Lab Holiday Party this year at Ryan's house. We shared excellent food, silly white elephant gifts, and skill at playing nerdy games related to genetics (Genotype!).  
<div>
{% for image in site.static_files %}
    {% if image.path contains 'images/2023_labHolidayParty/' %}
        <img src="{{ site.baseurl }}{{ image.path }}" alt="image" />
    {% endif %}
{% endfor %}
</div>
