---
layout: archive 
permalink: /
#title: "Home | The Mills Lab"
image:
  feature: banner-short-apb.png
---
<div class="body">
<p>The primary purpose of sequencing genomes is to identify the underlying genetic variation between individuals and to explore what role those changes have on human phenotypes. Our research laboratory develops and implements methods to precisely identify and resolve different types of genomic variation. Our goal is to integrate this information with other forms of biologically and medically relevant data to improve our overall understanding of human health and disease</p>
</div><!-- /.body-->

<h5><a href="/news/"><u>Recent News</u></a></h5>
<div class="tiles">
{% for post in site.posts limit:8 %}
	{% include post-grid-home.html %}
{% endfor %}
</div><!-- /.tiles -->
