---
layout: doc
title: Guide
---

# How do I?

Ok, so you want to know what this pogoscript thing is all about… It's a programming langauge, you probably knew that already. It compiles to JavaScript too, you probably also knew that. Because it compiles to JavaScript it's like JavaScript. Most, if not all of the language's behaviour is identical to JavaScript, pogoscript is merely a new syntax for JavaScript, plus a few interesting things which we'll get to.

{% for guide in site.pages %}
{% if guide.guide %}
{% assign content = guide.content %}
{% include guide.html %}
{% endif %}
{% endfor %}
