---
title: People
permalink: /people/
layout: archive 
image:
  feature: banner-short-apb.png
positions:
  pi: Principal Investigator
  postdoc: Post-doctoral Fellow
  phd: Doctoral Student
  ms: Masters Student
  staff: Staff
  bs: Undergraduate
  alumni: Alumni
  rotation: Rotation Student
---

{% assign sorted_people = (site.people | sort: 'start-date') %}
<p>
<b>Current Lab Members</b>
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

{% include people-grid-empty.html %} <!-- evens rows out, really need to clean this up -->

<p>
<b>Previous Lab Members</b>
<div class="tiles">
{% for position in page.positions %}
 {% for person in sorted_people %}
  {% if person.publish and position[0] == 'alumni' %}
        {% if person.path contains position[0] %}
                {% include people-grid.html %}
        {% endif %}
  {% endif %}
 {% endfor %}
{% endfor %}
</div><!-- /.tiles -->
