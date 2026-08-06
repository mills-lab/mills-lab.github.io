---
title: The Annual Summer Lab Cookout
date: '2021-07-10'
share: false
ads: false
image:
  teaser: 2021_labCookout_t.jpg
  feature: banner-short-apb.png
---
Our lab had a lot of fun at our annual cookout at Ryan's house. The food and drinks were so good! We enjoyed talking with each other in person after months of remote working.

<div>
{% for image in site.static_files %}
    {% if image.path contains 'images/2021-07-10-labCookout' %}
        <img src="{{ site.baseurl }}{{ image.path }}" alt="image" />
    {% endif %}
{% endfor %}
</div>
