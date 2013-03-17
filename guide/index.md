---
layout: doc
title: Guide
---

(See also the [old guide](/guide.html))

{% for guide in site.pages %}
{% if guide.guide %}
{% assign content = guide.content %}
{% include guide.html %}
{% endif %}
{% endfor %}
