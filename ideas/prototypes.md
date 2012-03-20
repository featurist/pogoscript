This is an attempt to design a way of working with objects in OceanScript that takes advantage of JavaScript's prototypal inheritance model.

## Object Operators

I'm going to introduce three operators. In the examples, `:member` is the same as `this.member` in JS, or `@member` in Coffee. Indented blocks are the same as enclosing them in braces `{}`.

1. `object {members}`

		tim = object
			:name = "Tim"
			:address = "London"

	This returns a new object containing the members in the block.

2. `object extending @prototype {members}`

		josh = object extending @tim
			:name = "Josh"

	This returns a new object containing the members in the block, but the object inherits from the prototype.

3. `constructor {members}`

	`constructor` is intended to be used inside another object:

		person = object
			:say hi =
				console:log "hi, my name is @(:name)"

			:create with name ?name = constructor
				:name = name

	It returns a new object with the members in the block, but the object inherits from `this`. In the example, the new object inherits from the outer object `person`.

## Use cases

1. Creating objects

		create person with name ?name =
			object
				:name = name

				:say hi =
					console: log "hi! my name is @(:name)"

		josh = create person with name "Josh"

		josh: say hi!

	A function acts as the constructor. We don't use the `new` operator because that assumes the constructor behaves the way `new` expects it to: assigns values to `this` and returns nothing. This won't do for more abstract ways of creating objects. `new` is not mockable.

2. Sharing behaviour between common objects using a prototype

		normal person =
			object
				:say hi =
					console: log "hi! my name is @(:name)"

		create person with name ?name, email address =
			object extends (normal person)
				:name = name
				:email address = email address

	Common objects share the behaviour of their prototype. This is quite straightfoward inheritance, but has the disadvantage of only allowing inheritance from one other object. It does however, have the advantage of allowing a large number of objects to get new behaviour by adding methods to their prototype:

		josh = create person with name "Josh"

		normal person: receive email =
			mail server: send email to (:email address),
				subject "hi",
				body "hi, how are you?"

		josh: receive email

3. Sharing behaviour between common objects using mixins

		twitter user with name ?name =
			:twitter name = name

			:follow twitter user ?name =
				// stuff to follow @name

		normal person, twitter name =
			object
				...

				object is (twitter user with name (twitter name))

	The `object is` operator imports the mixin. This is just a nice way of saying this in javascript:

		twitterUserWithName.call(this, twitterName);\

4. Extending objects

	There may be a reason to extend an object with behaviour in a particular context. When talking about people, they behave differently if they're friends than if they're strangers. When you become friends with somebody, you can think of them being "extended" with "friendly behaviour" even though they're the same person and behave the same as normal people in most other respects.

		create friend from person ?person =
			object extends @person
				:ask a favour ?favour =
					console: log "yeah, sure I'll @favour"
	
		josh as a friend = create friend from person @josh
	
		josh as a friend: ask a favour "help paint the livingroom"

		josh as a friend: say hi!
