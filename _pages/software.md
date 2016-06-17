---
title: Software
layout: archive
permalink: /software/ 
image:
  feature: banner-short-apb.png
---
{% assign sorted_software = (site.software | sort: 'date') %}
<p>
{% for code in sorted_software reversed %}
        {% include software-list.html %}
{% endfor %}

