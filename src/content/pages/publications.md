---
title: Publications
permalink: /publications/
image:
  feature: banner-short-apb.png
---

{% assign sorted_pubs = (site.pubs | sort: 'pmid') %}
<p>
{% for pub in sorted_pubs reversed %}
	{% include pub-list.html %}
{% endfor %}


