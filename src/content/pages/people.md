---
title: People
permalink: /people/
image:
  feature: banner-short-apb.png
---

{% assign sorted_people = (site.people | sort: 'start-date') %}
<p>
<div class="tiles">
{% for position in page.positions %}
 {% for person in sorted_people %}
  {% if person.publish and position[0] != 'alumni' %}
  	{% if person.path contains position[0] %}
        	{% include people-grid.html %}
	{% endif %}
  {% endif %}
 {% endfor %}
{% endfor %}
</div><!-- /.tiles -->

<p>
<div class="tiles">
{% for position in page.positions %}
 {% for person in sorted_people reversed %}
  {% if person.publish and position[0] == 'alumni' %}
        {% if person.path contains position[0] %}
                {% include people-grid.html %}
        {% endif %}
  {% endif %}
 {% endfor %}
{% endfor %}
</div><!-- /.tiles -->
