---
layout: media 
title: "Gargi Farewell"
share: false
external-url: 
image:
  teaser: gargi_t.png
  feature: banner-short-apb.png
ads: false
---
It was a sad day for the Mills Lab as we said our farewells to the lab's first alumnus, Gargi Dayama. Gargi will be continuing her postdoctoral training in the lab of Dr. Ran Blekhman (<a href="http://blekhmanlab.org/">http://blekhmanlab.org/</a>) at the University of Minnesota, and we wish her the best of luck with her future endeavors! 

<div>
{% for image in site.static_files %}
    {% if image.path contains 'images/2016-07-20-Gargi-farewell' %}
        <img src="{{ site.baseurl }}{{ image.path }}" alt="image" />
    {% endif %}
{% endfor %}
</div>
