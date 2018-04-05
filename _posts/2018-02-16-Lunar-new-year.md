---
layout: media 
title: "Lunar New Year"
share: false
external-url: 
image:
  teaser: new_year_2018_t.jpg
  feature: banner-short-apb.png
ads: false
---
The Mills Lab celebrated the new lunar year with festive decorations, and... apologies to your vegan and vegetarian colleages, meat. Delicious. Tasty. Meat. And a monstrous tower of brownies and ice cream. How's that low-carb diet going, boss?

<div>
{% for image in site.static_files %}
    {% if image.path contains 'images/2018-02-16-Lunar-new-year' %}
        <img src="{{ site.baseurl }}{{ image.path }}" alt="image" />
    {% endif %}
{% endfor %}
</div>
